"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    Layers,
    ArrowLeft,
    Shield,
    Trash2,
    FileText,
    X,
    Sparkles,
    GripVertical,
    RotateCw,
    Eye,
} from "lucide-react";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";
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
    rectSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { FileUploader } from "@/components/pdf/file-uploader";
import { ProgressBar, CircularProgress } from "@/components/ui/progress-bar";
import { usePDF, type ProcessingState } from "@/hooks/use-pdf";

interface PageInfo {
    id: string;
    pageNum: number;
    thumbnail?: string;
    rotation: number;
}

// Sortable Page Item Component
function SortablePage({
    page,
    onRotate,
    onRemove,
}: {
    page: PageInfo;
    onRotate: (id: string) => void;
    onRemove: (id: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: page.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`group relative rounded-2xl border bg-white p-2 transition-all dark:bg-gray-900 ${isDragging
                ? "z-50 border-violet-500 shadow-2xl shadow-violet-500/20 ring-2 ring-violet-500/30"
                : "border-gray-200 hover:border-gray-300 hover:shadow-lg dark:border-gray-800 dark:hover:border-gray-700"
                }`}
        >
            {/* Drag Handle - Full card is draggable */}
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab touch-none"
            >
                {/* Page Preview */}
                <div
                    className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800"
                    style={{ transform: `rotate(${page.rotation}deg)` }}
                >
                    {page.thumbnail ? (
                        <img
                            src={page.thumbnail}
                            alt={`Page ${page.pageNum}`}
                            className="h-full w-full object-contain"
                            draggable={false}
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                    )}
                </div>

                {/* Page Number */}
                <div className="mt-2 text-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Page {page.pageNum}
                    </span>
                </div>
            </div>

            {/* Action Buttons (visible on hover) */}
            <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRotate(page.id);
                    }}
                    className="rounded-lg bg-white/90 p-1.5 text-gray-600 shadow-lg backdrop-blur-sm transition-colors hover:bg-violet-100 hover:text-violet-600 dark:bg-gray-800/90 dark:text-gray-400"
                    title="Rotate 90°"
                >
                    <RotateCw className="h-4 w-4" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(page.id);
                    }}
                    className="rounded-lg bg-white/90 p-1.5 text-gray-600 shadow-lg backdrop-blur-sm transition-colors hover:bg-red-100 hover:text-red-600 dark:bg-gray-800/90 dark:text-gray-400"
                    title="Remove page"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Drag indicator */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
        </motion.div>
    );
}

export default function OrganizePDFPage() {
    const {
        files,
        addFiles,
        clearFiles,
        downloadResult,
    } = usePDF();

    const [pages, setPages] = useState<PageInfo[]>([]);
    const [processingState, setProcessingState] = useState<ProcessingState>({
        isProcessing: false,
        progress: 0,
        message: "",
        error: null,
    });
    const [isGeneratingThumbnails, setIsGeneratingThumbnails] = useState(false);

    const file = files[0];

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Generate thumbnails when file is loaded
    useEffect(() => {
        if (file && pages.length === 0) {
            generateThumbnails();
        }
    }, [file]);

    const generateThumbnails = async () => {
        if (!file) return;

        setIsGeneratingThumbnails(true);
        try {
            const arrayBuffer = await file.file.arrayBuffer();
            const pdfjsLib = await import("pdfjs-dist");
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

            const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const numPages = pdfDoc.numPages;
            const newPages: PageInfo[] = [];

            for (let i = 1; i <= numPages; i++) {
                const page = await pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: 0.3 });

                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                if (!context) continue;

                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({
                    canvasContext: context,
                    viewport: viewport,
                } as any).promise;

                newPages.push({
                    id: `page-${i}`,
                    pageNum: i,
                    thumbnail: canvas.toDataURL("image/jpeg", 0.7),
                    rotation: 0,
                });
            }

            setPages(newPages);
        } catch (error) {
            console.error("Failed to generate thumbnails:", error);
            // Create pages without thumbnails
            const numPages = file.pageCount || 1;
            setPages(
                Array.from({ length: numPages }, (_, i) => ({
                    id: `page-${i + 1}`,
                    pageNum: i + 1,
                    rotation: 0,
                }))
            );
        } finally {
            setIsGeneratingThumbnails(false);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = pages.findIndex((p) => p.id === active.id);
            const newIndex = pages.findIndex((p) => p.id === over.id);
            setPages(arrayMove(pages, oldIndex, newIndex));
        }
    };

    const rotatePage = useCallback((id: string) => {
        setPages((prev) =>
            prev.map((p) =>
                p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p
            )
        );
    }, []);

    const removePage = useCallback((id: string) => {
        setPages((prev) => prev.filter((p) => p.id !== id));
    }, []);

    const handleSave = async () => {
        if (!file || pages.length === 0) {
            toast.error("No pages to save");
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
            const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const newPdf = await PDFDocument.create();

            for (let i = 0; i < pages.length; i++) {
                setProcessingState((prev) => ({
                    ...prev,
                    progress: ((i + 1) / pages.length) * 90,
                    message: `Processing page ${i + 1} of ${pages.length}...`,
                }));

                const page = pages[i];
                const [copiedPage] = await newPdf.copyPages(sourcePdf, [page.pageNum - 1]);

                // Apply rotation
                if (page.rotation !== 0) {
                    const currentRotation = copiedPage.getRotation().angle;
                    copiedPage.setRotation({ type: "degrees", angle: currentRotation + page.rotation } as any);
                }

                newPdf.addPage(copiedPage);
            }

            setProcessingState((prev) => ({
                ...prev,
                progress: 95,
                message: "Finalizing PDF...",
            }));

            const pdfBytes = await newPdf.save();

            downloadResult(pdfBytes, file.name.replace(".pdf", "_organized.pdf"));

            setProcessingState({
                isProcessing: false,
                progress: 100,
                message: "Complete!",
                error: null,
            });

            toast.success("PDF organized successfully!");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to organize PDF";
            setProcessingState({
                isProcessing: false,
                progress: 0,
                message: "",
                error: message,
            });
            toast.error(message);
        }
    };

    const handleClear = () => {
        clearFiles();
        setPages([]);
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
                            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-2xl shadow-violet-500/30"
                        >
                            <Layers className="h-8 w-8 text-white" />
                        </motion.div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Organize PDF
                            </h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">
                                Reorder, rotate, and remove pages
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

                {/* Loading Thumbnails */}
                {isGeneratingThumbnails && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-12"
                    >
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Generating page previews...</p>
                    </motion.div>
                )}

                {/* Page Grid */}
                {file && pages.length > 0 && !isGeneratingThumbnails && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Stats Bar */}
                        <div className="flex items-center justify-between rounded-2xl bg-white p-4 dark:bg-gray-900">
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-bold text-gray-900 dark:text-white">{pages.length}</span>{" "}
                                    pages
                                </span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {formatSize(file.size)}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400">Drag to reorder • Click icons to rotate/remove</p>
                        </div>

                        {/* Sortable Grid */}
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext items={pages.map((p) => p.id)} strategy={rectSortingStrategy}>
                                <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                                    <AnimatePresence>
                                        {pages.map((page) => (
                                            <SortablePage
                                                key={page.id}
                                                page={page}
                                                onRotate={rotatePage}
                                                onRemove={removePage}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </SortableContext>
                        </DndContext>
                    </motion.div>
                )}

                {/* Processing State */}
                {processingState.isProcessing && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-8 rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 p-8 dark:border-violet-900 dark:from-violet-950/50 dark:to-purple-950/50"
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
                    {file && pages.length > 0 && !processingState.isProcessing && !isGeneratingThumbnails && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <button
                                onClick={handleClear}
                                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                <Trash2 className="h-4 w-4" />
                                Clear
                            </button>

                            <button
                                onClick={handleSave}
                                className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-violet-500/30 transition-all hover:scale-105 hover:shadow-violet-500/40"
                            >
                                <Sparkles className="h-5 w-5" />
                                Save Organized PDF
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Instructions */}
                {!file && (
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
                                { step: 2, title: "Organize", desc: "Drag, rotate, remove pages" },
                                { step: 3, title: "Download", desc: "Get your organized PDF" },
                            ].map((item) => (
                                <div key={item.step} className="flex gap-4">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 font-bold text-white">
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
                )}
            </div>
        </div>
    );
}
