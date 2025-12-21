import type { Hall } from "../app/halls/lib/types";
import { formatRupiahRange } from "./utils";

/**
 * Create a hall blueprint object with properly labeled courts
 * This eliminates the need for manual court counting in multiple places
 */
export function createHallBlueprint(
  hall: (Partial<Hall> & { rows?: any[]; layout?: any; courtNumbers?: number[] }) | any,
) {
  let courtCounter = 0;
  const rows = hall.rows || hall.layout?.rows || [];
  const courtNumbers = hall.courtNumbers || [];

  return {
    id: hall.id,
    name: hall.name,
    address: hall.address || "",
    description: hall.description || "",
    priceRange: hall.priceRange || "",
    amenities: hall.amenities || [],
    rows: (rows as any[]).map((row) => ({
      number: row.number,
      orientation: row.orientation,
      courts: row.courts.map((court: any) => {
        const index = courtCounter++;
        return {
          // Prefer explicit label; fall back to name, then to courtNumbers[index], finally to index+1
          label: court.label || court.name || (courtNumbers[index] !== undefined ? String(courtNumbers[index]) : String(index + 1)),
          fill: court.fill,
          isAvailable: court.isAvailable,
        };
      }),
    })),
    players: hall.players || [],
    courtCount: hall.courtCount || courtCounter,
    courtNumbers: courtNumbers,
  };
}

/**
 * Format price range string for display
 */
export function formatPriceRange(priceRange?: string | null): string {
  if (!priceRange) return "Price not available";
  return formatRupiahRange(priceRange);
}

/**
 * Format hall address for display
 */
export function formatHallAddress(address?: string): string {
  if (!address) return "Address not available";
  return address;
}


