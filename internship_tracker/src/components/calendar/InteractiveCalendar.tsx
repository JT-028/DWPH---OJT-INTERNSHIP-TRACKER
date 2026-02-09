import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    startOfWeek,
    endOfWeek,
    isBefore,
    startOfDay
} from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn, formatDate } from "@/lib/utils"
import type { DailyLog, Holiday, InternSettings } from "@/types"

interface InteractiveCalendarProps {
    logs: DailyLog[]
    holidays: Holiday[]
    settings: InternSettings
    selectedDate: Date | null
    onSelectDate: (date: Date) => void
}

export function InteractiveCalendar({
    logs,
    holidays,
    settings,
    selectedDate,
    onSelectDate
}: InteractiveCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date())

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
    const today = new Date()
    const startDate = settings.startDate ? startOfDay(new Date(settings.startDate)) : null

    const weekDays = ["S", "M", "T", "W", "T", "F", "S"]

    // Create lookup maps for quick access
    const logsMap = useMemo(() => {
        const map = new Map<string, DailyLog>()
        logs.forEach((log) => {
            map.set(formatDate(new Date(log.date)), log)
        })
        return map
    }, [logs])

    const holidaysMap = useMemo(() => {
        const map = new Map<string, Holiday>()
        holidays.forEach((h) => {
            map.set(h.date, h)
        })
        return map
    }, [holidays])

    const getDayStatus = (date: Date) => {
        const dateStr = formatDate(date)
        const log = logsMap.get(dateStr)
        const holiday = holidaysMap.get(dateStr)
        const dayOfWeek = date.getDay()
        const isWorkday = settings.workDays.includes(dayOfWeek)
        const isToday = isSameDay(date, today)
        const isBeforeStart = startDate ? isBefore(startOfDay(date), startDate) : false
        const isHolidayDay = settings.excludeHolidays && !!holiday

        // A day is inactive if:
        // 1. It's before the start date, OR
        // 2. It's not a workday (not in workDays array), OR
        // 3. It's a holiday (when excludeHolidays is true)
        const isInactive = isBeforeStart || !isWorkday || isHolidayDay

        return {
            log,
            holiday,
            isWorkday,
            isToday,
            isHoliday: isHolidayDay,
            isScheduled: log?.status === "scheduled",
            isCompleted: log?.status === "completed",
            isOff: !isWorkday,
            isBeforeStart,
            isInactive,
            holidayName: holiday?.name,
        }
    }

    const handleDateClick = (date: Date, status: ReturnType<typeof getDayStatus>) => {
        // Don't allow clicking on inactive dates
        if (status.isInactive) return
        onSelectDate(date)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
        >
            <Card className="overflow-hidden">
                <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-accent/5">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold">
                            {format(currentMonth, "MMMM yyyy")}
                        </CardTitle>
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                                className="text-primary hover:bg-primary/10"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                className="text-primary hover:bg-primary/10"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    {/* Week days header */}
                    <div className="grid grid-cols-7 gap-2 mb-2">
                        {weekDays.map((day, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "text-center text-sm font-medium py-2",
                                    settings.workDays.includes(i)
                                        ? "text-foreground"
                                        : "text-muted-foreground/50"
                                )}
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days grid */}
                    <div className="grid grid-cols-7 gap-2">
                        {days.map((day, i) => {
                            const isCurrentMonth = isSameMonth(day, currentMonth)
                            const isSelected = selectedDate && isSameDay(day, selectedDate)
                            const status = getDayStatus(day)

                            return (
                                <motion.button
                                    key={i}
                                    type="button"
                                    onClick={() => handleDateClick(day, status)}
                                    disabled={status.isInactive}
                                    whileHover={status.isInactive ? {} : { scale: 1.05 }}
                                    whileTap={status.isInactive ? {} : { scale: 0.95 }}
                                    title={status.holidayName || (status.isBeforeStart ? "Before start date" : status.isOff ? "Non-workday" : "")}
                                    className={cn(
                                        "relative h-14 rounded-lg text-sm transition-all duration-200 border-2",
                                        "focus:outline-none",
                                        !isCurrentMonth && "opacity-30",

                                        // Default state
                                        "border-transparent bg-secondary/30",

                                        // Inactive states (before start date, non-workday, or holiday)
                                        status.isInactive && "opacity-40 cursor-not-allowed bg-muted/20 text-muted-foreground",

                                        // Holiday styling
                                        status.isHoliday && "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/30",

                                        // Off day (non-workday) that's not a holiday
                                        status.isOff && !status.isHoliday && "bg-muted/30",

                                        // Before start date
                                        status.isBeforeStart && "bg-muted/10 line-through",

                                        // Active states (only if not inactive)
                                        !status.isInactive && [
                                            // Today
                                            status.isToday && "border-amber bg-amber/10 text-amber-foreground font-bold",

                                            // Scheduled
                                            status.isScheduled && "border-primary bg-primary/10",

                                            // Completed (logged)
                                            status.isCompleted && "bg-green/20 border-green",

                                            // Hover effect for active dates
                                            "hover:border-primary/50 hover:shadow-md",
                                        ],

                                        // Selected
                                        isSelected && !status.isInactive && "ring-2 ring-primary ring-offset-2"
                                    )}
                                >
                                    <span className={cn(
                                        "font-medium",
                                        status.isToday && !status.isInactive && "text-amber"
                                    )}>
                                        {format(day, "d")}
                                    </span>

                                    {/* Status indicators */}
                                    {status.log && !status.isInactive && (
                                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-primary font-medium">
                                            {status.log.hoursWorked}h
                                        </span>
                                    )}

                                    {status.isHoliday && (
                                        <span className="absolute top-0.5 right-0.5 text-red-500 text-[10px]">★</span>
                                    )}

                                    {status.isCompleted && !status.isInactive && (
                                        <span className="absolute top-0.5 right-0.5 text-green text-[10px]">✓</span>
                                    )}
                                </motion.button>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
