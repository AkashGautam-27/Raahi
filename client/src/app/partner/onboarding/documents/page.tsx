'use client'
import React, { useState } from 'react'
import { motion } from "motion/react"
import { useRouter } from 'next/navigation'
import { ArrowLeft, CircleDashed, FileCheck, UploadCloud } from 'lucide-react'
import axios from 'axios'


type docsTypes = "aadhar" | "license" | "rc"
function Page() {
    const router = useRouter()
    const [docs, setDocs] = useState<Record<docsTypes, File | null>>({
        aadhar: null,
        license: null,
        rc: null
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleDocs = async () => {
        setError("");

        if (!docs.aadhar || !docs.license || !docs.rc) {
            setError("Please upload all three documents");
            return;
        }
        try {
            setLoading(true)
            const formdata = new FormData()
            formdata.append("aadhar", docs.aadhar)
            formdata.append("license", docs.license)
            formdata.append("rc", docs.rc)
            const { data } = await axios.post("/api/partner/onboarding/document", formdata)
            console.log("Documents uploaded:", data)

            setLoading(false)
            router.push("/partner/onboarding/bank")
        } catch (error: any) {
            console.log("Status:", error.response?.status);
            console.log("Response:", error.response?.data);
            console.log("URL:", error.config?.url);

            setError(
                error?.response?.data?.message ??
                "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    }

    const handleImage = (doc: docsTypes, file: File | null) => {
        if (!file) {
            return
        }
        setDocs((prev) => ({ ...prev, [doc]: file }))
    }

    const isCompleted = docs.aadhar && docs.license && docs.rc
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
                    <motion.label
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`border-2 border-dashed rounded-2xl flex items-center justify-between p-4 gap-3 cursor-pointer transition ${docs.aadhar ? 'border-green-600 bg-green-50/30' : 'border-gray-300 hover:border-black'}`}
                    >
                        <div className='gap-2 max-w-[260px] overflow-hidden'>
                            <p className='text-sm font-semibold'>Aadhaar / ID Proof</p>
                            <p className='text-xs text-gray-500 truncate'>
                                {docs.aadhar ? docs.aadhar.name : "Government Issued ID"}
                            </p>
                        </div>
                        <div className='flex items-center gap-2'>
                            <span className='text-xs font-semibold text-gray-700'>
                                {docs.aadhar ? "Selected" : "Upload"}
                            </span>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${docs.aadhar ? 'bg-green-600 text-white' : 'bg-black text-white'}`}>
                                <UploadCloud size={24} />
                            </div>
                        </div>
                        <input type='file' hidden accept='image/*,.pdf' onChange={(e) => handleImage("aadhar", e.target?.files?.[0] || null)} />
                    </motion.label>

                    <motion.label
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`border-2 border-dashed rounded-2xl flex items-center justify-between p-4 gap-3 cursor-pointer transition ${docs.license ? 'border-green-600 bg-green-50/30' : 'border-gray-300 hover:border-black'}`}
                    >
                        <div className='gap-2 max-w-[260px] overflow-hidden'>
                            <p className='text-sm font-semibold'>Driving License</p>
                            <p className='text-xs text-gray-500 truncate'>
                                {docs.license ? docs.license.name : "Valid Driver's License"}
                            </p>
                        </div>
                        <div className='flex items-center gap-2'>
                            <span className='text-xs font-semibold text-gray-700'>
                                {docs.license ? "Selected" : "Upload"}
                            </span>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${docs.license ? 'bg-green-600 text-white' : 'bg-black text-white'}`}>
                                <UploadCloud size={24} />
                            </div>
                        </div>
                        <input type='file' hidden accept='image/*,.pdf' onChange={(e) => handleImage("license", e.target?.files?.[0] || null)} />
                    </motion.label>

                    <motion.label
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`border-2 border-dashed rounded-2xl flex items-center justify-between p-4 gap-3 cursor-pointer transition ${docs.rc ? 'border-green-600 bg-green-50/30' : 'border-gray-300 hover:border-black'}`}
                    >
                        <div className='gap-2 max-w-[260px] overflow-hidden'>
                            <p className='text-sm font-semibold'>Vehicle RC</p>
                            <p className='text-xs text-gray-500 truncate'>
                                {docs.rc ? docs.rc.name : "Vehicle Registration Certificate"}
                            </p>
                        </div>
                        <div className='flex items-center gap-2'>
                            <span className='text-xs font-semibold text-gray-700'>
                                {docs.rc ? "Selected" : "Upload"}
                            </span>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${docs.rc ? 'bg-green-600 text-white' : 'bg-black text-white'}`}>
                                <UploadCloud size={24} />
                            </div>
                        </div>
                        <input type='file' hidden accept='image/*,.pdf' onChange={(e) => handleImage("rc", e.target?.files?.[0] || null)} />
                    </motion.label>
                </div>

                <div className='mt-4 flex items-start gap-3 text-xs text-gray-500'>
                    <FileCheck size={20} className="text-gray-500 mt-0.5" />
                    <p className="leading-relaxed">By uploading these documents, you agree to our Terms of Service and Privacy Policy.</p>
                </div>
                {error &&
                    <p className='text-red-500 mt-4'>*{error}</p>
                }
                <motion.button
                    disabled={!isCompleted || loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className='mt-8 w-full h-14 py-3 bg-black text-white rounded-2xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-40'
                    onClick={handleDocs}
                >
                    {loading ? <CircleDashed className='text-white animate-spin' /> : "Continue"}
                </motion.button>
            </motion.div>
        </div>
    )
}

export default Page
