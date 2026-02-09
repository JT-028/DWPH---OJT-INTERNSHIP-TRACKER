import { motion } from "framer-motion"
import { Download, FileText, TrendingUp, Calendar, Clock, Trophy, Sparkles } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { InternProgress } from "@/types"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface ProgressSectionProps {
    progress: InternProgress | null
    onDownloadPDF: () => void
    onDownloadCSV: () => void
}

export function ProgressSection({ progress, onDownloadPDF, onDownloadCSV }: ProgressSectionProps) {
    if (!progress) {
        return (
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-6 text-white">
                <p className="text-center text-white/80">Loading progress...</p>
            </div>
        )
    }

    const isGoalCompleted = progress.progressPercentage >= 100
    const isGoalExceeded = progress.totalHoursCompleted > progress.targetHours
    const extraHours = progress.totalHoursCompleted - progress.targetHours

    const projectedEndFormatted = progress.projectedEndDate
        ? format(new Date(progress.projectedEndDate), "MMM dd, yyyy")
        : "Not yet calculated"

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className={cn(
                "rounded-xl p-6 text-white shadow-xl relative overflow-hidden transition-all duration-500",
                isGoalCompleted
                    ? "bg-gradient-to-br from-[#2d8a4e] via-[#3a9d5d] to-[#4db06c]"  // Green gradient like reference
                    : "bg-gradient-to-br from-primary via-primary to-[hsl(224,72%,45%)]"  // Blue gradient default
            )}
        >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            {/* Celebration particles for completed state */}
            {isGoalCompleted && (
                <>
                    <div className="absolute top-4 left-4 animate-pulse">
                        <Sparkles className="h-4 w-4 text-yellow-300" />
                    </div>
                    <div className="absolute top-8 right-12 animate-pulse delay-200">
                        <Sparkles className="h-3 w-3 text-yellow-200" />
                    </div>
                    <div className="absolute bottom-16 right-6 animate-pulse delay-500">
                        <Sparkles className="h-4 w-4 text-yellow-300" />
                    </div>
                </>
            )}

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        {isGoalCompleted ? (
                            <Trophy className="h-5 w-5 text-yellow-300" />
                        ) : (
                            <TrendingUp className="h-5 w-5" />
                        )}
                        Your Progress
                    </h2>
                    <Badge
                        variant={isGoalCompleted ? "default" : "live"}
                        className={cn(
                            "text-xs",
                            isGoalCompleted
                                ? "bg-yellow-400 text-green-900 font-bold animate-pulse"
                                : "animate-pulse-soft"
                        )}
                    >
                        {isGoalExceeded ? "🎉 GOAL EXCEEDED!" : isGoalCompleted ? "✓ COMPLETED!" : "LIVE"}
                    </Badge>
                </div>

                {/* Hours Progress */}
                <div className="mb-3">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {progress.totalHoursCompleted} / {progress.targetHours} hrs
                            {isGoalExceeded && (
                                <span className="text-yellow-300 font-semibold ml-1">
                                    (+{extraHours}h extra)
                                </span>
                            )}
                        </span>
                        <span className="font-bold">{Math.round(progress.progressPercentage)}%</span>
                    </div>
                    <Progress
                        value={Math.min(100, progress.progressPercentage)}
                        className={cn(
                            "h-3",
                            isGoalCompleted && "[&>div]:bg-yellow-400"
                        )}
                    />
                </div>

                {/* Days count */}
                <p className="text-sm text-white/80 mb-4 text-right flex items-center justify-end gap-1">
                    <Calendar className="h-3 w-3" />
                    {progress.totalDaysCompleted} / {progress.totalDaysCompleted + progress.remainingDays} days required
                </p>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className={cn(
                        "backdrop-blur-sm rounded-lg p-4 text-center border",
                        isGoalCompleted
                            ? "bg-white/20 border-white/20"
                            : "bg-white/15 border-white/10"
                    )}>
                        <p className="text-xs uppercase tracking-wider text-white/70 mb-1">
                            {isGoalExceeded ? "Extra Hours" : "Remaining"}
                        </p>
                        <p className="text-3xl font-bold">
                            {isGoalExceeded ? `+${extraHours}h` : `${progress.remainingHours}h`}
                        </p>
                        {!isGoalCompleted && (
                            <p className="text-xs text-white/60 mt-1">{progress.remainingDays} days</p>
                        )}
                    </div>
                    <div className={cn(
                        "backdrop-blur-sm rounded-lg p-4 text-center border",
                        isGoalCompleted
                            ? "bg-white/20 border-white/20"
                            : "bg-white/15 border-white/10"
                    )}>
                        <p className="text-xs uppercase tracking-wider text-white/70 mb-1">
                            {isGoalCompleted ? "Completed" : "Projected End"}
                        </p>
                        <p className="text-sm font-semibold">
                            {isGoalCompleted ? "🎓 Congratulations!" : projectedEndFormatted}
                        </p>
                    </div>
                </div>

                {/* Download Button */}
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="secondary"
                            className={cn(
                                "w-full font-semibold shadow-lg",
                                isGoalCompleted
                                    ? "bg-white text-green-700 hover:bg-white/90"
                                    : "bg-white text-primary hover:bg-white/90"
                            )}
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            View Report & Download
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Download Report</AlertDialogTitle>
                            <AlertDialogDescription>
                                Choose a format to download your internship progress report.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="grid grid-cols-2 gap-3 my-4">
                            <Button onClick={onDownloadPDF} className="gap-2">
                                <Download className="h-4 w-4" />
                                PDF Report
                            </Button>
                            <Button onClick={onDownloadCSV} variant="outline" className="gap-2">
                                <Download className="h-4 w-4" />
                                CSV Export
                            </Button>
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Close</AlertDialogCancel>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </motion.div>
    )
}
