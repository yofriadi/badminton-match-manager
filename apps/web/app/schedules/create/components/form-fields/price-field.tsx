"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import type { PriceFieldProps } from "../../types";

export function PriceField({
  control,
  name,
  label,
  description,
  formatCurrency,
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
              {description} Current value: {formatCurrency(field.value)}
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}