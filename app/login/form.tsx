"use client";

import { useActionState } from "react";
import { login, type FormState } from "../actions";
import { Field } from "../field";

export default function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, {});
  const fe = state.fieldErrors ?? {};
  return (
    <form action={action} noValidate>
      {state.error && <div className="alert alert-error" role="alert">{state.error}</div>}
      <Field name="email" label="อีเมล" type="email" autoComplete="email" defaultValue={state.values?.email} error={fe.email} />
      <Field name="password" label="รหัสผ่าน" type="password" autoComplete="current-password" error={fe.password} />
      <label className="check">
        <input type="checkbox" name="remember" defaultChecked />
        <span>จดจำฉันไว้ (ไม่ต้อง login ใหม่ 30 วัน)</span>
      </label>
      <button className="btn" type="submit" disabled={pending}>
        {pending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </button>
    </form>
  );
}
