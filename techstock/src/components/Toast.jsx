// ข้อความแจ้งผลลอยมุมขวาล่าง มองเห็นเสมอแม้เลื่อนหน้าลงมาไกล
function Toast({ message, error }) {
  if (!message && !error) return null;
  return (
    <div role="status"
      className={`fixed bottom-4 right-4 z-50 max-w-sm px-4 py-3 rounded-lg shadow-lg text-white ${error ? "bg-red-600" : "bg-green-600"}`}>
      {error || message}
    </div>
  );
}

export default Toast;
