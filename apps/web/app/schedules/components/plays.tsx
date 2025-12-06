import { ScheduleCard } from "@/components/schedule-card";
import { PlaysProps } from "../lib/types";

export const Plays: React.FC<PlaysProps> = ({ schedule }) => (
  <ScheduleCard schedule={schedule} />
);
