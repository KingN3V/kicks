"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getToken, logout } from "@/lib/adminApi";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // The login page lives inside /admin too, so it must not be guarded
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (isLogin) return;
    if (!getToken()) {
      router.replace("/admin/login"); // no token: go and log in
      return;
    }
    setReady(true);
  }, [isLogin, router]);

  if (isLogin) return <>{children}</>;
  if (!ready) return null; // checking the token: show nothing, so admin content never flashes

  return (
    <div>
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 p-4">
          <Link href="/admin" className="font-bold">
            Kicks JJ admin
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin" className="py-2">
              Shoes
            </Link>
            <Link href="/admin/products/new" className="py-2">
              Add shoe
            </Link>
            <Link href="/" target="_blank" className="py-2 text-gray-500">
              View site
            </Link>
            <button
              type="button"
              onClick={logout}
              className="py-2 text-gray-500 underline"
            >
              Log out
            </button>
          </nav>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl p-4">{children}</div>
    </div>
  );
}