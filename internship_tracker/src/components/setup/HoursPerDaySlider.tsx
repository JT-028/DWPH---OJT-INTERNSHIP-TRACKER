import { Timer } from "lucide-react"
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
                <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                    <Timer className="h-3 w-3 text-primary" />
                    Hours Per Day
                </Label>
                <Badge variant="secondary" className="text-lg font-bold bg-primary/10 text-primary">
                    {value}h
                </Badge>
            </div>
            <Slider
                value={[value]}
                onValueChange={(values) => onChange(values[0])}
                min={1}
                max={12}
                step={1}
                className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>1h</span>
                <span>12h</span>
            </div>
        </div>
    )
}
