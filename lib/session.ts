import "server-only";
import { cookies } from "next/headers";
import { REMEMBER_TTL_SECONDS, SESSION_COOKIE, SHORT_TTL_SECONDS, signSession, verifySession } from "./session-token";
import { findUserById } from "./db";

// remember = true: cookie survives closing the browser (30 days).
// remember = false: cookie is dropped when the browser closes.
export async function startSession(userId: number, remember: boolean) {
  const token = await signSession(userId, remember ? REMEMBER_TTL_SECONDS : SHORT_TTL_SECONDS);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(remember ? { maxAge: REMEMBER_TTL_SECONDS } : {}),
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
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.created_at,
    lastLoginAt: user.last_login_at,
    loginCount: user.login_count,
  };
}
