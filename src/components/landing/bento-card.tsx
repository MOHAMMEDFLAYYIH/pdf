"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

export interface BentoTool {
    id: string;
    name: string;
    description: string;
    href: string;
    icon: LucideIcon;
    neonColor: "orange" | "red" | "pink" | "purple" | "blue" | "cyan" | "green" | "yellow";
    isHero?: boolean;
}

interface BentoCardProps {
    tool: BentoTool;
    index: number;
}

// Premium PDF icon for hero card with 3D glow effect
function HeroPDFIcon() {
    return (
        <div className="relative">
            {/* Outer glow */}
            <div className="absolute inset-0 blur-2xl opacity-60">
                <svg className="h-28 w-28 text-red-500" viewBox="0 0 64 64" fill="currentColor">
                    <rect x="12" y="8" width="36" height="48" rx="4" />
                </svg>
            </div>
            {/* Icon */}
            <svg className="relative h-28 w-28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Back page with gradient */}
                <defs>
                    <linearGradient id="pdfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ff3366" />
                        <stop offset="100%" stopColor="#ff1744" />
                    </linearGradient>
                </defs>
                <rect x="18" y="6" width="32" height="44" rx="3" stroke="#ff3366" strokeWidth="1.5" fill="none" opacity="0.4" />
                <rect x="10" y="12" width="32" height="44" rx="3" stroke="url(#pdfGrad)" strokeWidth="2" fill="rgba(255,51,102,0.1)" />
                {/* Corner fold */}
                <path d="M34 12v10h10" stroke="#ff3366" strokeWidth="1.5" fill="rgba(255,51,102,0.15)" />
                {/* PDF text */}
                <text x="26" y="42" fontSize="10" fontWeight="700" fill="#ff3366" textAnchor="middle" fontFamily="Inter, sans-serif">PDF</text>
            </svg>
        </div>
    );
}

export function BentoCard({ tool, index }: BentoCardProps) {
    const isHero = tool.isHero;

    if (isHero) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bento-hero"
            >
                <Link
                    href={tool.href}
                    className="hero-card group relative flex flex-col items-center justify-center h-full rounded-3xl transition-all duration-500 hover:scale-[1.02]"
                >
                    {/* Dashed border */}
                    <div className="hero-dashed-border" />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center justify-center p-8 text-center">
                        <HeroPDFIcon />
                        <h3 className="mt-8 text-3xl font-bold text-white text-premium tracking-tight">
                            {tool.name}
                        </h3>
                        <p className="mt-3 text-base text-white/50 font-medium">
                            {tool.description}
                        </p>
                    </div>
                </Link>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.03 }}
        >
            <Link
                href={tool.href}
                className="glass-card group flex flex-col items-center justify-center p-6 text-center h-full min-h-[130px]"
            >
                {/* 3D Neon Icon with Aura */}
                <div className={`neon-icon neon-icon-${tool.neonColor} h-14 w-14 mb-4`}>
                    <tool.icon
                        className="text-white h-7 w-7"
                        strokeWidth={1.5}
                    />
                </div>

                {/* Tool Name */}
                <h3 className="font-semibold text-white text-sm text-premium leading-tight">
                    {tool.name}
                </h3>
            </Link>
        </motion.div>
    );
}
