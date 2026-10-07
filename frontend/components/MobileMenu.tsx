"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaBars, FaXmark } from "react-icons/fa6";

type NavLink = { href: string; label: string };

export default function MobileMenu({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);

  // While the menu is open, the Escape key closes it
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    // md:hidden = only shown below 768px wide
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-10 w-10 items-center justify-center rounded-xs border border-white/40 text-lg hover:border-white"
      >
        {open ? <FaXmark aria-hidden="true" /> : <FaBars aria-hidden="true" />}
      </button>

      {open && (
        <>
          {/* Dim area under the header: tapping it closes the menu */}
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={() => setOpen(false)}
            className="absolute left-0 right-0 top-full h-screen bg-black/60"
          />
          <nav
            id="mobile-menu"
            aria-label="Menu"
            className="absolute left-0 right-0 top-full border-b bg-black"
          >
            <ul className="mx-auto w-full max-w-5xl px-4 py-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block border-b py-4 text-lg last:border-b-0"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}