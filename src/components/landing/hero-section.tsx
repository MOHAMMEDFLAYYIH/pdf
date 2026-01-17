"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const categories = [
    { name: "All", href: "/#tools" },
    { name: "Organize PDF", href: "/#tools" },
    { name: "Optimize PDF", href: "/#tools" },
    { name: "Convert PDF", href: "/#tools" },
    { name: "Edit PDF", href: "/#tools" },
    { name: "PDF Security", href: "/#tools" },
];

export function HeroSection() {
    return (
        <section className="relative bg-[#F4F7FA] pt-12 pb-4 sm:pt-16 sm:pb-8 lg:pt-20 lg:pb-10">
            <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl font-bold tracking-tight text-[#333333] sm:text-4xl md:text-5xl"
                >
                    Every tool you need to work with PDFs in one place
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mx-auto mt-4 max-w-3xl text-lg text-gray-500 sm:text-xl"
                >
                    Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use!
                    Merge, split, compress, convert, rotate, unlock and watermark PDFs with just a few clicks.
                </motion.p>

                {/* Category Pills Navigation */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-10 flex flex-wrap justify-center gap-3"
                >
                    {categories.map((cat, index) => (
                        <Link
                            key={index}
                            href={cat.href}
                            className={`rounded-full border px-6 py-2 text-sm font-medium transition-colors 
                                ${index === 0
                                    ? "bg-[#33333B] text-white border-[#33333B]"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                        >
                            {cat.name}
                        </Link>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
