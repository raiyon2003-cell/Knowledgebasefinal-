"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: string } | null, formData: FormData) => {
      return (await forgotPasswordAction(formData)) || null;
    },
    null
  );

  return (
    <Card className="w-full border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          {state?.success && (
            <Alert>
              <AlertDescription>{state.success}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@segwitz.com"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Sending..." : "Send Reset Link"}
          </Button>
          <Link
            href="/login"
            className="inline-flex h-8 w-full items-center justify-center rounded-lg text-sm font-medium hover:bg-muted"
          >
            Back to login
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}
