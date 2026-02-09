import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
    const d = new Date(date)
    return d.toISOString().split('T')[0]
}

export function formatDisplayDate(date: Date | string): string {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    })
}

export function getDayName(dayIndex: number): string {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    return days[dayIndex]
}

export function getDayFullName(dayIndex: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[dayIndex]
}
