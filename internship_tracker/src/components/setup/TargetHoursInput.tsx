import { Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TargetHoursInputProps {
    value: number
    onChange: (value: number) => void
}

export function TargetHoursInput({ value, onChange }: TargetHoursInputProps) {
    return (
        <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                Target Hours
            </Label>
            <div className="relative">
                <Input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(Math.max(1, parseInt(e.target.value) || 0))}
                    min={1}
                    className="pr-10"
                    placeholder="500"
                />
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
            </div>
        </div>
    )
}
