import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProducts, getCategories } from "../api/backend";
import ProductCard from "../components/ProductCard";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await getProducts(search, categoryId);
        setProducts(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [search, categoryId]);

  return (
    <div>
      <h1 className="page-title">อุปกรณ์คอมพิวเตอร์</h1>

      <div className="flex gap-3 mb-6">
        <input
          type="text" placeholder="ค้นหาชื่อสินค้าหรือ Serial Number..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input flex-1 min-w-0"
        />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input w-auto shrink-0">
          <option value="">ทุกหมวดหมู่</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {loading && <p>กำลังโหลดข้อมูลสินค้า...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && products.length === 0 && <p>ไม่พบสินค้าที่ตรงกับการค้นหา</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((p) => (
            <Link to={`/products/${p.id}`} key={p.id}><ProductCard product={p} /></Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Products;
