"use client";

import Link from "next/link";
import { FileText, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-[#0a0a1a] border-t border-white/5 pt-12 text-gray-400">
            <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="neon-icon neon-icon-purple h-8 w-8">
                                <FileText className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">
                                PDFPro
                            </span>
                        </Link>

                        <div className="flex flex-col gap-2 text-sm text-gray-500">
                            <p>Free online PDF tools with complete privacy.</p>
                            <div className="flex gap-4 mt-2">
                                <a href="#" aria-label="Twitter" className="hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
                                <a href="#" aria-label="Github" className="hover:text-white transition-colors"><Github className="h-5 w-5" /></a>
                                <a href="#" aria-label="Linkedin" className="hover:text-white transition-colors"><Linkedin className="h-5 w-5" /></a>
                            </div>
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div>
                        <h3 className="text-sm font-bold uppercase text-purple-400 mb-4">PDFPro</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                            <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                            <li><Link href="/tools" className="hover:text-white transition-colors">Tools</Link></li>
                            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold uppercase text-purple-400 mb-4">Legal</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold uppercase text-purple-400 mb-4">Product</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/api" className="hover:text-white transition-colors">PDF API</Link></li>
                            <li><Link href="/desktop" className="hover:text-white transition-colors">PDF Desktop</Link></li>
                            <li><Link href="/mobile" className="hover:text-white transition-colors">Mobile App</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 border-t border-white/5 pt-8 text-center text-xs text-gray-600">
                    <p>© {new Date().getFullYear()} PDFPro. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
