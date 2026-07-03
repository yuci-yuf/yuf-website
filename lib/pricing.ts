/**
 * Registration price breakdown (invoice).
 *
 * The amount a participant pays is the event's base registration fee plus a
 * platform fee and GST. Kept here as a single source of truth so the form
 * invoice and (later) the server-side payment order compute the same total.
 * Adjust the rates below if they change.
 */

/** Goods & Services Tax rate (India, 18%). */
export const GST_RATE = 0.18;
/** Platform / convenience fee as a fraction of the base fee. */
export const PLATFORM_FEE_RATE = 0.02;

export interface Invoice {
  /** Event's base registration fee. */
  base: number;
  /** Platform fee (PLATFORM_FEE_RATE of base), rounded to rupees. */
  platformFee: number;
  /** GST charged on (base + platform fee), rounded to rupees. */
  gst: number;
  /** Grand total the participant pays. */
  total: number;
}

/** Build the itemized invoice for a given base fee (all values in rupees). */
export function computeInvoice(base: number): Invoice {
  const safeBase = Math.max(0, Math.round(base));
  const platformFee = Math.round(safeBase * PLATFORM_FEE_RATE);
  const gst = Math.round((safeBase + platformFee) * GST_RATE);
  return { base: safeBase, platformFee, gst, total: safeBase + platformFee + gst };
}

/** Format a rupee amount, e.g. 1234 → "₹ 1,234". */
export function formatINR(amount: number): string {
  return `₹ ${amount.toLocaleString("en-IN")}`;
}
