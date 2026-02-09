import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay, isToday, isBefore, startOfDay } from "date-fns"
import { cn, getDayName } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { DailyLog, Holiday, InternSettings } from "@/types"

interface InteractiveCalendarProps {
    logs: DailyLog[]
    holidays: Holiday[]
    settings: InternSettings
    selectedDate: Date | null
    onSelectDate: (date: Date) => void
}

const legends = [
    { label: "Today", className: "border-2 border-amber bg-amber/10", icon: null },
    { label: "Holiday", className: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400", icon: "★" },
    { label: "Logged", className: "bg-green/10 border-2 border-green text-green", icon: "✓" },
    { label: "Off", className: "bg-muted/40 text-muted-foreground/60", icon: null },
]

export function InteractiveCalendar({
    logs,
    holidays,
    settings,
    selectedDate,
    onSelectDate,
}: InteractiveCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [direction, setDirection] = useState(0)

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    const startDate = settings.startDate ? startOfDay(new Date(settings.startDate)) : null
    const startDayOfWeek = getDay(monthStart)

    const prevMonth = () => {
        setDirection(-1)
        setCurrentMonth(subMonths(currentMonth, 1))
    }

    const nextMonth = () => {
        setDirection(1)
        setCurrentMonth(addMonths(currentMonth, 1))
    }

    const goToToday = () => {
        if (!isSameMonth(currentMonth, new Date())) {
            setDirection(new Date() > currentMonth ? 1 : -1)
            setCurrentMonth(new Date())
        }
    }

    const isLogged = (date: Date) => {
        return logs.some((log) => isSameDay(new Date(log.date), date))
    }

    const isHoliday = (date: Date) => {
        const dateStr = format(date, "yyyy-MM-dd")
        return holidays.find((h) => h.date === dateStr)
    }

    const isWorkday = (date: Date) => {
        const dayOfWeek = getDay(date)
        return settings.workDays.includes(dayOfWeek)
    }

    const isBeforeStartDate = (date: Date) => {
        if (!startDate) return false
        return isBefore(startOfDay(date), startDate)
    }

    const getDayStatus = (date: Date) => {
        if (isBeforeStartDate(date)) return "before-start"
        if (!isWorkday(date)) return "non-workday"

        const holiday = isHoliday(date)
        if (holiday && settings.excludeHolidays) return "holiday"
        if (isLogged(date)) return "logged"
        if (isToday(date)) return "today"

        return "active"
    }

    const weekDayHeaders = [0, 1, 2, 3, 4, 5, 6]

    const calendarVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 50 : -50,
            opacity: 0,
        }),
    }

    return (
        <motion.div
            whileHover={{ scale: 1.005 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-border/50 overflow-hidden">
                <CardHeader className="pb-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <motion.div whileHover={{ rotate: 15 }} transition={{ duration: 0.2 }}>
                                <Calendar className="h-5 w-5 text-primary" />
                            </motion.div>
                            Calendar
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={goToToday}
                                    className="h-8 px-2 text-xs font-semibold hover:bg-amber hover:text-white transition-colors duration-200 hidden md:flex"
                                >
                                    Today
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                            </motion.div>
                            <AnimatePresence mode="wait" custom={direction}>
                                <motion.span
                                    key={format(currentMonth, "MMM-yyyy")}
                                    custom={direction}
                                    variants={calendarVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.2 }}
                                    className="text-sm font-medium min-w-[120px] text-center"
                                >
                                    {format(currentMonth, "MMMM yyyy")}
                                </motion.span>
                            </AnimatePresence>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                    <div>
                        {/* Weekday Headers */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {weekDayHeaders.map((day) => {
                                const isActive = settings.workDays.includes(day)
                                return (
                                    <div
                                        key={day}
                                        className={cn(
                                            "text-center text-xs font-semibold py-2 rounded transition-colors duration-200",
                                            isActive
                                                ? "text-primary bg-primary/10"
                                                : "text-muted-foreground/50"
                                        )}
                                    >
                                        {getDayName(day)}
                                    </div>
                                )
                            })}
                        </div>

                        {/* Calendar Grid */}
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={format(currentMonth, "MMM-yyyy")}
                                custom={direction}
                                variants={calendarVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.2 }}
                                className="grid grid-cols-7 gap-1"
                            >
                                {/* Empty cells for days before month start */}
                                {Array.from({ length: startDayOfWeek }).map((_, i) => (
                                    <div key={`empty-${i}`} className="aspect-square" />
                                ))}

                                {/* Day cells */}
                                {days.map((day, index) => {
                                    const status = getDayStatus(day)
                                    const holiday = isHoliday(day)
                                    const isSelected = selectedDate && isSameDay(day, selectedDate)
                                    const isClickable = status !== "before-start" && status !== "non-workday" &&
                                        !(status === "holiday" && settings.excludeHolidays)

                                    return (
                                        <motion.button
                                            key={day.toISOString()}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.01, duration: 0.2 }}
                                            whileHover={isClickable ? { scale: 1.1, zIndex: 10 } : undefined}
                                            whileTap={isClickable ? { scale: 0.95 } : undefined}
                                            onClick={() => isClickable && onSelectDate(day)}
                                            disabled={!isClickable}
                                            title={
                                                status === "before-start" ? "Before start date" :
                                                    status === "non-workday" ? "Non-workday" :
                                                        status === "holiday" ? holiday?.name :
                                                            undefined
                                            }
                                            className={cn(
                                                "aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all duration-200 relative",
                                                // Base states
                                                status === "before-start" && "text-muted-foreground/30 line-through cursor-not-allowed bg-muted/20",
                                                status === "non-workday" && "text-muted-foreground/40 cursor-not-allowed bg-muted/10",
                                                status === "holiday" && "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 cursor-not-allowed",
                                                status === "logged" && "bg-green/20 text-green border-2 border-green font-bold",
                                                status === "today" && "border-2 border-amber bg-amber/10 font-bold shadow-md",
                                                status === "active" && "hover:bg-primary/10 hover:border-primary/50 border border-transparent",
                                                // Selected state
                                                isSelected && isClickable && "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg",
                                                // Current month styling
                                                !isSameMonth(day, currentMonth) && "text-muted-foreground/50"
                                            )}
                                        >
                                            <span>{format(day, "d")}</span>
                                            {status === "holiday" && <span className="text-[10px] absolute -top-0.5 right-0.5">★</span>}
                                            {status === "logged" && (
                                                <motion.span
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="text-[10px] absolute bottom-0.5"
                                                >
                                                    ✓
                                                </motion.span>
                                            )}
                                            {isToday(day) && (
                                                <motion.div
                                                    animate={{ scale: [1, 1.2, 1] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                    className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber rounded-full"
                                                />
                                            )}
                                        </motion.button>
                                    )
                                })}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Compact Legends - Moved below days */}
                    <div className="flex items-center justify-center gap-4 flex-wrap pt-2 border-t border-border/50">
                        {legends.map((legend) => (
                            <div key={legend.label} className="flex items-center gap-1.5 px-1 py-0.5 rounded-full hover:bg-secondary/50 transition-colors duration-200">
                                <div
                                    className={cn(
                                        "w-4 h-4 rounded-sm flex items-center justify-center text-[8px]",
                                        legend.className
                                    )}
                                >
                                    {legend.icon || <div className="w-1 h-1 rounded-full" />}
                                </div>
                                <span className="text-[10px] font-medium text-muted-foreground">{legend.label}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
