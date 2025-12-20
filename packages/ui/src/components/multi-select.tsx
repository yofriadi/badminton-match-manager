import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@workspace/ui/components/badge";
import { Button, buttonVariants } from "@workspace/ui/components/button";
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
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  disabled?: boolean;
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
  disabled?: boolean;
};

export function MultiSelector({
  values,
  onValuesChange,
  children,
  className,
  disabled,
}: MultiSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const contextValue = React.useMemo(
    () => ({
      values,
      onValuesChange,
      open,
      setOpen,
      searchTerm,
      setSearchTerm,
      disabled,
    }),
    [values, onValuesChange, open, searchTerm, disabled],
  );

  return (
    <MultiSelectorContext.Provider value={contextValue}>
      <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
        <div className={cn("w-full max-w-[92vw]", className)}>{children}</div>
      </Popover>
    </MultiSelectorContext.Provider>
  );
}

type MultiSelectorTriggerProps = React.HTMLAttributes<HTMLDivElement>;

export function MultiSelectorTrigger({
  className,
  children,
  ...props
}: MultiSelectorTriggerProps) {
  const { disabled } = useMultiSelectorContext("MultiSelectorTrigger");

  return (
    <PopoverTrigger asChild disabled={disabled}>
      <div
        className={cn(
          buttonVariants({ variant: "outline" }),
          "flex min-h-9 h-auto w-full items-center justify-between gap-2 whitespace-normal px-3 py-2",
          "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className,
        )}
        {...props}
      >
        <div className="flex flex-1 flex-wrap items-center gap-1 min-w-0">
          {children}
        </div>
        <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0 pointer-events-none" />
      </div>
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
  const { setOpen, searchTerm, setSearchTerm, disabled } =
    useMultiSelectorContext("MultiSelectorInput");

  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      onFocus={() => !disabled && setOpen(true)}
      onClick={(e) => {
        if (disabled) return;
        e.stopPropagation();
        setOpen(true);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
        }
      }}
      disabled={disabled}
      placeholder={placeholder ?? "Select options"}
      className={cn(
        "flex-1 min-w-0 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground",
        disabled && "cursor-not-allowed",
        className,
      )}
    />
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
        "w-[var(--radix-popover-trigger-width)] max-h-[min(60vh,20rem)] overflow-y-auto p-1 rounded-2xl shadow-2xl",
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
  const { values, onValuesChange, searchTerm, setSearchTerm } =
    useMultiSelectorContext("MultiSelectorItem");
  const selected = values.includes(value);

  const isVisible = React.useMemo(() => {
    if (!searchTerm) return true;
    const lowerSearch = searchTerm.toLowerCase();
    if (typeof children === "string") {
      return children.toLowerCase().includes(lowerSearch);
    }
    return value.toLowerCase().includes(lowerSearch);
  }, [searchTerm, value, children]);

  if (!isVisible) return null;

  const toggle = () => {
    if (selected) {
      onValuesChange(values.filter((item) => item !== value));
    } else {
      onValuesChange([...values, value]);
    }
    setSearchTerm(""); // Clear search after selection
  };

  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={toggle}
      className={cn(
        "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        selected && "bg-accent text-accent-foreground",
        className,
      )}
    >
      <span>{children}</span>
      {selected && <Check className="h-4 w-4" />}
    </button>
  );
}
