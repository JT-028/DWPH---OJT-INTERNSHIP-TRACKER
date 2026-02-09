import { Target } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface TargetHoursInputProps {
    value: number
    onChange: (value: number) => void
}

export function TargetHoursInput({ value, onChange }: TargetHoursInputProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value

        // Allow empty field for better UX while typing
        if (inputValue === "") {
            onChange(0)
            return
        }

        // Parse as integer and remove leading zeros
        const parsed = parseInt(inputValue, 10)

        // Only update if it's a valid number
        if (!isNaN(parsed)) {
            // Clamp between 1 and 2000
            const clamped = Math.max(0, Math.min(2000, parsed))
            onChange(clamped)
        }
    }

    const handleBlur = () => {
        // Ensure minimum value of 1 when field loses focus
        if (value < 1) {
            onChange(1)
        }
    }

    return (
        <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                <Target className="h-3 w-3 text-green" />
                Target Hours
            </Label>
            <div className="relative">
                <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={value === 0 ? "" : value.toString()}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={cn(
                        "pr-12 text-lg font-semibold focus:border-primary focus:ring-primary",
                        value < 1 && "border-destructive focus:border-destructive focus:ring-destructive"
                    )}
                    placeholder="Enter hours"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    hours
                </span>
            </div>
        </div>
    )
}
