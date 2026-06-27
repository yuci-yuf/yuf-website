"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogIn, ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { siteConfig } from "@/lib/content";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, isAdmin, loading, signInEmail, signInGoogle, signOut } = useAuth();
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

  async function handleGoogle() {
    setError(null);
    setBusy(true);
    try {
      await signInGoogle();
    } catch {
      setError("Google sign-in failed or was cancelled.");
    } finally {
      setBusy(false);
    }
  }

  // Signed in but not an admin → access denied (invite-only model).
  if (!loading && user && !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="flex w-full max-w-md flex-col items-center gap-5 rounded-2xl border border-border bg-surface p-8 text-center shadow-card">
          <ShieldAlert size={48} className="text-error" />
          <h1 className="font-heading text-2xl font-bold text-text">Access Denied</h1>
          <p className="text-text-muted">
            <span className="font-medium text-text">{user.email}</span> is not an
            authorized admin. Admin access is invite-only.
          </p>
          <p className="w-full break-all rounded-lg bg-surface-alt p-3 text-xs text-text-muted">
            To grant access, add a document with this UID to the{" "}
            <span className="font-mono font-semibold">admins</span> collection:
            <br />
            <span className="font-mono font-semibold text-text">{user.uid}</span>
          </p>
          <Button variant="outline" onClick={() => signOut()}>
            Sign out
          </Button>
        </div>
      </div>
    );
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

        <div className="flex items-center gap-3 text-xs text-text-muted">
          <span className="h-px flex-1 bg-border" />
          OR
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button variant="outline" size="lg" disabled={busy} onClick={handleGoogle}>
          Continue with Google
        </Button>
      </div>
    </div>
  );
}
