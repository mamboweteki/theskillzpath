"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Lock } from "lucide-react";
import { categories } from "@/lib/courses";
import { site } from "@/lib/site";

const COUNTRIES = [
  "Zimbabwe",
  "South Africa",
  "Zambia",
  "Botswana",
  "Mozambique",
  "Malawi",
  "Namibia",
  "Kenya",
  "Nigeria",
  "Ghana",
  "Tanzania",
  "Uganda",
  "Rwanda",
  "Ethiopia",
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "India",
  "Other",
];

const AGE_GROUPS = ["Under 18", "18–24", "25–34", "35–44", "45+"];
const EXPERIENCE = [
  "Complete beginner",
  "Some experience",
  "Intermediate",
  "Advanced",
];
const GOALS = [
  "Get a job",
  "Freelance for clients",
  "Start my own business",
  "Upgrade my current skills",
  "Learn for fun",
];
const SOURCES = [
  "Facebook",
  "Instagram",
  "TikTok",
  "WhatsApp",
  "Twitter / X",
  "YouTube",
  "Friend or family",
  "Google search",
  "Other",
];

const inputClass =
  "h-11 w-full rounded-lg border border-[#0b0b12]/10 bg-white px-3.5 text-[13.5px] text-[#0b0b12] placeholder:text-[#a3a7b7] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-colors hover:border-[#0b0b12]/20 focus:border-[#4f46e5] focus:outline-none";

const labelClass = "mb-1.5 block text-[12px] font-medium text-[#3b3f4d]";

const sectionTitle =
  "mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8b90a3]";

const COUNTRIES_VALUE = COUNTRIES;

export function CheckoutForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("Zimbabwe");
  const [city, setCity] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [interest, setInterest] = useState("");
  const [experience, setExperience] = useState("");
  const [goal, setGoal] = useState("");
  const [source, setSource] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [status, setStatus] = useState<"idle" | "processing" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "processing") return;

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError("Please fill in your first name, last name and email.");
      return;
    }
    if (phone.replace(/\D/g, "").length < 9) {
      setError("Please enter a valid phone number including country code.");
      return;
    }
    if (password && password.length < 8) {
      setError("Use an account password with at least 8 characters.");
      return;
    }
    if (!agreeTerms) {
      setError("You must accept the founding member terms to continue.");
      return;
    }

    setStatus("processing");
    setError("");

    try {
      const response = await fetch("/api/pesepay/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          email: email.trim(),
          password: password.trim() || undefined,
          phone: phone.trim(),
          country,
          city: city.trim(),
          ageGroup,
          interest,
          experience,
          goal,
          source,
          agreeUpdates: true,
          amount: site.pricing.earlyBird,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to initiate payment.");
      }

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        throw new Error("No redirect URL returned.");
      }
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const section = (title: string, children: React.ReactNode) => (
    <div className="rounded-lg border border-[#0b0b12]/[0.07] bg-[#f7f8fc]/70 p-5">
      <p className={sectionTitle}>{title}</p>
      <div className="space-y-3.5">{children}</div>
    </div>
  );

  const field = (
    key: string,
    label: string,
    value: string,
    setValue: (v: string) => void,
    opts?: { type?: string; placeholder?: string; autoComplete?: string; required?: boolean; hint?: string },
  ) => (
    <div>
      <label className={labelClass}>{label}</label>
      <input
        type={opts?.type ?? "text"}
        required={opts?.required}
        autoComplete={opts?.autoComplete}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={opts?.placeholder}
        className={inputClass}
      />
      {opts?.hint ? <p className="mt-1 text-[11px] text-[#8b90a3]">{opts.hint}</p> : null}
    </div>
  );

  const selectField = (
    key: string,
    label: string,
    value: string,
    setValue: (v: string) => void,
    options: string[],
    required = false,
  ) => (
    <div>
      <label className={labelClass}>{label}</label>
      <select
        required={required}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={inputClass}
      >
        {!required ? <option value="">Select…</option> : null}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {section("1. Your details", (
        <>
          <div className="grid gap-3.5 sm:grid-cols-2">
            {field("firstName", "First name *", firstName, setFirstName, { required: true, placeholder: "Tendai", autoComplete: "given-name" })}
            {field("lastName", "Last name *", lastName, setLastName, { required: true, placeholder: "Moyo", autoComplete: "family-name" })}
          </div>
          {field("email", "Email address *", email, setEmail, { type: "email", required: true, placeholder: "you@email.com", autoComplete: "email", hint: "Your receipt and launch reminder will be sent here." })}
          {field("password", "Create a password (optional)", password, setPassword, { type: "password", placeholder: "At least 8 characters", autoComplete: "new-password", hint: "Only needed if you have not created an account yet. It lets you sign in after paying." })}
          {field("phone", "Phone / WhatsApp number *", phone, setPhone, { type: "tel", required: true, placeholder: "+263 79 030 0777", autoComplete: "tel", hint: "Needed for launch updates via WhatsApp." })}
          <div className="grid gap-3.5 sm:grid-cols-2">
            {selectField("country", "Country *", country, setCountry, COUNTRIES_VALUE, true)}
            {field("city", "City / Town", city, setCity, { placeholder: "Harare", autoComplete: "address-level2" })}
          </div>
          {selectField("ageGroup", "Age group", ageGroup, setAgeGroup, AGE_GROUPS)}
        </>
      ))}

      {section("2. Your learning goals", (
        <>
          {selectField("interest", "Skill you are most interested in", interest, setInterest, categories.map((c) => c.name))}
          <div className="grid gap-3.5 sm:grid-cols-2">
            {selectField("experience", "Experience level", experience, setExperience, EXPERIENCE)}
            {selectField("goal", "Main goal", goal, setGoal, GOALS)}
          </div>
          {selectField("source", "How did you hear about us?", source, setSource, SOURCES)}
        </>
      ))}

      <div className="rounded-lg border border-[#0b0b12]/[0.07] bg-[#f7f8fc]/70 p-5">
        <p className={sectionTitle}>3. Founding membership</p>
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#eef0ff] text-[#4f46e5]">
            <Lock className="size-4" />
          </span>
          <div>
            <p className="text-[13px] font-bold text-[#0b0b12]">Secure payment via Pesepay</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-[#5b5f70]">
              One payment of ${site.pricing.earlyBird}. You will be redirected to the
              secure Pesepay checkout to complete your founding member access.
              Supports EcoCash, InnBucks, Omari, Zimswitch, PayGo and cards.
            </p>
          </div>
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-lg border border-[#0b0b12]/[0.07] bg-[#f7f8fc]/70 p-4 text-[12.5px] leading-relaxed text-[#5b5f70]">
        <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-[#4f46e5]" />
        <span>
          I agree to the founding member terms. I understand the campus opens fully on
          November 17, 2026 and that paid work is not guaranteed. *
        </span>
      </label>

      {error ? <p className="text-[13px] font-medium text-red-600" role="alert">{error}</p> : null}

      <button
        type="submit"
        disabled={status === "processing"}
        className="btn btn-primary flex h-12 w-full disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "processing" ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Redirecting to checkout…
          </>
        ) : (
          <>
            Pay ${site.pricing.earlyBird} — Reserve founding access
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>

      <p className="text-center text-[11.5px] leading-relaxed text-[#8b90a3]">
        No card charged until the secure Pesepay checkout completes. Questions?{" "}
        <a href={`mailto:${site.email}`} className="font-medium text-[#4f46e5] underline-offset-4 hover:underline">{site.email}</a>
        . <Link href="/" className="underline-offset-4 hover:underline">Back to home</Link>
      </p>
    </form>
  );
}
