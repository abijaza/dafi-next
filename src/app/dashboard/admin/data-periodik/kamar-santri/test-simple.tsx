'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function TestSimple() {
  const [isSelectMode, setIsSelectMode] = useState(false)
  
  const toggleSelectMode = () => {
    console.log('Toggle called')
    setIsSelectMode(!isSelectMode)
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test Simple Component</h1>
      <Button onClick={toggleSelectMode}>
        {isSelectMode ? 'Selesai' : 'Pilih'}
      </Button>
      <p className="mt-4">Mode: {isSelectMode.toString()}</p>
    </div>
  )
}