import { NextResponse } from "next/server";
import { triggerGSheetsSync } from "@/lib/google-sheets";
import { eventDeskErrorResponse, requireFullAdmin } from "@/lib/event-desk-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const isConfigured = Boolean(
    process.env.GOOGLE_SHEETS_SPREADSHEET_ID || process.env.GOOGLE_SHEETS_WEBHOOK_URL
  );
  return NextResponse.json({
    configured: isConfigured,
    message: isConfigured
      ? "Google Sheets live sync is configured."
      : "Neither GOOGLE_SHEETS_SPREADSHEET_ID nor GOOGLE_SHEETS_WEBHOOK_URL is set.",
  });
}

/**
 * Full resync: rebuilds the sheet mirror from every registration (one read per
 * registration), so it's admin-only — unauthenticated it was a free way to
 * burn Firestore reads.
 */
export async function POST(request: Request) {
  try {
    await requireFullAdmin(request);
  } catch (error) {
    return eventDeskErrorResponse(error);
  }
  const result = await triggerGSheetsSync();
  if (!result.success) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}
