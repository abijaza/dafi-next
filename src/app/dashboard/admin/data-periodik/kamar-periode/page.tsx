'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2,
  Building,
  User,
  Users
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface Periode {
  id: string
  tahunAjaran: string
  semester: string
  midSemester: string
  isActive: boolean
}

interface Gedung {
  id: string
  nama: string
  deskripsi: string | null
}

interface Kamar {
  id: string
  nama: string
  kapasitas: number
  deskripsi: string | null
  gedung: Gedung
}

interface Pegawai {
  id: string
  nama: string
  nip: string
  role: string
  roles: string[]
  isAdmin: boolean
  isWaliKamar: boolean
  isKepalaKepengasuhan: boolean
  isWaliSantri: boolean
  isStafTU: boolean
}

interface KamarPeriode {
  id: string
  periode: Periode
  kamar: Kamar
  gedung: Gedung
  waliKamar: Pegawai | null
  createdAt: string
}

export default function KamarPeriodeManagement() {
  const { user } = useAuth()
  const [periodes, setPeriodes] = useState<Periode[]>([])
  const [kamars, setKamars] = useState<Kamar[]>([])
  const [pegawais, setPegawais] = useState<Pegawai[]>([])
  const [kamarPeriodes, setKamarPeriodes] = useState<KamarPeriode[]>([])
  const [selectedPeriode, setSelectedPeriode] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingKamarPeriode, setEditingKamarPeriode] = useState<KamarPeriode | null>(null)
  const [formData, setFormData] = useState({
    kamarId: '',
    waliKamarId: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    fetchInitialData()
  }, [router])

  useEffect(() => {
    if (selectedPeriode) {
      fetchKamarPeriodes()
    }
  }, [selectedPeriode])

  // Auto-sync active periode like other data periodik pages
  useEffect(() => {
    if (!selectedPeriode) return

    const checkActivePeriode = async () => {
      try {
        const response = await fetch('/api/periode/active')
        if (response.ok) {
          const activePeriode = await response.json()
          if (activePeriode && activePeriode.id !== selectedPeriode) {
            setSelectedPeriode(activePeriode.id)
            setSuccess('活动周期已自动更新')
            setTimeout(() => setSuccess(''), 3000)
          }
        }
      } catch (error) {
        console.error('Error checking active periode:', error)
      }
    }

    // Check immediately
    checkActivePeriode()
    
    // Set up polling every 5 seconds
    const interval = setInterval(checkActivePeriode, 5000)
    
    return () => clearInterval(interval)
  }, [selectedPeriode])

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      const [periodesRes, kamarsRes, pegawaisRes] = await Promise.all([
        fetch('/api/periode', { headers }),
        fetch('/api/kamar', { headers }),
        fetch('/api/pegawai?role=WALI_KAMAR', { headers }) // Add role parameter
      ])

      if (periodesRes.ok) {
        const periodesData = await periodesRes.json()
        setPeriodes(periodesData)
        if (periodesData.length > 0) {
          // Prioritize active periode, fallback to first periode
          const activePeriode = periodesData.find(p => p.isActive)
          setSelectedPeriode(activePeriode ? activePeriode.id : periodesData[0].id)
        }
      }

      if (kamarsRes.ok) {
        const kamarsData = await kamarsRes.json()
        setKamars(kamarsData)
      }

      if (pegawaisRes.ok) {
        const pegawaisData = await pegawaisRes.json()
        setPegawais(pegawaisData) // API already filtered by role
      } else {
        console.error('Failed to fetch pegawai with role, trying fallback...')
        // Fallback: fetch all pegawai and filter manually
        const fallbackRes = await fetch('/api/pegawai', { headers })
        if (fallbackRes.ok) {
          const allPegawai = await fallbackRes.json()
          const waliKamarData = allPegawai.filter((p: any) => 
            p.roles && p.roles.includes('WALI_KAMAR')
          )
          setPegawais(waliKamarData)
        } else {
          console.error('Failed to fetch pegawai:', fallbackRes.status, fallbackRes.statusText)
        }
      }
    } catch (error) {
      console.error('Error fetching initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchKamarPeriodes = async () => {
    try {
      const response = await fetch(`/api/kamar-periode?periodeId=${selectedPeriode}`)
      if (response.ok) {
        const data = await response.json()
        setKamarPeriodes(data)
      }
    } catch (error) {
      console.error('Error fetching kamar periodes:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const url = editingKamarPeriode ? `/api/kamar-periode/${editingKamarPeriode.id}` : '/api/kamar-periode'
      const method = editingKamarPeriode ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          periodeId: selectedPeriode
        })
      })

      if (response.ok) {
        setSuccess(editingKamarPeriode ? 'Kamar periode berhasil diperbarui' : 'Kamar periode berhasil dibuat')
        setDialogOpen(false)
        setEditingKamarPeriode(null)
        setFormData({ kamarId: '', waliKamarId: '' })
        fetchKamarPeriodes()
      } else {
        const data = await response.json()
        setError(data.message || 'Terjadi kesalahan')
      }
    } catch (error) {
      setError('Terjadi kesalahan server')
    }
  }

  const handleEdit = (kamarPeriode: KamarPeriode) => {
    setEditingKamarPeriode(kamarPeriode)
    setFormData({
      kamarId: kamarPeriode.kamar.id,
      waliKamarId: kamarPeriode.waliKamar?.id || ''
    })
    setDialogOpen(true)
  }

  const handleDelete = async (kamarPeriode: KamarPeriode) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kamar periode ini?')) return

    try {
      const response = await fetch(`/api/kamar-periode/${kamarPeriode.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        setSuccess('Kamar periode berhasil dihapus')
        fetchKamarPeriodes()
      } else {
        const data = await response.json()
        setError(data.message || 'Terjadi kesalahan')
      }
    } catch (error) {
      setError('Terjadi kesalahan server')
    }
  }

  const selectedKamar = kamars.find(k => k.id === formData.kamarId)
  const availableKamars = selectedPeriode ? kamars.filter(kamar => 
    !kamarPeriodes.some(kp => kp.kamar.id === kamar.id && kp.periode.id === selectedPeriode)
  ) : kamars

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pengaturan Kamar Periode</h1>
          <p className="text-muted-foreground">Kelola kamar berdasarkan periode akademik</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!selectedPeriode}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Kamar Periode
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingKamarPeriode ? 'Edit Kamar Periode' : 'Tambah Kamar Periode Baru'}
              </DialogTitle>
              <DialogDescription>
                {editingKamarPeriode ? 'Edit informasi kamar periode' : 'Buat kamar periode baru'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="kamarId">Kamar</Label>
                  <Select value={formData.kamarId} onValueChange={(value) => setFormData(prev => ({ ...prev, kamarId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kamar" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableKamars.map((kamar) => (
                        <SelectItem key={kamar.id} value={kamar.id}>
                          {kamar.nama} (Kapasitas: {kamar.kapasitas}) - Gedung: {kamar.gedung.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="waliKamarId">Wali Kamar</Label>
                  <Select value={formData.waliKamarId} onValueChange={(value) => setFormData(prev => ({ ...prev, waliKamarId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih wali kamar (opsional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {pegawais.length === 0 ? (
                        <div className="px-2 py-1 text-sm text-muted-foreground">
                          Tidak ada wali kamar tersedia
                        </div>
                      ) : (
                        pegawais.map((pegawai) => (
                          <SelectItem key={pegawai.id} value={pegawai.id}>
                            {pegawai.nama} ({pegawai.nip})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {error && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="mb-4 border-green-200 bg-green-50">
                  <AlertDescription className="text-green-700">
                    {success}
                  </AlertDescription>
                </Alert>
              )}
              <DialogFooter>
                <Button type="submit">
                  {editingKamarPeriode ? 'Update' : 'Buat'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Periode Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Pilih Periode</CardTitle>
          <CardDescription>
            Periode aktif akan otomatis dipilih. Anda dapat mengubah periode secara manual jika diperlukan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedPeriode} onValueChange={setSelectedPeriode}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih periode" />
            </SelectTrigger>
            <SelectContent>
              {periodes.map((periode) => (
                <SelectItem key={periode.id} value={periode.id}>
                  {periode.tahunAjaran} - {periode.semester} - {periode.midSemester}
                  {periode.isActive && <Badge className="ml-2 bg-green-100 text-green-800">Aktif</Badge>}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kamar Periode</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kamarPeriodes.length}</div>
            <p className="text-xs text-muted-foreground">Kamar periode terdaftar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dengan Wali Kamar</CardTitle>
            <User className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {kamarPeriodes.filter(kp => kp.waliKamar).length}
            </div>
            <p className="text-xs text-muted-foreground">Sudah memiliki wali kamar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kapasitas</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {kamarPeriodes.reduce((total, kp) => total + kp.kamar.kapasitas, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total kapasitas kamar</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-700">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kamar Periode</CardTitle>
          <CardDescription>
            Kelola kamar yang tersedia untuk periode terpilih
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Memuat data...</p>
            </div>
          ) : !selectedPeriode ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Pilih periode terlebih dahulu</p>
            </div>
          ) : kamarPeriodes.length === 0 ? (
            <div className="text-center py-8">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Belum ada kamar periode yang dibuat</p>
              <p className="text-sm text-muted-foreground">Buat kamar periode baru untuk memulai</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Kamar</TableHead>
                    <TableHead>Gedung</TableHead>
                    <TableHead>Kapasitas</TableHead>
                    <TableHead>Wali Kamar</TableHead>
                    <TableHead>Dibuat</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kamarPeriodes.map((kamarPeriode) => (
                    <TableRow key={kamarPeriode.id}>
                      <TableCell className="font-medium">{kamarPeriode.kamar.nama}</TableCell>
                      <TableCell>{kamarPeriode.gedung.nama}</TableCell>
                      <TableCell>{kamarPeriode.kamar.kapasitas}</TableCell>
                      <TableCell>
                        {kamarPeriode.waliKamar ? (
                          <div>
                            <div className="font-medium">{kamarPeriode.waliKamar.nama}</div>
                            <div className="text-sm text-muted-foreground">{kamarPeriode.waliKamar.nip}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">Belum ada wali kamar</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(kamarPeriode.createdAt).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(kamarPeriode)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(kamarPeriode)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}