'use client'
import React, { useState, useRef } from 'react'
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

export default function Page() {
  const { userData } = useSelector((state: RootState) => state.user)
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false)
  const [joined, setJoined] = useState(false)
  const startCall = async () => {
    if (!containerRef) {
      return null
    }
    setLoading(true)

    const displayName = userData?.role == "admin" ? "Admin" : `${userData?.name} (${userData?.email})`
    try {
      const appId = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID)
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appId,
        serverSecret!,
        // roomId?.toString()!,
        "dffdgf",
        userData?._id.toString()!,
        // displayName
        "Akash"
      )

      const zp = ZegoUIKitPrebuilt.create(kitToken)
      zp.joinRoom({
        container: containerRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall, // To implement 1-on-1 calls, modify the parameter here to [ZegoUIKitPrebuilt.OneONoneCall].
        },
        showPreJoinView: false
      });
      setJoined(true)
      setLoading(false)
    } catch (error) {
      console.log(error)
    }
  }
  return (<div ref={containerRef} className='h-screen'>
    <button onClick={startCall}>click</button>


  </div>

  )
}
