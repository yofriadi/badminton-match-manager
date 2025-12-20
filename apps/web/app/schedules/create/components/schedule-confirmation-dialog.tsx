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
} from "@workspace/ui/components/alert-dialog";
import type { ScheduleConfirmationDialogProps } from "../types";

export function ScheduleConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  formData,
  isSubmitting,
}: ScheduleConfirmationDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader className="items-center sm:text-center">
          <AlertDialogTitle>Confirm Schedule Creation</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to create this schedule? This will create{" "}
            {formData?.slots.length} schedule(s) for{" "}
            {formData?.scheduleDate.toLocaleDateString()}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row justify-center gap-2 sm:gap-4">
          <AlertDialogCancel disabled={isSubmitting} className="flex-1 sm:flex-none sm:w-40">
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