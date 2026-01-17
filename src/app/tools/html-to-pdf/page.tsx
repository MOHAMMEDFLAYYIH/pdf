"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Code, ArrowLeft, Shield, Trash2, X, Sparkles, Globe, FileText } from "lucide-react";
import Link from "next/link";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

import { ProgressBar, CircularProgress } from "@/components/ui/progress-bar";

export default function HTMLToPDFPage() {
    const [htmlContent, setHtmlContent] = useState("");
    const [url, setUrl] = useState("");
    const [processingState, setProcessingState] = useState({
        isProcessing: false, progress: 0, message: "", error: null as string | null,
    });

    const handleConvert = async () => {
        if (!htmlContent && !url) {
            toast.error("Please enter HTML content or a URL");
            return;
        }

        setProcessingState({ isProcessing: true, progress: 0, message: "Creating PDF...", error: null });

        try {
            setProcessingState(prev => ({ ...prev, progress: 30, message: "Processing content..." }));

            const pdfDoc = await PDFDocument.create();
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const page = pdfDoc.addPage([612, 792]);

            // Simple HTML to text conversion
            const text = htmlContent
                .replace(/<[^>]*>/g, " ")
                .replace(/&nbsp;/g, " ")
                .replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/\s+/g, " ")
                .trim();

            const lines = [];
            const words = text.split(" ");
            let currentLine = "";
            const maxWidth = 500;

            for (const word of words) {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                const width = font.widthOfTextAtSize(testLine, 12);
                if (width > maxWidth) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
            }
            if (currentLine) lines.push(currentLine);

            let y = 750;
            for (const line of lines.slice(0, 50)) {
                page.drawText(line, { x: 50, y, size: 12, font, color: rgb(0, 0, 0) });
                y -= 18;
            }

            setProcessingState(prev => ({ ...prev, progress: 80, message: "Saving PDF..." }));

            const pdfBytes = await pdfDoc.save();

            const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
            const urlObj = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = urlObj;
            link.download = "converted.pdf";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(urlObj);

            setProcessingState({ isProcessing: false, progress: 100, message: "Complete!", error: null });
            toast.success("PDF created!");
        } catch (error) {
            setProcessingState({ isProcessing: false, progress: 0, message: "", error: "Failed" });
            toast.error("Failed to convert");
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
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-2xl shadow-sky-500/30">
                            <Code className="h-8 w-8 text-white" />
                        </motion.div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">HTML to PDF</h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">Convert HTML content to PDF</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-center gap-2 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-700">100% Private</span>
                    <span className="text-green-600">– Content is processed locally</span>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                        <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                            <Code className="h-5 w-5 text-sky-600" /> Paste HTML Content
                        </h3>
                        <textarea
                            value={htmlContent}
                            onChange={(e) => setHtmlContent(e.target.value)}
                            placeholder="<html>
  <body>
    <h1>Hello World</h1>
    <p>Your content here...</p>
  </body>
</html>"
                            className="h-64 w-full rounded-xl border border-gray-200 bg-gray-50 p-4 font-mono text-sm focus:border-sky-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        />
                    </div>

                    <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-900 dark:bg-sky-950/30">
                        <p className="text-sm text-sky-700 dark:text-sky-300">
                            <strong>Note:</strong> This tool converts plain text from HTML to PDF. For full HTML rendering
                            with styles and images, a server-side solution would be required.
                        </p>
                    </div>
                </motion.div>

                {processingState.isProcessing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 rounded-3xl border border-sky-200 bg-sky-50 p-8">
                        <div className="flex items-center gap-6">
                            <CircularProgress progress={processingState.progress} size={100} />
                            <div className="flex-1"><ProgressBar progress={processingState.progress} message={processingState.message} variant="glow" /></div>
                        </div>
                    </motion.div>
                )}

                {!processingState.isProcessing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 flex justify-between">
                        <button onClick={() => setHtmlContent("")} className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700">
                            <Trash2 className="mr-2 inline h-4 w-4" />Clear
                        </button>
                        <button onClick={handleConvert} className="rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 px-8 py-4 font-semibold text-white shadow-2xl hover:scale-105">
                            <Sparkles className="mr-2 inline h-5 w-5" />Convert to PDF
                        </button>
                    </motion.div>
                )}

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-12 rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">How it works</h2>
                    <div className="mt-6 grid gap-6 sm:grid-cols-3">
                        {[{ step: 1, title: "Paste", desc: "Enter HTML content" }, { step: 2, title: "Convert", desc: "We create the PDF" }, { step: 3, title: "Download", desc: "Get your PDF" }].map((item) => (
                            <div key={item.step} className="flex gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 font-bold text-white">{item.step}</div>
                                <div><p className="font-semibold text-gray-900 dark:text-white">{item.title}</p><p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{item.desc}</p></div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
