import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations/auth";

export async function POST(request: NextRequest) {
  let response = NextResponse.json({ success: true });

  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key || url.includes("your-project")) {
      return NextResponse.json(
        {
          error:
            "Supabase is not configured. Save your real credentials in .env.local and restart the dev server.",
        },
        { status: 500 }
      );
    }

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const { error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return response;
  } catch (err) {
    console.error("Login error:", err);

    const cause =
      err instanceof Error && "cause" in err
        ? (err.cause as { code?: string; hostname?: string } | undefined)
        : undefined;

    let message =
      err instanceof Error
        ? err.message
        : "Unable to connect to authentication server";

    if (cause?.code === "ENOTFOUND" || message === "fetch failed") {
      const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      let host = cause?.hostname;
      if (!host && configuredUrl) {
        try {
          host = new URL(configuredUrl).hostname;
        } catch {
          host = "unknown host";
        }
      }
      message = `Cannot reach Supabase (${host || "unknown host"}). Update Vercel env vars NEXT_PUBLIC_SUPABASE_URL and keys, then redeploy.`;
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
