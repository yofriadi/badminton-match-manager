import { getHalls } from "../lib/api";
import { HallBlueprint } from "./hall-blueprint";

export async function HallList() {
  const halls = await getHalls();

  return (
    <>
      {halls.map((hall) => (
        <HallBlueprint
          key={hall.id}
          hall={{
            id: hall.id,
            name: hall.name,
            address: hall.address || "",
            description: hall.description || "",
            priceRange: hall.priceRange || "",
            amenities: hall.amenities,
            rows: hall.layout.rows,
            players: [],
          }}
          detailHref={`/hall/${hall.id}`}
        />
      ))}
    </>
  );
}
