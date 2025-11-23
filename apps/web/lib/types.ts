import type { Row } from "@/app/hall/lib/types";

export interface BlueprintDimensions {
	padding: number;
	courtSize: {
		width: number;
		height: number;
	};
	spacing: {
		row: number;
		court: number;
	};
}

export interface HallBlueprintParams extends BlueprintDimensions {
	hallId?: string;
	rows: Row[];
}
