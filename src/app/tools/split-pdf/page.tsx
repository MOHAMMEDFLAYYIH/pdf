"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    Scissors,
    ArrowLeft,
    Shield,
    Download,
    Trash2,
    FileText,
    Plus,
    X,
    Sparkles,
} from "lucide-react";
import Link from "next/link";

import { FileUploader } from "@/components/pdf/file-uploader";
import { ProgressBar, CircularProgress } from "@/components/ui/progress-bar";
import { usePDF, PDFFileInfo } from "@/hooks/use-pdf";

interface PageRange {
    id: string;
    start: number;
    end: number;
}

export default function SplitPDFPage() {
    const {
        files,
        addFiles,
        clearFiles,
        processingState,
        splitPDF,
        downloadResult,
    } = usePDF();

    const [pageRanges, setPageRanges] = useState<PageRange[]>([
        { id: "1", start: 1, end: 1 },
    ]);
    const [splitMode, setSplitMode] = useState<"ranges" | "each">("ranges");

    const file = files[0];
    const pageCount = file?.pageCount || 0;

    const addPageRange = useCallback(() => {
        const newId = Date.now().toString();
        setPageRanges((prev) => [
            ...prev,
            { id: newId, start: 1, end: pageCount || 1 },
        ]);
    }, [pageCount]);

    const removePageRange = useCallback((id: string) => {
        setPageRanges((prev) => prev.filter((r) => r.id !== id));
    }, []);

    const updatePageRange = useCallback(
        (id: string, field: "start" | "end", value: number) => {
            setPageRanges((prev) =>
                prev.map((r) =>
                    r.id === id
                        ? { ...r, [field]: Math.max(1, Math.min(value, pageCount || 1)) }
                        : r
                )
            );
        },
        [pageCount]
    );

    const handleSplit = async () => {
        if (!file) {
            toast.error("Please add a PDF file to split");
            return;
        }

        let ranges: number[][];

        if (splitMode === "each") {
            // Split each page into separate PDF
            ranges = Array.from({ length: pageCount }, (_, i) => [i + 1]);
        } else {
            // Use custom ranges
            ranges = pageRanges.map((r) => {
                const pages: number[] = [];
                for (let i = r.start; i <= r.end; i++) {
                    pages.push(i);
                }
                return pages;
            });
        }

        const results = await splitPDF(ranges);

        if (results) {
            results.forEach((data, index) => {
                const filename = splitMode === "each"
                    ? `page_${index + 1}.pdf`
                    : `split_${index + 1}.pdf`;
                downloadResult(data, filename);
            });
            toast.success(`Successfully created ${results.length} PDF file(s)!`);
        } else if (processingState.error) {
            toast.error(processingState.error);
        }
    };

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
                            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 shadow-2xl shadow-fuchsia-500/30"
                        >
                            <Scissors className="h-8 w-8 text-white" />
                        </motion.div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Split PDF
                            </h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">
                                Extract pages or split PDF into multiple files
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
                {!file && (
                    <FileUploader
                        onFilesAdded={addFiles}
                        disabled={processingState.isProcessing}
                        maxFiles={1}
                    />
                )}

                {/* Selected File */}
                {file && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* File Info */}
                        <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg">
                                <FileText className="h-7 w-7 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-semibold text-gray-900 dark:text-white">
                                    {file.name}
                                </p>
                                <div className="mt-1 flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                    <span>{formatSize(file.size)}</span>
                                    <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                                    <span className="font-medium text-fuchsia-600 dark:text-fuchsia-400">
                                        {pageCount} pages
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={clearFiles}
                                className="rounded-xl p-2 text-gray-400 transition-all hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Split Mode Selection */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
                                Split Mode
                            </h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <button
                                    onClick={() => setSplitMode("ranges")}
                                    className={`rounded-xl border-2 p-4 text-left transition-all ${splitMode === "ranges"
                                            ? "border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-950/30"
                                            : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                                        }`}
                                >
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        Custom Ranges
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Define specific page ranges to extract
                                    </p>
                                </button>
                                <button
                                    onClick={() => setSplitMode("each")}
                                    className={`rounded-xl border-2 p-4 text-left transition-all ${splitMode === "each"
                                            ? "border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-950/30"
                                            : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                                        }`}
                                >
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        Split Each Page
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Create a separate PDF for each page
                                    </p>
                                </button>
                            </div>
                        </div>

                        {/* Page Ranges (if custom mode) */}
                        {splitMode === "ranges" && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        Page Ranges
                                    </h3>
                                    <button
                                        onClick={addPageRange}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-fuchsia-100 px-3 py-1.5 text-sm font-medium text-fuchsia-700 transition-colors hover:bg-fuchsia-200 dark:bg-fuchsia-900/30 dark:text-fuchsia-300"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Range
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {pageRanges.map((range, index) => (
                                        <div
                                            key={range.id}
                                            className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-800"
                                        >
                                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-fuchsia-100 text-sm font-bold text-fuchsia-700 dark:bg-fuchsia-900/50 dark:text-fuchsia-300">
                                                {index + 1}
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                Pages
                                            </span>
                                            <input
                                                type="number"
                                                min={1}
                                                max={pageCount}
                                                value={range.start}
                                                onChange={(e) =>
                                                    updatePageRange(
                                                        range.id,
                                                        "start",
                                                        parseInt(e.target.value) || 1
                                                    )
                                                }
                                                className="w-20 rounded-lg border border-gray-200 bg-white px-3 py-2 text-center text-sm font-medium focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 dark:border-gray-700 dark:bg-gray-900"
                                            />
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                to
                                            </span>
                                            <input
                                                type="number"
                                                min={1}
                                                max={pageCount}
                                                value={range.end}
                                                onChange={(e) =>
                                                    updatePageRange(
                                                        range.id,
                                                        "end",
                                                        parseInt(e.target.value) || 1
                                                    )
                                                }
                                                className="w-20 rounded-lg border border-gray-200 bg-white px-3 py-2 text-center text-sm font-medium focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 dark:border-gray-700 dark:bg-gray-900"
                                            />
                                            {pageRanges.length > 1 && (
                                                <button
                                                    onClick={() => removePageRange(range.id)}
                                                    className="ml-auto rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Summary */}
                        <div className="rounded-2xl border border-fuchsia-200 bg-fuchsia-50 p-4 dark:border-fuchsia-900 dark:bg-fuchsia-950/30">
                            <p className="text-sm text-fuchsia-700 dark:text-fuchsia-300">
                                {splitMode === "each" ? (
                                    <>
                                        This will create <strong>{pageCount}</strong> separate PDF
                                        files, one for each page.
                                    </>
                                ) : (
                                    <>
                                        This will create <strong>{pageRanges.length}</strong> PDF
                                        file(s) from the selected page ranges.
                                    </>
                                )}
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Processing State */}
                {processingState.isProcessing && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-8 rounded-3xl border border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-pink-50 p-8 dark:border-fuchsia-900 dark:from-fuchsia-950/50 dark:to-pink-950/50"
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
                    {file && !processingState.isProcessing && (
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
                                Clear
                            </button>

                            <button
                                onClick={handleSplit}
                                className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-fuchsia-500/30 transition-all hover:scale-105 hover:shadow-fuchsia-500/40"
                            >
                                <Sparkles className="h-5 w-5" />
                                Split PDF
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
                            { step: 1, title: "Upload", desc: "Select a PDF file to split" },
                            { step: 2, title: "Configure", desc: "Choose split mode and ranges" },
                            { step: 3, title: "Download", desc: "Get your split PDF files" },
                        ].map((item) => (
                            <div key={item.step} className="flex gap-4">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 font-bold text-white">
                                    {item.step}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {item.title}
                                    </p>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
