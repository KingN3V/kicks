// Types mirror backend/app/schemas.py. Keep them in sync if the API changes.

export type Variant = {
    size: string; // string on purpose: "42.5" works
    stock: number;
  };
  
  export type ProductImage = {
    id: number;
    url: string;
    position: number;
  };
  
  export type ProductListItem = {
    id: number;
    name: string;
    slug: string;
    brand: string | null;
    category: string | null;
    price: number; // whole KES
    sold_out: boolean;
    cover_image: string | null;
    variants: Variant[];
  };
  
  export type ProductDetail = ProductListItem & {
    description: string | null;
    images: ProductImage[];
  };
  
  export type ProductPage = {
    items: ProductListItem[];
    total: number;
    page: number;
    page_size: number;
  };
  
  export type FilterOptions = {
    brands: string[];
    categories: string[];
    sizes: string[];
  };
  
  export type ProductQuery = {
    brand?: string;
    category?: string;
    size?: string;
    min_price?: number;
    max_price?: number;
    page?: number;
    page_size?: number;
  };
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  
  async function apiFetch(path: string): Promise<Response> {
    if (!API_URL) {
      throw new Error("NEXT_PUBLIC_API_URL is not set. Check .env.local");
    }
    // no-store: always ask the API, so stock changes show up immediately.
    // We can add caching later once everything works.
    return fetch(`${API_URL}${path}`, { cache: "no-store" });
  }
  
  export async function getProducts(query: ProductQuery = {}): Promise<ProductPage> {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      // skip empty filters so we don't send ?brand=&size=
      if (value !== undefined && value !== "") params.set(key, String(value));
    }
    const qs = params.toString();
    const res = await apiFetch(`/products${qs ? `?${qs}` : ""}`);
    if (!res.ok) throw new Error(`Failed to load products (${res.status})`);
    return res.json();
  }
  
  export async function getFilters(): Promise<FilterOptions> {
    const res = await apiFetch("/products/filters");
    if (!res.ok) throw new Error(`Failed to load filters (${res.status})`);
    return res.json();
  }
  
  // Returns null when the product doesn't exist or is hidden (the API gives 404 for both)
  export async function getProduct(slug: string): Promise<ProductDetail | null> {
    const res = await apiFetch(`/products/${encodeURIComponent(slug)}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to load product (${res.status})`);
    return res.json();
  }