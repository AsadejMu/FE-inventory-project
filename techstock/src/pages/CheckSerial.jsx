import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { checkSerial } from "../api/backend";
import Field from "../components/Field";

const fmt = (d) =>
  d ? new Date(d).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" }) : "-";

function CheckSerial() {
  const [params, setParams] = useSearchParams();
  const initial = params.get("serial") || "";
  const [serial, setSerial] = useState(initial);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function search(value) {
    const v = value.trim();
    if (!v) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await checkSerial(v);
      setResult(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // เปิดมาพร้อม ?serial=... (เช่นกดจากหน้าคำขอเบิก) ให้ค้นหาให้เลย
  useEffect(() => { if (initial) search(initial); }, []);

  function handleSubmit(e) {
    e.preventDefault();
    setParams(serial.trim() ? { serial: serial.trim() } : {});
    search(serial);
  }

  const issued = result?.type === "issued";

  return (
    <div>
      <h1 className="page-title">ตรวจ Serial Number</h1>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:items-end max-w-2xl">
        <Field id="serial" label="Serial Number" className="flex-1">
          <input id="serial" placeholder="เช่น GPU-0005" value={serial} onChange={(e) => setSerial(e.target.value)} className="input font-mono" />
        </Field>
        <button disabled={loading || !serial.trim()} className="btn btn-primary">{loading ? "กำลังตรวจ..." : "ตรวจสอบ"}</button>
      </form>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {result && (
        <div className="card p-6 mt-6 max-w-2xl">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="font-mono text-xl font-bold text-slate-900">{result.serial_number}</span>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${issued ? "bg-amber-50 text-amber-700" : "bg-brand-50 text-brand-700"}`}>
              {issued ? "ชิ้นที่ออกให้ตอนอนุมัติ" : "Serial ของสินค้า"}
            </span>
          </div>

          <dl className="mt-4 grid grid-cols-[9rem_1fr] gap-y-2 text-sm">
            <dt className="text-slate-500">สินค้า</dt>
            <dd><Link to={`/products/${result.product_id}`} className="text-brand-700 underline">{result.product_name}</Link></dd>
            <dt className="text-slate-500">หมวดหมู่</dt><dd>{result.category_name}</dd>
            <dt className="text-slate-500">ราคา</dt><dd>฿{result.price.toLocaleString()}</dd>
            <dt className="text-slate-500">คงเหลือในคลัง</dt><dd>{result.stock} ชิ้น</dd>

            {issued && (
              <>
                <dt className="text-slate-500">สถานะ</dt><dd className="text-green-700 font-medium">ออกให้แล้ว (อนุมัติเบิก)</dd>
                {result.request_id ? (
                  <>
                    <dt className="text-slate-500">คำขอเบิก</dt><dd>#{result.request_id}</dd>
                    <dt className="text-slate-500">ผู้เบิก</dt><dd>{result.requested_by}</dd>
                    <dt className="text-slate-500">ผู้อนุมัติ</dt><dd>{result.decided_by_name ?? "-"}</dd>
                    <dt className="text-slate-500">วันที่อนุมัติ</dt><dd>{fmt(result.decided_at)}</dd>
                  </>
                ) : (
                  <>
                    <dt className="text-slate-500">รายละเอียด</dt>
                    <dd className="text-slate-500">ดูผู้เบิกได้เฉพาะผู้ดูแลระบบหรือเจ้าของคำขอ</dd>
                  </>
                )}
              </>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}

export default CheckSerial;
