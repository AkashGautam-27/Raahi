'use client'
import React, { useState } from 'react'
import { AnimatePresence, motion } from "motion/react"
import { CircleDashed, Lock, Mail, User, X } from 'lucide-react'
import Image from 'next/image'
import axios from 'axios'

type stepType = "login" | "signup" | "otp"
type propType={
    open:boolean,
    onClose:()=>void
}
function AuthModel({open,onClose}:propType) {
  const [step,setStep] = useState<stepType>("login")
  const [name,setName] = useState("")
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [loading,setLoading] = useState(false)
  const [err,setErr] = useState("")


const handleSignUp=async ()=>{
  setLoading(true)
  setErr("")
  try {
    const {data} = await axios.post("/api/auth/register",{
      name,email,password
    });
    console.log(data);
    setLoading(false);
  } catch (error:any) {
    setLoading(false);
    setErr(error.response.data.message ?? "something went wrong")
  }
}




  return (
   <AnimatePresence>
    {open && (
      <>
      <motion.div
      initial={{  opacity: 0 }}
          animate={ {opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 z-90 bg-black/80 backdrop-blur-md'>
            <motion.div
             initial={{  opacity: 0 ,scale:0.90,y:40}}
          animate={ {opacity: 1,scale:1,y:0 }}
          transition={{duration:0.40,ease:"easeOut"}}
          exit={{  opacity: 0 ,scale:0.90,y:40}}
          className='fixed inset-0 z-100 flex justify-center items-center px-4'
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

              <div>
                 {step =="login" && (
                    <motion.div
                    initial={{opacity:0,x:20}}
                    animate={{opacity:1,x:0}}
                    >
                      <h1 className='text-xl font-semibold'>Welcome back</h1>
                      <div className='mt-5 space-y-4'> 
                       <div className='flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3'>
                         <Mail size={18} className='text-gray-500'/>
                        <input type="email" name="" id="" className='w-full bg-transparent outline-none text-sm' placeholder='Enter Email' onChange={(e)=>setEmail(e.target.value)} value={email}  />
                       </div>
                        <div className='flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3'>
                         <Lock size={18} className='text-gray-500'/>
                        <input type="password" name="" id="" className='w-full bg-transparent outline-none text-sm' placeholder='Enter password' onChange={(e)=>setPassword(e.target.value)} value={password}  />
                       </div>
                       <button className='w-full h-11 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 transition'>Login</button>
                      </div>
                      <p className='mt-6 text-center text-sm text-gray-500 '>Don&apos;t have An Account? <span className='text-black font-medium hover:underline cursor-pointer' onClick={()=>setStep("signup")}>Sign Up</span></p>
                    </motion.div>
                )}
                 {step =="signup" && (
                    <motion.div
                    initial={{opacity:0,x:20}}
                    animate={{opacity:1,x:0}}
                    >
                      <h1 className='text-xl font-semibold'>Create Account</h1>
                      <div className='mt-5 space-y-4'> 
                         <div className='flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3'>
                         <User size={18} className='text-gray-500'/>
                        <input type="text" name="" id="" className='w-full bg-transparent outline-none text-sm' placeholder='Enter Full Name' onChange={(e)=>setName(e.target.value)} value={name} />
                       </div>
                       <div className='flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3'>
                         <Mail size={18} className='text-gray-500'/>
                        <input type="email" name="" id="" className='w-full bg-transparent outline-none text-sm' placeholder='Enter Email' 
                       onChange={(e)=>setEmail(e.target.value)} value={email}  />
                       </div>
                        <div className='flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3'>
                         <Lock size={18} className='text-gray-500'/>
                        <input type="password" name="" id="" className='w-full bg-transparent outline-none text-sm' placeholder='Enter password' onChange={(e)=>setPassword(e.target.value)} value={password}  />
                       </div>
                       {err && <p className='text-red-500'>{err}</p>}
                       <button className='w-full h-11 rounded-xl bg-black flex justify-center items-center text-white font-semibold hover:bg-gray-900 transition' disabled={loading} onClick={handleSignUp}> {!loading?"Sign Up":<CircleDashed size={18} color='white' className='animate-spin'/>} </button>
                      </div>
                      <p className='mt-6 text-center text-sm text-gray-500 '>Already have An Account? <span className='text-black font-medium hover:underline cursor-pointer' onClick={()=>setStep("login")}>Login</span></p>
                    </motion.div>

                   
                )}
              </div>
              </div>
            </motion.div>
      </motion.div>
      </>
    )}
    </AnimatePresence>
  )
}

export default AuthModel

