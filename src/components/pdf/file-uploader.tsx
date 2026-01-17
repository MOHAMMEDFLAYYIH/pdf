"use client";

import { useCallback, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, AlertCircle, Sparkles } from "lucide-react";

interface FileUploaderProps {
    onFilesAdded: (files: File[]) => void;
    accept?: Record<string, string[]>;
    maxFiles?: number;
    disabled?: boolean;
    variant?: "default" | "glow";
}

export function FileUploader({
    onFilesAdded,
    accept = { "application/pdf": [".pdf"] },
    maxFiles = 100,
    disabled = false,
    variant = "glow",
}: FileUploaderProps) {
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback(
        async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
            setError(null);

            if (rejectedFiles.length > 0) {
                const rejection = rejectedFiles[0];
                if (rejection.errors[0]?.code === "file-invalid-type") {
                    setError("Only PDF files are accepted");
                } else if (rejection.errors[0]?.code === "too-many-files") {
                    setError(`Maximum ${maxFiles} files allowed`);
                } else {
                    setError(rejection.errors[0]?.message || "File rejected");
                }
                return;
            }

            const validFiles = acceptedFiles.filter(
                (file) => file.type === "application/pdf"
            );

            if (validFiles.length > 0) {
                onFilesAdded(validFiles);
            }
        },
        [onFilesAdded, maxFiles]
    );

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept,
        maxFiles,
        disabled,
        multiple: true,
    });

    const rootProps = getRootProps();

    return (
        <div className="w-full">
            {/* Glowing Drop Zone */}
            <div
                ref={rootProps.ref}
                tabIndex={rootProps.tabIndex}
                role={rootProps.role}
                onClick={rootProps.onClick}
                onKeyDown={rootProps.onKeyDown}
                onFocus={rootProps.onFocus}
                onBlur={rootProps.onBlur}
                onDragEnter={rootProps.onDragEnter}
                onDragOver={rootProps.onDragOver}
                onDragLeave={rootProps.onDragLeave}
                onDrop={rootProps.onDrop}
                className={`relative cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed p-8 text-center transition-all duration-300 sm:p-12 ${disabled
                        ? "cursor-not-allowed opacity-50"
                        : ""
                    } ${isDragActive && !isDragReject
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                        : isDragReject
                            ? "border-red-500 bg-red-50 dark:bg-red-950/30"
                            : "border-gray-300 bg-white hover:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600"
                    }`}
            >
                <input {...getInputProps()} aria-label="Upload PDF files" />

                {/* Animated Glow Effect */}
                {variant === "glow" && isDragActive && !isDragReject && (
                    <>
                        {/* Pulsing glow background */}
                        <motion.div
                            className="pointer-events-none absolute inset-0 -z-10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20" />
                        </motion.div>

                        {/* Animated border glow */}
                        <motion.div
                            className="pointer-events-none absolute inset-0 rounded-3xl"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{
                                background: "linear-gradient(90deg, #6366f1, #a855f7, #ec4899, #6366f1)",
                                backgroundSize: "300% 100%",
                                animation: "gradient-shift 2s linear infinite",
                                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                                maskComposite: "exclude",
                                WebkitMaskComposite: "xor",
                                padding: "2px",
                            }}
                        />

                        {/* Corner sparkles */}
                        <motion.div
                            className="absolute -right-2 -top-2"
                            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Sparkles className="h-6 w-6 text-indigo-500" />
                        </motion.div>
                        <motion.div
                            className="absolute -bottom-2 -left-2"
                            animate={{ rotate: -360, scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                        >
                            <Sparkles className="h-6 w-6 text-purple-500" />
                        </motion.div>
                    </>
                )}

                <div className="flex flex-col items-center gap-4">
                    {/* Animated Icon */}
                    <motion.div
                        className={`flex h-20 w-20 items-center justify-center rounded-3xl transition-all ${isDragActive && !isDragReject
                                ? "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/30"
                                : isDragReject
                                    ? "bg-gradient-to-br from-red-500 to-rose-600"
                                    : "bg-gray-100 dark:bg-gray-800"
                            }`}
                        animate={{
                            scale: isDragActive ? 1.1 : 1,
                            rotate: isDragActive ? [0, -5, 5, -5, 0] : 0,
                        }}
                        transition={{ duration: 0.5 }}
                    >
                        {isDragReject ? (
                            <AlertCircle className="h-10 w-10 text-white" />
                        ) : isDragActive ? (
                            <FileText className="h-10 w-10 text-white" />
                        ) : (
                            <Upload className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                        )}
                    </motion.div>

                    {/* Text Content */}
                    <div>
                        <motion.p
                            className="text-xl font-semibold text-gray-900 dark:text-white"
                            animate={{ scale: isDragActive ? 1.05 : 1 }}
                        >
                            {isDragActive && !isDragReject
                                ? "Drop your PDFs here"
                                : isDragReject
                                    ? "Only PDF files accepted"
                                    : "Drag & drop PDF files"}
                        </motion.p>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            or{" "}
                            <span className="font-medium text-indigo-600 dark:text-indigo-400">
                                click to browse
                            </span>{" "}
                            your files
                        </p>
                    </div>

                    {/* Feature badges */}
                    <div className="flex flex-wrap justify-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            <FileText className="h-3.5 w-3.5" />
                            PDF files
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            No size limit
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                            100% Private
                        </span>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400"
                    >
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CSS for gradient animation */}
            <style jsx global>{`
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 100% 50%;
          }
        }
      `}</style>
        </div>
    );
}
