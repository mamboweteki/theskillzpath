export const site = {
  name: "SkillzPath",
  domain: "skillzpath.com",
  email: "hello@theskillzpath.com",
  tagline: "Learn skills. Build your future.",
  description:
    "SkillzPath is a practical online skills academy. One monthly membership gives you every published course, portfolio projects, and access to a moderated marketplace of real client opportunities. The campus opens fully on November 17, 2026.",
  launchDate: "2026-11-17T00:00:00Z",
  launchDateLabel: "November 17, 2026",
  launchYear: 2026,
  pricing: {
    earlyBird: 19.99,
    launch: 49.99,
    currency: "USD",
  },
  socials: {
    x: "https://x.com",
    linkedin: "https://linkedin.com",
    youtube: "https://youtube.com",
  },
} as const;

export const stats = [
  { value: "12", label: "Learning campuses" },
  { value: "100+", label: "Courses planned" },
  { value: "1", label: "Monthly membership" },
  { value: "0", label: "Per-course fees" },
] as const;
