import CheckOutContent from '@/components/CheckOutContent'
import React, { Suspense } from 'react'

export default function page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CheckOutContent />
        </Suspense>

    )
}

