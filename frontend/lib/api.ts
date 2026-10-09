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
  
    // Render's free backend sleeps when idle and takes up to a minute to wake.
  // These control how long we keep trying before giving up.
  const RETRY_STATUSES = new Set([502, 503, 504]); // "bad gateway / starting up"
  const RETRY_DELAY_MS = 3000; // pause between attempts
  const ATTEMPT_TIMEOUT_MS = 10000; // one attempt never hangs longer than this
  const MAX_WAIT_MS = 25000; // stay under the hosting time limit

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  async function apiFetch(path: string): Promise<Response> {
    if (!API_URL) {
      throw new Error("NEXT_PUBLIC_API_URL is not set. Check .env.local");
    }

    const started = Date.now();
    let lastResponse: Response | null = null;
    let lastError: unknown = null;

    while (true) {
      const remaining = MAX_WAIT_MS - (Date.now() - started);
      try {
        // no-store: always ask the API, so stock changes show up immediately.
        const res = await fetch(`${API_URL}${path}`, {
          cache: "no-store",
          signal: AbortSignal.timeout(Math.min(ATTEMPT_TIMEOUT_MS, remaining)),
        });
        // Anything except "starting up" is a real answer (including 404): return it
        if (!RETRY_STATUSES.has(res.status)) return res;
        lastResponse = res;
        lastError = null;
      } catch (err) {
        // Network failure or our own timeout: the API may still be waking up
        lastError = err;
        lastResponse = null;
      }

      // Out of time? Give up with whatever we last saw
      if (Date.now() - started + RETRY_DELAY_MS >= MAX_WAIT_MS) break;
      await sleep(RETRY_DELAY_MS);
    }

    if (lastResponse) return lastResponse; // callers turn this into their usual error
    throw lastError instanceof Error ? lastError : new Error("API unreachable");
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
  // The shoe the admin picked for the hero, or null. Never throws: the hero
// is a nice extra, so if this request fails (API asleep, old backend without
// the route, odd response) the home page just uses its normal fallback.
  export async function getFeatured(): Promise<ProductListItem | null> {
    try {
      const res = await apiFetch("/products/featured");
      if (!res.ok) return null;
      const data: ProductListItem | null = await res.json();
      return data;
    } catch {
      return null;
    }
  }