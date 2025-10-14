const BASE_URL = "https://dummyjson.com";

interface DeleteProductResponse {
  isDeleted: boolean;
  deletedOn?: string;
  id?: number;
}

export async function getCategories() {
  const res = await fetch(`${BASE_URL}/products/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function getProductsByCategory(category: string) {
  const res = await fetch(`${BASE_URL}/products/category/${category}`);
  if (!res.ok) throw new Error("Failed to fetch category products");
  const data = await res.json();
  return data.products;
}

export async function getProducts() {
  const res = await fetch(`${BASE_URL}/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  const data = await res.json();
  return data.products;
}

export async function deleteProduct(id: number): Promise<DeleteProductResponse> {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete product");
  }

  return res.json();
}
