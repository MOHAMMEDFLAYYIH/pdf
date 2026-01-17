"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ShieldCheck, CloudOff, Lock, Users } from "lucide-react";
import { useEffect, useState } from "react";

// Animated counter component
function AnimatedValue({ value, suffix = "" }: { value: string; suffix?: string }) {
    const numericMatch = value.match(/^\d+/);
    if (!numericMatch) {
        return <span>{value}</span>;
    }

    const numericValue = parseInt(numericMatch[0]);
    const textSuffix = value.replace(/^\d+/, "") + suffix;

    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const controls = animate(count, numericValue, {
            duration: 2.5,
            ease: "easeOut",
        });
        return controls.stop;
    }, [count, numericValue]);

    useEffect(() => {
        const unsubscribe = rounded.on("change", (v) => setDisplayValue(v));
        return unsubscribe;
    }, [rounded]);

    return (
        <span>
            {displayValue}
            {textSuffix}
        </span>
    );
}

const badges = [
    {
        icon: Users,
        value: "10",
        suffix: "M+",
        label: "Files Processed",
        gradient: "from-violet-500 to-purple-600",
    },
    {
        icon: CloudOff,
        value: "0",
        suffix: "",
        label: "Files on Servers",
        gradient: "from-fuchsia-500 to-pink-600",
    },
    {
        icon: ShieldCheck,
        value: "100",
        suffix: "%",
        label: "GDPR Compliant",
        gradient: "from-emerald-500 to-teal-600",
    },
    {
        icon: Lock,
        value: "256",
        suffix: "-bit",
        label: "Local Encryption",
        gradient: "from-blue-500 to-indigo-600",
    },
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.12,
        },
    },
};

const item = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            stiffness: 100,
            damping: 15,
        },
    },
};

export function TrustBadges() {
    return (
        <section className="relative border-y border-gray-100/50 bg-gradient-to-b from-white via-gray-50/50 to-white dark:border-gray-800/50 dark:from-gray-950 dark:via-gray-900/50 dark:to-gray-950">
            {/* Subtle pattern */}
            <div className="absolute inset-0 opacity-[0.02]" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(139,92,246,0.5) 1px, transparent 0)`,
                backgroundSize: '24px 24px',
            }} />

            <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
                >
                    {badges.map((badge, index) => (
                        <motion.div
                            key={badge.label}
                            variants={item}
                            className="group relative flex flex-col items-center gap-3 rounded-2xl border border-gray-200/50 bg-white/70 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:border-violet-300/50 hover:bg-white hover:shadow-xl hover:shadow-violet-500/5 dark:border-gray-800/50 dark:bg-gray-900/70 dark:hover:border-violet-700/50 dark:hover:bg-gray-900"
                        >
                            {/* Icon container */}
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${badge.gradient} shadow-lg transition-shadow duration-300 group-hover:shadow-xl`}
                            >
                                <badge.icon className="h-7 w-7 text-white" />
                            </motion.div>

                            {/* Value */}
                            <div>
                                <p className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                                    <AnimatedValue value={badge.value} suffix={badge.suffix} />
                                </p>
                                <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {badge.label}
                                </p>
                            </div>

                            {/* Bottom gradient line */}
                            <div className={`absolute bottom-0 left-4 right-4 h-0.5 scale-x-0 rounded-full bg-gradient-to-r ${badge.gradient} transition-transform duration-300 group-hover:scale-x-100`} />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
