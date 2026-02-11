import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, LogOut, Sparkles } from "lucide-react"
import { SetupSection } from "@/components/setup"
import { ProgressSection } from "@/components/progress"
import { CalendarSection } from "@/components/calendar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { MembershipFooter } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { settingsApi, logsApi, progressApi, reportsApi } from "@/lib/api"
import { downloadCSV, downloadPDF } from "@/lib/reportGenerator"
import { Toaster, toast } from "sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useAuth } from "@/context/AuthContext"
import type { InternSettings, DailyLog, InternProgress, Holiday, LogStatus } from "@/types"

const defaultSettings: InternSettings = {
  targetHours: 500,
  startDate: new Date().toISOString(),
  hoursPerDay: 8,
  excludeHolidays: true,
  workDays: [1, 2, 3, 4, 5],
  autoProjection: true,
}

// Animation variants for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
}

function App() {
  const { logout, isAdminOrSubAdmin } = useAuth()
  const navigate = useNavigate()
  const [settings, setSettings] = useState<InternSettings>(defaultSettings)
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [progress, setProgress] = useState<InternProgress | null>(null)
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)

  // Track scroll position for floating theme toggle
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsData, logsData, progressData, holidaysData] = await Promise.all([
          settingsApi.get(),
          logsApi.getAll(),
          progressApi.get(),
          reportsApi.getAllHolidays(),
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
      toast.success("Settings updated successfully")
    } catch (error) {
      console.error("Failed to update settings:", error)
      toast.error("Failed to update settings")
    }
  }, [settings])

  // Reset settings
  const handleReset = useCallback(async () => {
    try {
      const resetSettings = await settingsApi.reset()
      setSettings(resetSettings)
      const progressData = await progressApi.get()
      setProgress(progressData)
      toast.success("Settings reset to defaults")
    } catch (error) {
      console.error("Failed to reset settings:", error)
      toast.error("Failed to reset settings")
    }
  }, [])

  // Save daily log
  const handleSaveLog = useCallback(async (log: { date: string; hoursWorked: number; tasks: string; status: LogStatus }) => {
    try {
      const savedLog = await logsApi.save(log)
      setLogs((prev) => {
        // Compare using date string (YYYY-MM-DD)
        const savedDateStr = savedLog.date.split('T')[0]
        const existing = prev.findIndex(
          (l) => l.date.split('T')[0] === savedDateStr
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
      toast.success("Log saved successfully")
    } catch (error: any) {
      console.error("Failed to save log:", error)
      const errorDetails = error?.response?.data?.details || error?.response?.data?.error || "Unknown error"
      toast.error(`Failed to save log: ${errorDetails}`)
    }
  }, [])

  // Delete daily log (unlog)
  const handleDeleteLog = useCallback(async (date: string) => {
    try {
      // date is already in YYYY-MM-DD format from DailyTaskLog
      await logsApi.delete(date)
      setLogs((prev) => prev.filter(
        (l) => l.date.split('T')[0] !== date
      ))
      setSelectedDate(null)
      const progressData = await progressApi.get()
      setProgress(progressData)
      toast.success("Log deleted successfully")
    } catch (error) {
      console.error("Failed to delete log:", error)
      toast.error("Failed to delete log")
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

  return (
    <TooltipProvider>
      <div className="relative min-h-screen font-inter overflow-x-hidden">
        {/* Animated background elements & Base Background Color */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-background">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.03, 0.06, 0.03],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-primary rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.04, 0.08, 0.04],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-green rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.02, 0.05, 0.02],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
            className="absolute top-1/3 left-1/3 w-1/3 h-1/3 bg-amber rounded-full blur-3xl"
          />

          {/* Paper plane background overlay - Repeating pattern */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'url("/Paper_plane.png")',
              backgroundSize: '500px 500px',
              backgroundPosition: 'center',
              backgroundRepeat: 'repeat',
              filter: 'invert(1) opacity(0.06)',
            }}
          />
          {/* Additional layer for dark mode - inverts back */}
          <div
            className="absolute inset-0 pointer-events-none hidden dark:block"
            style={{
              backgroundImage: 'url("/Paper_plane.png")',
              backgroundSize: '500px 500px',
              backgroundPosition: 'center',
              backgroundRepeat: 'repeat',
              opacity: 0.04,
            }}
          />
        </div>

        {/* Floating Theme Toggle - Shows when scrolled */}
        <AnimatePresence>
          {isScrolled && (
            <motion.div
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="fixed top-0 right-4 z-50"
            >
              <div className="bg-background/90 backdrop-blur-xl rounded-b-2xl px-4 py-2 shadow-lg border border-t-0 border-border/50">
                <ThemeToggle />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header - Centered Logo Design */}
        <header className="sticky top-0 z-40 w-full bg-amber dark:bg-amber shadow-lg transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
            {/* Left Side - Title */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 12 }}
              className="flex items-center gap-2 flex-1"
            >
              <div>
                <h1 className="text-lg font-bold text-white">
                  Internship Tracker
                </h1>
                <p className="text-xs text-white/70">
                  Track your hours & hit your goal! 🎯
                </p>
              </div>
            </motion.div>

            {/* Center - Logo (pops out) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.1 }}
              className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                {/* Outer ring */}
                <div className="w-60 h-28 rounded-[60px] bg-amber dark:bg-amber border-6 border-amber dark:border-amber flex items-center justify-center shadow-xl">
                  {/* Inner circle with logo */}
                  <div className="w-56 h-24 rounded-[56px] bg-white dark:bg-slate-100 flex items-center justify-center overflow-hidden shadow-inner">
                    <img
                      src="/dw-logo.png"
                      alt="Digital Workforce"
                      className="w-40 h-40 object-contain"
                    />
                  </div>
                </div>
                {/* Glow effect */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 bg-white/20 rounded-full blur-md -z-10"
                />
              </motion.div>
            </motion.div>

            {/* Right Side - Auth Controls & Theme Toggle */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: isScrolled ? 0 : 1, x: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 12 }}
              className={`flex-1 flex items-center justify-end gap-2 ${isScrolled ? "pointer-events-none" : ""}`}
            >
              {isAdminOrSubAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/admin')}
                  className="text-white/80 hover:text-white hover:bg-white/10 text-xs gap-1.5 h-8"
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              )}
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-1 hover:bg-white/20 transition-colors duration-200">
                <ThemeToggle />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { logout(); navigate('/login'); }}
                className="text-white/80 hover:text-white hover:bg-white/10 text-xs gap-1.5 h-8"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </motion.div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 relative z-10">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-32"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mb-6"
                />
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Loading your progress...</span>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              >
                {/* Left Column - Setup & Progress */}
                <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
                  <SetupSection
                    settings={settings}
                    onSettingsChange={handleSettingsChange}
                    onReset={handleReset}
                    isLoading={isLoading}
                  />
                  <ProgressSection
                    progress={progress}
                    onDownloadPDF={handleDownloadPDF}
                    onDownloadCSV={handleDownloadCSV}
                    isLoading={isLoading}
                  />
                </motion.div>

                {/* Right Column - Calendar */}
                <motion.div variants={itemVariants} className="lg:col-span-8">
                  <CalendarSection
                    logs={logs}
                    holidays={holidays}
                    settings={settings}
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    onSaveLog={handleSaveLog}
                    onDeleteLog={handleDeleteLog}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <MembershipFooter />
        <Toaster position="top-right" richColors />
      </div>
    </TooltipProvider>
  )
}

export default App
