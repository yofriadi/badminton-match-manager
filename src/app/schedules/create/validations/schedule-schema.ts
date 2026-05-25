import { z } from "zod";

export const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, { message: "Use HH:MM format." });

export const toMinutes = (time: string) => {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const slotSchema = z
  .object({
    startTime: timeSchema,
    endTime: timeSchema,
    courts: z
      .array(z.string())
      .min(1, { message: "Select at least one court." }),
  })
  .refine((slot) => slot.startTime < slot.endTime, {
    message: "End time must be after start time.",
    path: ["endTime"],
  })
  .refine((slot) => toMinutes(slot.endTime) - toMinutes(slot.startTime) >= 60, {
    message: "End time must be at least 1 hour after start time.",
    path: ["endTime"],
  });

export const formSchema = z.object({
  hallId: z.string().min(1, { message: "Please choose a hall." }),
  registeredPlayers: z
    .array(z.string())
    .min(1, { message: "Please select at least one player." }),
  scheduleDate: z.date(),
  slots: z.array(slotSchema).min(1, { message: "Add at least one schedule." }),
  price: z.number().min(1, { message: "Price must be at least 1 IDR." }),
});

export type FormValues = z.infer<typeof formSchema>;
