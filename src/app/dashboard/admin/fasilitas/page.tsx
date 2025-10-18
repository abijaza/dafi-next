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
import { Textarea } from '@/components/ui/textarea'
import { Search, Plus, Eye, Edit, Trash2, Building, MapPin, Calendar, Filter, Wrench, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface Fasilitas {
  id: string
  name: string
  kategori: 'gedung' | 'kamar' | 'kelas' | 'perpustakaan' | 'musholla' | 'kantin' | 'olahraga' | 'lainnya'
  lokasi: string
  kapasitas?: number
  status: 'baik' | 'rusak_ringan' | 'rusak_berat' | 'perbaikan'
  keterangan: string
  terakhirInspeksi: string
  penanggungJawab: string
}

export default function FasilitasManagement() {
  const { user } = useAuth()
  const [fasilitasList, setFasilitasList] = useState<Fasilitas[]>([])
  const [filteredFasilitas, setFilteredFasilitas] = useState<Fasilitas[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterKategori, setFilterKategori] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedFasilitas, setSelectedFasilitas] = useState<Fasilitas | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState<Fasilitas | null>(null)

  useEffect(() => {
    // Mock data for demonstration
    const mockFasilitas: Fasilitas[] = [
      {
        id: '1',
        name: 'Gedung Aisyah',
        kategori: 'gedung',
        lokasi: 'Area Utama',
        kapasitas: 200,
        status: 'baik',
        keterangan: 'Gedung asrama putri dengan 3 lantai',
        terakhirInspeksi: '2025-01-10',
        penanggungJawab: 'Ustadz Ahmad'
      },
      {
        id: '2',
        name: 'Kamar Aisyah 1',
        kategori: 'kamar',
        lokasi: 'Gedung Aisyah Lt. 1',
        kapasitas: 24,
        status: 'baik',
        keterangan: 'Kamar dengan 24 tempat tidur',
        terakhirInspeksi: '2025-01-15',
        penanggungJawab: 'Ustadzah Fatimah'
      },
      {
        id: '3',
        name: 'Kelas VII-A',
        kategori: 'kelas',
        lokasi: 'Gedung Belajar Lt. 1',
        kapasitas: 30,
        status: 'rusak_ringan',
        keterangan: 'Beberapa kursi perlu perbaikan',
        terakhirInspeksi: '2025-01-14',
        penanggungJawab: 'Ustadz Bakri'
      },
      {
        id: '4',
        name: 'Perpustakaan Utama',
        kategori: 'perpustakaan',
        lokasi: 'Gedung Belajar Lt. 2',
        kapasitas: 50,
        status: 'baik',
        keterangan: 'Koleksi 5000+ buku',
        terakhirInspeksi: '2025-01-12',
        penanggungJawab: 'Ustadzah Aisyah'
      },
      {
        id: '5',
        name: 'Musholla Al-Hikmah',
        kategori: 'musholla',
        lokasi: 'Area Tengah',
        kapasitas: 300,
        status: 'baik',
        keterangan: 'Musholla utama pesantren',
        terakhirInspeksi: '2025-01-15',
        penanggungJawab: 'Ustadz Muhammad'
      },
      {
        id: '6',
        name: 'Lapangan Olahraga',
        kategori: 'olahraga',
        lokasi: 'Area Belakang',
        kapasitas: 100,
        status: 'perbaikan',
        keterangan: 'Sedang renovasi pagar',
        terakhirInspeksi: '2025-01-13',
        penanggungJawab: 'Ustadz Rahman'
      },
      {
        id: '7',
        name: 'Kantin Pesantren',
        kategori: 'kantin',
        lokasi: 'Area Depan',
        kapasitas: 40,
        status: 'baik',
        keterangan: 'Menyediakan makanan dan minuman',
        terakhirInspeksi: '2025-01-15',
        penanggungJawab: 'Ustadzah Khadijah'
      },
      {
        id: '8',
        name: 'Gedung Belajar',
        kategori: 'gedung',
        lokasi: 'Area Tengah',
        kapasitas: 150,
        status: 'rusak_berat',
        keterangan: 'Atap bocor di beberapa ruangan',
        terakhirInspeksi: '2025-01-14',
        penanggungJawab: 'Ustadz Ahmad'
      }
    ]
    setFasilitasList(mockFasilitas)
    setFilteredFasilitas(mockFasilitas)
  }, [])

  useEffect(() => {
    let filtered = fasilitasList

    if (searchTerm) {
      filtered = filtered.filter(fasilitas =>
        fasilitas.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fasilitas.lokasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fasilitas.penanggungJawab.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterKategori !== 'all') {
      filtered = filtered.filter(fasilitas => fasilitas.kategori === filterKategori)
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(fasilitas => fasilitas.status === filterStatus)
    }

    setFilteredFasilitas(filtered)
  }, [fasilitasList, searchTerm, filterKategori, filterStatus])

  const getKategoriBadge = (kategori: string) => {
    switch (kategori) {
      case 'gedung':
        return <Badge className="bg-blue-100 text-blue-800">Gedung</Badge>
      case 'kamar':
        return <Badge className="bg-green-100 text-green-800">Kamar</Badge>
      case 'kelas':
        return <Badge className="bg-purple-100 text-purple-800">Kelas</Badge>
      case 'perpustakaan':
        return <Badge className="bg-orange-100 text-orange-800">Perpustakaan</Badge>
      case 'musholla':
        return <Badge className="bg-teal-100 text-teal-800">Musholla</Badge>
      case 'kantin':
        return <Badge className="bg-yellow-100 text-yellow-800">Kantin</Badge>
      case 'olahraga':
        return <Badge className="bg-indigo-100 text-indigo-800">Olahraga</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Lainnya</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'baik':
        return <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Baik
        </Badge>
      case 'rusak_ringan':
        return <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Rusak Ringan
        </Badge>
      case 'rusak_berat':
        return <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Rusak Berat
        </Badge>
      case 'perbaikan':
        return <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
          <Wrench className="h-3 w-3" />
          Perbaikan
        </Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const kategoriOptions = [
    { value: 'all', label: 'Semua Kategori' },
    { value: 'gedung', label: 'Gedung' },
    { value: 'kamar', label: 'Kamar' },
    { value: 'kelas', label: 'Kelas' },
    { value: 'perpustakaan', label: 'Perpustakaan' },
    { value: 'musholla', label: 'Musholla' },
    { value: 'kantin', label: 'Kantin' },
    { value: 'olahraga', label: 'Olahraga' },
    { value: 'lainnya', label: 'Lainnya' }
  ]

  const statusOptions = [
    { value: 'all', label: 'Semua Status' },
    { value: 'baik', label: 'Baik' },
    { value: 'rusak_ringan', label: 'Rusak Ringan' },
    { value: 'rusak_berat', label: 'Rusak Berat' },
    { value: 'perbaikan', label: 'Perbaikan' }
  ]

  // Handler functions
  const handleView = (fasilitas: Fasilitas) => {
    setSelectedFasilitas(fasilitas)
    setIsViewDialogOpen(true)
  }

  const handleEdit = (fasilitas: Fasilitas) => {
    setEditForm({...fasilitas})
    setIsEditDialogOpen(true)
  }

  const handleDelete = (fasilitas: Fasilitas) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data fasilitas ${fasilitas.name}?`)) {
      setFasilitasList(fasilitasList.filter(f => f.id !== fasilitas.id))
    }
  }

  const handleSaveEdit = () => {
    if (editForm) {
      setFasilitasList(fasilitasList.map(f => f.id === editForm.id ? editForm : f))
      setIsEditDialogOpen(false)
      setEditForm(null)
    }
  }

  const handleAddFasilitas = () => {
    // Mock add function
    const newFasilitas: Fasilitas = {
      id: Date.now().toString(),
      name: 'Fasilitas Baru',
      kategori: 'lainnya',
      lokasi: 'Lokasi Baru',
      kapasitas: 50,
      status: 'baik',
      keterangan: 'Fasilitas baru ditambahkan',
      terakhirInspeksi: new Date().toISOString().split('T')[0],
      penanggungJawab: user?.name || 'Unknown'
    }
    setFasilitasList([newFasilitas, ...fasilitasList])
    setIsAddDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Data Fasilitas</h1>
          <p className="text-muted-foreground">Kelola dan pantau kondisi fasilitas pesantren</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Fasilitas
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tambah Fasilitas Baru</DialogTitle>
              <DialogDescription>
                Tambahkan fasilitas baru ke sistem
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nama Fasilitas</Label>
                <Input id="name" placeholder="Masukkan nama fasilitas" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="kategori">Kategori</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gedung">Gedung</SelectItem>
                    <SelectItem value="kamar">Kamar</SelectItem>
                    <SelectItem value="kelas">Kelas</SelectItem>
                    <SelectItem value="perpustakaan">Perpustakaan</SelectItem>
                    <SelectItem value="musholla">Musholla</SelectItem>
                    <SelectItem value="kantin">Kantin</SelectItem>
                    <SelectItem value="olahraga">Olahraga</SelectItem>
                    <SelectItem value="lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lokasi">Lokasi</Label>
                <Input id="lokasi" placeholder="Masukkan lokasi" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="kapasitas">Kapasitas</Label>
                <Input id="kapasitas" type="number" placeholder="Masukkan kapasitas" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="keterangan">Keterangan</Label>
                <Textarea id="keterangan" placeholder="Masukkan keterangan" rows={3} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleAddFasilitas}>
                Simpan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fasilitas</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fasilitasList.length}</div>
            <p className="text-xs text-muted-foreground">Fasilitas terdaftar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kondisi Baik</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {fasilitasList.filter(f => f.status === 'baik').length}
            </div>
            <p className="text-xs text-muted-foreground">Siap digunakan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rusak Ringan</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {fasilitasList.filter(f => f.status === 'rusak_ringan').length}
            </div>
            <p className="text-xs text-muted-foreground">Perlu perhatian</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rusak Berat</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {fasilitasList.filter(f => f.status === 'rusak_berat').length}
            </div>
            <p className="text-xs text-muted-foreground">Perlu segera</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dalam Perbaikan</CardTitle>
            <Wrench className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {fasilitasList.filter(f => f.status === 'perbaikan').length}
            </div>
            <p className="text-xs text-muted-foreground">Sedang diperbaiki</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Pencarian</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Cari nama atau lokasi..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kategori">Filter Kategori</Label>
              <Select value={filterKategori} onValueChange={setFilterKategori}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {kategoriOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Filter Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setFilterKategori('all')
                  setFilterStatus('all')
                }}
                className="w-full"
              >
                Reset Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Fasilitas</CardTitle>
          <CardDescription>
            Menampilkan {filteredFasilitas.length} dari {fasilitasList.length} fasilitas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Fasilitas</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Kapasitas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Penanggung Jawab</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFasilitas.map((fasilitas) => (
                  <TableRow key={fasilitas.id}>
                    <TableCell className="font-medium">{fasilitas.name}</TableCell>
                    <TableCell>{getKategoriBadge(fasilitas.kategori)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {fasilitas.lokasi}
                      </div>
                    </TableCell>
                    <TableCell>{fasilitas.kapasitas || '-'}</TableCell>
                    <TableCell>{getStatusBadge(fasilitas.status)}</TableCell>
                    <TableCell>{fasilitas.penanggungJawab}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(fasilitas)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(fasilitas)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(fasilitas)}
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
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detail Fasilitas</DialogTitle>
            <DialogDescription>
              Informasi lengkap mengenai fasilitas
            </DialogDescription>
          </DialogHeader>
          {selectedFasilitas && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Nama Fasilitas</Label>
                  <p className="text-sm text-muted-foreground">{selectedFasilitas.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Kategori</Label>
                  <div className="mt-1">{getKategoriBadge(selectedFasilitas.kategori)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Lokasi</Label>
                  <p className="text-sm text-muted-foreground">{selectedFasilitas.lokasi}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Kapasitas</Label>
                  <p className="text-sm text-muted-foreground">{selectedFasilitas.kapasitas || '-'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedFasilitas.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Penanggung Jawab</Label>
                  <p className="text-sm text-muted-foreground">{selectedFasilitas.penanggungJawab}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Keterangan</Label>
                <p className="text-sm text-muted-foreground">{selectedFasilitas.keterangan}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Terakhir Inspeksi</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedFasilitas.terakhirInspeksi).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
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
            <DialogTitle>Edit Fasilitas</DialogTitle>
            <DialogDescription>
              Perbarui informasi fasilitas
            </DialogDescription>
          </DialogHeader>
          {editForm && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nama Fasilitas</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-kategori">Kategori</Label>
                <Select value={editForm.kategori} onValueChange={(value) => setEditForm({...editForm, kategori: value as any})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gedung">Gedung</SelectItem>
                    <SelectItem value="kamar">Kamar</SelectItem>
                    <SelectItem value="kelas">Kelas</SelectItem>
                    <SelectItem value="perpustakaan">Perpustakaan</SelectItem>
                    <SelectItem value="musholla">Musholla</SelectItem>
                    <SelectItem value="kantin">Kantin</SelectItem>
                    <SelectItem value="olahraga">Olahraga</SelectItem>
                    <SelectItem value="lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-lokasi">Lokasi</Label>
                <Input
                  id="edit-lokasi"
                  value={editForm.lokasi}
                  onChange={(e) => setEditForm({...editForm, lokasi: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-kapasitas">Kapasitas</Label>
                <Input
                  id="edit-kapasitas"
                  type="number"
                  value={editForm.kapasitas || ''}
                  onChange={(e) => setEditForm({...editForm, kapasitas: parseInt(e.target.value) || undefined})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={editForm.status} onValueChange={(value) => setEditForm({...editForm, status: value as any})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baik">Baik</SelectItem>
                    <SelectItem value="rusak_ringan">Rusak Ringan</SelectItem>
                    <SelectItem value="rusak_berat">Rusak Berat</SelectItem>
                    <SelectItem value="perbaikan">Perbaikan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-keterangan">Keterangan</Label>
                <Textarea
                  id="edit-keterangan"
                  value={editForm.keterangan}
                  onChange={(e) => setEditForm({...editForm, keterangan: e.target.value})}
                  rows={3}
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