"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    Droplet,
    ArrowLeft,
    Shield,
    Trash2,
    FileText,
    X,
    Sparkles,
    Type,
    Move,
    RotateCw,
} from "lucide-react";
import Link from "next/link";
import { PDFDocument, rgb, degrees } from "pdf-lib";

import { FileUploader } from "@/components/pdf/file-uploader";
import { ProgressBar, CircularProgress } from "@/components/ui/progress-bar";
import { usePDF, type ProcessingState } from "@/hooks/use-pdf";

const positionOptions = [
    { id: "center", label: "Center" },
    { id: "top-left", label: "Top Left" },
    { id: "top-right", label: "Top Right" },
    { id: "bottom-left", label: "Bottom Left" },
    { id: "bottom-right", label: "Bottom Right" },
    { id: "diagonal", label: "Diagonal" },
];

export default function WatermarkPDFPage() {
    const {
        files,
        addFiles,
        clearFiles,
        downloadResult,
    } = usePDF();

    const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
    const [position, setPosition] = useState("diagonal");
    const [opacity, setOpacity] = useState(30);
    const [fontSize, setFontSize] = useState(48);
    const [rotation, setRotation] = useState(45);
    const [processingState, setProcessingState] = useState<ProcessingState>({
        isProcessing: false,
        progress: 0,
        message: "",
        error: null,
    });

    const file = files[0];

    const handleWatermark = async () => {
        if (!file) {
            toast.error("Please add a PDF file");
            return;
        }

        if (!watermarkText.trim()) {
            toast.error("Please enter watermark text");
            return;
        }

        setProcessingState({
            isProcessing: true,
            progress: 0,
            message: "Loading PDF...",
            error: null,
        });

        try {
            const arrayBuffer = await file.file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const pages = pdfDoc.getPages();

            setProcessingState((prev) => ({
                ...prev,
                progress: 20,
                message: "Adding watermark...",
            }));

            const font = await pdfDoc.embedFont("Helvetica");
            const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
            const textHeight = fontSize;

            for (let i = 0; i < pages.length; i++) {
                setProcessingState((prev) => ({
                    ...prev,
                    progress: 20 + ((i + 1) / pages.length) * 70,
                    message: `Processing page ${i + 1} of ${pages.length}...`,
                }));

                const page = pages[i];
                const { width, height } = page.getSize();

                let x = width / 2 - textWidth / 2;
                let y = height / 2 - textHeight / 2;
                let angle = 0;

                switch (position) {
                    case "top-left":
                        x = 50;
                        y = height - 50 - textHeight;
                        break;
                    case "top-right":
                        x = width - textWidth - 50;
                        y = height - 50 - textHeight;
                        break;
                    case "bottom-left":
                        x = 50;
                        y = 50;
                        break;
                    case "bottom-right":
                        x = width - textWidth - 50;
                        y = 50;
                        break;
                    case "diagonal":
                        x = width / 2 - textWidth / 2;
                        y = height / 2 - textHeight / 2;
                        angle = rotation;
                        break;
                    case "center":
                    default:
                        x = width / 2 - textWidth / 2;
                        y = height / 2 - textHeight / 2;
                        break;
                }

                page.drawText(watermarkText, {
                    x,
                    y,
                    size: fontSize,
                    font,
                    color: rgb(0.5, 0.5, 0.5),
                    opacity: opacity / 100,
                    rotate: degrees(angle),
                });
            }

            setProcessingState((prev) => ({
                ...prev,
                progress: 95,
                message: "Finalizing PDF...",
            }));

            const pdfBytes = await pdfDoc.save();

            downloadResult(pdfBytes, file.name.replace(".pdf", "_watermarked.pdf"));

            setProcessingState({
                isProcessing: false,
                progress: 100,
                message: "Complete!",
                error: null,
            });

            toast.success("Watermark added successfully!");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to add watermark";
            setProcessingState({
                isProcessing: false,
                progress: 0,
                message: "",
                error: message,
            });
            toast.error(message);
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
                            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-2xl shadow-cyan-500/30"
                        >
                            <Droplet className="h-8 w-8 text-white" />
                        </motion.div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Watermark PDF
                            </h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">
                                Add text watermark to your PDF
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

                {/* Selected File & Options */}
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

                        {/* Watermark Text */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                            <div className="mb-4 flex items-center gap-2">
                                <Type className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    Watermark Text
                                </h3>
                            </div>
                            <input
                                type="text"
                                value={watermarkText}
                                onChange={(e) => setWatermarkText(e.target.value)}
                                placeholder="Enter watermark text..."
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-lg font-medium focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            />
                        </div>

                        {/* Position */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                            <div className="mb-4 flex items-center gap-2">
                                <Move className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    Position
                                </h3>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-3">
                                {positionOptions.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setPosition(opt.id)}
                                        className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${position === opt.id
                                            ? "border-cyan-500 bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-300"
                                            : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400"
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Opacity & Font Size */}
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                                <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
                                    Opacity: {opacity}%
                                </h3>
                                <input
                                    type="range"
                                    min="10"
                                    max="100"
                                    value={opacity}
                                    onChange={(e) => setOpacity(Number(e.target.value))}
                                    className="w-full accent-cyan-500"
                                />
                            </div>
                            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                                <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
                                    Font Size: {fontSize}px
                                </h3>
                                <input
                                    type="range"
                                    min="12"
                                    max="120"
                                    value={fontSize}
                                    onChange={(e) => setFontSize(Number(e.target.value))}
                                    className="w-full accent-cyan-500"
                                />
                            </div>
                        </div>

                        {/* Rotation (for diagonal) */}
                        {position === "diagonal" && (
                            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                                <div className="mb-4 flex items-center gap-2">
                                    <RotateCw className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        Rotation: {rotation}°
                                    </h3>
                                </div>
                                <input
                                    type="range"
                                    min="-90"
                                    max="90"
                                    value={rotation}
                                    onChange={(e) => setRotation(Number(e.target.value))}
                                    className="w-full accent-cyan-500"
                                />
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Processing State */}
                {processingState.isProcessing && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-8 rounded-3xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50 p-8 dark:border-cyan-900 dark:from-cyan-950/50 dark:to-blue-950/50"
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
                                onClick={handleWatermark}
                                className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-cyan-500/30 transition-all hover:scale-105 hover:shadow-cyan-500/40"
                            >
                                <Sparkles className="h-5 w-5" />
                                Add Watermark
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
                            { step: 1, title: "Upload", desc: "Select a PDF file" },
                            { step: 2, title: "Customize", desc: "Set text, position, opacity" },
                            { step: 3, title: "Download", desc: "Get watermarked PDF" },
                        ].map((item) => (
                            <div key={item.step} className="flex gap-4">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 font-bold text-white">
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
