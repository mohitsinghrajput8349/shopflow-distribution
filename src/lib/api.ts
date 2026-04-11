const BACKEND_URL = "https://fmcg-app-production.up.railway.app/api";

function getToken(): string | null {
  return localStorage.getItem("fmcg_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BACKEND_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(body.detail || body.message || "Request failed");
  }
  if (res.status === 204) return {} as T;
  return res.json();
}

// Auth
export interface UserResponse {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: "ADMIN" | "SHOP_OWNER";
  creditPeriodDays: number;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (data: { email: string; password: string; name: string; phone: string; role?: string }) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  me: () => request<UserResponse>("/auth/me"),
  forgotPassword: (email: string) =>
    request<{ message: string; reset_code: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  resetPassword: (code: string, newPassword: string) =>
    request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ code, newPassword }),
    }),
};

// Products
export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  stock: number;
  category: string;
  isActive: boolean;
  createdAt: string;
}

export const productsApi = {
  getAll: () => request<ProductResponse[]>("/products"),
  getById: (id: number) => request<ProductResponse>(`/products/${id}`),
  create: (data: { name: string; description: string; price: number; stock: number; category: string }) =>
    request<ProductResponse>("/products", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: { name: string; description: string; price: number; stock: number; category: string }) =>
    request<ProductResponse>(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) => request<{ message: string }>(`/products/${id}`, { method: "DELETE" }),
  uploadImage: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<{ image_url: string }>(`/products/${id}/upload-image`, {
      method: "POST",
      body: formData,
    });
  },
};

// Orders
export interface OrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OrderResponse {
  id: number;
  shopOwnerId: number;
  shopOwnerName: string;
  items: OrderItemResponse[];
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
  paymentMethod: "ONLINE" | "COD";
  deliveryDate: string | null;
  paymentDueDate: string | null;
  createdBy: number;
  createdAt: string;
}

export interface OrderItemRequest {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export const ordersApi = {
  getAll: () => request<OrderResponse[]>("/orders"),
  getById: (id: number) => request<OrderResponse>(`/orders/${id}`),
  create: (data: { items: OrderItemRequest[]; paymentMethod: string; shopOwnerId?: number }) =>
    request<OrderResponse>("/orders", { method: "POST", body: JSON.stringify(data) }),
  updateStatus: (id: number, status: string) =>
    request<OrderResponse>(`/orders/${id}/status?status=${status}`, { method: "PUT" }),
};

// Shop Owners
export const shopOwnersApi = {
  getAll: () => request<UserResponse[]>("/shop-owners"),
  updateCreditPeriod: (id: number, days: number) =>
    request<{ message: string }>(`/shop-owners/${id}/credit-period?creditPeriodDays=${days}`, { method: "PUT" }),
};

// Analytics
export const analyticsApi = {
  getSales: () => request<any>("/analytics/sales"),
};

// Notifications
export interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationsApi = {
  getAll: () => request<Notification[]>("/notifications"),
  markAsRead: (id: number) => request<any>(`/notifications/${id}/read`, { method: "PUT" }),
};

// Image URL helper
export function getImageUrl(imageUrl: string | null): string {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${BACKEND_URL}/files/${imageUrl}`;
}
