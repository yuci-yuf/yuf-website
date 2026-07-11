/**
 * Razorpay Standard Checkout — CLIENT ONLY.
 *
 * Loads Razorpay's hosted checkout.js on demand (once) and exposes the small
 * slice of its API we use, typed. The heavy lifting (order creation, signature
 * verification) lives server-side; this just opens the payment modal and hands
 * the callback fields back for the server to verify.
 *
 * Docs: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/
 */

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

/** Fields Razorpay passes to the success handler (all must be re-verified server-side). */
export interface RazorpayHandlerResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number; // paise
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpayHandlerResponse) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayFailure {
  error: {
    code: string;
    description: string;
    reason?: string;
    metadata?: { order_id?: string; payment_id?: string };
  };
}

export interface RazorpayInstance {
  open: () => void;
  on: (event: "payment.failed", cb: (resp: RazorpayFailure) => void) => void;
}

type RazorpayCtor = new (options: RazorpayOptions) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayCtor;
  }
}

let loader: Promise<RazorpayCtor> | null = null;

/**
 * Ensure checkout.js is loaded and resolve with the `Razorpay` constructor.
 * Cached: subsequent calls reuse the same script/promise. Rejects if the script
 * fails to load (e.g. offline / blocked).
 */
export function loadRazorpay(): Promise<RazorpayCtor> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay checkout can only load in the browser."));
  }
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  if (loader) return loader;

  loader = new Promise<RazorpayCtor>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${CHECKOUT_SRC}"]`,
    );
    const onLoad = () => {
      if (window.Razorpay) resolve(window.Razorpay);
      else reject(new Error("Razorpay loaded but window.Razorpay is missing."));
    };
    const onError = () => {
      loader = null; // allow a retry on the next attempt
      reject(new Error("Failed to load Razorpay checkout."));
    };

    if (existing) {
      existing.addEventListener("load", onLoad, { once: true });
      existing.addEventListener("error", onError, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = CHECKOUT_SRC;
    script.async = true;
    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", onError, { once: true });
    document.body.appendChild(script);
  });

  return loader;
}
