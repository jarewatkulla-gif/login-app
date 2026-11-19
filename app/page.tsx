import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/session";

export default async function Home() {
  if (await currentUser()) redirect("/dashboard");
  return (
    <main className="page">
      <div className="card">
        <div className="brand">M</div>
        <h1>ยินดีต้อนรับ</h1>
        <p className="sub">สมัครสมาชิกฟรี เพื่อเข้าถึงพื้นที่สำหรับสมาชิก</p>
        <div className="actions">
          <Link className="btn" href="/register">สมัครสมาชิกใหม่</Link>
          <Link className="btn btn-ghost" href="/login">เข้าสู่ระบบ</Link>
        </div>
      </div>
    </main>
  );
}
