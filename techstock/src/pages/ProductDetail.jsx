import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getProduct, createWithdrawal } from "../api/backend";
import { useAuth } from "../context/AuthContext";

function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  useEffect(() => {
    getProduct(id).then((res) => setProduct(res.data)).catch((err) => setError(err.message));
  }, [id]);

  async function handleRequest(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await createWithdrawal({ note, items: [{ product_id: product.id, quantity: Number(quantity) }] });
      // ส่งสำเร็จแล้วไปหน้า "คำขอเบิกของฉัน" พร้อมข้อความแจ้งผล
      navigate("/my-requests", { state: { message: res.message } });
    } catch (err) {
      setError(err.message);
    }
  }

  if (error && !product) return <p className="text-red-600">{error}</p>;
  if (!product) return <p>กำลังโหลด...</p>;

  return (
    <div className="card p-6 max-w-2xl">
      <Link to="/" className="text-brand-600 text-sm">← กลับไปหน้าสินค้า</Link>
      <h1 className="text-2xl font-bold mt-3">{product.name}</h1>
      <p className="text-gray-500">{product.category_name}</p>
      {product.serial_number && <p className="text-xs font-mono text-slate-500 mt-1">S/N: {product.serial_number}</p>}
      <p className="my-4">{product.description}</p>
      <p className="text-xl font-bold text-brand-700">฿{product.price.toLocaleString()}</p>
      <p className="mb-5 text-gray-600">คงเหลือ {product.stock} ชิ้น</p>

      {!user && <p className="text-sm text-gray-600"><Link to="/login" className="text-brand-600 underline">เข้าสู่ระบบ</Link> เพื่อขอเบิกสินค้า</p>}

      {user?.role === "member" && (
        <form onSubmit={handleRequest} className="space-y-3 border-t pt-4">
          <h2 className="font-semibold">ขอเบิกสินค้านี้</h2>
          <input type="number" min="1" max={product.stock} value={quantity} onChange={(e) => setQuantity(e.target.value)} className="input w-32" />
          <input type="text" placeholder="หมายเหตุ (ไม่บังคับ)" value={note} onChange={(e) => setNote(e.target.value)} className="input" />
          <button disabled={product.stock === 0} className="btn btn-primary">ส่งคำขอเบิก</button>
          {error && <p className="text-red-600">{error}</p>}
        </form>
      )}
    </div>
  );
}

export default ProductDetail;
