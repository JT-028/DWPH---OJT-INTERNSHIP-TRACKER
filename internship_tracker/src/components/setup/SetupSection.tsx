import { motion } from "framer-motion"
import { RotateCcw, Settings as SettingsIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { TargetHoursInput } from "./TargetHoursInput"
import { StartDatePicker } from "./StartDatePicker"
import { HoursPerDaySlider } from "./HoursPerDaySlider"
import { HolidayExclusion } from "./HolidayExclusion"
import { WorkdaySelector } from "./WorkdaySelector"
import { ProjectionToggle } from "./ProjectionToggle"
import type { InternSettings } from "@/types"

interface SetupSectionProps {
    settings: InternSettings
    onSettingsChange: (settings: Partial<InternSettings>) => void
    onReset: () => void
}

export function SetupSection({ settings, onSettingsChange, onReset }: SetupSectionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
        >
            <Card className="overflow-hidden">
                <CardHeader className="pb-4 bg-gradient-to-r from-amber/10 to-yellow/10">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <SettingsIcon className="h-5 w-5 text-amber" />
                            Setup
                        </CardTitle>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                                    <RotateCcw className="h-4 w-4 mr-1" />
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
                <CardContent className="space-y-6 pt-6">
                    <TargetHoursInput
                        value={settings.targetHours}
                        onChange={(targetHours) => onSettingsChange({ targetHours })}
                    />

                    <StartDatePicker
                        value={settings.startDate ? new Date(settings.startDate) : new Date()}
                        onChange={(startDate) => onSettingsChange({ startDate: startDate.toISOString() })}
                    />

                    <HoursPerDaySlider
                        value={settings.hoursPerDay}
                        onChange={(hoursPerDay) => onSettingsChange({ hoursPerDay })}
                    />

                    <HolidayExclusion
                        value={settings.excludeHolidays}
                        onChange={(excludeHolidays) => onSettingsChange({ excludeHolidays })}
                    />

                    <WorkdaySelector
                        value={settings.workDays}
                        onChange={(workDays) => onSettingsChange({ workDays })}
                    />

                    <ProjectionToggle
                        value={settings.autoProjection}
                        onChange={(autoProjection) => onSettingsChange({ autoProjection })}
                    />
                </CardContent>
            </Card>
        </motion.div>
    )
}
