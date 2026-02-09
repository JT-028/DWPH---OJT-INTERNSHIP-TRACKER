import { cn } from "@/lib/utils"

const legends = [
    { label: "Scheduled", color: "border-primary bg-primary/5", indicator: "border-2 border-primary" },
    { label: "Today", color: "border-rose-400", indicator: "border-2 border-rose-400" },
    { label: "Holiday", color: "text-red-500", indicator: "★" },
    { label: "Logged", color: "bg-primary/20 border-primary", indicator: "✓" },
    { label: "Off", color: "text-muted-foreground", indicator: null },
]

export function CalendarLegend() {
    return (
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4 py-3 text-xs text-muted-foreground">
            {legends.map((legend) => (
                <div key={legend.label} className="flex items-center gap-2">
                    {legend.indicator ? (
                        typeof legend.indicator === "string" && legend.indicator.length === 1 ? (
                            <span className={cn("text-sm", legend.color)}>{legend.indicator}</span>
                        ) : (
                            <div className={cn("w-4 h-4 rounded", legend.indicator)} />
                        )
                    ) : (
                        <div className="w-4 h-4 rounded bg-muted" />
                    )}
                    <span>{legend.label}</span>
                </div>
            ))}
        </div>
    )
}
