import { getProducts } from "@/lib/api";

export default async function Home() {
  // Runs on the server: the browser receives finished HTML, not an empty shell.
  const { items, total } = await getProducts();

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">Kicks JJ</h1>
      <p className="mb-4 text-sm text-gray-500">{total} shoes</p>

      <ul className="space-y-2">
        {items.map((p) => (
          <li
            key={p.id}
            className={`rounded border p-3 ${p.sold_out ? "opacity-50" : ""}`}
          >
            <p className="font-medium">{p.name}</p>
            <p className="text-sm text-gray-500">
              {p.brand} · KES {p.price.toLocaleString("en-KE")}
              {p.sold_out ? " · Sold out" : ""}
            </p>
            <p className="text-xs text-gray-400">
              Sizes: {p.variants.map((v) => v.size).join(", ") || "none"}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}