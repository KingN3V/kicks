import Link from "next/link";
import type { CurrentFilters } from "@/components/Filters";

type Props = {
  page: number;
  totalPages: number;
  current: CurrentFilters; // the active filters, so they survive a page change
};

// Build "/?brand=Nike&size=42&page=2" from the active filters + a page number.
function pageHref(current: CurrentFilters, page: number): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(current)) {
    if (value) params.set(key, value); // skip empty filters
  }
  if (page > 1) params.set("page", String(page)); // page 1 = no ?page= needed
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

const button = "rounded-lg border px-4 py-2 text-sm font-medium";
const disabled = `${button} cursor-not-allowed text-gray-400 opacity-60`;

export default function Pagination({ page, totalPages, current }: Props) {
  // One page (or none): nothing to show
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex items-center justify-between gap-3"
    >
      {page > 1 ? (
        <Link href={pageHref(current, page - 1)} className={button}>
          ← Previous
        </Link>
      ) : (
        <span className={disabled} aria-disabled="true">
          ← Previous
        </span>
      )}

      <p className="text-sm text-gray-500">
        Page {page} of {totalPages}
      </p>

      {page < totalPages ? (
        <Link href={pageHref(current, page + 1)} className={button}>
          Next →
        </Link>
      ) : (
        <span className={disabled} aria-disabled="true">
          Next →
        </span>
      )}
    </nav>
  );
}