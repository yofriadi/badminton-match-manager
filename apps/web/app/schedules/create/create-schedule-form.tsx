"use client";

import React from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
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
import { ScheduleDateTimePicker } from "@/components/ui/schedule-date-time-picker";
import { Combobox } from "@/components/ui/combobox";

const formSchema = z.object({
  hallId: z
    .string({
      message: "Please choose a hall.",
    })
    .min(1, { message: "Please choose a hall." }),
  startAt: z.date({
    message: "Please choose a start date and time.",
  }),
  price: z
    .number({
      message: "Please enter a price.",
    })
    .min(1, { message: "Price must be at least 1 IDR." }),
});

type FormValues = z.infer<typeof formSchema>;

// Format number as IDR
const formatIDR = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function CreateScheduleForm({
  hallOptions,
}: {
  hallOptions: { label: string; value: string }[];
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hallId: "",
      startAt: (() => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + 1);
        return date;
      })(),
      price: 0,
    },
  });

  const handleSubmit = (values: FormValues) => {
    try {
      console.log(values);
      toast(
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>,
      );
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="hallId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hall</FormLabel>
              <FormControl>
                <Combobox
                  options={hallOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select a hall"
                  searchPlaceholder="Search halls..."
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
          name="startAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Schedule</FormLabel>
              <FormControl>
                <ScheduleDateTimePicker {...field} />
              </FormControl>
              <FormDescription>
                Choose when the schedule should start.
              </FormDescription>
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

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
