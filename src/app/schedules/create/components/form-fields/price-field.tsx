"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { PriceFieldProps } from "../../types";

export function PriceField({
  control,
  name,
  label,
  description,
}: PriceFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder="0"
              {...field}
              onFocus={(e) => e.target.select()}
              onChange={(e) => {
                const value = e.target.value;
                field.onChange(value === "" ? "" : parseInt(value, 10));
              }}
            />
          </FormControl>
          {description && (
            <FormDescription>
              {description}
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
