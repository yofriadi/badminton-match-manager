"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

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

export const MultiSelector = React.forwardRef<
  HTMLDivElement,
  MultiSelectorProps
>(
  (
    { values, onValuesChange, children, loop: _loop, className, disabled },
    ref,
  ) => {
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
          <div ref={ref} className={cn("w-full max-w-[92vw]", className)}>
            {children}
          </div>
        </Popover>
      </MultiSelectorContext.Provider>
    );
  },
);
MultiSelector.displayName = "MultiSelector";

type MultiSelectorTriggerProps = React.HTMLAttributes<HTMLDivElement>;

export const MultiSelectorTrigger = React.forwardRef<
  HTMLDivElement,
  MultiSelectorTriggerProps
>(({ className, children, ...props }, ref) => {
  const { disabled } = useMultiSelectorContext("MultiSelectorTrigger");

  return (
    <PopoverTrigger asChild disabled={disabled}>
      <div
        ref={ref}
        className={cn(
          "flex min-h-9 h-auto w-full items-center justify-between gap-2 whitespace-normal rounded-4xl border border-border bg-input/30 hover:bg-input/50 px-3 py-1.5 text-sm transition-all outline-none focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 aria-expanded:bg-muted",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className,
        )}
        {...props}
      >
        <div className="flex flex-1 flex-wrap items-center gap-1.5 min-w-0 [&_[data-slot=badge]]:bg-black! [&_[data-slot=badge]]:text-white! [&_[data-slot=badge]]:border-transparent! dark:[&_[data-slot=badge]]:bg-white! dark:[&_[data-slot=badge]]:text-black!">
          {children}
        </div>
        <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0 pointer-events-none" />
      </div>
    </PopoverTrigger>
  );
});
MultiSelectorTrigger.displayName = "MultiSelectorTrigger";

export type MultiSelectorInputProps =
  React.InputHTMLAttributes<HTMLInputElement>;

export const MultiSelectorInput = React.forwardRef<
  HTMLInputElement,
  MultiSelectorInputProps
>(({ placeholder, className, ...props }, ref) => {
  const {
    setOpen,
    searchTerm,
    setSearchTerm,
    disabled,
    values,
    onValuesChange,
  } = useMultiSelectorContext("MultiSelectorInput");

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;

      // intuitive Backspace to delete last item
      if (e.key === "Backspace" && !searchTerm && values.length > 0) {
        onValuesChange(values.slice(0, -1));
      }

      if (e.key === "Enter") {
        e.preventDefault();
      }
    },
    [searchTerm, values, onValuesChange, disabled],
  );

  return (
    <input
      ref={ref}
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      onFocus={() => !disabled && setOpen(true)}
      onClick={(e) => {
        if (disabled) return;
        e.stopPropagation();
        setOpen(true);
      }}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      placeholder={values.length === 0 ? (placeholder ?? "Select options") : ""}
      className={cn(
        "flex-1 min-w-[60px] bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground",
        disabled && "cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
});
MultiSelectorInput.displayName = "MultiSelectorInput";

export type MultiSelectorContentProps = React.ComponentPropsWithoutRef<
  typeof PopoverContent
>;

export const MultiSelectorContent = React.forwardRef<
  React.ElementRef<typeof PopoverContent>,
  MultiSelectorContentProps
>(({ className, children, ...props }, ref) => {
  const { searchTerm, setSearchTerm } = useMultiSelectorContext(
    "MultiSelectorContent",
  );

  return (
    <PopoverContent
      ref={ref}
      className={cn("w-[var(--radix-popover-trigger-width)] p-0", className)}
      align="start"
      {...props}
    >
      <Command className="w-full" filter={undefined}>
        {/* The visible CommandInput so cmdk receives keyboard focus and events */}
        <CommandInput
          value={searchTerm}
          onValueChange={setSearchTerm}
          placeholder="Search..."
        />
        {children}
      </Command>
    </PopoverContent>
  );
});
MultiSelectorContent.displayName = "MultiSelectorContent";

export type MultiSelectorListProps = React.ComponentPropsWithoutRef<
  typeof CommandList
>;

export const MultiSelectorList = React.forwardRef<
  React.ElementRef<typeof CommandList>,
  MultiSelectorListProps
>(({ className, children, ...props }, ref) => {
  return (
    <CommandList
      ref={ref}
      className={cn(
        "no-scrollbar max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto outline-none",
        className,
      )}
      {...props}
    >
      <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
        No results found.
      </CommandEmpty>
      <CommandGroup>{children}</CommandGroup>
    </CommandList>
  );
});
MultiSelectorList.displayName = "MultiSelectorList";

export type MultiSelectorItemProps = {
  value: string;
  children: React.ReactNode;
  className?: string;
};

export const MultiSelectorItem = React.forwardRef<
  HTMLDivElement,
  MultiSelectorItemProps
>(({ value, children, className }, ref) => {
  const { values, onValuesChange, setSearchTerm } =
    useMultiSelectorContext("MultiSelectorItem");
  const selected = values.includes(value);

  const toggle = React.useCallback(() => {
    if (selected) {
      onValuesChange(values.filter((item) => item !== value));
    } else {
      onValuesChange([...values, value]);
    }
    setSearchTerm(""); // Clear search after selection
  }, [selected, values, onValuesChange, setSearchTerm, value]);

  return (
    <CommandItem
      ref={ref as any}
      value={value}
      keywords={typeof children === "string" ? [children, value] : [value]}
      onSelect={toggle}
      className={className}
    >
      <span className="truncate">{children}</span>
      <Check
        className={cn(
          "ml-auto h-4 w-4",
          selected ? "opacity-100" : "opacity-0",
        )}
      />
    </CommandItem>
  );
});
MultiSelectorItem.displayName = "MultiSelectorItem";
