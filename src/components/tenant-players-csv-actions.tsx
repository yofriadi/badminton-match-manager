"use client";

import { type ChangeEvent, useRef, useState } from "react";
import { Download, Info, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TenantPlayersCsvActionsProps {
  onImportSuccess: () => Promise<void> | void;
  showExport?: boolean;
}

function getDownloadFilename(contentDisposition: string | null) {
  const match = contentDisposition?.match(/filename="?([^";]+)"?/i);
  return match?.[1] ?? "tenant-players.csv";
}

async function getErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error || "Request failed";
  } catch {
    return "Request failed";
  }
}

export function TenantPlayersCsvActions({
  onImportSuccess,
  showExport = true,
}: TenantPlayersCsvActionsProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    setIsExporting(true);

    try {
      const response = await fetch("/api/tenant/players?format=csv");

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = getDownloadFilename(
        response.headers.get("content-disposition"),
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
      toast.success("Tenant players exported.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to export tenant players.",
      );
    } finally {
      setIsExporting(false);
    }
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setIsImporting(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/tenant/players", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const body = (await response.json()) as { importedCount: number };
      await onImportSuccess();
      toast.success(`Imported ${body.importedCount} player(s).`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to import tenant players.",
      );
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2 w-full">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleImport}
        aria-label="Upload CSV file"
      />
      <div className="flex items-center justify-center w-full">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rounded-full"
          disabled={isImporting || isExporting}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="mr-1 h-4 w-4" />
          {isImporting ? "Importing..." : "Import from CSV"}
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="p-0 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none shrink-0"
              aria-label="CSV format information"
            >
              <Info className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="center" className="w-64 p-4">
            <div className="space-y-2">
              <h4 className="font-semibold leading-none text-foreground">
                CSV Format Required
              </h4>
              <p className="text-xs text-muted-foreground">
                The CSV file must contain the following column headers:
              </p>
              <ul className="list-disc pl-4 text-xs space-y-1 text-muted-foreground">
                <li>
                  <code className="font-semibold text-foreground">name</code>
                </li>
                <li>
                  <code className="font-semibold text-foreground">gender</code>
                  <span className="text-[10px] opacity-75 block">
                    Values: <code className="text-foreground">male</code> |{" "}
                    <code className="text-foreground">female</code>
                  </span>
                </li>
                <li>
                  <code className="font-semibold text-foreground">
                    skill_level
                  </code>
                  <span className="text-[10px] opacity-75 block">
                    Values: <code className="text-foreground">unrated</code> |{" "}
                    <code className="text-foreground">beginner</code> |{" "}
                    <code className="text-foreground">novice</code> |{" "}
                    <code className="text-foreground">intermediate</code> |{" "}
                    <code className="text-foreground">advanced</code> |{" "}
                    <code className="text-foreground">pro</code>
                  </span>
                </li>
              </ul>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {showExport && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          disabled={isImporting || isExporting}
          onClick={handleExport}
        >
          <Download className="mr-1 h-4 w-4" />
          {isExporting ? "Exporting..." : "Export CSV"}
        </Button>
      )}
    </div>
  );
}
