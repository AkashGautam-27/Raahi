'use client'
import axios from 'axios';
import { User } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';


type Stats = {
    totalApprovedPartners: number
    totalPartners: number
    totalPendingPartners: number
    totalRejectedPartners: number
}

type Tab = "partner" | "kyc" | "vehicle"
export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [activeTab, setActiveTab] = useState<Tab>("partner")
    const [partnerReviews, setPartnerReviews] = useState<any>()
    const [pendingkyc, setPendingkyc] = useState<any>()
    const [vehicleReviews, setVehicleReviews] = useState<any>()
    const handleGetData = async () => {
        try {
            const { data } = await axios.get("/api/admin/dashboard")
            setStats(data.stats)
            setPartnerReviews(data.pendingPartnersReviews)
            setVehicleReviews(data.pendingVehicles)

        } catch (error) {
            console.log(error)
        }
    }

    const handleGetPendingKYC = async () => {
        try {
            const { data } = await axios.get("/api/admin/video-kyc/pending")
            setPendingkyc(data)
        } catch (error) {
            console.log(error)
        }
    }


    useEffect(() => {
        handleGetPendingKYC()
        handleGetData()
    }, [])

    return (
        <div className='min-h-screen bg-linear-to-br from-gray-100 to-gray-200'>
            <div className='sticky top-0 bg-white/80 backdrop-blur-lg border-b z-40'>
                <div className='max-w-7xl mx-auto h-16 px-6 flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <Image src={"/logo.jpeg"} alt='logo' width={44} height={44} priority />

                    </div>

                    <div className='flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-black text-white'>
                        <User size={14} />
                        Admin Dashboard
                    </div>
                </div>
            </div>
        </div>
    );
}