'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Search, Plus, Eye, Edit, Trash2, Building, MapPin, DoorOpen } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface Gedung {
  id: string
  idGedung: string
  namaGedung: string
}

interface Kamar {
  id: string
  idKamar: string
  namaKamar: string
  gedungId: string
  gedung: Gedung
  kapasitas: number
  terisi: number
  createdAt: string
  updatedAt: string
}

export default function KamarManagement() {
  const { user } = useAuth()
  const [kamarList, setKamarList] = useState<Kamar[]>([])
  const [gedungList, setGedungList] = useState<Gedung[]>([])
  const [filteredKamar, setFilteredKamar] = useState<Kamar[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGedung, setFilterGedung] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedKamar, setSelectedKamar] = useState<Kamar | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState<Kamar | null>(null)
  const [addForm, setAddForm] = useState({ 
    nama: '', 
    gedungId: '', 
    kapasitas: 20 
  })

  useEffect(() => {
    // Fetch data from API
    fetchGedungData()
  }, [])

  useEffect(() => {
    // Fetch kamar data after gedung data is available
    if (gedungList.length > 0) {
      fetchKamarData()
    }
  }, [gedungList])

  // Refresh data when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !document.hidden) {
        fetchGedungData()
        fetchKamarData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const fetchGedungData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/gedung', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        // Transform data to match interface
        const transformedGedung: Gedung[] = data.map((g: any) => ({
          id: g.id,
          idGedung: `GDG${g.id.padStart(3, '0')}`,
          namaGedung: g.nama
        }))
        setGedungList(transformedGedung)
      }
    } catch (error) {
      console.error('Error fetching gedung:', error)
      // Fallback to mock data
      const mockGedung: Gedung[] = [
        { id: '1', idGedung: 'GDG001', namaGedung: 'Gedung Aisyah' },
        { id: '2', idGedung: 'GDG002', namaGedung: 'Gedung Fatimah' },
        { id: '3', idGedung: 'GDG003', namaGedung: 'Gedung Khadijah' },
        { id: '4', idGedung: 'GDG004', namaGedung: 'Gedung Belajar' },
        { id: '5', idGedung: 'GDG005', namaGedung: 'Gedung Administrasi' }
      ]
      setGedungList(mockGedung)
    }
  }

  const fetchKamarData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/kamar', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched kamar data:', data)
        // Transform data to match interface
        const transformedKamar: Kamar[] = data.map((k: any) => {
          const gedung = {
            id: k.gedung.id,
            idGedung: `GDG${k.gedung.id.padStart(3, '0')}`,
            namaGedung: k.gedung.nama
          }
          return {
            id: k.id,
            idKamar: `KMR${k.id.padStart(3, '0')}`,
            namaKamar: k.nama,
            gedungId: k.gedungId,
            gedung,
            kapasitas: k.kapasitas,
            terisi: k._count?.santri || 0,
            createdAt: k.createdAt,
            updatedAt: k.updatedAt
          }
        })
        setKamarList(transformedKamar)
        setFilteredKamar(transformedKamar)
      }
    } catch (error) {
      console.error('Error fetching kamar:', error)
      // Fallback to mock data
      const mockKamar: Kamar[] = [
        {
          id: '1',
          idKamar: 'KMR001',
          namaKamar: 'Kamar Aisyah 1',
          gedungId: '1',
          gedung: { id: '1', idGedung: 'GDG001', namaGedung: 'Gedung Aisyah' },
          kapasitas: 24,
          terisi: 20,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-15T00:00:00.000Z'
        },
        {
          id: '2',
          idKamar: 'KMR002',
          namaKamar: 'Kamar Aisyah 2',
          gedungId: '1',
          gedung: { id: '1', idGedung: 'GDG001', namaGedung: 'Gedung Aisyah' },
          kapasitas: 24,
          terisi: 22,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-15T00:00:00.000Z'
        },
        {
          id: '3',
          idKamar: 'KMR003',
          namaKamar: 'Kamar Fatimah 1',
          gedungId: '2',
          gedung: { id: '2', idGedung: 'GDG002', namaGedung: 'Gedung Fatimah' },
          kapasitas: 20,
          terisi: 18,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-15T00:00:00.000Z'
        },
        {
          id: '4',
          idKamar: 'KMR004',
          namaKamar: 'Kamar Fatimah 2',
          gedungId: '2',
          gedung: { id: '2', idGedung: 'GDG002', namaGedung: 'Gedung Fatimah' },
          kapasitas: 20,
          terisi: 15,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-15T00:00:00.000Z'
        },
        {
          id: '5',
          idKamar: 'KMR005',
          namaKamar: 'Kamar Khadijah 1',
          gedungId: '3',
          gedung: { id: '3', idGedung: 'GDG003', namaGedung: 'Gedung Khadijah' },
          kapasitas: 18,
          terisi: 12,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-15T00:00:00.000Z'
        },
        {
          id: '6',
          idKamar: 'KMR006',
          namaKamar: 'Kamar Khadijah 2',
          gedungId: '3',
          gedung: { id: '3', idGedung: 'GDG003', namaGedung: 'Gedung Khadijah' },
          kapasitas: 18,
          terisi: 16,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-15T00:00:00.000Z'
        }
      ]
      setKamarList(mockKamar)
      setFilteredKamar(mockKamar)
    }
  }

  useEffect(() => {
    let filtered = kamarList

    if (searchTerm) {
      filtered = filtered.filter(kamar =>
        kamar.namaKamar.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kamar.gedung.namaGedung.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterGedung !== 'all') {
      filtered = filtered.filter(kamar => kamar.gedungId === filterGedung)
    }

    setFilteredKamar(filtered)
  }, [kamarList, searchTerm, filterGedung])

  // Log untuk debugging
  useEffect(() => {
    console.log('Kamar list updated:', kamarList)
  }, [kamarList])

  const getOccupancyBadge = (terisi: number, kapasitas: number) => {
    const percentage = (terisi / kapasitas) * 100
    if (percentage >= 90) {
      return <Badge className="bg-red-100 text-red-800">Penuh ({terisi}/{kapasitas})</Badge>
    } else if (percentage >= 70) {
      return <Badge className="bg-yellow-100 text-yellow-800">Hampir Penuh ({terisi}/{kapasitas})</Badge>
    } else {
      return <Badge className="bg-green-100 text-green-800">Tersedia ({terisi}/{kapasitas})</Badge>
    }
  }

  // Handler functions
  const handleView = (kamar: Kamar) => {
    setSelectedKamar(kamar)
    setIsViewDialogOpen(true)
  }

  const handleEdit = async (kamar: Kamar) => {
    console.log('Editing kamar:', kamar)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/kamar/${kamar.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched kamar details for edit:', data)
        const transformedData = {
          id: data.id,
          idKamar: `KMR${data.id.padStart(3, '0')}`,
          namaKamar: data.nama,
          gedungId: data.gedungId,
          gedung: {
            id: data.gedung.id,
            idGedung: `GDG${data.gedung.id.padStart(3, '0')}`,
            namaGedung: data.gedung.nama
          },
          kapasitas: data.kapasitas,
          terisi: data._count?.santri || 0,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        }
        console.log('Transformed edit data:', transformedData)
        setEditForm(transformedData)
        setIsEditDialogOpen(true)
      } else {
        console.error('Failed to fetch kamar details')
        // Fallback to existing data
        setEditForm({...kamar})
        setIsEditDialogOpen(true)
      }
    } catch (error) {
      console.error('Error fetching kamar details:', error)
      // Fallback to existing data
      setEditForm({...kamar})
      setIsEditDialogOpen(true)
    }
  }

  const handleDelete = async (kamar: Kamar) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data kamar ${kamar.namaKamar}?`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/kamar/${kamar.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        // Refresh the data
        fetchKamarData()
      } else {
        const error = await response.json()
        alert(error.message || 'Gagal menghapus kamar')
      }
    } catch (error) {
      console.error('Error deleting kamar:', error)
      alert('Terjadi kesalahan server')
    }
  }

  const handleSaveEdit = async () => {
    if (!editForm || !editForm.namaKamar.trim()) {
      alert('Nama kamar harus diisi!')
      return
    }

    console.log('Saving edit form:', editForm)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/kamar/${editForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nama: editForm.namaKamar,
          kapasitas: editForm.kapasitas,
          gedungId: editForm.gedungId
        })
      })
      
      console.log('Update response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('Kamar updated successfully:', result)
        // Refresh the data
        await fetchKamarData()
        setIsEditDialogOpen(false)
        setEditForm(null)
        alert('Kamar berhasil diperbarui!')
      } else {
        const error = await response.json()
        console.error('Update failed:', error)
        alert(error.message || 'Gagal memperbarui kamar')
      }
    } catch (error) {
      console.error('Error updating kamar:', error)
      alert('Terjadi kesalahan server')
    }
  }

  const handleAddKamar = async () => {
    if (!addForm.nama.trim()) {
      alert('Nama kamar harus diisi!')
      return
    }

    if (!addForm.gedungId) {
      alert('Gedung harus dipilih!')
      return
    }

    if (addForm.kapasitas <= 0) {
      alert('Kapasitas harus lebih dari 0!')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/kamar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          gedungId: addForm.gedungId,
          nama: addForm.nama,
          kapasitas: addForm.kapasitas,
          deskripsi: `Kamar ${addForm.nama} di gedung ${gedungList.find(g => g.id === addForm.gedungId)?.namaGedung}`
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Kamar added successfully:', result)
        // Refresh the data
        await fetchKamarData()
        setIsAddDialogOpen(false)
        // Reset form
        setAddForm({ 
          nama: '', 
          gedungId: '', 
          kapasitas: 20 
        })
        alert('Kamar berhasil ditambahkan!')
      } else {
        const error = await response.json()
        console.error('Failed to add kamar:', error)
        alert(error.message || 'Gagal menambah kamar')
        // Fallback to mock add function
        const selectedGedung = gedungList.find(g => g.id === addForm.gedungId) || gedungList[0]
        const newKamar: Kamar = {
          id: Date.now().toString(),
          idKamar: `KMR${String(kamarList.length + 1).padStart(3, '0')}`,
          namaKamar: addForm.nama,
          gedungId: addForm.gedungId,
          gedung: selectedGedung,
          kapasitas: addForm.kapasitas,
          terisi: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setKamarList([newKamar, ...kamarList])
        setIsAddDialogOpen(false)
        setAddForm({ 
          nama: '', 
          gedungId: '', 
          kapasitas: 20 
        })
      }
    } catch (error) {
      console.error('Error adding kamar:', error)
      alert('Terjadi kesalahan server')
      // Fallback to mock add function
      const selectedGedung = gedungList.find(g => g.id === addForm.gedungId) || gedungList[0]
      const newKamar: Kamar = {
        id: Date.now().toString(),
        idKamar: `KMR${String(kamarList.length + 1).padStart(3, '0')}`,
        namaKamar: addForm.nama,
        gedungId: addForm.gedungId,
        gedung: selectedGedung,
        kapasitas: addForm.kapasitas,
        terisi: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setKamarList([newKamar, ...kamarList])
      setIsAddDialogOpen(false)
      setAddForm({ 
        nama: '', 
        gedungId: '', 
        kapasitas: 20 
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Master Data Kamar</h1>
          <p className="text-muted-foreground">Kelola data kamar pesantren</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Kamar
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tambah Kamar Baru</DialogTitle>
              <DialogDescription>
                Tambahkan kamar baru ke sistem
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="idKamar">ID Kamar</Label>
                <Input id="idKamar" placeholder="KMR001" disabled />
                <p className="text-xs text-muted-foreground">Akan dibuat otomatis</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="namaKamar">Nama Kamar</Label>
                <Input 
                  id="namaKamar" 
                  placeholder="Masukkan nama kamar" 
                  value={addForm.nama}
                  onChange={(e) => setAddForm(prev => ({ ...prev, nama: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gedung">Gedung</Label>
                <Select value={addForm.gedungId} onValueChange={(value) => setAddForm(prev => ({ ...prev, gedungId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih gedung" />
                  </SelectTrigger>
                  <SelectContent>
                    {gedungList.map((gedung) => (
                      <SelectItem key={gedung.id} value={gedung.id}>
                        {gedung.namaGedung} ({gedung.idGedung})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="kapasitas">Kapasitas</Label>
                <Input 
                  id="kapasitas" 
                  type="number" 
                  placeholder="Masukkan kapasitas" 
                  value={addForm.kapasitas}
                  onChange={(e) => setAddForm(prev => ({ ...prev, kapasitas: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleAddKamar}>
                Simpan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kamar</CardTitle>
            <DoorOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kamarList.length}</div>
            <p className="text-xs text-muted-foreground">Kamar terdaftar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kapasitas</CardTitle>
            <Building className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {kamarList.reduce((total, kamar) => total + kamar.kapasitas, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Tempat tidur</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terisi</CardTitle>
            <MapPin className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {kamarList.reduce((total, kamar) => total + kamar.terisi, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Santri aktif</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tersedia</CardTitle>
            <DoorOpen className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {kamarList.reduce((total, kamar) => total + (kamar.kapasitas - kamar.terisi), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Kosong</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filter Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Pencarian</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Cari Nama Kamar atau Gedung..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gedung">Filter Gedung</Label>
              <Select value={filterGedung} onValueChange={setFilterGedung}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih gedung" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Gedung</SelectItem>
                  {gedungList.map((gedung) => (
                    <SelectItem key={gedung.id} value={gedung.id}>
                      {gedung.namaGedung}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kamar</CardTitle>
          <CardDescription>
            Menampilkan {filteredKamar.length} dari {kamarList.length} kamar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Kamar</TableHead>
                  <TableHead>Gedung</TableHead>
                  <TableHead>Kapasitas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal Dibuat</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKamar.map((kamar) => (
                  <TableRow key={kamar.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DoorOpen className="h-4 w-4 text-muted-foreground" />
                        {kamar.namaKamar}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3 text-muted-foreground" />
                        {kamar.gedung.namaGedung}
                      </div>
                    </TableCell>
                    <TableCell>{kamar.kapasitas} orang</TableCell>
                    <TableCell>{getOccupancyBadge(kamar.terisi, kamar.kapasitas)}</TableCell>
                    <TableCell>
                      {new Date(kamar.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(kamar)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(kamar)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(kamar)}
                          className="text-red-600 hover:text-red-700"
                          disabled={kamar.terisi > 0}
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
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detail Kamar</DialogTitle>
            <DialogDescription>
              Informasi lengkap mengenai kamar
            </DialogDescription>
          </DialogHeader>
          {selectedKamar && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">ID Kamar</Label>
                  <p className="text-sm text-muted-foreground">{selectedKamar.idKamar}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Nama Kamar</Label>
                  <p className="text-sm text-muted-foreground">{selectedKamar.namaKamar}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Gedung</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedKamar.gedung.namaGedung} ({selectedKamar.gedung.idGedung})
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Kapasitas</Label>
                  <p className="text-sm text-muted-foreground">{selectedKamar.kapasitas} orang</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Terisi</Label>
                  <p className="text-sm text-muted-foreground">{selectedKamar.terisi} orang</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tersedia</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedKamar.kapasitas - selectedKamar.terisi} orang
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Tanggal Dibuat</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedKamar.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Terakhir Diupdate</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedKamar.updatedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={() => setIsViewDialogOpen(false)}>
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Kamar</DialogTitle>
            <DialogDescription>
              Perbarui informasi kamar
            </DialogDescription>
          </DialogHeader>
          {editForm && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-idKamar">ID Kamar</Label>
                <Input
                  id="edit-idKamar"
                  value={editForm.idKamar}
                  disabled
                />
                <p className="text-xs text-muted-foreground">ID Kamar tidak dapat diubah</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-namaKamar">Nama Kamar</Label>
                <Input
                  id="edit-namaKamar"
                  value={editForm.namaKamar}
                  onChange={(e) => setEditForm({...editForm, namaKamar: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-gedung">Gedung</Label>
                <Select value={editForm.gedungId} onValueChange={(value) => {
                  const selectedGedung = gedungList.find(g => g.id === value)
                  if (selectedGedung) {
                    setEditForm({...editForm, gedungId: value, gedung: selectedGedung})
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {gedungList.map((gedung) => (
                      <SelectItem key={gedung.id} value={gedung.id}>
                        {gedung.namaGedung} ({gedung.idGedung})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-kapasitas">Kapasitas</Label>
                <Input
                  id="edit-kapasitas"
                  type="number"
                  value={editForm.kapasitas}
                  onChange={(e) => setEditForm({...editForm, kapasitas: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveEdit}>
              Simpan Perubahan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}