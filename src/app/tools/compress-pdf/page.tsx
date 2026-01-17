"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    FileDown,
    ArrowLeft,
    Shield,
    Trash2,
    FileText,
    X,
    Sparkles,
    Gauge,
} from "lucide-react";
import Link from "next/link";

import { FileUploader } from "@/components/pdf/file-uploader";
import { ProgressBar, CircularProgress } from "@/components/ui/progress-bar";
import { usePDF } from "@/hooks/use-pdf";

const compressionLevels = [
    {
        id: "low",
        name: "Low Compression",
        description: "Best quality, smaller reduction",
        quality: 0.9,
        reduction: "~10-20%",
    },
    {
        id: "medium",
        name: "Medium Compression",
        description: "Balanced quality and size",
        quality: 0.7,
        reduction: "~30-50%",
    },
    {
        id: "high",
        name: "High Compression",
        description: "Maximum reduction, lower quality",
        quality: 0.5,
        reduction: "~50-70%",
    },
];

export default function CompressPDFPage() {
    const {
        files,
        addFiles,
        clearFiles,
        processingState,
        compressPDF,
        downloadResult,
    } = usePDF();

    const [compressionLevel, setCompressionLevel] = useState("medium");
    const [originalSize, setOriginalSize] = useState<number>(0);
    const [compressedSize, setCompressedSize] = useState<number | null>(null);

    const file = files[0];

    const handleCompress = async () => {
        if (!file) {
            toast.error("Please add a PDF file to compress");
            return;
        }

        setOriginalSize(file.size);
        setCompressedSize(null);

        const level = compressionLevels.find((l) => l.id === compressionLevel);
        const result = await compressPDF(level?.quality || 0.7);

        if (result) {
            setCompressedSize(result.byteLength);
            const filename = file.name.replace(".pdf", "_compressed.pdf");
            downloadResult(result, filename);

            const reduction = ((file.size - result.byteLength) / file.size) * 100;
            toast.success(`Compressed! Size reduced by ${reduction.toFixed(1)}%`);
        } else if (processingState.error) {
            toast.error(processingState.error);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const reduction = compressedSize
        ? ((originalSize - compressedSize) / originalSize) * 100
        : null;

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
                            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 shadow-2xl shadow-pink-500/30"
                        >
                            <FileDown className="h-8 w-8 text-white" />
                        </motion.div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Compress PDF
                            </h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">
                                Reduce file size while maintaining quality
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
                                    <span className="font-medium text-pink-600 dark:text-pink-400">
                                        {formatSize(file.size)}
                                    </span>
                                    <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                                    <span>{file.pageCount} pages</span>
                                </div>
                            </div>
                            <button
                                onClick={clearFiles}
                                className="rounded-xl p-2 text-gray-400 transition-all hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Compression Level Selection */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                            <div className="mb-4 flex items-center gap-2">
                                <Gauge className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    Compression Level
                                </h3>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-3">
                                {compressionLevels.map((level) => (
                                    <button
                                        key={level.id}
                                        onClick={() => setCompressionLevel(level.id)}
                                        className={`rounded-xl border-2 p-4 text-left transition-all ${compressionLevel === level.id
                                                ? "border-pink-500 bg-pink-50 dark:bg-pink-950/30"
                                                : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                                            }`}
                                    >
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {level.name}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            {level.description}
                                        </p>
                                        <p className="mt-2 text-sm font-medium text-pink-600 dark:text-pink-400">
                                            {level.reduction} reduction
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Results */}
                        {compressedSize !== null && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-2xl border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-950/30"
                            >
                                <h3 className="mb-4 font-semibold text-green-800 dark:text-green-300">
                                    Compression Complete!
                                </h3>
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div>
                                        <p className="text-sm text-green-600 dark:text-green-400">
                                            Original Size
                                        </p>
                                        <p className="text-lg font-bold text-green-800 dark:text-green-200">
                                            {formatSize(originalSize)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-green-600 dark:text-green-400">
                                            Compressed Size
                                        </p>
                                        <p className="text-lg font-bold text-green-800 dark:text-green-200">
                                            {formatSize(compressedSize)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-green-600 dark:text-green-400">
                                            Reduction
                                        </p>
                                        <p className="text-lg font-bold text-green-800 dark:text-green-200">
                                            {reduction?.toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* Processing State */}
                {processingState.isProcessing && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-8 rounded-3xl border border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 p-8 dark:border-pink-900 dark:from-pink-950/50 dark:to-rose-950/50"
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
                                onClick={() => {
                                    clearFiles();
                                    setCompressedSize(null);
                                }}
                                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                <Trash2 className="h-4 w-4" />
                                Clear
                            </button>

                            <button
                                onClick={handleCompress}
                                className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-pink-500/30 transition-all hover:scale-105 hover:shadow-pink-500/40"
                            >
                                <Sparkles className="h-5 w-5" />
                                {compressedSize !== null ? "Compress Again" : "Compress PDF"}
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
                            { step: 1, title: "Upload", desc: "Select a PDF file to compress" },
                            { step: 2, title: "Choose Level", desc: "Select compression quality" },
                            { step: 3, title: "Download", desc: "Get your smaller PDF" },
                        ].map((item) => (
                            <div key={item.step} className="flex gap-4">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 font-bold text-white">
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
