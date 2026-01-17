"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Hash, ArrowLeft, Shield, Trash2, FileText, X, Sparkles } from "lucide-react";
import Link from "next/link";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

import { FileUploader } from "@/components/pdf/file-uploader";
import { ProgressBar, CircularProgress } from "@/components/ui/progress-bar";
import { usePDF, type ProcessingState } from "@/hooks/use-pdf";

const positions = [
    { id: "bottom-center", label: "Bottom Center" },
    { id: "bottom-left", label: "Bottom Left" },
    { id: "bottom-right", label: "Bottom Right" },
    { id: "top-center", label: "Top Center" },
    { id: "top-left", label: "Top Left" },
    { id: "top-right", label: "Top Right" },
];

const formats = [
    { id: "number", label: "1, 2, 3..." },
    { id: "page-of", label: "Page 1 of N" },
    { id: "dash", label: "- 1 -" },
];

export default function AddPageNumbersPage() {
    const { files, addFiles, clearFiles, downloadResult } = usePDF();

    const [position, setPosition] = useState("bottom-center");
    const [format, setFormat] = useState("number");
    const [startNumber, setStartNumber] = useState(1);
    const [processingState, setProcessingState] = useState<ProcessingState>({
        isProcessing: false, progress: 0, message: "", error: null,
    });

    const file = files[0];

    const handleAddNumbers = async () => {
        if (!file) {
            toast.error("Please add a PDF file");
            return;
        }

        setProcessingState({ isProcessing: true, progress: 0, message: "Loading PDF...", error: null });

        try {
            const arrayBuffer = await file.file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const pages = pdfDoc.getPages();
            const totalPages = pages.length;

            for (let i = 0; i < pages.length; i++) {
                setProcessingState(prev => ({
                    ...prev,
                    progress: ((i + 1) / pages.length) * 90,
                    message: `Processing page ${i + 1} of ${totalPages}...`,
                }));

                const page = pages[i];
                const { width, height } = page.getSize();
                const pageNum = startNumber + i;

                let text = "";
                switch (format) {
                    case "page-of": text = `Page ${pageNum} of ${totalPages + startNumber - 1}`; break;
                    case "dash": text = `- ${pageNum} -`; break;
                    default: text = String(pageNum);
                }

                const textWidth = font.widthOfTextAtSize(text, 12);
                let x = width / 2 - textWidth / 2;
                let y = 30;

                if (position.includes("left")) x = 40;
                if (position.includes("right")) x = width - textWidth - 40;
                if (position.includes("top")) y = height - 40;

                page.drawText(text, { x, y, size: 12, font, color: rgb(0.3, 0.3, 0.3) });
            }

            setProcessingState(prev => ({ ...prev, progress: 95, message: "Saving..." }));

            const pdfBytes = await pdfDoc.save();
            downloadResult(pdfBytes, file.name.replace(".pdf", "_numbered.pdf"));

            setProcessingState({ isProcessing: false, progress: 100, message: "Complete!", error: null });
            toast.success("Page numbers added!");
        } catch (error) {
            setProcessingState({ isProcessing: false, progress: 0, message: "", error: "Failed" });
            toast.error("Failed to add page numbers");
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
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-2xl shadow-teal-500/30">
                            <Hash className="h-8 w-8 text-white" />
                        </motion.div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add Page Numbers</h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">Number your PDF pages</p>
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
                            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Position</h3>
                            <div className="grid gap-2 sm:grid-cols-3">
                                {positions.map(pos => (
                                    <button key={pos.id} onClick={() => setPosition(pos.id)}
                                        className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition ${position === pos.id ? "border-teal-500 bg-teal-50 text-teal-700" : "border-gray-200 text-gray-600"}`}>
                                        {pos.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Format</h3>
                            <div className="grid gap-2 sm:grid-cols-3">
                                {formats.map(fmt => (
                                    <button key={fmt.id} onClick={() => setFormat(fmt.id)}
                                        className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition ${format === fmt.id ? "border-teal-500 bg-teal-50 text-teal-700" : "border-gray-200 text-gray-600"}`}>
                                        {fmt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Start Number</h3>
                            <input type="number" value={startNumber} onChange={(e) => setStartNumber(Number(e.target.value))} min={1}
                                className="w-32 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center text-lg font-medium focus:border-teal-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
                        </div>
                    </motion.div>
                )}

                {processingState.isProcessing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 rounded-3xl border border-teal-200 bg-teal-50 p-8">
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
                        <button onClick={handleAddNumbers} className="rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 px-8 py-4 font-semibold text-white shadow-2xl hover:scale-105">
                            <Sparkles className="mr-2 inline h-5 w-5" />Add Numbers
                        </button>
                    </motion.div>
                )}

                {!file && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-12 rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">How it works</h2>
                        <div className="mt-6 grid gap-6 sm:grid-cols-3">
                            {[{ step: 1, title: "Upload", desc: "Select a PDF" }, { step: 2, title: "Configure", desc: "Choose style" }, { step: 3, title: "Download", desc: "Get numbered PDF" }].map((item) => (
                                <div key={item.step} className="flex gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 font-bold text-white">{item.step}</div>
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
