"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Trash, ArrowLeft, Shield, Trash2, FileText, X, Sparkles } from "lucide-react";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";

import { FileUploader } from "@/components/pdf/file-uploader";
import { ProgressBar, CircularProgress } from "@/components/ui/progress-bar";
import { usePDF, type ProcessingState } from "@/hooks/use-pdf";

export default function RemovePagesPage() {
    const { files, addFiles, clearFiles, downloadResult } = usePDF();

    const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
    const [processingState, setProcessingState] = useState<ProcessingState>({
        isProcessing: false, progress: 0, message: "", error: null,
    });

    const file = files[0];

    useEffect(() => {
        setSelectedPages(new Set());
    }, [file]);

    const togglePage = (pageNum: number) => {
        setSelectedPages(prev => {
            const next = new Set(prev);
            if (next.has(pageNum)) next.delete(pageNum);
            else next.add(pageNum);
            return next;
        });
    };

    const handleRemove = async () => {
        if (!file) {
            toast.error("Please add a PDF file");
            return;
        }

        if (selectedPages.size === 0) {
            toast.error("Please select pages to remove");
            return;
        }

        if (selectedPages.size >= file.pageCount) {
            toast.error("Cannot remove all pages");
            return;
        }

        setProcessingState({ isProcessing: true, progress: 0, message: "Loading PDF...", error: null });

        try {
            const arrayBuffer = await file.file.arrayBuffer();
            const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const newPdf = await PDFDocument.create();

            const pagesToKeep = [];
            for (let i = 0; i < sourcePdf.getPageCount(); i++) {
                if (!selectedPages.has(i + 1)) {
                    pagesToKeep.push(i);
                }
            }

            setProcessingState(prev => ({ ...prev, progress: 50, message: "Removing pages..." }));

            const copiedPages = await newPdf.copyPages(sourcePdf, pagesToKeep);
            copiedPages.forEach(page => newPdf.addPage(page));

            setProcessingState(prev => ({ ...prev, progress: 90, message: "Saving..." }));

            const pdfBytes = await newPdf.save();
            downloadResult(pdfBytes, file.name.replace(".pdf", "_edited.pdf"));

            setProcessingState({ isProcessing: false, progress: 100, message: "Complete!", error: null });
            toast.success(`Removed ${selectedPages.size} pages!`);
        } catch (error) {
            setProcessingState({ isProcessing: false, progress: 0, message: "", error: "Failed" });
            toast.error("Failed to remove pages");
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
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-2xl shadow-red-500/30">
                            <Trash className="h-8 w-8 text-white" />
                        </motion.div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Remove Pages</h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">Delete unwanted pages from PDF</p>
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
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900 dark:text-white">Select Pages to Remove</h3>
                                <span className="text-sm text-red-600">{selectedPages.size} selected</span>
                            </div>
                            <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10">
                                {Array.from({ length: file.pageCount }, (_, i) => i + 1).map(pageNum => (
                                    <button
                                        key={pageNum}
                                        onClick={() => togglePage(pageNum)}
                                        className={`aspect-square rounded-lg border-2 text-sm font-medium transition ${selectedPages.has(pageNum)
                                            ? "border-red-500 bg-red-100 text-red-700 dark:bg-red-900/50"
                                            : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700"
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {selectedPages.size > 0 && (
                            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
                                <p className="text-sm text-red-700 dark:text-red-300">
                                    Pages to remove: {Array.from(selectedPages).sort((a, b) => a - b).join(", ")}
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}

                {processingState.isProcessing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-8">
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
                        <button onClick={handleRemove} disabled={selectedPages.size === 0}
                            className="rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 px-8 py-4 font-semibold text-white shadow-2xl hover:scale-105 disabled:opacity-50">
                            <Sparkles className="mr-2 inline h-5 w-5" />Remove Pages
                        </button>
                    </motion.div>
                )}

                {!file && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-12 rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">How it works</h2>
                        <div className="mt-6 grid gap-6 sm:grid-cols-3">
                            {[{ step: 1, title: "Upload", desc: "Select a PDF" }, { step: 2, title: "Select", desc: "Click pages to remove" }, { step: 3, title: "Download", desc: "Get cleaned PDF" }].map((item) => (
                                <div key={item.step} className="flex gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 font-bold text-white">{item.step}</div>
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
