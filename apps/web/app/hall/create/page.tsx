import Link from "next/link";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardFooter } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";

import { HallBlueprint } from "../components/hall-blueprint";
import { getHalls } from "../actions";

export default async function CreateDetailPage() {
  const halls = await getHalls();
  const hall = halls[0];

  return (
    <>
      <Card className="mx-auto max-w-3xl mx-4 mt-4">
        <CardContent className="flex flex-col p-0">
          <div className="px-4 py-4 space-y-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold">{hall?.name || "Hall Creation"}</h1>
              <p className="text-sm text-gray-500">{hall?.address || "Address"}</p>
            </div>
          </div>

          <div className="mt-2 px-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 pb-1">
              Layout
            </p>
            {hall ? (
              <HallBlueprint 
                hall={hall} 
                renderCard={false}
                padding={hall.layout?.padding}
                courtSize={hall.layout?.courtSize}
                spacing={hall.layout?.spacing}
              />
            ) : (
              <div className="p-4 text-center text-gray-500">No hall data available</div>
            )}
          </div>

          <div className="px-4 pt-6 space-y-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 pb-1">
                Price
              </p>
              <p className="text-sm font-medium text-gray-900">{hall?.priceRange || "Price Range"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 pb-2">
                Amenities
              </p>
              <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                <div className="flex gap-2 min-w-max">
                  {hall?.amenities?.map((amenity) => (
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
    </>
  );
}
