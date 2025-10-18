'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Search, Plus, Eye, Edit, Trash2, FileText, Calendar, User, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface Catatan {
  id: string
  santriId: string
  santriName: string
  tanggal: string
  kategori: 'kehadiran' | 'perilaku' | 'kesehatan' | 'akademik' | 'lainnya'
  isi: string
  tindakan: string
  status: 'selesai' | 'proses' | 'menunggu'
  pembuat: string
}

export default function CatatanManagement() {
  const { user } = useAuth()
  const [catatanList, setCatatanList] = useState<Catatan[]>([])
  const [filteredCatatan, setFilteredCatatan] = useState<Catatan[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterKategori, setFilterKategori] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedCatatan, setSelectedCatatan] = useState<Catatan | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState<Catatan | null>(null)
  const [newCatatan, setNewCatatan] = useState({
    santriId: '',
    kategori: 'kehadiran',
    isi: '',
    tindakan: ''
  })

  useEffect(() => {
    // Mock data for demonstration
    const mockCatatan: Catatan[] = [
      {
        id: '1',
        santriId: '1',
        santriName: 'Ahmad Rizki Pratama',
        tanggal: '2025-01-15',
        kategori: 'kehadiran',
        isi: 'Santri tidak mengikuti shalat subuh berjamaah',
        tindakan: 'Diberi pengarahan dan nasihat',
        status: 'selesai',
        pembuat: 'Ustadz Ahmad'
      },
      {
        id: '2',
        santriId: '2',
        santriName: 'Siti Nurhaliza',
        tanggal: '2025-01-15',
        kategori: 'kesehatan',
        isi: 'Santri mengeluh sakit kepala',
        tindakan: 'Dibawa ke klinik pesantren',
        status: 'proses',
        pembuat: 'Ustadzah Fatimah'
      },
      {
        id: '3',
        santriId: '3',
        santriName: 'Muhammad Fauzi',
        tanggal: '2025-01-14',
        kategori: 'perilaku',
        isi: 'Santri terlambat masuk kelas',
        tindakan: 'Diberi peringatan lisan',
        status: 'selesai',
        pembuat: 'Ustadz Bakri'
      },
      {
        id: '4',
        santriId: '4',
        santriName: 'Fatimah Az-Zahra',
        tanggal: '2025-01-14',
        kategori: 'akademik',
        isi: 'Tugas PR tidak dikumpulkan',
        tindakan: 'Menunggu penyelesaian tugas',
        status: 'menunggu',
        pembuat: 'Ustadzah Aisyah'
      }
    ]
    setCatatanList(mockCatatan)
    setFilteredCatatan(mockCatatan)
  }, [])

  useEffect(() => {
    let filtered = catatanList

    if (searchTerm) {
      filtered = filtered.filter(catatan =>
        catatan.santriName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        catatan.isi.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterKategori !== 'all') {
      filtered = filtered.filter(catatan => catatan.kategori === filterKategori)
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(catatan => catatan.status === filterStatus)
    }

    setFilteredCatatan(filtered)
  }, [catatanList, searchTerm, filterKategori, filterStatus])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'selesai':
        return <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Selesai
        </Badge>
      case 'proses':
        return <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Proses
        </Badge>
      case 'menunggu':
        return <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Menunggu
        </Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Tidak Diketahui</Badge>
    }
  }

  const getKategoriBadge = (kategori: string) => {
    switch (kategori) {
      case 'kehadiran':
        return <Badge variant="outline">Kehadiran</Badge>
      case 'perilaku':
        return <Badge variant="outline">Perilaku</Badge>
      case 'kesehatan':
        return <Badge variant="outline">Kesehatan</Badge>
      case 'akademik':
        return <Badge variant="outline">Akademik</Badge>
      default:
        return <Badge variant="outline">Lainnya</Badge>
    }
  }

  const kategoriOptions = [
    { value: 'kehadiran', label: 'Kehadiran' },
    { value: 'perilaku', label: 'Perilaku' },
    { value: 'kesehatan', label: 'Kesehatan' },
    { value: 'akademik', label: 'Akademik' },
    { value: 'lainnya', label: 'Lainnya' }
  ]

  const statusOptions = ['all', 'selesai', 'proses', 'menunggu']

  // Handler functions
  const handleView = (catatan: Catatan) => {
    setSelectedCatatan(catatan)
    setIsViewDialogOpen(true)
  }

  const handleEdit = (catatan: Catatan) => {
    setEditForm({...catatan})
    setIsEditDialogOpen(true)
  }

  const handleDelete = (catatan: Catatan) => {
    if (confirm(`Apakah Anda yakin ingin menghapus catatan ini?`)) {
      setCatatanList(catatanList.filter(c => c.id !== catatan.id))
    }
  }

  const handleSaveEdit = () => {
    if (editForm) {
      setCatatanList(catatanList.map(c => c.id === editForm.id ? editForm : c))
      setIsEditDialogOpen(false)
      setEditForm(null)
    }
  }

  const handleAddCatatan = () => {
    const catatan: Catatan = {
      id: Date.now().toString(),
      santriId: newCatatan.santriId,
      santriName: 'Selected Santri Name', // In real app, this would be fetched
      tanggal: new Date().toISOString().split('T')[0],
      kategori: newCatatan.kategori as any,
      isi: newCatatan.isi,
      tindakan: newCatatan.tindakan,
      status: 'menunggu',
      pembuat: user?.name || 'Unknown'
    }
    
    setCatatanList([catatan, ...catatanList])
    setNewCatatan({ santriId: '', kategori: 'kehadiran', isi: '', tindakan: '' })
    setIsAddDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Catatan Harian</h1>
          <p className="text-muted-foreground">Catat dan pantau perkembangan santri setiap hari</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Catatan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tambah Catatan Baru</DialogTitle>
              <DialogDescription>
                Tambahkan catatan baru untuk santri
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="santri">Santri</Label>
                <Select value={newCatatan.santriId} onValueChange={(value) => setNewCatatan({...newCatatan, santriId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih santri" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Ahmad Rizki Pratama</SelectItem>
                    <SelectItem value="2">Siti Nurhaliza</SelectItem>
                    <SelectItem value="3">Muhammad Fauzi</SelectItem>
                    <SelectItem value="4">Fatimah Az-Zahra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="kategori">Kategori</Label>
                <Select value={newCatatan.kategori} onValueChange={(value) => setNewCatatan({...newCatatan, kategori: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {kategoriOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="isi">Isi Catatan</Label>
                <Textarea
                  id="isi"
                  placeholder="Masukkan isi catatan..."
                  value={newCatatan.isi}
                  onChange={(e) => setNewCatatan({...newCatatan, isi: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tindakan">Tindakan</Label>
                <Textarea
                  id="tindakan"
                  placeholder="Masukkan tindakan yang diambil..."
                  value={newCatatan.tindakan}
                  onChange={(e) => setNewCatatan({...newCatatan, tindakan: e.target.value})}
                  rows={2}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleAddCatatan}>
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
            <CardTitle className="text-sm font-medium">Total Catatan</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{catatanList.length}</div>
            <p className="text-xs text-muted-foreground">Catatan hari ini</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selesai</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {catatanList.filter(c => c.status === 'selesai').length}
            </div>
            <p className="text-xs text-muted-foreground">Tuntas ditangani</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proses</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {catatanList.filter(c => c.status === 'proses').length}
            </div>
            <p className="text-xs text-muted-foreground">Sedang diproses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
            <XCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {catatanList.filter(c => c.status === 'menunggu').length}
            </div>
            <p className="text-xs text-muted-foreground">Menunggu tindakan</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Catatan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Pencarian</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Cari nama santri atau isi..."
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
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {kategoriOptions.map((option) => (
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
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === 'all' ? 'Semua Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setFilterKategori('all')
                  setFilterStatus('all')
                }}
              >
                Reset Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Catatan Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Catatan</CardTitle>
          <CardDescription>
            Menampilkan {filteredCatatan.length} dari {catatanList.length} catatan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Santri</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Isi Catatan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pembuat</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCatatan.map((catatan) => (
                  <TableRow key={catatan.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        {catatan.tanggal}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        {catatan.santriName}
                      </div>
                    </TableCell>
                    <TableCell>{getKategoriBadge(catatan.kategori)}</TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm truncate">{catatan.isi}</p>
                        {catatan.tindakan && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Tindakan: {catatan.tindakan}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(catatan.status)}</TableCell>
                    <TableCell className="text-sm">{catatan.pembuat}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleView(catatan)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(catatan)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(catatan)}>
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
            <DialogTitle>Detail Catatan</DialogTitle>
            <DialogDescription>
              Informasi lengkap catatan harian
            </DialogDescription>
          </DialogHeader>
          {selectedCatatan && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Tanggal</Label>
                  <p className="font-medium">{selectedCatatan.tanggal}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedCatatan.status)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Santri</Label>
                  <p className="font-medium">{selectedCatatan.santriName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Kategori</Label>
                  <div className="mt-1">{getKategoriBadge(selectedCatatan.kategori)}</div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Isi Catatan</Label>
                <p className="font-medium bg-gray-50 p-3 rounded-md">{selectedCatatan.isi}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Tindakan</Label>
                <p className="font-medium bg-blue-50 p-3 rounded-md">{selectedCatatan.tindakan}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Pembuat</Label>
                <p className="font-medium">{selectedCatatan.pembuat}</p>
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Catatan</DialogTitle>
            <DialogDescription>
              Perbarui informasi catatan harian
            </DialogDescription>
          </DialogHeader>
          {editForm && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-tanggal">Tanggal</Label>
                  <Input 
                    id="edit-tanggal" 
                    type="date"
                    value={editForm.tanggal}
                    onChange={(e) => setEditForm({...editForm, tanggal: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={editForm.status} onValueChange={(value: any) => setEditForm({...editForm, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="selesai">Selesai</SelectItem>
                      <SelectItem value="proses">Proses</SelectItem>
                      <SelectItem value="menunggu">Menunggu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-isi">Isi Catatan</Label>
                <Textarea 
                  id="edit-isi" 
                  value={editForm.isi}
                  onChange={(e) => setEditForm({...editForm, isi: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tindakan">Tindakan</Label>
                <Textarea 
                  id="edit-tindakan" 
                  value={editForm.tindakan}
                  onChange={(e) => setEditForm({...editForm, tindakan: e.target.value})}
                  rows={2}
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