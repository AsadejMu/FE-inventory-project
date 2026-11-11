import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getWithdrawals, approveWithdrawal, rejectWithdrawal } from "../api/backend";
import { useAuth } from "../context/AuthContext";

const STATUS = {
  pending: { label: "รออนุมัติ", cls: "bg-yellow-100 text-yellow-800" },
  approved: { label: "อนุมัติแล้ว", cls: "bg-green-100 text-green-800" },
  rejected: { label: "ปฏิเสธ", cls: "bg-red-100 text-red-800" },
};

const fmt = (d) =>
  d ? new Date(d).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" }) : "-";

// หน้าเดียวใช้ 2 บทบาท: Member เห็นของตัวเอง / Admin เห็นทั้งหมดและกดอนุมัติได้
function Withdrawals() {
  const { user } = useAuth();
  const { state } = useLocation(); // ข้อความแจ้งผลที่ส่งมาจากหน้าเบิกสินค้า
  const isAdmin = user.role === "admin";
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      const res = await getWithdrawals();
      setList(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAction(action, id) {
    setError("");
    try {
      await (action === "approve" ? approveWithdrawal(id) : rejectWithdrawal(id));
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1 className="page-title">{isAdmin ? "คำขอเบิกทั้งหมด" : "คำขอเบิกของฉัน"}</h1>
      {state?.message && <p className="text-green-600 mb-3">{state.message}</p>}
      {loading && <p>กำลังโหลด...</p>}
      {error && <p className="text-red-600 mb-3">{error}</p>}
      {!loading && list.length === 0 && <p>ยังไม่มีคำขอเบิก {!isAdmin && "ลองเลือกสินค้าจากหน้าแรกแล้วกด “ส่งคำขอเบิก”"}</p>}

      <div className="space-y-3">
        {list.map((w) => (
          <div key={w.id} className="card p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">คำขอ #{w.id} {isAdmin && <span className="text-gray-500 font-normal">โดย {w.user_name}</span>}</span>
              <span className={`text-sm px-2 py-1 rounded ${STATUS[w.status].cls}`}>{STATUS[w.status].label}</span>
            </div>
            <ul className="text-sm text-gray-700 mt-2 list-disc list-inside">
              {w.items.map((i) => (
                <li key={i.product_id}>
                  {i.product_name} × {i.quantity}
                  {i.serials?.length > 0 && (
                    <div className="mt-1 mb-2 flex flex-wrap gap-1">
                      {i.serials.map((sn) => (
                        <Link key={sn} to={`/check-serial?serial=${encodeURIComponent(sn)}`} title="ตรวจ Serial นี้"
                          className="font-mono text-xs px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-300 hover:underline">{sn}</Link>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
            {w.note && <p className="text-sm text-gray-500 mt-1">หมายเหตุ: {w.note}</p>}

            {/* log ของคำขอ: ส่งเมื่อไหร่ ใครตัดสินใจ */}
            <ul className="mt-3 border-t pt-2 text-xs text-gray-500 space-y-1">
              <li>ส่งคำขอ · {fmt(w.created_at)} · โดย {w.user_name}</li>
              {w.status === "pending" ? (
                <li>รอผู้ดูแลระบบดำเนินการ</li>
              ) : (
                <li className={w.status === "approved" ? "text-green-700" : "text-red-700"}>
                  {w.status === "approved" ? "อนุมัติ" : "ปฏิเสธ"} · {fmt(w.decided_at)} · โดย {w.decided_by_name ?? "-"}
                </li>
              )}
            </ul>
            {isAdmin && w.status === "pending" && (
              <div className="mt-3 flex gap-2">
                <button onClick={() => handleAction("approve", w.id)} className="btn btn-success btn-sm">อนุมัติ</button>
                <button onClick={() => handleAction("reject", w.id)} className="btn btn-danger btn-sm">ปฏิเสธ</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Withdrawals;
