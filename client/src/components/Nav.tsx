'use client'
import React, { useState } from 'react'
import { AnimatePresence, motion } from "motion/react"
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AuthModel from './AuthModel'
import { signOut, useSession } from 'next-auth/react'
import { Bike, Car, ChevronRight, LogOut, Menu, Truck, X } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setUserData } from '@/redux/userSlice'

function Nav() {
  const Nav_Items = ["Home", "Bookings", "About Us", "Contact"]
  const [authOpen, setAuthOpen] = useState(false)
  const pathName = usePathname()
  const { data: session } = useSession()
  console.log(session)
  const [profileOpen, setProfileOpen] = useState(false)
  const dispatch = useDispatch()
  const handleLogOut = async () => {
    await signOut({ redirect: false })
    dispatch(setUserData(null))
    setProfileOpen(false)

  }
  const [menuOpen, setMenuOpen] = useState(false);
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
          <div className="flex items-center gap-3 relative">
            <div className="hidden md:block relative">
              {!session?.user ? (
                <motion.button
                  whileHover={{ scale: 1.10 }}
                  whileTap={{ scale: 0.90 }}
                  className="px-4 py-1.5 rounded-full bg-white font-bold text-black text-sm"
                  onClick={() => setAuthOpen(true)}
                >
                  Login
                </motion.button>
              ) : (<>
                <motion.button
                  whileHover={{ scale: 1.10 }}
                  whileTap={{ scale: 0.90 }}
                  className="px-4 py-1.5 w-11 h-11 rounded-full bg-white font-bold text-black"
                  onClick={() => setProfileOpen(p => !p)}
                >
                  {session.user.name?.charAt(0).toUpperCase()}
                </motion.button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ y: 0, opacity: 0 }}
                      animate={{ y: -10, opacity: 1 }}
                      exit={{ y: 0, opacity: 0 }}
                      className='absolute top-14 right-0 w-[300px] bg-white text-black rounded-2xl shadow-xl border'
                    >
                      <div className='p-5'>
                        <p className='font-semibold text-lg'>{session.user.name}</p>
                        <p className='uppercase text-gray-500 mb-4 text-xs'>{session.user.role}</p>
                        {session.user.role != "partner" && (
                          <div className='w-full flex items-center gap-3 py-3 hover:bg-gray-200 rounded-xl'>
                            <div className='flex -space-x-2'>
                              <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'>
                                <Bike size={16} />
                              </div>
                              <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'>
                                <Car size={16} />
                              </div>
                              <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'>
                                <Truck size={16} />
                              </div>
                            </div>
                            Become a partner
                            <ChevronRight size={16} className='mt-auto' />
                          </div>
                        )}
                        <button className='w-full flex items-center justify-center gap-3 py-3 hover:bg-gray-200 rounded-xl mt-2' onClick={handleLogOut}>
                          <LogOut size={16} /> Logout</button>
                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>
              </>
              )}
            </div>
            <div className="md:hidden relative">
              {!session?.user ? (
                <motion.button
                  whileHover={{ scale: 1.10 }}
                  whileTap={{ scale: 0.90 }}
                  className="px-4 py-1.5 rounded-full bg-white font-bold text-black text-sm"
                  onClick={() => setAuthOpen(true)}
                >
                  Login
                </motion.button>
              ) : (<>
                <motion.button
                  whileHover={{ scale: 1.10 }}
                  whileTap={{ scale: 0.90 }}
                  className="px-4 py-1.5 w-11 h-11 rounded-full bg-white font-bold text-black"
                  onClick={() => setProfileOpen(p => !p)}
                >
                  {session.user.name?.charAt(0).toUpperCase()}
                </motion.button>
              </>
              )}
            </div>
            <button className='md:hidden text-white' onClick={() => setMenuOpen(p => !p)}>
              {menuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>




          </div>

        </div>



      </motion.div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className='fixed inset-0 bg-black z-30 md:hidden'
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className='fixed top-[85px] left-1/2 -translate-x-1/2 w-[92%] bg-[#0B0B0B] rounded-2xl shadow-2xl md:hidden z-40 overflow-hidden'
            >
              <div className='flex flex-col divide-y divide-white/10'>
                {Nav_Items.map((i, index) => {
                  let href;
                  if (i == "Home") {
                    href = `/`
                  } else {
                    href = `/${i.toLowerCase()}`
                  }
                  return <Link key={index} href={href} className="px-6 py-4 text-gray-300 hover:bg-white/5">{i}</Link>
                })}
              </div>

            </motion.div>

          </>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {profileOpen && session?.user && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setProfileOpen(false)}
              className='fixed inset-0 bg-black z-30 md:hidden'
            />
            <motion.div className='fixed inset-x-0 bottom-0 bg-white rounded-xl shadow-2xl z-50 md:hidden'
              initial={{ y: 400 }}
              animate={{ y: 0 }}
              exit={{ y: 400 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className='p-5'>
                <p className='font-semibold text-lg'>{session.user.name}</p>
                <p className='uppercase text-gray-500 mb-4 text-xs'>{session.user.role}</p>
                {session.user.role != "partner" && (
                  <div className='w-full flex items-center gap-3 py-3 hover:bg-gray-200 rounded-xl'>
                    <div className='flex -space-x-2'>
                      <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'>
                        <Bike size={16} />
                      </div>
                      <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'>
                        <Car size={16} />
                      </div>
                      <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'>
                        <Truck size={16} />
                      </div>
                    </div>
                    Become a partner
                    <ChevronRight size={16} className='mt-auto' />
                  </div>
                )}
                <button className='w-full flex items-center justify-center gap-3 py-3 hover:bg-gray-200 rounded-xl mt-2' onClick={handleLogOut}>
                  <LogOut size={16} /> Logout</button>
              </div>

            </motion.div>

          </>
        )}
      </AnimatePresence>

      <AuthModel onClose={() => setAuthOpen(false)} open={authOpen} />
    </>
  )
}

export default Nav
