export type RowOrientation = "vertical" | "horizontal";

export interface Court {
  label: string;
  fill?: string;
  isAvailable?: boolean;
}

export interface Row {
  number: number;
  orientation: RowOrientation;
  courts: Court[];
}

export type SkillLevel =
  | "unrated"
  | "beginner"
  | "novice"
  | "intermediate"
  | "advanced"
  | "pro";

export type PlayerGender = "male" | "female";

export interface Player {
  name: string;
  gender: PlayerGender;
  skillLevel: SkillLevel;
}

export interface Hall {
  id: string;
  name: string;
  address: string | null;
  description: string | null;
  priceRange: string;
  amenities: string[];
  rows: Row[];
  players: Player[];
  courtCount: number;
  courtNumbers: number[];
}

export interface HallBlueprintProps {
  hall: Hall;
  padding?: number;
  courtSize?: {
    width: number;
    height: number;
  };
  spacing?: {
    row: number;
    court: number;
  };
  detailHref?: string;
  detailLabel?: string;
  renderCard?: boolean;
  bookedCourts?: string[];
}

export interface RowMeasurement {
  row: Row;
  courtSize: {
    width: number;
    height: number;
  };
  width: number;
  height: number;
}

export interface CourtLayout extends Court {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  orientation: RowOrientation;
  isAvailable: boolean;
}

export interface RowLayout {
  number: number;
  orientation: RowOrientation;
  courts: CourtLayout[];
  y: number;
  height: number;
}
