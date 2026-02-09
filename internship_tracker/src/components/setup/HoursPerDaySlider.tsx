import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface HoursPerDaySliderProps {
    value: number
    onChange: (value: number) => void
}

export function HoursPerDaySlider({ value, onChange }: HoursPerDaySliderProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                    Hours Per Day
                </Label>
                <Badge variant="default" className="text-sm px-3">
                    {value}h
                </Badge>
            </div>
            <Slider
                value={[value]}
                onValueChange={([val]) => onChange(val)}
                min={1}
                max={12}
                step={1}
                className="w-full"
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-full bg-muted"></span>
                Default work hours per day (excludes overtime)
            </p>
        </div>
    )
}
