import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Save, Minus, Plus, ClipboardList } from "lucide-react"
import { format } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { DailyLog, LogStatus } from "@/types"

interface DailyTaskLogProps {
    selectedDate: Date | null
    existingLog: DailyLog | null
    defaultHours: number
    onSave: (log: { date: string; hoursWorked: number; tasks: string; status: LogStatus }) => void
}

export function DailyTaskLog({ selectedDate, existingLog, defaultHours, onSave }: DailyTaskLogProps) {
    const [hours, setHours] = useState(defaultHours)
    const [tasks, setTasks] = useState("")
    const [showConfirm, setShowConfirm] = useState(false)

    useEffect(() => {
        if (existingLog) {
            setHours(existingLog.hoursWorked)
            setTasks(existingLog.tasks || "")
        } else {
            setHours(defaultHours)
            setTasks("")
        }
    }, [existingLog, defaultHours, selectedDate])

    const handleSave = () => {
        if (!selectedDate) return
        setShowConfirm(true)
    }

    const confirmSave = () => {
        if (!selectedDate) return
        onSave({
            date: selectedDate.toISOString(),
            hoursWorked: hours,
            tasks,
            status: "completed",
        })
        setShowConfirm(false)
    }

    if (!selectedDate) {
        return (
            <Card className="mt-4">
                <CardContent className="py-8 text-center text-muted-foreground">
                    <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Select a date from the calendar to log your work</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="mt-4">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-xs uppercase tracking-wider text-muted-foreground">Customizing</p>
                            <p className="text-lg font-semibold">
                                {format(selectedDate, "EEEE, MMM do")}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setHours(Math.max(0, hours - 1))}
                                className="h-8 w-8"
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <div className="px-3 min-w-[60px] text-center">
                                <span className="text-xs text-muted-foreground">HOURS</span>
                                <p className="text-xl font-bold">{hours}h</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setHours(Math.min(24, hours + 1))}
                                className="h-8 w-8"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <ClipboardList className="h-4 w-4" />
                            Daily Log
                        </Label>
                        <Textarea
                            placeholder="What did you work on today? (optional)"
                            value={tasks}
                            onChange={(e) => setTasks(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>

                    <Button
                        onClick={handleSave}
                        className="w-full mt-4 gap-2"
                    >
                        <Save className="h-4 w-4" />
                        Save
                    </Button>
                </CardContent>
            </Card>

            <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Log this day?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You're about to log {hours} hours for {format(selectedDate, "MMMM do, yyyy")}.
                            {existingLog ? " This will update your existing log." : ""}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmSave}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div>
    )
}
