"use client";

import { useEffect, useState, type ChangeEvent, type SubmitEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  adminFetch,
  AdminApiError,
  type AdminProductDetail,
} from "@/lib/adminApi";
import type { Variant } from "@/lib/api";

const field = "mt-1 w-full rounded border bg-transparent px-3 py-2 text-base";
const smallButton = "rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-40";

function errorText(err: unknown): string {
  return err instanceof AdminApiError
    ? err.message
    : "Could not reach the server. Please try again.";
}

// Numeric sizes in numeric order ("9" < "10" < "42.5"), anything else after
function sizeKey(size: string): [number, number, string] {
  const n = parseFloat(size);
  return Number.isNaN(n) ? [1, 0, size] : [0, n, size];
}

function sortVariants(variants: Variant[]): Variant[] {
  return [...variants].sort((a, b) => {
    const [ga, na, sa] = sizeKey(a.size);
    const [gb, nb, sb] = sizeKey(b.size);
    return ga - gb || na - nb || sa.localeCompare(sb);
  });
}

// Every section gets the current shoe, and calls onChange with the fresh
// copy the API sends back after a save. The page keeps that one copy.
type SectionProps = {
  product: AdminProductDetail;
  onChange: (product: AdminProductDetail) => void;
};

// ---------------------------------------------------------------------------
// The page: loads the shoe, then hands it to <EditProduct>
// ---------------------------------------------------------------------------

// The answer from the API, tagged with the shoe id it belongs to
type Loaded = { id: string; product?: AdminProductDetail; error?: string };

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>(); // the [id] part of the URL
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;

    adminFetch<AdminProductDetail>(`/admin/products/${id}`)
      .then((product) => {
        if (!cancelled) setLoaded({ id, product });
      })
      .catch((err) => {
        if (!cancelled) setLoaded({ id, error: errorText(err) });
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // An answer for a different shoe counts as "still loading"
  const current = loaded?.id === id ? loaded : null;

  if (!current) {
    return <p className="py-8 text-center text-gray-500">Loading…</p>;
  }
  if (!current.product) {
    return (
      <div className="py-8 text-center">
        <p role="alert" className="text-red-500">
          {current.error}
        </p>
        <Link href="/admin" className="mt-4 inline-block text-sm underline">
          ← All shoes
        </Link>
      </div>
    );
  }

  return (
    <EditProduct
      product={current.product}
      onChange={(product) => setLoaded({ id, product })}
    />
  );
}

// ---------------------------------------------------------------------------
// The screen itself
// ---------------------------------------------------------------------------

function EditProduct({ product, onChange }: SectionProps) {
  return (
    <div className="mx-auto w-full max-w-xl space-y-8">
      <div>
        <Link href="/admin" className="text-sm text-gray-500">
          ← All shoes
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{product.name}</h1>
        {product.is_visible && (
          <Link
            href={`/products/${product.slug}`}
            target="_blank"
            className="text-sm text-gray-500 underline"
          >
            View on site
          </Link>
        )}
      </div>

      <VisibilityToggle product={product} onChange={onChange} />
      <FeaturedToggle product={product} onChange={onChange} />
      <PhotosSection product={product} onChange={onChange} />
      <DetailsForm product={product} onChange={onChange} />
      <StockSection product={product} onChange={onChange} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Visible / hidden: saves the moment you tap it
// ---------------------------------------------------------------------------

function VisibilityToggle({ product, onChange }: SectionProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setSaving(true);
    setError(null);
    try {
      const updated = await adminFetch<AdminProductDetail>(
        `/admin/products/${product.id}`,
        { method: "PATCH", json: { is_visible: !product.is_visible } },
      );
      onChange(updated);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="flex items-center justify-between gap-3 rounded-lg border p-3">
      <div>
        <p className="font-medium">
          {product.is_visible ? "Visible on the site" : "Hidden from the site"}
        </p>
        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={toggle}
        disabled={saving}
        className={smallButton}
      >
        {saving ? "Saving…" : product.is_visible ? "Hide" : "Show"}
      </button>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Featured on the home page: saves the moment you tap it
// ---------------------------------------------------------------------------

function FeaturedToggle({ product, onChange }: SectionProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setSaving(true);
    setError(null);
    try {
      // The backend un-features every other shoe when this one is featured
      const updated = await adminFetch<AdminProductDetail>(
        `/admin/products/${product.id}`,
        { method: "PATCH", json: { is_featured: !product.is_featured } },
      );
      onChange(updated);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setSaving(false);
    }
  }

  // The home page only shows a featured shoe it can sell: visible, in stock, with a photo
  let note: string | null = null;
  if (product.is_featured) {
    if (!product.is_visible) {
      note = "This shoe is hidden, so the home page shows another shoe until you make it visible.";
    } else if (product.sold_out) {
      note = "This shoe is sold out, so the home page shows another shoe until it is back in stock.";
    } else if (product.images.length === 0) {
      note = "This shoe has no photo yet, so the home page shows another shoe until you add one.";
    } else {
      note = "Its first photo is the one shown. Use the arrows in Photos to change it.";
    }
  } else {
    note = "Featuring this shoe replaces the one currently on the home page.";
  }

  return (
    <section className="flex items-center justify-between gap-3 rounded-lg border p-3">
      <div>
        <p className="font-medium">
          {product.is_featured
            ? "Featured on the home page"
            : "Not featured on the home page"}
        </p>
        <p className="text-sm text-gray-500">{note}</p>
        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={toggle}
        disabled={saving}
        className={`${smallButton} shrink-0`}
      >
        {saving ? "Saving…" : product.is_featured ? "Remove" : "Feature"}
      </button>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Name, brand, category, price, description
// ---------------------------------------------------------------------------

function DetailsForm({ product, onChange }: SectionProps) {
  // The form starts with the shoe's current values. After that it keeps
  // its own copy, so typing doesn't depend on the API.
  const [name, setName] = useState(product.name);
  const [brand, setBrand] = useState(product.brand ?? "");
  const [category, setCategory] = useState(product.category ?? "");
  const [price, setPrice] = useState(String(product.price));
  const [description, setDescription] = useState(product.description ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Has anything been typed that isn't saved yet?
  const dirty =
    name !== product.name ||
    brand !== (product.brand ?? "") ||
    category !== (product.category ?? "") ||
    price !== String(product.price) ||
    description !== (product.description ?? "");

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);

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

    setSaving(true);
    try {
      const updated = await adminFetch<AdminProductDetail>(
        `/admin/products/${product.id}`,
        {
          method: "PATCH",
          json: {
            name: trimmedName,
            brand: brand.trim() || null,
            category: category.trim() || null,
            description: description.trim() || null,
            price: priceNumber,
          },
        },
      );
      // Show the cleaned-up values the API stored (trimmed, "" -> empty)
      setName(updated.name);
      setBrand(updated.brand ?? "");
      setCategory(updated.category ?? "");
      setPrice(String(updated.price));
      setDescription(updated.description ?? "");
      setSaved(true);
      onChange(updated);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Details</h2>
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

        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}
        {saved && !dirty && <p className="text-sm text-green-500">Saved.</p>}

        <button
          type="submit"
          disabled={saving || !dirty}
          className="w-full rounded-lg border px-4 py-3 font-medium disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Stock per size
// ---------------------------------------------------------------------------

function StockSection({ product, onChange }: SectionProps) {
  const variants = sortVariants(product.variants);

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Sizes and stock</h2>

      {variants.length === 0 ? (
        <p className="mb-3 text-sm text-gray-500">No sizes yet.</p>
      ) : (
        <ul className="mb-4 space-y-3">
          {variants.map((v) => (
            <StockRow
              key={v.size}
              productId={product.id}
              variant={v}
              onChange={onChange}
            />
          ))}
        </ul>
      )}

      <AddSize product={product} onChange={onChange} />
    </section>
  );
}

function StockRow({
  productId,
  variant,
  onChange,
}: {
  productId: number;
  variant: Variant;
  onChange: (product: AdminProductDetail) => void;
}) {
  const [value, setValue] = useState(String(variant.stock));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = value !== String(variant.stock);

  async function save() {
    const stock = Number(value);
    if (value === "" || !Number.isInteger(stock) || stock < 0) {
      setError("Stock must be a whole number, 0 or more.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      // PUT sets the stock for this one size
      const updated = await adminFetch<AdminProductDetail>(
        `/admin/products/${productId}/variants/${encodeURIComponent(variant.size)}`,
        { method: "PUT", json: { stock } },
      );
      onChange(updated);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <li>
      <div className="flex items-center gap-3">
        <span className="w-16 shrink-0 font-medium">{variant.size}</span>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          min={0}
          inputMode="numeric"
          aria-label={`Stock for size ${variant.size}`}
          className="min-w-0 flex-1 rounded border bg-transparent px-3 py-2 text-base"
        />
        <button
          type="button"
          onClick={save}
          disabled={!dirty || saving}
          className={smallButton}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </li>
  );
}

function AddSize({ product, onChange }: SectionProps) {
  const [size, setSize] = useState("");
  const [stock, setStock] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const trimmedSize = size.trim();
    if (!trimmedSize) {
      setError("Enter a size.");
      return;
    }
    if (product.variants.some((v) => v.size === trimmedSize)) {
      setError(`Size ${trimmedSize} already exists. Change its stock above.`);
      return;
    }
    const stockNumber = stock === "" ? 0 : Number(stock);
    if (!Number.isInteger(stockNumber) || stockNumber < 0) {
      setError("Stock must be a whole number, 0 or more.");
      return;
    }

    setSaving(true);
    try {
      // The same PUT as above: it creates the size if the shoe doesn't have it
      const updated = await adminFetch<AdminProductDetail>(
        `/admin/products/${product.id}/variants/${encodeURIComponent(trimmedSize)}`,
        { method: "PUT", json: { stock: stockNumber } },
      );
      setSize("");
      setStock("");
      onChange(updated);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="mb-1 text-sm text-gray-500">Add a size</p>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          placeholder="Size"
          aria-label="New size"
          maxLength={10}
          className="min-w-0 flex-1 rounded border bg-transparent px-3 py-2 text-base"
        />
        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          placeholder="Stock"
          aria-label="Stock for the new size"
          min={0}
          inputMode="numeric"
          className="min-w-0 flex-1 rounded border bg-transparent px-3 py-2 text-base"
        />
        <button type="submit" disabled={saving} className={smallButton}>
          {saving ? "Adding…" : "Add"}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </form>
  );
}
// ---------------------------------------------------------------------------
// Photos: upload, delete, reorder (first photo = cover)
// ---------------------------------------------------------------------------

const MAX_BYTES = 10 * 1024 * 1024; // same limit as the backend

// next/image only loads hosts listed in next.config.ts (same rule as everywhere else)
function isLoadable(url: string): boolean {
  return url.startsWith("https://res.cloudinary.com/");
}

function PhotosSection({ product, onChange }: SectionProps) {
  const images = product.images; // the API already sends them in order
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Runs one action with the busy flag on, so buttons are disabled meanwhile
  // (two reorders at once could overwrite each other).
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
      setStatus(null);
    }
  }

  async function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // so choosing the same file again still triggers onChange
    if (files.length === 0) return;

    const tooBig = files.find((f) => f.size > MAX_BYTES);
    if (tooBig) {
      setError(`${tooBig.name} is larger than 10 MB.`);
      return;
    }

    await run(async () => {
      // One at a time: upload to Cloudinary, then attach the URL to this shoe
      for (let i = 0; i < files.length; i++) {
        setStatus(`Uploading ${i + 1} of ${files.length}…`);

        const form = new FormData();
        form.append("file", files[i]);
        const uploaded = await adminFetch<{ url: string; public_id: string }>(
          "/admin/uploads",
          { method: "POST", body: form },
        );

        const updated = await adminFetch<AdminProductDetail>(
          `/admin/products/${product.id}/images`,
          { method: "POST", json: { url: uploaded.url } },
        );
        onChange(updated);
      }
    });
  }

  async function remove(imageId: number) {
    if (!window.confirm("Delete this photo?")) return;
    await run(async () => {
      const updated = await adminFetch<AdminProductDetail>(
        `/admin/products/${product.id}/images/${imageId}`,
        { method: "DELETE" },
      );
      onChange(updated);
    });
  }

  async function move(index: number, direction: -1 | 1) {
    // The backend wants EVERY image id, in the order you want
    const ids = images.map((img) => img.id);
    const target = index + direction;
    [ids[index], ids[target]] = [ids[target], ids[index]]; // swap the two

    await run(async () => {
      const updated = await adminFetch<AdminProductDetail>(
        `/admin/products/${product.id}/images/order`,
        { method: "PUT", json: { image_ids: ids } },
      );
      onChange(updated);
    });
  }

  return (
    <section>
      <h2 className="mb-1 text-lg font-semibold">Photos</h2>
      <p className="mb-3 text-sm text-gray-500">
        The first photo is the cover. Use the arrows to reorder.
      </p>

      {images.length === 0 ? (
        <p className="mb-3 text-sm text-gray-500">No photos yet.</p>
      ) : (
        <ul className="mb-4 space-y-3">
          {images.map((img, index) => (
            <li key={img.id} className="flex items-center gap-3 rounded-lg border p-2">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-gray-100">
                {isLoadable(img.url) ? (
                  <Image
                    src={img.url}
                    alt={`${product.name} photo ${index + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-xs text-gray-400">
                    No photo
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                {index === 0 && (
                  <span className="rounded bg-black px-2 py-1 text-xs font-medium text-white">
                    Cover
                  </span>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={busy || index === 0}
                  aria-label="Move photo earlier"
                  className={smallButton}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={busy || index === images.length - 1}
                  aria-label="Move photo later"
                  className={smallButton}
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(img.id)}
                  disabled={busy}
                  className={`${smallButton} text-red-500`}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* The real file input is hidden; the label is the button the owner taps */}
      <label
        className={`${smallButton} inline-block cursor-pointer ${
          busy ? "pointer-events-none opacity-40" : ""
        }`}
      >
        Add photos
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFiles}
          disabled={busy}
          className="sr-only"
        />
      </label>

      {status && <p className="mt-2 text-sm text-gray-500">{status}</p>}
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-500">
          {error}
        </p>
      )}
    </section>
  );
}