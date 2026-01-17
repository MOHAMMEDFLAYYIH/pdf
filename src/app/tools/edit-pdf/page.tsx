"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    PenTool,
    ArrowLeft,
    Shield,
    Trash2,
    FileText,
    X,
    Sparkles,
    Type,
    Highlighter,
    Square,
    Circle,
    Minus,
    Download,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

import { FileUploader } from "@/components/pdf/file-uploader";
import { ProgressBar, CircularProgress } from "@/components/ui/progress-bar";
import { usePDF, type ProcessingState } from "@/hooks/use-pdf";

interface TextAnnotation {
    id: string;
    text: string;
    x: number;
    y: number;
    fontSize: number;
    pageNum: number;
}

const tools = [
    { id: "text", icon: Type, label: "Add Text" },
];

export default function EditPDFPage() {
    const {
        files,
        addFiles,
        clearFiles,
        downloadResult,
    } = usePDF();

    const [currentPage, setCurrentPage] = useState(1);
    const [pageImage, setPageImage] = useState<string | null>(null);
    const [selectedTool, setSelectedTool] = useState<string | null>("text");
    const [annotations, setAnnotations] = useState<TextAnnotation[]>([]);
    const [newText, setNewText] = useState("");
    const [fontSize, setFontSize] = useState(16);
    const [isLoadingPage, setIsLoadingPage] = useState(false);
    const [processingState, setProcessingState] = useState<ProcessingState>({
        isProcessing: false,
        progress: 0,
        message: "",
        error: null,
    });

    const canvasRef = useRef<HTMLDivElement>(null);
    const file = files[0];

    // Render current page
    useEffect(() => {
        if (file) {
            renderPage(currentPage);
        }
    }, [file, currentPage]);

    const renderPage = async (pageNum: number) => {
        if (!file) return;
        setIsLoadingPage(true);

        try {
            const arrayBuffer = await file.file.arrayBuffer();
            const pdfjsLib = await import("pdfjs-dist");
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

            const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const page = await pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.5 });

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            if (!context) return;

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({
                canvasContext: context,
                viewport: viewport,
            } as any).promise;

            setPageImage(canvas.toDataURL("image/png"));
        } catch (error) {
            console.error("Failed to render page:", error);
            toast.error("Failed to render page");
        } finally {
            setIsLoadingPage(false);
        }
    };

    const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!selectedTool || selectedTool !== "text" || !newText.trim()) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setAnnotations((prev) => [
            ...prev,
            {
                id: `ann-${Date.now()}`,
                text: newText,
                x,
                y,
                fontSize,
                pageNum: currentPage,
            },
        ]);

        toast.success("Text added! Click Save to apply changes.");
    }, [selectedTool, newText, fontSize, currentPage]);

    const removeAnnotation = useCallback((id: string) => {
        setAnnotations((prev) => prev.filter((a) => a.id !== id));
    }, []);

    const handleSave = async () => {
        if (!file) {
            toast.error("No file to save");
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
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

            setProcessingState((prev) => ({
                ...prev,
                progress: 30,
                message: "Applying annotations...",
            }));

            const pages = pdfDoc.getPages();

            for (const annotation of annotations) {
                const pageIndex = annotation.pageNum - 1;
                if (pageIndex >= 0 && pageIndex < pages.length) {
                    const page = pages[pageIndex];
                    const { height } = page.getSize();

                    // Convert canvas coordinates to PDF coordinates
                    const scale = 1.5; // Same scale used for rendering
                    const pdfX = annotation.x / scale;
                    const pdfY = height - (annotation.y / scale);

                    page.drawText(annotation.text, {
                        x: pdfX,
                        y: pdfY,
                        size: annotation.fontSize,
                        font,
                        color: rgb(0, 0, 0),
                    });
                }
            }

            setProcessingState((prev) => ({
                ...prev,
                progress: 80,
                message: "Saving PDF...",
            }));

            const pdfBytes = await pdfDoc.save();

            downloadResult(pdfBytes, file.name.replace(".pdf", "_edited.pdf"));

            setProcessingState({
                isProcessing: false,
                progress: 100,
                message: "Complete!",
                error: null,
            });

            toast.success("PDF saved with annotations!");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to save PDF";
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

    const currentPageAnnotations = annotations.filter((a) => a.pageNum === currentPage);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
                <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
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
                            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl shadow-indigo-500/30"
                        >
                            <PenTool className="h-8 w-8 text-white" />
                        </motion.div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Edit PDF
                            </h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">
                                Add text annotations to your PDF
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
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

                {/* Editor */}
                {file && (
                    <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
                        {/* Toolbar */}
                        <div className="space-y-4">
                            {/* File Info */}
                            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-rose-600">
                                        <FileText className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-gray-500">{file.pageCount} pages</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            clearFiles();
                                            setAnnotations([]);
                                            setPageImage(null);
                                        }}
                                        className="text-gray-400 hover:text-red-500"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Text Tool */}
                            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                                <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                                    <Type className="h-4 w-4 text-indigo-600" />
                                    Add Text
                                </h3>
                                <input
                                    type="text"
                                    value={newText}
                                    onChange={(e) => setNewText(e.target.value)}
                                    placeholder="Enter text..."
                                    className="mb-3 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
                                />
                                <div className="mb-3">
                                    <label className="text-xs text-gray-500">Font Size: {fontSize}px</label>
                                    <input
                                        type="range"
                                        min="8"
                                        max="72"
                                        value={fontSize}
                                        onChange={(e) => setFontSize(Number(e.target.value))}
                                        className="w-full accent-indigo-500"
                                    />
                                </div>
                                <p className="text-xs text-gray-500">
                                    Click on the page to add text
                                </p>
                            </div>

                            {/* Annotations List */}
                            {annotations.length > 0 && (
                                <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                                    <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
                                        Annotations ({annotations.length})
                                    </h3>
                                    <div className="max-h-40 space-y-2 overflow-y-auto">
                                        {annotations.map((ann) => (
                                            <div
                                                key={ann.id}
                                                className="flex items-center justify-between rounded-lg bg-gray-50 px-2 py-1 text-xs dark:bg-gray-800"
                                            >
                                                <span className="truncate text-gray-700 dark:text-gray-300">
                                                    P{ann.pageNum}: {ann.text}
                                                </span>
                                                <button
                                                    onClick={() => removeAnnotation(ann.id)}
                                                    className="text-gray-400 hover:text-red-500"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Save Button */}
                            <button
                                onClick={handleSave}
                                disabled={processingState.isProcessing}
                                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 disabled:opacity-50"
                            >
                                <Sparkles className="mr-2 inline h-4 w-4" />
                                Save PDF
                            </button>
                        </div>

                        {/* Canvas Area */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                            {/* Page Navigation */}
                            <div className="mb-4 flex items-center justify-center gap-4">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-30 dark:text-gray-400 dark:hover:bg-gray-800"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Page {currentPage} of {file.pageCount}
                                </span>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(file.pageCount, p + 1))}
                                    disabled={currentPage === file.pageCount}
                                    className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-30 dark:text-gray-400 dark:hover:bg-gray-800"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>

                            {/* PDF Canvas */}
                            <div
                                ref={canvasRef}
                                onClick={handleCanvasClick}
                                className="relative mx-auto cursor-crosshair overflow-hidden rounded-xl bg-gray-100 shadow-inner dark:bg-gray-800"
                                style={{ maxWidth: "100%", minHeight: "500px" }}
                            >
                                {isLoadingPage ? (
                                    <div className="flex h-96 items-center justify-center">
                                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
                                    </div>
                                ) : pageImage ? (
                                    <>
                                        <img
                                            src={pageImage}
                                            alt={`Page ${currentPage}`}
                                            className="w-full"
                                            draggable={false}
                                        />
                                        {/* Render annotations */}
                                        {currentPageAnnotations.map((ann) => (
                                            <div
                                                key={ann.id}
                                                className="absolute cursor-move select-none text-black"
                                                style={{
                                                    left: ann.x,
                                                    top: ann.y,
                                                    fontSize: ann.fontSize,
                                                    transform: "translate(-50%, -50%)",
                                                }}
                                            >
                                                {ann.text}
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <div className="flex h-96 items-center justify-center text-gray-400">
                                        Loading page...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Processing State */}
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
            </div>
        </div>
    );
}
