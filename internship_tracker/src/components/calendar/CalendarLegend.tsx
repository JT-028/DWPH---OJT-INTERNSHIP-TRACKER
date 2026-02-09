import { cn } from "@/lib/utils"

const legends = [
    {
        label: "Scheduled",
        className: "border-2 border-primary bg-primary/10",
    },
    {
        label: "Today",
        className: "border-2 border-amber bg-amber/10",
    },
    {
        label: "Holiday",
        className: "bg-red-100 dark:bg-red-950/50 text-red-500",
        icon: "★"
    },
    {
        label: "Logged",
        className: "bg-green/20 border-2 border-green",
        icon: "✓"
    },
    {
        label: "Off",
        className: "bg-muted/30 text-muted-foreground opacity-50",
    },
]

export function CalendarLegend() {
    return (
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4 py-3 px-4 bg-secondary/30 rounded-lg text-xs text-muted-foreground">
            {legends.map((legend) => (
                <div key={legend.label} className="flex items-center gap-2">
                    {legend.icon ? (
                        <span className={cn("text-sm", legend.className)}>{legend.icon}</span>
                    ) : (
                        <div className={cn("w-4 h-4 rounded", legend.className)} />
                    )}
                    <span>{legend.label}</span>
                </div>
            ))}
        </div>
    )
}
