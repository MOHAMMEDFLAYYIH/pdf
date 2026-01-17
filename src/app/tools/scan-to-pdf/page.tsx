"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Camera, ArrowLeft, Shield, Trash2, X, Sparkles, SwitchCamera, Download } from "lucide-react";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";

import { ProgressBar, CircularProgress } from "@/components/ui/progress-bar";

export default function ScanToPDFPage() {
    const [images, setImages] = useState<string[]>([]);
    const [processingState, setProcessingState] = useState({
        isProcessing: false, progress: 0, message: "", error: null as string | null,
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCapture = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setImages(prev => [...prev, event.target!.result as string]);
                }
            };
            reader.readAsDataURL(file);
        });
    }, []);

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleCreatePDF = async () => {
        if (images.length === 0) {
            toast.error("Please capture or upload images first");
            return;
        }

        setProcessingState({ isProcessing: true, progress: 0, message: "Creating PDF...", error: null });

        try {
            const pdfDoc = await PDFDocument.create();

            for (let i = 0; i < images.length; i++) {
                setProcessingState(prev => ({
                    ...prev,
                    progress: ((i + 1) / images.length) * 80,
                    message: `Processing image ${i + 1} of ${images.length}...`,
                }));

                const imageData = images[i];
                const base64 = imageData.split(",")[1];
                const isJpeg = imageData.includes("image/jpeg");
                const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

                let pdfImage;
                if (isJpeg) {
                    pdfImage = await pdfDoc.embedJpg(bytes);
                } else {
                    pdfImage = await pdfDoc.embedPng(bytes);
                }

                const page = pdfDoc.addPage([pdfImage.width, pdfImage.height]);
                page.drawImage(pdfImage, { x: 0, y: 0, width: pdfImage.width, height: pdfImage.height });
            }

            setProcessingState(prev => ({ ...prev, progress: 90, message: "Saving PDF..." }));

            const pdfBytes = await pdfDoc.save();

            const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `scan_${new Date().toISOString().slice(0, 10)}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setProcessingState({ isProcessing: false, progress: 100, message: "Complete!", error: null });
            toast.success("PDF created from scans!");
        } catch (error) {
            setProcessingState({ isProcessing: false, progress: 0, message: "", error: "Failed" });
            toast.error("Failed to create PDF");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            <div className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                        <ArrowLeft className="h-4 w-4" />Back to Home
                    </Link>
                    <div className="mt-6 flex items-center gap-5">
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-2xl shadow-rose-500/30">
                            <Camera className="h-8 w-8 text-white" />
                        </motion.div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Scan to PDF</h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">Create PDF from camera or images</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-center gap-2 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-700">100% Private</span>
                    <span className="text-green-600">– Images are processed locally</span>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-gray-300 bg-white p-8 transition-all hover:border-rose-400 hover:bg-rose-50 dark:border-gray-700 dark:bg-gray-900"
                        >
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600">
                                <Camera className="h-8 w-8 text-white" />
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">Take Photo or Upload</span>
                            <span className="text-sm text-gray-500">Click to capture or select images</span>
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            multiple
                            onChange={handleCapture}
                            className="hidden"
                        />

                        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
                            <div className="text-4xl font-bold text-rose-600">{images.length}</div>
                            <span className="font-semibold text-gray-900 dark:text-white">Images Captured</span>
                            <span className="text-sm text-gray-500">Ready to convert to PDF</span>
                        </div>
                    </div>

                    {images.length > 0 && (
                        <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4">
                            {images.map((img, idx) => (
                                <div key={idx} className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                                    <img src={img} alt={`Scan ${idx + 1}`} className="aspect-[3/4] w-full object-cover" />
                                    <button
                                        onClick={() => removeImage(idx)}
                                        className="absolute right-2 top-2 rounded-lg bg-red-500 p-1.5 text-white opacity-0 transition group-hover:opacity-100"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-center text-sm text-white">
                                        Page {idx + 1}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {processingState.isProcessing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-8">
                        <div className="flex items-center gap-6">
                            <CircularProgress progress={processingState.progress} size={100} />
                            <div className="flex-1"><ProgressBar progress={processingState.progress} message={processingState.message} variant="glow" /></div>
                        </div>
                    </motion.div>
                )}

                {images.length > 0 && !processingState.isProcessing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 flex justify-between">
                        <button onClick={() => setImages([])} className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700">
                            <Trash2 className="mr-2 inline h-4 w-4" />Clear All
                        </button>
                        <button onClick={handleCreatePDF} className="rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 px-8 py-4 font-semibold text-white shadow-2xl hover:scale-105">
                            <Sparkles className="mr-2 inline h-5 w-5" />Create PDF
                        </button>
                    </motion.div>
                )}

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-12 rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">How it works</h2>
                    <div className="mt-6 grid gap-6 sm:grid-cols-3">
                        {[{ step: 1, title: "Capture", desc: "Take photos or upload" }, { step: 2, title: "Arrange", desc: "Review your scans" }, { step: 3, title: "Download", desc: "Get your PDF" }].map((item) => (
                            <div key={item.step} className="flex gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 font-bold text-white">{item.step}</div>
                                <div><p className="font-semibold text-gray-900 dark:text-white">{item.title}</p><p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{item.desc}</p></div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
