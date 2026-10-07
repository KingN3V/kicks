import type { ReactNode } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

// Wraps every public page (home, product). The admin lives outside this group.
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      {/* flex-1 pushes the footer to the bottom of short pages */}
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </>
  );
}