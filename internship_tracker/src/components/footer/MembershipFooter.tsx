import { motion } from "framer-motion"
import { useState } from "react"

// Grayscale logos
import ibpapLogo from "@/assets/ibpap_logo.png"
import btdLogo from "@/assets/btd_logo.png"
import apbcLogo from "@/assets/apbc_logo.png"
import amchamLogo from "@/assets/amcham_logo.png"

// Colored logos
import ibpapLogoC from "@/assets/ibpap_logo_c.png"
import btdLogoC from "@/assets/btd_logo_c.webp"
import apbcLogoC from "@/assets/apbc_logo_c.png"
import amchamLogoC from "@/assets/amcham_logo_c.png"

const organizations = [
    { name: "IBPAP", logo: ibpapLogo, logoColor: ibpapLogoC },
    { name: "BTD", logo: btdLogo, logoColor: btdLogoC },
    { name: "APBC", logo: apbcLogo, logoColor: apbcLogoC },
    { name: "AMCHAM", logo: amchamLogo, logoColor: amchamLogoC },
]

export function MembershipFooter() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

    return (
        <footer className="border-t bg-secondary/20 backdrop-blur-sm mt-12">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <p className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-6">
                        A Proud Member Of
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                        {organizations.map((org, index) => (
                            <motion.div
                                key={org.name}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className="relative"
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <div className="h-24 w-48 md:h-52 md:w-64 flex items-center justify-center p-4 transition-transform duration-300 hover:scale-110">
                                    {/* Grayscale logo */}
                                    <img
                                        src={org.logo}
                                        alt={`${org.name} Logo`}
                                        className={`h-full w-full object-contain transition-opacity duration-300 ${hoveredIndex === index ? 'opacity-0' : 'opacity-100'
                                            }`}
                                    />
                                    {/* Colored logo (shows on hover) */}
                                    <img
                                        src={org.logoColor}
                                        alt={`${org.name} Logo Colored`}
                                        className={`absolute inset-0 m-auto h-full w-full object-contain transition-opacity duration-300 ${hoveredIndex === index ? 'opacity-100' : 'opacity-0'
                                            }`}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <div className="mt-8 pt-6 border-t border-border/50">
                    <p className="text-center text-xs text-muted-foreground">
                        Data stays on your device. Projections update instantly as you change your schedule.
                    </p>
                </div>
            </div>
        </footer>
    )
}
