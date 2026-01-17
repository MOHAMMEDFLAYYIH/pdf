import { PDFDocument } from "pdf-lib";

export interface PDFFile {
    id: string;
    file: File;
    name: string;
    size: number;
    pageCount?: number;
    thumbnail?: string;
}

/**
 * Merges multiple PDF files into a single PDF document.
 * This operation happens entirely in the browser using pdf-lib.
 * No data is ever sent to any server.
 */
export async function mergePDFs(files: PDFFile[]): Promise<Uint8Array> {
    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();

    // Process each file
    for (const pdfFile of files) {
        try {
            // Read the file as ArrayBuffer
            const arrayBuffer = await pdfFile.file.arrayBuffer();

            // Load the PDF document
            const pdf = await PDFDocument.load(arrayBuffer, {
                ignoreEncryption: true,
            });

            // Copy all pages from the source PDF
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

            // Add each page to the merged document
            copiedPages.forEach((page) => {
                mergedPdf.addPage(page);
            });
        } catch (error) {
            console.error(`Error processing file ${pdfFile.name}:`, error);
            throw new Error(`Failed to process "${pdfFile.name}". The file may be corrupted or password-protected.`);
        }
    }

    // Serialize the merged PDF to bytes
    const mergedPdfBytes = await mergedPdf.save();

    return mergedPdfBytes;
}

/**
 * Gets the page count of a PDF file without loading the entire document.
 */
export async function getPDFPageCount(file: File): Promise<number> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer, {
            ignoreEncryption: true,
        });
        return pdf.getPageCount();
    } catch (error) {
        console.error("Error getting page count:", error);
        return 0;
    }
}

/**
 * Validates if a file is a valid PDF.
 */
export function isValidPDF(file: File): boolean {
    // Check MIME type
    if (file.type !== "application/pdf") {
        return false;
    }

    // Check file extension
    const extension = file.name.toLowerCase().split(".").pop();
    if (extension !== "pdf") {
        return false;
    }

    return true;
}

/**
 * Formats file size for display.
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Generates a unique ID for file tracking.
 */
export function generateFileId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
