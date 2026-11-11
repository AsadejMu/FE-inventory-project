import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === "admin" ? "/admin/products" : "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-8 max-w-sm mx-auto mt-8 space-y-4 shadow-md">
      <h1 className="text-xl font-bold">เข้าสู่ระบบ</h1>
      <input type="email" required placeholder="อีเมล" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
      <input type="password" required placeholder="รหัสผ่าน" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button disabled={loading} className="btn btn-primary w-full">{loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}</button>
      <p className="text-sm text-gray-600">ยังไม่มีบัญชี? <Link to="/register" className="text-brand-600 underline">สมัครสมาชิก</Link></p>
      <p className="text-xs text-gray-400">ทดลอง: admin@techstock.com / admin123 หรือ member@techstock.com / member123</p>
    </form>
  );
}

export default Login;
