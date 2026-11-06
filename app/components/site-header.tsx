"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { site } from "@/lib/site";

const navLinkClass =
  "rounded-full px-3 py-2 text-[13px] font-medium text-[#3b3f4d] transition-colors hover:bg-white/70 hover:text-[#0b0b12] xl:text-[13.5px]";

const secondaryButtonClass =
  "inline-flex h-9 items-center justify-center rounded-full border border-[#0b0b12]/10 bg-white/70 px-4 text-[13px] font-medium text-[#0b0b12] transition-colors hover:border-[#0b0b12]/20 hover:bg-white";

const primaryButtonClass =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-[#4f46e5] px-4 text-[13px] font-medium text-white shadow-[0_10px_24px_-12px_rgba(79,70,229,0.75)] transition-colors hover:bg-[#4338ca]";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setMemberEmail(data?.member?.email ?? null);
      })
      .catch(() => {
        if (!cancelled) setMemberEmail(null);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } finally {
      setMemberEmail(null);
      setOpen(false);
      setSigningOut(false);
      router.replace("/");
      router.refresh();
    }
  }

  return (
    <header className="sticky top-0 z-50">
      <div className="border-b border-[#0b0b12]/[0.06] bg-[#eef0ff]/85 backdrop-blur-xl">
        <div className="shell flex h-16 items-center justify-between gap-2 sm:gap-4">
          <Link
            href={memberEmail ? "/dashboard" : "/"}
            className="shrink-0 font-[family-name:var(--font-righteous)] text-[1.3rem] leading-none tracking-[-0.01em] text-[#0b0b12] sm:text-[1.5rem]"
          >
            {site.name}
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex" aria-label="Main">
            <Link href="/courses" className={navLinkClass}>
              Campuses
            </Link>
            <Link href="/opportunities" className={navLinkClass}>
              Client Opportunities
            </Link>
            <Link href="/learn-to-earn" className={navLinkClass}>
              Learn to earn
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            {memberEmail ? (
              <>
                <Link href="/dashboard" className={`${secondaryButtonClass} max-lg:hidden`}>
                  <LayoutDashboard className="size-4" />
                  My campus
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className={`${secondaryButtonClass} max-lg:hidden`}
                >
                  <LogOut className="size-4" />
                  {signingOut ? "Signing out" : "Log out"}
                </button>
              </>
            ) : (
              <>
                <Link href="/signin" className={`${secondaryButtonClass} max-sm:hidden`}>
                  Sign in
                </Link>
                <Link href="/enroll" className={`${primaryButtonClass} max-sm:hidden`}>
                  Join early access
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </>
            )}

            {/* Compact action so the header always fits on small screens. */}
            {memberEmail ? (
              <Link href="/dashboard" className={`${primaryButtonClass} lg:hidden`}>
                <LayoutDashboard className="size-4" />
                Campus
              </Link>
            ) : (
              <Link href="/enroll" className={`${primaryButtonClass} sm:hidden`}>
                Join
                <ArrowUpRight className="size-3.5" />
              </Link>
            )}

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-nav"
              className="inline-flex size-10 items-center justify-center rounded-full border border-[#0b0b12]/10 bg-white/70 text-[#0b0b12] transition-colors hover:bg-white lg:hidden"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="border-b border-[#0b0b12]/[0.06] bg-white/95 backdrop-blur-2xl lg:hidden"
        >
          <nav className="shell flex flex-col gap-1 py-4" aria-label="Mobile">
            <Link
              href="/courses"
              className="rounded-xl px-3 py-3 text-[14px] font-medium text-[#3b3f4d] transition-colors hover:bg-[#f2f3fb]"
            >
              Campuses
            </Link>
            <Link
              href="/opportunities"
              className="rounded-xl px-3 py-3 text-[14px] font-medium text-[#3b3f4d] transition-colors hover:bg-[#f2f3fb]"
            >
              Client Opportunities
            </Link>
            <Link
              href="/learn-to-earn"
              className="rounded-xl px-3 py-3 text-[14px] font-medium text-[#3b3f4d] transition-colors hover:bg-[#f2f3fb]"
            >
              Learn to earn
            </Link>

            <div className="mt-2 grid gap-2 border-t border-[#0b0b12]/[0.06] pt-3">
              {memberEmail ? (
                <>
                  <Link href="/dashboard" className={`${primaryButtonClass} h-11 w-full`}>
                    <LayoutDashboard className="size-4" />
                    My campus
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className={`${secondaryButtonClass} h-11 w-full`}
                  >
                    <LogOut className="size-4" />
                    {signingOut ? "Signing out" : "Log out"}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/signin" className={`${secondaryButtonClass} h-11 w-full`}>
                    Sign in
                  </Link>
                  <Link href="/enroll" className={`${primaryButtonClass} h-11 w-full`}>
                    Join early access
                    <ArrowUpRight className="size-4" />
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
