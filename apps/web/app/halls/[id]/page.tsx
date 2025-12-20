import { notFound } from "next/navigation";
import { HallDetailContent } from "./components/hall-detail-content";
import { getHallWithDetails, getHallSchedules } from "./lib/hall-service";

// Disable static generation since this page fetches data from database
export const dynamic = "force-dynamic";

type HallDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function HallDetailPage({ params }: HallDetailPageProps) {
  const { id } = await params;

  // Fetch hall details with players
  const hall = await getHallWithDetails(id);
  if (!hall) {
    notFound();
  }

  // Fetch hall schedules
  const schedules = await getHallSchedules(id, hall.name);

  return <HallDetailContent hall={hall} schedules={schedules} />;
}
