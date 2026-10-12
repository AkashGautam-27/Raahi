'use client'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setUserData } from '@/redux/userSlice'

function useGetMe(enabled: boolean) {
    const dispatch = useDispatch()

    useEffect(() => {
        if (!enabled) {
            return
        }
        const getMe = async () => {
            try {
                const { data } = await axios.get("/api/user/me")
                dispatch(setUserData(data))
            } catch (error) {
                console.error("Failed to fetch user:", error)
            }
        }
        getMe()
    }, [enabled, dispatch])
}

export default useGetMe
