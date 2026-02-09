import { motion } from "framer-motion"
import { InteractiveCalendar } from "./InteractiveCalendar"
import { DailyTaskLog } from "./DailyTaskLog"
import type { DailyLog, Holiday, InternSettings, LogStatus } from "@/types"

interface CalendarSectionProps {
    logs: DailyLog[]
    holidays: Holiday[]
    settings: InternSettings
    selectedDate: Date | null
    onSelectDate: (date: Date) => void
    onSaveLog: (log: { date: string; hoursWorked: number; tasks: string; status: LogStatus }) => void
    onDeleteLog: (date: string) => void
}

export function CalendarSection({
    logs,
    holidays,
    settings,
    selectedDate,
    onSelectDate,
    onSaveLog,
    onDeleteLog,
}: CalendarSectionProps) {
    const selectedLog = selectedDate
        ? logs.find((log) => {
            const logDate = new Date(log.date).toDateString()
            return logDate === selectedDate.toDateString()
        }) || null
        : null

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 12,
            },
        },
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
        >
            <motion.div variants={itemVariants}>
                <InteractiveCalendar
                    logs={logs}
                    holidays={holidays}
                    settings={settings}
                    selectedDate={selectedDate}
                    onSelectDate={onSelectDate}
                />
            </motion.div>

            <motion.div variants={itemVariants}>
                <DailyTaskLog
                    selectedDate={selectedDate}
                    existingLog={selectedLog}
                    defaultHours={settings.hoursPerDay}
                    onSave={onSaveLog}
                    onDelete={onDeleteLog}
                />
            </motion.div>
        </motion.div>
    )
}
