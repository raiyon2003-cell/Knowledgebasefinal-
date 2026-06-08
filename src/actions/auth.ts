"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";

export async function loginAction(formData: FormData) {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) {
      return { error: error.message };
    }

    redirect("/dashboard");
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") {
      throw err;
    }
    const message =
      err instanceof Error && err.message.includes("fetch")
        ? "Unable to connect to Supabase. Restart the dev server after updating .env.local."
        : "An unexpected error occurred. Please try again.";
    return { error: message };
  }
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function forgotPasswordAction(formData: FormData) {
  const raw = {
    email: formData.get("email") as string,
  };

  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const supabase = await createClient();
  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    { redirectTo }
  );

  if (error) {
    return { error: error.message };
  }

  return { success: "Password reset email sent. Check your inbox." };
}

export async function resetPasswordAction(formData: FormData) {
  const raw = {
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/login?message=password-updated");
}
