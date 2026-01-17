"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { FileSpreadsheet, ArrowLeft, Shield, Trash2, X, Sparkles, Plus, FileText } from "lucide-react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { PDFDocument } from "pdf-lib";

import { ProgressBar, CircularProgress } from "@/components/ui/progress-bar";

interface ExcelFile {
    id: string;
    file: File;
    name: string;
    size: number;
}

export default function ExcelToPDFPage() {
    const [files, setFiles] = useState<ExcelFile[]>([]);
    const [processingState, setProcessingState] = useState({
        isProcessing: false,
        progress: 0,
        message: "",
        error: null as string | null,
    });

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles = acceptedFiles.map((file) => ({
            id: `${Date.now()}-${Math.random()}`,
            file,
            name: file.name,
            size: file.size,
        }));
        setFiles((prev) => [...prev, ...newFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/vnd.ms-excel": [".xls"],
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
            "text/csv": [".csv"],
        },
        disabled: processingState.isProcessing,
    });

    const handleConvert = async () => {
        if (files.length === 0) {
            toast.error("Please add Excel files");
            return;
        }

        setProcessingState({ isProcessing: true, progress: 0, message: "Processing...", error: null });

        try {
            const file = files[0];

            // Read CSV/Excel content
            const text = await file.file.text();
            const rows = text.split("\n").map(row => row.split(","));

            setProcessingState(prev => ({ ...prev, progress: 40, message: "Creating PDF..." }));

            const pdfDoc = await PDFDocument.create();
            const font = await pdfDoc.embedFont("Helvetica");

            let page = pdfDoc.addPage([612, 792]); // Letter size
            let y = 750;
            const lineHeight = 20;
            const margin = 50;

            for (const row of rows) {
                if (y < 50) {
                    page = pdfDoc.addPage([612, 792]);
                    y = 750;
                }

                const text = row.join("  |  ");
                page.drawText(text.substring(0, 80), {
                    x: margin,
                    y,
                    size: 10,
                    font,
                });
                y -= lineHeight;
            }

            setProcessingState(prev => ({ ...prev, progress: 80, message: "Saving PDF..." }));

            const pdfBytes = await pdfDoc.save();

            const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = file.name.replace(/\.(xlsx?|csv)$/i, ".pdf");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setProcessingState({ isProcessing: false, progress: 100, message: "Complete!", error: null });
            toast.success("Converted to PDF!");
        } catch (error) {
            setProcessingState({ isProcessing: false, progress: 0, message: "", error: "Conversion failed" });
            toast.error("Failed to convert. Try using a CSV file for best results.");
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
            <div className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                        <ArrowLeft className="h-4 w-4" />Back to Home
                    </Link>
                    <div className="mt-6 flex items-center gap-5">
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-600 to-emerald-700 shadow-2xl shadow-green-500/30">
                            <FileSpreadsheet className="h-8 w-8 text-white" />
                        </motion.div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Excel to PDF</h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">Convert spreadsheets to PDF</p>
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

                <div {...getRootProps()} className={`cursor-pointer rounded-3xl border-2 border-dashed p-12 text-center transition-all ${isDragActive ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-green-400 dark:border-gray-700"}`}>
                    <input {...getInputProps()} />
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600">
                        <Plus className="h-10 w-10 text-white" />
                    </div>
                    <p className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">
                        {isDragActive ? "Drop files here" : "Drag & drop Excel/CSV files"}
                    </p>
                    <p className="mt-2 text-sm text-gray-500">or click to browse • XLS, XLSX, CSV</p>
                </div>

                {files.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-3">
                        {files.map((file) => (
                            <div key={file.id} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                                    <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
                                </div>
                                <button onClick={() => setFiles(prev => prev.filter(f => f.id !== file.id))} className="text-gray-400 hover:text-red-500">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </motion.div>
                )}

                {processingState.isProcessing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 rounded-3xl border border-green-200 bg-green-50 p-8">
                        <div className="flex items-center gap-6">
                            <CircularProgress progress={processingState.progress} size={100} />
                            <div className="flex-1"><ProgressBar progress={processingState.progress} message={processingState.message} variant="glow" /></div>
                        </div>
                    </motion.div>
                )}

                {files.length > 0 && !processingState.isProcessing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 flex justify-between">
                        <button onClick={() => setFiles([])} className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700">
                            <Trash2 className="mr-2 inline h-4 w-4" />Clear
                        </button>
                        <button onClick={handleConvert} className="rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-4 font-semibold text-white shadow-2xl hover:scale-105">
                            <Sparkles className="mr-2 inline h-5 w-5" />Convert to PDF
                        </button>
                    </motion.div>
                )}

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-12 rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">How it works</h2>
                    <div className="mt-6 grid gap-6 sm:grid-cols-3">
                        {[{ step: 1, title: "Upload", desc: "Select Excel or CSV" }, { step: 2, title: "Convert", desc: "We create the PDF" }, { step: 3, title: "Download", desc: "Get your PDF" }].map((item) => (
                            <div key={item.step} className="flex gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 font-bold text-white">{item.step}</div>
                                <div><p className="font-semibold text-gray-900 dark:text-white">{item.title}</p><p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{item.desc}</p></div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
