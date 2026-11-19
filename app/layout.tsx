import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const font = Noto_Sans_Thai({ subsets: ["thai", "latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "สมัครสมาชิก",
  description: "สมัครสมาชิกและเข้าสู่ระบบ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className={font.className}>{children}</body>
    </html>
  );
}
