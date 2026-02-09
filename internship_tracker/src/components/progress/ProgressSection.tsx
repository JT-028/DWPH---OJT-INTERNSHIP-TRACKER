import { motion } from "framer-motion"
import { Download, FileText } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
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

interface ProgressSectionProps {
    progress: InternProgress | null
    onDownloadPDF: () => void
    onDownloadCSV: () => void
}

export function ProgressSection({ progress, onDownloadPDF, onDownloadCSV }: ProgressSectionProps) {
    if (!progress) {
        return (
            <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-xl p-6 text-white">
                <p className="text-center text-white/80">Loading progress...</p>
            </div>
        )
    }

    const projectedEndFormatted = progress.projectedEndDate
        ? format(new Date(progress.projectedEndDate), "MMM dd, yyyy")
        : "Goal not reached"

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-xl p-6 text-white shadow-xl"
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Your Progress</h2>
                <Badge variant="live" className="text-xs">
                    LIVE
                </Badge>
            </div>

            {/* Hours Progress */}
            <div className="mb-3">
                <div className="flex justify-between text-sm mb-2">
                    <span>
                        {progress.totalHoursCompleted} / {progress.targetHours} hrs
                    </span>
                    <span>{Math.round(progress.progressPercentage)}%</span>
                </div>
                <Progress value={progress.progressPercentage} className="h-3" />
            </div>

            {/* Days count */}
            <p className="text-sm text-white/80 mb-4 text-right">
                {progress.totalDaysCompleted} / {progress.totalDaysCompleted + progress.remainingDays} days required
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/20 backdrop-blur rounded-lg p-4 text-center">
                    <p className="text-xs uppercase tracking-wider text-white/70 mb-1">Remaining</p>
                    <p className="text-3xl font-bold">{progress.remainingHours}h</p>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-lg p-4 text-center">
                    <p className="text-xs uppercase tracking-wider text-white/70 mb-1">Projected End</p>
                    <p className={`text-sm font-semibold ${!progress.projectedEndDate ? 'text-red-300' : ''}`}>
                        {projectedEndFormatted}
                    </p>
                </div>
            </div>

            {/* Download Button */}
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button
                        variant="secondary"
                        className="w-full bg-white text-violet-700 hover:bg-white/90 font-semibold"
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
        </motion.div>
    )
}
