import { NextResponse } from "next/server";

// Temporary data that matches the database seed data
const hallsData = [
  {
    id: "pasar-tebet-sport-center",
    name: "Pasar Tebet Sport Center",
    address: "Jl. Tebet Barat Dalam Raya No. 12, Tebet, Jakarta Selatan",
    description: "A community-driven complex with well-maintained courts suitable for casual games, leagues, and private coaching sessions.",
    priceRange: "Rp 40.000/session",
    amenities: [
      "Equipment rental",
      "Locker room & showers",
      "On-site cafe",
      "Dedicated parking",
    ],
    rows: [
      {
        number: 1,
        orientation: "horizontal",
        courts: [
          { label: "14", isAvailable: false },
          { label: "15", isAvailable: false },
        ],
      },
      {
        number: 2,
        orientation: "vertical",
        courts: [
          { label: "9" },
          { label: "10" },
          { label: "11" },
          { label: "12", isAvailable: false },
          { label: "13", isAvailable: false },
        ],
      },
    ],
  },
  {
    id: "jifi-arena-badminton",
    name: "JiFi Arena Badminton",
    address: "Jl. Kemang Raya No. 45, Mampang Prapatan, Jakarta Selatan",
    description: "Modern indoor arena offering tournament-grade lighting and flooring, favored by intermediate and advanced players.",
    priceRange: "Rp 50.000/session",
    amenities: [
      "Professional coaching",
      "Stringing service",
      "Pro shop",
      "Cafeteria",
    ],
    rows: [
      {
        number: 1,
        orientation: "vertical",
        courts: [
          { label: "1", isAvailable: false },
          { label: "2" },
          { label: "3" },
        ],
      },
    ],
  },
];

export async function GET() {
  try {
    // Return halls data with empty players array (players data to be added later)
    const hallsWithPlayers = hallsData.map(hall => ({
      ...hall,
      players: [], // Empty for now, will be populated from database later
    }));

    return NextResponse.json(hallsWithPlayers);
  } catch (error) {
    console.error("Error fetching halls:", error);
    return NextResponse.json(
      { error: "Failed to fetch halls" },
      { status: 500 }
    );
  }
}