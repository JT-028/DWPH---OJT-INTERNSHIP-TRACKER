import { motion } from "framer-motion"
import { InteractiveCalendar } from "./InteractiveCalendar"
import { DailyTaskLog } from "./DailyTaskLog"
import { CalendarLegend } from "./CalendarLegend"
import type { DailyLog, Holiday, InternSettings, LogStatus } from "@/types"

interface CalendarSectionProps {
    logs: DailyLog[]
    holidays: Holiday[]
    settings: InternSettings
    selectedDate: Date | null
    onSelectDate: (date: Date) => void
    onSaveLog: (log: { date: string; hoursWorked: number; tasks: string; status: LogStatus }) => void
}

export function CalendarSection({
    logs,
    holidays,
    settings,
    selectedDate,
    onSelectDate,
    onSaveLog,
}: CalendarSectionProps) {
    const selectedLog = selectedDate
        ? logs.find((log) => {
            const logDate = new Date(log.date).toDateString()
            return logDate === selectedDate.toDateString()
        }) || null
        : null

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-4"
        >
            <InteractiveCalendar
                logs={logs}
                holidays={holidays}
                settings={settings}
                selectedDate={selectedDate}
                onSelectDate={onSelectDate}
            />

            <DailyTaskLog
                selectedDate={selectedDate}
                existingLog={selectedLog}
                defaultHours={settings.hoursPerDay}
                onSave={onSaveLog}
            />

            <CalendarLegend />
        </motion.div>
    )
}
