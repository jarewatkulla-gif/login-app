import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSession, verifySession } from "./session-token";
import { findUserById } from "./db";

export async function startSession(userId: number) {
  const token = await signSession(userId);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function currentUser() {
  const id = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!id) return null;
  const user = findUserById(id);
  if (!user) return null;
  return { id: user.id, name: user.name, email: user.email, createdAt: user.created_at };
}
