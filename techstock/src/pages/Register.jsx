import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api/backend";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await register(form); // role จะถูกกำหนดเป็น member โดย Backend เท่านั้น
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <form onSubmit={handleSubmit} className="card p-8 max-w-sm mx-auto mt-8 space-y-4 shadow-md">
      <h1 className="text-xl font-bold">สมัครสมาชิก</h1>
      <input required placeholder="ชื่อ" value={form.name} onChange={set("name")} className="input" />
      <input type="email" required placeholder="อีเมล" value={form.email} onChange={set("email")} className="input" />
      <input type="password" required minLength={6} placeholder="รหัสผ่าน (อย่างน้อย 6 ตัว)" value={form.password} onChange={set("password")} className="input" />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button className="btn btn-primary w-full">สมัครสมาชิก</button>
    </form>
  );
}

export default Register;
