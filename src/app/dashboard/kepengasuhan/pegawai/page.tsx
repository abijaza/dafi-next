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
import { Search, Plus, Eye, Edit, Trash2, Users, Phone, Mail, Calendar, Filter, UserCheck, Award } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface Pegawai {
  id: string
  nip: string
  name: string
  email: string
  phone: string
  role: 'ADMIN' | 'KEPALA_KEPENGASUHAN' | 'WALI_KAMAR' | 'WALI_SANTRI' | 'GURU'
  status: 'aktif' | 'tidak_aktif'
  joinDate: string
  kamarAssigned?: string
  santriCount?: number
}

export default function KepengasuhanPegawaiManagement() {
  const { user } = useAuth()
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([])
  const [filteredPegawai, setFilteredPegawai] = useState<Pegawai[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedPegawai, setSelectedPegawai] = useState<Pegawai | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState<Pegawai | null>(null)

  useEffect(() => {
    // Mock data for demonstration
    const mockPegawai: Pegawai[] = [
      {
        id: '1',
        nip: '2023001',
        name: 'Dr. Ahmad Hidayat, S.Pd.I., M.Pd.',
        email: 'ahmad.hidayat@pesantren.sch.id',
        phone: '08123456789',
        role: 'KEPALA_KEPENGASUHAN',
        status: 'aktif',
        joinDate: '2023-01-15',
        santriCount: 120
      },
      {
        id: '2',
        nip: '2023002',
        name: 'Ustadzah Fatimah Azzahra, S.Pd.I.',
        email: 'fatimah.azzahra@pesantren.sch.id',
        phone: '08234567890',
        role: 'WALI_KAMAR',
        status: 'aktif',
        joinDate: '2023-01-15',
        kamarAssigned: 'Aisyah 1',
        santriCount: 24
      },
      {
        id: '3',
        nip: '2023003',
        name: 'Ustadz Muhammad Bakri, S.Pd.I.',
        email: 'muhammad.bakri@pesantren.sch.id',
        phone: '08345678901',
        role: 'WALI_KAMAR',
        status: 'aktif',
        joinDate: '2023-01-15',
        kamarAssigned: 'Aisyah 2',
        santriCount: 23
      },
      {
        id: '4',
        nip: '2023004',
        name: 'Ustadzah Aisyah Rahman, S.Pd.',
        email: 'aisyah.rahman@pesantren.sch.id',
        phone: '08456789012',
        role: 'WALI_SANTRI',
        status: 'aktif',
        joinDate: '2023-06-01',
        santriCount: 15
      },
      {
        id: '5',
        nip: '2023005',
        name: 'Budi Santoso, S.Kom.',
        email: 'budi.santoso@pesantren.sch.id',
        phone: '08567890123',
        role: 'ADMIN',
        status: 'aktif',
        joinDate: '2023-01-15'
      },
      {
        id: '6',
        nip: '2022001',
        name: 'Ustadzah Khadijah, S.Pd.I.',
        email: 'khadijah@pesantren.sch.id',
        phone: '08678901234',
        role: 'WALI_KAMAR',
        status: 'tidak_aktif',
        joinDate: '2022-01-15',
        kamarAssigned: 'Aisyah 3',
        santriCount: 0
      }
    ]
    setPegawaiList(mockPegawai)
    setFilteredPegawai(mockPegawai)
  }, [])

  useEffect(() => {
    let filtered = pegawaiList

    if (searchTerm) {
      filtered = filtered.filter(pegawai =>
        pegawai.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pegawai.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pegawai.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter(pegawai => pegawai.role === filterRole)
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(pegawai => pegawai.status === filterStatus)
    }

    setFilteredPegawai(filtered)
  }, [pegawaiList, searchTerm, filterRole, filterStatus])

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge className="bg-purple-100 text-purple-800">Admin</Badge>
      case 'KEPALA_KEPENGASUHAN':
        return <Badge className="bg-red-100 text-red-800">Kepala Kepengasuhan</Badge>
      case 'WALI_KAMAR':
        return <Badge className="bg-blue-100 text-blue-800">Wali Kamar</Badge>
      case 'WALI_SANTRI':
        return <Badge className="bg-green-100 text-green-800">Wali Santri</Badge>
      case 'GURU':
        return <Badge className="bg-orange-100 text-orange-800">Guru</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{role}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aktif':
        return <Badge className="bg-green-100 text-green-800">Aktif</Badge>
      case 'tidak_aktif':
        return <Badge className="bg-red-100 text-red-800">Tidak Aktif</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const roleOptions = [
    { value: 'all', label: 'Semua Role' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'KEPALA_KEPENGASUHAN', label: 'Kepala Kepengasuhan' },
    { value: 'WALI_KAMAR', label: 'Wali Kamar' },
    { value: 'WALI_SANTRI', label: 'Wali Santri' },
    { value: 'GURU', label: 'Guru' }
  ]

  const statusOptions = ['all', 'aktif', 'tidak_aktif']

  // Handler functions
  const handleView = (pegawai: Pegawai) => {
    setSelectedPegawai(pegawai)
    setIsViewDialogOpen(true)
  }

  const handleEdit = (pegawai: Pegawai) => {
    setEditForm({...pegawai})
    setIsEditDialogOpen(true)
  }

  const handleDelete = (pegawai: Pegawai) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data pegawai ${pegawai.name}?`)) {
      setPegawaiList(pegawaiList.filter(p => p.id !== pegawai.id))
    }
  }

  const handleSaveEdit = () => {
    if (editForm) {
      setPegawaiList(pegawaiList.map(p => p.id === editForm.id ? editForm : p))
      setIsEditDialogOpen(false)
      setEditForm(null)
    }
  }

  const handleAddPegawai = () => {
    // Mock add function
    const newPegawai: Pegawai = {
      id: Date.now().toString(),
      nip: '2024' + (pegawaiList.length + 1).toString().padStart(3, '0'),
      name: 'Pegawai Baru',
      email: 'pegawaibaru@pesantren.sch.id',
      phone: '08123456789',
      role: 'WALI_KAMAR',
      status: 'aktif',
      joinDate: new Date().toISOString().split('T')[0]
    }
    setPegawaiList([newPegawai, ...pegawaiList])
    setIsAddDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Data Pegawai</h1>
          <p className="text-muted-foreground">Kelola data pegawai dan staf pesantren</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Pegawai
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tambah Pegawai Baru</DialogTitle>
              <DialogDescription>
                Tambahkan pegawai baru ke sistem
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input id="name" placeholder="Masukkan nama lengkap" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Masukkan email" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">No. HP</Label>
                <Input id="phone" placeholder="Masukkan nomor HP" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="KEPALA_KEPENGASUHAN">Kepala Kepengasuhan</SelectItem>
                    <SelectItem value="WALI_KAMAR">Wali Kamar</SelectItem>
                    <SelectItem value="WALI_SANTRI">Wali Santri</SelectItem>
                    <SelectItem value="GURU">Guru</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleAddPegawai}>
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
            <CardTitle className="text-sm font-medium">Total Pegawai</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pegawaiList.length}</div>
            <p className="text-xs text-muted-foreground">Pegawai terdaftar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pegawai Aktif</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {pegawaiList.filter(p => p.status === 'aktif').length}
            </div>
            <p className="text-xs text-muted-foreground">Sedang aktif</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wali Kamar</CardTitle>
            <Award className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {pegawaiList.filter(p => p.role === 'WALI_KAMAR').length}
            </div>
            <p className="text-xs text-muted-foreground">Wali kamar aktif</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wali Santri</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {pegawaiList.filter(p => p.role === 'WALI_SANTRI').length}
            </div>
            <p className="text-xs text-muted-foreground">Wali santri aktif</p>
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
                  placeholder="Cari nama, NIP, atau email..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Filter Role</Label>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
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
                      {status === 'all' ? 'Semua Status' : 
                       status === 'aktif' ? 'Aktif' : 'Tidak Aktif'}
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
                  setFilterRole('all')
                  setFilterStatus('all')
                }}
              >
                Reset Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pegawai Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pegawai</CardTitle>
          <CardDescription>
            Menampilkan {filteredPegawai.length} dari {pegawaiList.length} pegawai
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NIP</TableHead>
                  <TableHead>Nama Lengkap</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Penugasan</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPegawai.map((pegawai) => (
                  <TableRow key={pegawai.id}>
                    <TableCell className="font-medium">{pegawai.nip}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{pegawai.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Bergabung: {pegawai.joinDate}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Mail className="mr-2 h-4 w-4" />
                        <span className="text-sm">{pegawai.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(pegawai.role)}</TableCell>
                    <TableCell>{getStatusBadge(pegawai.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {pegawai.kamarAssigned && (
                          <div>Kamar: {pegawai.kamarAssigned}</div>
                        )}
                        {pegawai.santriCount !== undefined && (
                          <div className="text-muted-foreground">
                            {pegawai.santriCount} santri
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Phone className="mr-2 h-4 w-4" />
                        <span className="text-sm">{pegawai.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleView(pegawai)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(pegawai)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(pegawai)}>
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
            <DialogTitle>Detail Pegawai</DialogTitle>
            <DialogDescription>
              Informasi lengkap data pegawai
            </DialogDescription>
          </DialogHeader>
          {selectedPegawai && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">NIP</Label>
                  <p className="font-medium">{selectedPegawai.nip}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedPegawai.status)}</div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Nama Lengkap</Label>
                <p className="font-medium">{selectedPegawai.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Role</Label>
                <div className="mt-1">{getRoleBadge(selectedPegawai.role)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Email</Label>
                <p className="font-medium">{selectedPegawai.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">No. HP</Label>
                <p className="font-medium">{selectedPegawai.phone}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Tanggal Bergabung</Label>
                <p className="font-medium">{selectedPegawai.joinDate}</p>
              </div>
              {selectedPegawai.kamarAssigned && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Kamar Ditugaskan</Label>
                  <p className="font-medium">{selectedPegawai.kamarAssigned}</p>
                </div>
              )}
              {selectedPegawai.santriCount !== undefined && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Jumlah Santri</Label>
                  <p className="font-medium">{selectedPegawai.santriCount} santri</p>
                </div>
              )}
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
            <DialogTitle>Edit Data Pegawai</DialogTitle>
            <DialogDescription>
              Perbarui informasi data pegawai
            </DialogDescription>
          </DialogHeader>
          {editForm && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-nip">NIP</Label>
                  <Input 
                    id="edit-nip" 
                    value={editForm.nip}
                    onChange={(e) => setEditForm({...editForm, nip: e.target.value})}
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
                  <Label htmlFor="edit-email">Email</Label>
                  <Input 
                    id="edit-email" 
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">No. HP</Label>
                  <Input 
                    id="edit-phone" 
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select value={editForm.role} onValueChange={(value: any) => setEditForm({...editForm, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="KEPALA_KEPENGASUHAN">Kepala Kepengasuhan</SelectItem>
                      <SelectItem value="WALI_KAMAR">Wali Kamar</SelectItem>
                      <SelectItem value="WALI_SANTRI">Wali Santri</SelectItem>
                      <SelectItem value="GURU">Guru</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={editForm.status} onValueChange={(value: any) => setEditForm({...editForm, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aktif">Aktif</SelectItem>
                      <SelectItem value="tidak_aktif">Tidak Aktif</SelectItem>
                    </SelectContent>
                  </Select>
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