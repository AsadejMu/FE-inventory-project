# TechStock Frontend

React + Vite + Tailwind + React Router + Fetch API

## เริ่มใช้งาน
    npm install
    npm run dev      # เปิดเว็บ (ใช้ Mock Backend ใน localStorage)
    npm test         # รัน Unit Test

บัญชีทดลอง: admin@techstock.com / admin123 , member@techstock.com / member123

## ต่อกับ Go จริง
คัดลอก `.env.example` เป็น `.env` แล้วใส่ `VITE_API_URL=http://localhost:8080`
ไม่ต้องแก้โค้ดหน้าเว็บ เพราะทุกหน้าเรียกผ่าน `src/api/backend.js`

หมายเหตุ: ปรับ response ของ Go ให้เป็น { message, data } ตาม API Contract
และ Go ต้องตั้ง CORS ให้ FE เรียกได้
