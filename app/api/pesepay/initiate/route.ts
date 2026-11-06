import { NextResponse } from "next/server";
import { initiateTransaction } from "@/lib/pesepay";
import { saveMember } from "@/lib/db";
import { isTrustedRequest } from "@/lib/security";
import { site } from "@/lib/site";

export async function POST(request: Request) {
  if (!isTrustedRequest(request)) {
    return NextResponse.json({ error: "Request blocked." }, { status: 403 });
  }

  let body: {
    email?: string;
    name?: string;
    amount?: number;
    password?: string;
    phone?: string;
    country?: string;
    city?: string;
    ageGroup?: string;
    interest?: string;
    experience?: string;
    goal?: string;
    source?: string;
    agreeUpdates?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = (body.email ?? "").trim();
  const name = (body.name ?? "").trim();
  const amount = body.amount ?? site.pricing.earlyBird;

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 422 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const merchantReference = `SF-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  try {
    const result = await initiateTransaction({
      amountDetails: { amount, currencyCode: "USD" },
      reasonForPayment: "SkillzPath founding member access",
      resultUrl: `${baseUrl}/api/pesepay/result`,
      returnUrl: `${baseUrl}/welcome?email=${encodeURIComponent(email)}&ref=${merchantReference}`,
      merchantReference,
      paymentMetadata: {
        customerEmail: email,
        customerName: name,
        customerPhone: body.phone ?? "",
        customerCountry: body.country ?? "",
        customerCity: body.city ?? "",
        ageGroup: body.ageGroup ?? "",
        skillInterest: body.interest ?? "",
        experienceLevel: body.experience ?? "",
        mainGoal: body.goal ?? "",
        heardFrom: body.source ?? "",
        agreeUpdates: String(body.agreeUpdates ?? false),
      },
    });

    // Persist the early-access member while the payment is being processed.
    saveMember({
      email,
      firstName: name.split(" ")[0] ?? "",
      lastName: name.split(" ").slice(1).join(" ") ?? "",
      phone: body.phone ?? "",
      country: body.country ?? "",
      city: body.city ?? "",
      ageGroup: body.ageGroup ?? "",
      interest: body.interest ?? "",
      experience: body.experience ?? "",
      goal: body.goal ?? "",
      source: body.source ?? "",
      agreeUpdates: body.agreeUpdates ?? true,
      password: body.password?.trim() || undefined,
      paymentStatus: "PENDING",
      accessStatus: "RESERVED",
      amountPaid: 0,
      referenceNumber: merchantReference,
    });

    const res = NextResponse.json({
      ok: true,
      referenceNumber: result.referenceNumber,
      redirectUrl: result.redirectUrl,
      pollUrl: result.pollUrl,
      merchantReference,
    });
    // Remember the transaction so /welcome can verify it server-side.
    const cookieOptions = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    };
    res.cookies.set("sp_ref", result.referenceNumber, cookieOptions);
    res.cookies.set("sp_email", email, cookieOptions);
    return res;
  } catch (error) {
    console.error("[pesepay] initiate error:", error);
    const message = error instanceof Error ? error.message : "";
    const databaseProblem = /database|sqlite|EROFS|EACCES|ENOENT/i.test(message);
    return NextResponse.json(
      {
        error: databaseProblem
          ? "We could not start checkout right now. Please try again in a moment."
          : message || "Failed to initiate payment.",
      },
      { status: 500 },
    );
  }
}
