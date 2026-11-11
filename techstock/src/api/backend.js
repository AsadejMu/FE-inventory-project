import { mockServer } from "./mockServer";

const API_URL = import.meta.env.VITE_API_URL;

// ฟังก์ชันกลาง: ถ้ามี VITE_API_URL ใช้ fetch ไป Go จริง ไม่มีก็ใช้ Mock
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");
  const method = options.method || "GET";
  const body = options.body ? JSON.parse(options.body) : undefined;

  if (!API_URL) return mockServer(method, path, body, token);

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
  } catch {
    // เน็ตหลุด หรือ Render (แผนฟรี) กำลังตื่น
    throw new Error("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ (ถ้าเพิ่งเปิดใช้งาน เซิร์ฟเวอร์อาจกำลังตื่น ลองใหม่อีกครั้ง)");
  }
  const json = response.status === 204 ? null : await response.json().catch(() => null);

  // ตั๋วหมดอายุหรือใช้ไม่ได้ (BE ตอบ 401) -> ล้างข้อมูลล็อกอินแล้วพาไปเข้าสู่ระบบใหม่
  if (response.status === 401 && token && !path.startsWith("/api/auth/login")) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.assign("/login");
  }
  if (!response.ok) {
    throw Object.assign(new Error(json?.message || `เกิดข้อผิดพลาด (${response.status})`), {
      status: response.status,
      errors: json?.errors,
    });
  }
  return json;
}

const send = (method, path, data) => apiFetch(path, { method, body: data && JSON.stringify(data) });

// Auth
export const login = (data) => send("POST", "/api/auth/login", data);
export const register = (data) => send("POST", "/api/auth/register", data);

// Products & Categories
export const getProducts = (search = "", categoryId = "") =>
  apiFetch(`/api/products?search=${encodeURIComponent(search)}&category_id=${categoryId}`);
export const getProduct = (id) => apiFetch(`/api/products/${id}`);
export const createProduct = (data) => send("POST", "/api/products", data);
export const updateProduct = (id, data) => send("PUT", `/api/products/${id}`, data);
export const deleteProduct = (id) => send("DELETE", `/api/products/${id}`);
export const getCategories = () => apiFetch("/api/categories");

// Stock
export const stockIn = (data) => send("POST", "/api/stock/in", data);

// Withdrawals
export const getWithdrawals = () => apiFetch("/api/withdrawals");
export const createWithdrawal = (data) => send("POST", "/api/withdrawals", data);
export const approveWithdrawal = (id) => send("PUT", `/api/withdrawals/${id}/approve`);
export const rejectWithdrawal = (id) => send("PUT", `/api/withdrawals/${id}/reject`);

// Members (admin)
export const getMembers = () => apiFetch("/api/members");
export const updateMember = (id, data) => send("PUT", `/api/members/${id}`, data);
export const deleteMember = (id) => send("DELETE", `/api/members/${id}`);

// Serial
export const checkSerial = (serial) => apiFetch(`/api/serials?serial=${encodeURIComponent(serial)}`);

// Dashboard
export const getDashboard = () => apiFetch("/api/dashboard");
