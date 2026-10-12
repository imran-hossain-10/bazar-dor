import type { Category, Product } from "@/types/bazardor";

const API_BASE_URL =
  "https://openapi.programming-hero.com/api/bazardor";
// "https://openapi.programming-hero.com/api /bazardor"

// Reusable API request function
async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `API request failed with status ${response.status}`
    );
  }

  return (await response.json()) as T;
}

// Get all categories
export async function getCategories(): Promise<Category[]> {
  return request<Category[]>("/categories");
}

// Get all products
export async function getProducts(): Promise<Product[]> {
  return request<Product[]>("/products");
}

// Get a single product by ID
export async function getProductById(
  id: number
): Promise<Product> {
  return request<Product>(`/products/${id}`);
}

// Get products by category
export async function getProductsByCategory(
  category: string
): Promise<Product[]> {
  return request<Product[]>(
    `/products?category=${encodeURIComponent(category)}`
  );
}