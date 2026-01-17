"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ScanText, ArrowLeft, Shield, Trash2, FileText, X, Sparkles, Languages, Copy, Download } from "lucide-react";
import Link from "next/link";

import { FileUploader } from "@/components/pdf/file-uploader";
import { ProgressBar, CircularProgress } from "@/components/ui/progress-bar";
import { usePDF, type ProcessingState } from "@/hooks/use-pdf";

export default function OCRPDFPage() {
    const { files, addFiles, clearFiles } = usePDF();

    const [extractedText, setExtractedText] = useState("");
    const [processingState, setProcessingState] = useState<ProcessingState>({
        isProcessing: false, progress: 0, message: "", error: null,
    });

    const file = files[0];

    const handleOCR = async () => {
        if (!file) {
            toast.error("Please add a PDF file");
            return;
        }

        setProcessingState({ isProcessing: true, progress: 0, message: "Loading PDF...", error: null });

        try {
            const arrayBuffer = await file.file.arrayBuffer();
            const pdfjsLib = await import("pdfjs-dist");
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

            const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const numPages = pdfDoc.numPages;
            let fullText = "";

            for (let i = 1; i <= numPages; i++) {
                setProcessingState(prev => ({
                    ...prev,
                    progress: (i / numPages) * 90,
                    message: `Processing page ${i} of ${numPages}...`,
                }));

                const page = await pdfDoc.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(" ");
                fullText += `--- Page ${i} ---\n${pageText}\n\n`;
            }

            setExtractedText(fullText || "No text found. This PDF may contain only images. True OCR requires server-side processing with Tesseract.js.");

            setProcessingState({ isProcessing: false, progress: 100, message: "Complete!", error: null });
            toast.success("Text extraction complete!");
        } catch (error) {
            setProcessingState({ isProcessing: false, progress: 0, message: "", error: "Failed" });
            toast.error("Failed to process PDF");
        }
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(extractedText);
        toast.success("Copied to clipboard!");
    };

    const handleDownload = () => {
        const blob = new Blob([extractedText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = file?.name.replace(".pdf", "_ocr.txt") || "ocr_result.txt";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Downloaded!");
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
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-2xl shadow-amber-500/30">
                            <ScanText className="h-8 w-8 text-white" />
                        </motion.div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">OCR PDF</h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">Extract text from scanned PDFs</p>
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

                {file && !extractedText && (
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

                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                            <p className="text-sm text-amber-700 dark:text-amber-300">
                                <strong>Note:</strong> This extracts embedded text from PDFs. For true OCR of scanned images,
                                a server-side solution with Tesseract would be required.
                            </p>
                        </div>
                    </motion.div>
                )}

                {extractedText && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Extracted Text</h3>
                            <div className="flex gap-2">
                                <button onClick={handleCopy} className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300">
                                    <Copy className="mr-1 inline h-4 w-4" />Copy
                                </button>
                                <button onClick={handleDownload} className="rounded-lg bg-amber-600 px-3 py-2 text-sm text-white hover:bg-amber-700">
                                    <Download className="mr-1 inline h-4 w-4" />Download
                                </button>
                            </div>
                        </div>
                        <textarea readOnly value={extractedText} className="h-96 w-full rounded-xl border border-gray-200 bg-white p-4 font-mono text-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300" />
                        <button onClick={() => { clearFiles(); setExtractedText(""); }} className="w-full rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700">
                            Process Another PDF
                        </button>
                    </motion.div>
                )}

                {processingState.isProcessing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-8">
                        <div className="flex items-center gap-6">
                            <CircularProgress progress={processingState.progress} size={100} />
                            <div className="flex-1"><ProgressBar progress={processingState.progress} message={processingState.message} variant="glow" /></div>
                        </div>
                    </motion.div>
                )}

                {file && !extractedText && !processingState.isProcessing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 flex justify-between">
                        <button onClick={clearFiles} className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700">
                            <Trash2 className="mr-2 inline h-4 w-4" />Clear
                        </button>
                        <button onClick={handleOCR} className="rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 px-8 py-4 font-semibold text-white shadow-2xl hover:scale-105">
                            <Sparkles className="mr-2 inline h-5 w-5" />Extract Text
                        </button>
                    </motion.div>
                )}

                {!file && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-12 rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">How it works</h2>
                        <div className="mt-6 grid gap-6 sm:grid-cols-3">
                            {[{ step: 1, title: "Upload", desc: "Select a scanned PDF" }, { step: 2, title: "OCR", desc: "We extract text" }, { step: 3, title: "Download", desc: "Get searchable text" }].map((item) => (
                                <div key={item.step} className="flex gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 font-bold text-white">{item.step}</div>
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
