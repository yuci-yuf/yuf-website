import { GoogleAuth } from "google-auth-library";
import { FieldValue, type DocumentData } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";

export interface ParticipantRow {
  registrationCode: string;
  createdAt: string;
  fullName: string;
  email: string;
  phone: string;
  institution: string;
  institutionType: string;
  ageCategory: string;
  eventCategory: string;
  eventTitle: string;
  location: string;
  locationVenue: string;
  locationDate: string;
  status: string;
  paymentStatus: string;
  amountPaid: number;
  paymentId: string;
  checkedIn: string;
}

export const GSHEETS_HEADERS = [
  "Registration Code",
  "Date & Time",
  "Full Name",
  "Email",
  "Phone",
  "Institution",
  "Institution Type",
  "Age Category",
  "Event Category",
  "Event Title",
  "Location",
  "Venue",
  "Event Date",
  "Status",
  "Payment Status",
  "Amount Paid (₹)",
  "Payment ID",
  "Checked In",
];

type SheetRow = (string | number)[];

/**
 * Only paid + confirmed participants belong in the sheet. Pending, failed,
 * expired, and cancelled registrations must never appear.
 */
function belongsInSheet(d: DocumentData): boolean {
  return d.status === "confirmed" && d.paymentStatus === "paid";
}

function toParticipantRow(d: DocumentData): ParticipantRow {
  let createdAtStr = "";
  if (d.createdAt && typeof d.createdAt.toDate === "function") {
    createdAtStr = d.createdAt.toDate().toISOString();
  } else if (typeof d.createdAt === "string") {
    createdAtStr = d.createdAt;
  }

  const firstName = d.firstName ?? "";
  const lastName = d.lastName ?? "";
  const fullName = `${firstName} ${lastName}`.trim();

  return {
    registrationCode: d.registrationCode ?? "",
    createdAt: createdAtStr,
    fullName,
    email: d.email ?? "",
    phone: d.phone ?? "",
    institution: d.institution ?? "",
    institutionType: d.institutionType ?? "",
    ageCategory: d.ageCategory ?? "",
    eventCategory: d.eventCategory ?? "",
    eventTitle: d.eventTitle ?? "",
    location: d.location ?? "",
    locationVenue: d.locationVenue ?? "",
    locationDate: d.locationDate ?? "",
    status: d.status ?? "pending",
    paymentStatus: d.paymentStatus ?? "pending",
    amountPaid: Number(d.amountPaid ?? 0),
    paymentId: d.paymentId ?? "",
    checkedIn: d.checkedIn ? "Yes" : "No",
  };
}

function toSheetRow(p: ParticipantRow): SheetRow {
  return [
    p.registrationCode,
    p.createdAt,
    p.fullName,
    p.email,
    p.phone,
    p.institution,
    p.institutionType,
    p.ageCategory,
    p.eventCategory,
    p.eventTitle,
    p.location,
    p.locationVenue,
    p.locationDate,
    p.status,
    p.paymentStatus,
    p.amountPaid,
    p.paymentId,
    p.checkedIn,
  ];
}

/**
 * Sheet-row mirror.
 *
 * The sheet is always rewritten in full (the Apps Script webhook only
 * understands `sync_all`). Building those rows by reading every registration
 * cost one Firestore read per registration per sync — and a sync fires on every
 * sign-up, payment and check-in, so total reads grew with the SQUARE of the
 * registration count (~5M reads by 1.5k registrations).
 *
 * Instead the sheet's rows live in a mirror sharded across MIRROR_SHARDS docs,
 * each `{ ready: true, rows: { [registrationId]: SheetRow } }`. A change
 * rewrites just its own row, and a sync reads only the shards: ~10 reads no
 * matter how many registrations exist. Sharding keeps every doc far below
 * Firestore's 1 MiB limit (~400 B per row → room for ~20k rows).
 *
 * `ready` is written only by a full rebuild, so a missing/unready shard means
 * the mirror was never built (or was deleted) and the sync rebuilds it once.
 * Admin-SDK only — clients are denied by the default rule in firestore.rules.
 */
const MIRROR_COLLECTION = "gsheetsMirror";
const MIRROR_SHARDS = 8;

function mirrorShardRef(index: number) {
  return getAdminDb().collection(MIRROR_COLLECTION).doc(`shard-${index}`);
}

function shardIndexFor(registrationId: string): number {
  let hash = 0;
  for (let i = 0; i < registrationId.length; i++) {
    hash = (hash * 31 + registrationId.charCodeAt(i)) >>> 0;
  }
  return hash % MIRROR_SHARDS;
}

/** Newest first, matching the sheet's historical order. createdAt is ISO. */
function sortRows(rows: SheetRow[]): SheetRow[] {
  return rows.sort((a, b) => String(b[1]).localeCompare(String(a[1])));
}

/**
 * Full rebuild from `registrations` — reads every confirmed registration, so
 * it's reserved for first use and the admin's manual resync.
 */
async function rebuildMirror(): Promise<SheetRow[]> {
  const adminDb = getAdminDb();
  // Equality-only filter, so no composite index; paymentStatus checked in memory.
  const snap = await adminDb
    .collection("registrations")
    .where("status", "==", "confirmed")
    .get();

  const shards: Record<string, SheetRow>[] = Array.from(
    { length: MIRROR_SHARDS },
    () => ({}),
  );
  const rows: SheetRow[] = [];
  for (const doc of snap.docs) {
    const d = doc.data();
    if (!belongsInSheet(d)) continue;
    const row = toSheetRow(toParticipantRow(d));
    shards[shardIndexFor(doc.id)][doc.id] = row;
    rows.push(row);
  }

  const batch = adminDb.batch();
  shards.forEach((shardRows, i) =>
    batch.set(mirrorShardRef(i), { ready: true, rows: shardRows }),
  );
  await batch.commit();
  return sortRows(rows);
}

/** Re-read one registration and add, update, or remove its mirror row. */
async function updateMirrorRow(registrationId: string): Promise<void> {
  const snap = await getAdminDb()
    .collection("registrations")
    .doc(registrationId)
    .get();
  const d = snap.data();
  const row =
    d && belongsInSheet(d)
      ? toSheetRow(toParticipantRow(d))
      : FieldValue.delete();
  await mirrorShardRef(shardIndexFor(registrationId)).set(
    { rows: { [registrationId]: row } },
    { merge: true },
  );
}

/** All mirrored rows, or null if the mirror hasn't been fully built. */
async function readMirror(): Promise<SheetRow[] | null> {
  const shards = await getAdminDb().getAll(
    ...Array.from({ length: MIRROR_SHARDS }, (_, i) => mirrorShardRef(i)),
  );
  if (!shards.every((s) => s.exists && s.get("ready") === true)) return null;
  return sortRows(
    shards.flatMap((s) =>
      Object.values((s.get("rows") ?? {}) as Record<string, SheetRow>),
    ),
  );
}

function getServiceAccountCredentials() {
  const raw = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT;
  if (!raw) return null;
  try {
    const jsonStr = Buffer.from(raw, "base64").toString("utf8");
    return JSON.parse(jsonStr);
  } catch {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}

/**
 * Direct Google Sheets API v4 update using Service Account.
 */
async function syncViaGoogleSheetsAPI(
  spreadsheetId: string,
  rows: (string | number)[][]
): Promise<{ success: boolean; totalSynced: number; message: string }> {
  const credentials = getServiceAccountCredentials();
  if (!credentials) {
    throw new Error("FIREBASE_ADMIN_SERVICE_ACCOUNT environment variable is invalid.");
  }

  const auth = new GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  const accessToken = tokenResponse.token;

  if (!accessToken) {
    throw new Error("Could not obtain access token for Google Sheets API.");
  }

  const allValues = [GSHEETS_HEADERS, ...rows];

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:Z10000:clear`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  const range = `A1:R${allValues.length}`;
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        range,
        majorDimension: "ROWS",
        values: allValues,
      }),
    }
  );

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    let detailMsg = errorText;
    try {
      const errJson = JSON.parse(errorText);
      if (errJson?.error?.message) {
        detailMsg = errJson.error.message;
      }
    } catch {}

    if (detailMsg.includes("Google Sheets API has not been used") || detailMsg.includes("SERVICE_DISABLED")) {
      throw new Error(
        `Google Sheets API is disabled in your Google Cloud Project. Enable it here: https://console.developers.google.com/apis/api/sheets.googleapis.com/overview?project=${credentials.project_id || "1065916265512"}`
      );
    }

    if (res.status === 403 || detailMsg.includes("PERMISSION_DENIED")) {
      throw new Error(
        `Google Sheet Permission Denied. Share your Google Sheet with ${credentials.client_email} as Editor.`
      );
    }

    throw new Error(`Google Sheets API Error (${res.status}): ${detailMsg}`);
  }

  return {
    success: true,
    totalSynced: rows.length,
    message: `Successfully synced ${rows.length} registration(s) to Google Sheets via API.`,
  };
}

/**
 * Webhook sync via Google Apps Script Web App.
 */
async function syncViaWebhook(
  webhookUrl: string,
  rows: (string | number)[][]
): Promise<{ success: boolean; totalSynced: number; message: string }> {
  const payload = {
    action: "sync_all",
    headers: GSHEETS_HEADERS,
    rows,
    total: rows.length,
    syncedAt: new Date().toISOString(),
  };

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
    redirect: "follow",
  });

  const responseText = await res.text().catch(() => "");

  if (
    responseText.includes("You need access") ||
    responseText.includes("accounts.google.com")
  ) {
    throw new Error(
      "Google Sheets Webhook Permission Error: Web App deployment access must be set to 'Anyone'."
    );
  }

  if (!res.ok) {
    throw new Error(`Google Sheets Webhook HTTP ${res.status}: ${responseText}`);
  }

  return {
    success: true,
    totalSynced: rows.length,
    message: `Successfully synced ${rows.length} participant registration(s) to Google Sheets via Webhook.`,
  };
}

/**
 * Primary sync function — uses Webhook URL if set, otherwise uses Google Sheets API.
 *
 * With a `registrationId`, only that registration is re-read and its mirror
 * row updated before the (full) sheet is pushed — the cheap path used on every
 * sign-up, payment and check-in. Without one, the mirror is rebuilt from all
 * registrations (manual admin resync); the same happens once if the mirror
 * doesn't exist yet.
 */
export async function triggerGSheetsSync(registrationId?: string): Promise<{
  success: boolean;
  totalSynced: number;
  message: string;
}> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!webhookUrl && !spreadsheetId) {
    return {
      success: false,
      totalSynced: 0,
      message:
        "Neither GOOGLE_SHEETS_WEBHOOK_URL nor GOOGLE_SHEETS_SPREADSHEET_ID is configured.",
    };
  }

  try {
    let rows: SheetRow[] | null = null;
    if (registrationId) {
      await updateMirrorRow(registrationId);
      rows = await readMirror();
    }
    // Because the sync clears + rewrites the whole sheet, rows that no longer
    // qualify (e.g. a registration that expired) drop out of the sheet too.
    rows ??= await rebuildMirror();

    if (webhookUrl) {
      return await syncViaWebhook(webhookUrl, rows);
    }

    if (spreadsheetId) {
      return await syncViaGoogleSheetsAPI(spreadsheetId, rows);
    }

    return {
      success: false,
      totalSynced: 0,
      message: "No Google Sheets destination configured.",
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("GSheets sync error:", errMsg);
    return {
      success: false,
      totalSynced: 0,
      message: `Failed to sync with Google Sheets: ${errMsg}`,
    };
  }
}

export function safeTriggerGSheetsSync(registrationId: string): void {
  triggerGSheetsSync(registrationId).catch((err) => {
    console.error("Background GSheets sync failed:", err);
  });
}
