"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BrowserMultiFormatReader,
  type IScannerControls,
} from "@zxing/browser";
import {
  AlertTriangle,
  Camera,
  CameraOff,
  CheckCircle2,
  Download,
  Loader2,
  MapPin,
  RefreshCw,
  ScanLine,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDialog } from "@/components/ui/confirm-dialog";
import type { EventDeskData, EventDeskRegistration } from "@/types";

type DeskFilter = "all" | "in" | "out";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Why the camera wouldn't start. getUserMedia reports genuinely different
 * causes and the fix differs for each, so a blanket "allow permission" is
 * wrong (and unhelpful) for most of them — the desk needs to know whether to
 * grant access, plug in a camera, close another app, or just type the code.
 */
function cameraErrorMessage(error: unknown): string {
  const name = error instanceof Error ? error.name : "";
  switch (name) {
    case "NotAllowedError":
    case "SecurityError":
      return "Camera permission was blocked. Allow camera access for this site in your browser, then try again — or enter the code below.";
    case "NotFoundError":
    case "OverconstrainedError":
      return "No camera was found on this device. Enter the code below instead.";
    case "NotReadableError":
      return "The camera is already in use by another app. Close it and try again — or enter the code below.";
    default:
      // Includes the common case of a non-HTTPS origin, where getUserMedia is
      // simply undefined and the failure has no useful error name.
      return typeof window !== "undefined" &&
        !window.isSecureContext
        ? "The camera needs a secure (https) connection. Open this page over https, or enter the code below."
        : "Could not start the camera. Enter the code below instead.";
  }
}

export function EventDesk({ token }: { token: string }) {
  const { confirm, notify } = useDialog();
  const [data, setData] = useState<EventDeskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<DeskFilter>("all");
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  // Whether the error is about the camera or the scanned code — they need
  // different headings ("Camera unavailable" vs "QR not accepted").
  const [scannerErrorKind, setScannerErrorKind] = useState<"camera" | "code">(
    "code",
  );
  const [scannedRegistration, setScannedRegistration] =
    useState<EventDeskRegistration | null>(null);
  // Typed-in registration code — the fallback when the camera can't be used.
  const [manualCode, setManualCode] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerControlsRef = useRef<IScannerControls | null>(null);
  const scanLockRef = useRef(false);

  const load = useCallback(
    async (background = false) => {
      if (background) setRefreshing(true);
      try {
        const response = await fetch(`/api/event-desk/${token}`, {
          cache: "no-store",
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "This event desk is unavailable.");
        }
        setData(result);
        setError(null);
        setUpdatedAt(new Date());
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "This event desk is unavailable.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void load(), 0);
    const interval = window.setInterval(() => void load(true), 30_000);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
    };
  }, [load]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data?.registrations ?? []).filter((registration) => {
      if (filter === "in" && !registration.checkedIn) return false;
      if (filter === "out" && registration.checkedIn) return false;
      if (!term) return true;
      return [
        registration.firstName,
        registration.lastName,
        registration.email,
        registration.phone,
        registration.institution,
        registration.registrationCode,
        registration.ageCategory,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [data, search, filter]);

  const checkedInCount =
    data?.registrations.filter((registration) => registration.checkedIn).length ??
    0;

  async function checkIn(
    registration: EventDeskRegistration,
    askForConfirmation = true,
  ): Promise<boolean> {
    if (askForConfirmation) {
      const proceed = await confirm({
        title: `Check in ${registration.firstName} ${registration.lastName}?`,
        description: `${registration.registrationCode} · ${registration.institution}`,
        confirmLabel: "Confirm check-in",
      });
      if (!proceed) return false;
    }
    setCheckingIn(registration.id);
    try {
      const response = await fetch(`/api/event-desk/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: registration.id }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Check-in failed.");
      }
      setData((current) =>
        current
          ? {
              ...current,
              registrations: current.registrations.map((item) =>
                item.id === registration.id
                  ? {
                      ...item,
                      checkedIn: true,
                      checkedInAt:
                        item.checkedInAt ?? new Date().toISOString(),
                    }
                  : item,
              ),
            }
          : current,
      );
      if (result.result === "already") {
        await notify({
          title: "Already checked in",
          description: "This participant was checked in earlier.",
        });
      }
      return true;
    } catch (checkInError) {
      await notify({
        title: "Check-in failed",
        description:
          checkInError instanceof Error
            ? checkInError.message
            : "Check the connection and try again.",
      });
      return false;
    } finally {
      setCheckingIn(null);
    }
  }

  const stopScanner = useCallback(() => {
    scannerControlsRef.current?.stop();
    scannerControlsRef.current = null;
    setScannerActive(false);
  }, []);

  const handleScan = useCallback(
    (rawValue: string) => {
      if (scanLockRef.current) return;
      const code = rawValue.trim().toUpperCase();
      if (!code) return;

      scanLockRef.current = true;
      scannerControlsRef.current?.stop();
      scannerControlsRef.current = null;
      setScannerActive(false);

      const registration = data?.registrations.find(
        (item) => item.registrationCode.trim().toUpperCase() === code,
      );
      if (!registration) {
        setScannedRegistration(null);
        setScannerErrorKind("code");
        setScannerError(
          `No confirmed participant with the code ${code} belongs to this event and location.`,
        );
        return;
      }

      setScannerError(null);
      setScannedRegistration(registration);
    },
    [data],
  );

  /**
   * Look up a hand-typed code. Reuses the scan path so a typed code and a
   * scanned one behave identically. The scan lock is cleared first: it's set
   * after every match to stop the camera re-firing, and would otherwise make
   * the second manual lookup a no-op.
   */
  function submitManualCode() {
    const code = manualCode.trim();
    if (!code) return;
    stopScanner();
    scanLockRef.current = false;
    handleScan(code);
    setManualCode("");
  }

  const startScanner = useCallback(async () => {
    scannerControlsRef.current?.stop();
    scannerControlsRef.current = null;
    scanLockRef.current = false;
    setScannerError(null);
    setScannedRegistration(null);

    try {
      if (!videoRef.current) return;
      const reader = new BrowserMultiFormatReader();
      const controls = await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result) => {
          if (result) handleScan(result.getText());
        },
      );
      scannerControlsRef.current = controls;
      setScannerActive(true);
    } catch (cameraError) {
      console.error("event desk camera start failed", cameraError);
      setScannerErrorKind("camera");
      setScannerError(cameraErrorMessage(cameraError));
      setScannerActive(false);
    }
  }, [handleScan]);

  useEffect(() => {
    if (!scannerOpen) return;
    const start = window.setTimeout(() => void startScanner(), 0);
    return () => {
      window.clearTimeout(start);
      scannerControlsRef.current?.stop();
      scannerControlsRef.current = null;
    };
  }, [scannerOpen, startScanner]);

  function closeScanner() {
    stopScanner();
    setScannerOpen(false);
    setScannerError(null);
    setScannedRegistration(null);
    scanLockRef.current = false;
  }

  async function checkInScannedParticipant() {
    if (!scannedRegistration || scannedRegistration.checkedIn) return;
    const succeeded = await checkIn(scannedRegistration, false);
    if (succeeded) {
      setScannedRegistration((current) =>
        current
          ? {
              ...current,
              checkedIn: true,
              checkedInAt: current.checkedInAt ?? new Date().toISOString(),
            }
          : current,
      );
    }
  }

  function exportCsv() {
    if (!data || visible.length === 0) return;
    const headers = [
      "S.No",
      "Registration Code",
      "Name",
      "Email",
      "Phone",
      "Institution",
      "Standard / Year",
      "Checked In",
      "Checked In At",
      "Registered At",
    ];
    const rows = visible.map((registration, index) =>
      [
        index + 1,
        registration.registrationCode,
        `${registration.firstName} ${registration.lastName}`,
        registration.email,
        registration.phone,
        registration.institution,
        registration.ageCategory,
        registration.checkedIn ? "Yes" : "No",
        formatDate(registration.checkedInAt),
        formatDate(registration.createdAt),
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const slug = `${data.event.title}-${data.location.city || data.location.address || "location"}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    anchor.href = url;
    anchor.download = `${slug}-registrations.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-alt">
        <Loader2 className="animate-spin text-primary-600" size={36} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-alt p-6">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-8 text-center shadow-card">
          <ShieldCheck size={42} className="mx-auto text-text-muted" />
          <h1 className="mt-4 font-heading text-2xl font-bold text-text">
            Event desk unavailable
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-surface-alt">
      <header className="border-b border-primary-800 bg-primary-950 text-white">
        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-highlight-300">
                YUF private event desk
              </p>
              <h1 className="mt-2 font-heading text-2xl font-extrabold sm:text-3xl">
                {data.event.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/75">
                <span className="rounded-full bg-white/10 px-3 py-1 font-medium text-white">
                  {data.event.category}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={15} className="text-highlight-300" />
                  {data.location.address ||
                    data.location.city ||
                    "Event location"}
                </span>
                {data.location.date && <span>{data.location.date}</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <Metric
                icon={<Users size={17} />}
                value={data.registrations.length}
                label="Confirmed"
              />
              <Metric
                icon={<UserCheck size={17} />}
                value={checkedInCount}
                label="Checked in"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-border bg-surface shadow-card">
          <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
            <div className="relative min-w-60 flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, phone, institution, or registration code"
                className="pl-9"
              />
            </div>
            <Select
              value={filter}
              onValueChange={(value) => setFilter(value as DeskFilter)}
            >
              <SelectTrigger
                size="sm"
                className="h-10 w-44 rounded-xl border-border bg-surface px-3.5 text-sm font-medium text-text shadow-none hover:border-primary-300 focus-visible:border-primary-500 focus-visible:ring-primary-100"
                aria-label="Filter participants by check-in status"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                position="popper"
                align="start"
                className="rounded-xl border-border p-1 shadow-hover"
              >
                <SelectItem
                  value="all"
                  className="rounded-lg py-2 pl-3 pr-8 text-sm focus:bg-primary-50 focus:text-primary-800"
                >
                  All participants
                </SelectItem>
                <SelectItem
                  value="out"
                  className="rounded-lg py-2 pl-3 pr-8 text-sm focus:bg-primary-50 focus:text-primary-800"
                >
                  Not checked in
                </SelectItem>
                <SelectItem
                  value="in"
                  className="rounded-lg py-2 pl-3 pr-8 text-sm focus:bg-primary-50 focus:text-primary-800"
                >
                  Checked in
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={() => setScannerOpen(true)}
            >
              <ScanLine size={16} /> Scan QR
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => load(true)}
              disabled={refreshing}
              title="Refresh registrations"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportCsv}
              disabled={visible.length === 0}
            >
              <Download size={15} /> Export CSV
            </Button>
          </div>

          <div className="flex items-center justify-between gap-4 border-b border-border bg-primary-50/60 px-4 py-2 text-xs text-text-muted">
            <span>
              Showing <strong className="text-text">{visible.length}</strong> of{" "}
              {data.registrations.length}
            </span>
            <span>
              {updatedAt
                ? `Updated ${updatedAt.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : ""}
            </span>
          </div>

          {visible.length === 0 ? (
            <div className="p-12 text-center text-sm text-text-muted">
              No confirmed registrations match this search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
                <thead className="sticky top-0 bg-surface-alt text-xs uppercase tracking-wide text-text-muted">
                  <tr>
                    <th className="border-b border-r border-border px-3 py-3 text-center">
                      #
                    </th>
                    <th className="border-b border-r border-border px-4 py-3">
                      Participant
                    </th>
                    <th className="border-b border-r border-border px-4 py-3">
                      Contact
                    </th>
                    <th className="border-b border-r border-border px-4 py-3">
                      Institution
                    </th>
                    <th className="border-b border-r border-border px-4 py-3">
                      Standard / Year
                    </th>
                    <th className="border-b border-r border-border px-4 py-3">
                      Registered
                    </th>
                    <th className="border-b border-border px-4 py-3">
                      Check-in
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {visible.map((registration, index) => (
                    <tr
                      key={registration.id}
                      className="transition-colors hover:bg-primary-50/40"
                    >
                      <td className="border-r border-border px-3 py-3 text-center text-text-muted">
                        {index + 1}
                      </td>
                      <td className="border-r border-border px-4 py-3">
                        <p className="font-semibold text-text">
                          {registration.firstName} {registration.lastName}
                        </p>
                        <p className="mt-0.5 font-mono text-xs tracking-wide text-primary-700">
                          {registration.registrationCode || "—"}
                        </p>
                      </td>
                      <td className="border-r border-border px-4 py-3 text-text-muted">
                        <p>{registration.email}</p>
                        <p className="mt-0.5 text-xs">{registration.phone}</p>
                      </td>
                      <td className="max-w-80 border-r border-border px-4 py-3 text-text-muted">
                        {registration.institution || "—"}
                      </td>
                      <td className="border-r border-border px-4 py-3 text-text-muted">
                        {registration.ageCategory || "—"}
                      </td>
                      <td className="border-r border-border px-4 py-3 text-xs text-text-muted">
                        {formatDate(registration.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {registration.checkedIn ? (
                          <div>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                              <CheckCircle2 size={13} /> Checked in
                            </span>
                            {registration.checkedInAt && (
                              <p className="mt-1 text-xs text-text-muted">
                                {formatDate(registration.checkedInAt)}
                              </p>
                            )}
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            disabled={checkingIn === registration.id}
                            onClick={() => checkIn(registration)}
                          >
                            {checkingIn === registration.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <UserCheck size={14} />
                            )}
                            Check in
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="text-center text-xs text-text-muted">
          This is a private access link. Do not forward it outside the event
          organizing team.
        </p>
      </div>

      {scannerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-primary-950/80 p-3 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="scanner-title"
        >
          <div className="max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-white/10 bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-6">
              <div>
                <h2
                  id="scanner-title"
                  className="font-heading text-xl font-bold text-text"
                >
                  Scan participant QR
                </h2>
                <p className="mt-0.5 text-sm text-text-muted">
                  Verify the participant details before check-in.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeScanner}
                aria-label="Close QR scanner"
              >
                <X size={20} />
              </Button>
            </div>

            <div className="grid gap-5 p-4 sm:p-6 md:grid-cols-2">
              <div>
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-black">
                  <video
                    ref={videoRef}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                  />
                  {!scannerActive && !scannedRegistration && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-primary-950 text-white/70">
                      <CameraOff size={42} />
                      <span className="text-sm">Camera paused</span>
                    </div>
                  )}
                  {scannerActive && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="h-2/3 w-2/3 rounded-2xl border-4 border-white/80 shadow-[0_0_0_999px_rgba(0,0,0,0.2)]" />
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  {scannerActive ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={stopScanner}
                    >
                      <CameraOff size={17} /> Stop camera
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => void startScanner()}
                    >
                      <Camera size={17} />
                      {scannedRegistration || scannerError
                        ? "Scan another QR"
                        : "Start camera"}
                    </Button>
                  )}
                </div>

                {/* Manual fallback — the code is printed on every pass for
                    exactly this case (no camera permission, broken lens, a
                    scuffed QR). Runs the same lookup as a scan. */}
                <form
                  className="mt-4 border-t border-border pt-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitManualCode();
                  }}
                >
                  <label
                    htmlFor="desk-manual-code"
                    className="text-xs font-semibold uppercase tracking-wide text-text-muted"
                  >
                    Or enter the code
                  </label>
                  <div className="mt-1.5 flex gap-2">
                    <Input
                      id="desk-manual-code"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder="YUF26-XXXXXX"
                      autoComplete="off"
                      autoCapitalize="characters"
                      spellCheck={false}
                      className="font-mono uppercase"
                    />
                    {/* Pulls up the participant; the check-in itself is
                        confirmed on the details panel that follows. */}
                    <Button type="submit" disabled={!manualCode.trim()}>
                      <UserCheck size={16} />
                      Check-in
                    </Button>
                  </div>
                </form>
              </div>

              <div className="flex min-h-72">
                {scannedRegistration ? (
                  <div className="flex w-full flex-col rounded-2xl border border-border bg-surface-alt p-5">
                    <div
                      className={`flex items-center gap-2 text-sm font-semibold ${
                        scannedRegistration.checkedIn
                          ? "text-success"
                          : "text-primary-700"
                      }`}
                    >
                      {scannedRegistration.checkedIn ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <ShieldCheck size={20} />
                      )}
                      {scannedRegistration.checkedIn
                        ? "Participant checked in"
                        : "Confirmed registration"}
                    </div>
                    <h3 className="mt-4 font-heading text-2xl font-bold text-text">
                      {scannedRegistration.firstName}{" "}
                      {scannedRegistration.lastName}
                    </h3>
                    <p className="mt-1 font-mono text-sm font-semibold tracking-wide text-primary-700">
                      {scannedRegistration.registrationCode}
                    </p>

                    <dl className="mt-5 space-y-3 text-sm">
                      <ScanDetail
                        label="Institution"
                        value={scannedRegistration.institution}
                      />
                      <ScanDetail
                        label="Standard / Year"
                        value={scannedRegistration.ageCategory}
                      />
                      <ScanDetail
                        label="Phone"
                        value={scannedRegistration.phone}
                      />
                    </dl>

                    <div className="mt-auto pt-6">
                      {scannedRegistration.checkedIn ? (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => void startScanner()}
                        >
                          <ScanLine size={17} /> Scan next participant
                        </Button>
                      ) : (
                        <Button
                          className="w-full bg-success text-white hover:bg-success/90"
                          disabled={checkingIn === scannedRegistration.id}
                          onClick={() => void checkInScannedParticipant()}
                        >
                          {checkingIn === scannedRegistration.id ? (
                            <Loader2 size={17} className="animate-spin" />
                          ) : (
                            <UserCheck size={17} />
                          )}
                          Confirm check-in
                        </Button>
                      )}
                    </div>
                  </div>
                ) : scannerError ? (
                  <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-error/30 bg-error/5 p-6 text-center">
                    <AlertTriangle size={42} className="text-error" />
                    <h3 className="mt-3 font-heading text-lg font-bold text-text">
                      {scannerErrorKind === "camera"
                        ? "Camera unavailable"
                        : "QR not accepted"}
                    </h3>
                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-text-muted">
                      {scannerError}
                    </p>
                  </div>
                ) : (
                  <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-alt p-6 text-center text-text-muted">
                    <ScanLine size={42} className="opacity-60" />
                    <p className="mt-3 max-w-xs text-sm leading-relaxed">
                      Hold the participant&apos;s QR code inside the camera
                      frame, or enter their registration code.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function ScanDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-2 last:border-0">
      <dt className="text-text-muted">{label}</dt>
      <dd className="text-right font-medium text-text">{value || "—"}</dd>
    </div>
  );
}

function Metric({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="min-w-28 rounded-xl border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-sm">
      <div className="flex items-center gap-2 font-heading text-lg font-bold">
        {icon}
        {value}
      </div>
      <p className="text-[11px] text-white/65">{label}</p>
    </div>
  );
}
