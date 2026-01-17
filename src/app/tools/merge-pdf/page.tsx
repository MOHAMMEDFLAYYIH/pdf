"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    Merge,
    Download,
    Trash2,
    Loader2,
    Shield,
    CheckCircle2,
    ArrowLeft,
    Plus,
    GripVertical,
    X,
    FileText,
    Sparkles,
} from "lucide-react";
import Link from "next/link";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { FileUploader } from "@/components/pdf/file-uploader";
import { ProgressBar, CircularProgress } from "@/components/ui/progress-bar";
import { usePDF, PDFFileInfo } from "@/hooks/use-pdf";

// Sortable File Item Component
function SortableFileItem({
    file,
    index,
    onRemove,
}: {
    file: PDFFileInfo;
    index: number;
    onRemove: (id: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: file.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`group flex items-center gap-4 rounded-2xl border bg-white p-4 transition-all dark:bg-gray-900 ${isDragging
                    ? "z-50 border-indigo-500 shadow-2xl shadow-indigo-500/20 ring-2 ring-indigo-500/30"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-lg dark:border-gray-800 dark:hover:border-gray-700"
                }`}
        >
            {/* Drag Handle */}
            <button
                {...attributes}
                {...listeners}
                className="cursor-grab touch-none rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 active:cursor-grabbing dark:hover:bg-gray-800"
                aria-label="Drag to reorder"
            >
                <GripVertical className="h-5 w-5" />
            </button>

            {/* File Icon */}
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg">
                <FileText className="h-7 w-7 text-white" />
            </div>

            {/* File Info */}
            <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-900 dark:text-white" title={file.name}>
                    {file.name}
                </p>
                <div className="mt-1 flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <span>{formatSize(file.size)}</span>
                    <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                    <span>
                        {file.pageCount} {file.pageCount === 1 ? "page" : "pages"}
                    </span>
                </div>
            </div>

            {/* Order Badge */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                {index + 1}
            </div>

            {/* Remove Button */}
            <button
                onClick={() => onRemove(file.id)}
                className="rounded-xl p-2 text-gray-400 transition-all hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                aria-label={`Remove ${file.name}`}
            >
                <X className="h-5 w-5" />
            </button>
        </motion.div>
    );
}

export default function MergePDFPage() {
    const {
        files,
        addFiles,
        removeFile,
        reorderFiles,
        clearFiles,
        processingState,
        mergePDFs,
        downloadResult,
    } = usePDF();

    const [isComplete, setIsComplete] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = files.findIndex((f) => f.id === active.id);
            const newIndex = files.findIndex((f) => f.id === over.id);
            reorderFiles(arrayMove(files, oldIndex, newIndex));
        }
    };

    const handleMerge = async () => {
        if (files.length < 2) {
            toast.error("Please add at least 2 PDF files to merge");
            return;
        }

        const result = await mergePDFs();
        if (result) {
            const filename = `merged_${new Date().toISOString().slice(0, 10).replace(/-/g, "")}.pdf`;
            downloadResult(result, filename);
            setIsComplete(true);
            toast.success("PDFs merged successfully!");
        } else if (processingState.error) {
            toast.error(processingState.error);
        }
    };

    const totalPages = files.reduce((sum, f) => sum + f.pageCount, 0);
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>

                    <div className="mt-6 flex items-center gap-5">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 shadow-2xl shadow-indigo-500/30"
                        >
                            <Merge className="h-8 w-8 text-white" />
                        </motion.div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Merge PDF
                            </h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">
                                Combine multiple PDFs into one document
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Privacy Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex items-center justify-center gap-2 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30"
                >
                    <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-green-700 dark:text-green-400">
                        100% Private
                    </span>
                    <span className="text-green-600 dark:text-green-500">
                        – Files are processed locally and never uploaded
                    </span>
                </motion.div>

                {/* File Uploader */}
                <FileUploader onFilesAdded={addFiles} disabled={processingState.isProcessing} />

                {/* File List */}
                {files.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8"
                    >
                        {/* Stats Bar */}
                        <div className="mb-4 flex items-center justify-between rounded-2xl bg-white p-4 dark:bg-gray-900">
                            <div className="flex flex-wrap gap-6 text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                    <span className="font-bold text-gray-900 dark:text-white">{files.length}</span>{" "}
                                    {files.length === 1 ? "file" : "files"}
                                </span>
                                <span className="text-gray-600 dark:text-gray-400">
                                    <span className="font-bold text-gray-900 dark:text-white">{totalPages}</span>{" "}
                                    pages total
                                </span>
                                <span className="text-gray-600 dark:text-gray-400">
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {formatSize(totalSize)}
                                    </span>
                                </span>
                            </div>
                            <p className="text-xs text-gray-400">Drag to reorder</p>
                        </div>

                        {/* Sortable List */}
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={files.map((f) => f.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-3">
                                    <AnimatePresence mode="popLayout">
                                        {files.map((file, index) => (
                                            <SortableFileItem
                                                key={file.id}
                                                file={file}
                                                index={index}
                                                onRemove={removeFile}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </SortableContext>
                        </DndContext>
                    </motion.div>
                )}

                {/* Processing State / Progress Bar */}
                {processingState.isProcessing && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-8 rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-8 dark:border-indigo-900 dark:from-indigo-950/50 dark:to-purple-950/50"
                    >
                        <div className="flex flex-col items-center gap-6 sm:flex-row">
                            <CircularProgress progress={processingState.progress} size={100} />
                            <div className="flex-1">
                                <ProgressBar
                                    progress={processingState.progress}
                                    message={processingState.message}
                                    variant="glow"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Action Buttons */}
                <AnimatePresence>
                    {files.length > 0 && !processingState.isProcessing && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <button
                                onClick={clearFiles}
                                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                <Trash2 className="h-4 w-4" />
                                Clear All
                            </button>

                            <button
                                onClick={handleMerge}
                                disabled={files.length < 2}
                                className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-indigo-500/30 transition-all hover:scale-105 hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {isComplete ? (
                                    <>
                                        <CheckCircle2 className="h-5 w-5" />
                                        Merge Again
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-5 w-5" />
                                        Merge {files.length} PDFs
                                    </>
                                )}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Instructions */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-12 rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900"
                >
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        How it works
                    </h2>
                    <div className="mt-6 grid gap-6 sm:grid-cols-3">
                        {[
                            { step: 1, title: "Upload", desc: "Drop your PDF files or click to browse" },
                            { step: 2, title: "Arrange", desc: "Drag to reorder files as needed" },
                            { step: 3, title: "Merge", desc: "Click merge and download instantly" },
                        ].map((item) => (
                            <div key={item.step} className="flex gap-4">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 font-bold text-white">
                                    {item.step}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">{item.title}</p>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
