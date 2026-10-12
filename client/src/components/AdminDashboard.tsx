'use client'
import axios from 'axios';
import { CheckCircle2, Clock, Image as ImageIcon, User, Users, Video, XCircle, Car, UserCheck } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import Kpi from './Kpi';
import TabButton from './TabButton';
import ContentList from './ContentList';

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
    const [partnerReviews, setPartnerReviews] = useState<any>([])
    const [pendingkyc, setPendingkyc] = useState<any>([])
    const [vehicleReviews, setVehicleReviews] = useState<any>([])

    const handleGetData = async () => {
        try {
            const { data } = await axios.get("/api/admin/dashboard")
            setStats(data.stats)
            setPartnerReviews(data.pendingPartnersReviews || [])
            setVehicleReviews(data.pendingVehicles || [])
        } catch (error) {
            console.log(error)
        }
    }

    const handleGetPendingKYC = async () => {
        try {
            const { data } = await axios.get("/api/admin/video-kyc/pending")
            setPendingkyc(data || [])
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        handleGetPendingKYC()
        handleGetData()
    }, [])

    return (
        <div className='min-h-screen bg-linear-to-br from-gray-100 to-gray-200 pb-16'>
            {/* Sticky Header */}
            <div className='sticky top-0 bg-white/80 backdrop-blur-lg border-b z-40'>
                <div className='max-w-7xl mx-auto h-16 px-6 flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <Image src={"/logo.jpeg"} alt='logo' width={44} height={44} priority />
                        <span className='font-bold text-lg text-gray-900'>Raahi Admin</span>
                    </div>

                    <div className='flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-black text-white'>
                        <User size={14} />
                        Admin Dashboard
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className='max-w-7xl mx-auto px-6 pt-8 space-y-8'>
                {/* Stats Section */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                    <Kpi
                        label="Total Partners"
                        variant="totalPartners"
                        value={stats?.totalPartners ?? 0}
                        icon={<Users size={20} />}
                    />
                    <Kpi
                        label="Approved Partners"
                        variant="approved"
                        value={stats?.totalApprovedPartners ?? 0}
                        icon={<CheckCircle2 size={20} />}
                    />
                    <Kpi
                        label="Pending Reviews"
                        variant="pending"
                        value={stats?.totalPendingPartners ?? 0}
                        icon={<Clock size={20} />}
                    />
                    <Kpi
                        label="Rejected"
                        variant="rejected"
                        value={stats?.totalRejectedPartners ?? 0}
                        icon={<XCircle size={20} />}
                    />
                </div>

                {/* Tabs & Content */}
                <div className='space-y-6'>
                    {/* Tab Navigation */}
                    <div className='flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-gray-100 shadow-sm w-fit'>
                        <TabButton
                            active={activeTab === "partner"}
                            onClick={() => setActiveTab("partner")}
                            icon={<UserCheck size={16} />}
                            count={partnerReviews?.length || 0}
                        >
                            Partner Reviews
                        </TabButton>
                        <TabButton
                            active={activeTab === "kyc"}
                            onClick={() => setActiveTab("kyc")}
                            icon={<Video size={16} />}
                            count={pendingkyc?.length || 0}
                        >
                            Video KYC
                        </TabButton>
                        <TabButton
                            active={activeTab === "vehicle"}
                            onClick={() => setActiveTab("vehicle")}
                            icon={<Car size={16} />}
                            count={vehicleReviews?.length || 0}
                        >
                            Vehicle Reviews
                        </TabButton>
                    </div>

                    {/* Active Queue Content */}
                    <div>
                        {activeTab === "partner" && (
                            <ContentList data={partnerReviews} type="partner" />
                        )}
                        {activeTab === "kyc" && (
                            <ContentList data={pendingkyc} type="kyc" />
                        )}
                        {activeTab === "vehicle" && (
                            <ContentList data={vehicleReviews} type="vehicle" />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}