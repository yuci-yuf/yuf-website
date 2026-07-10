"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Lock, Unlock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  getRegistrationSettings,
  DEFAULT_CLOSED_TITLE,
  DEFAULT_CLOSED_MESSAGE,
} from "@/lib/cms-data";
import { setRegistrationSettings } from "@/lib/admin-data";

/**
 * Dashboard control for the site-wide registration switch. Turning it off
 * closes registration everywhere (the /register page shows the message, and the
 * server rejects direct sign-ups).
 */
export function RegistrationToggle() {
  const [open, setOpen] = useState(true);
  const [title, setTitle] = useState(DEFAULT_CLOSED_TITLE);
  const [message, setMessage] = useState(DEFAULT_CLOSED_MESSAGE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRegistrationSettings()
      .then((s) => {
        setOpen(s.open);
        setTitle(s.closedTitle);
        setMessage(s.closedMessage);
      })
      .catch(() => setError("Couldn't load the current setting."))
      .finally(() => setLoading(false));
  }, []);

  async function save(nextOpen: boolean, nextTitle: string, nextMessage: string) {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await setRegistrationSettings(
        nextOpen,
        nextTitle || DEFAULT_CLOSED_TITLE,
        nextMessage || DEFAULT_CLOSED_MESSAGE,
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error(e);
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // Flipping the switch saves immediately; the text has its own Save button.
  function toggle(next: boolean) {
    setOpen(next);
    void save(next, title, message);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2">
              {open ? (
                <Unlock size={18} className="text-success" />
              ) : (
                <Lock size={18} className="text-error" />
              )}
              Registration
            </CardTitle>
            <CardDescription>
              {open
                ? "Registration is open across the site."
                : "Registration is closed — visitors see your message below."}
            </CardDescription>
          </div>
          {loading ? (
            <Loader2 size={18} className="mt-1 animate-spin text-text-muted" />
          ) : (
            <Switch
              checked={open}
              onCheckedChange={toggle}
              disabled={saving}
              aria-label="Toggle registration"
            />
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <label
          htmlFor="reg-closed-title"
          className="text-sm font-medium text-text"
        >
          Title shown when closed
        </label>
        <Input
          id="reg-closed-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={DEFAULT_CLOSED_TITLE}
          disabled={loading}
        />

        <label
          htmlFor="reg-closed-message"
          className="mt-1 text-sm font-medium text-text"
        >
          Message shown when closed
        </label>
        <Textarea
          id="reg-closed-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={DEFAULT_CLOSED_MESSAGE}
          className="min-h-24"
          disabled={loading}
        />
        <div className="flex items-center gap-3">
          <Button
            type="button"
            size="sm"
            onClick={() => save(open, title, message)}
            disabled={saving || loading}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : "Save text"}
          </Button>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
              <Check size={16} /> Saved
            </span>
          )}
          {error && <span className="text-sm text-error">{error}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
