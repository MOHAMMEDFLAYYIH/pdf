"use client";

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AnimatePresence, motion } from "framer-motion";
import { FileItem } from "./file-item";
import { PDFFile, formatFileSize } from "@/lib/pdf/merge";

interface FileListProps {
    files: PDFFile[];
    onFilesChange: (files: PDFFile[]) => void;
    onRemove: (id: string) => void;
}

export function FileList({ files, onFilesChange, onRemove }: FileListProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = files.findIndex((f) => f.id === active.id);
            const newIndex = files.findIndex((f) => f.id === over.id);
            onFilesChange(arrayMove(files, oldIndex, newIndex));
        }
    };

    // Calculate totals
    const totalPages = files.reduce((sum, f) => sum + (f.pageCount || 0), 0);
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);

    if (files.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            {/* Stats Bar */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-900"
            >
                <div className="flex flex-wrap gap-4 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                        <span className="font-semibold text-gray-900 dark:text-white">{files.length}</span>{" "}
                        {files.length === 1 ? "file" : "files"}
                    </span>
                    <span className="text-gray-300 dark:text-gray-700">|</span>
                    <span className="text-gray-600 dark:text-gray-400">
                        <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span>{" "}
                        {totalPages === 1 ? "page" : "pages"} total
                    </span>
                    <span className="text-gray-300 dark:text-gray-700">|</span>
                    <span className="text-gray-600 dark:text-gray-400">
                        <span className="font-semibold text-gray-900 dark:text-white">{formatFileSize(totalSize)}</span>
                    </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Drag to reorder files
                </p>
            </motion.div>

            {/* Sortable File List */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={files.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                        <AnimatePresence mode="popLayout">
                            {files.map((file, index) => (
                                <FileItem
                                    key={file.id}
                                    file={file}
                                    onRemove={onRemove}
                                    index={index}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}
