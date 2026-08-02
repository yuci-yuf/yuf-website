"use client";

import { useEffect, useState } from "react";
import { FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function GSheetsSyncCard() {
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/sync-gsheets")
      .then((res) => res.json())
      .then((data) => setConfigured(Boolean(data.configured)))
      .catch(() => setConfigured(false));
  }, []);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
            <FileSpreadsheet className="h-5 w-5 text-success-dark" />
            Google Sheets Auto-Sync
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs sm:text-sm">
            Live automatic synchronization of all participant registrations
          </CardDescription>
        </div>
        {configured === true && (
          <Badge className="border border-success/30 bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success-dark hover:bg-success/15">
            ● Live Auto-Sync Active
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {configured === false && (
          <div className="flex items-center gap-2 rounded-md border border-warning/30 bg-warning/10 p-3 text-xs text-warning-dark">
            <AlertCircle className="h-4 w-4 shrink-0 text-warning-dark" />
            <span>
              <code className="font-mono font-semibold">GOOGLE_SHEETS_WEBHOOK_URL</code> is not set in environment variables. Live automatic sync will activate once configured.
            </span>
          </div>
        )}

        {configured === true && (
          <div className="flex items-center gap-2 rounded-md border border-success/25 bg-success/10 p-2.5 text-xs text-success-dark">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-success-dark" />
            <span>Every registration and status update is automatically pushed to Google Sheets in real time.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
