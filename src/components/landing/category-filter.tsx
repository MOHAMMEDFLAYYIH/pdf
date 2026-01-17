"use client";

import { motion } from "framer-motion";

export type Category = "all" | "organize" | "optimize" | "convert" | "edit";

interface CategoryFilterProps {
    activeCategory: Category;
    onCategoryChange: (category: Category) => void;
}

const categories: { id: Category; label: string }[] = [
    { id: "all", label: "All Tools" },
    { id: "organize", label: "Organize" },
    { id: "optimize", label: "Optimize" },
    { id: "convert", label: "Convert" },
    { id: "edit", label: "Edit" },
];

export function CategoryFilter({ activeCategory, onCategoryChange }: CategoryFilterProps) {
    return (
        <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((category) => (
                <button
                    key={category.id}
                    onClick={() => onCategoryChange(category.id)}
                    className={`relative rounded-full px-5 py-2.5 text-sm font-medium transition-all ${activeCategory === category.id
                            ? "text-white"
                            : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        }`}
                >
                    {activeCategory === category.id && (
                        <motion.div
                            layoutId="activeCategory"
                            className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 shadow-lg shadow-violet-500/25"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    <span className="relative z-10">{category.label}</span>
                </button>
            ))}
        </div>
    );
}
