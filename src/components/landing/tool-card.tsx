"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

export interface Tool {
    id: string;
    name: string;
    description: string;
    href: string;
    icon: LucideIcon;
    category: "organize" | "optimize" | "convert" | "edit";
    iconBg: string;
    badge?: string; // Optional badge text like "New!"
}

interface ToolCardProps {
    tool: Tool;
    index: number;
}

export function ToolCard({ tool, index }: ToolCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
        >
            <Link
                href={tool.href}
                className="group relative block h-full overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-gray-200"
            >
                {/* Badge if exists */}
                {tool.badge && (
                    <span className="absolute top-4 right-4 rounded-md bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600 uppercase tracking-wide">
                        {tool.badge}
                    </span>
                )}

                {/* Icon Box */}
                <div className={`mb-5 inline-flex h-16 w-16 items-center justify-center rounded-xl ${tool.iconBg} transition-transform duration-300 group-hover:scale-105 shadow-sm`}>
                    <tool.icon
                        className="h-9 w-9 text-white"
                        strokeWidth={2}
                    />
                </div>

                {/* Content */}
                <div>
                    <h3 className="mb-3 text-xl font-black text-[#333333] tracking-tight group-hover:text-[#E5322D] transition-colors">
                        {tool.name}
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-500 font-medium">
                        {tool.description}
                    </p>
                </div>
            </Link>
        </motion.div>
    );
}
