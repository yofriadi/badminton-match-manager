import type { Hall } from "./types";

export async function fetchHalls(): Promise<Hall[]> {
  try {
    const response = await fetch("/api/halls", {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch halls: ${response.statusText}`);
    }

    const hallsData = await response.json();
    return hallsData;
  } catch (error) {
    console.error("Error fetching halls:", error);
    // Return empty array as fallback
    return [];
  }
}