'use client'
import React from 'react'
import { motion } from "motion/react"
import { useRouter } from 'next/navigation'
import { ArrowLeft, BadgeCheck, CheckCircle, CreditCard, FileCheck, Landmark,Phone } from 'lucide-react'

function Page() {

    const router = useRouter()
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
                            <input type="text" name='ahn' id='ahn' placeholder='Account Holder Name' className='pl-3 rounded-lg border-gray-300 shadow-sm focus:border-black focus:outline-none flex-1 border-b pb-2 ' />
                        </div>
                    </div>
                    <div>
                        <label htmlFor='bacc' className='block text-sm font-semibold text-gray-700 mb-1'>Bank Account Number</label>
                        <div className='flex items-center gap-2 mt-2'>
                            <div className='text-gray-500'><CreditCard size={20} /></div>
                            <input type="text" name='bacc' id='bacc' placeholder='Bank Account Number' className='pl-3 rounded-lg border-gray-300 shadow-sm focus:border-black focus:outline-none flex-1 border-b pb-2 ' />
                        </div>
                    </div>
                    <div>
                        <label htmlFor='ifsc' className='block text-sm font-semibold text-gray-700 mb-1'>IFSC Code</label>
                        <div className='flex items-center gap-2 mt-2'>
                            <div className='text-gray-500'><Landmark size={20} /></div>
                            <input type="text" name='ifsc' id='ifsc' placeholder='IFSC Code' className='pl-3 rounded-lg border-gray-300 shadow-sm focus:border-black focus:outline-none flex-1 border-b pb-2 ' />
                        </div>
                    </div>

                    <div>
                        <label htmlFor='mn' className='block text-sm font-semibold text-gray-700 mb-1'>Mobile Number</label>
                        <div className='flex items-center gap-2 mt-2'>
                            <div className='text-gray-500'><Phone size={20} /></div>
                            <input type="text" name='mn' id='mn' placeholder='Mobile Number' className='pl-3 rounded-lg border-gray-300 shadow-sm focus:border-black focus:outline-none flex-1 border-b pb-2 ' />
                        </div>
                    </div>

                    <div>
                        <label htmlFor='upi' className='block text-sm font-semibold text-gray-700 mb-1'>UPI ID (optional)</label>
                        <div className='flex items-center gap-2 mt-2'>
                            <input type="text" name='upi' id='upi' placeholder='UPI ID' className='pl-3 rounded-lg border-gray-300 shadow-sm focus:border-black focus:outline-none flex-1 border-b pb-2 ' />
                        </div>
                    </div>

                </div>
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
                >
                    Continue
                </motion.button>
            </motion.div>
        </div>
    )
}

export default Page
