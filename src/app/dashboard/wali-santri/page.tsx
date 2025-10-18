'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
  Calendar,
  Eye
} from 'lucide-react'

interface WaliSantriData {
  id: string
  nip: string
  nama: string
  email: string
  role: string
  santriList: Array<{
    id: string
    nis: string
    nama: string
    email: string | null
    noHp: string | null
    status: string
    kamar?: {
      nama: string
      gedung: {
        nama: string
      }
    }
  }>
}

export default function WaliSantriDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<WaliSantriData | null>(null)
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
      if (parsedUser.role !== 'WALI_SANTRI') {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AKTIF':
        return <Badge className="bg-green-100 text-green-800">Aktif</Badge>
      case 'MUTASI_KELUAR':
        return <Badge className="bg-red-100 text-red-800">Mutasi Keluar</Badge>
      case 'LULUS':
        return <Badge className="bg-purple-100 text-purple-800">Lulus</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Tidak Aktif</Badge>
    }
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
              <Link href="/dashboard/wali-santri" className="flex items-center">
                <Home className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Portal Wali Santri</h1>
                  <p className="text-sm text-gray-500">DAFI Pesantren Al Quran Science</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.nama}</p>
                <p className="text-xs text-gray-500">Wali Santri</p>
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
            Ini adalah dashboard Anda untuk memantau perkembangan santri yang menjadi tanggung jawab Anda.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Santri</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.santriList.length}</div>
              <p className="text-xs text-muted-foreground">Santri yang dipantau</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Santri Aktif</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {user.santriList.filter(s => s.status === 'AKTIF').length}
              </div>
              <p className="text-xs text-muted-foreground">Sedang aktif</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mutasi Keluar</CardTitle>
              <Users className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {user.santriList.filter(s => s.status === 'MUTASI_KELUAR').length}
              </div>
              <p className="text-xs text-muted-foreground">Mutasi keluar</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lulus</CardTitle>
              <Award className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {user.santriList.filter(s => s.status === 'LULUS').length}
              </div>
              <p className="text-xs text-muted-foreground">Telah lulus</p>
            </CardContent>
          </Card>
        </div>

        {/* Profile Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profil Wali Santri
            </CardTitle>
            <CardDescription>
              Informasi pribadi dan kontak
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">NIP</h4>
                <p className="font-semibold">{user.nip}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Nama Lengkap</h4>
                <p className="font-semibold">{user.nama}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Email</h4>
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <p className="font-semibold">{user.email}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Santri List */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Daftar Santri
            </CardTitle>
            <CardDescription>
              Santri yang menjadi tanggung jawab Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.santriList.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>NIS</TableHead>
                      <TableHead>Nama Lengkap</TableHead>
                      <TableHead>Kamar</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.santriList.map((santri) => (
                      <TableRow key={santri.id}>
                        <TableCell className="font-medium">{santri.nis}</TableCell>
                        <TableCell className="font-medium">{santri.nama}</TableCell>
                        <TableCell>
                          {santri.kamar ? `${santri.kamar.gedung.nama} - ${santri.kamar.nama}` : '-'}
                        </TableCell>
                        <TableCell>{getStatusBadge(santri.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada santri yang ditugaskan kepada Anda</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-green-600" />
                Nilai Santri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Pantau nilai akademik santri
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
                Laporan Perkembangan
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
                Hubungi pengasuh atau admin
              </p>
              <Button variant="outline" className="w-full">
                Kirim Pesan
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
                Jadwal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Lihat jadwal kegiatan santri
              </p>
              <Button variant="outline" className="w-full">
                Lihat Jadwal
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Announcements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Pengumuman untuk Wali Santri
            </CardTitle>
            <CardDescription>
              Informasi penting untuk wali santri
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 rounded-full p-2">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-green-900">Pemantauan Perkembangan Santri</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Pantau perkembangan akademik dan keagamaan santri secara berkala melalui portal ini. Jangan ragu untuk berkomunikasi dengan pengasuh jika ada concerns.
                    </p>
                    <p className="text-xs text-green-600 mt-2">Posted: {new Date().toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-full p-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900">Komunikasi Terbuka</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Jaga komunikasi yang baik dengan pengasuh untuk mendukung perkembangan santri. Portal ini tersedia 24/7 untuk kebutuhan komunikasi.
                    </p>
                    <p className="text-xs text-blue-600 mt-2">Posted: {new Date().toLocaleDateString('id-ID')}</p>
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