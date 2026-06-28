"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { siteConfig } from "@/lib/content";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, isAdmin, loading, signInEmail } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Once authenticated AND authorized, move to the dashboard.
  useEffect(() => {
    if (!loading && user && isAdmin) {
      router.replace("/admin/dashboard");
    }
  }, [loading, user, isAdmin, router]);

  async function handleEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const data = new FormData(e.currentTarget);
    try {
      await signInEmail(
        String(data.get("email")),
        String(data.get("password")),
      );
    } catch {
      setError("Invalid email or password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-2xl border border-border bg-surface p-8 shadow-card">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image src={siteConfig.logo} alt="YUF" width={56} height={56} className="h-12 w-auto object-contain" />
          <h1 className="font-heading text-2xl font-bold text-text">Admin Sign In</h1>
          <p className="text-sm text-text-muted">Youth United Festival dashboard</p>
        </div>

        <form onSubmit={handleEmail} className="flex flex-col gap-4">
          <Field label="Email" htmlFor="email" required>
            <Input id="email" name="email" type="email" required autoComplete="email" placeholder="admin@example.com" />
          </Field>
          <Field label="Password" htmlFor="password" required>
            <Input id="password" name="password" type="password" required autoComplete="current-password" placeholder="••••••••" />
          </Field>

          {error && <p className="text-sm text-error">{error}</p>}

          <Button type="submit" size="lg" disabled={busy} icon={<LogIn size={18} />}>
            {busy ? "Signing in…" : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
