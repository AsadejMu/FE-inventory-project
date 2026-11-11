import { useState, useEffect } from "react";
import { getMembers, updateMember, deleteMember } from "../api/backend";
import { useAuth } from "../context/AuthContext";
import Field from "../components/Field";
import Modal from "../components/Modal";
import Toast from "../components/Toast";

const ROLE = {
  admin: { label: "ผู้ดูแลระบบ", cls: "bg-purple-100 text-purple-800" },
  member: { label: "สมาชิก", cls: "bg-gray-100 text-gray-700" },
};

function Members() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ตัวกรอง
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // ฟอร์มแก้ไข
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", role: "member" });
  const [fieldErrors, setFieldErrors] = useState({});

  async function load() {
    try {
      const res = await getMembers();
      setMembers(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!message && !error) return;
    const t = setTimeout(() => { setMessage(""); setError(""); }, 5000);
    return () => clearTimeout(t);
  }, [message, error]);

  // กรองชื่อหรืออีเมล (พิมพ์ส่วนไหนก็เจอ ไม่สนตัวพิมพ์ใหญ่เล็ก) และกรองตามบทบาท
  const q = search.trim().toLowerCase();
  const shown = members.filter(
    (m) =>
      (!q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)) &&
      (!roleFilter || m.role === roleFilter)
  );

  function startEdit(m) {
    setEditing(m);
    setForm({ name: m.name, email: m.email, role: m.role });
    setFieldErrors({}); setError(""); setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSave(e) {
    e.preventDefault();
    setError(""); setMessage(""); setFieldErrors({});
    try {
      const res = await updateMember(editing.id, form);
      setMessage(res.message);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.errors || {});
    }
  }

  async function confirmDelete() {
    const m = deleteTarget;
    setDeleteTarget(null); setError(""); setMessage("");
    try {
      const res = await deleteMember(m.id);
      setMessage(res.message);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const isSelf = (m) => m.id === user.id;

  return (
    <div>
      <h1 className="page-title">สมาชิกทั้งหมด</h1>

      {editing && (
        <form onSubmit={handleSave} className="card p-4 mb-6 grid md:grid-cols-3 gap-4">
          <Field id="m-name" label="ชื่อ" required error={fieldErrors.name}>
            <input id="m-name" value={form.name} onChange={set("name")} className="input" />
          </Field>
          <Field id="m-email" label="อีเมล" required error={fieldErrors.email}>
            <input id="m-email" type="email" value={form.email} onChange={set("email")} className="input" />
          </Field>
          <Field id="m-role" label="บทบาท" required error={fieldErrors.role}
            hint={isSelf(editing) ? "เปลี่ยนบทบาทของบัญชีตัวเองไม่ได้" : ""}>
            <select id="m-role" value={form.role} onChange={set("role")} disabled={isSelf(editing)}
              className="input">
              <option value="member">สมาชิก</option>
              <option value="admin">ผู้ดูแลระบบ</option>
            </select>
          </Field>
          <div className="md:col-span-3 flex gap-2">
            <button className="btn btn-primary">บันทึกการแก้ไข</button>
            <button type="button" onClick={() => setEditing(null)} className="btn btn-ghost">ยกเลิก</button>
          </div>
        </form>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text" placeholder="ค้นหาด้วยชื่อหรืออีเมล..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input sm:flex-1 min-w-0"
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input sm:w-48 sm:shrink-0">
          <option value="">ทุกบทบาท</option>
          <option value="member">สมาชิก</option>
          <option value="admin">ผู้ดูแลระบบ</option>
        </select>
      </div>

      {loading && <p>กำลังโหลด...</p>}
      {!loading && members.length > 0 && (
        <p className="text-sm text-gray-500 mb-2">แสดง {shown.length} จาก {members.length} คน</p>
      )}
      {!loading && members.length === 0 && <p>ยังไม่มีสมาชิก</p>}
      {!loading && members.length > 0 && shown.length === 0 && <p>ไม่พบสมาชิกที่ตรงกับตัวกรอง</p>}

      {shown.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-sm text-gray-600">
              <tr>
                <th className="p-3">ชื่อ</th><th className="p-3">อีเมล</th>
                <th className="p-3">บทบาท</th><th className="p-3">คำขอเบิก (ครั้ง)</th><th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((m) => (
                <tr key={m.id} className="border-t">
                  <td className="p-3">{m.name} {isSelf(m) && <span className="text-xs text-gray-400">(คุณ)</span>}</td>
                  <td className="p-3">{m.email}</td>
                  <td className="p-3">
                    <span className={`text-sm px-2 py-1 rounded ${ROLE[m.role]?.cls}`}>{ROLE[m.role]?.label ?? m.role}</span>
                  </td>
                  <td className="p-3">{m.request_count}</td>
                  <td className="p-3">
                    <div className="flex gap-2 whitespace-nowrap">
                      <button type="button" onClick={() => startEdit(m)}
                        className="btn btn-primary btn-sm">
                        แก้ไข
                      </button>
                      <button type="button" onClick={() => setDeleteTarget(m)} disabled={isSelf(m)}
                        title={isSelf(m) ? "ลบบัญชีของตัวเองไม่ได้" : ""}
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
      )}

      {deleteTarget && (
        <Modal title="ยืนยันการลบสมาชิก" onClose={() => setDeleteTarget(null)}>
          <p className="mb-4">ต้องการลบสมาชิก “{deleteTarget.name}” ใช่หรือไม่?</p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setDeleteTarget(null)} className="btn btn-ghost">ยกเลิก</button>
            <button type="button" onClick={confirmDelete} className="btn btn-danger">ลบสมาชิก</button>
          </div>
        </Modal>
      )}

      <Toast message={message} error={error} />
    </div>
  );
}

export default Members;
