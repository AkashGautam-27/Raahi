'use client'
import React from 'react'
import { AnimatePresence, motion } from "motion/react"

import { FaInstagram,FaFacebook,FaLinkedin, FaTwitter } from 'react-icons/fa';


function Footer() {
  return (
    <div className='w-full bg-black text-white'>
      <motion.div
      initial={{opacity:0,y:40}}
      whileInView={{opacity:1,y:0}}
      transition={{duration:0.6,ease:"easeOut"}}
      viewport={{once:true}}
      className='max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center gap-6'
      >
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full'>
    <div>
      <h2 className='text-2xl font-bold tracking-wide'>RAAHI</h2>
      <p className='text-gray-400 text-sm leading-relaxed'>Book any vehicle at the best price</p>
      <div className='flex items-center gap-2 mt-4'>
        {[FaInstagram,FaFacebook,FaTwitter,FaLinkedin].map((Icon,i)=>(
          <motion.a
          key={i}
          initial={{opacity:0,y:20}}
          whileInView={{opacity:1,y:0}}
          transition={{duration:0.6,ease:"easeOut"}}
          viewport={{once:true}}
    className='w-10 h-10 flex items-center justify-center rounded-full border border-white/20  text-gray-400 bg-white hover:text-black cursor-pointer'
          >
            <Icon size={20}/>
          </motion.a>
        ))}
      </div>
    </div>
        </div>
        <div className='border-t border-gray-600 w-full py-6 text-center text-gray-400 text-sm'>
          <div className='flex items-center justify-center gap-2 mb-2'>
          <p>&copy; {new Date().getFullYear()} RAAHI. All rights reserved.</p>

          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Footer
