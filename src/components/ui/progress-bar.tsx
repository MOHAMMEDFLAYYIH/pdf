"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
    progress: number;
    message?: string;
    showPercentage?: boolean;
    size?: "sm" | "md" | "lg";

    variant?: "default" | "gradient" | "glow";
    color?: string;
}

export function ProgressBar({
    progress,
    message,
    showPercentage = true,
    size = "md",

    variant = "gradient",
    color,
}: ProgressBarProps) {
    const heights = {
        sm: "h-1.5",
        md: "h-2.5",
        lg: "h-4",
    };

    const textSizes = {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
    };

    const barStyles = {
        default: "bg-indigo-600 dark:bg-indigo-500",
        gradient: "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600",
        glow: "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg shadow-indigo-500/50",
    };

    return (
        <div className="w-full">
            {/* Header */}
            <div className="mb-2 flex items-center justify-between">
                {message && (
                    <motion.p
                        key={message}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`font-medium text-gray-700 dark:text-gray-300 ${textSizes[size]}`}
                    >
                        {message}
                    </motion.p>
                )}
                {showPercentage && (
                    <span className={`font-mono font-semibold text-gray-900 dark:text-white ${textSizes[size]}`}>
                        {Math.round(progress)}%
                    </span>
                )}
            </div>

            {/* Progress Track */}
            <div
                className={`w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800 ${heights[size]}`}
            >
                {/* Progress Fill */}
                <motion.div
                    className={`h-full rounded-full ${!color ? barStyles[variant] : ''}`}
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{
                        duration: 0.3,
                        ease: "easeOut",
                    }}
                />
            </div>

            {/* Animated Dots (when processing) */}
            {progress > 0 && progress < 100 && (
                <div className="mt-2 flex justify-center gap-1">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="h-1.5 w-1.5 rounded-full bg-indigo-500"
                            animate={{
                                scale: [1, 1.3, 1],
                                opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// Circular Progress variant
interface CircularProgressProps {
    progress: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
}

export function CircularProgress({ progress, size = 80, strokeWidth = 6, color }: CircularProgressProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="-rotate-90" width={size} height={size}>
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    className="text-gray-200 dark:text-gray-800"
                />
                {/* Progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    stroke={color || "url(#gradient)"}
                    fill="transparent"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    style={{
                        strokeDasharray: circumference,
                    }}
                />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="50%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                </defs>
            </svg>
            {/* Percentage text */}
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {Math.round(progress)}%
                </span>
            </div>
        </div>
    );
}
