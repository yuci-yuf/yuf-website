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
  Camera,
  CameraOff,
  Loader2,
  KeyRound,
} from "lucide-react";
import { PageHeader } from "@/components/admin/AdminUI";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { verifyAndCheckIn, type CheckInResult } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

type Outcome = CheckInResult["result"];

/** How long a result card stays before the scanner is ready for the next code. */
const RESULT_HOLD_MS = 3500;

export default function CheckInPage() {
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [checkedInCount, setCheckedInCount] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  // Guards against the camera firing many decodes for the same held-up QR while
  // a verification is in flight or a result is being shown.
  const lockRef = useRef(false);

  const handleCode = useCallback(
    async (raw: string) => {
      if (lockRef.current || !raw.trim()) return;
      lockRef.current = true;
      setBusy(true);
      try {
        const res = await verifyAndCheckIn(raw, user?.email ?? "admin");
        setResult(res);
        if (res.result === "ok") setCheckedInCount((c) => c + 1);
      } catch (err) {
        console.error("check-in failed", err);
        setResult(null);
        setCameraError("Verification failed. Check your connection and retry.");
      } finally {
        setBusy(false);
        // Hold the result briefly, then unlock for the next scan.
        window.setTimeout(() => {
          lockRef.current = false;
        }, RESULT_HOLD_MS);
      }
    },
    [user],
  );

  const startScanner = useCallback(async () => {
    setCameraError(null);
    setResult(null);
    const reader = new BrowserMultiFormatReader();
    try {
      const controls = await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current!,
        (res) => {
          if (res) void handleCode(res.getText());
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
  }, [handleCode]);

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
    void handleCode(code);
    setManualCode("");
  }

  return (
    <>
      <PageHeader
        title="Entry Check-in"
        description="Scan a participant's QR pass, or type their code if it won't scan."
        action={
          <div className="rounded-xl bg-success/10 px-4 py-2 text-center">
            <div className="font-heading text-xl font-bold text-success">
              {checkedInCount}
            </div>
            <div className="text-xs text-text-muted">checked in this session</div>
          </div>
        }
      />

      <div className="flex flex-col gap-6 p-8 lg:flex-row">
        {/* ── Scanner ── */}
        <div className="flex flex-1 flex-col gap-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-black/90 shadow-card">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              muted
              playsInline
            />
            {!scanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface text-text-muted">
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

          {/* ── Manual code fallback ── */}
          <form
            onSubmit={submitManual}
            className="flex flex-col gap-2 rounded-2xl border border-dashed border-border bg-surface-alt p-4"
          >
            <label
              htmlFor="manual-code"
              className="flex items-center gap-2 text-sm font-semibold text-text"
            >
              <KeyRound size={16} className="text-primary-600" />
              QR won&apos;t scan? Enter the code
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

        {/* ── Result ── */}
        <div className="flex flex-1 items-start">
          <ResultCard busy={busy} result={result} />
        </div>
      </div>
    </>
  );
}

const OUTCOME: Record<
  Outcome,
  { title: string; tone: string; Icon: typeof CheckCircle2 }
> = {
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
  result,
}: {
  busy: boolean;
  result: CheckInResult | null;
}) {
  if (busy) {
    return (
      <div className="flex w-full items-center justify-center rounded-2xl border border-border bg-surface p-12 shadow-card">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    );
  }
  if (!result) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface p-12 text-center text-text-muted shadow-card">
        <Camera size={32} className="opacity-50" />
        <p>Scan a pass or enter a code to verify a participant.</p>
      </div>
    );
  }

  const meta = OUTCOME[result.result];
  const Icon = meta.Icon;
  const toneBg = {
    success: "bg-success/10 border-success/30",
    accent: "bg-accent-50 border-accent-200",
    error: "bg-error/10 border-error/30",
  }[meta.tone]!;
  const toneText = {
    success: "text-success",
    accent: "text-accent-700",
    error: "text-error",
  }[meta.tone]!;

  const reg = result.result === "not_found" ? null : result.registration;

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-4 rounded-2xl border-2 p-6 shadow-card",
        toneBg,
      )}
    >
      <div className={cn("flex items-center gap-3", toneText)}>
        <Icon size={40} />
        <div>
          <div className="font-heading text-2xl font-bold">{meta.title}</div>
          {result.result === "already" && result.checkedInAt && (
            <div className="text-sm opacity-80">
              First scanned{" "}
              {new Date(result.checkedInAt).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </div>
          )}
          {result.result === "not_confirmed" && (
            <div className="text-sm opacity-80">
              Registration is {result.registration.status} — do not admit.
            </div>
          )}
          {result.result === "not_found" && (
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
