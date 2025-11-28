import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";

type MultiSelectorContextValue = {
  values: string[];
  onValuesChange: (values: string[]) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const MultiSelectorContext =
  React.createContext<MultiSelectorContextValue | null>(null);

function useMultiSelectorContext(component: string) {
  const context = React.useContext(MultiSelectorContext);
  if (!context) {
    throw new Error(`${component} must be used within <MultiSelector>`);
  }

  return context;
}

export type MultiSelectorProps = {
  values: string[];
  onValuesChange: (values: string[]) => void;
  children: React.ReactNode;
  loop?: boolean;
  className?: string;
};

export function MultiSelector({
  values,
  onValuesChange,
  children,
  className,
}: MultiSelectorProps) {
  const [open, setOpen] = React.useState(false);

  const contextValue = React.useMemo(
    () => ({ values, onValuesChange, open, setOpen }),
    [values, onValuesChange, open],
  );

  return (
    <MultiSelectorContext.Provider value={contextValue}>
      <Popover open={open} onOpenChange={setOpen}>
        <div className={cn("w-full max-w-[92vw]", className)}>{children}</div>
      </Popover>
    </MultiSelectorContext.Provider>
  );
}

type MultiSelectorTriggerProps = React.ComponentPropsWithoutRef<typeof Button>;

export function MultiSelectorTrigger({
  className,
  children,
  ...props
}: MultiSelectorTriggerProps) {
  return (
    <PopoverTrigger asChild>
      <Button
        type="button"
        variant="outline"
        className={cn(
          "flex w-full items-center justify-between gap-2",
          className,
        )}
        {...props}
      >
        <span className="flex-1 min-w-0 text-left">{children}</span>
        <ChevronsUpDown className="h-4 w-4 opacity-50" />
      </Button>
    </PopoverTrigger>
  );
}

export type MultiSelectorInputProps = {
  placeholder?: string;
  className?: string;
};

export function MultiSelectorInput({
  placeholder,
  className,
}: MultiSelectorInputProps) {
  const { values } = useMultiSelectorContext("MultiSelectorInput");

  if (!values?.length) {
    return (
      <span
        className={cn("text-sm font-normal text-muted-foreground", className)}
      >
        {placeholder ?? "Select options"}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "flex max-w-full gap-1 overflow-x-auto",
        "flex-nowrap",
        "[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/40",
        className,
      )}
    >
      {values.map((value) => (
        <Badge key={value} variant="secondary">
          {value}
        </Badge>
      ))}
    </span>
  );
}

export type MultiSelectorContentProps = React.ComponentPropsWithoutRef<
  typeof PopoverContent
>;

export function MultiSelectorContent({
  className,
  ...props
}: MultiSelectorContentProps) {
  return (
    <PopoverContent
      className={cn(
        "w-[var(--radix-popover-trigger-width)] max-h-[min(60vh,20rem)] overflow-y-auto p-2",
        className,
      )}
      align="start"
      {...props}
    />
  );
}

export type MultiSelectorListProps = React.HTMLAttributes<HTMLDivElement>;

export function MultiSelectorList({
  className,
  ...props
}: MultiSelectorListProps) {
  return (
    <div className={cn("grid gap-1", className)} role="listbox" {...props} />
  );
}

export type MultiSelectorItemProps = {
  value: string;
  children: React.ReactNode;
  className?: string;
};

export function MultiSelectorItem({
  value,
  children,
  className,
}: MultiSelectorItemProps) {
  const { values, onValuesChange } =
    useMultiSelectorContext("MultiSelectorItem");
  const selected = values.includes(value);

  const toggle = () => {
    if (selected) {
      onValuesChange(values.filter((item) => item !== value));
    } else {
      onValuesChange([...values, value]);
    }
  };

  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={toggle}
      className={cn(
        "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
        "hover:bg-muted",
        selected && "bg-muted",
        className,
      )}
    >
      <span>{children}</span>
      {selected && <Check className="h-4 w-4" />}
    </button>
  );
}
