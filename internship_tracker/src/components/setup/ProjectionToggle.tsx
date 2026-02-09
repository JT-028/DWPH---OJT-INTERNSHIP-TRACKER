import { MousePointer2, Sparkles } from "lucide-react"
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
            <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                Auto-Projection
            </Label>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onChange(false)}
                    className={cn(
                        "flex-1 gap-2",
                        !value && "border-primary bg-primary/10 text-primary"
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
                        "flex-1 gap-2",
                        value && "border-primary bg-primary/10 text-primary"
                    )}
                >
                    <Sparkles className="h-4 w-4" />
                    Auto
                </Button>
            </div>
        </div>
    )
}
