"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyMatchStateProps = {
  message: string;
  onAdjustRound?: () => void;
  showAdjustButton?: boolean;
};

export const EmptyMatchState: React.FC<EmptyMatchStateProps> = ({
  message,
  onAdjustRound,
  showAdjustButton = false,
}) => {
  return (
    <div className="min-h-screen bg-white max-w-7xl space-y-4 py-2 px-1 flex flex-col items-center justify-center">
      <p className="text-center text-gray-500 py-8">{message}</p>
      {showAdjustButton && onAdjustRound && (
        <Button onClick={onAdjustRound}>
          <Plus className="mr-2 h-4 w-4" /> Adjust Round
        </Button>
      )}
    </div>
  );
};
