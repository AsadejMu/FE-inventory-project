import { render, screen } from "@testing-library/react";
import ProductCard from "./ProductCard";

const product = { id: 1, name: "RTX 4060", category_name: "GPU", price: 10900, stock: 5, image_url: "" };

test("แสดงข้อมูลสินค้าได้ถูกต้อง", () => {
  render(<ProductCard product={product} />);
  expect(screen.getByText("RTX 4060")).toBeInTheDocument();
  expect(screen.getByText("GPU")).toBeInTheDocument();
  expect(screen.getByText("฿10,900")).toBeInTheDocument();
  expect(screen.getByText("คงเหลือ 5 ชิ้น")).toBeInTheDocument();
});

test("แสดงสินค้าหมดเมื่อ stock เป็น 0", () => {
  render(<ProductCard product={{ ...product, stock: 0 }} />);
  expect(screen.getByText("สินค้าหมด")).toBeInTheDocument();
});
