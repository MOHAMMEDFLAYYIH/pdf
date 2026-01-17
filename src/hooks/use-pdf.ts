"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { PDFDocument } from "pdf-lib";

export interface PDFFileInfo {
    id: string;
    file: File;
    name: string;
    size: number;
    pageCount: number;
    thumbnail?: string;
}

export interface ProcessingState {
    isProcessing: boolean;
    progress: number;
    message: string;
    error: string | null;
}

interface UsePDFReturn {
    // File management
    files: PDFFileInfo[];
    addFiles: (newFiles: File[]) => Promise<void>;
    removeFile: (id: string) => void;
    reorderFiles: (files: PDFFileInfo[]) => void;
    clearFiles: () => void;

    // Processing state
    processingState: ProcessingState;

    // Operations
    mergePDFs: () => Promise<Uint8Array | null>;
    splitPDF: (pageRanges: number[][]) => Promise<Uint8Array[] | null>;
    compressPDF: (quality: number) => Promise<Uint8Array | null>;
    rotatePDF: (degrees: number) => Promise<Uint8Array | null>;

    // Utilities
    downloadResult: (data: Uint8Array, filename: string) => void;
    setProcessingState: React.Dispatch<React.SetStateAction<ProcessingState>>;
    reset: () => void;
}

export function usePDF(): UsePDFReturn {
    const [files, setFiles] = useState<PDFFileInfo[]>([]);
    const [processingState, setProcessingState] = useState<ProcessingState>({
        isProcessing: false,
        progress: 0,
        message: "",
        error: null,
    });

    const workerRef = useRef<Worker | null>(null);

    // Initialize worker
    useEffect(() => {
        if (typeof window !== "undefined") {
            workerRef.current = new Worker(
                new URL("../workers/pdf.worker.ts", import.meta.url)
            );

            workerRef.current.onmessage = (e) => {
                const { type, progress, message, error } = e.data;

                if (type === "PROGRESS") {
                    setProcessingState((prev) => ({
                        ...prev,
                        progress,
                        message,
                    }));
                } else if (type === "ERROR") {
                    setProcessingState({
                        isProcessing: false,
                        progress: 0,
                        message: "",
                        error: error,
                    });
                }
            };

            return () => {
                workerRef.current?.terminate();
            };
        }
    }, []);

    // Generate unique ID
    const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Get page count from PDF
    const getPageCount = async (file: File): Promise<number> => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            return pdf.getPageCount();
        } catch {
            return 0;
        }
    };

    // Add files
    const addFiles = useCallback(async (newFiles: File[]) => {
        const pdfFiles: PDFFileInfo[] = [];

        for (const file of newFiles) {
            if (file.type !== "application/pdf") continue;

            const pageCount = await getPageCount(file);
            pdfFiles.push({
                id: generateId(),
                file,
                name: file.name,
                size: file.size,
                pageCount,
            });
        }

        setFiles((prev) => [...prev, ...pdfFiles]);
    }, []);

    // Remove file
    const removeFile = useCallback((id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
    }, []);

    // Reorder files
    const reorderFiles = useCallback((newOrder: PDFFileInfo[]) => {
        setFiles(newOrder);
    }, []);

    // Clear all files
    const clearFiles = useCallback(() => {
        setFiles([]);
        setProcessingState({
            isProcessing: false,
            progress: 0,
            message: "",
            error: null,
        });
    }, []);

    // Merge PDFs
    const mergePDFs = useCallback(async (): Promise<Uint8Array | null> => {
        if (files.length < 2) {
            setProcessingState((prev) => ({
                ...prev,
                error: "Please add at least 2 PDF files to merge",
            }));
            return null;
        }

        setProcessingState({
            isProcessing: true,
            progress: 0,
            message: "Starting merge...",
            error: null,
        });

        try {
            const mergedPdf = await PDFDocument.create();
            const totalFiles = files.length;

            for (let i = 0; i < files.length; i++) {
                setProcessingState((prev) => ({
                    ...prev,
                    progress: (i / totalFiles) * 90,
                    message: `Processing file ${i + 1} of ${totalFiles}...`,
                }));

                const arrayBuffer = await files[i].file.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            setProcessingState((prev) => ({
                ...prev,
                progress: 95,
                message: "Finalizing PDF...",
            }));

            const mergedBytes = await mergedPdf.save();

            setProcessingState({
                isProcessing: false,
                progress: 100,
                message: "Complete!",
                error: null,
            });

            return mergedBytes;
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to merge PDFs";
            setProcessingState({
                isProcessing: false,
                progress: 0,
                message: "",
                error: message,
            });
            return null;
        }
    }, [files]);

    // Split PDF
    const splitPDF = useCallback(async (pageRanges: number[][]): Promise<Uint8Array[] | null> => {
        if (files.length === 0) {
            setProcessingState((prev) => ({
                ...prev,
                error: "Please add a PDF file to split",
            }));
            return null;
        }

        setProcessingState({
            isProcessing: true,
            progress: 0,
            message: "Starting split...",
            error: null,
        });

        try {
            const arrayBuffer = await files[0].file.arrayBuffer();
            const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const results: Uint8Array[] = [];

            for (let i = 0; i < pageRanges.length; i++) {
                setProcessingState((prev) => ({
                    ...prev,
                    progress: (i / pageRanges.length) * 90,
                    message: `Creating split ${i + 1} of ${pageRanges.length}...`,
                }));

                const newPdf = await PDFDocument.create();
                const range = pageRanges[i];
                const pageIndices = range.map((p) => p - 1).filter((p) => p >= 0 && p < sourcePdf.getPageCount());
                const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
                copiedPages.forEach((page) => newPdf.addPage(page));

                results.push(await newPdf.save());
            }

            setProcessingState({
                isProcessing: false,
                progress: 100,
                message: "Complete!",
                error: null,
            });

            return results;
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to split PDF";
            setProcessingState({
                isProcessing: false,
                progress: 0,
                message: "",
                error: message,
            });
            return null;
        }
    }, [files]);

    // Compress PDF
    const compressPDF = useCallback(async (quality: number): Promise<Uint8Array | null> => {
        if (files.length === 0) {
            setProcessingState((prev) => ({
                ...prev,
                error: "Please add a PDF file to compress",
            }));
            return null;
        }

        setProcessingState({
            isProcessing: true,
            progress: 0,
            message: "Starting compression...",
            error: null,
        });

        try {
            const arrayBuffer = await files[0].file.arrayBuffer();

            setProcessingState((prev) => ({
                ...prev,
                progress: 20,
                message: "Loading PDF...",
            }));

            const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

            setProcessingState((prev) => ({
                ...prev,
                progress: 50,
                message: "Optimizing structure...",
            }));

            // Save with compression options
            const compressedBytes = await pdf.save({
                useObjectStreams: true,
                addDefaultPage: false,
            });

            setProcessingState({
                isProcessing: false,
                progress: 100,
                message: "Complete!",
                error: null,
            });

            return compressedBytes;
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to compress PDF";
            setProcessingState({
                isProcessing: false,
                progress: 0,
                message: "",
                error: message,
            });
            return null;
        }
    }, [files]);

    // Rotate PDF
    const rotatePDF = useCallback(async (degrees: number): Promise<Uint8Array | null> => {
        if (files.length === 0) {
            setProcessingState((prev) => ({
                ...prev,
                error: "Please add a PDF file to rotate",
            }));
            return null;
        }

        setProcessingState({
            isProcessing: true,
            progress: 0,
            message: "Starting rotation...",
            error: null,
        });

        try {
            const arrayBuffer = await files[0].file.arrayBuffer();

            setProcessingState((prev) => ({
                ...prev,
                progress: 30,
                message: "Loading PDF...",
            }));

            const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const pages = pdf.getPages();

            setProcessingState((prev) => ({
                ...prev,
                progress: 50,
                message: "Rotating pages...",
            }));

            // Rotate all pages
            for (const page of pages) {
                const currentRotation = page.getRotation().angle;
                page.setRotation({ type: "degrees", angle: currentRotation + degrees } as any);
            }

            setProcessingState((prev) => ({
                ...prev,
                progress: 80,
                message: "Saving PDF...",
            }));

            const rotatedBytes = await pdf.save();

            setProcessingState({
                isProcessing: false,
                progress: 100,
                message: "Complete!",
                error: null,
            });

            return rotatedBytes;
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to rotate PDF";
            setProcessingState({
                isProcessing: false,
                progress: 0,
                message: "",
                error: message,
            });
            return null;
        }
    }, [files]);

    // Download result
    const downloadResult = useCallback((data: Uint8Array, filename: string) => {
        const blob = new Blob([data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer], {
            type: "application/pdf",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }, []);

    return {
        files,
        addFiles,
        removeFile,
        reorderFiles,
        clearFiles,
        processingState,
        mergePDFs,
        splitPDF,
        compressPDF,
        rotatePDF,
        downloadResult,
        setProcessingState,
        reset: clearFiles,
    };
}
