import { redirect } from "next/navigation";
import { currentUser } from "@/lib/session";
import { countUsers } from "@/lib/db";
import { logout } from "../actions";

export const metadata = { title: "พื้นที่สมาชิก" };

function thaiDate(sqliteUtc: string) {
  return new Date(sqliteUtc.replace(" ", "T") + "Z").toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Bangkok",
  });
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const user = await currentUser();
  if (!user) redirect("/login");
  const { welcome } = await searchParams;

  return (
    <main className="page">
      <div className="card">
        <div className="brand">{user.name.trim().charAt(0).toUpperCase()}</div>
        {welcome && <div className="alert alert-success">สมัครสมาชิกสำเร็จ ยินดีต้อนรับ!</div>}
        <h1>สวัสดี, {user.name}</h1>
        <p className="sub">คุณเข้าสู่ระบบแล้ว</p>
        <div className="profile">
          <div className="row"><span>อีเมล</span><span>{user.email}</span></div>
          <div className="row"><span>สมาชิกตั้งแต่</span><span>{thaiDate(user.createdAt)}</span></div>
          <div className="row"><span>สมาชิกทั้งหมด</span><span>{countUsers().toLocaleString("th-TH")} คน</span></div>
        </div>
        <form action={logout}>
          <button className="btn btn-ghost" type="submit" style={{ width: "100%" }}>ออกจากระบบ</button>
        </form>
      </div>
    </main>
  );
}
