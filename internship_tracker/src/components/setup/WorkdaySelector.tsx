import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { getDayName } from "@/lib/utils"

interface WorkdaySelectorProps {
    value: number[]
    onChange: (value: number[]) => void
}

export function WorkdaySelector({ value, onChange }: WorkdaySelectorProps) {
    const days = [0, 1, 2, 3, 4, 5, 6] // Sun to Sat

    const toggleDay = (day: number) => {
        if (value.includes(day)) {
            // Don't allow removing all days
            if (value.length > 1) {
                onChange(value.filter((d) => d !== day))
            }
        } else {
            onChange([...value, day].sort())
        }
    }

    return (
        <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                Weekly Work Days
            </Label>
            <div className="flex gap-2 justify-between">
                {days.map((day) => {
                    const isSelected = value.includes(day)
                    const isWeekend = day === 0 || day === 6
                    return (
                        <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(day)}
                            className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200",
                                "border-2 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50",
                                isSelected
                                    ? "bg-primary border-primary text-primary-foreground shadow-lg"
                                    : isWeekend
                                        ? "border-muted text-muted-foreground hover:border-amber/50 hover:bg-amber/5"
                                        : "border-muted-foreground/30 text-muted-foreground hover:border-primary/50 hover:bg-primary/5"
                            )}
                        >
                            {getDayName(day)}
                        </button>
                    )
                })}
            </div>
            <p className="text-xs text-muted-foreground">
                Click to toggle days. These days will be active in the calendar.
            </p>
        </div>
    )
}
