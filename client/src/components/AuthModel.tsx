'use client'
import React from 'react'
import { motion } from "motion/react"
import { X } from 'lucide-react'
import Image from 'next/image'


type propType={
    open:boolean,
    onClose:()=>void
}
function AuthModel({open,onClose}:propType) {
  return (
   <>
    {open && (
      
      <motion.div
      initial={{  opacity: 0 }}
          animate={ {opacity: 1 }}
          onClick={onClose}
          className='fixed inset-0 z-[90] bg-black/80 backdrop-blur-md'>
            <motion.div
             initial={{  opacity: 0 ,scale:0.90,y:40}}
          animate={ {opacity: 1,scale:1,y:0 }}
          transition={{duration:0.40,ease:"easeOut"}}
          className='fixed inset-0 z-[100] flex justify-center items-center px-4'
            >
              <div className='relative w-full max-w-md rounded-3xl bg-white border border-black/10 shadow-[0_40px_100px_rgba(0,0,0,0.40)] p-6 sm:p-8 '>
              <button className='right-4 top-4 absolute text-gray-500 hover:text-black transition' onClick={onClose}>
                <X size={20}/>
                 </button>
                <div className='mb-6 text-center'>
                 <h1 className='text-3xl font-extrabold tracking-widest'> RAAHI</h1>
                 <p className='mt-1 text-xs  text-gray-500 '>Premium vehicle Booking</p>
                </div>
               <button 
               className='w-full h-11 rounded-xl border border-black/20 flex items-center justify-center gap-3 text-sm font-semibold hover:bg-black hover:text-white transition'>
               <Image src={"/google.jpg"} alt='google' width={20} height={20} />
                Continue with Google
               </button>
               <div className='flex items-center gap-4 my-6'>
                <div className='flex-1 h-px bg-black/10'/> 
                <div className='text-xs text-gray-500'>OR</div>
                <div className='flex-1 h-px bg-black/10'/>
               </div>
              </div>
            </motion.div>
      </motion.div>
    )}
    </>
  )
}

export default AuthModel

