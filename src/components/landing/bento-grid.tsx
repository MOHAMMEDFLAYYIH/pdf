"use client";

import { motion } from "framer-motion";
import {
    Scissors,
    FileDown,
    FileImage,
    FileEdit,
    Droplet,
    Lock,
    Unlock,
    FileText,
    FileSpreadsheet,
    Presentation,
    FileSignature,
    Layout,
    Shield,
    AlertTriangle,
} from "lucide-react";
import { BentoCard, type BentoTool } from "./bento-card";

// All 14+ tools with premium neon colors
const bentoTools: BentoTool[] = [
    // Hero - Merge PDF (large, left)
    {
        id: "merge-pdf",
        name: "Merge PDF",
        description: "Drag-and-drop zone",
        href: "/tools/merge-pdf",
        icon: FileText,
        neonColor: "red",
        isHero: true,
    },
    // Row 1: Split, Compress, PDF to Word
    {
        id: "split-pdf",
        name: "Split PDF",
        description: "Split pages",
        href: "/tools/split-pdf",
        icon: Scissors,
        neonColor: "red",
    },
    {
        id: "compress-pdf",
        name: "Compress PDF",
        description: "Reduce size",
        href: "/tools/compress-pdf",
        icon: FileDown,
        neonColor: "cyan",
    },
    {
        id: "pdf-to-word",
        name: "PDF to Word",
        description: "Convert to DOCX",
        href: "/tools/pdf-to-word",
        icon: FileText,
        neonColor: "blue",
    },
    // Row 2: PDF to PPT, Word to PDF, Excel to PDF
    {
        id: "pdf-to-powerpoint",
        name: "PDF to PPT",
        description: "Convert to slides",
        href: "/tools/pdf-to-powerpoint",
        icon: Presentation,
        neonColor: "orange",
    },
    {
        id: "word-to-pdf",
        name: "Word to PDF",
        description: "DOC to PDF",
        href: "/tools/word-to-pdf",
        icon: FileText,
        neonColor: "blue",
    },
    {
        id: "excel-to-pdf",
        name: "Excel to PDF",
        description: "XLS to PDF",
        href: "/tools/excel-to-pdf",
        icon: FileSpreadsheet,
        neonColor: "green",
    },
    // Row 3: PPT to PDF, PDF to JPG, JPG to PDF
    {
        id: "powerpoint-to-pdf",
        name: "PPT to PDF",
        description: "Slides to PDF",
        href: "/tools/powerpoint-to-pdf",
        icon: Presentation,
        neonColor: "orange",
    },
    {
        id: "pdf-to-image",
        name: "PDF to JPG",
        description: "Convert to images",
        href: "/tools/pdf-to-image",
        icon: FileImage,
        neonColor: "pink",
    },
    {
        id: "image-to-pdf",
        name: "JPG to PDF",
        description: "Images to PDF",
        href: "/tools/image-to-pdf",
        icon: FileImage,
        neonColor: "cyan",
    },
    // Row 4: Protect, Unlock, Organize, Redact, Watermark, Sign
    {
        id: "protect-pdf",
        name: "Protect PDF",
        description: "Add password",
        href: "/tools/protect-pdf",
        icon: Shield,
        neonColor: "blue",
    },
    {
        id: "unlock-pdf",
        name: "Unlock PDF",
        description: "Remove password",
        href: "/tools/unlock-pdf",
        icon: Unlock,
        neonColor: "green",
    },
    {
        id: "organize-pdf",
        name: "Organize PDF",
        description: "Sort pages",
        href: "/tools/organize-pdf",
        icon: Layout,
        neonColor: "cyan",
    },
    {
        id: "edit-pdf",
        name: "Redact PDF",
        description: "Hide content",
        href: "/tools/edit-pdf",
        icon: AlertTriangle,
        neonColor: "orange",
    },
    {
        id: "watermark-pdf",
        name: "Watermark PDF",
        description: "Add watermark",
        href: "/tools/watermark-pdf",
        icon: Droplet,
        neonColor: "purple",
    },
    {
        id: "sign-pdf",
        name: "Sign PDF",
        description: "E-signatures",
        href: "/tools/sign-pdf",
        icon: FileSignature,
        neonColor: "yellow",
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.1,
        },
    },
};

export function BentoGrid() {
    return (
        <section
            className="min-h-screen py-10 px-4 sm:px-6 lg:px-8"
            style={{
                background: 'var(--bento-bg)',
                backgroundImage: 'var(--bento-bg-gradient)',
            }}
        >
            <div className="mx-auto max-w-[1300px]">
                {/* Premium Bento Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="bento-grid"
                >
                    {bentoTools.map((tool, index) => (
                        <BentoCard key={tool.id} tool={tool} index={index} />
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
