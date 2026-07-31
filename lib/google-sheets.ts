import { GoogleAuth } from "google-auth-library";
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

export async function fetchAllParticipantsData(): Promise<ParticipantRow[]> {
  const adminDb = getAdminDb();
  const snap = await adminDb
    .collection("registrations")
    .orderBy("createdAt", "desc")
    .get();

  return snap.docs.map((doc) => {
    const d = doc.data();
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
  });
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
 */
export async function triggerGSheetsSync(): Promise<{
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
    const participants = await fetchAllParticipantsData();
    // Only paid + confirmed participants belong in the sheet. Pending, failed,
    // expired, and cancelled registrations must never appear. Because the sync
    // clears + rewrites the whole sheet, filtering here also removes any such
    // rows that were written before (e.g. a pending row from the order step).
    const paidParticipants = participants.filter(
      (p) => p.status === "confirmed" && p.paymentStatus === "paid",
    );
    const rows = paidParticipants.map((p) => [
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
    ]);

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

export function safeTriggerGSheetsSync(): void {
  triggerGSheetsSync().catch((err) => {
    console.error("Background GSheets sync failed:", err);
  });
}
