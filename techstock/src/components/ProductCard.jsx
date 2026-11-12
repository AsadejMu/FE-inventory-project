// Week 4: รับข้อมูลผ่าน Props
function ProductCard({ product }) {
  const out = product.stock === 0;
  const low = !out && product.stock <= 3;

  return (
    <div className="card overflow-hidden h-full transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="h-36 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-5xl">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="h-full object-contain" />
        ) : (
          "🖥️"
        )}
      </div>
      <div className="p-4">
        <span className="text-xs font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">{product.category_name}</span>
        <h3 className="font-semibold text-slate-900 mt-2 leading-snug">{product.name}</h3>
        <div className="flex items-end justify-between mt-4">
          <span className="text-lg font-bold text-slate-900">฿{product.price.toLocaleString()}</span>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${out ? "bg-rose-50 text-rose-700" : low ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
            {out ? "สินค้าหมด" : `คงเหลือ ${product.stock} ชิ้น`}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
