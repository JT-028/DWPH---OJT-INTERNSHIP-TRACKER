import { Moon, Sun } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/ui/theme-provider"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light")
    }

    return (
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="relative overflow-hidden"
            >
                <AnimatePresence mode="wait" initial={false}>
                    {theme === "light" ? (
                        <motion.div
                            key="sun"
                            initial={{ y: -20, opacity: 0, rotate: -90 }}
                            animate={{ y: 0, opacity: 1, rotate: 0 }}
                            exit={{ y: 20, opacity: 0, rotate: 90 }}
                            transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 15 }}
                        >
                            <Sun className="h-5 w-5" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="moon"
                            initial={{ y: -20, opacity: 0, rotate: -90 }}
                            animate={{ y: 0, opacity: 1, rotate: 0 }}
                            exit={{ y: 20, opacity: 0, rotate: 90 }}
                            transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 15 }}
                        >
                            <Moon className="h-5 w-5" />
                        </motion.div>
                    )}
                </AnimatePresence>
                <span className="sr-only">Toggle theme</span>
            </Button>
        </motion.div>
    )
}
