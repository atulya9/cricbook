import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children?: React.ReactNode;
  error?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

const SelectTrigger = Select;
const SelectValue = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn("", className)} {...props} />
  )
);
SelectValue.displayName = "SelectValue";

const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
);
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<HTMLOptionElement, React.OptionHTMLAttributes<HTMLOptionElement>>(
  ({ className, ...props }, ref) => (
    <option ref={ref} className={cn("", className)} {...props} />
  )
);
SelectItem.displayName = "SelectItem";

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
};