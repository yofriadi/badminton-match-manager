export interface PlaySession {
  timeStart: string;
  timeEnd: string;
  court: string | string[];
  playerLevel: string;
}

export interface ScheduleData {
  id: string;
  hallId: string;
  hall: string;
  price: string;
  date: string;
  tags: string[];
  sessions: PlaySession[];
}

export interface PlaysProps {
  schedule: ScheduleData;
}
