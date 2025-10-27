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
import type {
  HallBlueprintProps,
  RowMeasurement,
  CourtLayout,
  Row,
  RowLayout,
  RowOrientation,
} from "../lib/types";

const DEFAULT_FILL = "rgb(209,213,219)";

const getCourtSize = (
  orientation: RowOrientation,
  size: { width: number; height: number },
) =>
  orientation === "vertical"
    ? { width: size.width, height: size.height }
    : { width: size.height, height: size.width };

const measureRows = (
  rows: Row[],
  courtSize: { width: number; height: number },
  spacing: { row: number; court: number },
): RowMeasurement[] => {
  return rows.map((row) => {
    const orientedSize = getCourtSize(row.orientation, courtSize);
    const courtCount = Math.max(row.courts.length, 1);
    const rowWidth =
      courtCount * orientedSize.width + (courtCount - 1) * spacing.court;
    return {
      row,
      courtSize: orientedSize,
      width: rowWidth,
      height: orientedSize.height,
    };
  });
};

const layoutRows = (
  measurements: RowMeasurement[],
  padding: number,
  spacing: { row: number; court: number },
) => {
  const widestRow = measurements.reduce(
    (maxWidth, measurement) => Math.max(maxWidth, measurement.width),
    0,
  );

  let currentY = padding;

  const rows: RowLayout[] = measurements.map((measurement, rowIndex) => {
    const { row, courtSize, width, height } = measurement;
    const courts: CourtLayout[] = row.courts.map((court, idx) => {
      const xOffset =
        padding +
        (widestRow - width) / 2 +
        idx * (courtSize.width + spacing.court);
      return {
        ...court,
        index: idx,
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

  return {
    rows,
    totalWidth: widestRow + padding * 2,
    totalHeight:
      measurements.reduce((acc, measurement) => acc + measurement.height, 0) +
      padding * 2 +
      spacing.row * Math.max(measurements.length - 1, 0),
  };
};

export const HallBlueprint: React.FC<HallBlueprintProps> = ({
  hall,
  padding = 32,
  courtSize = { width: 133, height: 200 },
  spacing = { row: 36, court: 18 },
  detailHref,
  detailLabel = "Detail",
  renderCard = true,
}) => {
  const { label, rows } = hall;

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
          /*const isAvailable = court.isAvailable;
          const fill = isAvailable
            ? (court.fill ?? DEFAULT_FILL)
            : "transparent";
          const stroke = isAvailable ? "none" : DEFAULT_FILL;
          const strokeWidth = isAvailable ? 0 : 2;
          const textColor = isAvailable ? "white" : DEFAULT_FILL;*/
          const fill = "transparent";
          const stroke = DEFAULT_FILL;
          const strokeWidth = 2;
          const textColor = DEFAULT_FILL;

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
          <span>{label}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>{blueprintSvg}</CardContent>
      {detailHref ? (
        <CardFooter className="mb-4 mt-2 flex w-full justify-center">
          <Button className="hover:bg-gray-800 rounded-full w-[70%]" asChild>
            <Link href={detailHref}>{detailLabel}</Link>
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
};
