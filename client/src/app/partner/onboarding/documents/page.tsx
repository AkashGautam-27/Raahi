'use client'
import React from 'react'
import { motion } from "motion/react"
import { useRouter } from 'next/navigation'
import { ArrowLeft, FileCheck, UploadCloud } from 'lucide-react'



function Page() {
    const router = useRouter()

    return (
        <div className='w-full min-h-screen bg-white flex items-center justify-center px-4'>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className='max-w-xl w-full rounded-3xl bg-white border border-gray-200 shadow-[0_25px_70px_rgba(0,0,0,0.15)] p-6 sm:p-8 '
            >
                <div className='relative text-center'>
                    <button className='absolute left-0 top-0 text-gray-500 w-9 h-9 border border-gray-300 flex items-center justify-center transition hover:bg-gray-100 focus:outline-none rounded-full'
                        onClick={() => router.back()}>
                        <ArrowLeft size={18} />
                    </button>
                    <p className='text-xs font-semibold text-gray-700'>step 2 of 3</p>
                    <h1 className='text-2xl font-semibold text-gray-700'>step 2: Upload  Documents</h1>
                    <p className='text-2sm font-bold text-gray-800 mt-2'>Requires valid documents for verification</p>
                </div>
                <div className='mt-8 space-y-6'>
                    <motion.label htmlFor=""
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className='border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-between p-4 gap-3 cursor-pointer transition hover:border-black'
                    >
                        <div className='gap-2'>
                            <p className='text-sm font-semibold'>Aadhaar / ID Proof</p>
                            <p className='text-xs text-gray-500'>Government Issued ID</p>
                        </div>
                        <div>
                            <span className='text-xs font-semibold text-gray-700'>Upload</span>
                            <div className='text-gray-500 w-10 h-10 rounded-full bg-black flex items-center justify-center'><UploadCloud size={24} /></div>
                        </div>


                    </motion.label>
                    <motion.label htmlFor=""
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className='border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-between p-4 gap-3 cursor-pointer transition hover:border-black'
                    >
                        <div className='gap-2'>
                            <p className='text-sm font-semibold'>Driving License</p>
                            <p className='text-xs text-gray-500'>Valid Driver&apos;s License</p>
                        </div>
                        <div>
                            <span className='text-xs font-semibold text-gray-700'>Upload</span>
                            <div className='text-gray-500 w-10 h-10 rounded-full bg-black flex items-center justify-center'><UploadCloud size={24} /></div>
                        </div>


                    </motion.label>
                    <motion.label htmlFor=""
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className='border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-between p-4 gap-3 cursor-pointer transition hover:border-black'
                    >
                        <div className='gap-2'>
                            <p className='text-sm font-semibold'>Vehicle RC</p>
                            <p className='text-xs text-gray-500'>Vehicle Registration Certificate</p>
                        </div>
                        <div>
                            <span className='text-xs font-semibold text-gray-700'>Upload</span>
                            <div className='text-gray-500 w-10 h-10 rounded-full bg-black flex items-center justify-center'><UploadCloud size={24} /></div>
                        </div>


                    </motion.label>
                </div>

                <div className='mt-4 flex items-start gap-3 text-xs text-gray-500'>
                    <FileCheck size={20}  className="text-green-500 mt-0.5"/>
                    <p className="leading-relaxed">By uploading these documents, you agree to our Terms of Service and Privacy Policy.</p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className='mt-8 w-full h-14 py-3 bg-black text-white rounded-2xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-40'
                >
                    Continue
                </motion.button>
            </motion.div>
        </div>
    )
}

export default Page
