const BACKEND_URL = "https://backendfullfmcg-production.up.railway.app/api";
const isClient = typeof window !== "undefined";

function getToken(): string | null {
  if (!isClient) return null;
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

  return response.json();
}

export type Role = "ADMIN" | "SHOP_OWNER";

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
    apiRequest<void>(`/products/${id}`, {
      method: "DELETE",
    }),

  uploadImage: async (id: number, file: File) => {
    const token = getToken();

    const formData = new FormData();
    formData.append("file", file);

    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${BACKEND_URL}/products/${id}/upload-image`,
      {
        method: "POST",
        headers,
        body: formData,
      }
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

export function getImageUrl(imageUrl: string | null): string {
  return imageUrl ? `${BACKEND_URL}/files/${imageUrl}` : "";
}
