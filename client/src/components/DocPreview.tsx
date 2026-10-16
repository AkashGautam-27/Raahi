'use client'
import React, { useState } from 'react'
import { Eye, ExternalLink, FileText, X } from 'lucide-react'

interface DocPreviewProps {
    label: string
    url?: string
}

export function DocPreview({ label, url }: DocPreviewProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
            <div className="relative group rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden aspect-4/3 flex items-center justify-center transition-all hover:shadow-md">
                {url ? (
                    <>
                        <img
                            src={url}
                            alt={label}
                            className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                                type="button"
                                onClick={() => setIsOpen(true)}
                                className="p-2 bg-white/90 hover:bg-white text-gray-900 rounded-xl transition shadow"
                                title="Preview"
                            >
                                <Eye size={16} />
                            </button>
                            <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 bg-white/90 hover:bg-white text-gray-900 rounded-xl transition shadow"
                                title="Open in new tab"
                            >
                                <ExternalLink size={16} />
                            </a>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                        <FileText size={28} className="mb-1 text-gray-300" />
                        <span className="text-xs">No document</span>
                    </div>
                )}
            </div>

            {/* Modal preview */}
            {isOpen && url && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
                    onClick={() => setIsOpen(false)}
                >
                    <div className="relative max-w-3xl max-h-[90vh] bg-white rounded-2xl overflow-hidden p-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-4 py-2 border-b">
                            <h3 className="font-semibold text-sm text-gray-800">{label}</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-500 hover:text-black p-1 rounded-lg transition"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-2 overflow-auto max-h-[80vh] flex items-center justify-center">
                            <img src={url} alt={label} className="max-w-full max-h-[75vh] object-contain rounded-lg" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DocPreview
