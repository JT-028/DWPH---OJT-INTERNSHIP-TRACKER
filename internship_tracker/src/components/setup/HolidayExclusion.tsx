import { CalendarOff, Calendar } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface HolidayExclusionProps {
    value: boolean
    onChange: (value: boolean) => void
}

export function HolidayExclusion({ value, onChange }: HolidayExclusionProps) {
    return (
        <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                Exclude PH Holidays (2026)?
            </Label>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onChange(true)}
                    className={cn(
                        "flex-1 gap-2",
                        value && "border-primary bg-primary/10 text-primary"
                    )}
                >
                    <CalendarOff className="h-4 w-4" />
                    Yes
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onChange(false)}
                    className={cn(
                        "flex-1 gap-2",
                        !value && "border-primary bg-primary/10 text-primary"
                    )}
                >
                    <Calendar className="h-4 w-4" />
                    No
                </Button>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="text-yellow-500">⚡</span>
                All PH holidays will not count as work days
            </p>
        </div>
    )
}
