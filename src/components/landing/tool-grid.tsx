"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    GitMerge,
    Scissors,
    FileDown,
    FileImage,
    FileEdit,
    RotateCw,
    Droplet,
    MessageSquare,
    Lock,
    Unlock,
    FileText,
    FileSpreadsheet,
    Presentation,
    Layers,
    FileSignature,
    ScanLine,
    Layout,
    FileCheck,
    PenTool as RepairTool
} from "lucide-react";
import { ToolCard, type Tool } from "./tool-card";

// Updated tool list with background colors and BADGES
const tools: Tool[] = [
    {
        id: "merge-pdf",
        name: "Merge PDF",
        description: "Combine multiple PDFs into a single document",
        href: "/tools/merge-pdf",
        icon: GitMerge,
        category: "organize",
        iconBg: "bg-[#E5322D]",
    },
    {
        id: "split-pdf",
        name: "Split PDF",
        description: "Extract pages or split PDF into multiple files",
        href: "/tools/split-pdf",
        icon: Scissors,
        category: "organize",
        iconBg: "bg-[#E5322D]",
    },
    {
        id: "compress-pdf",
        name: "Compress PDF",
        description: "Reduce file size while maintaining quality",
        href: "/tools/compress-pdf",
        icon: FileDown,
        category: "optimize",
        iconBg: "bg-[#E5322D]",
    },
    {
        id: "pdf-to-word",
        name: "PDF to Word",
        description: "Convert your PDF to WORD documents",
        href: "/tools/pdf-to-word",
        icon: FileText,
        category: "convert",
        iconBg: "bg-[#4A90E2]",
    },
    {
        id: "pdf-to-powerpoint",
        name: "PDF to PowerPoint",
        description: "Convert your PDF to POWERPOINT slides",
        href: "/tools/pdf-to-powerpoint",
        icon: Presentation,
        category: "convert",
        iconBg: "bg-[#D04423]",
    },
    {
        id: "pdf-to-excel",
        name: "PDF to Excel",
        description: "Convert your PDF to EXCEL spreadsheets",
        href: "/tools/pdf-to-excel",
        icon: FileSpreadsheet,
        category: "convert",
        iconBg: "bg-[#217346]",
    },
    {
        id: "word-to-pdf",
        name: "Word to PDF",
        description: "Convert DOC and DOCX to PDF",
        href: "/tools/word-to-pdf",
        icon: FileText,
        category: "convert",
        iconBg: "bg-[#4A90E2]",
    },
    {
        id: "powerpoint-to-pdf",
        name: "PowerPoint to PDF",
        description: "Convert PPT and PPTX to PDF",
        href: "/tools/powerpoint-to-pdf",
        icon: Presentation,
        category: "convert",
        iconBg: "bg-[#D04423]",
    },
    {
        id: "excel-to-pdf",
        name: "Excel to PDF",
        description: "Convert XLS and XLSX to PDF",
        href: "/tools/excel-to-pdf",
        icon: FileSpreadsheet,
        category: "convert",
        iconBg: "bg-[#217346]",
    },
    {
        id: "edit-pdf",
        name: "Edit PDF",
        description: "Add text, images, and annotations",
        href: "/tools/edit-pdf",
        icon: FileEdit,
        category: "edit",
        iconBg: "bg-[#E5322D]",
    },
    {
        id: "pdf-to-image",
        name: "PDF to JPG",
        description: "Convert PDF pages to JPG images",
        href: "/tools/pdf-to-image",
        icon: FileImage,
        category: "convert",
        iconBg: "bg-[#EAB308]",
    },
    {
        id: "image-to-pdf",
        name: "JPG to PDF",
        description: "Create PDF from images in seconds",
        href: "/tools/image-to-pdf",
        icon: FileImage,
        category: "convert",
        iconBg: "bg-[#EAB308]",
    },
    {
        id: "sign-pdf",
        name: "Sign PDF",
        description: "Sign yourself or request electronic signatures",
        href: "/tools/sign-pdf",
        icon: FileSignature,
        category: "edit",
        iconBg: "bg-[#E5322D]",
    },
    {
        id: "watermark-pdf",
        name: "Watermark PDF",
        description: "Stamp an image or text over your PDF",
        href: "/tools/watermark-pdf",
        icon: Droplet,
        category: "edit",
        iconBg: "bg-[#E5322D]",
    },
    {
        id: "rotate-pdf",
        name: "Rotate PDF",
        description: "Rotate your PDF pages as you need",
        href: "/tools/rotate-pdf",
        icon: RotateCw,
        category: "organize",
        iconBg: "bg-[#E5322D]",
    },
    {
        id: "unlock-pdf",
        name: "Unlock PDF",
        description: "Remove PDF password security",
        href: "/tools/unlock-pdf",
        icon: Unlock,
        category: "optimize",
        iconBg: "bg-[#4A90E2]",
    },
    {
        id: "protect-pdf",
        name: "Protect PDF",
        description: "Encrypt PDF files with a password",
        href: "/tools/protect-pdf",
        icon: Lock,
        category: "optimize",
        iconBg: "bg-[#4A90E2]",
    },
    {
        id: "organize-pdf",
        name: "Organize PDF",
        description: "Sort pages of your PDF file however you like",
        href: "/tools/organize-pdf",
        icon: Layout,
        category: "organize",
        iconBg: "bg-[#E5322D]",
    },
    {
        id: "scan-pdf",
        name: "Scan to PDF",
        description: "Capture document scans from your mobile",
        href: "/tools/scan-to-pdf",
        icon: ScanLine,
        category: "convert",
        iconBg: "bg-[#E5322D]",
        badge: "New!"
    },
    {
        id: "ocr-pdf",
        name: "OCR PDF",
        description: "Extract text from scanned PDF files",
        href: "/tools/ocr-pdf",
        icon: ScanLine,
        category: "convert",
        iconBg: "bg-[#E5322D]",
        badge: "New!"
    },
    {
        id: "page-numbers",
        name: "Page Numbers",
        description: "Add page numbers into your PDFs",
        href: "/tools/add-page-numbers",
        icon: Layers,
        category: "edit",
        iconBg: "bg-[#E5322D]",
    },
    {
        id: "extract-pages",
        name: "Extract Pages",
        description: "Get specific pages from your PDF",
        href: "/tools/extract-pages",
        icon: FileDown,
        category: "organize",
        iconBg: "bg-[#E5322D]",
    },
    {
        id: "remove-pages",
        name: "Remove Pages",
        description: "Delete selected pages from your PDF",
        href: "/tools/remove-pages",
        icon: Layers,
        category: "organize",
        iconBg: "bg-[#E5322D]",
    },
    {
        id: "html-to-pdf",
        name: "HTML to PDF",
        description: "Convert webpages/HTML to PDF",
        href: "/tools/html-to-pdf",
        icon: Layout,
        category: "convert",
        iconBg: "bg-[#4A90E2]",
        badge: "New!"
    },
    {
        id: "chat-pdf",
        name: "Chat PDF",
        description: "Ask questions to your PDF with AI",
        href: "/tools/chat-pdf",
        icon: MessageSquare,
        category: "convert",
        iconBg: "bg-[#7C3AED]",
        badge: "AI"
    },
    {
        id: "repair-pdf",
        name: "Repair PDF",
        description: "Recover data from corrupted PDFs",
        href: "/tools/repair-pdf",
        icon: RepairTool,
        category: "optimize",
        iconBg: "bg-[#F59E0B]",
        badge: "New!"
    },
    {
        id: "pdf-to-pdfa",
        name: "PDF to PDF/A",
        description: "Convert PDF to ISO-compliant PDF/A",
        href: "/tools/pdf-to-pdfa",
        icon: FileCheck,
        category: "convert",
        iconBg: "bg-[#10B981]",
        badge: "New!"
    }
];

export function ToolGrid() {
    return (
        <section id="tools" className="py-16 bg-[#F4F7FA]">
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
                {/* Tools Grid - Increased max-width and density */}
                <motion.div
                    layout
                    className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" // Added 5 column layout for large screens
                >
                    {tools.map((tool, index) => (
                        <ToolCard key={tool.id} tool={tool} index={index} />
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
