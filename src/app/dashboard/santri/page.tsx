'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Home, 
  BookOpen, 
  Award, 
  FileText, 
  MessageSquare, 
  LogOut, 
  Users,
  Phone,
  Mail,
  MapPin,
  Calendar
} from 'lucide-react'

interface SantriData {
  id: string
  nis: string
  nama: string
  email: string | null
  role: string
  kamar?: {
    id: string
    nama: string
    gedung: {
      nama: string
    }
  }
  waliSantri?: {
    id: string
    nama: string
    email: string
    noHp: string
  }
}

export default function SantriDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<SantriData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login-santri')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role !== 'SANTRI') {
        router.push('/login-santri')
        return
      }
      setUser(parsedUser)
    } catch (error) {
      console.error('Error parsing user data:', error)
      router.push('/login-santri')
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/login-santri')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard/santri" className="flex items-center">
                <Home className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Portal Santri</h1>
                  <p className="text-sm text-gray-500">DAFI Pesantren Al Quran Science</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.nama}</p>
                <p className="text-xs text-gray-500">NIS: {user.nis}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Selamat Datang, {user.nama}! 👋
          </h2>
          <p className="text-gray-600">
            Ini adalah dashboard pribadi Anda untuk mengakses informasi dan layanan pesantren.
          </p>
        </div>

        {/* Profile Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profil Santri
            </CardTitle>
            <CardDescription>
              Informasi pribadi dan data santri
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">NIS</h4>
                <p className="font-semibold">{user.nis}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Nama Lengkap</h4>
                <p className="font-semibold">{user.nama}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Email</h4>
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <p className="font-semibold">{user.email || '-'}</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Kamar</h4>
                <div className="flex items-center gap-1">
                  <Home className="h-4 w-4 text-gray-400" />
                  <p className="font-semibold">
                    {user.kamar ? `${user.kamar.gedung.nama} - ${user.kamar.nama}` : '-'}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Wali Santri</h4>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-gray-400" />
                  <p className="font-semibold">{user.waliSantri?.nama || '-'}</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Kontak Wali</h4>
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <p className="font-semibold">{user.waliSantri?.noHp || '-'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-green-600" />
                Nilai & Prestasi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Lihat nilai akademik dan prestasi Anda
              </p>
              <Button variant="outline" className="w-full">
                Lihat Nilai
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-blue-600" />
                Laporan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Akses laporan perkembangan santri
              </p>
              <Button variant="outline" className="w-full">
                Lihat Laporan
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                Komunikasi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Hubungi wali santri atau pengasuh
              </p>
              <Button variant="outline" className="w-full">
                Kirim Pesan
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-orange-600" />
                Kegiatan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Jadwal dan informasi kegiatan
              </p>
              <Button variant="outline" className="w-full">
                Lihat Kegiatan
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Announcements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Pengumuman Terbaru
            </CardTitle>
            <CardDescription>
              Informasi penting untuk semua santri
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-full p-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900">Selamat Datang di Portal Santri</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Gunakan portal ini untuk mengakses informasi akademik, laporan perkembangan, dan berkomunikasi dengan wali santri.
                    </p>
                    <p className="text-xs text-blue-600 mt-2">Posted: {new Date().toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 rounded-full p-2">
                    <Award className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-green-900">Tips Belajar Efektif</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Jangan lupa untuk menjaga keseimbangan antara belajar formal dan kegiatan keagamaan. Manfaatkan waktu dengan sebaik-baiknya.
                    </p>
                    <p className="text-xs text-green-600 mt-2">Posted: {new Date().toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              &copy; 2025 DAFI Pesantren Al Quran Science Sidoarjo
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Website: <a href="https://www.dafi.sch.id/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.dafi.sch.id</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}