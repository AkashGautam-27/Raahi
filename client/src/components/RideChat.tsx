'use client'
import axios from 'axios'
import { Send, Sparkles, X } from 'lucide-react'
import { div } from 'motion/react-client'
import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from "motion/react"
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { getSocket } from '@/lib/socket'
type message = {
    bookingId: string,
    sender: "user" | "driver",
    text: string,
    createdAt: Date
}
function RideChat({ currentRole, bookingId, userName, driverName }: any) {

    const otherName = currentRole == "user" ? driverName : userName
    const myName = currentRole == "user" ? userName : driverName
    const [messages, setMessages] = useState<message[]>([])
    const [lastMessage, setLastMessage] = useState("")
    const [text, setText] = useState("")
    const { userData } = useSelector((state: RootState) => state.user)
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [showAI, setShowAI] = useState(false)
    const [aiLoading, setAiLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    return (
        <div className='flex flex-col h-full min-h-0 bg-white rounded-2xl overflow-hidden border border-zinc-100'>

            <div className='flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-white border-b border-zinc-100'>
                <div className='relative flex-shrink-0'>
                    <div className='w-9 h-9 rounded-xl bg-zinc-950 flex items-center justify-center text-white text-xs font-bold'>
                        {otherName.charAt(0).toUpperCase()}
                    </div>
                    <span className='absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white' />
                </div>

                <div className='flex-1 min-w-0'>
                    <p className='text-sm font-bold text-zinc-900 leading-none'>{otherName}</p>
                    <p className='text-[11px] text-emerald-500 font-semibold mt-0.5'>Active Now</p>
                </div>
            </div>
        </div>

    )
}
export default RideChat