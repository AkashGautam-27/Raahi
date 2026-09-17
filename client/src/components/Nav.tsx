'use client'
import React, { useState } from 'react'
import { motion } from "motion/react"
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AuthModel from './AuthModel'

function Nav() {
const Nav_Items = ["Home", "Bookings", "About Us", "Contact"]
const [authOpen,setAuthOpen] = useState(false)
const pathName = usePathname()
  return (
    <>
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className='fixed top-3 left-1/2 -translate-x-1/2 w-[94%] md-w-[86%] z-50 rounded-full bg-[#0B0B0B] text-white shadow-[0_15px_50px_rgba(0,0,0,0.7)] py-4'
    >
      <div className='max-w-7xl mx-auto md:px-8
       flex items-center justify-between'>
        <Image src={"/logo.jpeg"} alt='logo' width={44} height={50} priority />
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className='hidden md:flex items-center gap-10'>
          {Nav_Items.map((i, index) => {
            let href;
            if (i == "Home") {
              href = `/`
            } else {
              href = `/${i.toLowerCase()}`
            }
            const active = href == pathName
            return <Link key={index} href={href} className={`text-sm font-medium transition ${active
                ? "text-white"
                : "text-gray-400 hover:text-white"}`}>{i}</Link>
          })}
        </motion.div>
        <motion.button
          whileHover={{ scale: 1.10 }}
          whileTap={{ scale: 0.90 }}
          className='px-4 py-1.5 rounded-full bg-white font-bold text-black text-sm'
          onClick={()=>setAuthOpen(true)}>
          Login
        </motion.button>
      </div>
     


    </motion.div>
     <AuthModel onClose={()=>setAuthOpen(false)} open={authOpen}/>
      </>
  )
}

export default Nav
