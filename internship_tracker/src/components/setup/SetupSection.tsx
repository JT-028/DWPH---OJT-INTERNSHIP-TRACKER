import { motion } from "framer-motion"
import { RotateCcw, Settings as SettingsIcon, ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
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
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"
import { TargetHoursInput } from "./TargetHoursInput"
import { StartDatePicker } from "./StartDatePicker"
import { HoursPerDaySlider } from "./HoursPerDaySlider"
import { HolidayExclusion } from "./HolidayExclusion"
import { WorkdaySelector } from "./WorkdaySelector"
import { ProjectionToggle } from "./ProjectionToggle"
import type { InternSettings } from "@/types"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface SetupSectionProps {
    settings: InternSettings
    onSettingsChange: (settings: Partial<InternSettings>) => void
    onReset: () => void
    isLoading?: boolean
}

export function SetupSection({ settings, onSettingsChange, onReset, isLoading }: SetupSectionProps) {
    const [isExpanded, setIsExpanded] = useState(true)

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ scale: 1.01 }}
            className="transition-transform duration-300"
        >
            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-border/50">
                <CardHeader className="pb-4 bg-gradient-to-r from-amber/10 via-yellow/5 to-transparent cursor-pointer"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <motion.div
                                animate={{ rotate: isExpanded ? 0 : -90 }}
                                transition={{ duration: 0.2 }}
                            >
                                <SettingsIcon className="h-5 w-5 text-amber" />
                            </motion.div>
                            Setup
                            <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="ml-auto"
                            >
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </motion.div>
                        </CardTitle>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-destructive group"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <motion.div whileHover={{ rotate: -180 }} transition={{ duration: 0.3 }}>
                                        <RotateCcw className="h-4 w-4 mr-1" />
                                    </motion.div>
                                    Reset
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Reset all settings?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will reset all your preferences to their default values.
                                        Your logged hours will NOT be deleted.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={onReset} className="bg-destructive text-destructive-foreground">
                                        Reset Settings
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardHeader>
                <motion.div
                    animate={{
                        height: isExpanded ? "auto" : 0,
                        opacity: isExpanded ? 1 : 0
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                >
                    <CardContent className={cn("space-y-6 pt-6", !isExpanded && "hidden")}>
                        {isLoading ? (
                            <>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                                <div className="space-y-4">
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-2 w-full" />
                                    <div className="flex justify-between gap-2">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Skeleton key={i} className="h-8 w-12" />
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent side="right">
                                                Total hours required for your internship (e.g., 600)
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                    <TargetHoursInput
                                        value={settings.targetHours}
                                        onChange={(targetHours) => onSettingsChange({ targetHours })}
                                    />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                >
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent side="right">
                                                The date you started your internship
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                    <StartDatePicker
                                        value={settings.startDate}
                                        onChange={(startDate) => onSettingsChange({ startDate })}
                                    />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent side="right">
                                                How many hours you plan to work on average each day
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                    <HoursPerDaySlider
                                        value={settings.hoursPerDay}
                                        onChange={(hoursPerDay) => onSettingsChange({ hoursPerDay })}
                                    />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
                                >
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent side="right">
                                                Whether to exclude holidays from progress calculations
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                    <HolidayExclusion
                                        value={settings.excludeHolidays}
                                        onChange={(excludeHolidays) => onSettingsChange({ excludeHolidays })}
                                    />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent side="right">
                                                Select the days of the week you are expected to work
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                    <WorkdaySelector
                                        value={settings.workDays}
                                        onChange={(workDays) => onSettingsChange({ workDays })}
                                    />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.35 }}
                                >
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent side="right">
                                                Auto uses your actual logged average; Manual uses the hours per day set above
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <ProjectionToggle
                                            value={settings.autoProjection}
                                            onChange={(autoProjection) => onSettingsChange({ autoProjection })}
                                        />
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </CardContent>
                </motion.div>
            </Card>
        </motion.div>
    )
}
