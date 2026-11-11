import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Withdrawals from "./pages/Withdrawals";
import ManageProducts from "./pages/ManageProducts";
import Members from "./pages/Members";
import CheckSerial from "./pages/CheckSerial";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/check-serial" element={<ProtectedRoute><CheckSerial /></ProtectedRoute>} />

          <Route path="/my-requests" element={<ProtectedRoute role="member"><Withdrawals /></ProtectedRoute>} />

          <Route path="/admin" element={<Navigate to="/admin/products" replace />} />
          <Route path="/admin/products" element={<ProtectedRoute role="admin"><ManageProducts /></ProtectedRoute>} />
          <Route path="/admin/withdrawals" element={<ProtectedRoute role="admin"><Withdrawals /></ProtectedRoute>} />
          <Route path="/admin/members" element={<ProtectedRoute role="admin"><Members /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
