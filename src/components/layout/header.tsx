"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

// Premium PDF Logo with gradient
function PDFLogo() {
    return (
        <svg className="h-9 w-9" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff3366" />
                    <stop offset="100%" stopColor="#ff1744" />
                </linearGradient>
            </defs>
            <rect x="4" y="2" width="32" height="36" rx="4" fill="url(#logoGrad)" />
            <path d="M28 2v10h10" fill="#ff6b81" opacity="0.5" />
            <path d="M28 2l10 10h-8a2 2 0 01-2-2V2z" fill="#ff8a9b" />
            <text x="20" y="28" fontSize="11" fontWeight="700" fill="white" textAnchor="middle" fontFamily="Inter, sans-serif">PDF</text>
        </svg>
    );
}

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="header-dark sticky top-0 z-50">
            <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo - Clean, single instance */}
                <Link href="/" className="flex items-center gap-3">
                    <PDFLogo />
                    <span className="text-xl font-bold tracking-tight text-white text-premium">
                        PDFPro
                    </span>
                </Link>

                {/* User Profile Icon - Clean, single button */}
                <div className="flex items-center">
                    <button className="flex items-center justify-center h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 hover:border-white/20">
                        <svg className="h-5 w-5 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                    </button>
                </div>

                {/* Mobile menu button (hidden on desktop) */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="hidden rounded-lg p-2 text-white transition-colors hover:bg-white/10"
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </nav>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-[#050510] md:hidden border-t border-white/5"
                    >
                        <div className="space-y-1 px-4 py-4">
                            <Link
                                href="/tools/merge-pdf"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block rounded-lg px-4 py-3 text-base font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                            >
                                Merge PDF
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
