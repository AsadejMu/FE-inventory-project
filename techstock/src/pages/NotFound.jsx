import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-3xl font-bold mb-2">ไม่พบหน้านี้</h1>
      <Link to="/" className="text-brand-600 underline">กลับหน้าแรก</Link>
    </div>
  );
}

export default NotFound;
