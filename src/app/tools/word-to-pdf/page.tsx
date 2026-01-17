"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { FileText, ArrowLeft, Shield, Trash2, X, Sparkles, Plus, FileType } from "lucide-react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

import { ProgressBar, CircularProgress } from "@/components/ui/progress-bar";

interface DocFile {
    id: string;
    file: File;
    name: string;
    size: number;
}

export default function WordToPDFPage() {
    const [files, setFiles] = useState<DocFile[]>([]);
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
            "application/msword": [".doc"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
            "text/plain": [".txt"],
            "text/rtf": [".rtf"],
        },
        disabled: processingState.isProcessing,
    });

    const handleConvert = async () => {
        if (files.length === 0) {
            toast.error("Please add Word documents");
            return;
        }

        setProcessingState({ isProcessing: true, progress: 0, message: "Processing...", error: null });

        try {
            const file = files[0];
            const text = await file.file.text();

            setProcessingState(prev => ({ ...prev, progress: 40, message: "Creating PDF..." }));

            const pdfDoc = await PDFDocument.create();
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

            // Split text into lines and pages
            const lines = text.split("\n");
            const linesPerPage = 40;
            const margin = 50;
            const lineHeight = 16;

            for (let pageNum = 0; pageNum < Math.ceil(lines.length / linesPerPage); pageNum++) {
                const page = pdfDoc.addPage([612, 792]); // Letter size
                const startLine = pageNum * linesPerPage;
                const endLine = Math.min(startLine + linesPerPage, lines.length);
                let y = 750;

                for (let i = startLine; i < endLine; i++) {
                    const line = lines[i].substring(0, 80); // Limit line length
                    page.drawText(line, {
                        x: margin,
                        y,
                        size: 12,
                        font,
                        color: rgb(0, 0, 0),
                    });
                    y -= lineHeight;
                }
            }

            setProcessingState(prev => ({ ...prev, progress: 80, message: "Saving PDF..." }));

            const pdfBytes = await pdfDoc.save();

            const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = file.name.replace(/\.(docx?|txt|rtf)$/i, ".pdf");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setProcessingState({ isProcessing: false, progress: 100, message: "Complete!", error: null });
            toast.success("Converted to PDF!");
        } catch (error) {
            setProcessingState({ isProcessing: false, progress: 0, message: "", error: "Conversion failed" });
            toast.error("Failed to convert. Try using a .txt file for best results.");
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
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl shadow-blue-500/30">
                            <FileType className="h-8 w-8 text-white" />
                        </motion.div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Word to PDF</h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">Convert Word documents to PDF</p>
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

                <div {...getRootProps()} className={`cursor-pointer rounded-3xl border-2 border-dashed p-12 text-center transition-all ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 dark:border-gray-700"}`}>
                    <input {...getInputProps()} />
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600">
                        <Plus className="h-10 w-10 text-white" />
                    </div>
                    <p className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">
                        {isDragActive ? "Drop files here" : "Drag & drop Word documents"}
                    </p>
                    <p className="mt-2 text-sm text-gray-500">or click to browse • DOC, DOCX, TXT, RTF</p>
                </div>

                {files.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-3">
                        {files.map((file) => (
                            <div key={file.id} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                                    <FileText className="h-5 w-5 text-blue-600" />
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

                <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>Note:</strong> This tool extracts text content from documents. For full Word document
                        conversion with formatting, a server-side solution would be required. TXT files work best.
                    </p>
                </div>

                {processingState.isProcessing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 rounded-3xl border border-blue-200 bg-blue-50 p-8">
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
                        <button onClick={handleConvert} className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 font-semibold text-white shadow-2xl hover:scale-105">
                            <Sparkles className="mr-2 inline h-5 w-5" />Convert to PDF
                        </button>
                    </motion.div>
                )}

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-12 rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">How it works</h2>
                    <div className="mt-6 grid gap-6 sm:grid-cols-3">
                        {[{ step: 1, title: "Upload", desc: "Select Word document" }, { step: 2, title: "Convert", desc: "We create the PDF" }, { step: 3, title: "Download", desc: "Get your PDF" }].map((item) => (
                            <div key={item.step} className="flex gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white">{item.step}</div>
                                <div><p className="font-semibold text-gray-900 dark:text-white">{item.title}</p><p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{item.desc}</p></div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
