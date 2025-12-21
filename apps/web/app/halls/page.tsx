import { AppPageLayout } from "@/components/app-page-layout";
import { getHallsForCurrentTenant } from "@/app/halls/lib/actions";
import { HallsContent } from "./components/halls-content";

// Disable static generation since this page fetches data from database
export const dynamic = "force-dynamic";

export default async function Hall() {
  const halls = await getHallsForCurrentTenant();

  return (
    <AppPageLayout buttonLink="/halls/create" buttonText="Add Hall">
      <HallsContent halls={halls || []} />
    </AppPageLayout>
  );
}
