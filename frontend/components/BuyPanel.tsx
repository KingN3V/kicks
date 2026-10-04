"use client";

import { useState } from "react";
import { FaInstagram, FaWhatsapp } from "react-icons/fa6";
import type { Variant } from "@/lib/api";

type Props = {
  name: string;
  pageUrl: string;
  soldOut: boolean;
  variants: Variant[]; // the page sorts them before passing them in
  whatsapp?: string;
  instagram?: string;
};

export default function BuyPanel({
  name,
  pageUrl,
  soldOut,
  variants,
  whatsapp,
  instagram,
}: Props) {
  // null = nothing chosen yet. Changing it re-renders this component.
  const [size, setSize] = useState<string | null>(null);

  const message = soldOut
    ? `Hi! I saw the ${name} is sold out. Can you get it or something similar? ${pageUrl}`
    : `Hi! I'm interested in the ${name}${size ? ` in size ${size}` : ""}. ${pageUrl}`;

  return (
    <div>
      <h2 className="mb-2 mt-6 text-sm font-medium">Sizes</h2>
      {variants.length === 0 ? (
        <p className="text-sm text-gray-500">No sizes listed.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {variants.map((v) => {
            const outOfStock = v.stock === 0;
            const selected = size === v.size;
            return (
              <li key={v.size}>
                <button
                  type="button"
                  disabled={outOfStock}
                  aria-pressed={selected}
                  // tapping the chosen size again un-selects it
                  onClick={() => setSize(selected ? null : v.size)}
                  className={`min-w-12 rounded border px-3 py-2 text-center text-sm ${
                    outOfStock
                      ? "cursor-not-allowed text-gray-400 line-through opacity-60"
                      : ""
                  } ${selected ? "font-semibold ring-2 ring-current" : ""}`}
                >
                  {v.size}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {!soldOut && !size && variants.length > 0 && (
        <p className="mt-2 text-xs text-gray-500">
          Tap a size to include it in your message.
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-medium text-white"
          >
            <FaWhatsapp className="h-5 w-5" aria-hidden="true" />
            {soldOut ? "Ask about this on WhatsApp" : "Buy on WhatsApp"}
          </a>
        )}
        {instagram && (
          <a
            href={`https://ig.me/m/${instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg border px-4 py-3 font-medium"
          >
            <FaInstagram className="h-5 w-5" aria-hidden="true" />
            Message on Instagram
          </a>
        )}
      </div>
    </div>
  );
}