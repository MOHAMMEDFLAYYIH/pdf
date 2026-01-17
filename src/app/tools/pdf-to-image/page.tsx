"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    FileImage,
    ArrowLeft,
    Shield,
    Trash2,
    FileText,
    X,
    Download,
    Image as ImageIcon,
    Loader2,
} from "lucide-react";
import Link from "next/link";


import { FileUploader } from "@/components/pdf/file-uploader";
import { ProgressBar, CircularProgress } from "@/components/ui/progress-bar";
import { usePDF, type ProcessingState } from "@/hooks/use-pdf";



interface ImageResult {
    id: string;
    pageNum: number;
    dataUrl: string;
    width: number;
    height: number;
}

const formatOptions = [
    { id: "png", label: "PNG", description: "Best quality, larger size" },
    { id: "jpeg", label: "JPEG", description: "Smaller size, good quality" },
    { id: "webp", label: "WebP", description: "Modern format, best compression" },
];

const scaleOptions = [
    { value: 1, label: "1x (Low)", pixels: "~72 DPI" },
    { value: 2, label: "2x (Medium)", pixels: "~150 DPI" },
    { value: 3, label: "3x (High)", pixels: "~300 DPI" },
];

export default function PDFToImagePage() {
    const { files, addFiles, clearFiles } = usePDF();

    const [format, setFormat] = useState("png");
    const [scale, setScale] = useState(2);
    const [images, setImages] = useState<ImageResult[]>([]);
    const [processingState, setProcessingState] = useState<ProcessingState>({
        isProcessing: false,
        progress: 0,
        message: "",
        error: null,
    });

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const file = files[0];

    const handleConvert = async () => {
        if (!file) {
            toast.error("Please add a PDF file to convert");
            return;
        }

        setImages([]);
        setProcessingState({
            isProcessing: true,
            progress: 0,
            message: "Loading PDF...",
            error: null,
        });

        try {
            const arrayBuffer = await file.file.arrayBuffer();
            const pdfjsLib = await import("pdfjs-dist");
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

            const pdfDocLoaded = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const numPages = pdfDocLoaded.numPages;
            const results: ImageResult[] = [];

            for (let i = 1; i <= numPages; i++) {
                setProcessingState((prev) => ({
                    ...prev,
                    progress: ((i - 1) / numPages) * 90,
                    message: `Rendering page ${i} of ${numPages}...`,
                }));

                const page = await pdfDocLoaded.getPage(i);
                const viewport = page.getViewport({ scale });

                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                if (!context) continue;

                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({
                    canvasContext: context,
                    viewport: viewport,
                    canvas: canvas,
                } as any).promise;

                const mimeType = format === "png" ? "image/png" : format === "jpeg" ? "image/jpeg" : "image/webp";
                const quality = format === "png" ? undefined : 0.92;
                const dataUrl = canvas.toDataURL(mimeType, quality);

                results.push({
                    id: `page-${i}`,
                    pageNum: i,
                    dataUrl,
                    width: viewport.width,
                    height: viewport.height,
                });
            }

            setImages(results);
            setProcessingState({
                isProcessing: false,
                progress: 100,
                message: "Complete!",
                error: null,
            });

            toast.success(`Converted ${numPages} pages to images!`);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to convert PDF";
            setProcessingState({
                isProcessing: false,
                progress: 0,
                message: "",
                error: message,
            });
            toast.error(message);
        }
    };

    const downloadImage = useCallback((image: ImageResult) => {
        const link = document.createElement("a");
        link.href = image.dataUrl;
        link.download = `page_${image.pageNum}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [format]);

    const downloadAll = useCallback(() => {
        images.forEach((img, i) => {
            setTimeout(() => downloadImage(img), i * 200);
        });
        toast.success("Downloading all images...");
    }, [images, downloadImage]);

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
                            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-2xl shadow-violet-500/30"
                        >
                            <FileImage className="h-8 w-8 text-white" />
                        </motion.div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                PDF to Image
                            </h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">
                                Convert PDF pages to JPG, PNG, or WebP
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
                {file && images.length === 0 && (
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

                        {/* Format Selection */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
                                Output Format
                            </h3>
                            <div className="grid gap-4 sm:grid-cols-3">
                                {formatOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setFormat(option.id)}
                                        className={`rounded-xl border-2 p-4 text-left transition-all ${format === option.id
                                            ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30"
                                            : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                                            }`}
                                    >
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {option.label}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            {option.description}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Scale Selection */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
                                Quality / Resolution
                            </h3>
                            <div className="grid gap-4 sm:grid-cols-3">
                                {scaleOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setScale(option.value)}
                                        className={`rounded-xl border-2 p-4 text-left transition-all ${scale === option.value
                                            ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30"
                                            : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                                            }`}
                                    >
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {option.label}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            {option.pixels}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Image Results */}
                {images.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Converted Images ({images.length})
                            </h3>
                            <button
                                onClick={downloadAll}
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:scale-105"
                            >
                                <Download className="h-4 w-4" />
                                Download All
                            </button>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {images.map((img) => (
                                <motion.div
                                    key={img.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
                                >
                                    <div className="aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-800">
                                        <img
                                            src={img.dataUrl}
                                            alt={`Page ${img.pageNum}`}
                                            className="h-full w-full object-contain"
                                        />
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                        <button
                                            onClick={() => downloadImage(img)}
                                            className="rounded-xl bg-white px-4 py-2 font-medium text-gray-900 shadow-lg transition-all hover:scale-105"
                                        >
                                            <Download className="mr-2 inline h-4 w-4" />
                                            Download
                                        </button>
                                    </div>
                                    <div className="p-3 text-center">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Page {img.pageNum}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <button
                            onClick={() => {
                                setImages([]);
                                clearFiles();
                            }}
                            className="w-full rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Convert Another PDF
                        </button>
                    </motion.div>
                )}

                {/* Processing State */}
                {processingState.isProcessing && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-8 rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-8 dark:border-violet-900 dark:from-violet-950/50 dark:to-fuchsia-950/50"
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
                    {file && images.length === 0 && !processingState.isProcessing && (
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
                                onClick={handleConvert}
                                className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-violet-500/30 transition-all hover:scale-105 hover:shadow-violet-500/40"
                            >
                                <ImageIcon className="h-5 w-5" />
                                Convert to Images
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Instructions */}
                {images.length === 0 && (
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
                                { step: 2, title: "Configure", desc: "Choose format and quality" },
                                { step: 3, title: "Download", desc: "Get your images" },
                            ].map((item) => (
                                <div key={item.step} className="flex gap-4">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 font-bold text-white">
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
                )}

                {/* Hidden canvas for rendering */}
                <canvas ref={canvasRef} className="hidden" />
            </div>
        </div >
    );
}
