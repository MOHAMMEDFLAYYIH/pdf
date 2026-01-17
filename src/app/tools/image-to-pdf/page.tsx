"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    ImageIcon,
    ArrowLeft,
    Shield,
    Trash2,
    X,
    Sparkles,
    GripVertical,
    Plus,
    Download,
} from "lucide-react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
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
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { ProgressBar, CircularProgress } from "@/components/ui/progress-bar";

interface ImageFile {
    id: string;
    file: File;
    name: string;
    size: number;
    preview: string;
}

interface ProcessingState {
    isProcessing: boolean;
    progress: number;
    message: string;
    error: string | null;
}

// Sortable Image Item Component
function SortableImageItem({
    image,
    index,
    onRemove,
}: {
    image: ImageFile;
    index: number;
    onRemove: (id: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: image.id });

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
            className={`group flex items-center gap-4 rounded-2xl border bg-white p-3 transition-all dark:bg-gray-900 ${isDragging
                ? "z-50 border-emerald-500 shadow-2xl shadow-emerald-500/20 ring-2 ring-emerald-500/30"
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

            {/* Image Preview */}
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                <img
                    src={image.preview}
                    alt={image.name}
                    className="h-full w-full object-cover"
                />
            </div>

            {/* File Info */}
            <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-900 dark:text-white" title={image.name}>
                    {image.name}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {formatSize(image.size)}
                </p>
            </div>

            {/* Order Badge */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                {index + 1}
            </div>

            {/* Remove Button */}
            <button
                onClick={() => onRemove(image.id)}
                className="rounded-xl p-2 text-gray-400 transition-all hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                aria-label={`Remove ${image.name}`}
            >
                <X className="h-5 w-5" />
            </button>
        </motion.div>
    );
}

export default function ImageToPDFPage() {
    const [images, setImages] = useState<ImageFile[]>([]);
    const [processingState, setProcessingState] = useState<ProcessingState>({
        isProcessing: false,
        progress: 0,
        message: "",
        error: null,
    });

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newImages: ImageFile[] = acceptedFiles.map((file) => ({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file,
            name: file.name,
            size: file.size,
            preview: URL.createObjectURL(file),
        }));
        setImages((prev) => [...prev, ...newImages]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/jpeg": [".jpg", ".jpeg"],
            "image/png": [".png"],
            "image/webp": [".webp"],
            "image/gif": [".gif"],
        },
        disabled: processingState.isProcessing,
    });

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = images.findIndex((img) => img.id === active.id);
            const newIndex = images.findIndex((img) => img.id === over.id);
            setImages(arrayMove(images, oldIndex, newIndex));
        }
    };

    const removeImage = useCallback((id: string) => {
        setImages((prev) => {
            const img = prev.find((i) => i.id === id);
            if (img) URL.revokeObjectURL(img.preview);
            return prev.filter((i) => i.id !== id);
        });
    }, []);

    const clearImages = useCallback(() => {
        images.forEach((img) => URL.revokeObjectURL(img.preview));
        setImages([]);
    }, [images]);

    const handleConvert = async () => {
        if (images.length === 0) {
            toast.error("Please add at least one image");
            return;
        }

        setProcessingState({
            isProcessing: true,
            progress: 0,
            message: "Creating PDF...",
            error: null,
        });

        try {
            const pdfDoc = await PDFDocument.create();

            for (let i = 0; i < images.length; i++) {
                setProcessingState((prev) => ({
                    ...prev,
                    progress: ((i + 1) / images.length) * 90,
                    message: `Processing image ${i + 1} of ${images.length}...`,
                }));

                const img = images[i];
                const arrayBuffer = await img.file.arrayBuffer();
                const uint8Array = new Uint8Array(arrayBuffer);

                let pdfImage;
                if (img.file.type === "image/png") {
                    pdfImage = await pdfDoc.embedPng(uint8Array);
                } else if (img.file.type === "image/jpeg" || img.file.type === "image/jpg") {
                    pdfImage = await pdfDoc.embedJpg(uint8Array);
                } else {
                    // For WebP and GIF, we need to convert to canvas first
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    const imgElement = new Image();

                    await new Promise<void>((resolve, reject) => {
                        imgElement.onload = () => {
                            canvas.width = imgElement.width;
                            canvas.height = imgElement.height;
                            ctx?.drawImage(imgElement, 0, 0);
                            resolve();
                        };
                        imgElement.onerror = reject;
                        imgElement.src = img.preview;
                    });

                    const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.95);
                    const base64 = jpegDataUrl.split(",")[1];
                    const jpegBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
                    pdfImage = await pdfDoc.embedJpg(jpegBytes);
                }

                const page = pdfDoc.addPage([pdfImage.width, pdfImage.height]);
                page.drawImage(pdfImage, {
                    x: 0,
                    y: 0,
                    width: pdfImage.width,
                    height: pdfImage.height,
                });
            }

            setProcessingState((prev) => ({
                ...prev,
                progress: 95,
                message: "Finalizing PDF...",
            }));

            const pdfBytes = await pdfDoc.save();

            // Download
            const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `images_${new Date().toISOString().slice(0, 10)}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setProcessingState({
                isProcessing: false,
                progress: 100,
                message: "Complete!",
                error: null,
            });

            toast.success(`Created PDF with ${images.length} images!`);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to create PDF";
            setProcessingState({
                isProcessing: false,
                progress: 0,
                message: "",
                error: message,
            });
            toast.error(message);
        }
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
                            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl shadow-emerald-500/30"
                        >
                            <ImageIcon className="h-8 w-8 text-white" />
                        </motion.div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Image to PDF
                            </h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">
                                Convert images to a single PDF document
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

                {/* Dropzone */}
                <div
                    {...getRootProps()}
                    className={`cursor-pointer rounded-3xl border-2 border-dashed p-12 text-center transition-all ${isDragActive
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                        : "border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-emerald-600"
                        }`}
                >
                    <input {...getInputProps()} />
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600">
                        <Plus className="h-10 w-10 text-white" />
                    </div>
                    <p className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">
                        {isDragActive ? "Drop images here" : "Drag & drop images here"}
                    </p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        or click to browse • JPG, PNG, WebP, GIF
                    </p>
                </div>

                {/* Image List */}
                {images.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-bold text-gray-900 dark:text-white">{images.length}</span>{" "}
                                {images.length === 1 ? "image" : "images"} • Drag to reorder
                            </p>
                        </div>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={images.map((img) => img.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-3">
                                    <AnimatePresence mode="popLayout">
                                        {images.map((image, index) => (
                                            <SortableImageItem
                                                key={image.id}
                                                image={image}
                                                index={index}
                                                onRemove={removeImage}
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
                        className="mt-8 rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-8 dark:border-emerald-900 dark:from-emerald-950/50 dark:to-teal-950/50"
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
                    {images.length > 0 && !processingState.isProcessing && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <button
                                onClick={clearImages}
                                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                <Trash2 className="h-4 w-4" />
                                Clear All
                            </button>

                            <button
                                onClick={handleConvert}
                                className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-emerald-500/30 transition-all hover:scale-105 hover:shadow-emerald-500/40"
                            >
                                <Sparkles className="h-5 w-5" />
                                Create PDF
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
                            { step: 1, title: "Add Images", desc: "Drop or select your images" },
                            { step: 2, title: "Arrange", desc: "Drag to reorder pages" },
                            { step: 3, title: "Download", desc: "Get your PDF instantly" },
                        ].map((item) => (
                            <div key={item.step} className="flex gap-4">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 font-bold text-white">
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
