export { cn } from "@workspace/ui/lib/utils";

const IDR_FORMATTER = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Format currency as Indonesian Rupiah (IDR)
 */
export const formatIDR = (value: number | string): string => {
  const num = typeof value === "number" ? value : parseInt(value, 10);
  if (isNaN(num)) return "Rp 0";
  return IDR_FORMATTER.format(num);
};


/**
 * Format time in Indonesian locale (HH:mm)
 */
export const formatTimeID = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Format date in Indonesian locale (e.g. Monday, 20 Dec)
 */
export const formatDateID = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
};

export function formatRupiahRange(range?: string | null) {
  if (!range) return "Rp -";

  const parts = range.split("-");
  if (parts.length === 0) return "Rp -";

  const formatValue = (value: string) => {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed)) {
      return IDR_FORMATTER.format(parsed);
    }
    return value.trim();
  };

  if (parts.length === 1) return formatValue(parts[0]!);

  return `${formatValue(parts[0]!)} - ${formatValue(parts[1]!)}`.trim();
}

