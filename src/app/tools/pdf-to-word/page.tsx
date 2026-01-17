"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    FileText,
    ArrowLeft,
    Shield,
    Trash2,
    X,
    Sparkles,
    Download,
    Copy,
    CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";

import { FileUploader } from "@/components/pdf/file-uploader";
import { ProgressBar, CircularProgress } from "@/components/ui/progress-bar";
import { usePDF, type ProcessingState } from "@/hooks/use-pdf";

export default function PDFToWordPage() {
    const {
        files,
        addFiles,
        clearFiles,
    } = usePDF();

    const [extractedText, setExtractedText] = useState<string>("");
    const [copied, setCopied] = useState(false);
    const [processingState, setProcessingState] = useState<ProcessingState>({
        isProcessing: false,
        progress: 0,
        message: "",
        error: null,
    });

    const file = files[0];

    const handleExtract = async () => {
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

            setProcessingState((prev) => ({
                ...prev,
                progress: 20,
                message: "Initializing text extraction...",
            }));

            const pdfjsLib = await import("pdfjs-dist");
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

            const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const numPages = pdfDoc.numPages;
            let fullText = "";

            for (let i = 1; i <= numPages; i++) {
                setProcessingState((prev) => ({
                    ...prev,
                    progress: 20 + ((i / numPages) * 70),
                    message: `Extracting page ${i} of ${numPages}...`,
                }));

                const page = await pdfDoc.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                    .map((item: any) => item.str)
                    .join(" ");

                fullText += `--- Page ${i} ---\n\n${pageText}\n\n`;
            }

            setExtractedText(fullText);

            setProcessingState({
                isProcessing: false,
                progress: 100,
                message: "Complete!",
                error: null,
            });

            toast.success("Text extracted successfully!");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to extract text";
            setProcessingState({
                isProcessing: false,
                progress: 0,
                message: "",
                error: message,
            });
            toast.error(message);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(extractedText);
            setCopied(true);
            toast.success("Text copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy text");
        }
    };

    const handleDownloadTxt = () => {
        const blob = new Blob([extractedText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = file?.name.replace(".pdf", ".txt") || "extracted.txt";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Text file downloaded!");
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
                            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-2xl shadow-blue-500/30"
                        >
                            <FileText className="h-8 w-8 text-white" />
                        </motion.div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                PDF to Text
                            </h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">
                                Extract text content from your PDF
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

                {/* File Uploader */}
                {!file && (
                    <FileUploader
                        onFilesAdded={addFiles}
                        disabled={processingState.isProcessing}
                        maxFiles={1}
                    />
                )}

                {/* Selected File */}
                {file && !extractedText && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* File Info */}
                        <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg">
                                <FileText className="h-7 w-7 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-semibold text-gray-900 dark:text-white">
                                    {file.name}
                                </p>
                                <div className="mt-1 flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                    <span>{formatSize(file.size)}</span>
                                    <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                                    <span>{file.pageCount} pages</span>
                                </div>
                            </div>
                            <button
                                onClick={clearFiles}
                                className="rounded-xl p-2 text-gray-400 transition-all hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Info Note */}
                        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                <strong>Note:</strong> This tool extracts text from PDFs. For true Word document
                                conversion (.docx), a server-side solution would be required. The extracted text
                                can be copied or downloaded as a .txt file.
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Extracted Text */}
                {extractedText && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Extracted Text
                            </h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCopy}
                                    className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                                >
                                    {copied ? (
                                        <>
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4" />
                                            Copy
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleDownloadTxt}
                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                                >
                                    <Download className="h-4 w-4" />
                                    Download .txt
                                </button>
                            </div>
                        </div>

                        <textarea
                            value={extractedText}
                            readOnly
                            className="h-96 w-full rounded-2xl border border-gray-200 bg-white p-4 font-mono text-sm text-gray-700 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                        />

                        <button
                            onClick={() => {
                                clearFiles();
                                setExtractedText("");
                            }}
                            className="w-full rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                        >
                            Extract Another PDF
                        </button>
                    </motion.div>
                )}

                {/* Processing State */}
                {processingState.isProcessing && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-8 rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 dark:border-blue-900 dark:from-blue-950/50 dark:to-indigo-950/50"
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
                    {file && !extractedText && !processingState.isProcessing && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <button
                                onClick={clearFiles}
                                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                <Trash2 className="h-4 w-4" />
                                Clear
                            </button>

                            <button
                                onClick={handleExtract}
                                className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-blue-500/40"
                            >
                                <Sparkles className="h-5 w-5" />
                                Extract Text
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
                                { step: 2, title: "Extract", desc: "We extract all text" },
                                { step: 3, title: "Download", desc: "Copy or download .txt" },
                            ].map((item) => (
                                <div key={item.step} className="flex gap-4">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white">
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
