"use client";

import { Form } from "@workspace/ui/components/form";
import AnimatedCtaButton from "@workspace/ui/components/animated-cta-button";
import { formatIDR } from "@/lib/utils";

import { HallFormField } from "./form-fields/hall-form-field";
import { PlayersFormField } from "./form-fields/players-form-field";
import { ScheduleDateField } from "./form-fields/schedule-date-field";
import { PriceField } from "./form-fields/price-field";
import { SlotManager } from "./slot-manager";
import { ScheduleConfirmationDialog } from "./schedule-confirmation-dialog";
import { useScheduleForm } from "../hooks/use-schedule-form";
import { useScheduleData } from "../hooks/use-schedule-data";
import type { ScheduleFormContainerProps } from "../types";

export function ScheduleFormContainer({
  onSuccess,
  onCancel,
}: ScheduleFormContainerProps) {
  const {
    form,
    fields,
    append,
    remove,
    handleSubmit,
    handleConfirmCreate,
    showConfirmDialog,
    setShowConfirmDialog,
    pendingFormData,
    isCreating,
    hallId,
    minSelectableDate,
  } = useScheduleForm();

  const { courts, isLoadingCourts } = useScheduleData(hallId);

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <HallFormField control={form.control} />

          <ScheduleDateField
            control={form.control}
            name="scheduleDate"
            label="Schedule Date"
            description="Pick the date once. Time is set per court group."
            minDate={minSelectableDate}
          />

          <PriceField
            control={form.control}
            name="price"
            label="Price (IDR)"
            description="Enter the price in Indonesian Rupiah (IDR)."
            formatCurrency={formatIDR}
          />

          <PlayersFormField control={form.control} hallId={hallId} />

          <SlotManager
            fieldArray={{ fields, append, remove }}
            control={form.control}
            hallId={hallId}
            courts={courts}
            isCourtsLoading={isLoadingCourts}
          />

          <div className="flex justify-center">
            <AnimatedCtaButton
              type="submit"
              width="220px"
              height="52px"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Creating..." : "Create"}
            </AnimatedCtaButton>
          </div>
        </form>
      </Form>

      <ScheduleConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmCreate}
        formData={pendingFormData}
        isSubmitting={isCreating}
      />
    </>
  );
}
