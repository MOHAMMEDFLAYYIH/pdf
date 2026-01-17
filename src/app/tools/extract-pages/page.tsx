"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { FileOutput, ArrowLeft, Shield, Trash2, FileText, X, Sparkles, Plus, Download } from "lucide-react";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";

import { FileUploader } from "@/components/pdf/file-uploader";
import { ProgressBar, CircularProgress } from "@/components/ui/progress-bar";
import { usePDF, type ProcessingState } from "@/hooks/use-pdf";

interface PageRange {
    id: string;
    start: number;
    end: number;
}

export default function ExtractPagesPage() {
    const { files, addFiles, clearFiles, downloadResult } = usePDF();

    const [ranges, setRanges] = useState<PageRange[]>([{ id: "1", start: 1, end: 1 }]);
    const [processingState, setProcessingState] = useState<ProcessingState>({
        isProcessing: false, progress: 0, message: "", error: null,
    });

    const file = files[0];

    const addRange = () => {
        setRanges(prev => [...prev, { id: String(Date.now()), start: 1, end: file?.pageCount || 1 }]);
    };

    const updateRange = (id: string, field: "start" | "end", value: number) => {
        setRanges(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const removeRange = (id: string) => {
        if (ranges.length > 1) setRanges(prev => prev.filter(r => r.id !== id));
    };

    const handleExtract = async () => {
        if (!file) {
            toast.error("Please add a PDF file");
            return;
        }

        setProcessingState({ isProcessing: true, progress: 0, message: "Loading PDF...", error: null });

        try {
            const arrayBuffer = await file.file.arrayBuffer();
            const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const extractedPdfs: { name: string; bytes: Uint8Array }[] = [];

            for (let i = 0; i < ranges.length; i++) {
                const range = ranges[i];
                setProcessingState(prev => ({
                    ...prev,
                    progress: ((i + 1) / ranges.length) * 80,
                    message: `Extracting pages ${range.start}-${range.end}...`,
                }));

                const newPdf = await PDFDocument.create();
                const pageIndices: number[] = [];

                for (let p = range.start - 1; p < range.end && p < sourcePdf.getPageCount(); p++) {
                    pageIndices.push(p);
                }

                const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
                copiedPages.forEach(page => newPdf.addPage(page));

                const pdfBytes = await newPdf.save();
                extractedPdfs.push({
                    name: `${file.name.replace(".pdf", "")}_pages_${range.start}-${range.end}.pdf`,
                    bytes: pdfBytes,
                });
            }

            setProcessingState(prev => ({ ...prev, progress: 90, message: "Creating download..." }));

            if (extractedPdfs.length === 1) {
                downloadResult(extractedPdfs[0].bytes, extractedPdfs[0].name);
            } else {
                const zip = new JSZip();
                extractedPdfs.forEach(pdf => zip.file(pdf.name, pdf.bytes));
                const content = await zip.generateAsync({ type: "blob" });
                const url = URL.createObjectURL(content);
                const link = document.createElement("a");
                link.href = url;
                link.download = file.name.replace(".pdf", "_extracted.zip");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }

            setProcessingState({ isProcessing: false, progress: 100, message: "Complete!", error: null });
            toast.success("Pages extracted!");
        } catch (error) {
            setProcessingState({ isProcessing: false, progress: 0, message: "", error: "Failed" });
            toast.error("Failed to extract pages");
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
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl shadow-blue-500/30">
                            <FileOutput className="h-8 w-8 text-white" />
                        </motion.div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Extract Pages</h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">Extract specific pages from PDF</p>
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
                            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Page Ranges</h3>
                            <div className="space-y-3">
                                {ranges.map((range, idx) => (
                                    <div key={range.id} className="flex items-center gap-3">
                                        <span className="text-sm text-gray-500">From</span>
                                        <input type="number" value={range.start} onChange={(e) => updateRange(range.id, "start", Number(e.target.value))}
                                            min={1} max={file.pageCount}
                                            className="w-20 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-center dark:border-gray-700 dark:bg-gray-800" />
                                        <span className="text-sm text-gray-500">to</span>
                                        <input type="number" value={range.end} onChange={(e) => updateRange(range.id, "end", Number(e.target.value))}
                                            min={1} max={file.pageCount}
                                            className="w-20 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-center dark:border-gray-700 dark:bg-gray-800" />
                                        {ranges.length > 1 && (
                                            <button onClick={() => removeRange(range.id)} className="text-gray-400 hover:text-red-500">
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button onClick={addRange} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200">
                                <Plus className="h-4 w-4" />Add Range
                            </button>
                        </div>
                    </motion.div>
                )}

                {processingState.isProcessing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 rounded-3xl border border-blue-200 bg-blue-50 p-8">
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
                        <button onClick={handleExtract} className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 font-semibold text-white shadow-2xl hover:scale-105">
                            <Sparkles className="mr-2 inline h-5 w-5" />Extract Pages
                        </button>
                    </motion.div>
                )}

                {!file && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-12 rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">How it works</h2>
                        <div className="mt-6 grid gap-6 sm:grid-cols-3">
                            {[{ step: 1, title: "Upload", desc: "Select a PDF" }, { step: 2, title: "Select", desc: "Choose page ranges" }, { step: 3, title: "Download", desc: "Get extracted pages" }].map((item) => (
                                <div key={item.step} className="flex gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white">{item.step}</div>
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
