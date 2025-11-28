export { cn } from "@workspace/ui/lib/utils";

const RUPIAH_FORMATTER = new Intl.NumberFormat("id-ID");

export function formatRupiahRange(range?: string | null) {
  if (!range) return "Rp -";

  const [minRaw = "", maxRaw = ""] = range.split("-");

  const formatValue = (value: string) => {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return RUPIAH_FORMATTER.format(parsed);
    }
    return value;
  };

  return `Rp ${formatValue(minRaw)} - ${formatValue(maxRaw)}`.trim();
}
