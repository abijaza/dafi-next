'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Search, Plus, Eye, Edit, Trash2, Users, Bed, BookOpen, Phone, Mail, Calendar, Filter, X } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface Santri {
  id: string
  nis: string
  name: string
  kelas: string
  kamar: string
  status: 'aktif' | 'izin' | 'sakit' | 'lulus'
  phone: string
  email: string
  waliName: string
  waliPhone: string
  joinDate: string
  waliKamar: string
}

export default function KepengasuhanSantriManagement() {
  const { user } = useAuth()
  const [santriList, setSantriList] = useState<Santri[]>([])
  const [filteredSantri, setFilteredSantri] = useState<Santri[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterKamar, setFilterKamar] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedSantri, setSelectedSantri] = useState<Santri | null>(null)
  const [editFormData, setEditFormData] = useState<Santri | null>(null)
  const [addFormData, setAddFormData] = useState<Partial<Santri>>({
    nis: '',
    name: '',
    kelas: '',
    kamar: '',
    status: 'aktif',
    phone: '',
    email: '',
    waliName: '',
    waliPhone: '',
    joinDate: new Date().toISOString().split('T')[0],
    waliKamar: ''
  })

  useEffect(() => {
    // Mock data for demonstration
    const mockSantri: Santri[] = [
      {
        id: '1',
        nis: '2024001',
        name: 'Ahmad Rizki Pratama',
        kelas: 'VII-A',
        kamar: 'Aisyah 1',
        status: 'aktif',
        phone: '08123456789',
        email: 'ahmad.rizki@pesantren.sch.id',
        waliName: 'Budi Santoso',
        waliPhone: '08123456788',
        joinDate: '2024-07-01',
        waliKamar: 'Ustadz Ahmad'
      },
      {
        id: '2',
        nis: '2024002',
        name: 'Siti Nurhaliza',
        kelas: 'VII-B',
        kamar: 'Aisyah 2',
        status: 'aktif',
        phone: '08234567890',
        email: 'siti.nurhaliza@pesantren.sch.id',
        waliName: 'Ahmad Wijaya',
        waliPhone: '08234567889',
        joinDate: '2024-07-01',
        waliKamar: 'Ustadzah Fatimah'
      },
      {
        id: '3',
        nis: '2023001',
        name: 'Muhammad Fauzi',
        kelas: 'VIII-A',
        kamar: 'Aisyah 1',
        status: 'izin',
        phone: '08345678901',
        email: 'muhammad.fauzi@pesantren.sch.id',
        waliName: 'Siti Aminah',
        waliPhone: '08345678900',
        joinDate: '2023-07-01',
        waliKamar: 'Ustadz Ahmad'
      },
      {
        id: '4',
        nis: '2023002',
        name: 'Fatimah Az-Zahra',
        kelas: 'VIII-B',
        kamar: 'Aisyah 3',
        status: 'sakit',
        phone: '08456789012',
        email: 'fatimah.azzahra@pesantren.sch.id',
        waliName: 'Muhammad Rizki',
        waliPhone: '08456789011',
        joinDate: '2023-07-01',
        waliKamar: 'Ustadzah Aisyah'
      },
      {
        id: '5',
        nis: '2022001',
        name: 'Abdullah Rahman',
        kelas: 'IX-A',
        kamar: 'Aisyah 4',
        status: 'lulus',
        phone: '08567890123',
        email: 'abdullah.rahman@pesantren.sch.id',
        waliName: 'Rahmat Hidayat',
        waliPhone: '08567890122',
        joinDate: '2022-07-01',
        waliKamar: 'Ustadz Bakri'
      }
    ]
    setSantriList(mockSantri)
    setFilteredSantri(mockSantri)
  }, [])

  useEffect(() => {
    let filtered = santriList

    if (searchTerm) {
      filtered = filtered.filter(santri =>
        santri.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        santri.nis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        santri.kelas.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterKamar !== 'all') {
      filtered = filtered.filter(santri => santri.kamar === filterKamar)
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(santri => santri.status === filterStatus)
    }

    setFilteredSantri(filtered)
  }, [santriList, searchTerm, filterKamar, filterStatus])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aktif':
        return <Badge className="bg-green-100 text-green-800">Aktif</Badge>
      case 'izin':
        return <Badge className="bg-blue-100 text-blue-800">Izin</Badge>
      case 'sakit':
        return <Badge className="bg-yellow-100 text-yellow-800">Sakit</Badge>
      case 'lulus':
        return <Badge className="bg-purple-100 text-purple-800">Lulus</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Tidak Aktif</Badge>
    }
  }

  const kamars = ['all', 'Aisyah 1', 'Aisyah 2', 'Aisyah 3', 'Aisyah 4', 'Aisyah 5']
  const statuses = ['all', 'aktif', 'izin', 'sakit', 'lulus']
  const kelasOptions = ['VII-A', 'VII-B', 'VIII-A', 'VIII-B', 'IX-A', 'IX-B']
  const kamarOptions = ['Aisyah 1', 'Aisyah 2', 'Aisyah 3', 'Aisyah 4', 'Aisyah 5']
  const statusOptions = ['aktif', 'izin', 'sakit', 'lulus']
  
  // Event handlers
  const handleView = (santri: Santri) => {
    setSelectedSantri(santri)
    setViewDialogOpen(true)
  }
  
  const handleEdit = (santri: Santri) => {
    setEditFormData({ ...santri })
    setEditDialogOpen(true)
  }
  
  const handleDelete = (santri: Santri) => {
    setSelectedSantri(santri)
    setDeleteDialogOpen(true)
  }
  
  const handleAdd = () => {
    setAddFormData({
      nis: '',
      name: '',
      kelas: '',
      kamar: '',
      status: 'aktif',
      phone: '',
      email: '',
      waliName: '',
      waliPhone: '',
      joinDate: new Date().toISOString().split('T')[0],
      waliKamar: ''
    })
    setAddDialogOpen(true)
  }
  
  const handleEditSubmit = () => {
    if (editFormData) {
      setSantriList(prev => prev.map(santri => 
        santri.id === editFormData.id ? editFormData : santri
      ))
      setEditDialogOpen(false)
      setEditFormData(null)
    }
  }
  
  const handleAddSubmit = () => {
    const newSantri: Santri = {
      id: Date.now().toString(),
      nis: addFormData.nis || '',
      name: addFormData.name || '',
      kelas: addFormData.kelas || '',
      kamar: addFormData.kamar || '',
      status: addFormData.status as 'aktif' | 'izin' | 'sakit' | 'lulus' || 'aktif',
      phone: addFormData.phone || '',
      email: addFormData.email || '',
      waliName: addFormData.waliName || '',
      waliPhone: addFormData.waliPhone || '',
      joinDate: addFormData.joinDate || new Date().toISOString().split('T')[0],
      waliKamar: addFormData.waliKamar || ''
    }
    setSantriList(prev => [...prev, newSantri])
    setAddDialogOpen(false)
  }
  
  const handleDeleteConfirm = () => {
    if (selectedSantri) {
      setSantriList(prev => prev.filter(santri => santri.id !== selectedSantri.id))
      setDeleteDialogOpen(false)
      setSelectedSantri(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Data Santri</h1>
          <p className="text-muted-foreground">Kelola data seluruh santri pesantren</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Santri
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Santri</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{santriList.length}</div>
            <p className="text-xs text-muted-foreground">Santri terdaftar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Santri Aktif</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {santriList.filter(s => s.status === 'aktif').length}
            </div>
            <p className="text-xs text-muted-foreground">Sedang aktif</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sedang Izin</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {santriList.filter(s => s.status === 'izin').length}
            </div>
            <p className="text-xs text-muted-foreground">Sedang izin</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sakit</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {santriList.filter(s => s.status === 'sakit').length}
            </div>
            <p className="text-xs text-muted-foreground">Sedang sakit</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lulus</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {santriList.filter(s => s.status === 'lulus').length}
            </div>
            <p className="text-xs text-muted-foreground">Telah lulus</p>
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
                  placeholder="Cari nama, NIS, atau kelas..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kamar">Filter Kamar</Label>
              <Select value={filterKamar} onValueChange={setFilterKamar}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kamar" />
                </SelectTrigger>
                <SelectContent>
                  {kamars.map((kamar) => (
                    <SelectItem key={kamar} value={kamar}>
                      {kamar === 'all' ? 'Semua Kamar' : kamar}
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
                  {statuses.map((status) => (
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
                  setFilterKamar('all')
                  setFilterStatus('all')
                }}
              >
                Reset Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Santri Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Santri</CardTitle>
          <CardDescription>
            Menampilkan {filteredSantri.length} dari {santriList.length} santri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NIS</TableHead>
                  <TableHead>Nama Lengkap</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Kamar</TableHead>
                  <TableHead>Wali Kamar</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSantri.map((santri) => (
                  <TableRow key={santri.id}>
                    <TableCell className="font-medium">{santri.nis}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{santri.name}</div>
                        <div className="text-sm text-muted-foreground">{santri.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{santri.kelas}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Bed className="mr-2 h-4 w-4" />
                        {santri.kamar}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{santri.waliKamar}</TableCell>
                    <TableCell>{getStatusBadge(santri.status)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Phone className="mr-1 h-3 w-3" />
                          {santri.phone}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="mr-1 h-3 w-3" />
                          {santri.waliName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleView(santri)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(santri)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(santri)}>
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
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Santri</DialogTitle>
            <DialogDescription>
              Informasi lengkap data santri
            </DialogDescription>
          </DialogHeader>
          {selectedSantri && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">NIS</Label>
                <p className="font-medium">{selectedSantri.nis}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Nama Lengkap</Label>
                <p className="font-medium">{selectedSantri.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Kelas</Label>
                <p className="font-medium">{selectedSantri.kelas}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Kamar</Label>
                <p className="font-medium">{selectedSantri.kamar}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Status</Label>
                <div>{getStatusBadge(selectedSantri.status)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Tanggal Bergabung</Label>
                <p className="font-medium">{selectedSantri.joinDate}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Email</Label>
                <p className="font-medium">{selectedSantri.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Telepon</Label>
                <p className="font-medium">{selectedSantri.phone}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Wali Kamar</Label>
                <p className="font-medium">{selectedSantri.waliKamar}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Nama Wali</Label>
                <p className="font-medium">{selectedSantri.waliName}</p>
              </div>
              <div className="col-span-2">
                <Label className="text-sm font-medium text-gray-500">Telepon Wali</Label>
                <p className="font-medium">{selectedSantri.waliPhone}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Data Santri</DialogTitle>
            <DialogDescription>
              Perbarui informasi data santri
            </DialogDescription>
          </DialogHeader>
          {editFormData && (
            <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="edit-nis">NIS</Label>
                <Input
                  id="edit-nis"
                  value={editFormData.nis}
                  onChange={(e) => setEditFormData({ ...editFormData, nis: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nama Lengkap</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-kelas">Kelas</Label>
                <Select value={editFormData.kelas} onValueChange={(value) => setEditFormData({ ...editFormData, kelas: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    {kelasOptions.map((kelas) => (
                      <SelectItem key={kelas} value={kelas}>{kelas}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-kamar">Kamar</Label>
                <Select value={editFormData.kamar} onValueChange={(value) => setEditFormData({ ...editFormData, kamar: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kamar" />
                  </SelectTrigger>
                  <SelectContent>
                    {kamarOptions.map((kamar) => (
                      <SelectItem key={kamar} value={kamar}>{kamar}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={editFormData.status} onValueChange={(value: any) => setEditFormData({ ...editFormData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Telepon</Label>
                <Input
                  id="edit-phone"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-waliName">Nama Wali</Label>
                <Input
                  id="edit-waliName"
                  value={editFormData.waliName}
                  onChange={(e) => setEditFormData({ ...editFormData, waliName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-waliPhone">Telepon Wali</Label>
                <Input
                  id="edit-waliPhone"
                  value={editFormData.waliPhone}
                  onChange={(e) => setEditFormData({ ...editFormData, waliPhone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-waliKamar">Wali Kamar</Label>
                <Input
                  id="edit-waliKamar"
                  value={editFormData.waliKamar}
                  onChange={(e) => setEditFormData({ ...editFormData, waliKamar: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-joinDate">Tanggal Bergabung</Label>
                <Input
                  id="edit-joinDate"
                  type="date"
                  value={editFormData.joinDate}
                  onChange={(e) => setEditFormData({ ...editFormData, joinDate: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Batal</Button>
            <Button onClick={handleEditSubmit}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tambah Santri Baru</DialogTitle>
            <DialogDescription>
              Tambahkan data santri baru ke sistem
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="add-nis">NIS</Label>
              <Input
                id="add-nis"
                value={addFormData.nis}
                onChange={(e) => setAddFormData({ ...addFormData, nis: e.target.value })}
                placeholder="Masukkan NIS"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-name">Nama Lengkap</Label>
              <Input
                id="add-name"
                value={addFormData.name}
                onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                placeholder="Masukkan nama lengkap"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-kelas">Kelas</Label>
              <Select value={addFormData.kelas} onValueChange={(value) => setAddFormData({ ...addFormData, kelas: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  {kelasOptions.map((kelas) => (
                    <SelectItem key={kelas} value={kelas}>{kelas}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-kamar">Kamar</Label>
              <Select value={addFormData.kamar} onValueChange={(value) => setAddFormData({ ...addFormData, kamar: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kamar" />
                </SelectTrigger>
                <SelectContent>
                  {kamarOptions.map((kamar) => (
                    <SelectItem key={kamar} value={kamar}>{kamar}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-status">Status</Label>
              <Select value={addFormData.status} onValueChange={(value: any) => setAddFormData({ ...addFormData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-phone">Telepon</Label>
              <Input
                id="add-phone"
                value={addFormData.phone}
                onChange={(e) => setAddFormData({ ...addFormData, phone: e.target.value })}
                placeholder="Masukkan nomor telepon"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-email">Email</Label>
              <Input
                id="add-email"
                type="email"
                value={addFormData.email}
                onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                placeholder="Masukkan email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-waliName">Nama Wali</Label>
              <Input
                id="add-waliName"
                value={addFormData.waliName}
                onChange={(e) => setAddFormData({ ...addFormData, waliName: e.target.value })}
                placeholder="Masukkan nama wali"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-waliPhone">Telepon Wali</Label>
              <Input
                id="add-waliPhone"
                value={addFormData.waliPhone}
                onChange={(e) => setAddFormData({ ...addFormData, waliPhone: e.target.value })}
                placeholder="Masukkan telepon wali"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-waliKamar">Wali Kamar</Label>
              <Input
                id="add-waliKamar"
                value={addFormData.waliKamar}
                onChange={(e) => setAddFormData({ ...addFormData, waliKamar: e.target.value })}
                placeholder="Masukkan nama wali kamar"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-joinDate">Tanggal Bergabung</Label>
              <Input
                id="add-joinDate"
                type="date"
                value={addFormData.joinDate}
                onChange={(e) => setAddFormData({ ...addFormData, joinDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Batal</Button>
            <Button onClick={handleAddSubmit}>Tambah Santri</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus data santri "{selectedSantri?.name}"? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}