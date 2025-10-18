'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Users, 
  Home, 
  Calendar, 
  AlertCircle, 
  CheckCircle,
  FileText,
  MessageSquare,
  Plus,
  Edit,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'

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
  noHp: string
  alamat: string
  namaOrtu: string
  noHpOrtu: string
  waliSantri?: {
    nama: string
    email: string
    noHp: string
  }
  _count: {
    nilai: number
    rapor: number
  }
}

interface Kamar {
  id: string
  nama: string
  gedung: { nama: string }
  kapasitas: number
  deskripsi: string
  _count: {
    santri: number
  }
}

interface Catatan {
  id: string
  santriId: string
  judul: string
  isi: string
  tipe: 'CATATAN_BAIK' | 'CATATAN_PERINGATAN' | 'CATATAN_PENTING'
  createdAt: string
  updatedAt: string
  santri: Santri
}

export default function WaliKamarDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [periodeList, setPeriodeList] = useState<Periode[]>([])
  const [santriList, setSantriList] = useState<Santri[]>([])
  const [kamarList, setKamarList] = useState<Kamar[]>([])
  const [catatanList, setCatatanList] = useState<Catatan[]>([])
  const [selectedPeriode, setSelectedPeriode] = useState<string>('')
  const [assignedKamar, setAssignedKamar] = useState<Kamar | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCatatan, setEditingCatatan] = useState<Catatan | null>(null)
  const [formData, setFormData] = useState({
    santriId: '',
    judul: '',
    isi: '',
    tipe: 'CATATAN_BAIK' as const
  })

  useEffect(() => {
    fetchData()
  }, [selectedPeriode])

  const fetchData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      
      const [periodeRes, kamarRes] = await Promise.all([
        fetch('/api/periode'),
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

      if (kamarRes.ok) {
        const kamarData = await kamarRes.json()
        setKamarList(kamarData)
      }

      // Get assigned kamar for current wali kamar
      if (user.id && activePeriode) {
        const assignmentRes = await fetch(`/api/wali-kamar?pegawaiId=${user.id}&periodeId=${activePeriode.id}`)
        if (assignmentRes.ok) {
          const assignments = await assignmentRes.json()
          if (assignments.length > 0) {
            const kamar = assignments[0].kamar
            setAssignedKamar(kamar)
            
            // Get santri in this kamar
            const santriRes = await fetch(`/api/santri?kamarId=${kamar.id}`)
            if (santriRes.ok) {
              const santriData = await santriRes.json()
              setSantriList(santriData)
            }

            // Get catatan for santri in this kamar
            const catatanRes = await fetch(`/api/catatan?kamarId=${kamar.id}`)
            if (catatanRes.ok) {
              const catatanData = await catatanRes.json()
              setCatatanList(catatanData)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCatatanSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = editingCatatan ? `/api/catatan/${editingCatatan.id}` : '/api/catatan'
      const method = editingCatatan ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(editingCatatan ? 'Catatan berhasil diperbarui' : 'Catatan berhasil ditambahkan')
        setIsDialogOpen(false)
        resetForm()
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Gagal menyimpan catatan')
      }
    } catch (error) {
      console.error('Error saving catatan:', error)
      toast.error('Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditCatatan = (catatan: Catatan) => {
    setEditingCatatan(catatan)
    setFormData({
      santriId: catatan.santriId,
      judul: catatan.judul,
      isi: catatan.isi,
      tipe: catatan.tipe as any
    })
    setIsDialogOpen(true)
  }

  const handleDeleteCatatan = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus catatan ini?')) return

    try {
      const response = await fetch(`/api/catatan/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Catatan berhasil dihapus')
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Gagal menghapus catatan')
      }
    } catch (error) {
      console.error('Error deleting catatan:', error)
      toast.error('Terjadi kesalahan')
    }
  }

  const resetForm = () => {
    setFormData({
      santriId: '',
      judul: '',
      isi: '',
      tipe: 'CATATAN_BAIK'
    })
    setEditingCatatan(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AKTIF': return 'bg-green-100 text-green-800'
      case 'TIDAK_AKTIF': return 'bg-red-100 text-red-800'
      case 'LULUS': return 'bg-blue-100 text-blue-800'
      case 'KELUAR': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCatatanColor = (tipe: string) => {
    switch (tipe) {
      case 'CATATAN_BAIK': return 'bg-green-100 text-green-800'
      case 'CATATAN_PERINGATAN': return 'bg-red-100 text-red-800'
      case 'CATATAN_PENTING': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCatatanText = (tipe: string) => {
    switch (tipe) {
      case 'CATATAN_BAIK': return 'Catatan Baik'
      case 'CATATAN_PERINGATAN': return 'Peringatan'
      case 'CATATAN_PENTING': return 'Penting'
      default: return tipe
    }
  }

  const activePeriode = periodeList.find(p => p.id === selectedPeriode)
  const totalSantri = santriList.length
  const santriAktif = santriList.filter(s => s.status === 'AKTIF').length
  const santriTanpaWali = santriList.filter(s => !s.waliSantri && s.status === 'AKTIF').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Wali Kamar</h1>
        <p className="text-gray-600">Kelola santri dan monitoring kamar</p>
      </div>

      {/* Assigned Kamar Info */}
      {assignedKamar ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Home className="h-5 w-5" />
              Kamar yang Dikelola
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Nama Kamar</Label>
                <p className="text-lg font-semibold">{assignedKamar.nama}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Gedung</Label>
                <p className="text-lg font-semibold">{assignedKamar.gedung.nama}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Kapasitas</Label>
                <p className="text-lg font-semibold">{assignedKamar._count.santri}/{assignedKamar.kapasitas}</p>
              </div>
            </div>
            {assignedKamar.deskripsi && (
              <div className="mt-4">
                <Label className="text-sm font-medium text-gray-500">Deskripsi</Label>
                <p className="text-sm text-gray-600">{assignedKamar.deskripsi}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Anda belum ditugaskan ke kamar manapun</p>
            <p className="text-sm text-gray-400">Hubungi admin untuk penugasan kamar</p>
          </CardContent>
        </Card>
      )}

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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="santri" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Data Santri
          </TabsTrigger>
          <TabsTrigger value="catatan" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Catatan
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                <CardTitle className="text-sm font-medium">Kamar Penuh</CardTitle>
                <Home className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {assignedKamar && assignedKamar._count.santri >= assignedKamar.kapasitas ? 'Penuh' : 'Tersedia'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {assignedKamar ? `${assignedKamar._count.santri}/${assignedKamar.kapasitas}` : '-'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tanpa Wali</CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{santriTanpaWali}</div>
                <p className="text-xs text-muted-foreground">
                  Perlu penugasan
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Catatan</CardTitle>
                <MessageSquare className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{catatanList.length}</div>
                <p className="text-xs text-muted-foreground">
                  Total catatan
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Catatan */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Catatan Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              {catatanList.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p>Belum ada catatan</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {catatanList.slice(0, 5).map((catatan) => (
                    <div key={catatan.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{catatan.judul}</h4>
                          <p className="text-sm text-gray-500">
                            {catatan.santri.nama} - {new Date(catatan.createdAt).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <Badge className={getCatatanColor(catatan.tipe)}>
                          {getCatatanText(catatan.tipe)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{catatan.isi}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Santri Tab */}
        <TabsContent value="santri" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Santri Kamar</CardTitle>
              <CardDescription>
                Menampilkan {totalSantri} santri di kamar {assignedKamar?.nama}
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
                      <TableHead>No. HP</TableHead>
                      <TableHead>Orang Tua</TableHead>
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
                        <TableCell>{santri.noHp}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{santri.namaOrtu}</div>
                            <div className="text-sm text-gray-500">{santri.noHpOrtu}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {santri.waliSantri ? (
                            <div>
                              <div className="font-medium">{santri.waliSantri.nama}</div>
                              <div className="text-sm text-gray-500">{santri.waliSantri.email}</div>
                            </div>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Belum ada
                            </Badge>
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

        {/* Catatan Tab */}
        <TabsContent value="catatan" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Catatan Santri</h2>
              <p className="text-gray-600">Kelola catatan perkembangan santri</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => resetForm()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Catatan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCatatan ? 'Edit Catatan' : 'Tambah Catatan Baru'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCatatan ? 'Perbarui catatan yang ada' : 'Tambahkan catatan baru untuk santri'}
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleCatatanSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="santriId">Santri</Label>
                    <Select value={formData.santriId} onValueChange={(value) => setFormData(prev => ({ ...prev, santriId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih santri" />
                      </SelectTrigger>
                      <SelectContent>
                        {santriList.map((santri) => (
                          <SelectItem key={santri.id} value={santri.id}>
                            {santri.nama} ({santri.nis})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="judul">Judul Catatan</Label>
                    <Input
                      id="judul"
                      value={formData.judul}
                      onChange={(e) => setFormData(prev => ({ ...prev, judul: e.target.value }))}
                      placeholder="Masukkan judul catatan"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipe">Tipe Catatan</Label>
                    <Select value={formData.tipe} onValueChange={(value: any) => setFormData(prev => ({ ...prev, tipe: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CATATAN_BAIK">Catatan Baik</SelectItem>
                        <SelectItem value="CATATAN_PENTING">Catatan Penting</SelectItem>
                        <SelectItem value="CATATAN_PERINGATAN">Peringatan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="isi">Isi Catatan</Label>
                    <Textarea
                      id="isi"
                      value={formData.isi}
                      onChange={(e) => setFormData(prev => ({ ...prev, isi: e.target.value }))}
                      placeholder="Masukkan isi catatan"
                      rows={4}
                      required
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Batal
                    </Button>
                    <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={isLoading}>
                      {isLoading ? 'Menyimpan...' : (editingCatatan ? 'Perbarui' : 'Simpan')}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daftar Catatan</CardTitle>
              <CardDescription>
                Menampilkan {catatanList.length} catatan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {catatanList.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p>Belum ada catatan</p>
                  <Button 
                    onClick={() => setIsDialogOpen(true)}
                    className="mt-4 bg-red-600 hover:bg-red-700"
                  >
                    Tambah Catatan Pertama
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {catatanList.map((catatan) => (
                    <div key={catatan.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{catatan.judul}</h4>
                          <p className="text-sm text-gray-500">
                            {catatan.santri.nama} ({catatan.santri.nis}) - {new Date(catatan.createdAt).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getCatatanColor(catatan.tipe)}>
                            {getCatatanText(catatan.tipe)}
                          </Badge>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCatatan(catatan)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCatatan(catatan.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{catatan.isi}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}