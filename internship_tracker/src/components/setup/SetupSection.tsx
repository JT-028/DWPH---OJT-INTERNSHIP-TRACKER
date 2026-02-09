import { motion } from "framer-motion"
import { Settings, RotateCcw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TargetHoursInput } from "./TargetHoursInput"
import { StartDatePicker } from "./StartDatePicker"
import { HoursPerDaySlider } from "./HoursPerDaySlider"
import { HolidayExclusion } from "./HolidayExclusion"
import { WorkdaySelector } from "./WorkdaySelector"
import { ProjectionToggle } from "./ProjectionToggle"
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
import type { InternSettings } from "@/types"

interface SetupSectionProps {
    settings: InternSettings
    onSettingsChange: (settings: Partial<InternSettings>) => void
    onReset: () => void
}

export function SetupSection({ settings, onSettingsChange, onReset }: SetupSectionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Settings className="h-5 w-5 text-primary" />
                        Setup
                    </CardTitle>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Reset
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Reset all settings?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will reset all your settings to default values. Your logged hours will NOT be deleted.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={onReset}>Reset</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardHeader>
                <CardContent className="space-y-6">
                    <TargetHoursInput
                        value={settings.targetHours}
                        onChange={(value) => onSettingsChange({ targetHours: value })}
                    />

                    <StartDatePicker
                        value={settings.startDate}
                        onChange={(value) => onSettingsChange({ startDate: value })}
                    />

                    <HoursPerDaySlider
                        value={settings.hoursPerDay}
                        onChange={(value) => onSettingsChange({ hoursPerDay: value })}
                    />

                    <HolidayExclusion
                        value={settings.excludeHolidays}
                        onChange={(value) => onSettingsChange({ excludeHolidays: value })}
                    />

                    <WorkdaySelector
                        value={settings.workDays}
                        onChange={(value) => onSettingsChange({ workDays: value })}
                    />

                    <ProjectionToggle
                        value={settings.autoProjection}
                        onChange={(value) => onSettingsChange({ autoProjection: value })}
                    />
                </CardContent>
            </Card>
        </motion.div>
    )
}
