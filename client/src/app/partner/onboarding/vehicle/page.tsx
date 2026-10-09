'use client'
import React, { useState } from 'react'
import { motion } from "motion/react"
import { ArrowLeft, Bike, Car, Package, Truck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

const VEHICLE = [
    { id: 1, label: "bike", desc: "2 Wheeler", Icon: Bike },
    { id: 2, label: "auto", desc: "3 Wheeler", Icon: Car },
    { id: 3, label: "car", desc: "4 Wheeler", Icon: Car },
    { id: 4, label: "loading", desc: "Small goods", Icon: Package },
    { id: 5, label: "truck", desc: "Heavy Transport", Icon: Truck },
];


function Page() {
    const router = useRouter()
    const [vehicleType, setVehicleType] = useState<number | "">("")
    const [vehicleModel, setVehicleModel] = useState("")
    const [vehicleNumber, setVehicleNumber] = useState("")

const handleVehicle = async()=>{
    try {
        const {data} = await axios.post("/api/partner/onboarding/vehicle",{
            type:vehicleType,number:vehicleNumber,vehicleModel
    });
    console.log(data)
        
    } catch (error) {
        console.log(error)
    }
}


    return (
        <div className='w-full min-h-screen flex items-center justify-center px-4'>
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
                    <p className='text-xs font-semibold text-gray-700'>step 1 of 3</p>
                    <h1 className='text-2xl font-semibold text-gray-700'>step 1: Vehicle Information</h1>
                    <p className='text-2sm font-bold text-gray-800 mt-2'>Add Your Vehicle Details</p>

                </div>
                <div className='mt-8 space-y-6'>
                    <div className='flex flex-col gap-2'>
                        <p className='text-lg font-semibold text-gray-700'>Vehicle Type</p>
                        <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
                            {VEHICLE.map((v) => {
                                const Icon = v.Icon
                                const active = vehicleType === v.id
                                return (<motion.div
                                    whileHover={{ scale: 1.05 }
                                    }
                                    whileTap={{ scale: 0.95 }}
                                    key={v.id}
                                    onClick={() => setVehicleType(v.id)}
                                    className={`flex flex-col items-center justify-center gap-2 p-4 border rounded-2xl cursor-pointer transition ${active ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-black'}`}>
                                    <div className={`w-11 h-11 rounded-full flex items-center justify-center ${active ? 'bg-white text-black' : 'bg-black text-white'}`}><Icon size={24} /></div>
                                    <div className='text-sm font-medium text-gray-700'>{v.label}</div>
                                    <p className={`text-xs ${active ? 'text-gray-300' : 'text-gray-500'}`}>{v.desc}</p>
                                </motion.div>)
                            })}
                        </div>
                    </div>
                
                <div className='mt-6 flex flex-col gap-2'>
                    <label className='text-lg font-bold text-gray-500' htmlFor='vn'>Vehicle Number</label>
                    <input
                        type='text'
                        id='vn'
                        
                        placeholder='Enter vehicle number'
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                        className='mt-2 w-full border-b border-gray-300 pb-2   focus:outline-none focus:border-black transition'
                    />
                </div>
                <div className='mt-6 flex flex-col gap-2'>
                    <label className='text-lg font-bold text-gray-500' htmlFor='vm'>Vehicle Model</label>
                    <input
                        type='text'
                        id='vm'
                        placeholder='Enter vehicle model'
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        className='mt-2 w-full border-b border-gray-300 pb-2   focus:outline-none focus:border-black transition'
                    />
                </div>
                </div>
                <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='mt-8 w-full h-14 py-3 bg-black text-white rounded-2xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-40'
                onClick={handleVehicle}
                >
                    Continue
                </motion.button>
            </motion.div >
        </div >
    )
}

export default Page
