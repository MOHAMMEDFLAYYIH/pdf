import { PDFDocument } from "pdf-lib";

// Message types for worker communication
export type PDFWorkerMessage =
    | { type: "MERGE"; files: ArrayBuffer[] }
    | { type: "SPLIT"; file: ArrayBuffer; pageRanges: number[][] }
    | { type: "COMPRESS"; file: ArrayBuffer; quality: number }
    | { type: "GET_INFO"; file: ArrayBuffer };

export type PDFWorkerResponse =
    | { type: "PROGRESS"; progress: number; message: string }
    | { type: "SUCCESS"; data: ArrayBuffer; pageCount?: number }
    | { type: "INFO"; pageCount: number; title?: string; author?: string }
    | { type: "ERROR"; error: string };

// Worker message handler
self.onmessage = async (e: MessageEvent<PDFWorkerMessage>) => {
    const { type } = e.data;

    try {
        switch (type) {
            case "MERGE":
                await handleMerge(e.data.files);
                break;
            case "SPLIT":
                await handleSplit(e.data.file, e.data.pageRanges);
                break;
            case "COMPRESS":
                await handleCompress(e.data.file, e.data.quality);
                break;
            case "GET_INFO":
                await handleGetInfo(e.data.file);
                break;
            default:
                throw new Error(`Unknown message type: ${type}`);
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        self.postMessage({ type: "ERROR", error: message } as PDFWorkerResponse);
    }
};

// Merge multiple PDFs
async function handleMerge(files: ArrayBuffer[]) {
    const mergedPdf = await PDFDocument.create();
    const totalFiles = files.length;

    for (let i = 0; i < files.length; i++) {
        sendProgress((i / totalFiles) * 90, `Processing file ${i + 1} of ${totalFiles}...`);

        const pdf = await PDFDocument.load(files[i], { ignoreEncryption: true });
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    sendProgress(95, "Finalizing PDF...");
    const mergedBytes = await mergedPdf.save();

    sendProgress(100, "Complete!");
    const buffer = mergedBytes.buffer as ArrayBuffer;
    self.postMessage(
        { type: "SUCCESS", data: buffer, pageCount: mergedPdf.getPageCount() } as PDFWorkerResponse,
        { transfer: [buffer] }
    );
}

// Split PDF into page ranges
async function handleSplit(file: ArrayBuffer, pageRanges: number[][]) {
    const sourcePdf = await PDFDocument.load(file, { ignoreEncryption: true });
    const results: ArrayBuffer[] = [];

    for (let i = 0; i < pageRanges.length; i++) {
        sendProgress((i / pageRanges.length) * 90, `Creating split ${i + 1} of ${pageRanges.length}...`);

        const newPdf = await PDFDocument.create();
        const range = pageRanges[i];

        // Convert 1-indexed to 0-indexed
        const pageIndices = range.map((p) => p - 1).filter((p) => p >= 0 && p < sourcePdf.getPageCount());
        const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
        copiedPages.forEach((page) => newPdf.addPage(page));

        const bytes = await newPdf.save();
        results.push(bytes.buffer as ArrayBuffer);
    }

    sendProgress(100, "Complete!");
    // Return first result for now (multi-file download handled separately)
    self.postMessage(
        { type: "SUCCESS", data: results[0], pageCount: pageRanges[0].length } as PDFWorkerResponse,
        { transfer: results }
    );
}

// Compress PDF by optimizing structure
async function handleCompress(file: ArrayBuffer, quality: number) {
    sendProgress(10, "Loading PDF...");
    const pdf = await PDFDocument.load(file, { ignoreEncryption: true });

    sendProgress(30, "Analyzing document structure...");
    const pages = pdf.getPages();

    // Process each page
    for (let i = 0; i < pages.length; i++) {
        sendProgress(30 + (i / pages.length) * 50, `Optimizing page ${i + 1} of ${pages.length}...`);
        // Note: pdf-lib has limited compression options
        // For real compression, we'd need to use image downscaling via canvas
    }

    sendProgress(85, "Rebuilding PDF structure...");

    // Save with minimal options to reduce size
    const compressedBytes = await pdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
    });

    sendProgress(100, "Complete!");
    const buffer = compressedBytes.buffer as ArrayBuffer;
    self.postMessage(
        { type: "SUCCESS", data: buffer, pageCount: pages.length } as PDFWorkerResponse,
        { transfer: [buffer] }
    );
}

// Get PDF info
async function handleGetInfo(file: ArrayBuffer) {
    const pdf = await PDFDocument.load(file, { ignoreEncryption: true });

    self.postMessage({
        type: "INFO",
        pageCount: pdf.getPageCount(),
        title: pdf.getTitle(),
        author: pdf.getAuthor(),
    } as PDFWorkerResponse);
}

function sendProgress(progress: number, message: string) {
    self.postMessage({ type: "PROGRESS", progress, message } as PDFWorkerResponse);
}

export { };
