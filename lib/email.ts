/**
 * Transactional email via Resend — SERVER ONLY.
 *
 * Sends the registration confirmation from
 * `registration@youthunitedfestival.com`. Requires `RESEND_API_KEY`; the sender
 * domain must be verified in Resend. `NEXT_PUBLIC_SITE_URL` (optional) sets the
 * base for links like Terms & Conditions.
 */
import { Resend } from "resend";
import QRCode from "qrcode";

const FROM = "Youth United Festival <registration@youthunitedfestival.com>";
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://youthunitedfestival.com"
).replace(/\/$/, "");
const REPORTING_TIME = "9:00 AM";

let client: Resend | null = null;
function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set.");
  if (!client) client = new Resend(key);
  return client;
}

export interface RegistrationEmailData {
  to: string;
  firstName: string;
  eventTitle: string;
  date?: string;
  venue?: string;
  registrationCode?: string;
}

export async function sendRegistrationEmail(data: RegistrationEmailData) {
  const resend = getResend();

  // Build the entry-pass QR (encodes the registration code) so it can be
  // scanned at the gate. If the code is missing or QR rendering fails we simply
  // send the email without it — the code is always printed as text, which is the
  // supported manual fallback at the entry desk.
  let qrBuffer: Buffer | null = null;
  if (data.registrationCode) {
    try {
      qrBuffer = await QRCode.toBuffer(data.registrationCode, {
        errorCorrectionLevel: "M",
        margin: 2,
        width: 320,
      });
    } catch (err) {
      console.error("QR render failed:", err);
    }
  }

  return resend.emails.send({
    from: FROM,
    to: data.to,
    subject: `You're registered — ${data.eventTitle} · Youth United Festival 2026`,
    html: registrationEmailHtml(data, qrBuffer != null),
    text: registrationEmailText(data),
    attachments: qrBuffer
      ? [
          {
            // Referenced inline via cid:qrcode in the HTML, and also downloadable
            // so the pass survives clients that strip inline images.
            filename: "yuf-entry-pass.png",
            content: qrBuffer,
            contentId: "qrcode",
          },
        ]
      : undefined,
  });
}

/* ── Plain-text fallback (for clients that block HTML) ── */
function registrationEmailText(d: RegistrationEmailData): string {
  const termsUrl = `${SITE_URL}/terms-and-conditions`;
  return [
    `Hi ${d.firstName},`,
    ``,
    `Thank you for registering for Youth United Festival 2026.`,
    ``,
    `EVENT DETAILS`,
    `Event: ${d.eventTitle}`,
    d.date ? `Date: ${d.date}` : ``,
    d.venue ? `Venue: ${d.venue}` : ``,
    `Reporting time: ${REPORTING_TIME}`,
    d.registrationCode ? `Registration code: ${d.registrationCode}` : ``,
    ``,
    `Please review our Terms & Conditions before the event: ${termsUrl}`,
    ``,
    `— Team YUF, Youth United Council of India`,
  ]
    .filter(Boolean)
    .join("\n");
}

/* ── Branded HTML email (inline styles + tables for client compatibility) ── */
function registrationEmailHtml(
  d: RegistrationEmailData,
  hasQr: boolean,
): string {
  const termsUrl = `${SITE_URL}/terms-and-conditions`;
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #eef2f6;font:600 13px/1.4 Arial,Helvetica,sans-serif;color:#6b7f92;text-transform:uppercase;letter-spacing:.06em;width:130px;vertical-align:top;">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #eef2f6;font:600 15px/1.5 Arial,Helvetica,sans-serif;color:#102330;">${value}</td>
    </tr>`;

  const details = [
    row("Event", escapeHtml(d.eventTitle)),
    d.date ? row("Date", escapeHtml(d.date)) : "",
    d.venue ? row("Venue", escapeHtml(d.venue)) : "",
    row("Reporting time", REPORTING_TIME),
    d.registrationCode
      ? row(
          "Registration code",
          `<span style="font:700 15px/1.5 'Courier New',monospace;color:#1787b3;">${escapeHtml(
            d.registrationCode,
          )}</span>`,
        )
      : "",
  ].join("");

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#eef4f8;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef4f8;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(16,35,48,.08);">
            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(120deg,#133a8c 0%,#1787b3 55%,#15938f 100%);padding:34px 40px;">
                <div style="font:800 13px/1 Arial,Helvetica,sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#9de0ef;">Youth United Festival 2026</div>
                <div style="margin-top:10px;font:800 26px/1.2 Arial,Helvetica,sans-serif;color:#ffffff;">You're registered! 🎉</div>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:34px 40px 8px 40px;">
                <p style="margin:0 0 16px;font:400 16px/1.6 Arial,Helvetica,sans-serif;color:#102330;">Hi ${escapeHtml(
                  d.firstName,
                )},</p>
                <p style="margin:0 0 24px;font:400 16px/1.6 Arial,Helvetica,sans-serif;color:#3a4a5a;">
                  Thank you for registering for <strong style="color:#102330;">Youth United Festival 2026</strong>.
                  We're thrilled to have you join us. Here are your event details:
                </p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5fafc;border:1px solid #e3eef4;border-radius:12px;padding:8px 20px;">
                  ${details}
                </table>

                ${entryPass(d, hasQr)}

                <p style="margin:22px 0 0;font:400 14px/1.6 Arial,Helvetica,sans-serif;color:#6b7f92;">
                  Please arrive by the reporting time of <strong style="color:#102330;">${REPORTING_TIME}</strong> and carry a valid ID.
                </p>

                <p style="margin:20px 0 6px;font:400 14px/1.6 Arial,Helvetica,sans-serif;color:#6b7f92;">
                  By registering, you agree to our
                  <a href="${termsUrl}" style="color:#1787b3;font-weight:700;text-decoration:underline;">Terms &amp; Conditions</a>.
                  Please review them before the event.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:26px 40px 32px 40px;border-top:1px solid #eef2f6;">
                <p style="margin:0;font:600 14px/1.5 Arial,Helvetica,sans-serif;color:#102330;">— Team YUF</p>
                <p style="margin:4px 0 0;font:400 13px/1.5 Arial,Helvetica,sans-serif;color:#8a9aa8;">Youth United Council of India</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/* ── Entry pass block: scannable QR (cid) + the code as the manual fallback ── */
function entryPass(d: RegistrationEmailData, hasQr: boolean): string {
  if (!d.registrationCode) return "";
  const code = escapeHtml(d.registrationCode);
  const qrImg = hasQr
    ? `<img src="cid:qrcode" alt="Entry QR code" width="180" height="180" style="display:block;margin:0 auto 14px;width:180px;height:180px;border-radius:8px;" />`
    : "";
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px;background:#ffffff;border:1px solid #e3eef4;border-radius:12px;">
      <tr>
        <td style="padding:24px;text-align:center;">
          <div style="font:700 12px/1 Arial,Helvetica,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#1787b3;margin-bottom:14px;">Your entry pass</div>
          ${qrImg}
          <div style="font:400 13px/1.5 Arial,Helvetica,sans-serif;color:#6b7f92;">Show this QR at the entry desk${hasQr ? " (also attached to this email)" : ""}.</div>
          <div style="margin-top:16px;padding-top:16px;border-top:1px dashed #d8e6ee;">
            <div style="font:600 12px/1 Arial,Helvetica,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#6b7f92;margin-bottom:6px;">If the QR won't scan, give this code</div>
            <div style="font:700 22px/1.3 'Courier New',monospace;letter-spacing:.08em;color:#102330;">${code}</div>
          </div>
        </td>
      </tr>
    </table>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
