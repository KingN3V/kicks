import type { ReactNode } from "react";
import SiteHeader from "@/components/SiteHeader";

// Wraps every public page (home, product). The admin lives outside this group.
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      {/* flex-1 pushes the footer to the bottom of short pages (added next) */}
      <div className="flex-1">{children}</div>
    </>
  );
}