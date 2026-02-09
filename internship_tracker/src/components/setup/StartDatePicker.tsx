import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { SimpleCalendar } from "@/components/calendar/SimpleCalendar"

interface StartDatePickerProps {
    value: string
    onChange: (value: string) => void
}

export function StartDatePicker({ value, onChange }: StartDatePickerProps) {
    const [open, setOpen] = useState(false)
    const date = value ? new Date(value) : new Date()

    const handleSelect = (selectedDate: Date) => {
        onChange(selectedDate.toISOString())
        setOpen(false)
    }

    return (
        <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                Start Date
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !value && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {value ? format(date, "MM/dd/yyyy") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <SimpleCalendar
                        selectedDate={date}
                        onSelect={handleSelect}
                        mode="single"
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
