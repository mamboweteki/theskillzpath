import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/lib/site";

const columns = [
  {
    title: "Learn",
    links: [
      { href: "/courses", label: "Campuses" },
      { href: "/learn-to-earn", label: "Learn to earn" },
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#membership", label: "Membership" },
      { href: "https://wa.me/+263790300777", label: "WhatsApp" },
    ],
  },
  {
    title: "Opportunities",
    links: [
      { href: "/opportunities", label: "Client opportunities" },
      { href: "/enroll", label: "Early access" },
      { href: "/#faq", label: "FAQ" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[#0b0b12]/[0.07]">
      <div className="shell py-14">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              className="font-[family-name:var(--font-righteous)] text-[1.5rem] leading-none tracking-[-0.01em] text-[#0b0b12]"
            >
              {site.name}
            </Link>
            <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-[#5b5f70]">
              One monthly membership. Practical digital skills, real portfolio
              projects, and a moderated marketplace of client opportunities.
            </p>
            <a
              href={`mailto:${site.email}`}
              className="mt-4 inline-flex items-center gap-1 text-[13.5px] font-medium text-[#4f46e5] underline-offset-4 hover:underline"
            >
              {site.email}
              <ArrowUpRight className="size-3.5" />
            </a>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#8b90a3]">
                {column.title}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13.5px] text-[#5b5f70] transition-colors hover:text-[#0b0b12]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[#0b0b12]/[0.07] pt-6 text-[12px] text-[#8b90a3] sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {site.launchYear} {site.name}. All rights reserved.
          </p>
          <p className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Full campus opens {site.launchDateLabel}
          </p>
        </div>
      </div>
    </footer>
  );
}
