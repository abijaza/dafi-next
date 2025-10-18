'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Home, Users, BookOpen, Heart, User } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check if user is logged in
        const token = localStorage.getItem('token')
        const user = localStorage.getItem('user')
        
        console.log('Checking auth:', { token: !!token, user: !!user })
        
        if (token && user) {
          const userData = JSON.parse(user)
          console.log('User data:', userData)
          setRedirecting(true)
          // Redirect based on role
          switch (userData.role) {
            case 'ADMIN':
              router.push('/dashboard/admin')
              break
            case 'KEPALA_KEPENGASUHAN':
              router.push('/dashboard/kepengasuhan')
              break
            case 'WALI_KAMAR':
              router.push('/dashboard/wali-kamar')
              break
            case 'WALI_SANTRI':
              router.push('/dashboard/wali-santri')
              break
            case 'SANTRI':
              router.push('/dashboard/santri')
              break
            default:
              router.push('/login')
          }
        } else {
          console.log('No auth found, redirecting to login')
          setRedirecting(true)
          router.push('/login')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setRedirecting(true)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    // Add a small delay to ensure localStorage is available
    const timer = setTimeout(checkAuth, 100)
    
    return () => clearTimeout(timer)
  }, [router])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4">
        <div className="relative w-24 h-24 md:w-32 md:h-32">
          <img
            src="/logo.svg"
            alt="Z.ai Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (redirecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4">
        <div className="relative w-24 h-24 md:w-32 md:h-32">
          <img
            src="/logo.svg"
            alt="Z.ai Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  // Fallback UI (should not normally be visible)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-red-600 p-3 rounded-full">
              <Home className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sistem Pesantren
          </h1>
          <p className="text-gray-600">
            Portal Manajemen Pesantren Modern
          </p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-gray-900">
              Selamat Datang
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Sistem Manajemen Pesantren Modern
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Button 
              onClick={() => router.push('/login')}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Login Admin/Staf
            </Button>
            <Button 
              onClick={() => router.push('/login-santri')}
              variant="outline"
              className="w-full border-green-600 text-green-600 hover:bg-green-50 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Login Santri/Wali Santri
            </Button>
          </CardContent>
        </Card>

        <div className="mt-8 grid grid-cols-4 gap-4 text-center">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <Users className="h-6 w-6 text-red-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Manajemen Santri</p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <BookOpen className="h-6 w-6 text-red-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Input Nilai</p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <Heart className="h-6 w-6 text-red-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Pengasuhan</p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <User className="h-6 w-6 text-green-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Portal Santri</p>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>&copy; 2025 Sistem Pesantren. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}