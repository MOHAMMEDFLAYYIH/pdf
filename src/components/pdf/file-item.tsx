"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { GripVertical, X, FileText, File } from "lucide-react";
import { PDFFile, formatFileSize } from "@/lib/pdf/merge";

interface FileItemProps {
    file: PDFFile;
    onRemove: (id: string) => void;
    index: number;
}

export function FileItem({ file, onRemove, index }: FileItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: file.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className={`group flex items-center gap-4 rounded-xl border bg-white p-4 transition-all dark:bg-gray-900 ${isDragging
                    ? "z-50 border-indigo-500 shadow-lg ring-2 ring-indigo-500/20"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:hover:border-gray-600"
                }`}
        >
            {/* Drag Handle */}
            <button
                {...attributes}
                {...listeners}
                className="cursor-grab touch-none rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 active:cursor-grabbing dark:hover:bg-gray-800 dark:hover:text-gray-300"
                aria-label="Drag to reorder"
            >
                <GripVertical className="h-5 w-5" />
            </button>

            {/* File Icon */}
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-rose-600">
                <FileText className="h-6 w-6 text-white" />
            </div>

            {/* File Info */}
            <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900 dark:text-white" title={file.name}>
                    {file.name}
                </p>
                <div className="mt-0.5 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>{formatFileSize(file.size)}</span>
                    {file.pageCount !== undefined && (
                        <>
                            <span className="text-gray-300 dark:text-gray-600">•</span>
                            <span>{file.pageCount} {file.pageCount === 1 ? "page" : "pages"}</span>
                        </>
                    )}
                </div>
            </div>

            {/* File Number Badge */}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                {index + 1}
            </div>

            {/* Remove Button */}
            <button
                onClick={() => onRemove(file.id)}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                aria-label={`Remove ${file.name}`}
            >
                <X className="h-5 w-5" />
            </button>
        </motion.div>
    );
}
