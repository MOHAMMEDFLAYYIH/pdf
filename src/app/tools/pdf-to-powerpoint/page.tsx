"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    Presentation,
    ArrowLeft,
    Shield,
    Trash2,
    FileText,
    X,
    Sparkles,
    Download,
    Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import JSZip from "jszip";

import { FileUploader } from "@/components/pdf/file-uploader";
import { ProgressBar, CircularProgress } from "@/components/ui/progress-bar";
import { usePDF, type ProcessingState } from "@/hooks/use-pdf";

interface SlideImage {
    pageNum: number;
    dataUrl: string;
}

export default function PDFToPowerPointPage() {
    const { files, addFiles, clearFiles } = usePDF();

    const [slides, setSlides] = useState<SlideImage[]>([]);
    const [processingState, setProcessingState] = useState<ProcessingState>({
        isProcessing: false,
        progress: 0,
        message: "",
        error: null,
    });

    const file = files[0];

    const handleConvert = async () => {
        if (!file) {
            toast.error("Please add a PDF file");
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
            const pdfjsLib = await import("pdfjs-dist");
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

            const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const numPages = pdfDoc.numPages;
            const slideImages: SlideImage[] = [];

            for (let i = 1; i <= numPages; i++) {
                setProcessingState((prev) => ({
                    ...prev,
                    progress: (i / numPages) * 80,
                    message: `Converting page ${i} of ${numPages}...`,
                }));

                const page = await pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: 2 });

                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                if (!context) continue;

                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({ canvasContext: context, viewport } as any).promise;

                slideImages.push({
                    pageNum: i,
                    dataUrl: canvas.toDataURL("image/png"),
                });
            }

            setSlides(slideImages);

            setProcessingState({
                isProcessing: false,
                progress: 100,
                message: "Complete!",
                error: null,
            });

            toast.success(`Converted ${numPages} pages to slides!`);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to convert";
            setProcessingState({ isProcessing: false, progress: 0, message: "", error: message });
            toast.error(message);
        }
    };

    const handleDownloadAll = async () => {
        const zip = new JSZip();

        slides.forEach((slide) => {
            const base64 = slide.dataUrl.split(",")[1];
            zip.file(`slide_${slide.pageNum}.png`, base64, { base64: true });
        });

        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const link = document.createElement("a");
        link.href = url;
        link.download = file?.name.replace(".pdf", "_slides.zip") || "slides.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Slides downloaded as ZIP!");
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
            <div className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                        <ArrowLeft className="h-4 w-4" />Back to Home
                    </Link>
                    <div className="mt-6 flex items-center gap-5">
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-2xl shadow-orange-500/30">
                            <Presentation className="h-8 w-8 text-white" />
                        </motion.div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">PDF to PowerPoint</h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">Convert PDF pages to slide images</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-center gap-2 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-700 dark:text-green-400">100% Private</span>
                    <span className="text-green-600">– Files are processed locally</span>
                </motion.div>

                {!file && <FileUploader onFilesAdded={addFiles} disabled={processingState.isProcessing} maxFiles={1} />}

                {file && slides.length === 0 && !processingState.isProcessing && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg">
                                <FileText className="h-7 w-7 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-semibold text-gray-900 dark:text-white">{file.name}</p>
                                <p className="text-sm text-gray-500">{formatSize(file.size)} • {file.pageCount} pages</p>
                            </div>
                            <button onClick={clearFiles} className="rounded-xl p-2 text-gray-400 hover:text-red-600"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="flex justify-between">
                            <button onClick={clearFiles} className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700"><Trash2 className="mr-2 inline h-4 w-4" />Clear</button>
                            <button onClick={handleConvert} className="rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 px-8 py-4 font-semibold text-white shadow-2xl hover:scale-105">
                                <Sparkles className="mr-2 inline h-5 w-5" />Convert to Slides
                            </button>
                        </div>
                    </motion.div>
                )}

                {slides.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Slides ({slides.length})</h3>
                            <button onClick={handleDownloadAll} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700">
                                <Download className="mr-2 inline h-4 w-4" />Download All (ZIP)
                            </button>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                            {slides.map((slide) => (
                                <div key={slide.pageNum} className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800">
                                    <img src={slide.dataUrl} alt={`Slide ${slide.pageNum}`} className="w-full" />
                                    <div className="p-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">Slide {slide.pageNum}</div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => { clearFiles(); setSlides([]); }} className="w-full rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700">Convert Another PDF</button>
                    </motion.div>
                )}

                {processingState.isProcessing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 p-8 dark:border-orange-900">
                        <div className="flex items-center gap-6">
                            <CircularProgress progress={processingState.progress} size={100} />
                            <div className="flex-1"><ProgressBar progress={processingState.progress} message={processingState.message} variant="glow" /></div>
                        </div>
                    </motion.div>
                )}

                {!file && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-12 rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">How it works</h2>
                        <div className="mt-6 grid gap-6 sm:grid-cols-3">
                            {[{ step: 1, title: "Upload", desc: "Select a PDF file" }, { step: 2, title: "Convert", desc: "Each page becomes a slide" }, { step: 3, title: "Download", desc: "Get slide images" }].map((item) => (
                                <div key={item.step} className="flex gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 font-bold text-white">{item.step}</div>
                                    <div><p className="font-semibold text-gray-900 dark:text-white">{item.title}</p><p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{item.desc}</p></div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
