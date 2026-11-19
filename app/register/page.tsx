import Link from "next/link";
import RegisterForm from "./form";

export const metadata = { title: "สมัครสมาชิก" };

export default function RegisterPage() {
  return (
    <main className="page">
      <div className="card">
        <div className="brand">M</div>
        <h1>สมัครสมาชิก</h1>
        <p className="sub">กรอกข้อมูลด้านล่างเพื่อสร้างบัญชีใหม่</p>
        <RegisterForm />
        <p className="foot">มีบัญชีอยู่แล้ว? <Link href="/login">เข้าสู่ระบบ</Link></p>
      </div>
    </main>
  );
}
