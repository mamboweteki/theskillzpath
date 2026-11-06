import { DatabaseSync } from "node:sqlite";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { site } from "./site";

/**
 * Thin data layer for SkillzPath using the built-in SQLite engine
 * (node:sqlite, available in Node 22.5+). The database file lives at
 * DATABASE_PATH and defaults to ./data/skillzpath.db.
 *
 * Tables:
 *  - members:  early-access / founding members who paid (or attempted to pay)
 *  - waitlist: email-only early-access reservations collected before launch
 */

let db: DatabaseSync | null = null;
let dbPath: string | null = null;

/**
 * Serverless platforms (Vercel included) mount the project directory
 * read-only and only allow writes inside the OS temp directory. We therefore
 * try the configured path first and fall back to the temp directory instead of
 * throwing "unable to open database file" at request time.
 */
function candidateDatabasePaths(): string[] {
  const configured = process.env.DATABASE_PATH?.trim();
  const home = path.join(os.homedir(), ".skillzpath", "skillzpath.db");
  const temp = path.join(os.tmpdir(), "skillzpath.db");
  const candidates = configured ? [configured] : [home];
  candidates.push(temp);
  return Array.from(new Set(candidates));
}

function resolveDatabasePath(): string {
  for (const candidate of candidateDatabasePaths()) {
    const absolute = path.isAbsolute(candidate)
      ? candidate
      : path.join(/*turbopackIgnore: true*/ process.cwd(), candidate);
    try {
      const directory = path.dirname(absolute);
      fs.mkdirSync(directory, { recursive: true });
      fs.accessSync(directory, fs.constants.W_OK);
      return absolute;
    } catch {
      // Directory is missing or read-only. Try the next candidate.
    }
  }
  // The temp directory is always writable on supported hosts.
  return path.join(os.tmpdir(), "skillzpath.db");
}

function ensureColumn(
  database: DatabaseSync,
  table: string,
  column: string,
  definition: string,
): void {
  const columns = database
    .prepare(`PRAGMA table_info(${table})`)
    .all() as Record<string, unknown>[];
  const exists = columns.some((entry) => String(entry.name) === column);
  if (!exists) {
    database.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function migrate(database: DatabaseSync): void {
  // Databases created before password sign in existed are missing this column.
  ensureColumn(database, "members", "password_hash", "TEXT NOT NULL DEFAULT ''");
}

function openDatabase(absolutePath: string): DatabaseSync {
  const database = new DatabaseSync(absolutePath);
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      first_name TEXT NOT NULL DEFAULT '',
      last_name TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      country TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL DEFAULT '',
      age_group TEXT NOT NULL DEFAULT '',
      interest TEXT NOT NULL DEFAULT '',
      experience TEXT NOT NULL DEFAULT '',
      goal TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT '',
      agree_updates INTEGER NOT NULL DEFAULT 1,
      payment_status TEXT NOT NULL DEFAULT 'PENDING',
      access_status TEXT NOT NULL DEFAULT 'RESERVED',
      amount_paid REAL NOT NULL DEFAULT 0,
      reference_number TEXT NOT NULL DEFAULT '',
      password_hash TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS waitlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );
  `);
  migrate(database);
  return database;
}

function getDb(): DatabaseSync {
  if (db) return db;

  const errors: string[] = [];
  for (const candidate of candidateDatabasePaths()) {
    const absolute = path.isAbsolute(candidate)
      ? candidate
      : path.join(/*turbopackIgnore: true*/ process.cwd(), candidate);
    try {
      fs.mkdirSync(path.dirname(absolute), { recursive: true });
      fs.accessSync(path.dirname(absolute), fs.constants.W_OK);
      const database = openDatabase(absolute);
      db = database;
      dbPath = absolute;
      return db;
    } catch (error) {
      errors.push(`${absolute}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const fallback = resolveDatabasePath();
  try {
    const database = openDatabase(fallback);
    db = database;
    dbPath = fallback;
    return db;
  } catch (error) {
    errors.push(`${fallback}: ${error instanceof Error ? error.message : String(error)}`);
  }

  throw new Error(`Unable to open the SkillzPath database. ${errors.join(" | ")}`);
}

export function getDatabasePath(): string {
  if (!dbPath) getDb();
  return dbPath ?? path.join(os.tmpdir(), "skillzpath.db");
}

export type MemberStatus = "PENDING" | "PAID" | "FAILED";

export type MemberAccess = "RESERVED" | "ACTIVE" | "REVOKED";

export type Member = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  city: string;
  ageGroup: string;
  interest: string;
  experience: string;
  goal: string;
  source: string;
  agreeUpdates: boolean;
  paymentStatus: MemberStatus;
  accessStatus: MemberAccess;
  amountPaid: number;
  referenceNumber: string;
  createdAt: string;
  updatedAt: string;
  passwordHash: string;
};

function toMember(row: Record<string, unknown>): Member {
  return {
    id: String(row.id ?? ""),
    email: String(row.email ?? ""),
    firstName: String(row.first_name ?? ""),
    lastName: String(row.last_name ?? ""),
    phone: String(row.phone ?? ""),
    country: String(row.country ?? ""),
    city: String(row.city ?? ""),
    ageGroup: String(row.age_group ?? ""),
    interest: String(row.interest ?? ""),
    experience: String(row.experience ?? ""),
    goal: String(row.goal ?? ""),
    source: String(row.source ?? ""),
    agreeUpdates: Number(row.agree_updates ?? 1) === 1,
    paymentStatus: (String(row.payment_status ?? "PENDING") || "PENDING") as MemberStatus,
    accessStatus: (String(row.access_status ?? "RESERVED") || "RESERVED") as MemberAccess,
    amountPaid: Number(row.amount_paid ?? 0),
    referenceNumber: String(row.reference_number ?? ""),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
    passwordHash: String(row.password_hash ?? ""),
  };
}

export type SaveMemberInput = {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  city?: string;
  ageGroup?: string;
  interest?: string;
  experience?: string;
  goal?: string;
  source?: string;
  agreeUpdates?: boolean;
  password?: string;
  paymentStatus?: MemberStatus;
  accessStatus?: MemberAccess;
  amountPaid?: number;
  referenceNumber?: string;
};

function hashPassword(password: string): string {
  if (!password) return "";
  // Use Node.js crypto PBKDF2 for password hashing
  const salt = crypto.randomBytes(16).toString("hex");
  const dk = crypto.scryptSync(password, salt, 64);
  return `${salt}.${dk.toString("hex")}`;
}

export function verifyPassword(password: string, hash: string): boolean {
  if (!password || !hash) return false;
  const parts = hash.split(".");
  if (parts.length !== 2) return false;
  const [salt, storedKey] = parts;
  try {
    const dk = crypto.scryptSync(password, salt, 64);
    return dk.toString("hex") === storedKey;
  } catch {
    return false;
  }
}

export function saveMember(input: SaveMemberInput): Member | null {
  const database = getDb();
  const now = new Date().toISOString();
  const email = input.email.trim().toLowerCase();

  function sanitizeText(value: string, max = 160): string {
    // Strip HTML tags and control chars before persisting free-text fields.
    // React already escapes on render; this is defense-in-depth server-side.
    return value
      .replace(/<[^>]*>/g, "")
      .replace(/[\r\n\t]/g, " ")
      .trim()
      .slice(0, max);
  }

  const existing = database
    .prepare("SELECT * FROM members WHERE email = ?")
    .all(email) as Record<string, unknown>[];

  if (existing.length > 0) {
    const member = existing[0];
    const paymentStatus = input.paymentStatus ?? String(member.payment_status ?? "PENDING");
    const accessStatus = input.accessStatus ?? String(member.access_status ?? "RESERVED");
    const amountPaid = input.amountPaid ?? Number(member.amount_paid ?? 0);
    const agreeUpdates =
      input.agreeUpdates ?? Number(member.agree_updates ?? 1) === 1;
    // Never wipe an existing password when a later step (for example a
    // payment) updates the profile without sending one again.
    const passwordHash = input.password
      ? hashPassword(input.password)
      : String(member.password_hash ?? "");

    database
      .prepare(
        `UPDATE members
         SET first_name = ?, last_name = ?, phone = ?, country = ?, city = ?,
             age_group = ?, interest = ?, experience = ?, goal = ?, source = ?,
             agree_updates = ?, payment_status = ?, access_status = ?,
             amount_paid = ?, reference_number = ?, password_hash = ?,
             updated_at = ?
         WHERE email = ?`,
      )
      .run(
        sanitizeText(String(input.firstName ?? member.first_name ?? ""), 80),
        sanitizeText(String(input.lastName ?? member.last_name ?? ""), 80),
        sanitizeText(String(input.phone ?? member.phone ?? "")),
        sanitizeText(String(input.country ?? member.country ?? "")),
        sanitizeText(String(input.city ?? member.city ?? "")),
        sanitizeText(String(input.ageGroup ?? member.age_group ?? "")),
        sanitizeText(String(input.interest ?? member.interest ?? "")),
        sanitizeText(String(input.experience ?? member.experience ?? "")),
        sanitizeText(String(input.goal ?? member.goal ?? "")),
        sanitizeText(String(input.source ?? member.source ?? "")),
        agreeUpdates ? 1 : 0,
        paymentStatus,
        accessStatus,
        amountPaid,
        sanitizeText(String(input.referenceNumber ?? member.reference_number ?? ""), 80),
        passwordHash,
        now,
        email,
      );

    const updated = database
      .prepare("SELECT * FROM members WHERE email = ?")
      .all(email) as Record<string, unknown>[];
    return updated.length > 0 ? toMember(updated[0]) : null;
  }

  // Hash password before storing
  const finalPasswordHash = input.password ? hashPassword(input.password) : "";

  database
    .prepare(
      `INSERT INTO members (
         email, first_name, last_name, phone, country, city, age_group, interest,
         experience, goal, source, agree_updates, payment_status, access_status,
         amount_paid, reference_number, password_hash, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      email,
      sanitizeText(String(input.firstName ?? "")),
      sanitizeText(String(input.lastName ?? "")),
      sanitizeText(String(input.phone ?? "")),
      sanitizeText(String(input.country ?? "")),
      sanitizeText(String(input.city ?? "")),
      sanitizeText(String(input.ageGroup ?? "")),
      sanitizeText(String(input.interest ?? "")),
      sanitizeText(String(input.experience ?? "")),
      sanitizeText(String(input.goal ?? "")),
      sanitizeText(String(input.source ?? "")),
      input.agreeUpdates === undefined ? 1 : input.agreeUpdates ? 1 : 0,
      input.paymentStatus ?? "PENDING",
      input.accessStatus ?? "RESERVED",
      input.amountPaid ?? 0,
      sanitizeText(String(input.referenceNumber ?? ""), 80),
      finalPasswordHash,
      now,
      now,
    );

  const created = database
    .prepare("SELECT * FROM members WHERE email = ?")
    .all(email) as Record<string, unknown>[];
  return created.length > 0 ? toMember(created[0]) : null;
}

export function getMemberByEmail(email: string): Member | null {
  const database = getDb();
  const rows = database
    .prepare("SELECT * FROM members WHERE email = ?")
    .all(email.trim().toLowerCase()) as Record<string, unknown>[];
  return rows.length > 0 ? toMember(rows[0]) : null;
}

export function markMemberPaidByReference(
  referenceNumber: string,
  email: string,
  amountPaid: number = site.pricing.earlyBird,
): Member | null {
  const database = getDb();
  const now = new Date().toISOString();
  const reference = referenceNumber.trim();

  const byReference = database
    .prepare("SELECT * FROM members WHERE reference_number = ?")
    .all(reference) as Record<string, unknown>[];
  const row = byReference[0];
  const targetEmail = (email || String(row?.email ?? "")).trim().toLowerCase();

  const members = database
    .prepare("SELECT * FROM members WHERE email = ?")
    .all(targetEmail) as Record<string, unknown>[];

  if (members.length === 0) return null;

  database
    .prepare(
      `UPDATE members
       SET payment_status = 'PAID', access_status = 'ACTIVE', amount_paid = ?,
           reference_number = ?, updated_at = ?
       WHERE email = ?`,
    )
    .run(amountPaid, reference, now, targetEmail);

  const updated = database
    .prepare("SELECT * FROM members WHERE email = ?")
    .all(targetEmail) as Record<string, unknown>[];
  return updated.length > 0 ? toMember(updated[0]) : null;
}

export function markMemberPaid(email: string, amountPaid: number, referenceNumber: string): Member | null {
  const member = getMemberByEmail(email);
  if (!member) return null;
  return markMemberPaidByReference(member.referenceNumber || referenceNumber, email, amountPaid);
}

export function addWaitlistSignup(email: string, firstName?: string, interest?: string): void {
  const database = getDb();
  const normalized = email.trim().toLowerCase();
  database
    .prepare(
      `INSERT OR IGNORE INTO waitlist (email, created_at) VALUES (?, ?)`,
    )
    .run(normalized, new Date().toISOString());
  void firstName;
  void interest;
}