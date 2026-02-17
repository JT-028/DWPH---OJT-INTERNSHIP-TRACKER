import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Save, Minus, Plus, ClipboardList, Trash2, Sparkles, CheckCircle2, Clock, Star } from "lucide-react"
import { format } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import type { DailyLog, LogStatus } from "@/types"

interface DailyTaskLogProps {
    selectedDate: Date | null
    existingLog: DailyLog | null
    defaultHours: number
    onSave: (log: { date: string; hoursWorked: number; tasks: string; status: LogStatus }) => void
    onDelete: (date: string) => void
}

export function DailyTaskLog({ selectedDate, existingLog, defaultHours, onSave, onDelete }: DailyTaskLogProps) {
    const [hours, setHours] = useState(defaultHours)
    const [tasks, setTasks] = useState("")
    const [showConfirm, setShowConfirm] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

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

    const confirmSave = async () => {
        if (!selectedDate) return
        setIsSaving(true)
        // Use date-only format to avoid timezone issues
        await onSave({
            date: format(selectedDate, "yyyy-MM-dd"),
            hoursWorked: hours,
            tasks,
            status: "completed",
        })
        setIsSaving(false)
        setShowConfirm(false)
    }

    const handleDelete = () => {
        if (!selectedDate) return
        setShowDeleteConfirm(true)
    }

    const confirmDelete = () => {
        if (!selectedDate) return
        // Use date-only format to avoid timezone issues
        onDelete(format(selectedDate, "yyyy-MM-dd"))
        setShowDeleteConfirm(false)
    }

    if (!selectedDate) {
        return (
            <motion.div
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
            >
                <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="py-8 text-center text-muted-foreground">
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        </motion.div>
                        <p>Select a date from the calendar to log your work</p>
                    </CardContent>
                </Card>
            </motion.div>
        )
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={selectedDate.toISOString()}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 100, damping: 15 }}
                whileHover={{ scale: 1.01 }}
            >
                <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-border/50 overflow-hidden">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <p className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                    {existingLog ? (
                                        <>
                                            <Sparkles className="h-3 w-3 text-amber" />
                                            Editing Log
                                        </>
                                    ) : (
                                        "New Log"
                                    )}
                                </p>
                                <p className="text-lg font-semibold">
                                    {format(selectedDate, "EEEE, MMM do")}
                                </p>
                            </motion.div>
                            
                            {/* Validation Status */}
                            {existingLog && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className={`px-3 py-2 rounded-lg border ${
                                        existingLog.isValidated 
                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-400'
                                            : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-400'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 text-sm">
                                        {existingLog.isValidated ? (
                                            <>
                                                <CheckCircle2 className="h-4 w-4" />
                                                <span className="font-medium">Validated</span>
                                                {existingLog.validatedAt && (
                                                    <span className="text-xs opacity-75">
                                                        on {format(new Date(existingLog.validatedAt), 'MMM d')}
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <Clock className="h-4 w-4" />
                                                <span className="font-medium">Pending Validation</span>
                                            </>
                                        )}
                                    </div>
                                    {existingLog.isValidated && existingLog.validationNotes && (
                                        <p className="text-xs mt-1 opacity-90 italic">
                                            "{existingLog.validationNotes}"
                                        </p>
                                    )}
                                </motion.div>
                            )}

                            {/* Special Workday Status */}
                            {existingLog?.isSpecialWorkday && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
                                >
                                    <Badge variant="outline" className="border-purple-500/50 text-purple-600 bg-purple-50 dark:bg-purple-950 dark:text-purple-400">
                                        <Star className="h-3 w-3 mr-1 fill-current" />
                                        Special Workday
                                        {existingLog.specialWorkdayReason && (
                                            <span className="ml-1 opacity-75">- {existingLog.specialWorkdayReason}</span>
                                        )}
                                    </Badge>
                                </motion.div>
                            )}
                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.15 }}
                                className="flex items-center gap-2 bg-secondary rounded-lg p-1"
                            >
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setHours(Math.max(0, hours - 1))}
                                                className="h-8 w-8"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                        </motion.div>
                                    </TooltipTrigger>
                                    <TooltipContent>Decrease hours</TooltipContent>
                                </Tooltip>
                                <div className="px-3 min-w-[60px] text-center">
                                    <span className="text-xs text-muted-foreground">HOURS</span>
                                    <motion.p
                                        key={hours}
                                        initial={{ scale: 1.2, color: "hsl(var(--primary))" }}
                                        animate={{ scale: 1, color: "inherit" }}
                                        className="text-xl font-bold"
                                    >
                                        {hours}h
                                    </motion.p>
                                </div>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setHours(Math.min(24, hours + 1))}
                                                className="h-8 w-8"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </motion.div>
                                    </TooltipTrigger>
                                    <TooltipContent>Increase hours</TooltipContent>
                                </Tooltip>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-2"
                        >
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <ClipboardList className="h-4 w-4" />
                                Daily Log
                            </Label>
                            <Textarea
                                placeholder="What did you work on today? (optional)"
                                value={tasks}
                                onChange={(e) => setTasks(e.target.value)}
                                className="min-h-[100px] transition-all duration-200 focus:shadow-md"
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="flex gap-2 mt-4"
                        >
                            <motion.div
                                className="flex-1"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    onClick={handleSave}
                                    className="w-full gap-2"
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                                        />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    {existingLog ? "Update" : "Save"}
                                </Button>
                            </motion.div>

                            {existingLog && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Button
                                                onClick={handleDelete}
                                                variant="outline"
                                                className="gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Unlog
                                            </Button>
                                        </motion.div>
                                    </TooltipTrigger>
                                    <TooltipContent>Remove this log entry</TooltipContent>
                                </Tooltip>
                            )}
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Save Confirmation Dialog */}
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

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove this log?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will delete your {existingLog?.hoursWorked}h log for {format(selectedDate, "MMMM do, yyyy")}.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete Log
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AnimatePresence>
    )
}
