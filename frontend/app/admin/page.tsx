"use client";

import { useEffect, useState, type SubmitEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  adminFetch,
  type AdminProductListItem,
  type AdminProductPage,
} from "@/lib/adminApi";

const PAGE_SIZE = 20;

type Visibility = "all" | "visible" | "hidden";

// One answer from the API, tagged with the request it belongs to (the "key")
type Result = { key: string; data?: AdminProductPage; error?: string };

// next/image only loads hosts listed in next.config.ts (same rule as the public site)
function isLoadable(url: string | null): url is string {
  return !!url && url.startsWith("https://res.cloudinary.com/");
}

// "41 (2), 43 (1)" or "Sold out"
function stockText(p: AdminProductListItem): string {
  const inStock = p.variants.filter((v) => v.stock > 0);
  if (inStock.length === 0) return "Sold out";
  return inStock.map((v) => `${v.size} (${v.stock})`).join(", ");
}

const control = "rounded border bg-transparent px-3 py-2 text-base";

export default function AdminHome() {
  const [search, setSearch] = useState(""); // what is typed in the box
  const [appliedSearch, setAppliedSearch] = useState(""); // what was actually submitted
  const [visibility, setVisibility] = useState<Visibility>("all");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Result | null>(null);

  // Describes what we WANT on screen. When it differs from result.key, we are loading.
  const key = `${appliedSearch}|${visibility}|${page}`;
  const loading = result === null || result.key !== key;

  useEffect(() => {
    let cancelled = false;

    const params = new URLSearchParams({
      page: String(page),
      page_size: String(PAGE_SIZE),
    });
    if (appliedSearch) params.set("q", appliedSearch);
    if (visibility !== "all") {
      params.set("is_visible", visibility === "visible" ? "true" : "false");
    }

    adminFetch<AdminProductPage>(`/admin/products?${params}`)
      .then((data) => {
        if (!cancelled) setResult({ key, data });
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({
            key,
            error: err instanceof Error ? err.message : "Something went wrong",
          });
        }
      });

    // If the filters change before the answer arrives, ignore the old answer
    return () => {
      cancelled = true;
    };
  }, [key, appliedSearch, visibility, page]);

  function handleSearch(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setPage(1); // a new search always starts at page 1
    setAppliedSearch(search.trim());
  }

  const data = result?.data;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Shoes</h1>
          {data && <p className="text-sm text-gray-500">{data.total} total</p>}
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-lg border px-4 py-2 text-sm font-medium"
        >
          + Add shoe
        </Link>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or brand"
            className={`${control} min-w-0 flex-1`}
          />
          <button type="submit" className="rounded-lg border px-4 py-2 text-sm font-medium">
            Search
          </button>
        </form>

        <select
          value={visibility}
          onChange={(e) => {
            setVisibility(e.target.value as Visibility);
            setPage(1);
          }}
          aria-label="Filter by visibility"
          className={control}
        >
          <option value="all">All shoes</option>
          <option value="visible">Visible only</option>
          <option value="hidden">Hidden only</option>
        </select>
      </div>

      {result?.error && (
        <p role="alert" className="mb-4 text-sm text-red-500">
          {result.error}
        </p>
      )}

      {loading && !result?.error ? (
        <p className="py-8 text-center text-gray-500">Loading…</p>
      ) : data && data.items.length === 0 ? (
        <p className="py-8 text-center text-gray-500">No shoes found.</p>
      ) : (
        <ul className="space-y-2">
          {data?.items.map((p) => (
            <li key={p.id}>
              <Link
                href={`/admin/products/${p.id}`}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-gray-100">
                  {isLoadable(p.cover_image) ? (
                    <Image
                      src={p.cover_image}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-xs text-gray-400">
                      No photo
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="truncate text-xs text-gray-500">
                    {[p.brand, p.category].filter(Boolean).join(" · ") || "No brand"}
                  </p>
                  <p className="text-sm">KES {p.price.toLocaleString("en-KE")}</p>
                  <p className="truncate text-xs text-gray-500">{stockText(p)}</p>
                </div>

                {!p.is_visible && (
                  <span className="shrink-0 rounded bg-gray-500 px-2 py-1 text-xs text-white">
                    Hidden
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setPage((p) => p - 1)}
            disabled={page <= 1}
            className="rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-40"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
            className="rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}