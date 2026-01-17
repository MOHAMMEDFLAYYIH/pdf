"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { MessageSquare, ArrowLeft, Shield, Trash2, FileText, X, Send, User, Bot } from "lucide-react";
import Link from "next/link";

import { FileUploader } from "@/components/pdf/file-uploader";
import { usePDF, type ProcessingState } from "@/hooks/use-pdf";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

export default function ChatPDFPage() {
    const { files, addFiles, clearFiles } = usePDF();

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [pdfText, setPdfText] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const file = files[0];

    const loadPDFText = async () => {
        if (!file || pdfText) return;

        try {
            const arrayBuffer = await file.file.arrayBuffer();
            const pdfjsLib = await import("pdfjs-dist");
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

            const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let text = "";
            for (let i = 1; i <= pdfDoc.numPages; i++) {
                const page = await pdfDoc.getPage(i);
                const content = await page.getTextContent();
                text += content.items.map((item: any) => item.str).join(" ") + "\n";
            }
            setPdfText(text);
        } catch (error) {
            toast.error("Failed to load PDF text");
        }
    };

    const handleSend = async () => {
        if (!input.trim() || !file) return;

        await loadPDFText();

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        // Simulate AI response based on PDF content
        setTimeout(() => {
            const query = input.toLowerCase();
            let response = "";

            if (query.includes("summary") || query.includes("summarize")) {
                response = `Based on the PDF content, here's a brief summary:\n\n${pdfText.slice(0, 500)}...\n\nThe document contains ${file.pageCount} pages of content.`;
            } else if (query.includes("page") || query.includes("pages")) {
                response = `This PDF has ${file.pageCount} pages. The document appears to contain text content that can be analyzed.`;
            } else {
                // Search for query terms in the PDF
                const foundText = pdfText.toLowerCase().includes(query.split(" ")[0])
                    ? pdfText.slice(0, 300)
                    : null;

                if (foundText) {
                    response = `I found relevant content in the PDF:\n\n"${foundText}..."`;
                } else {
                    response = `I've analyzed the PDF. Here's what I can tell you about it:\n\n- File: ${file.name}\n- Pages: ${file.pageCount}\n- Size: ${(file.size / 1024).toFixed(1)} KB\n\nNote: For advanced AI chat capabilities, integration with an AI API (like OpenAI) would be required.`;
                }
            }

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: response,
            };

            setMessages(prev => [...prev, assistantMessage]);
            setIsLoading(false);
        }, 1000);
    };

    const formatSize = (bytes: number) => {
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    return (
        <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-black">
            <div className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                        <ArrowLeft className="h-4 w-4" />Back to Home
                    </Link>
                    <div className="mt-6 flex items-center gap-5">
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-2xl shadow-purple-500/30">
                            <MessageSquare className="h-8 w-8 text-white" />
                        </motion.div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Chat with PDF</h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">Ask questions about your PDF</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-center gap-2 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-700">100% Private</span>
                    <span className="text-green-600">– Files are processed locally</span>
                </motion.div>

                {!file && <FileUploader onFilesAdded={addFiles} disabled={isLoading} maxFiles={1} />}

                {file && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-1 flex-col">
                        <div className="mb-4 flex items-center gap-4 rounded-xl bg-white p-3 dark:bg-gray-900">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900">
                                <FileText className="h-5 w-5 text-red-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                                <p className="text-xs text-gray-500">{formatSize(file.size)} • {file.pageCount} pages</p>
                            </div>
                            <button onClick={() => { clearFiles(); setMessages([]); setPdfText(""); }} className="text-gray-400 hover:text-red-500">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                            {messages.length === 0 && (
                                <div className="flex h-full items-center justify-center text-center text-gray-500">
                                    <div>
                                        <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                                        <p>Ask a question about your PDF</p>
                                        <p className="mt-2 text-sm">Try: "Summarize this document" or "What is this about?"</p>
                                    </div>
                                </div>
                            )}

                            {messages.map((msg) => (
                                <div key={msg.id} className={`mb-4 flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                                    {msg.role === "assistant" && (
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                                            <Bot className="h-4 w-4 text-purple-600" />
                                        </div>
                                    )}
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === "user" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"}`}>
                                        <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                                    </div>
                                    {msg.role === "user" && (
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                                            <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                                        <Bot className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div className="rounded-2xl bg-gray-100 px-4 py-2 dark:bg-gray-800">
                                        <div className="flex gap-1">
                                            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "0ms" }} />
                                            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "150ms" }} />
                                            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "300ms" }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                placeholder="Ask a question about your PDF..."
                                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 focus:border-purple-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="rounded-xl bg-purple-600 px-6 py-3 text-white transition hover:bg-purple-700 disabled:opacity-50"
                            >
                                <Send className="h-5 w-5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
