"use client";

import { useActionState } from "react";
import { register, type FormState } from "../actions";
import { Field } from "../field";

export default function RegisterForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(register, {});
  const fe = state.fieldErrors ?? {};
  return (
    <form action={action} noValidate>
      {state.error && <div className="alert alert-error" role="alert">{state.error}</div>}
      <Field name="name" label="ชื่อ-นามสกุล" autoComplete="name" defaultValue={state.values?.name} error={fe.name} />
      <Field name="email" label="อีเมล" type="email" autoComplete="email" defaultValue={state.values?.email} error={fe.email} />
      <Field
        name="password"
        label="รหัสผ่าน"
        type="password"
        autoComplete="new-password"
        error={fe.password}
        hint="อย่างน้อย 8 ตัว มีทั้งตัวอักษรและตัวเลข"
      />
      <Field name="confirm" label="ยืนยันรหัสผ่าน" type="password" autoComplete="new-password" error={fe.confirm} />
      <button className="btn" type="submit" disabled={pending}>
        {pending ? "กำลังสมัคร..." : "สมัครสมาชิก"}
      </button>
    </form>
  );
}
