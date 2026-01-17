"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { PenTool, ArrowLeft, Shield, Trash2, FileText, X, Sparkles, Type, Eraser } from "lucide-react";
import Link from "next/link";
import { PDFDocument, rgb } from "pdf-lib";

import { FileUploader } from "@/components/pdf/file-uploader";
import { ProgressBar, CircularProgress } from "@/components/ui/progress-bar";
import { usePDF, type ProcessingState } from "@/hooks/use-pdf";

export default function SignPDFPage() {
    const { files, addFiles, clearFiles, downloadResult } = usePDF();

    const [signatureText, setSignatureText] = useState("");
    const [signatureImage, setSignatureImage] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [processingState, setProcessingState] = useState<ProcessingState>({
        isProcessing: false, progress: 0, message: "", error: null,
    });

    const file = files[0];

    const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        setIsDrawing(true);
    }, []);

    const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#000";
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
    }, [isDrawing]);

    const stopDrawing = useCallback(() => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            setSignatureImage(canvas.toDataURL("image/png"));
        }
    }, []);

    const clearCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSignatureImage(null);
    }, []);

    const handleSign = async () => {
        if (!file) {
            toast.error("Please add a PDF file");
            return;
        }

        if (!signatureImage && !signatureText) {
            toast.error("Please draw a signature or enter text");
            return;
        }

        setProcessingState({ isProcessing: true, progress: 0, message: "Loading PDF...", error: null });

        try {
            const arrayBuffer = await file.file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const pages = pdfDoc.getPages();
            const lastPage = pages[pages.length - 1];

            setProcessingState(prev => ({ ...prev, progress: 50, message: "Adding signature..." }));

            if (signatureImage) {
                const pngImage = await pdfDoc.embedPng(signatureImage);
                const { width, height } = lastPage.getSize();
                const imgDims = pngImage.scale(0.3);

                lastPage.drawImage(pngImage, {
                    x: width - imgDims.width - 50,
                    y: 50,
                    width: imgDims.width,
                    height: imgDims.height,
                });
            } else if (signatureText) {
                const font = await pdfDoc.embedFont("Helvetica");
                const { width } = lastPage.getSize();

                lastPage.drawText(signatureText, {
                    x: width - 200,
                    y: 50,
                    size: 24,
                    font,
                    color: rgb(0, 0, 0.5),
                });
            }

            setProcessingState(prev => ({ ...prev, progress: 90, message: "Saving..." }));

            const pdfBytes = await pdfDoc.save();
            downloadResult(pdfBytes, file.name.replace(".pdf", "_signed.pdf"));

            setProcessingState({ isProcessing: false, progress: 100, message: "Complete!", error: null });
            toast.success("PDF signed successfully!");
        } catch (error) {
            setProcessingState({ isProcessing: false, progress: 0, message: "", error: "Failed to sign" });
            toast.error("Failed to sign PDF");
        }
    };

    const formatSize = (bytes: number) => {
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
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl shadow-indigo-500/30">
                            <PenTool className="h-8 w-8 text-white" />
                        </motion.div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sign PDF</h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">Add your signature to PDF documents</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-center gap-2 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-700">100% Private</span>
                    <span className="text-green-600">– Files are processed locally</span>
                </motion.div>

                {!file && <FileUploader onFilesAdded={addFiles} disabled={processingState.isProcessing} maxFiles={1} />}

                {file && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg">
                                <FileText className="h-7 w-7 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-gray-900 dark:text-white">{file.name}</p>
                                <p className="text-sm text-gray-500">{formatSize(file.size)} • {file.pageCount} pages</p>
                            </div>
                            <button onClick={clearFiles} className="text-gray-400 hover:text-red-600"><X className="h-5 w-5" /></button>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Draw Your Signature</h3>
                            <div className="flex items-center gap-2 mb-4">
                                <button onClick={clearCanvas} className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300">
                                    <Eraser className="mr-1 inline h-4 w-4" />Clear
                                </button>
                            </div>
                            <canvas
                                ref={canvasRef}
                                width={400}
                                height={150}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                className="w-full rounded-xl border-2 border-dashed border-gray-300 bg-white cursor-crosshair"
                                style={{ touchAction: "none" }}
                            />
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                            <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                                <Type className="h-4 w-4" /> Or Type Your Name
                            </h3>
                            <input
                                type="text"
                                value={signatureText}
                                onChange={(e) => setSignatureText(e.target.value)}
                                placeholder="Type your name..."
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-xl font-serif italic focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            />
                        </div>
                    </motion.div>
                )}

                {processingState.isProcessing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 rounded-3xl border border-indigo-200 bg-indigo-50 p-8">
                        <div className="flex items-center gap-6">
                            <CircularProgress progress={processingState.progress} size={100} />
                            <div className="flex-1"><ProgressBar progress={processingState.progress} message={processingState.message} variant="glow" /></div>
                        </div>
                    </motion.div>
                )}

                {file && !processingState.isProcessing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 flex justify-between">
                        <button onClick={clearFiles} className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700">
                            <Trash2 className="mr-2 inline h-4 w-4" />Clear
                        </button>
                        <button onClick={handleSign} className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 font-semibold text-white shadow-2xl hover:scale-105">
                            <Sparkles className="mr-2 inline h-5 w-5" />Sign PDF
                        </button>
                    </motion.div>
                )}

                {!file && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-12 rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">How it works</h2>
                        <div className="mt-6 grid gap-6 sm:grid-cols-3">
                            {[{ step: 1, title: "Upload", desc: "Select a PDF file" }, { step: 2, title: "Sign", desc: "Draw or type signature" }, { step: 3, title: "Download", desc: "Get signed PDF" }].map((item) => (
                                <div key={item.step} className="flex gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 font-bold text-white">{item.step}</div>
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
