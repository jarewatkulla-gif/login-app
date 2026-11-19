"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { createUser, findUserByEmail, recordLogin } from "@/lib/db";
import { endSession, startSession } from "@/lib/session";
import { resetAttempts, tooManyAttempts } from "@/lib/rate-limit";

export type FormState = {
  error?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "password" | "confirm", string>>;
  values?: { name?: string; email?: string };
};

// Used to keep login timing the same whether or not the email exists.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร").max(100, "ชื่อยาวเกินไป"),
    email: z.string().trim().toLowerCase().email("รูปแบบอีเมลไม่ถูกต้อง").max(254),
    password: z
      .string()
      .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
      .max(72, "รหัสผ่านยาวเกินไป (สูงสุด 72 ตัวอักษร)")
      .regex(/[A-Za-z]/, "รหัสผ่านต้องมีตัวอักษรภาษาอังกฤษอย่างน้อย 1 ตัว")
      .regex(/[0-9]/, "รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "รหัสผ่านทั้งสองช่องไม่ตรงกัน",
  });

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "local";
}

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const values = { name: raw.name ?? "", email: raw.email ?? "" };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: FormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0] as keyof NonNullable<FormState["fieldErrors"]>;
      fieldErrors[k] ??= issue.message;
    }
    return { fieldErrors, values };
  }

  if (tooManyAttempts(`register:${await clientIp()}`, 10, 60 * 60 * 1000)) {
    return { error: "มีการสมัครจากเครือข่ายนี้บ่อยเกินไป กรุณาลองใหม่ภายหลัง", values };
  }

  const { name, email, password } = parsed.data;
  if (findUserByEmail(email)) {
    return { fieldErrors: { email: "อีเมลนี้ถูกใช้สมัครแล้ว" }, values };
  }

  const hash = await bcrypt.hash(password, 12);
  let id: number;
  try {
    id = createUser(name, email, hash);
  } catch {
    // Unique constraint race: someone registered the same email at the same moment.
    return { fieldErrors: { email: "อีเมลนี้ถูกใช้สมัครแล้ว" }, values };
  }

  recordLogin(id);
  await startSession(id, true);
  redirect("/slideshow");
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, "กรุณากรอกอีเมล"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน").max(200),
});

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const values = { email: raw.email ?? "" };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: FormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0] as keyof NonNullable<FormState["fieldErrors"]>;
      fieldErrors[k] ??= issue.message;
    }
    return { fieldErrors, values };
  }

  const { email, password } = parsed.data;
  const limitKey = `login:${await clientIp()}:${email}`;
  if (tooManyAttempts(limitKey)) {
    return { error: "พยายามเข้าสู่ระบบผิดหลายครั้งเกินไป กรุณารอ 15 นาทีแล้วลองใหม่", values };
  }

  const user = findUserByEmail(email);
  const ok = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);
  if (!user || !ok) {
    return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง", values };
  }

  resetAttempts(limitKey);
  recordLogin(user.id);
  await startSession(user.id, formData.get("remember") === "on");
  redirect("/slideshow");
}

export async function logout() {
  await endSession();
  redirect("/login?loggedOut=1");
}
