// API client for the Express backend. In dev, Vite proxies /api and /uploads
// to the backend server; in production both are served from the same origin.

import type { Product } from "@/data/products";

export interface Category {
  id: string;
  name: string;
  image: string;
  href: string;
  kind: "circle" | "featured";
  sortOrder: number;
  active: boolean;
}

export interface Testimonial {
  id: string;
  text: string;
  customer: string;
  date: string;
  product: string;
  rating: number;
  image: string;
  sortOrder: number;
  active: boolean;
}

export interface BannerSettings {
  title: string;
  subtitle?: string;
  cta?: string;
  image: string;
}

export interface SiteSettings {
  announcement_messages: string[];
  marquee_text: string;
  hero: {
    prefix: string;
    title: string;
    mainImage: string;
    fabricImage: string;
  };
  promo_banner: BannerSettings;
  most_loved_banner: BannerSettings;
  fabric_banner: BannerSettings;
  press_logos: string[];
  section_titles: Record<string, string>;
}

export interface StorefrontData {
  settings: SiteSettings;
  products: Record<string, Product[]>;
  categories: Category[];
  featuredCategories: Category[];
  testimonials: Testimonial[];
}

const TOKEN_KEY = "hastavastra_admin_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = false
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (options.body && typeof options.body === "string") {
    headers["Content-Type"] = "application/json";
  }
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(path, { ...options, headers });
  if (res.status === 401 && auth) {
    setToken(null);
    throw new Error("Session expired. Please log in again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data as T;
}

// ---- Public ----

export function fetchStorefront(): Promise<StorefrontData> {
  return request<StorefrontData>("/api/storefront");
}

// ---- Admin ----

export const adminApi = {
  login: (email: string, password: string) =>
    request<{ token: string; email: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<{ email: string }>("/api/auth/me", {}, true),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ ok: boolean }>(
      "/api/auth/password",
      { method: "PUT", body: JSON.stringify({ currentPassword, newPassword }) },
      true
    ),

  getProducts: () => request<Product[]>("/api/products", {}, true),
  createProduct: (p: Partial<Product>) =>
    request<Product>(
      "/api/products",
      { method: "POST", body: JSON.stringify(p) },
      true
    ),
  updateProduct: (id: string, p: Partial<Product>) =>
    request<Product>(
      `/api/products/${id}`,
      { method: "PUT", body: JSON.stringify(p) },
      true
    ),
  deleteProduct: (id: string) =>
    request<{ ok: boolean }>(`/api/products/${id}`, { method: "DELETE" }, true),

  getCategories: () => request<Category[]>("/api/categories", {}, true),
  createCategory: (c: Partial<Category>) =>
    request<Category>(
      "/api/categories",
      { method: "POST", body: JSON.stringify(c) },
      true
    ),
  updateCategory: (id: string, c: Partial<Category>) =>
    request<Category>(
      `/api/categories/${id}`,
      { method: "PUT", body: JSON.stringify(c) },
      true
    ),
  deleteCategory: (id: string) =>
    request<{ ok: boolean }>(
      `/api/categories/${id}`,
      { method: "DELETE" },
      true
    ),

  getTestimonials: () => request<Testimonial[]>("/api/testimonials", {}, true),
  createTestimonial: (t: Partial<Testimonial>) =>
    request<Testimonial>(
      "/api/testimonials",
      { method: "POST", body: JSON.stringify(t) },
      true
    ),
  updateTestimonial: (id: string, t: Partial<Testimonial>) =>
    request<Testimonial>(
      `/api/testimonials/${id}`,
      { method: "PUT", body: JSON.stringify(t) },
      true
    ),
  deleteTestimonial: (id: string) =>
    request<{ ok: boolean }>(
      `/api/testimonials/${id}`,
      { method: "DELETE" },
      true
    ),

  getSettings: () => request<SiteSettings>("/api/settings", {}, true),
  saveSettings: (settings: Partial<SiteSettings>) =>
    request<{ ok: boolean }>(
      "/api/settings",
      { method: "PUT", body: JSON.stringify(settings) },
      true
    ),

  uploadImage: async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("image", file);
    const data = await request<{ url: string }>(
      "/api/uploads",
      { method: "POST", body: form },
      true
    );
    return data.url;
  },
};
