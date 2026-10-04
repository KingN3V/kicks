import Link from "next/link";
import type { FilterOptions } from "@/lib/api";

// The values currently in the URL. They are all strings (or missing),
// because that is what the browser puts in a query string.
export type CurrentFilters = {
  brand?: string;
  category?: string;
  size?: string;
  min_price?: string;
  max_price?: string;
};

type Props = {
  options: FilterOptions;
  current: CurrentFilters;
};

// text-base (16px) stops iPhones zooming in when you tap a field
const field = "mt-1 w-full rounded border bg-transparent px-3 py-2 text-base";

function Select({
  name,
  label,
  values,
  selected,
}: {
  name: string;
  label: string;
  values: string[];
  selected?: string;
}) {
  return (
    <label className="block text-xs text-gray-500">
      {label}
      <select name={name} defaultValue={selected ?? ""} className={field}>
        <option value="">All</option>
        {values.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function Filters({ options, current }: Props) {
  const hasFilters = Object.values(current).some((v) => !!v);

  return (
    // No action = submit to the same page (/). method="get" puts the
    // fields in the URL as ?brand=...&size=...
    <form method="get" className="mb-6 rounded-lg border p-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Select name="brand" label="Brand" values={options.brands} selected={current.brand} />
        <Select name="category" label="Category" values={options.categories} selected={current.category} />
        <Select name="size" label="Size" values={options.sizes} selected={current.size} />

        <label className="block text-xs text-gray-500">
          Min price (KES)
          <input
            type="number"
            name="min_price"
            min={0}
            inputMode="numeric"
            defaultValue={current.min_price ?? ""}
            className={field}
          />
        </label>
        <label className="block text-xs text-gray-500">
          Max price (KES)
          <input
            type="number"
            name="max_price"
            min={0}
            inputMode="numeric"
            defaultValue={current.max_price ?? ""}
            className={field}
          />
        </label>
      </div>

      <div className="mt-3 flex items-center gap-4">
        <button
          type="submit"
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
        >
          Apply
        </button>
        {hasFilters && (
          <Link href="/" className="text-sm text-gray-500 underline">
            Clear filters
          </Link>
        )}
      </div>
    </form>
  );
}