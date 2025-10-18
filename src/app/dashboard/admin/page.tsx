'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Building, 
  Calendar, 
  BookOpen, 
  UserCheck, 
  Award,
  TrendingUp,
  Activity
} from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSantri: 0,
    totalPegawai: 0,
    totalGedung: 0,
    totalKamar: 0,
    activePeriode: null
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const responses = await Promise.all([
        fetch('/api/santri/count'),
        fetch('/api/pegawai/count'),
        fetch('/api/gedung/count'),
        fetch('/api/kamar/count'),
        fetch('/api/periode/active')
      ])

      const [santriRes, pegawaiRes, gedungRes, kamarRes, periodeRes] = responses
      
      const data = {
        totalSantri: santriRes.ok ? await santriRes.json() : 0,
        totalPegawai: pegawaiRes.ok ? await pegawaiRes.json() : 0,
        totalGedung: gedungRes.ok ? await gedungRes.json() : 0,
        totalKamar: kamarRes.ok ? await kamarRes.json() : 0,
        activePeriode: periodeRes.ok ? await periodeRes.json() : null
      }

      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-600">Selamat datang di panel administrasi sistem</p>
      </div>

      {/* Active Periode Badge */}
      {stats.activePeriode && (
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-100 text-green-800">
            Periode Aktif: {stats.activePeriode.tahunAjaran} - Semester {stats.activePeriode.semester} ({stats.activePeriode.midSemester === 'TENGAH' ? 'Tengah Semester' : 'Akhir Semester'})
          </Badge>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Santri
            </CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalSantri}</div>
            <p className="text-xs text-gray-500">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +2 dari bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Pegawai
            </CardTitle>
            <UserCheck className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalPegawai}</div>
            <p className="text-xs text-gray-500">
              <Activity className="inline h-3 w-3 mr-1" />
              Semua aktif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Gedung
            </CardTitle>
            <Building className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalGedung}</div>
            <p className="text-xs text-gray-500">
              <Building className="inline h-3 w-3 mr-1" />
              {stats.totalKamar} kamar tersedia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Kamar
            </CardTitle>
            <Building className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalKamar}</div>
            <p className="text-xs text-gray-500">
              <Activity className="inline h-3 w-3 mr-1" />
              Kapasitas rata-rata 20
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Aksi Cepat
            </CardTitle>
            <CardDescription className="text-gray-600">
              Tindakan yang sering dilakukan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start bg-red-600 hover:bg-red-700 text-white"
              onClick={() => window.location.href = '/dashboard/admin/santri'}
            >
              <Users className="mr-2 h-4 w-4" />
              Kelola Santri
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => window.location.href = '/dashboard/admin/periode'}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Kelola Periode
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => window.location.href = '/dashboard/admin/nilai'}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Input Nilai
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Aktivitas Terkini
            </CardTitle>
            <CardDescription className="text-gray-600">
              Aktivitas sistem terbaru
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Periode 2025/2026 Ganjil diaktifkan</p>
                  <p className="text-xs text-gray-500">2 jam yang lalu</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">5 santri baru ditambahkan</p>
                  <p className="text-xs text-gray-500">5 jam yang lalu</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Kamar B1 ditambahkan</p>
                  <p className="text-xs text-gray-500">1 hari yang lalu</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Status Sistem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Database</p>
                <p className="text-xs text-gray-500">Online</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">API Server</p>
                <p className="text-xs text-gray-500">Online</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Backup</p>
                <p className="text-xs text-gray-500">Terakhir: Hari ini</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}