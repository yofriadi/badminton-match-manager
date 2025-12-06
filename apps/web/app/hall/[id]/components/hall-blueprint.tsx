"use client";

import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import type { HallBlueprintProps } from "../../lib/types";
import { layoutRows, measureRows } from "@/lib/layout";

const DEFAULT_FILL = "rgb(209,213,219)";

export const HallBlueprint: React.FC<HallBlueprintProps> = ({
  hall,
  padding = 32,
  courtSize = { width: 133, height: 200 },
  spacing = { row: 36, court: 18 },
  detailHref,
  detailLabel = "detail",
  renderCard = true,
  bookedCourts = [],
}) => {
  const { name, rows } = hall;

  const measurements = React.useMemo(
    () => measureRows(rows, courtSize, spacing),
    [rows, courtSize, spacing],
  );

  const {
    rows: laidOutRows,
    totalHeight,
    totalWidth,
  } = React.useMemo(
    () => layoutRows(measurements, padding, spacing),
    [measurements, padding, spacing],
  );

  const blueprintSvg = (
    <svg
      viewBox={`0 0 ${Math.max(totalWidth, 1)} ${Math.max(totalHeight, 1)}`}
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {laidOutRows.flatMap((row) =>
        row.courts.map((court) => {
          const isBooked = bookedCourts?.includes(court.label);
          const fill = isBooked ? DEFAULT_FILL : "transparent";
          const stroke = isBooked ? "white" : DEFAULT_FILL;
          const strokeWidth = 2;
          const textColor = isBooked ? "white" : DEFAULT_FILL;

          return (
            <React.Fragment key={`${row.number}-${court.index}`}>
              <rect
                x={court.x}
                y={court.y}
                width={court.width}
                height={court.height}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                rx={12}
                ry={12}
              />
              <text
                x={court.x + court.width / 2}
                y={court.y + court.height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={textColor}
                fontSize="48"
                fontWeight={600}
              >
                {court.label}
              </text>
            </React.Fragment>
          );
        }),
      )}
    </svg>
  );

  if (!renderCard) {
    return (
      <div className="w-full max-w-[calc(100vw-2rem)] mx-auto overflow-hidden rounded-3xl">
        {blueprintSvg}
      </div>
    );
  }

  return (
    <Card className="w-full max-w-[calc(100vw-2rem)] overflow-hidden mx-4 mt-4">
      <CardHeader>
        <CardTitle className="flex items-baseline justify-between px-4 pt-4">
          <span>{name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>{blueprintSvg}</CardContent>
      {detailHref ? (
        <CardFooter className="mb-4 flex w-full justify-center">
          <Button
            className="hover:bg-gray-800 rounded-full w-[60%] uppercase"
            asChild
          >
            <Link href={detailHref}>{detailLabel}</Link>
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
};
