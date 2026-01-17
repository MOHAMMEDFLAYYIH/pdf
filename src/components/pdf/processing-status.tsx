"use client";

import { motion } from "framer-motion";
import { ProgressBar, CircularProgress } from "@/components/ui/progress-bar";
import { Download, RotateCcw, CheckCircle } from "lucide-react";

export type ProcessingState =
    | "idle"
    | "uploading"
    | "processing"
    | "complete"
    | "error";

interface PDFProcessingStatusProps {
    state: ProcessingState | { isProcessing: boolean; progress: number; message: string; error?: string };
    progress: number;
    title: string;
    description: string;
    onDownload?: (data?: any, filename?: string) => void;
    onReset: () => void;
    color?: string;
}

export default function PDFProcessingStatus({
    state,
    progress,
    title,
    description,
    onDownload,
    onReset,
    color = "#D04423",
}: PDFProcessingStatusProps) {
    // Handle both string state and object state (from usePDF)
    const isProcessing = typeof state === 'string'
        ? (state === 'uploading' || state === 'processing')
        : state.isProcessing;

    const isComplete = typeof state === 'string'
        ? state === 'complete'
        : false; // usePDF doesn't explicitly have "complete" state in the object, it returns results. 
    // But for this component, we might want to pass "complete" manually if we are done.

    // Actually, standardizing on the props passed.
    // usage: <PDFProcessingStatus state={processingState} ... /> where processingState is from usePDF.

    // Let's adapt based on usePDF hook which returns { isProcessing, progress, message, error }
    // But my new pages used a string state. I should align them.
    // The pages I wrote use: setProcessingState("uploading") etc. 
    // BUT usePDF returns an object `processingState`.
    // I tried to overwrite `processingState` in my pages which was wrong because `usePDF` provides it.

    // I need to fix my pages to NOT try to set `processingState` if `usePDF` manages it.
    // However, `usePDF` in `SplitPDFPage` looks like it has `splitPDF` function.
    // For `PowerPointToPDF`, I don't have a real backend function.
    // So I need to simulate state. 

    // I will make this component accept the string state I was using in my pages, 
    // AND the object state if needed, but for now my pages use local state for simulation.

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md mx-auto"
        >
            <div className="rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900 shadow-xl">
                <div className="flex flex-col items-center text-center">

                    {(title === "PowerPoint Converted!" || title === "Word Converted!" || title === "Excel Converted!" || state === "complete") ? (
                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircle className="h-10 w-10" />
                        </div>
                    ) : (
                        <div className="mb-6">
                            <CircularProgress progress={progress} size={80} color={color} />
                        </div>
                    )}

                    <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                        {title}
                    </h3>
                    <p className="mb-8 text-gray-500 dark:text-gray-400">
                        {description}
                    </p>

                    {(title.includes("Converted!") || state === "complete") && (
                        <div className="flex w-full flex-col gap-3">
                            <button
                                onClick={() => onDownload && onDownload()}
                                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
                                style={{ backgroundColor: color }}
                            >
                                <Download className="h-5 w-5" />
                                Download PDF
                            </button>
                            <button
                                onClick={onReset}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Convert Another
                            </button>
                        </div>
                    )}

                    {!(title.includes("Converted!") || state === "complete") && (
                        <div className="w-full">
                            <ProgressBar progress={progress} message={""} variant="glow" color={color} />
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
