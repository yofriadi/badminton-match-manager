import type {
	CourtLayout,
	Row,
	RowLayout,
	RowMeasurement,
} from "@/app/halls/lib/types";
import type { BlueprintDimensions } from "./types.js";

export const DEFAULT_BLUEPRINT_DIMENSIONS: BlueprintDimensions = {
	padding: 32,
	courtSize: { width: 133, height: 200 },
	spacing: { row: 36, court: 18 },
};

type LayoutContext = BlueprintDimensions & {
	rows: Row[];
};

const getCourtSize = (
	orientation: Row["orientation"],
	size: BlueprintDimensions["courtSize"],
) =>
	orientation === "vertical"
		? { width: size.width, height: size.height }
		: { width: size.height, height: size.width };

export const measureRows = (
	rows: Row[],
	courtSize: BlueprintDimensions["courtSize"],
	spacing: BlueprintDimensions["spacing"],
): RowMeasurement[] => {
	return rows.map((row) => {
		const orientedSize = getCourtSize(row.orientation, courtSize);
		const courtCount = Math.max(row.courts.length, 1);
		const rowWidth =
			courtCount * orientedSize.width +
			(courtCount - 1) * spacing.court;
		return {
			row,
			courtSize: orientedSize,
			width: rowWidth,
			height: orientedSize.height,
		};
	});
};

export const layoutRows = (
	measurements: RowMeasurement[],
	padding: number,
	spacing: BlueprintDimensions["spacing"],
) => {
	const widestRow = measurements.reduce(
		(maxWidth, measurement) => Math.max(maxWidth, measurement.width),
		0,
	);

	let currentY = padding;

	const rows: RowLayout[] = measurements.map((measurement, rowIndex) => {
		const { row, courtSize, width, height } = measurement;
		const courts: CourtLayout[] = row.courts.map((court, index) => {
			const xOffset =
				padding +
				(widestRow - width) / 2 +
				index * (courtSize.width + spacing.court);

			return {
				...court,
				index,
				x: xOffset,
				y: currentY,
				width: courtSize.width,
				height: courtSize.height,
				orientation: row.orientation,
				isAvailable: court.isAvailable ?? true,
			};
		});

		const rowLayout: RowLayout = {
			number: row.number,
			orientation: row.orientation,
			courts,
			y: currentY,
			height,
		};

		currentY += height;

		if (rowIndex < measurements.length - 1) {
			currentY += spacing.row;
		}

		return rowLayout;
	});

	const totalHeight =
		measurements.reduce(
			(accumulator, measurement) => accumulator + measurement.height,
			0,
		) +
		padding * 2 +
		spacing.row * Math.max(measurements.length - 1, 0);

	return {
		rows,
		totalWidth: widestRow + padding * 2,
		totalHeight,
	};
};

export const createBlueprintLayout = ({
	rows,
	padding,
	courtSize,
	spacing,
}: LayoutContext) => {
	const measurements = measureRows(rows, courtSize, spacing);
	return layoutRows(measurements, padding, spacing);
};
