import { ScheduleData } from "./types";

export const schedules: ScheduleData[] = [
  {
    id: "pasar-tebet-sport-center-oct-12",
    hallId: "pasar-tebet-sport-center",
    hall: "Pasar Tebet Sport Center",
    price: "Rp 45.000",
    date: "Oct 12",
    sessions: [
      {
        timeStart: "20:00",
        timeEnd: "22:00",
        court: ["9", "10", "11"],
        playerLevel: "beginner - advanced",
        tags: ["Include shuttlecocks", "Minimum 3 plays"],
      },
      {
        timeStart: "21:00",
        timeEnd: "22:00",
        court: ["14"],
        playerLevel: "intermediate - advanced",
        tags: ["Include shuttlecocks", "Equipment provided", "Coach available"],
      },
    ],
  },
  {
    id: "jifi-arena-badminton-oct-22",
    hallId: "jifi-arena-badminton",
    hall: "JiFi Arena Badminton",
    price: "Rp 50.000",
    date: "Oct 22",
    sessions: [
      {
        timeStart: "20:00",
        timeEnd: "22:00",
        court: ["1", "2"],
        playerLevel: "beginner - advanced",
        tags: ["Include shuttlecocks", "Minimum 3 plays"],
      },
      {
        timeStart: "21:00",
        timeEnd: "22:00",
        court: ["3"],
        playerLevel: "intermediate - advanced",
        tags: ["Include shuttlecocks", "Equipment provided", "Coach available"],
      },
    ],
  },
  {
    id: "jifi-arena-badminton-oct-26",
    hallId: "jifi-arena-badminton",
    hall: "JiFi Arena Badminton",
    price: "Rp 50.000",
    date: "Oct 26",
    sessions: [
      {
        timeStart: "20:00",
        timeEnd: "22:00",
        court: ["1", "2"],
        playerLevel: "beginner - advanced",
        tags: ["Include shuttlecocks", "Minimum 3 plays"],
      },
    ],
  },
];

export const getScheduleById = (id: string) =>
  schedules.find((schedule) => schedule.id === id);
