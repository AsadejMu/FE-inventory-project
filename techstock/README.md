# TechStock Frontend (Create React App + Tailwind v3 + React Router)

## เริ่มใช้งาน
    npm install
    npm start        # เปิด http://localhost:3000 (ใช้ Mock Backend ใน localStorage ถ้าไม่ตั้ง REACT_APP_API_URL)
    CI=true npm test # รัน Unit Test หนึ่งรอบ (หรือ npm test แบบ watch)
    CI=true npm run build   # ลอง build แบบเดียวกับ Vercel (warning ของ ESLint ถือเป็น error)

บัญชีทดลอง (ตอนใช้ mock): admin@techstock.com / admin123 , member@techstock.com / member123

## ต่อกับ Go จริง
คัดลอก `.env.example` เป็น `.env` แล้วใส่ `REACT_APP_API_URL=http://localhost:8080` (ไม่มี / ท้าย)
**หยุดแล้วรัน `npm start` ใหม่** เพราะ CRA อ่าน .env ตอนเริ่มรันครั้งเดียว
บน Vercel ตั้ง Environment Variable ชื่อเดียวกัน แล้ว Redeploy (ค่าถูกฝังตอน build)

## ข้อควรรู้
- BE ต้องอนุญาต origin ของเว็บนี้ใน `ALLOWED_ORIGINS` (`http://localhost:3000`, ลิงก์ Codespaces `...-3000.app.github.dev`, ลิงก์ Vercel)
- Tailwind ต้องเป็น v3 (CRA 5 ใช้ v3 ไม่ได้กับ v4) สีหลักและฟอนต์อยู่ใน `tailwind.config.js`
