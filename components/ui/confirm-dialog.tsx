"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertDialog } from "radix-ui";
import { AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

type Tone = "default" | "danger";

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: Tone;
}

interface AlertOptions {
  title: string;
  description?: string;
  okLabel?: string;
}

interface DialogApi {
  /** Themed replacement for window.confirm — resolves true on confirm. */
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
  /** Themed replacement for window.alert — resolves when dismissed. */
  notify: (opts: AlertOptions) => Promise<void>;
}

interface DialogState {
  kind: "confirm" | "alert";
  opts: ConfirmOptions & AlertOptions;
}

const DialogContext = createContext<DialogApi | null>(null);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DialogState | null>(null);
  const resolverRef = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback(
    (opts: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        resolverRef.current = resolve;
        setState({ kind: "confirm", opts });
      }),
    [],
  );

  const notify = useCallback(
    (opts: AlertOptions) =>
      new Promise<void>((resolve) => {
        resolverRef.current = () => resolve();
        setState({ kind: "alert", opts });
      }),
    [],
  );

  // Resolve once, then tear down (guards against Radix's onOpenChange firing
  // a second close after an explicit button click).
  const settle = (result: boolean) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setState(null);
  };

  const open = state !== null;
  const opts = state?.opts;
  const danger = opts?.tone === "danger";
  const isConfirm = state?.kind === "confirm";

  return (
    <DialogContext.Provider value={{ confirm, notify }}>
      {children}
      <AlertDialog.Root
        open={open}
        onOpenChange={(next) => {
          if (!next) settle(false);
        }}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-[100] bg-primary-950/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-[101] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface p-6 shadow-hover focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
            <div className="flex items-start gap-4">
              <span
                className={
                  danger
                    ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error/10 text-error"
                    : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600"
                }
              >
                {danger ? <AlertTriangle size={20} /> : <Info size={20} />}
              </span>
              <div className="flex flex-col gap-1.5">
                <AlertDialog.Title className="font-heading text-lg font-bold text-heading">
                  {opts?.title}
                </AlertDialog.Title>
                {opts?.description && (
                  <AlertDialog.Description className="text-sm leading-relaxed text-text-muted">
                    {opts.description}
                  </AlertDialog.Description>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              {isConfirm && (
                <AlertDialog.Cancel asChild>
                  <Button variant="outline" onClick={() => settle(false)}>
                    {opts?.cancelLabel ?? "Cancel"}
                  </Button>
                </AlertDialog.Cancel>
              )}
              <AlertDialog.Action asChild>
                <Button
                  variant={danger ? "destructive" : "default"}
                  onClick={() => settle(true)}
                >
                  {isConfirm ? opts?.confirmLabel ?? "Confirm" : opts?.okLabel ?? "OK"}
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </DialogContext.Provider>
  );
}

export function useDialog(): DialogApi {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used within a DialogProvider");
  return ctx;
}
