import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createBlueprintLayout } from "./layout.js";
import type { HallBlueprintParams } from "./types.js";

const DEFAULT_FILL = "rgb(209,213,219)";

export function generateHallSvg({
	rows,
	padding,
	courtSize,
	spacing,
}: HallBlueprintParams) {
	const { rows: laidOutRows, totalWidth, totalHeight } =
		createBlueprintLayout({
			rows,
			padding,
			courtSize,
			spacing,
		});

	// @ts-ignore
	const svg = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox={`0 0 ${Math.max(totalWidth, 1)} ${Math.max(totalHeight, 1)}`}
			preserveAspectRatio="xMidYMid meet"
		>
			{laidOutRows.flatMap((row) =>
				row.courts.map((court) => (
					<React.Fragment key={`${row.number}-${court.index}`}>
						<rect
							x={court.x}
							y={court.y}
							width={court.width}
							height={court.height}
							fill="transparent"
							stroke={DEFAULT_FILL}
							strokeWidth={2}
							rx={12}
							ry={12}
						/>
						<text
							x={court.x + court.width / 2}
							y={court.y + court.height / 2}
							textAnchor="middle"
							dominantBaseline="middle"
							fill={DEFAULT_FILL}
							fontSize="48"
							fontWeight={600}
						>
							{court.label}
						</text>
					</React.Fragment>
				)),
			)}
		</svg>
	);

	return renderToStaticMarkup(svg);
}
