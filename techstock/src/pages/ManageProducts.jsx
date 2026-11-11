import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Field from "../components/Field";
import Modal from "../components/Modal";
import Toast from "../components/Toast";
import { getProducts, getCategories, getDashboard, createProduct, updateProduct, deleteProduct, stockIn } from "../api/backend";

const emptyForm = { name: "", category_id: "", description: "", serial_number: "", price: "", stock: 0, image_url: "" };

function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // หน้าต่างรับเข้าคลัง / ยืนยันลบ
  const [stockTarget, setStockTarget] = useState(null);
  const [stockForm, setStockForm] = useState({ quantity: "", note: "" });
  const [stockError, setStockError] = useState("");
  const [stockFieldErrors, setStockFieldErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const [p, c, d] = await Promise.all([getProducts(), getCategories(), getDashboard()]);
    setProducts(p.data);
    setStats(d.data); // โหลดใหม่ทุกครั้งที่เพิ่ม/แก้/ลบ/รับสินค้า ตัวเลขจึงอัปเดตตาม
    setCategories(c.data);
    setForm((f) => (f.category_id ? f : { ...f, category_id: c.data[0]?.id ?? "" }));
  }

  useEffect(() => { load().catch((err) => setError(err.message)); }, []);

  // ข้อความแจ้งผลหายเองใน 5 วินาที
  useEffect(() => {
    if (!message && !error) return;
    const t = setTimeout(() => { setMessage(""); setError(""); }, 5000);
    return () => clearTimeout(t);
  }, [message, error]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setMessage(""); setFieldErrors({});
    try {
      // input ให้ค่าเป็น string แต่ Backend (Go) ต้องการตัวเลข จึงแปลงก่อนส่ง
      const payload = { ...form, category_id: Number(form.category_id), price: Number(form.price), stock: Number(form.stock) || 0 };
      const res = editingId ? await updateProduct(editingId, payload) : await createProduct(payload);
      setMessage(res.message);
      setForm({ ...emptyForm, category_id: categories[0]?.id ?? "" });
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.errors || {});
    }
  }

  function startEdit(p) {
    setEditingId(p.id);
    setForm({ name: p.name, category_id: p.category_id, description: p.description, serial_number: p.serial_number || "", price: p.price, stock: p.stock, image_url: p.image_url });
  }

  async function confirmDelete() {
    setBusy(true); setError(""); setMessage("");
    try {
      const res = await deleteProduct(deleteTarget.id);
      setMessage(res?.message ?? "ลบสินค้าสำเร็จ");
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setDeleteTarget(null);
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function openStockIn(p) {
    setStockTarget(p);
    setStockForm({ quantity: "", note: "" });
    setStockError(""); setStockFieldErrors({});
  }

  async function submitStockIn(e) {
    e.preventDefault();
    setStockError(""); setStockFieldErrors({});
    const qty = Number(stockForm.quantity);
    if (!Number.isInteger(qty) || qty <= 0) {
      setStockFieldErrors({ quantity: "จำนวนต้องเป็นจำนวนเต็มมากกว่า 0" });
      return;
    }
    setBusy(true);
    try {
      const res = await stockIn({
        product_id: stockTarget.id,
        quantity: qty,
        note: stockForm.note.trim() || "รับสินค้าเข้าคลัง",
      });
      setMessage(`${res.message}: ${stockTarget.name} ${res.data.previous_stock} → ${res.data.current_stock} ชิ้น`);
      setStockTarget(null);
      await load();
    } catch (err) {
      setStockError(err.message);
      setStockFieldErrors(err.errors || {});
    } finally {
      setBusy(false);
    }
  }

  const cards = stats
    ? [
        { label: "สินค้าทั้งหมด", value: stats.total_products },
        { label: "หมวดหมู่", value: stats.total_categories },
        { label: "สินค้าใกล้หมด", value: stats.low_stock_products, warn: stats.low_stock_products > 0 },
        { label: "สินค้าหมดสต็อก", value: stats.out_of_stock_products, warn: stats.out_of_stock_products > 0 },
        { label: "คำขอเบิกรออนุมัติ", value: stats.pending_withdrawals, warn: stats.pending_withdrawals > 0, to: "/admin/withdrawals" },
      ]
    : [];

  return (
    <div>
      <h1 className="page-title">แดชบอร์ดและจัดการสินค้า</h1>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {cards.map((c) => {
            const body = (
              <>
                <p className="text-sm text-gray-500">{c.label}</p>
                <p className={`text-3xl font-bold ${c.warn ? "text-orange-600" : ""}`}>{c.value}</p>
              </>
            );
            return c.to ? (
              <Link key={c.label} to={c.to} className="card p-4 hover:shadow-md transition">{body}</Link>
            ) : (
              <div key={c.label} className="card p-4">{body}</div>
            );
          })}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-4 mb-6 grid md:grid-cols-2 gap-4">
        <Field id="name" label="ชื่อสินค้า" required error={fieldErrors.name}>
          <input id="name" placeholder="เช่น NVIDIA RTX 4060" value={form.name} onChange={set("name")} className="input" />
        </Field>

        <Field id="category_id" label="หมวดหมู่" required error={fieldErrors.category_id}>
          <select id="category_id" value={form.category_id} onChange={set("category_id")} className="input">
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>

        <Field id="serial_number" label="Serial Number" error={fieldErrors.serial_number} hint={editingId ? "เว้นว่างเพื่อคงค่าเดิม (ห้ามซ้ำกับสินค้าอื่น)" : "เว้นว่างเพื่อให้ระบบสร้างให้ เช่น GPU-0002"}>
          <input id="serial_number" placeholder="สร้างอัตโนมัติ (หรือกรอกเอง)" value={form.serial_number} onChange={set("serial_number")} className="input font-mono" />
        </Field>

        <Field id="price" label="ราคา (บาท)" required error={fieldErrors.price}>
          <input id="price" type="number" min="0" step="any" placeholder="เช่น 10900" value={form.price} onChange={set("price")} className="input" />
        </Field>

        {/* สต็อกกำหนดได้ตอนสร้างเท่านั้น หลังจากนั้นแก้ผ่าน "รับเข้าคลัง" ตาม contract */}
        <Field id="stock" label="สต็อกเริ่มต้น (ชิ้น)" error={fieldErrors.stock}
          hint={editingId ? "แก้จำนวนสต็อกผ่านปุ่ม “รับเข้าคลัง” ในตารางด้านล่าง" : ""}>
          <input id="stock" type="number" min="0" value={form.stock} onChange={set("stock")} disabled={!!editingId} className="input" />
        </Field>

        <Field id="description" label="รายละเอียด" className="md:col-span-2">
          <input id="description" placeholder="เช่น NVIDIA Graphics Card 8GB" value={form.description} onChange={set("description")} className="input" />
        </Field>

        <div className="md:col-span-2 flex gap-2 items-center">
          <button className="btn btn-primary">{editingId ? "บันทึกการแก้ไข" : "เพิ่มสินค้า"}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ ...emptyForm, category_id: categories[0]?.id ?? "" }); }} className="btn btn-ghost">ยกเลิก</button>}
        </div>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr><th className="p-3">สินค้า</th><th className="p-3">Serial Number</th><th className="p-3">หมวดหมู่</th><th className="p-3">ราคา</th><th className="p-3">คงเหลือ</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.name}</td>
                <td className="p-3 font-mono text-sm text-slate-600">{p.serial_number || "-"}</td>
                <td className="p-3">{p.category_name}</td>
                <td className="p-3">฿{p.price.toLocaleString()}</td>
                <td className={`p-3 ${p.stock <= 3 ? "text-orange-600 font-semibold" : ""}`}>{p.stock}</td>
                <td className="p-3">
                  <div className="flex gap-2 whitespace-nowrap">
                    <button type="button" onClick={() => openStockIn(p)}
                      className="btn btn-success btn-sm">
                      รับเข้าคลัง
                    </button>
                    <button type="button" onClick={() => startEdit(p)}
                      className="btn btn-primary btn-sm">
                      แก้ไข
                    </button>
                    <button type="button" onClick={() => setDeleteTarget(p)}
                      className="btn btn-danger btn-sm">
                      ลบ
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {stockTarget && (
        <Modal title={`รับเข้าคลัง: ${stockTarget.name}`} onClose={() => setStockTarget(null)}>
          <form onSubmit={submitStockIn} className="space-y-4">
            <p className="text-sm text-gray-600">คงเหลือปัจจุบัน {stockTarget.stock} ชิ้น</p>
            <Field id="stock-qty" label="จำนวนที่รับเข้า (ชิ้น)" required error={stockFieldErrors.quantity}>
              <input id="stock-qty" type="number" min="1" step="1" autoFocus value={stockForm.quantity}
                onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
                className="input" />
            </Field>
            <Field id="stock-note" label="หมายเหตุ">
              <input id="stock-note" placeholder="เช่น รับของใหม่จากผู้จำหน่าย" value={stockForm.note}
                onChange={(e) => setStockForm({ ...stockForm, note: e.target.value })}
                className="input" />
            </Field>
            {stockError && <p className="text-red-600 text-sm">{stockError}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setStockTarget(null)} className="btn btn-ghost">ยกเลิก</button>
              <button disabled={busy} className="btn btn-success">
                {busy ? "กำลังบันทึก..." : "ยืนยันรับเข้า"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="ยืนยันการลบสินค้า" onClose={() => setDeleteTarget(null)}>
          <p className="mb-4">ต้องการลบ “{deleteTarget.name}” ใช่หรือไม่?</p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setDeleteTarget(null)} className="btn btn-ghost">ยกเลิก</button>
            <button type="button" onClick={confirmDelete} disabled={busy} className="btn btn-danger">
              {busy ? "กำลังลบ..." : "ลบสินค้า"}
            </button>
          </div>
        </Modal>
      )}

      <Toast message={message} error={error} />
    </div>
  );
}

export default ManageProducts;
