"use client";

import { motion } from "framer-motion";
import {
    ShieldCheck,
    Lock,
    Eye,
    CloudOff,
    Zap,
    WifiOff
} from "lucide-react";

const features = [
    {
        icon: ShieldCheck,
        title: "100% Client-Side Processing",
        description: "All tools run entirely in your browser using WebAssembly. Your files never leave your device.",
        color: "purple",
    },
    {
        icon: Lock,
        title: "Zero Data Collection",
        description: "We don't track your files, store your documents, or collect any personal information.",
        color: "blue",
    },
    {
        icon: Eye,
        title: "Open Source & Auditable",
        description: "Our code is fully transparent. You can inspect exactly how your data is handled.",
        color: "cyan",
    },
    {
        icon: CloudOff,
        title: "No Server Uploads",
        description: "Unlike other services, we never upload your files to remote servers for processing.",
        color: "pink",
    },
    {
        icon: Zap,
        title: "Lightning Fast",
        description: "Local processing means instant results - no waiting for uploads or downloads.",
        color: "orange",
    },
    {
        icon: WifiOff,
        title: "Works Offline",
        description: "Once loaded, most tools work without an internet connection.",
        color: "green",
    },
];

const colorClasses: Record<string, string> = {
    purple: "neon-icon-purple",
    blue: "neon-icon-blue",
    cyan: "neon-icon-cyan",
    pink: "neon-icon-pink",
    orange: "neon-icon-orange",
    green: "neon-icon-green",
};

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

export function PrivacySection() {
    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bento-bg)' }}>
            <div className="mx-auto max-w-[900px]">
                {/* Badge - Centered */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex justify-center mb-6"
                >
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-sm font-medium">
                        <ShieldCheck className="h-4 w-4" />
                        Privacy First Architecture
                    </span>
                </motion.div>

                {/* Title - Centered */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                        Your Privacy, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Guaranteed</span>
                    </h2>
                    <p className="text-lg text-white/60 max-w-xl mx-auto leading-relaxed">
                        We built PDFPro with a simple but radical principle: <span className="text-white font-medium">your files are none of our business.</span> Everything happens on your device.
                    </p>
                </motion.div>

                {/* Feature Grid - Centered 3x2 */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {features.map((feature) => (
                        <motion.div
                            key={feature.title}
                            variants={itemVariants}
                            className="glass-card p-6 text-center"
                        >
                            {/* Icon - Centered */}
                            <div className={`neon-icon ${colorClasses[feature.color]} h-14 w-14 mb-5 mx-auto`}>
                                <feature.icon className="h-7 w-7 text-white" />
                            </div>

                            {/* Content - Centered */}
                            <h3 className="text-lg font-bold text-white mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-white/50 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* GDPR Badge - Centered */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="flex justify-center mt-12"
                >
                    <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-sm font-medium">
                        <ShieldCheck className="h-4 w-4" />
                        GDPR Compliant • SOC 2 Ready • ISO 27001 Aligned
                    </span>
                </motion.div>
            </div>
        </section>
    );
}
