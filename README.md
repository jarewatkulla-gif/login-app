# เว็บแอปสมัครสมาชิก / เข้าสู่ระบบ

Next.js 15 (App Router) + TypeScript

- สมัครสมาชิก: ชื่อ, อีเมล, รหัสผ่าน (ตรวจรูปแบบด้วย zod, ข้อความภาษาไทย)
- รหัสผ่านเข้ารหัสด้วย bcrypt (cost 12) ไม่เก็บรหัสผ่านจริง
- Session เป็น JWT ลงชื่อด้วย `SESSION_SECRET` เก็บในคุกกี้ httpOnly / SameSite=Lax (อายุ 7 วัน)
- จำกัดการพยายามเข้าสู่ระบบผิด 5 ครั้ง / 15 นาที
- หน้า `/dashboard` เข้าได้เฉพาะสมาชิกที่เข้าสู่ระบบแล้ว
- ฐานข้อมูล SQLite (`data/app.db`) ใช้ `node:sqlite` ในตัว Node 22 ไม่ต้องติดตั้งเพิ่ม

## วิธีรัน

```bash
npm install
cp .env.example .env.local   # แล้วใส่ SESSION_SECRET (openssl rand -base64 32)
npm run dev                  # http://localhost:3000
```

Production: `npm run build && npm start` (ต้องตั้ง `SESSION_SECRET`)

## หมายเหตุเรื่อง deploy

SQLite เก็บไฟล์บนดิสก์ จึงเหมาะกับเซิร์ฟเวอร์ปกติ / VPS / Docker
ถ้าจะ deploy ขึ้น Vercel (serverless) ต้องเปลี่ยน `lib/db.ts` ไปใช้ฐานข้อมูลภายนอก เช่น Postgres (Neon / Supabase)
