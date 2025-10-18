'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff, Home, Users, BookOpen, Heart } from 'lucide-react'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Store token and user data
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // Redirect based on role
        switch (data.user.role) {
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
          default:
            router.push('/dashboard')
        }
      } else {
        setError(data.message || 'Login gagal. Silakan coba lagi.')
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-red-600 p-3 rounded-full shadow-lg">
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

        {/* Login Card */}
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center text-gray-900">
              Masuk
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Silakan masuk dengan akun Anda untuk melanjutkan
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Username atau Email
                </Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="Masukkan username (NIP) atau email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500 h-11"
                  required
                />
                <p className="text-xs text-gray-500">
                  Anda bisa login menggunakan NIP atau email yang terdaftar
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="border-gray-300 focus:border-red-500 focus:ring-red-500 pr-10 h-11"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-6">
              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Masuk...
                  </>
                ) : (
                  'Masuk'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Login Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Informasi Login:</h3>
          <div className="space-y-1 text-xs text-blue-800">
            <p><strong>Admin:</strong> ADM001 / admin123</p>
            <p><strong>Wali Kamar:</strong> WK001 / pegawai123</p>
            <p><strong>Kepala Kepengasuhan:</strong> KK001 / pegawai123</p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <Users className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <p className="text-xs text-gray-600 font-medium">Manajemen Santri</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <BookOpen className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <p className="text-xs text-gray-600 font-medium">Input Nilai</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <Heart className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <p className="text-xs text-gray-600 font-medium">Pengasuhan</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>&copy; 2025 Sistem Pesantren DAFI. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}