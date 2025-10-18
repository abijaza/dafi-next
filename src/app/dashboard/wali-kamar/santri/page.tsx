'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Search, Plus, Eye, Edit, Trash2, Users, Bed, BookOpen, Phone, Mail, Calendar } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface Santri {
  id: string
  nis: string
  name: string
  kelas: string
  kamar: string
  status: 'aktif' | 'izin' | 'sakit'
  phone: string
  email: string
  waliName: string
  waliPhone: string
  joinDate: string
}

export default function SantriManagement() {
  const { user } = useAuth()
  const [santriList, setSantriList] = useState<Santri[]>([])
  const [filteredSantri, setFilteredSantri] = useState<Santri[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterKamar, setFilterKamar] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedSantri, setSelectedSantri] = useState<Santri | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState<Santri | null>(null)

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
        joinDate: '2024-07-01'
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
        joinDate: '2024-07-01'
      },
      {
        id: '3',
        nis: '2024003',
        name: 'Muhammad Fauzi',
        kelas: 'VIII-A',
        kamar: 'Aisyah 1',
        status: 'izin',
        phone: '08345678901',
        email: 'muhammad.fauzi@pesantren.sch.id',
        waliName: 'Siti Aminah',
        waliPhone: '08345678900',
        joinDate: '2023-07-01'
      },
      {
        id: '4',
        nis: '2024004',
        name: 'Fatimah Az-Zahra',
        kelas: 'VIII-B',
        kamar: 'Aisyah 3',
        status: 'sakit',
        phone: '08456789012',
        email: 'fatimah.azzahra@pesantren.sch.id',
        waliName: 'Muhammad Rizki',
        waliPhone: '08456789011',
        joinDate: '2023-07-01'
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
      default:
        return <Badge className="bg-gray-100 text-gray-800">Tidak Aktif</Badge>
    }
  }

  const kamars = ['all', 'Aisyah 1', 'Aisyah 2', 'Aisyah 3', 'Aisyah 4', 'Aisyah 5']
  const statuses = ['all', 'aktif', 'izin', 'sakit']

  // Handler functions
  const handleView = (santri: Santri) => {
    setSelectedSantri(santri)
    setIsViewDialogOpen(true)
  }

  const handleEdit = (santri: Santri) => {
    setEditForm({...santri})
    setIsEditDialogOpen(true)
  }

  const handleDelete = (santri: Santri) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data santri ${santri.name}?`)) {
      setSantriList(santriList.filter(s => s.id !== santri.id))
    }
  }

  const handleSaveEdit = () => {
    if (editForm) {
      setSantriList(santriList.map(s => s.id === editForm.id ? editForm : s))
      setIsEditDialogOpen(false)
      setEditForm(null)
    }
  }

  const handleAddSantri = () => {
    // Mock add function
    const newSantri: Santri = {
      id: Date.now().toString(),
      nis: '2024' + (santriList.length + 1).toString().padStart(3, '0'),
      name: 'Santri Baru',
      kelas: 'VII-A',
      kamar: 'Aisyah 1',
      status: 'aktif',
      phone: '08123456789',
      email: 'santribaru@pesantren.sch.id',
      waliName: 'Wali Santri Baru',
      waliPhone: '08123456788',
      joinDate: new Date().toISOString().split('T')[0]
    }
    setSantriList([newSantri, ...santriList])
    setIsAddDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Data Santri</h1>
          <p className="text-muted-foreground">Kelola data santri yang berada di bawah pengawasan Anda</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Santri
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Santri Baru</DialogTitle>
              <DialogDescription>
                Tambahkan data santri baru ke sistem
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nis">NIS</Label>
                  <Input id="nis" placeholder="Masukkan NIS" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input id="name" placeholder="Masukkan nama lengkap" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kelas">Kelas</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VII-A">VII-A</SelectItem>
                      <SelectItem value="VII-B">VII-B</SelectItem>
                      <SelectItem value="VIII-A">VIII-A</SelectItem>
                      <SelectItem value="VIII-B">VIII-B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kamar">Kamar</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kamar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aisyah 1">Aisyah 1</SelectItem>
                      <SelectItem value="Aisyah 2">Aisyah 2</SelectItem>
                      <SelectItem value="Aisyah 3">Aisyah 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">No. HP</Label>
                  <Input id="phone" placeholder="Masukkan nomor HP" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Masukkan email" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleAddSantri}>
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
            <p className="text-xs text-muted-foreground">Hari ini</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Santri Izin</CardTitle>
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
            <CardTitle className="text-sm font-medium">Santri Sakit</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {santriList.filter(s => s.status === 'sakit').length}
            </div>
            <p className="text-xs text-muted-foreground">Sedang sakit</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Data</CardTitle>
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
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detail Santri</DialogTitle>
            <DialogDescription>
              Informasi lengkap data santri
            </DialogDescription>
          </DialogHeader>
          {selectedSantri && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">NIS</Label>
                  <p className="font-medium">{selectedSantri.nis}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedSantri.status)}</div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Nama Lengkap</Label>
                <p className="font-medium">{selectedSantri.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Kelas</Label>
                  <p className="font-medium">{selectedSantri.kelas}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Kamar</Label>
                  <p className="font-medium">{selectedSantri.kamar}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Email</Label>
                <p className="font-medium">{selectedSantri.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">No. HP</Label>
                <p className="font-medium">{selectedSantri.phone}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Nama Wali</Label>
                  <p className="font-medium">{selectedSantri.waliName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">No. HP Wali</Label>
                  <p className="font-medium">{selectedSantri.waliPhone}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Tanggal Bergabung</Label>
                <p className="font-medium">{selectedSantri.joinDate}</p>
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
            <DialogTitle>Edit Data Santri</DialogTitle>
            <DialogDescription>
              Perbarui informasi data santri
            </DialogDescription>
          </DialogHeader>
          {editForm && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-nis">NIS</Label>
                  <Input 
                    id="edit-nis" 
                    value={editForm.nis}
                    onChange={(e) => setEditForm({...editForm, nis: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nama Lengkap</Label>
                  <Input 
                    id="edit-name" 
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-kelas">Kelas</Label>
                  <Select value={editForm.kelas} onValueChange={(value) => setEditForm({...editForm, kelas: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VII-A">VII-A</SelectItem>
                      <SelectItem value="VII-B">VII-B</SelectItem>
                      <SelectItem value="VIII-A">VIII-A</SelectItem>
                      <SelectItem value="VIII-B">VIII-B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-kamar">Kamar</Label>
                  <Select value={editForm.kamar} onValueChange={(value) => setEditForm({...editForm, kamar: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aisyah 1">Aisyah 1</SelectItem>
                      <SelectItem value="Aisyah 2">Aisyah 2</SelectItem>
                      <SelectItem value="Aisyah 3">Aisyah 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={editForm.status} onValueChange={(value: any) => setEditForm({...editForm, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aktif">Aktif</SelectItem>
                    <SelectItem value="izin">Izin</SelectItem>
                    <SelectItem value="sakit">Sakit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">No. HP</Label>
                  <Input 
                    id="edit-phone" 
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input 
                    id="edit-email" 
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-waliName">Nama Wali</Label>
                  <Input 
                    id="edit-waliName" 
                    value={editForm.waliName}
                    onChange={(e) => setEditForm({...editForm, waliName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-waliPhone">No. HP Wali</Label>
                  <Input 
                    id="edit-waliPhone" 
                    value={editForm.waliPhone}
                    onChange={(e) => setEditForm({...editForm, waliPhone: e.target.value})}
                  />
                </div>
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