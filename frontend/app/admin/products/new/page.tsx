"use client";

import { useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import {
  adminFetch,
  AdminApiError,
  type AdminProductDetail,
} from "@/lib/adminApi";

const field = "mt-1 w-full rounded border bg-transparent px-3 py-2 text-base";

// One line in the "Sizes" section. Both values are strings because that is
// what <input> gives us; we convert to numbers when the form is submitted.
type SizeRow = { id: number; size: string; stock: string };

// Each row gets its own id, so React can tell rows apart when one is removed.
let nextRowId = 1;
function newRow(): SizeRow {
  return { id: nextRowId++, size: "", stock: "" };
}

export default function NewProductPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [rows, setRows] = useState<SizeRow[]>(() => [newRow()]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Change one field of one row, leaving the others untouched.
  // We build a NEW array (map) instead of editing the old one: React only
  // re-renders when it sees a new value.
  function updateRow(id: number, changes: Partial<SizeRow>) {
    setRows((current) =>
      current.map((r) => (r.id === id ? { ...r, ...changes } : r)),
    );
  }

  function removeRow(id: number) {
    setRows((current) => current.filter((r) => r.id !== id));
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    // --- Check the form here first, so mistakes get a friendly message ---
    // (the backend checks everything again; this is only for convenience)
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Name is required.");
      return;
    }

    const priceNumber = Number(price);
    if (!Number.isInteger(priceNumber) || priceNumber <= 0) {
      setError("Price must be a whole number above 0.");
      return;
    }

    const variants: { size: string; stock: number }[] = [];
    const seen = new Set<string>();
    for (const row of rows) {
      const size = row.size.trim();
      if (!size) continue; // an empty row is just ignored
      const stock = row.stock === "" ? 0 : Number(row.stock);
      if (!Number.isInteger(stock) || stock < 0) {
        setError(`Stock for size ${size} must be a whole number, 0 or more.`);
        return;
      }
      if (seen.has(size)) {
        setError(`Size ${size} is listed twice.`);
        return;
      }
      seen.add(size);
      variants.push({ size, stock });
    }

    setLoading(true);
    try {
      const created = await adminFetch<AdminProductDetail>("/admin/products", {
        method: "POST",
        json: {
          name: trimmedName,
          // empty text becomes null, so we don't store "" in the database
          brand: brand.trim() || null,
          category: category.trim() || null,
          description: description.trim() || null,
          price: priceNumber,
          is_visible: isVisible,
          variants,
        },
      });
      // Photos are added on the edit screen, so go straight there.
      router.push(`/admin/products/${created.id}`);
    } catch (err) {
      setError(
        err instanceof AdminApiError
          ? err.message
          : "Could not reach the server. Please try again.",
      );
      setLoading(false);
    }
    // On success we leave `loading` true on purpose: the page is about to
    // change, and it stops a second tap from creating a duplicate shoe.
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <h1 className="text-2xl font-bold">Add shoe</h1>
      <p className="mb-6 text-sm text-gray-500">
        You can add photos right after saving.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm text-gray-500">
          Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={150}
            required
            className={field}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm text-gray-500">
            Brand
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              maxLength={80}
              className={field}
            />
          </label>
          <label className="block text-sm text-gray-500">
            Category
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              maxLength={80}
              className={field}
            />
          </label>
        </div>

        <label className="block text-sm text-gray-500">
          Price (KES)
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min={1}
            inputMode="numeric"
            required
            className={field}
          />
        </label>

        <label className="block text-sm text-gray-500">
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={field}
          />
        </label>

        <fieldset>
          <legend className="text-sm text-gray-500">Sizes and stock</legend>
          <div className="mt-1 space-y-2">
            {rows.map((row) => (
              <div key={row.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={row.size}
                  onChange={(e) => updateRow(row.id, { size: e.target.value })}
                  placeholder="Size (e.g. 42)"
                  aria-label="Size"
                  maxLength={10}
                  className="min-w-0 flex-1 rounded border bg-transparent px-3 py-2 text-base"
                />
                <input
                  type="number"
                  value={row.stock}
                  onChange={(e) => updateRow(row.id, { stock: e.target.value })}
                  placeholder="Stock"
                  aria-label="Stock"
                  min={0}
                  inputMode="numeric"
                  className="min-w-0 flex-1 rounded border bg-transparent px-3 py-2 text-base"
                />
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  aria-label="Remove this size"
                  className="shrink-0 rounded border px-3 py-2 text-base text-gray-500"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setRows((current) => [...current, newRow()])}
            className="mt-2 text-sm underline"
          >
            + Add size
          </button>
        </fieldset>

        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={isVisible}
            onChange={(e) => setIsVisible(e.target.checked)}
            className="h-5 w-5"
          />
          Visible on the site
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg border px-4 py-3 font-medium disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save shoe"}
        </button>
      </form>
    </div>
  );
}