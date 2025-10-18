'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Users, Home, UserCheck, Calendar, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Periode {
  id: string
  tahunAjaran: string
  semester: string
  midSemester: string
  isActive: boolean
}

interface Pegawai {
  id: string
  nama: string
  nip: string
  email: string
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
  _count: { santri: number }
}

interface WaliKamarAssignment {
  id: string
  pegawai: Pegawai
  kamar: Kamar
  periode: Periode
  createdAt: string
}

interface Santri {
  id: string
  nis: string
  nama: string
  status: string
  waliSantri?: Pegawai
}

export default function PenugasanManagement() {
  const [activeTab, setActiveTab] = useState('wali-kamar')
  const [periodeList, setPeriodeList] = useState<Periode[]>([])
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([])
  const [kamarList, setKamarList] = useState<Kamar[]>([])
  const [santriList, setSantriList] = useState<Santri[]>([])
  const [waliKamarAssignments, setWaliKamarAssignments] = useState<WaliKamarAssignment[]>([])
  const [selectedPeriode, setSelectedPeriode] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isWaliSantriDialogOpen, setIsWaliSantriDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    pegawaiId: '',
    kamarId: '',
    periodeId: ''
  })
  const [waliSantriFormData, setWaliSantriFormData] = useState({
    santriId: '',
    pegawaiId: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedPeriode) {
      fetchWaliKamarAssignments()
    }
  }, [selectedPeriode])

  const fetchData = async () => {
    try {
      const [periodeRes, pegawaiRes, kamarRes, santriRes] = await Promise.all([
        fetch('/api/periode'),
        fetch('/api/pegawai'),
        fetch('/api/kamar'),
        fetch('/api/santri')
      ])

      if (periodeRes.ok) {
        const periodeData = await periodeRes.json()
        setPeriodeList(periodeData)
        const activePeriode = periodeData.find((p: Periode) => p.isActive)
        if (activePeriode) {
          setSelectedPeriode(activePeriode.id)
        }
      }

      if (pegawaiRes.ok) {
        const pegawaiData = await pegawaiRes.json()
        setPegawaiList(pegawaiData)
      }

      if (kamarRes.ok) {
        const kamarData = await kamarRes.json()
        setKamarList(kamarData)
      }

      if (santriRes.ok) {
        const santriData = await santriRes.json()
        setSantriList(santriData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Gagal memuat data')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchWaliKamarAssignments = async () => {
    try {
      const response = await fetch(`/api/wali-kamar?periodeId=${selectedPeriode}`)
      if (response.ok) {
        const data = await response.json()
        setWaliKamarAssignments(data)
      }
    } catch (error) {
      console.error('Error fetching wali kamar assignments:', error)
    }
  }

  const handleWaliKamarSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/wali-kamar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Penugasan Wali Kamar berhasil')
        setIsDialogOpen(false)
        resetForm()
        fetchWaliKamarAssignments()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Gagal menugaskan Wali Kamar')
      }
    } catch (error) {
      console.error('Error assigning wali kamar:', error)
      toast.error('Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
  }

  const handleWaliSantriSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/wali-santri', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(waliSantriFormData),
      })

      if (response.ok) {
        toast.success('Penugasan Wali Santri berhasil')
        setIsWaliSantriDialogOpen(false)
        resetWaliSantriForm()
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Gagal menugaskan Wali Santri')
      }
    } catch (error) {
      console.error('Error assigning wali santri:', error)
      toast.error('Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteWaliKamar = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus penugasan ini?')) return

    try {
      const response = await fetch(`/api/wali-kamar/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Penugasan berhasil dihapus')
        fetchWaliKamarAssignments()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Gagal menghapus penugasan')
      }
    } catch (error) {
      console.error('Error deleting wali kamar assignment:', error)
      toast.error('Terjadi kesalahan')
    }
  }

  const handleDeleteWaliSantri = async (santriId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus penugasan Wali Santri ini?')) return

    try {
      const response = await fetch(`/api/wali-santri/${santriId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Penugasan Wali Santri berhasil dihapus')
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Gagal menghapus penugasan')
      }
    } catch (error) {
      console.error('Error deleting wali santri assignment:', error)
      toast.error('Terjadi kesalahan')
    }
  }

  const resetForm = () => {
    setFormData({
      pegawaiId: '',
      kamarId: '',
      periodeId: selectedPeriode
    })
  }

  const resetWaliSantriForm = () => {
    setWaliSantriFormData({
      santriId: '',
      pegawaiId: ''
    })
  }

  const waliKamarCandidates = pegawaiList.filter(p => p.role === 'WALI_KAMAR')
  const waliSantriCandidates = pegawaiList.filter(p => p.role === 'WALI_SANTRI')
  const santriWithoutWali = santriList.filter(s => !s.waliSantri && s.status === 'AKTIF')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Penugasan</h1>
        <p className="text-gray-600">Kelola penugasan Wali Kamar dan Wali Santri</p>
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="wali-kamar" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Wali Kamar
          </TabsTrigger>
          <TabsTrigger value="wali-santri" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Wali Santri
          </TabsTrigger>
        </TabsList>

        {/* Wali Kamar Tab */}
        <TabsContent value="wali-kamar" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Penugasan Wali Kamar</h2>
              <p className="text-gray-600">Kelola penugasan Wali Kamar per periode</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => resetForm()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tugaskan Wali Kamar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tugaskan Wali Kamar</DialogTitle>
                  <DialogDescription>
                    Pilih pegawai dan kamar untuk ditugaskan pada periode ini
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleWaliKamarSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Wali Kamar</label>
                    <Select value={formData.pegawaiId} onValueChange={(value) => setFormData(prev => ({ ...prev, pegawaiId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Wali Kamar" />
                      </SelectTrigger>
                      <SelectContent>
                        {waliKamarCandidates.map((pegawai) => (
                          <SelectItem key={pegawai.id} value={pegawai.id}>
                            {pegawai.nama} ({pegawai.nip}) - {pegawai._count.waliKamarHistories} tugas
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Kamar</label>
                    <Select value={formData.kamarId} onValueChange={(value) => setFormData(prev => ({ ...prev, kamarId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kamar" />
                      </SelectTrigger>
                      <SelectContent>
                        {kamarList.map((kamar) => (
                          <SelectItem key={kamar.id} value={kamar.id}>
                            {kamar.gedung.nama} - {kamar.nama} ({kamar._count.santri}/{kamar.kapasitas})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Periode</label>
                    <Select value={formData.periodeId} onValueChange={(value) => setFormData(prev => ({ ...prev, periodeId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih periode" />
                      </SelectTrigger>
                      <SelectContent>
                        {periodeList.map((periode) => (
                          <SelectItem key={periode.id} value={periode.id}>
                            {periode.tahunAjaran} - Semester {periode.semester} ({periode.midSemester === 'TENGAH' ? 'Tengah Semester' : 'Akhir Semester'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Batal
                    </Button>
                    <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={isLoading}>
                      {isLoading ? 'Menyimpan...' : 'Tugaskan'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Wali Kamar</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{waliKamarCandidates.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sudah Ditugaskan</CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{waliKamarAssignments.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Kamar</CardTitle>
                <Home className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{kamarList.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Assignments Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Penugasan Wali Kamar</CardTitle>
              <CardDescription>
                Periode: {periodeList.find(p => p.id === selectedPeriode)?.tahunAjaran} - Semester {periodeList.find(p => p.id === selectedPeriode)?.semester}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {waliKamarAssignments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p>Belum ada penugasan Wali Kamar untuk periode ini</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Wali Kamar</TableHead>
                        <TableHead>NIP</TableHead>
                        <TableHead>Kamar</TableHead>
                        <TableHead>Gedung</TableHead>
                        <TableHead>Kapasitas</TableHead>
                        <TableHead>Terisi</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {waliKamarAssignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell className="font-medium">{assignment.pegawai.nama}</TableCell>
                          <TableCell>{assignment.pegawai.nip}</TableCell>
                          <TableCell>{assignment.kamar.nama}</TableCell>
                          <TableCell>{assignment.kamar.gedung.nama}</TableCell>
                          <TableCell>{assignment.kamar.kapasitas}</TableCell>
                          <TableCell>
                            <Badge variant={assignment.kamar._count.santri >= assignment.kamar.kapasitas ? "destructive" : "default"}>
                              {assignment.kamar._count.santri}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteWaliKamar(assignment.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Hapus
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wali Santri Tab */}
        <TabsContent value="wali-santri" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Penugasan Wali Santri</h2>
              <p className="text-gray-600">Kelola penugasan Wali Santri untuk setiap santri</p>
            </div>
            <Dialog open={isWaliSantriDialogOpen} onOpenChange={setIsWaliSantriDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => resetWaliSantriForm()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tugaskan Wali Santri
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tugaskan Wali Santri</DialogTitle>
                  <DialogDescription>
                    Pilih santri dan Wali Santri untuk ditugaskan
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleWaliSantriSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Santri</label>
                    <Select value={waliSantriFormData.santriId} onValueChange={(value) => setWaliSantriFormData(prev => ({ ...prev, santriId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih santri" />
                      </SelectTrigger>
                      <SelectContent>
                        {santriWithoutWali.map((santri) => (
                          <SelectItem key={santri.id} value={santri.id}>
                            {santri.nama} ({santri.nis})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Wali Santri</label>
                    <Select value={waliSantriFormData.pegawaiId} onValueChange={(value) => setWaliSantriFormData(prev => ({ ...prev, pegawaiId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Wali Santri" />
                      </SelectTrigger>
                      <SelectContent>
                        {waliSantriCandidates.map((pegawai) => (
                          <SelectItem key={pegawai.id} value={pegawai.id}>
                            {pegawai.nama} ({pegawai.nip}) - {pegawai._count.santriWali} santri
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsWaliSantriDialogOpen(false)}>
                      Batal
                    </Button>
                    <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={isLoading}>
                      {isLoading ? 'Menyimpan...' : 'Tugaskan'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Wali Santri</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{waliSantriCandidates.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Santri Aktif</CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {santriList.filter(s => s.status === 'AKTIF').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Belum Punya Wali</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{santriWithoutWali.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Santri Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Santri dan Wali Santri</CardTitle>
              <CardDescription>
                Menampilkan {santriList.length} santri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>NIS</TableHead>
                      <TableHead>Nama Santri</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Wali Santri</TableHead>
                      <TableHead>Email Wali</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {santriList.map((santri) => (
                      <TableRow key={santri.id}>
                        <TableCell className="font-medium">{santri.nis}</TableCell>
                        <TableCell>{santri.nama}</TableCell>
                        <TableCell>
                          <Badge className={santri.status === 'AKTIF' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {santri.status === 'AKTIF' ? 'Aktif' : santri.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {santri.waliSantri ? (
                            <div>
                              <div className="font-medium">{santri.waliSantri.nama}</div>
                              <div className="text-sm text-gray-500">{santri.waliSantri.nip}</div>
                            </div>
                          ) : (
                            <span className="text-gray-500">Belum ditugaskan</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {santri.waliSantri?.email || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {santri.waliSantri && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteWaliSantri(santri.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Hapus
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
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