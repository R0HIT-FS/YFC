"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, Loader2 } from "lucide-react";

export const metadata = {
  title: "Export Data - Saviour Of Sinners",
};

export default function ExportPage() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/export-users");
      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "users.csv";
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-white p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 focus:outline-none outline-none focus:ring-0 focus-visible:ring-0 ring-0 shadow-none">
        <CardHeader>
          <CardTitle className="text-xl ">Export Users</CardTitle>
          <CardDescription className="text-zinc-400">
            Download all users with Room, Group, and Church details as a CSV file.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button
            onClick={handleExport}
            disabled={loading}
            className={`w-full flex items-center gap-2 ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export CSV
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}