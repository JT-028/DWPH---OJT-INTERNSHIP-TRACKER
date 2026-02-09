import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from "date-fns"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SimpleCalendarProps {
    selectedDate?: Date
    onSelect?: (date: Date) => void
    mode?: "single" | "view"
}

export function SimpleCalendar({ selectedDate, onSelect, mode = "single" }: SimpleCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date())

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
    const today = new Date()

    const weekDays = ["S", "M", "T", "W", "T", "F", "S"]

    return (
        <div className="p-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Week days header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day, i) => (
                    <div key={i} className="text-center text-xs font-medium text-muted-foreground py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => {
                    const isCurrentMonth = isSameMonth(day, currentMonth)
                    const isSelected = selectedDate && isSameDay(day, selectedDate)
                    const isToday = isSameDay(day, today)

                    return (
                        <button
                            key={i}
                            type="button"
                            onClick={() => onSelect?.(day)}
                            disabled={mode === "view"}
                            className={cn(
                                "h-8 w-8 rounded-lg text-sm transition-all duration-200",
                                "hover:bg-accent hover:text-accent-foreground",
                                "focus:outline-none focus:ring-2 focus:ring-primary",
                                !isCurrentMonth && "text-muted-foreground/50",
                                isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                                isToday && !isSelected && "border-2 border-primary text-primary",
                                mode === "view" && "cursor-default"
                            )}
                        >
                            {format(day, "d")}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
