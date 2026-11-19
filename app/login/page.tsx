import Link from "next/link";
import LoginForm from "./form";

export const metadata = { title: "เข้าสู่ระบบ" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ loggedOut?: string }> }) {
  const { loggedOut } = await searchParams;
  return (
    <main className="page">
      <div className="card">
        <div className="brand">M</div>
        <h1>เข้าสู่ระบบ</h1>
        <p className="sub">ยินดีต้อนรับกลับมา</p>
        {loggedOut && <div className="alert alert-success">ออกจากระบบเรียบร้อยแล้ว</div>}
        <LoginForm />
        <p className="foot">ยังไม่มีบัญชี? <Link href="/register">สมัครสมาชิก</Link></p>
      </div>
    </main>
  );
}
