// Backend จำลอง (เก็บใน localStorage) ตอบตาม API Contract เดียวกับ Go
// ใช้เฉพาะตอนยังไม่ได้ตั้ง REACT_APP_API_URL
const KEY = "techstock_db";

const seed = {
  nextId: 100,
  users: [
    { id: 1, name: "Admin", email: "admin@techstock.com", password: "admin123", role: "admin" },
    { id: 2, name: "สมชาย ใจดี", email: "member@techstock.com", password: "member123", role: "member" },
  ],
  categories: [
    { id: 1, name: "CPU", serial_seq: 1 }, { id: 2, name: "GPU", serial_seq: 1 }, { id: 3, name: "RAM", serial_seq: 1 }, { id: 4, name: "Storage", serial_seq: 1 },
  ],
  products: [
    { id: 1, name: "Intel Core i5-14400F", category_id: 1, description: "10 Cores 16 Threads", serial_number: "CPU-0001", price: 7290, stock: 8, image_url: "" },
    { id: 2, name: "NVIDIA RTX 4060", category_id: 2, description: "NVIDIA Graphics Card 8GB", serial_number: "GPU-0001", price: 10900, stock: 5, image_url: "" },
    { id: 3, name: "Kingston Fury DDR5 16GB", category_id: 3, description: "DDR5 5600MHz", serial_number: "RAM-0001", price: 1590, stock: 12, image_url: "" },
    { id: 4, name: "Samsung 990 EVO 1TB", category_id: 4, description: "NVMe SSD", serial_number: "STORAGE-0001", price: 2890, stock: 2, image_url: "" },
  ],
  withdrawals: [],
  movements: [],
};

const load = () => JSON.parse(localStorage.getItem(KEY) || "null") || JSON.parse(JSON.stringify(seed));
const save = (db) => localStorage.setItem(KEY, JSON.stringify(db));
const fail = (status, message, errors) => { throw Object.assign(new Error(message), { status, errors }); };
const delay = () => new Promise((r) => setTimeout(r, 250));

// ออก Serial ตัวถัดไปของหมวดหมู่ รูปแบบ ประเภท-เลขรัน (ข้ามเลขที่ถูกใช้ไปแล้ว)
function mintSerial(db, cat) {
  const prefix = cat.name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) || "ITEM";
  const used = new Set([
    ...db.products.map((p) => (p.serial_number || "").toLowerCase()),
    ...db.withdrawals.flatMap((w) => w.items.flatMap((i) => (i.serials || []).map((x) => x.toLowerCase()))),
  ]);
  let sn;
  do {
    cat.serial_seq = (cat.serial_seq || 0) + 1;
    sn = `${prefix}-${String(cat.serial_seq).padStart(4, "0")}`;
  } while (used.has(sn.toLowerCase()));
  return sn;
}

export async function mockServer(method, path, body, token) {
  await delay();
  const db = load();
  const [pathname, query] = path.split("?");
  const params = new URLSearchParams(query || "");
  const seg = pathname.replace(/^\/api\//, "").split("/");
  const me = db.users.find((u) => "mock-" + u.id === token);
  const need = (role) => {
    if (!me) fail(401, "กรุณาเข้าสู่ระบบ");
    if (role && me.role !== role) fail(403, "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้");
  };
  const catName = (id) => db.categories.find((c) => c.id === id)?.name || "";
  const withCat = (p) => ({ ...p, category_name: catName(p.category_id) });
  const publicUser = ({ password, ...u }) => u;
  const out = (data, message, status = 200) => ({ status, data, message });

  // ---- auth ----
  if (seg[0] === "auth") {
    if (seg[1] === "login") {
      const u = db.users.find((x) => x.email === body.email && x.password === body.password);
      if (!u) fail(401, "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      return out({ token: "mock-" + u.id, user: publicUser(u) }, "เข้าสู่ระบบสำเร็จ");
    }
    if (seg[1] === "register") {
      if (db.users.some((x) => x.email === body.email)) fail(409, "อีเมลนี้ถูกใช้แล้ว");
      const u = { id: db.nextId++, name: body.name, email: body.email, password: body.password, role: "member" };
      db.users.push(u); save(db);
      return out(publicUser(u), "สมัครสมาชิกสำเร็จ", 201);
    }
    if (seg[1] === "me") { need(); return out(publicUser(me)); }
  }

  // ---- categories ----
  if (seg[0] === "categories") return out(db.categories);

  // ---- products ----
  if (seg[0] === "products") {
    const id = Number(seg[1]);
    if (method === "GET" && !seg[1]) {
      const s = (params.get("search") || "").toLowerCase();
      const c = params.get("category_id");
      return out(db.products.filter((p) => (p.name.toLowerCase().includes(s) || (p.serial_number || "").toLowerCase().includes(s)) && (!c || p.category_id === Number(c))).map(withCat));
    }
    if (method === "GET") {
      const p = db.products.find((x) => x.id === id);
      if (!p) fail(404, "ไม่พบสินค้า");
      return out(withCat(p));
    }
    need("admin");
    if (method === "DELETE") {
      if (db.movements.some((m) => m.product_id === id)) fail(409, "สินค้านี้มีประวัติการเคลื่อนไหว ลบไม่ได้");
      db.products = db.products.filter((x) => x.id !== id); save(db);
      return out(null, "ลบสินค้าสำเร็จ");
    }
    const errors = {};
    if (!body.name?.trim()) errors.name = "กรุณากรอกชื่อสินค้า";
    if (!(Number(body.price) > 0)) errors.price = "ราคาต้องมากกว่า 0";
    if (Object.keys(errors).length) fail(400, "ข้อมูลไม่ถูกต้อง", errors);
    let sn = (body.serial_number || "").trim();
    if (sn.length > 64) fail(400, "ข้อมูลไม่ถูกต้อง", { serial_number: "Serial Number ยาวเกิน 64 ตัวอักษร" });
    if (method === "POST" && !sn) { // ไม่กรอก = สร้างให้ รูปแบบ ประเภท-เลขรัน
      const cat = db.categories.find((c) => c.id === Number(body.category_id));
      if (cat) sn = mintSerial(db, cat);
    }
    if (sn && db.products.some((p) => p.id !== id && (p.serial_number || "").toLowerCase() === sn.toLowerCase()))
      fail(409, "Serial Number นี้มีอยู่แล้ว", { serial_number: "Serial Number นี้มีอยู่แล้ว" });
    const fields = { serial_number: sn, name: body.name, category_id: Number(body.category_id), description: body.description || "", price: Number(body.price), image_url: body.image_url || "" };
    if (method === "POST") {
      const p = { id: db.nextId++, ...fields, stock: Number(body.stock) || 0 };
      db.products.push(p); save(db);
      return out(withCat(p), "เพิ่มสินค้าสำเร็จ", 201);
    }
    if (method === "PUT") { // ไม่แก้ stock ตาม contract
      const p = db.products.find((x) => x.id === id);
      if (!p) fail(404, "ไม่พบสินค้า");
      Object.assign(p, { ...fields, serial_number: sn || p.serial_number }); save(db);
      return out(withCat(p), "แก้ไขสินค้าสำเร็จ");
    }
  }

  // ---- stock ----
  if (seg[0] === "stock" && seg[1] === "in") {
    need("admin");
    const p = db.products.find((x) => x.id === Number(body.product_id));
    if (!p) fail(404, "ไม่พบสินค้า");
    if (!(Number(body.quantity) > 0)) fail(400, "จำนวนต้องมากกว่า 0");
    const previous_stock = p.stock;
    p.stock += Number(body.quantity);
    db.movements.push({ id: db.nextId++, product_id: p.id, type: "in", quantity: Number(body.quantity), note: body.note || "", created_at: new Date().toISOString() });
    save(db);
    return out({ product_id: p.id, quantity: Number(body.quantity), previous_stock, current_stock: p.stock }, "รับสินค้าเข้าคลังสำเร็จ", 201);
  }

  // ---- withdrawals ----
  if (seg[0] === "withdrawals") {
    const show = (w) => ({
      ...w,
      user_name: db.users.find((u) => u.id === w.user_id)?.name,
      decided_by_name: db.users.find((u) => u.id === w.decided_by)?.name,
      items: w.items.map((i) => ({ ...i, product_name: db.products.find((p) => p.id === i.product_id)?.name })),
    });
    if (method === "POST" && !seg[1]) {
      need("member");
      if (!body.items?.length) fail(400, "กรุณาเลือกสินค้าอย่างน้อย 1 รายการ");
      const w = { id: db.nextId++, user_id: me.id, status: "pending", note: body.note || "", items: body.items, created_at: new Date().toISOString() };
      db.withdrawals.push(w); save(db);
      return out(show(w), "ส่งคำขอเบิกสำเร็จ", 201);
    }
    if (method === "GET") {
      need();
      const list = db.withdrawals.filter((w) => me.role === "admin" || w.user_id === me.id);
      return out(list.map(show).reverse());
    }
    if (method === "PUT") {
      need("admin");
      const w = db.withdrawals.find((x) => x.id === Number(seg[1]));
      if (!w) fail(404, "ไม่พบคำขอ");
      if (w.status !== "pending") fail(409, "คำขอนี้ถูกดำเนินการแล้ว");
      if (seg[2] === "approve") {
        for (const i of w.items) {
          const p = db.products.find((x) => x.id === i.product_id);
          if (!p || p.stock < i.quantity) fail(409, `สินค้าไม่พอ: ${p?.name ?? i.product_id}`);
        }
        w.items.forEach((i) => {
          const prod = db.products.find((x) => x.id === i.product_id);
          prod.stock -= i.quantity;
          const cat = db.categories.find((c) => c.id === prod.category_id);
          i.serials = Array.from({ length: i.quantity }, () => mintSerial(db, cat)); // ได้ Serial ตอนอนุมัติ
          db.movements.push({ id: db.nextId++, product_id: i.product_id, type: "out", quantity: i.quantity, note: `เบิก #${w.id}`, created_at: new Date().toISOString() });
        });
        w.status = "approved"; w.decided_by = me.id; w.decided_at = new Date().toISOString(); save(db);
        return out({ id: w.id, status: w.status }, "อนุมัติคำขอเบิกสำเร็จ");
      }
      if (seg[2] === "reject") { w.status = "rejected"; w.decided_by = me.id; w.decided_at = new Date().toISOString(); save(db); return out({ id: w.id, status: w.status }, "ปฏิเสธคำขอเบิกแล้ว"); }
    }
  }

  // ---- members (admin) ----
  if (seg[0] === "members") {
    need("admin");
    if (method === "GET" && !seg[1]) {
      return out(db.users.map((u) => ({
        ...publicUser(u),
        request_count: db.withdrawals.filter((w) => w.user_id === u.id).length,
      })));
    }
    const id = Number(seg[1]);
    const target = db.users.find((u) => u.id === id);
    if (!target) fail(404, "ไม่พบสมาชิก");
    if (method === "DELETE") {
      if (id === me.id) fail(409, "ไม่สามารถลบบัญชีของตัวเองได้");
      if (db.withdrawals.some((w) => w.user_id === id)) fail(409, "สมาชิกนี้มีประวัติคำขอเบิก ลบไม่ได้");
      db.users = db.users.filter((u) => u.id !== id); save(db);
      return out(null, "ลบสมาชิกสำเร็จ");
    }
    if (method === "PUT") {
      const name = body.name?.trim();
      const email = body.email?.trim().toLowerCase();
      const errors = {};
      if (!name) errors.name = "กรุณากรอกชื่อ";
      if (!email || !email.includes("@")) errors.email = "รูปแบบอีเมลไม่ถูกต้อง";
      if (!["member", "admin"].includes(body.role)) errors.role = "บทบาทต้องเป็น member หรือ admin";
      if (Object.keys(errors).length) fail(400, "ข้อมูลไม่ถูกต้อง", errors);
      if (id === me.id && body.role !== "admin") fail(409, "ไม่สามารถเปลี่ยนบทบาทของบัญชีตัวเองได้");
      if (db.users.some((u) => u.id !== id && u.email.toLowerCase() === email)) fail(409, "อีเมลนี้มีบัญชีอยู่แล้ว");
      Object.assign(target, { name, email, role: body.role }); save(db);
      return out(publicUser(target), "แก้ไขสมาชิกสำเร็จ");
    }
  }

  // ---- ตรวจ Serial ----
  if (seg[0] === "serials") {
    need();
    const q = (params.get("serial") || "").trim().toLowerCase();
    if (!q) fail(400, "ข้อมูลไม่ถูกต้อง", { serial: "กรุณากรอก Serial Number" });
    const p = db.products.find((x) => (x.serial_number || "").toLowerCase() === q);
    if (p) {
      return out({ type: "product", serial_number: p.serial_number, product_id: p.id, product_name: p.name,
        category_name: catName(p.category_id), price: p.price, stock: p.stock });
    }
    for (const w of db.withdrawals) {
      for (const i of w.items) {
        const sn = (i.serials || []).find((x) => x.toLowerCase() === q);
        if (!sn) continue;
        const prod = db.products.find((x) => x.id === i.product_id);
        const base = { type: "issued", serial_number: sn, product_id: prod.id, product_name: prod.name,
          category_name: catName(prod.category_id), price: prod.price, stock: prod.stock, status: w.status };
        const mine = me.role === "admin" || w.user_id === me.id; // ผู้เบิก/ผู้อนุมัติ: เฉพาะ admin กับเจ้าของคำขอ
        return out(mine ? { ...base, request_id: w.id,
          requested_by: db.users.find((u) => u.id === w.user_id)?.name,
          decided_by_name: db.users.find((u) => u.id === w.decided_by)?.name, decided_at: w.decided_at } : base);
      }
    }
    fail(404, "ไม่พบ Serial Number นี้");
  }

  // ---- dashboard ----
  if (seg[0] === "dashboard") {
    need("admin");
    return out({
      total_products: db.products.length,
      total_categories: db.categories.length,
      low_stock_products: db.products.filter((p) => p.stock > 0 && p.stock <= 3).length,
      out_of_stock_products: db.products.filter((p) => p.stock === 0).length,
      pending_withdrawals: db.withdrawals.filter((w) => w.status === "pending").length,
    });
  }

  fail(404, "ไม่พบ API นี้");
}
