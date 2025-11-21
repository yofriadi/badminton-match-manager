import Link from "next/link";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { getHalls } from "../lib/api";

import { HallBlueprint } from "../components/hall-blueprint";

export default async function CreateDetailPage() {
  const halls = await getHalls();

  if (!halls || halls.length === 0) {
    return <div>No halls found</div>;
  }

  return (
    <div className="space-y-6 p-4">
      {halls.map((hall) => (
        <Card key={hall.id} className="mx-auto max-w-3xl">
          <CardHeader className="px-4 py-4">
            <CardTitle className="text-2xl font-semibold">{hall.name}</CardTitle>
            <p className="text-sm text-gray-500">{hall.address}</p>
          </CardHeader>
          <CardContent className="flex flex-col p-0">

            <div className="mt-2 px-4">
              <p className="text-xs uppercase tracking-wide text-gray-400 pb-1">
                Layout
              </p>
              <HallBlueprint
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
                renderCard={false}
              />
            </div>

            <div className="px-4 pt-6 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400 pb-1">
                  Price
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {hall.priceRange}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400 pb-2">
                  Amenities
                </p>
                <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                  <div className="flex gap-2 min-w-max">
                    {hall.amenities.map((amenity) => (
                      <Badge
                        key={amenity}
                        variant="secondary"
                        className="text-xs font-normal whitespace-nowrap"
                      >
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="my-4 flex w-full justify-center gap-8">
            <Button asChild className="hover:bg-gray-800 rounded-full w-[80%]">
              <Link href={`/`}>Add this Hall</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
