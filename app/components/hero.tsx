import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  Briefcase,
  Layers,
  LockKeyhole,
  User,
} from "lucide-react";
import { Countdown } from "@/app/components/countdown";
import { Reveal } from "@/app/components/reveal";
import { RotatingHeadline } from "@/app/components/rotating-headline";
import { categories } from "@/lib/courses";
import { site } from "@/lib/site";

const courseCount = categories.reduce(
  (total, category) => total + category.courses.length,
  0,
);

const included = [
  { icon: BookOpen, label: `${courseCount} courses across ${categories.length} campuses` },
  { icon: Layers, label: "Portfolio projects and assessments" },
  { icon: Briefcase, label: "Moderated client opportunity board" },
  { icon: BadgeCheck, label: "Certificates on completed requirements" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" aria-hidden />

      <div className="shell relative grid gap-14 pb-20 pt-14 sm:pb-24 sm:pt-20 lg:grid-cols-[1.06fr_0.94fr] lg:items-center lg:gap-12 lg:pb-28">
        <div>
          <Reveal>
            <p className="eyebrow">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
              Founding access open
            </p>
          </Reveal>

          <Reveal delay={70}>
            <h1 className="mt-6 text-[2.7rem] font-semibold leading-[0.98] tracking-[-0.045em] text-[#0b0b12] sm:text-[3.6rem] lg:text-[4.15rem]">
              Learn skills.
              <br />
              Build your future.
              <br />
              <RotatingHeadline />
            </h1>
          </Reveal>

          <Reveal delay={140}>
            <p className="mt-6 max-w-xl text-[15.5px] leading-relaxed text-[#5b5f70] sm:text-[16.5px]">
              One monthly membership. You will be taught real technical skills
              — AI, web design, data, video and more — through focused courses
              and hands-on projects. Then you get online ways to make money:
              paid work inside our platform, or building your freelance career
              outside it. No degree required — just a few focused hours a week.
            </p>
          </Reveal>

          <Reveal delay={210}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/enroll" className="btn btn-primary">
                Join early access
                <ArrowUpRight className="size-4" />
              </Link>
              <Link href="/courses" className="btn btn-secondary">
                Explore the campuses
              </Link>
            </div>
          </Reveal>

          <Reveal delay={280}>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-[#5b5f70]">
              <span className="flex items-center gap-1.5">
                <LockKeyhole className="size-3.5 text-[#4f46e5]" />
                One payment of ${site.pricing.earlyBird} secures your founding seat
              </span>
              <span className="hidden h-3 w-px bg-[#0b0b12]/10 sm:block" />
              <span>Founding price locked until launch</span>
            </div>
          </Reveal>
        </div>

        <Reveal delay={180} direction="scale">
          <div className="relative mx-auto w-full max-w-[26rem]">
            <div
              className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-[#6366f1]/20 via-[#a855f7]/10 to-transparent blur-2xl"
              aria-hidden
            />

            <div className="absolute inset-x-0 top-0 z-0 h-44 overflow-hidden rounded-[1.8rem]" aria-hidden>
              <Image
                src="/images/freelancer-cafe.jpg"
                alt=""
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 26rem"
                className="object-cover"
              />
            </div>

            <div className="glass relative z-10 rounded-[1.8rem] p-2">
              <div className="rounded-[1.45rem] border border-white/80 bg-white/80 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#8b90a3]">
                      Founding membership
                    </p>
                    <p className="mt-1 text-[13px] font-medium text-[#0b0b12]">
                      One membership. Everything included.
                    </p>
                  </div>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-700">
                    Open
                  </span>
                </div>

                <div className="mt-6 flex items-end gap-2">
                  <span className="font-mono text-[2.9rem] font-semibold leading-none tracking-[-0.03em] text-[#0b0b12]">
                    ${site.pricing.earlyBird}
                  </span>
                  <div className="pb-1">
                    <p className="text-[12px] font-medium text-[#5b5f70]">/ month</p>
                    <p className="text-[11px] text-[#8b90a3] line-through">
                      ${site.pricing.launch} after launch
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3 border-t border-[#0b0b12]/[0.07] pt-5">
                  {included.map((item) => (
                    <div key={item.label} className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-[#eef0ff] text-[#4f46e5]">
                        <item.icon className="size-3.5" strokeWidth={2} />
                      </span>
                      <span className="text-[12.5px] leading-relaxed text-[#3b3f4d]">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-xl border border-[#0b0b12]/[0.06] bg-[#f7f8fc]/80 p-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#8b90a3]">
                      Campus opens
                    </p>
                    <p className="text-[11.5px] font-medium text-[#0b0b12]">
                      {site.launchDateLabel}
                    </p>
                  </div>
                  <Countdown target={site.launchDate} className="mt-2.5" />
                </div>

                <Link
                  href="/enroll"
                  className="btn btn-primary mt-5 w-full"
                >
                  Reserve your founding seat
                  <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </div>

            <div className="glass-soft absolute -bottom-5 -left-4 hidden items-center gap-2.5 rounded-2xl px-3.5 py-2.5 sm:flex animate-float">
              <span className="flex size-7 items-center justify-center rounded-full bg-[#eef0ff] text-[#4f46e5]">
                <BadgeCheck className="size-4" />
              </span>
              <div>
                <p className="text-[11.5px] font-medium text-[#0b0b12]">
                  Built for real work
                </p>
                <p className="text-[10.5px] text-[#8b90a3]">
                  Projects, not just videos
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
