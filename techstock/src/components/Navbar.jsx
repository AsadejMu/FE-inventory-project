import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkCls = ({ isActive }) =>
  `px-3 py-1.5 rounded-lg text-sm font-medium transition ${
    isActive ? "bg-white/10 text-white" : "text-slate-300 hover:text-white hover:bg-white/5"
  }`;

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-20 bg-ink/95 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-1">
        <Link to="/" className="flex items-center gap-2 mr-6">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-brand-500 text-ink font-extrabold text-sm">TS</span>
          <span className="text-white font-bold tracking-tight">TechStock</span>
        </Link>

        <NavLink to="/" end className={linkCls}>สินค้า</NavLink>
        {user && <NavLink to="/check-serial" className={linkCls}>ตรวจ Serial</NavLink>}
        {user?.role === "member" && <NavLink to="/my-requests" className={linkCls}>คำขอเบิกของฉัน</NavLink>}
        {user?.role === "admin" && (
          <>
            <NavLink to="/admin/products" className={linkCls}>จัดการสินค้า</NavLink>
            <NavLink to="/admin/withdrawals" className={linkCls}>คำขอเบิก</NavLink>
            <NavLink to="/admin/members" className={linkCls}>สมาชิก</NavLink>
          </>
        )}

        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden sm:flex items-center gap-2 text-sm text-slate-300">
                {user.name}
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300">{user.role}</span>
              </span>
              <button onClick={handleLogout} className="btn btn-sm btn-dark">ออกจากระบบ</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-sm text-slate-200 hover:text-white">เข้าสู่ระบบ</Link>
              <Link to="/register" className="btn btn-sm btn-primary">สมัครสมาชิก</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
