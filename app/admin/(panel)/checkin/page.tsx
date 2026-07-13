"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BrowserMultiFormatReader,
  type IScannerControls,
} from "@zxing/browser";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BadgeCheck,
  Camera,
  CameraOff,
  Loader2,
  KeyRound,
} from "lucide-react";
import { PageHeader } from "@/components/admin/AdminUI";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  verifyRegistration,
  checkInRegistration,
  type CheckInResult,
  type VerifyResult,
} from "@/lib/admin-data";
import { cn } from "@/lib/utils";

/** What the result card is currently showing: a lookup, or a final check-in. */
type View = VerifyResult | CheckInResult;
type Outcome = View["result"];

export default function CheckInPage() {
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [view, setView] = useState<View | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [checkedInCount, setCheckedInCount] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  // Guards against the camera firing many decodes for the same held-up QR. Stays
  // locked while a result card is on screen so the desk can review at its pace;
  // cleared by "Scan next" / "Cancel" (reset).
  const lockRef = useRef(false);

  // Step 1 — look up the pass and show who it belongs to (no check-in yet).
  const handleVerify = useCallback(async (raw: string) => {
    if (lockRef.current || !raw.trim()) return;
    lockRef.current = true;
    setBusy(true);
    setView(null);
    setCameraError(null);
    try {
      const res = await verifyRegistration(raw);
      setView(res);
    } catch (err) {
      console.error("verify failed", err);
      setView(null);
      setCameraError("Verification failed. Check your connection and retry.");
      lockRef.current = false; // let the desk try again
    } finally {
      setBusy(false);
    }
  }, []);

  // Step 2 — after the operator has reviewed the identity, confirm the check-in.
  const confirmCheckIn = useCallback(async () => {
    if (!view || view.result !== "eligible") return;
    const code = view.registration.registrationCode ?? "";
    setConfirming(true);
    setCameraError(null);
    try {
      const res = await checkInRegistration(code, user?.email ?? "admin");
      setView(res);
      if (res.result === "ok") setCheckedInCount((c) => c + 1);
    } catch (err) {
      console.error("check-in failed", err);
      setCameraError("Check-in failed. Check your connection and retry.");
    } finally {
      setConfirming(false);
    }
  }, [view, user]);

  // Clear the card and arm the scanner for the next pass.
  const reset = useCallback(() => {
    setView(null);
    setCameraError(null);
    lockRef.current = false;
  }, []);

  const startScanner = useCallback(async () => {
    setCameraError(null);
    setView(null);
    lockRef.current = false;
    const reader = new BrowserMultiFormatReader();
    try {
      const controls = await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current!,
        (res) => {
          if (res) void handleVerify(res.getText());
        },
      );
      controlsRef.current = controls;
      setScanning(true);
    } catch (err) {
      console.error("camera start failed", err);
      setCameraError(
        "Couldn't access the camera. Grant permission, or use the code entry below.",
      );
      setScanning(false);
    }
  }, [handleVerify]);

  const stopScanner = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setScanning(false);
  }, []);

  // Stop the camera when leaving the page.
  useEffect(() => () => controlsRef.current?.stop(), []);

  function submitManual(e: React.FormEvent) {
    e.preventDefault();
    const code = manualCode.trim();
    if (!code) return;
    // Manual path bypasses the scan lock so the desk can verify on demand.
    lockRef.current = false;
    void handleVerify(code);
    setManualCode("");
  }

  return (
    <>
      <PageHeader
        title="Entry Check-in"
        description="Scan a pass, verify the participant's identity, then confirm check-in."
        action={
          <div className="rounded-xl bg-success/10 px-4 py-2 text-center">
            <div className="font-heading text-xl font-bold text-success">
              {checkedInCount}
            </div>
            <div className="text-xs text-text-muted">checked in this session</div>
          </div>
        }
      />

      <div className="mx-auto grid max-w-6xl gap-6 p-4 sm:p-6 lg:grid-cols-2 lg:items-start lg:p-8">
        {/* ── Scanner + code entry (one card) ── */}
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-text">
            <Camera size={18} className="text-primary-600" />
            Scan participant pass
          </h2>

          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-black/90">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              muted
              playsInline
            />
            {!scanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface-alt text-text-muted">
                <CameraOff size={40} />
                <p className="text-sm">Camera is off</p>
              </div>
            )}
            {scanning && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-2/3 w-2/3 rounded-2xl border-4 border-white/70" />
              </div>
            )}
          </div>

          {scanning ? (
            <Button variant="outline" onClick={stopScanner}>
              <CameraOff size={18} /> Stop camera
            </Button>
          ) : (
            <Button onClick={startScanner}>
              <Camera size={18} /> Start camera
            </Button>
          )}

          {cameraError && (
            <p className="flex items-start gap-2 rounded-lg bg-accent-50 p-3 text-sm text-accent-700">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              {cameraError}
            </p>
          )}

          {/* Divider between scan + manual entry */}
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
            <span className="h-px flex-1 bg-border" />
            or enter code
            <span className="h-px flex-1 bg-border" />
          </div>

          {/* ── Manual code fallback ── */}
          <form onSubmit={submitManual} className="flex flex-col gap-2">
            <label
              htmlFor="manual-code"
              className="flex items-center gap-2 text-sm font-semibold text-text"
            >
              <KeyRound size={16} className="text-primary-600" />
              QR won&apos;t scan? Type the pass code
            </label>
            <div className="flex gap-2">
              <Input
                id="manual-code"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="YUF26-XXXXXX"
                autoComplete="off"
                autoCapitalize="characters"
                className="font-mono uppercase tracking-wider"
              />
              <Button type="submit" disabled={busy || !manualCode.trim()}>
                Verify
              </Button>
            </div>
          </form>
        </div>

        {/* ── Result — inline beside the scanner on desktop ── */}
        <div className="hidden lg:block">
          <ResultCard
            busy={busy}
            view={view}
            confirming={confirming}
            onCheckIn={confirmCheckIn}
            onReset={reset}
          />
        </div>
      </div>

      {/* ── Result — popup on mobile so the desk sees it without scrolling ── */}
      {(busy || view) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 lg:hidden">
          <div className="max-h-[88vh] w-full max-w-md overflow-y-auto">
            <ResultCard
              busy={busy}
              view={view}
              confirming={confirming}
              onCheckIn={confirmCheckIn}
              onReset={reset}
            />
          </div>
        </div>
      )}
    </>
  );
}

const OUTCOME: Record<
  Outcome,
  { title: string; tone: string; Icon: typeof CheckCircle2 }
> = {
  eligible: {
    title: "Confirmed — verify identity",
    tone: "primary",
    Icon: BadgeCheck,
  },
  ok: { title: "Checked in", tone: "success", Icon: CheckCircle2 },
  already: {
    title: "Already checked in",
    tone: "accent",
    Icon: AlertTriangle,
  },
  not_confirmed: {
    title: "Not confirmed",
    tone: "error",
    Icon: XCircle,
  },
  not_found: { title: "Not found", tone: "error", Icon: XCircle },
};

function ResultCard({
  busy,
  view,
  confirming,
  onCheckIn,
  onReset,
}: {
  busy: boolean;
  view: View | null;
  confirming: boolean;
  onCheckIn: () => void;
  onReset: () => void;
}) {
  if (busy) {
    return (
      <div className="flex min-h-[420px] w-full items-center justify-center rounded-2xl border border-border bg-surface p-12 shadow-card lg:min-h-[520px]">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    );
  }
  if (!view) {
    return (
      <div className="flex min-h-[420px] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface p-12 text-center text-text-muted shadow-card lg:min-h-[520px]">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-alt">
          <Camera size={26} className="opacity-60" />
        </div>
        <p className="max-w-xs text-sm">
          Scan a pass or enter a code to verify a participant.
        </p>
      </div>
    );
  }

  const meta = OUTCOME[view.result];
  const Icon = meta.Icon;
  const toneBg = {
    primary: "bg-primary-50 border-primary-200",
    success: "bg-success/10 border-success/30",
    accent: "bg-accent-50 border-accent-200",
    error: "bg-error/10 border-error/30",
  }[meta.tone]!;
  const toneText = {
    primary: "text-primary-700",
    success: "text-success",
    accent: "text-accent-700",
    error: "text-error",
  }[meta.tone]!;

  const reg = view.result === "not_found" ? null : view.registration;
  const eligible = view.result === "eligible";

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-4 rounded-2xl border-2 p-6 shadow-card",
        toneBg,
      )}
    >
      <div className={cn("flex items-center gap-3", toneText)}>
        <Icon size={40} className="shrink-0" />
        <div>
          <div className="font-heading text-2xl font-bold">{meta.title}</div>
          {eligible && (
            <div className="text-sm opacity-80">
              Check the participant matches these details, then confirm.
            </div>
          )}
          {view.result === "already" && view.checkedInAt && (
            <div className="text-sm opacity-80">
              First scanned{" "}
              {new Date(view.checkedInAt).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </div>
          )}
          {view.result === "not_confirmed" && (
            <div className="text-sm opacity-80">
              Registration is {view.registration.status} — do not admit.
            </div>
          )}
          {view.result === "not_found" && (
            <div className="text-sm opacity-80">
              No registration matches this code.
            </div>
          )}
        </div>
      </div>

      {reg && (
        <div className="flex flex-col gap-2 rounded-xl bg-surface p-4 text-sm">
          <DetailRow label="Name" value={`${reg.firstName} ${reg.lastName}`} />
          <DetailRow label="Event" value={reg.eventTitle} />
          {(reg.locationVenue || reg.locationDate) && (
            <DetailRow
              label="Location"
              value={[reg.locationVenue, reg.locationDate]
                .filter(Boolean)
                .join(" · ")}
            />
          )}
          <DetailRow label="Institution" value={reg.institution} />
          <DetailRow label="Phone" value={reg.phone} />
          <DetailRow label="Code" value={reg.registrationCode ?? ""} mono />
        </div>
      )}

      {/* ── Actions ── */}
      {eligible ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={onCheckIn}
            disabled={confirming}
            className="flex-1 bg-success text-white hover:bg-success/90"
          >
            {confirming ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <CheckCircle2 size={18} />
            )}
            Check in
          </Button>
          <Button variant="outline" onClick={onReset} disabled={confirming}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button variant="outline" onClick={onReset} className="w-full">
          Scan next
        </Button>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-text-muted">{label}</span>
      <span
        className={cn(
          "text-right font-medium text-text",
          mono && "font-mono tracking-wider",
        )}
      >
        {value}
      </span>
    </div>
  );
}
