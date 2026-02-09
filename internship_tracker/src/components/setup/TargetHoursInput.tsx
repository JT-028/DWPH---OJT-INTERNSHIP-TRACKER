import { Target } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TargetHoursInputProps {
    value: number
    onChange: (value: number) => void
}

export function TargetHoursInput({ value, onChange }: TargetHoursInputProps) {
    return (
        <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                <Target className="h-3 w-3 text-green" />
                Target Hours
            </Label>
            <div className="relative">
                <Input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                    min={1}
                    max={2000}
                    className="pr-12 text-lg font-semibold focus:border-primary focus:ring-primary"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    hours
                </span>
            </div>
        </div>
    )
}
