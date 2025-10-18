'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  Home, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle,
  UserCheck,
  Award,
  FileText,
  BarChart3
} from 'lucide-react'

interface Periode {
  id: string
  tahunAjaran: string
  semester: string
  midSemester: string
  isActive: boolean
}

interface Santri {
  id: string
  nis: string
  nama: string
  status: string
  kamar?: {
    nama: string
    gedung: { nama: string }
  }
  waliSantri?: {
    nama: string
    email: string
  }
  _count: {
    nilai: number
    rapor: number
  }
}

interface Pegawai {
  id: string
  nama: string
  nip: string
  role: string
  _count: {
    waliKamarHistories: number
    santriWali: number
  }
}

interface Kamar {
  id: string
  nama: string
  gedung: { nama: string }
  kapasitas: number
  _count: {
    santri: number
  }
}

interface NilaiSummary {
  totalSantri: number
  rataRataNilai: number
  predikatA: number
  predikatB: number
  predikatC: number
  predikatD: number
}

export default function KepalaKepengasuhanDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [periodeList, setPeriodeList] = useState<Periode[]>([])
  const [santriList, setSantriList] = useState<Santri[]>([])
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([])
  const [kamarList, setKamarList] = useState<Kamar[]>([])
  const [selectedPeriode, setSelectedPeriode] = useState<string>('')
  const [nilaiSummary, setNilaiSummary] = useState<NilaiSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [selectedPeriode])

  useEffect(() => {
    if (selectedPeriode) {
      fetchNilaiSummary()
    }
  }, [selectedPeriode])

  const fetchData = async () => {
    try {
      const [periodeRes, santriRes, pegawaiRes, kamarRes] = await Promise.all([
        fetch('/api/periode'),
        fetch('/api/santri'),
        fetch('/api/pegawai'),
        fetch('/api/kamar')
      ])

      if (periodeRes.ok) {
        const periodeData = await periodeRes.json()
        setPeriodeList(periodeData)
        const activePeriode = periodeData.find((p: Periode) => p.isActive)
        if (activePeriode) {
          setSelectedPeriode(activePeriode.id)
        }
      }

      if (santriRes.ok) {
        const santriData = await santriRes.json()
        setSantriList(santriData)
      }

      if (pegawaiRes.ok) {
        const pegawaiData = await pegawaiRes.json()
        setPegawaiList(pegawaiData)
      }

      if (kamarRes.ok) {
        const kamarData = await kamarRes.json()
        setKamarList(kamarData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchNilaiSummary = async () => {
    if (!selectedPeriode) return

    try {
      const response = await fetch(`/api/nilai/summary?periodeId=${selectedPeriode}`)
      if (response.ok) {
        const data = await response.json()
        setNilaiSummary(data)
      }
    } catch (error) {
      console.error('Error fetching nilai summary:', error)
    }
  }

  const activePeriode = periodeList.find(p => p.id === selectedPeriode)
  const totalSantri = santriList.length
  const santriAktif = santriList.filter(s => s.status === 'AKTIF').length
  const waliKamarList = pegawaiList.filter(p => p.role === 'WALI_KAMAR')
  const waliSantriList = pegawaiList.filter(p => p.role === 'WALI_SANTRI')
  const totalKamar = kamarList.length
  const kamarPenuh = kamarList.filter(k => k._count.santri >= k.kapasitas).length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AKTIF': return 'bg-green-100 text-green-800'
      case 'TIDAK_AKTIF': return 'bg-red-100 text-red-800'
      case 'LULUS': return 'bg-blue-100 text-blue-800'
      case 'KELUAR': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Kepala Kepengasuhan</h1>
        <p className="text-gray-600">Monitor dan kelola seluruh aspek kepengasuhan pesantren</p>
      </div>

      {/* Periode Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Periode Aktif
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedPeriode} onValueChange={setSelectedPeriode}>
            <SelectTrigger className="w-full md:w-96">
              <SelectValue placeholder="Pilih periode" />
            </SelectTrigger>
            <SelectContent>
              {periodeList.map((periode) => (
                <SelectItem key={periode.id} value={periode.id}>
                  {periode.tahunAjaran} - Semester {periode.semester} ({periode.midSemester === 'TENGAH' ? 'Tengah Semester' : 'Akhir Semester'}){periode.isActive && ' - Aktif'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="santri" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Santri
          </TabsTrigger>
          <TabsTrigger value="pegawai" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Pegawai
          </TabsTrigger>
          <TabsTrigger value="fasilitas" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Fasilitas
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Santri</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSantri}</div>
                <p className="text-xs text-muted-foreground">
                  {santriAktif} aktif
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wali Kamar</CardTitle>
                <Home className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{waliKamarList.length}</div>
                <p className="text-xs text-muted-foreground">
                  {waliKamarList.filter(w => w._count.waliKamarHistories > 0).length} bertugas
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wali Santri</CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{waliSantriList.length}</div>
                <p className="text-xs text-muted-foreground">
                  {waliSantriList.filter(w => w._count.santriWali > 0).length} bertugas
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kamar</CardTitle>
                <Home className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{totalKamar}</div>
                <p className="text-xs text-muted-foreground">
                  {kamarPenuh} penuh
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Perlu Perhatian
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {kamarPenuh > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Home className="h-4 w-4 text-red-600" />
                      <span>{kamarPenuh} kamar penuh</span>
                    </div>
                  )}
                  {santriList.filter(s => !s.waliSantri && s.status === 'AKTIF').length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <UserCheck className="h-4 w-4 text-red-600" />
                      <span>{santriList.filter(s => !s.waliSantri && s.status === 'AKTIF').length} santri tanpa wali</span>
                    </div>
                  )}
                  {waliKamarList.filter(w => w._count.waliKamarHistories === 0).length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-red-600" />
                      <span>{waliKamarList.filter(w => w._count.waliKamarHistories === 0).length} wali kamar belum bertugas</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Status Baik
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-green-600" />
                    <span>{santriAktif} santri aktif</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Home className="h-4 w-4 text-green-600" />
                    <span>{totalKamar - kamarPenuh} kamar tersedia</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <UserCheck className="h-4 w-4 text-green-600" />
                    <span>{waliSantriList.filter(w => w._count.santriWali > 0).length} wali santri bertugas</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Santri Tab */}
        <TabsContent value="santri" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Santri</CardTitle>
              <CardDescription>
                Menampilkan {totalSantri} santri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>NIS</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Kamar</TableHead>
                      <TableHead>Wali Santri</TableHead>
                      <TableHead>Nilai</TableHead>
                      <TableHead>Rapor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {santriList.map((santri) => (
                      <TableRow key={santri.id}>
                        <TableCell className="font-medium">{santri.nis}</TableCell>
                        <TableCell>{santri.nama}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(santri.status)}>
                            {santri.status === 'AKTIF' ? 'Aktif' : santri.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {santri.kamar ? (
                            <div>
                              <div className="font-medium">{santri.kamar.nama}</div>
                              <div className="text-sm text-gray-500">{santri.kamar.gedung.nama}</div>
                            </div>
                          ) : (
                            <span className="text-gray-500">Belum ditentukan</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {santri.waliSantri ? (
                            <div>
                              <div className="font-medium">{santri.waliSantri.nama}</div>
                              <div className="text-sm text-gray-500">{santri.waliSantri.email}</div>
                            </div>
                          ) : (
                            <span className="text-gray-500">Belum ditugaskan</span>
                          )}
                        </TableCell>
                        <TableCell>{santri._count.nilai}</TableCell>
                        <TableCell>{santri._count.rapor}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pegawai Tab */}
        <TabsContent value="pegawai" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Wali Kamar */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Wali Kamar</CardTitle>
                <CardDescription>{waliKamarList.length} wali kamar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {waliKamarList.map((pegawai) => (
                    <div key={pegawai.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{pegawai.nama}</div>
                        <div className="text-sm text-gray-500">{pegawai.nip}</div>
                      </div>
                      <div className="text-right">
                        <Badge className={pegawai._count.waliKamarHistories > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {pegawai._count.waliKamarHistories} tugas
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Wali Santri */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Wali Santri</CardTitle>
                <CardDescription>{waliSantriList.length} wali santri</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {waliSantriList.map((pegawai) => (
                    <div key={pegawai.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{pegawai.nama}</div>
                        <div className="text-sm text-gray-500">{pegawai.nip}</div>
                      </div>
                      <div className="text-right">
                        <Badge className={pegawai._count.santriWali > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {pegawai._count.santriWali} santri
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Fasilitas Tab */}
        <TabsContent value="fasilitas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Kamar</CardTitle>
              <CardDescription>
                Menampilkan {totalKamar} kamar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Kamar</TableHead>
                      <TableHead>Gedung</TableHead>
                      <TableHead>Kapasitas</TableHead>
                      <TableHead>Terisi</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kamarList.map((kamar) => {
                      const occupancyRate = (kamar._count.santri / kamar.kapasitas) * 100
                      const isFull = kamar._count.santri >= kamar.kapasitas
                      
                      return (
                        <TableRow key={kamar.id}>
                          <TableCell className="font-medium">{kamar.nama}</TableCell>
                          <TableCell>{kamar.gedung.nama}</TableCell>
                          <TableCell>{kamar.kapasitas}</TableCell>
                          <TableCell>{kamar._count.santri}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${isFull ? 'bg-red-600' : 'bg-green-600'}`}
                                  style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                                ></div>
                              </div>
                              <Badge className={isFull ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                                {isFull ? 'Penuh' : 'Tersedia'}
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}