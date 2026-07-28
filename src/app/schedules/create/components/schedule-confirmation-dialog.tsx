"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatIDR, formatDateID } from "@/lib/utils";
import type { ScheduleConfirmationDialogProps } from "../types";
import { Calendar, Clock, MapPin, Users, Coins, FileText } from "lucide-react";

export function ScheduleConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  formData,
  isSubmitting,
  halls = [],
  courts = [],
}: ScheduleConfirmationDialogProps) {
  if (!formData) return null;

  const hallName =
    halls.find((h) => h.value === formData.hallId)?.label || "Selected Hall";

  const formattedDate = formData.scheduleDate
    ? formatDateID(formData.scheduleDate)
    : "No date selected";

  const formattedPrice = formatIDR(formData.price || 0);

  const slotsCount = formData.slots?.length || 0;
  const playerCount = formData.registeredPlayers?.length || 0;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-lg">
        <AlertDialogHeader className="items-center sm:text-center">
          <AlertDialogTitle className="text-xl font-semibold">
            Confirm Schedule Creation
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Please review the details of the schedule you are about to create.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Scrollable content container */}
        <ScrollArea className="max-h-[50vh] sm:max-h-[60vh] -mr-4 pr-4">
          <div className="space-y-5 my-2">
            {/* Detail Section Header */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="size-3.5 text-muted-foreground" />
                Detail
              </h4>

              {/* Summary Overview Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/40 border border-border/50 text-sm">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <MapPin className="size-4 shrink-0" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Hall
                    </span>
                    <span
                      className="font-semibold text-foreground truncate max-w-[180px]"
                      title={hallName}
                    >
                      {hallName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Calendar className="size-4 shrink-0" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Date
                    </span>
                    <span className="font-semibold text-foreground">
                      {formattedDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Coins className="size-4 shrink-0" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Price per Slot
                    </span>
                    <span className="font-semibold text-foreground">
                      {formattedPrice}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Users className="size-4 shrink-0" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Players
                    </span>
                    <span className="font-semibold text-foreground">
                      {playerCount} registered
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Slots & Courts Details */}
            {slotsCount > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Clock className="size-3.5 text-muted-foreground" />
                  Time Slots & Courts
                </h4>
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 space-y-3.5">
                  {formData.slots.map((slot, index) => {
                    const slotCourtNames = slot.courts.map(
                      (id) =>
                        courts.find((c) => c.value === id)?.label ||
                        `Court ${id}`,
                    );
                    return (
                      <div key={index} className="flex items-center gap-3">
                        {/* Styled Number Badge - same shape as overview details icons */}
                        <div className="size-8 rounded-xl bg-primary/10 text-primary shrink-0 flex items-center justify-center text-xs font-bold font-mono">
                          {index + 1}
                        </div>

                        {/* Content area: time slot and court badges */}
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-foreground">
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {slotCourtNames.map((courtName, cIdx) => (
                              <Badge
                                key={cIdx}
                                variant="secondary"
                                className="px-2 py-0 h-5 text-[10px] font-semibold"
                              >
                                {courtName}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <AlertDialogFooter className="flex-row justify-center gap-2 sm:gap-4 mt-2">
          <AlertDialogCancel
            disabled={isSubmitting}
            className="flex-1 sm:flex-none sm:w-40"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none sm:w-40"
          >
            {isSubmitting ? "Creating..." : "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
