#!/usr/bin/env node
/**
 * Create the default admin user in Supabase Auth + promote to admin role.
 * Usage: node scripts/create-admin.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
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
}

loadEnv();

const email = "admin@segwitz.com";
const password = "SegWitz@2026!";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing Supabase env vars in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: existing, error: listError } =
  await supabase.auth.admin.listUsers();

if (listError) {
  console.error("Failed to list users:", listError.message);
  process.exit(1);
}

let userId = existing.users.find((u) => u.email === email)?.id;

if (!userId) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: "SegWitz Admin",
      role: "admin",
    },
  });

  if (error) {
    console.error("Failed to create user:", error.message);
    process.exit(1);
  }

  userId = data.user.id;
  console.log(`Created auth user: ${email}`);
} else {
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password,
    email_confirm: true,
    user_metadata: {
      full_name: "SegWitz Admin",
      role: "admin",
    },
  });

  if (error) {
    console.error("Failed to update user:", error.message);
    process.exit(1);
  }

  console.log(`Updated existing user: ${email}`);
}

const { error: roleError } = await supabase
  .from("users")
  .update({ role: "admin", full_name: "SegWitz Admin", status: "active" })
  .eq("id", userId);

if (roleError) {
  console.error("Failed to promote user to admin:", roleError.message);
  process.exit(1);
}

console.log("Admin user is ready.");
console.log(`Email: ${email}`);
console.log(`Password: ${password}`);
