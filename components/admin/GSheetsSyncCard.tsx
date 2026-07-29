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
            <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Google Sheets Auto-Sync
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs sm:text-sm">
            Live automatic synchronization of all participant registrations
          </CardDescription>
        </div>
        {configured === true && (
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-300 dark:border-emerald-800 text-xs px-2.5 py-0.5">
            ● Live Auto-Sync Active
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {configured === false && (
          <div className="flex items-center gap-2 rounded-md bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <code className="font-mono font-semibold">GOOGLE_SHEETS_WEBHOOK_URL</code> is not set in environment variables. Live automatic sync will activate once configured.
            </span>
          </div>
        )}

        {configured === true && (
          <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/20 p-2.5 rounded-md border border-emerald-200/60 dark:border-emerald-900/40">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Every registration and status update is automatically pushed to Google Sheets in real time.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
