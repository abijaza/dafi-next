'use client'

import { useEffect, useState } from 'react'

export default function TestLogin() {
  const [localStorageData, setLocalStorageData] = useState({})

  useEffect(() => {
    // Check localStorage
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    setLocalStorageData({
      hasToken: !!token,
      hasUser: !!user,
      tokenPreview: token ? token.substring(0, 50) + '...' : 'none',
      userData: user ? JSON.parse(user) : null
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Login Debug Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">LocalStorage Status</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(localStorageData, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="space-y-4">
            <button 
              onClick={() => {
                localStorage.clear()
                window.location.reload()
              }}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Clear LocalStorage
            </button>
            
            <button 
              onClick={() => window.location.href = '/login'}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ml-4"
            >
              Go to Login Page
            </button>
            
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-4"
            >
              Go to Home
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Test Login Credentials</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Admin:</strong> admin@pesantren.sch.id / admin123</p>
            <p><strong>Kepala Kepengasuhan:</strong> kepala@pesantren.sch.id / kepala123</p>
            <p><strong>Wali Kamar:</strong> walikamar@pesantren.sch.id / wali123</p>
            <p><strong>Wali Santri:</strong> walisantri@pesantren.sch.id / walisantri123</p>
          </div>
        </div>
      </div>
    </div>
  )
}