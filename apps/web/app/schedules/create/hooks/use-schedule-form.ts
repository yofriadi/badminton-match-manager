"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, isBefore, startOfDay, startOfToday } from "date-fns";
import { useRouter } from "next/navigation";

import { toast } from "sonner";
import { createSchedule } from "../../lib/actions";
import { combineDateTime } from "@/lib/time-utils";
import { formSchema, type FormValues } from "../validations/schedule-schema";
import { z } from "zod";
import type { UseScheduleFormResult } from "../types";

const defaultValues = {
  hallId: "",
  registeredPlayers: [],
  scheduleDate: startOfDay(addDays(startOfToday(), 1)),
  slots: [
    {
      courts: [],
      startTime: "18:00",
      endTime: "20:00",
    },
  ],
  price: 0,
};

export function useScheduleForm(): UseScheduleFormResult {
  const router = useRouter();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormValues | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema as any),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "slots",
  });

  // Watch hallId for court clearing effect
  const hallId = useWatch({ control: form.control, name: "hallId" }) ?? "";

  // Clear courts selection whenever the hall changes
  useEffect(() => {
    const nextSlots = form.getValues("slots").map((slot) => ({
      ...slot,
      courts: [],
    }));
    form.setValue("slots", nextSlots);
  }, [hallId, form]);

  const minSelectableDate = startOfDay(addDays(startOfToday(), 1));

  const handleSubmit = async (values: FormValues) => {
    // Show confirmation dialog instead of creating immediately
    setPendingFormData(values);
    setShowConfirmDialog(true);
  };

  const handleConfirmCreate = async () => {
    if (!pendingFormData) return;

    setIsCreating(true);
    try {
      const schedule = await createSchedule({
        hallId: pendingFormData.hallId,
        scheduleDate: pendingFormData.scheduleDate.toISOString(),
        price: pendingFormData.price,
        registeredPlayers: pendingFormData.registeredPlayers,
        slots: pendingFormData.slots.map((slot) => ({
          startAt: combineDateTime(pendingFormData.scheduleDate, slot.startTime).toISOString(),
          endAt: combineDateTime(pendingFormData.scheduleDate, slot.endTime).toISOString(),
          courts: slot.courts,
        })),
      });

      if (!schedule) {
        throw new Error("Failed to create schedule");
      }

      toast.success("Schedule created", {
        description: `Created ${pendingFormData.slots.length} schedule(s) for ${pendingFormData.scheduleDate.toLocaleDateString()}.`,
      });

      setShowConfirmDialog(false);
      setPendingFormData(null);

      // Redirect to the schedule detail page
      router.push(`/schedules/${schedule.id}`);
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to create the schedule", {
        description: "Please check the form for errors and try again.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return {
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
  };
}