import { cn } from "@/lib/utils"

const legends = [
    {
        label: "Scheduled",
        className: "border-2 border-primary bg-primary/10",
        description: "Planned"
    },
    {
        label: "Today",
        className: "border-2 border-amber bg-amber/10",
        description: "Current"
    },
    {
        label: "Holiday",
        className: "bg-red-100 dark:bg-red-900/40 text-red-500",
        icon: "★",
        description: "Official"
    },
    {
        label: "Logged",
        className: "bg-green/10 border-2 border-green text-green",
        icon: "✓",
        description: "Done"
    },
    {
        label: "Off",
        className: "bg-muted/40 border-2 border-transparent text-muted-foreground",
        description: "Inactive"
    },
]

export function CalendarLegend() {
    return (
        <div className="mt-6 p-4 bg-secondary/20 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {legends.map((legend) => (
                    <div
                        key={legend.label}
                        className="flex flex-col items-center gap-2 group"
                    >
                        <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md",
                            legend.className
                        )}>
                            {legend.icon ? (
                                <span className="text-lg font-bold">{legend.icon}</span>
                            ) : (
                                <div className="w-2 h-2 rounded-full" />
                            )}
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] sm:text-xs font-bold text-foreground leading-tight">
                                {legend.label}
                            </p>
                            <p className="hidden sm:block text-[9px] text-muted-foreground uppercase tracking-tighter opacity-70">
                                {legend.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
