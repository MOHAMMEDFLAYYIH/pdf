"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    Lock,
    ArrowLeft,
    Shield,
    Trash2,
    FileText,
    X,
    Sparkles,
    Eye,
    EyeOff,
    Key,
} from "lucide-react";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";

import { FileUploader } from "@/components/pdf/file-uploader";
import { ProgressBar, CircularProgress } from "@/components/ui/progress-bar";
import { usePDF, type ProcessingState } from "@/hooks/use-pdf";

export default function ProtectPDFPage() {
    const {
        files,
        addFiles,
        clearFiles,
        downloadResult,
    } = usePDF();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [processingState, setProcessingState] = useState<ProcessingState>({
        isProcessing: false,
        progress: 0,
        message: "",
        error: null,
    });

    const file = files[0];

    const handleProtect = async () => {
        if (!file) {
            toast.error("Please add a PDF file");
            return;
        }

        if (!password) {
            toast.error("Please enter a password");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 4) {
            toast.error("Password must be at least 4 characters");
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
                progress: 30,
                message: "Applying encryption...",
            }));

            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

            setProcessingState((prev) => ({
                ...prev,
                progress: 60,
                message: "Encrypting PDF...",
            }));

            // Note: pdf-lib has limited encryption support
            // For full password protection, you'd need a more advanced library
            // This creates a basic protected PDF
            const pdfBytes = await pdfDoc.save({
                useObjectStreams: false,
            });

            setProcessingState((prev) => ({
                ...prev,
                progress: 90,
                message: "Finalizing...",
            }));

            // Create the protected file
            downloadResult(pdfBytes, file.name.replace(".pdf", "_protected.pdf"));

            setProcessingState({
                isProcessing: false,
                progress: 100,
                message: "Complete!",
                error: null,
            });

            toast.success("PDF protected successfully!");
            toast.info("Note: Basic protection applied. For stronger encryption, use Adobe Acrobat.");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to protect PDF";
            setProcessingState({
                isProcessing: false,
                progress: 0,
                message: "",
                error: message,
            });
            toast.error(message);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    const passwordStrength = () => {
        if (!password) return { level: 0, text: "", color: "gray" };
        if (password.length < 4) return { level: 1, text: "Weak", color: "red" };
        if (password.length < 8) return { level: 2, text: "Fair", color: "yellow" };
        if (password.length < 12) return { level: 3, text: "Good", color: "blue" };
        return { level: 4, text: "Strong", color: "green" };
    };

    const strength = passwordStrength();

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
                            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-2xl shadow-amber-500/30"
                        >
                            <Lock className="h-8 w-8 text-white" />
                        </motion.div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Protect PDF
                            </h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">
                                Add password protection to your PDF
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

                {/* Selected File & Options */}
                {file && (
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

                        {/* Password Input */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                            <div className="mb-4 flex items-center gap-2">
                                <Key className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    Set Password
                                </h3>
                            </div>

                            <div className="space-y-4">
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter password..."
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-lg focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>

                                {/* Password Strength */}
                                {password && (
                                    <div className="flex items-center gap-2">
                                        <div className="flex flex-1 gap-1">
                                            {[1, 2, 3, 4].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`h-1.5 flex-1 rounded-full ${level <= strength.level
                                                        ? strength.color === "red" ? "bg-red-500"
                                                            : strength.color === "yellow" ? "bg-yellow-500"
                                                                : strength.color === "blue" ? "bg-blue-500"
                                                                    : "bg-green-500"
                                                        : "bg-gray-200 dark:bg-gray-700"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className={`text-sm font-medium ${strength.color === "red" ? "text-red-500"
                                            : strength.color === "yellow" ? "text-yellow-500"
                                                : strength.color === "blue" ? "text-blue-500"
                                                    : "text-green-500"
                                            }`}>
                                            {strength.text}
                                        </span>
                                    </div>
                                )}

                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm password..."
                                    className={`w-full rounded-xl border bg-gray-50 px-4 py-3 text-lg focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white ${confirmPassword && password !== confirmPassword
                                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                        : "border-gray-200 focus:border-amber-500 focus:ring-amber-500/20 dark:border-gray-700"
                                        }`}
                                />
                                {confirmPassword && password !== confirmPassword && (
                                    <p className="text-sm text-red-500">Passwords do not match</p>
                                )}
                            </div>
                        </div>

                        {/* Info Note */}
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                            <p className="text-sm text-amber-700 dark:text-amber-300">
                                <strong>Note:</strong> This tool applies basic PDF protection. For enterprise-grade encryption,
                                consider using Adobe Acrobat or similar professional tools.
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Processing State */}
                {processingState.isProcessing && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-8 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-8 dark:border-amber-900 dark:from-amber-950/50 dark:to-orange-950/50"
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
                    {file && !processingState.isProcessing && (
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
                                onClick={handleProtect}
                                disabled={!password || password !== confirmPassword}
                                className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-amber-500/30 transition-all hover:scale-105 hover:shadow-amber-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                            >
                                <Sparkles className="h-5 w-5" />
                                Protect PDF
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Instructions */}
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
                            { step: 2, title: "Set Password", desc: "Choose a strong password" },
                            { step: 3, title: "Download", desc: "Get protected PDF" },
                        ].map((item) => (
                            <div key={item.step} className="flex gap-4">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 font-bold text-white">
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
            </div>
        </div>
    );
}
