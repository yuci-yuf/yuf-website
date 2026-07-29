import { NextResponse } from "next/server";
import { triggerGSheetsSync } from "@/lib/google-sheets";

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

export async function POST() {
  const result = await triggerGSheetsSync();
  if (!result.success) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}
