const BACKEND_URL = "https://backendfullfmcg-production.up.railway.app/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("fmcg_token");
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = "Request failed";
    try {
      const error = await response.json();
      errorMessage = error.detail || error.message || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }

  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return text ? JSON.parse(text) : (undefined as T);
}

export type Role = "ADMIN" | "SHOP_OWNER";
export type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
export type PaymentMethod = "ONLINE" | "COD";

export interface UserResponse {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: Role;
  creditPeriodDays: number;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}

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

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

export interface OrderItemRequest {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

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
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export interface OrderRequest {
  items: OrderItemRequest[];
  paymentMethod: string;
  shopOwnerId?: number;
}

export interface AnalyticsResponse {
  total_sales: number;
  paid_amount: number;
  pending_amount: number;
  delivered_orders: number;
  pending_orders: number;
  top_products: Array<{ product_name: string; quantity: number; revenue: number }>;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (data: {
    email: string;
    password: string;
    name: string;
    phone: string;
    role?: string;
  }) =>
    apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: () => apiRequest<UserResponse>("/auth/me"),

  forgotPassword: (email: string) =>
    apiRequest<{ message?: string; reset_code?: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (code: string, newPassword: string) =>
    apiRequest<{ message?: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ code, newPassword }),
    }),
};

export const productsApi = {
  getAll: () => apiRequest<ProductResponse[]>("/products"),

  create: (data: ProductRequest) =>
    apiRequest<ProductResponse>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: ProductRequest) =>
    apiRequest<ProductResponse>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiRequest<void>(`/products/${id}`, { method: "DELETE" }),

  uploadImage: async (id: number, file: any) => {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);
    const headers: HeadersInit = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(
      `${BACKEND_URL}/products/${id}/upload-image`,
      { method: "POST", headers, body: formData }
    );

    if (!response.ok) {
      let errorMessage = "Upload failed";
      try {
        const error = await response.json();
        errorMessage = error.detail || errorMessage;
      } catch {}
      throw new Error(errorMessage);
    }
    return response.json();
  },
};

export const ordersApi = {
  getAll: () => apiRequest<OrderResponse[]>("/orders"),
  getOne: (id: number) => apiRequest<OrderResponse>(`/orders/${id}`),
  create: (data: OrderRequest) =>
    apiRequest<OrderResponse>("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateStatus: (id: number, status: string) =>
    apiRequest<OrderResponse>(`/orders/${id}/status?status=${encodeURIComponent(status)}`, {
      method: "PUT",
    }),
};

export const shopOwnersApi = {
  getAll: () => apiRequest<UserResponse[]>("/shop-owners"),
  updateCreditPeriod: (id: number, creditPeriodDays: number) =>
    apiRequest<UserResponse>(`/shop-owners/${id}/credit-period?creditPeriodDays=${creditPeriodDays}`, {
      method: "PUT",
    }),
};

export const analyticsApi = {
  getSales: () => apiRequest<AnalyticsResponse>("/analytics/sales"),
};

export function getImageUrl(imageUrl: string | null): string {
  return imageUrl ? `${BACKEND_URL}/files/${imageUrl}` : "";
}
