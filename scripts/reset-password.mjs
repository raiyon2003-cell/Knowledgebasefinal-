#!/usr/bin/env node
/**
 * Reset a user's password via Supabase Admin API.
 * Usage: node scripts/reset-password.mjs [email] [newPassword]
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq);
      const value = trimmed.slice(eq + 1);
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local optional if vars already exported
  }
}

loadEnv();

const email = process.argv[2] || "admin@segwitz.com";
const newPassword = process.argv[3] || "SegWitz@2026!";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error: listError } = await supabase.auth.admin.listUsers();

if (listError) {
  console.error("Failed to list users:", listError.message);
  process.exit(1);
}

const user = data.users.find((u) => u.email === email);

if (!user) {
  console.error(`User not found: ${email}`);
  process.exit(1);
}

const { error } = await supabase.auth.admin.updateUserById(user.id, {
  password: newPassword,
});

if (error) {
  console.error("Failed to reset password:", error.message);
  process.exit(1);
}

console.log(`Password reset successfully for ${email}`);
