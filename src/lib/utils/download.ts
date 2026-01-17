/**
 * Triggers a file download in the browser.
 * Creates a temporary URL and simulates a click on a download link.
 */
export function downloadFile(data: Uint8Array, filename: string, mimeType: string = "application/pdf"): void {
    // Create a Blob from the data - slice the buffer for TypeScript strict mode compatibility
    const blob = new Blob([data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer], { type: mimeType });

    // Create an object URL for the blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Revoke the URL to free memory
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Generates a filename for merged PDF with timestamp.
 */
export function generateMergedFilename(prefix: string = "merged"): string {
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 10).replace(/-/g, "");
    return `${prefix}_${timestamp}.pdf`;
}
