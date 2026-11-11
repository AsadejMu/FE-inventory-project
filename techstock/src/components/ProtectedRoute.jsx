import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// หมายเหตุ: นี่คือการซ่อนหน้าฝั่ง FE เท่านั้น Backend ต้องตรวจสิทธิ์ซ้ำเสมอ
function ProtectedRoute({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default ProtectedRoute;
