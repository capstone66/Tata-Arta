import { DayPicker, type DayPickerProps } from "react-day-picker"
import "react-day-picker/style.css"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = DayPickerProps

function Calendar({ className, classNames, ...props }: CalendarProps) {
  return (
    <DayPicker
      className={cn("p-3", className)}
      classNames={{
        today: "font-bold text-primary",
        selected: "bg-primary text-primary-foreground rounded-lg!",
        range_start: "rounded-l-lg!",
        range_end: "rounded-r-lg!",
        outside: "text-muted-foreground/50",
        disabled: "text-muted-foreground/30 line-through",
        hidden: "invisible",
        nav: "flex items-center gap-1",
        chevron: "h-4 w-4 fill-primary",
        month_caption: "flex items-center justify-center font-heading text-sm font-semibold",
        month_grid: "w-full border-collapse",
        weekday: "p-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
        day: "h-9 w-9 p-0 text-sm font-normal aria-selected:opacity-100",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal rounded-lg",
        ),
        ...classNames,
      }}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
