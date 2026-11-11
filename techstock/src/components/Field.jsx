// ครอบ input ด้วย label (htmlFor ผูกกับ id) กดที่ชื่อช่องแล้วโฟกัส input ได้
function Field({ id, label, required, error, hint, className = "", children }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}

export default Field;
