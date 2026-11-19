import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";

// The slideshow page lives outside /public so only logged-in members can load it.
const FILE = path.join(process.cwd(), "private", "index.html");

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export async function GET(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  const html = await fs.readFile(FILE, "utf8");

  // JSON.stringify + escaping "<" keeps the name safe inside a <script> tag.
  const nameJson = JSON.stringify(user.name).replace(/</g, "\\u003c");
  const head = `<script>window.__LOGIN_USER=${nameJson};</script>`;
  const bar = `
<div id="memberBar" style="position:fixed;right:12px;bottom:12px;z-index:9999;display:flex;gap:8px;align-items:center;
  background:var(--panel,#fff);color:var(--ink,#1b2430);border:1px solid var(--line,#d5dae1);border-radius:999px;
  padding:6px 6px 6px 14px;font-size:13px;box-shadow:0 4px 16px rgba(0,0,0,.12)">
  <span>👤 ${escapeHtml(user.name)}</span>
  <a href="/dashboard" style="color:inherit;padding:4px 8px">บัญชี</a>
  <form method="post" action="/api/logout" style="margin:0">
    <button type="submit" style="border-radius:999px;padding:4px 12px;cursor:pointer">ออกจากระบบ</button>
  </form>
</div>`;

  const out = html.replace("<head>", `<head>\n${head}`).replace("</body>", `${bar}\n</body>`);
  return new NextResponse(out, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}
