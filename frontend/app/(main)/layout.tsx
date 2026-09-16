import { AuthRoot } from "@/components/auth/AuthRoot";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

/**
 * (main) layout — shared shell for all public-facing pages.
 * SiteHeader is fixed at the top, so we add pt-16 to push content below it.
 * Footer sticks to the bottom via min-h-screen flex layout.
 *
 * AuthRoot is a thin client boundary that provides auth state (real
 * Supabase or demo-mode citizen) to the whole tree.
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthRoot>
      <div className="flex min-h-screen flex-col bg-citi-black text-white">
        <SiteHeader />
        <main id="main-content" className="flex-1 pt-16" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
      </div>
    </AuthRoot>
  );
}
