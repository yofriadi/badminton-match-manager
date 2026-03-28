import { formatPriceRange, formatHallAddress } from "@/lib/hall-utils";

interface HallHeaderProps {
  name: string;
  address?: string;
  priceRange?: string;
}

export function HallHeader({ name, address, priceRange }: HallHeaderProps) {
  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{name}</h1>
        <p className="text-sm text-gray-500">{formatHallAddress(address)}</p>
      </div>

      <div className="mt-2">
        <p className="text-xs uppercase tracking-wide text-gray-400 pb-1">
          Price
        </p>
        <p className="text-sm font-medium text-gray-900">
          {formatPriceRange(priceRange)}
        </p>
      </div>
    </div>
  );
}
