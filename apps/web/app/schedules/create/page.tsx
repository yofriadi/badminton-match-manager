"use client";

import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { addDays, isBefore, startOfDay, startOfToday } from "date-fns";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import AnimatedCtaButton from "@/components/ui/animated-cta-button";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as BaseCalendar } from "@workspace/ui/components/calendar";
import { HallSelector } from "@/components/hall-selector";
import { PlayerSelector } from "@/components/player-selector";
import { CourtSelector } from "@/components/court-selector";
import { createSchedule } from "../lib/actions";

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, { message: "Use HH:MM format." });

const toMinutes = (time: string) => {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const slotSchema = z
  .object({
    startTime: timeSchema,
    endTime: timeSchema,
    courts: z.array(z.string()).min(1, { message: "Select at least one court." }),
  })
  .refine((slot) => slot.startTime < slot.endTime, {
    message: "End time must be after start time.",
    path: ["endTime"],
  })
  .refine((slot) => toMinutes(slot.endTime) - toMinutes(slot.startTime) >= 60, {
    message: "End time must be at least 1 hour after start time.",
    path: ["endTime"],
  });

const formSchema = z.object({
  hallId: z.string().min(1, { message: "Please choose a hall." }),
  registeredPlayers: z
    .array(z.string())
    .min(1, { message: "Please select at least one player." }),
  scheduleDate: z.date(),
  slots: z.array(slotSchema).min(1, { message: "Add at least one schedule." }),
  price: z.number().min(1, { message: "Price must be at least 1 IDR." }),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateSchedulePage() {
  const router = useRouter();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormValues | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Format number as IDR
  const formatIDR = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "slots",
  });

  // Keep CourtSelector in sync with the latest hall selection
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

  const combineDateTime = (date: Date, time: string) => {
    const [hours = 0, minutes = 0] = time.split(":").map((value) => Number.parseInt(value, 10));
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  };

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
      toast.error("Failed to create the schedule. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="hallId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hall</FormLabel>
                <FormControl>
                  <HallSelector
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>
                  Pick the hall where the schedule will take place.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scheduleDate"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2">
                <FormLabel>Schedule Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-fit min-w-40 justify-between"
                    >
                      {field.value ? field.value.toLocaleDateString() : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <BaseCalendar
                      mode="single"
                      selected={field.value ?? undefined}
                      onSelect={(value) => {
                        if (!value) return;
                        const normalized = startOfDay(value);
                        if (isBefore(normalized, minSelectableDate)) return;
                        field.onChange(normalized);
                      }}
                      disabled={[{ before: minSelectableDate }]}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>Pick the date once. Time is set per court group.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (IDR)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? 0 : parseInt(value, 10));
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Enter the price in Indonesian Rupiah (IDR). Current value:{" "}
                  {formatIDR(field.value)}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="registeredPlayers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Registered Players</FormLabel>
                <FormControl>
                  <PlayerSelector
                    values={field.value ?? []}
                    onValuesChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>Select multiple options.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-6">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-lg border border-muted-foreground/10 p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Schedule {index + 1}</h3>
                  {fields.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      Remove
                    </Button>
                  ) : null}
                </div>

                <div className="mt-4 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`slots.${index}.startTime`}
                      render={({ field: slotField }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...slotField} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`slots.${index}.endTime`}
                      render={({ field: slotField }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...slotField} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`slots.${index}.courts`}
                    render={({ field: slotField }) => (
                      <FormItem>
                        <FormLabel>Select Courts</FormLabel>
                        <FormControl>
                          <CourtSelector
                            hallId={hallId}
                            values={slotField.value ?? []}
                            onValuesChange={(value) => slotField.onChange(value)}
                          />
                        </FormControl>
                        <FormDescription>
                          Choose courts for this specific time.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}

            <div className="flex w-full gap-3 justify-end">
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => remove(fields.length - 1)}
                >
                  Remove Last
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  append({
                    startTime: form.getValues("slots")[0]?.startTime ?? "18:00",
                    endTime: form.getValues("slots")[0]?.endTime ?? "20:00",
                    courts: [],
                  })
                }
              >
                Add Another Schedule
              </Button>
            </div>
            {form.formState.errors.slots && (
              <p className="text-sm text-destructive">
                {form.formState.errors.slots?.message?.toString() ??
                  "All schedules must be on the same date."}
              </p>
            )}
          </div>

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

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Schedule Creation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to create this schedule? This will create{" "}
              {pendingFormData?.slots.length} schedule(s) for{" "}
              {pendingFormData?.scheduleDate.toLocaleDateString()}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row justify-center gap-4">
            <AlertDialogCancel disabled={isCreating} className="w-40">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCreate} disabled={isCreating} className="w-40">
              {isCreating ? "Creating..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
