'use client'
import React from 'react'
import { motion } from 'motion/react'

interface AnimatedCardProps {
    title: string
    icon?: React.ReactNode
    children: React.ReactNode
    className?: string
}

export default function AnimatedCard({ title, icon, children, className = '' }: AnimatedCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4 ${className}`}
        >
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                {icon && (
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        {icon}
                    </div>
                )}
                <h3 className="font-semibold text-base text-gray-900">{title}</h3>
            </div>
            <div className="space-y-3">
                {children}
            </div>
        </motion.div>
    )
}
