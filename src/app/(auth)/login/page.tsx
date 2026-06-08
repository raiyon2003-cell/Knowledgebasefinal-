import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/shared/auth-shell";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function LoginPage() {
  return (
    <AuthShell>
      <LoginForm />
    </AuthShell>
  );
}
