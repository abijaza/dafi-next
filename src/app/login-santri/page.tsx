'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Users, UserCheck, LogIn, Home } from 'lucide-react'

export default function LoginSantriPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Santri login state
  const [santriForm, setSantriForm] = useState({
    nis: '',
    password: ''
  })
  const [showSantriPassword, setShowSantriPassword] = useState(false)
  
  // Wali Santri login state
  const [waliForm, setWaliForm] = useState({
    email: '',
    password: ''
  })
  const [showWaliPassword, setShowWaliPassword] = useState(false)

  const handleSantriLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/santri/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(santriForm)
      })

      const data = await response.json()

      if (response.ok) {
        // Simpan data ke localStorage
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('token', data.token || 'santri-token')
        
        setSuccess('Login berhasil! Mengalihkan ke dashboard...')
        setTimeout(() => {
          router.push('/dashboard/santri')
        }, 1500)
      } else {
        setError(data.message || 'Login gagal')
      }
    } catch (error) {
      setError('Terjadi kesalahan server. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleWaliLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/wali-santri/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(waliForm)
      })

      const data = await response.json()

      if (response.ok) {
        // Simpan data ke localStorage
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('token', data.token || 'wali-santri-token')
        
        setSuccess('Login berhasil! Mengalihkan ke dashboard...')
        setTimeout(() => {
          router.push('/dashboard/wali-santri')
        }, 1500)
      } else {
        setError(data.message || 'Login gagal')
      }
    } catch (error) {
      setError('Terjadi kesalahan server. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <Home className="mr-2 h-4 w-4" />
            Kembali ke Beranda
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Portal Login Santri
          </h1>
          <p className="text-gray-600">
            DAFI Pesantren Al Quran Science Sidoarjo
          </p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Selamat Datang</CardTitle>
            <CardDescription className="text-center">
              Pilih jenis login untuk melanjutkan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="santri" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="santri" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Santri
                </TabsTrigger>
                <TabsTrigger value="wali-santri" className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Wali Santri
                </TabsTrigger>
              </TabsList>

              {/* Santri Login */}
              <TabsContent value="santri" className="space-y-4">
                <form onSubmit={handleSantriLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nis">NIS</Label>
                    <Input
                      id="nis"
                      type="text"
                      placeholder="Masukkan NIS"
                      value={santriForm.nis}
                      onChange={(e) => setSantriForm(prev => ({ ...prev, nis: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="santri-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="santri-password"
                        type={showSantriPassword ? 'text' : 'password'}
                        placeholder="Masukkan password"
                        value={santriForm.password}
                        onChange={(e) => setSantriForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowSantriPassword(!showSantriPassword)}
                      >
                        {showSantriPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Default password: <span className="font-mono bg-gray-100 px-1 rounded">santri123</span>
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Memproses...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <LogIn className="h-4 w-4" />
                        Login sebagai Santri
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Wali Santri Login */}
              <TabsContent value="wali-santri" className="space-y-4">
                <form onSubmit={handleWaliLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Username atau Email</Label>
                    <Input
                      id="email"
                      type="text"
                      placeholder="Masukkan username (NIP) atau email"
                      value={waliForm.email}
                      onChange={(e) => setWaliForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Anda bisa login menggunakan NIP atau email yang terdaftar
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wali-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="wali-password"
                        type={showWaliPassword ? 'text' : 'password'}
                        placeholder="Masukkan password"
                        value={waliForm.password}
                        onChange={(e) => setWaliForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowWaliPassword(!showWaliPassword)}
                      >
                        {showWaliPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Default password: <span className="font-mono bg-gray-100 px-1 rounded">walisantri123</span>
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Memproses...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <LogIn className="h-4 w-4" />
                        Login sebagai Wali Santri
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Error/Success Messages */}
            {error && (
              <Alert className="mt-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mt-4 border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            {/* Admin Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Login sebagai admin?{' '}
                <Link href="/login" className="text-blue-600 hover:underline">
                  Klik di sini
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>&copy; 2025 DAFI Pesantren Al Quran Science Sidoarjo</p>
          <p className="mt-1">
            Website:{' '}
            <a 
              href="https://www.dafi.sch.id/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              www.dafi.sch.id
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}