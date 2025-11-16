import Link from "next/link";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardFooter } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";

import { HallBlueprint } from "../components/hall-blueprint";
import { halls } from "../lib/data"

export default function CreateDetailPage() {
  return (
    <>
      <Card className="mx-auto max-w-3xl mx-4 mt-4">
        <CardContent className="flex flex-col p-0">
          <div className="px-4 py-4 space-y-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold">{halls[0].name}</h1>
              <p className="text-sm text-gray-500">{halls[0].address}</p>
            </div>
          </div>

          <div className="mt-2 px-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 pb-1">
              Layout
            </p>
            <HallBlueprint hall={halls[0]} renderCard={false} />
          </div>

          <div className="px-4 pt-6 space-y-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 pb-1">
                Price
              </p>
              <p className="text-sm font-medium text-gray-900">{halls[0].priceRange}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 pb-2">
                Amenities
              </p>
              <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                <div className="flex gap-2 min-w-max">
                  {halls[0].amenities.map((amenity) => (
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
