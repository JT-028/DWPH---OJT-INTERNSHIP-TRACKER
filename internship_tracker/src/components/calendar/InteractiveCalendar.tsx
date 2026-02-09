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
    endOfWeek
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

        return {
            log,
            holiday,
            isWorkday,
            isToday,
            isHoliday: settings.excludeHolidays && !!holiday,
            isScheduled: log?.status === "scheduled",
            isCompleted: log?.status === "completed",
            isOff: !isWorkday || log?.status === "off",
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
        >
            <Card>
                <CardHeader className="pb-2">
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
                <CardContent>
                    {/* Week days header */}
                    <div className="grid grid-cols-7 gap-2 mb-2">
                        {weekDays.map((day, i) => (
                            <div
                                key={i}
                                className="text-center text-sm font-medium text-muted-foreground py-2"
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
                                    onClick={() => onSelectDate(day)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={cn(
                                        "relative h-14 rounded-lg text-sm transition-all duration-200 border-2",
                                        "focus:outline-none focus:ring-2 focus:ring-primary/50",
                                        !isCurrentMonth && "opacity-30",

                                        // Default state
                                        "border-transparent",

                                        // Today
                                        status.isToday && "border-rose-400",

                                        // Scheduled
                                        status.isScheduled && "border-primary bg-primary/5",

                                        // Completed (logged)
                                        status.isCompleted && "bg-primary/20 border-primary",

                                        // Holiday
                                        status.isHoliday && "bg-red-50 dark:bg-red-950/30",

                                        // Off day
                                        status.isOff && !status.isHoliday && "text-muted-foreground",

                                        // Selected
                                        isSelected && "ring-2 ring-primary ring-offset-2"
                                    )}
                                >
                                    <span className="font-medium">{format(day, "d")}</span>

                                    {/* Status indicators */}
                                    {status.log && (
                                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-primary font-medium">
                                            {status.log.hoursWorked}h
                                        </span>
                                    )}

                                    {status.isHoliday && (
                                        <span className="absolute top-1 right-1 text-red-500 text-[10px]">★</span>
                                    )}

                                    {status.isCompleted && (
                                        <span className="absolute top-1 right-1 text-primary text-[10px]">✓</span>
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
