'use client'
import React, { useEffect, useState } from 'react'
import { motion } from "motion/react"
import { useRouter } from 'next/navigation'
import { ArrowLeft, BadgeCheck, CheckCircle, CircleDashed, CreditCard, FileCheck, Landmark, Phone } from 'lucide-react'
import axios from 'axios'
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/
function Page() {

    const router = useRouter()
    const [accountHolder, setAccountHolder] = useState("")
    const [accountNumber, setAccountNumber] = useState("")
    const [ifsc, setIfsc] = useState("")
    const [upi, setUpi] = useState("")
    const [mobileNumber, setMobileNumber] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const sanitizedIfsc = ifsc.trim().toUpperCase()

    const isNameValid = accountHolder.trim().length >= 3
    const isAccountValid = accountNumber.trim().length >= 9
    const isIfscValid = IFSC_REGEX.test(sanitizedIfsc)
    const isMobileValid = mobileNumber.trim().length == 10

    const canSubmit = isNameValid && isAccountValid && isIfscValid && isMobileValid

    const handleBank = async () => {
        setLoading(true)
        setError("")
        try {
            const { data } = await axios.post("/api/partner/onboarding/bank", {
                accountHolder, accountNumber, ifsc: sanitizedIfsc, upi, mobileNumber
            })
            console.log(data)
            setLoading(false)
            window.location.href = "/"
        } catch (error: any) {
            setError(error?.response?.data?.message || "something went wrong")
            console.log(error)
            setLoading(false)
        }
    }

    useEffect(() => {
        const handleGetBank = async () => {

            try {
                const { data } = await axios.get("/api/partner/onboarding/bank")
                setAccountHolder(data.partnerBank.accountHolder)
                setAccountNumber(data.partnerBank.accountNumber)
                setIfsc(data.partnerBank.ifsc)
                setUpi(data.partnerBank.upi)
                setMobileNumber(data.mobileNumber)
                console.log(data)

            } catch (error: any) {

                console.log(error)

            }
        }
        handleGetBank()
    }, [])

    return (
        <div className='w-full min-h-screen bg-white flex items-center justify-center px-4'>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className='max-w-xl w-full rounded-3xl bg-white border border-gray-200 shadow-[0_25px_70px_rgba(0,0,0,0.15)] p-6 sm:p-8 '>
                <div className='relative text-center'>
                    <button className='absolute left-0 top-0 text-gray-500 w-9 h-9 border border-gray-300 flex items-center justify-center transition hover:bg-gray-100 focus:outline-none rounded-full'
                        onClick={() => router.back()}>
                        <ArrowLeft size={18} />
                    </button>
                    <p className='text-xs font-semibold text-gray-700'>step 3 of 3</p>
                    <h1 className='text-2xl font-semibold text-gray-700'>step 3: Bank and Payout setup</h1>
                    <p className='text-2sm font-bold text-gray-800 mt-2'>Used for partner payouts</p>
                </div>
                <div className='mt-8 space-y-6'>
                    <div>
                        <label htmlFor='ahn' className='block text-sm font-semibold text-gray-700 mb-1'>Account Holder Name</label>
                        <div className='flex items-center gap-2 mt-2'>
                            <div className='text-gray-500'><BadgeCheck size={20} /></div>
                            <input type="text" name='ahn' id='ahn' placeholder='Account Holder Name'
                                className={`flex-1 border-b pb-2 text-sm focus:outline-none pl-3 rounded-lg border-gray-300 shadow-sm focus:border-black 
                                ${!isNameValid && accountHolder.length > 0 ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-black"}`}
                                value={accountHolder}
                                onChange={(e) => setAccountHolder(e.target.value)}


                            />
                        </div>
                        {!isNameValid && accountHolder.length > 0 && <p className='mt-1 text-xs text-red-500'>Minimum 3 characters required</p>}
                    </div>
                    <div>
                        <label htmlFor='bacc' className='block text-sm font-semibold text-gray-700 mb-1'>Bank Account Number</label>
                        <div className='flex items-center gap-2 mt-2'>
                            <div className='text-gray-500'><CreditCard size={20} /></div>
                            <input type="text" name='bacc' id='bacc' placeholder='Bank Account Number' className={`flex-1 border-b pb-2 text-sm focus:outline-none pl-3 rounded-lg border-gray-300 shadow-sm focus:border-black 
                                ${!isAccountValid && accountNumber.length > 0 ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-black"}`} value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)}
                            />
                        </div>
                        {!isAccountValid && accountNumber.length > 0 && <p className='mt-1 text-xs text-red-500'>Account number must be at least 9 digits</p>}
                    </div>
                    <div>
                        <label htmlFor='ifsc' className='block text-sm font-semibold text-gray-700 mb-1'>IFSC Code</label>
                        <div className='flex items-center gap-2 mt-2'>
                            <div className='text-gray-500'><Landmark size={20} /></div>
                            <input type="text" name='ifsc' id='ifsc' placeholder='IFSC Code' className={`flex-1 border-b pb-2 text-sm focus:outline-none pl-3 rounded-lg border-gray-300 shadow-sm focus:border-black 
                                 ${!isIfscValid && ifsc.length > 0 ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-black"}`} value={ifsc.toUpperCase()} onChange={(e) => setIfsc(e.target.value)} />
                        </div>
                        {!isIfscValid && ifsc.length > 0 && <p className='mt-1 text-xs text-red-500'>Invalid IFSC code</p>}
                    </div>

                    <div>
                        <label htmlFor='mn' className='block text-sm font-semibold text-gray-700 mb-1'>Mobile Number</label>
                        <div className='flex items-center gap-2 mt-2'>
                            <div className='text-gray-500'><Phone size={20} /></div>
                            <input type="text" name='mn' id='mn' placeholder='Mobile Number' className={`flex-1 border-b pb-2 text-sm focus:outline-none pl-3 rounded-lg border-gray-300 shadow-sm focus:border-black 
                                  ${!isMobileValid && mobileNumber.length > 0 ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-black"}`} value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} />
                        </div>
                        {!isMobileValid && mobileNumber.length > 0 && <p className='mt-1 text-xs text-red-500'>Enter a valid 10-digit mobile number</p>}
                    </div>

                    <div>
                        <label htmlFor='upi' className='block text-sm font-semibold text-gray-700 mb-1'>UPI ID (optional)</label>
                        <div className='flex items-center gap-2 mt-2'>
                            <input type="text" name='upi' id='upi' className={`flex-1 border-b pb-2 text-sm focus:outline-none pl-3 rounded-lg border-gray-300 shadow-sm focus:border-black 
                                ${!isAccountValid && accountNumber.length > 0 ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-black"}`} value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
                        </div>
                    </div>

                </div>
                {error && <p className='text-red-500 mt-4'>*{error}</p>}
                <div className='mt-6 flex items-start gap-3 text-xs text-gray-500 '>
                    <CheckCircle size={20} className='text-gray-500 mt-0.5' />
                    <p >
                        Your bank details are verified before first payout.
                        this usually takes 1-2 business days.
                    </p>
                </div>


                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className='mt-8 w-full h-14 py-3 bg-black text-white rounded-2xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-40'
                    onClick={handleBank}
                    disabled={!canSubmit || loading}
                >
                    {loading ? <CircleDashed className='text-white animate-spin' /> : "Continue"}
                </motion.button>
            </motion.div>
        </div>
    )
}

export default Page
