'use client'
import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from "motion/react"
import { ArrowLeft, Bike, Car, MapPin, Navigation, RefreshCcw, Search, Truck, Zap } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
const SearchMap = dynamic(() => import("@/components/SearchMap"), { ssr: false })

import axios from 'axios'
import { VehicleType } from '@/models/vehicle.model'
// import VehicleCard from '@/components/VehicleCard'


const VEHICLE_META: any = {
    bike: { label: "Bike", Icon: Bike },
    auto: { label: "Auto", Icon: Car },
    car: { label: "Car", Icon: Car },
    loading: { label: "Loading", Icon: Truck },
    truck: { label: "Truck", Icon: Truck },
};
interface IVehicle {
    _id: string
    owner: string
    type: VehicleType,
    vehicleModel: string,
    number: string,
    imageUrl?: string,
    baseFare?: number,
    pricePerKM?: number,
    waitingCharge?: number,
    status: "approved" | "pending" | "rejected",
    rejectionReason?: string,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date

}
function SearchPage() {
    const router = useRouter()
    const params = useSearchParams()
    const [pickUp, setPickUp] = useState(params.get("pickup") || "")
    const [drop, setDrop] = useState(params.get("drop") || "")
    const [km, setKm] = useState<number>(0)
    const mobile = params.get("mobile")
    const pickUpLat = Number(params.get("pickuplat"))
    const pickUpLon = Number(params.get("pickuplon"))
    const dropLat = Number(params.get("droplat"))
    const dropLon = Number(params.get("droplon"))
    const vehicle = params.get("vehicle") || ""
    const [vehicles, setVehicles] = useState<IVehicle[]>([])
    const [loading, setLoading] = useState(false)
    const meta = VEHICLE_META[vehicle]
    return (
        <div className='min-h-screen bg-zinc-100 text-zinc-900 overflow-x-hidden'>
            <div className='absolute top-5 left-5 z-50'>
                <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => router.back()}
                    className="w-11 h-11 rounded-full bg-white border border-zinc-200 shadow-md flex items-center justify-center hover:bg-zinc-50 transition-colors"
                >
                    <ArrowLeft size={17} className="text-zinc-900" />
                </motion.button>
            </div>
            <div className='relative w-full h-[52vh] z-0'>
                <SearchMap
                    pickUp={pickUp}
                    drop={drop}
                    onChange={(p, d) => { setPickUp(p); setDrop(d) }}
                    onDistance={setKm}
                />

            </div>

        </div>
    )
}

export default SearchPage