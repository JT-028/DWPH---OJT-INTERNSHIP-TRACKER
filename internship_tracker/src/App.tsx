import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Heart } from "lucide-react"
import { SetupSection } from "@/components/setup"
import { ProgressSection } from "@/components/progress"
import { CalendarSection } from "@/components/calendar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { MembershipFooter } from "@/components/footer"
import { settingsApi, logsApi, progressApi, reportsApi } from "@/lib/api"
import { downloadCSV, downloadPDF } from "@/lib/reportGenerator"
import type { InternSettings, DailyLog, InternProgress, Holiday, LogStatus } from "@/types"

const defaultSettings: InternSettings = {
  targetHours: 500,
  startDate: new Date().toISOString(),
  hoursPerDay: 8,
  excludeHolidays: true,
  workDays: [1, 2, 3, 4, 5],
  autoProjection: true,
}

function App() {
  const [settings, setSettings] = useState<InternSettings>(defaultSettings)
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [progress, setProgress] = useState<InternProgress | null>(null)
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsData, logsData, progressData, holidaysData] = await Promise.all([
          settingsApi.get(),
          logsApi.getAll(),
          progressApi.get(),
          reportsApi.getHolidays(2026),
        ])
        setSettings(settingsData)
        setLogs(logsData)
        setProgress(progressData)
        setHolidays(holidaysData)
      } catch (error) {
        console.error("Failed to fetch data:", error)
        // Use defaults on error
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Update settings
  const handleSettingsChange = useCallback(async (newSettings: Partial<InternSettings>) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)
    try {
      await settingsApi.update(newSettings)
      const progressData = await progressApi.get()
      setProgress(progressData)
    } catch (error) {
      console.error("Failed to update settings:", error)
    }
  }, [settings])

  // Reset settings
  const handleReset = useCallback(async () => {
    try {
      const resetSettings = await settingsApi.reset()
      setSettings(resetSettings)
      const progressData = await progressApi.get()
      setProgress(progressData)
    } catch (error) {
      console.error("Failed to reset settings:", error)
    }
  }, [])

  // Save daily log
  const handleSaveLog = useCallback(async (log: { date: string; hoursWorked: number; tasks: string; status: LogStatus }) => {
    try {
      const savedLog = await logsApi.save(log)
      setLogs((prev) => {
        const existing = prev.findIndex(
          (l) => new Date(l.date).toDateString() === new Date(savedLog.date).toDateString()
        )
        if (existing >= 0) {
          const updated = [...prev]
          updated[existing] = savedLog
          return updated
        }
        return [...prev, savedLog]
      })
      const progressData = await progressApi.get()
      setProgress(progressData)
    } catch (error) {
      console.error("Failed to save log:", error)
    }
  }, [])

  // Delete daily log (unlog)
  const handleDeleteLog = useCallback(async (date: string) => {
    try {
      const dateStr = new Date(date).toISOString().split('T')[0]
      await logsApi.delete(dateStr)
      setLogs((prev) => prev.filter(
        (l) => new Date(l.date).toDateString() !== new Date(date).toDateString()
      ))
      setSelectedDate(null)
      const progressData = await progressApi.get()
      setProgress(progressData)
    } catch (error) {
      console.error("Failed to delete log:", error)
    }
  }, [])

  // Download reports
  const handleDownloadPDF = useCallback(async () => {
    try {
      const data = await reportsApi.getData()
      downloadPDF(data)
    } catch (error) {
      console.error("Failed to generate PDF:", error)
    }
  }, [])

  const handleDownloadCSV = useCallback(async () => {
    try {
      const data = await reportsApi.getData()
      downloadCSV(data)
    } catch (error) {
      console.error("Failed to generate CSV:", error)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <Heart className="h-8 w-8 text-rose-500 fill-rose-500" />
            <div>
              <h1 className="text-2xl font-bold">Internship Tracker</h1>
              <p className="text-sm text-muted-foreground">
                Track your hours, exclude off-days, and hit your goal! 🎯
              </p>
            </div>
          </motion.div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Setup & Progress */}
          <div className="lg:col-span-4 space-y-6">
            <SetupSection
              settings={settings}
              onSettingsChange={handleSettingsChange}
              onReset={handleReset}
            />
            <ProgressSection
              progress={progress}
              onDownloadPDF={handleDownloadPDF}
              onDownloadCSV={handleDownloadCSV}
            />
          </div>

          {/* Right Column - Calendar */}
          <div className="lg:col-span-8">
            <CalendarSection
              logs={logs}
              holidays={holidays}
              settings={settings}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onSaveLog={handleSaveLog}
              onDeleteLog={handleDeleteLog}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <MembershipFooter />
    </div>
  )
}

export default App
