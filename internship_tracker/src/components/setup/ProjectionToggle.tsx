import { MousePointer2, Sparkles, TrendingUp } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProjectionToggleProps {
    value: boolean
    onChange: (value: boolean) => void
}

export function ProjectionToggle({ value, onChange }: ProjectionToggleProps) {
    return (
        <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-primary" />
                Auto-Projection
            </Label>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onChange(false)}
                    className={cn(
                        "flex-1 gap-2 transition-all",
                        !value && "border-primary bg-primary/10 text-primary shadow-sm"
                    )}
                >
                    <MousePointer2 className="h-4 w-4" />
                    Manual
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onChange(true)}
                    className={cn(
                        "flex-1 gap-2 transition-all",
                        value && "border-green bg-green/10 text-green shadow-sm"
                    )}
                >
                    <Sparkles className="h-4 w-4" />
                    Auto
                </Button>
            </div>
            <p className="text-xs text-muted-foreground">
                {value
                    ? "Uses your actual average hours for more accurate projection"
                    : "Uses your hours/day setting for projection"
                }
            </p>
        </div>
    )
}
