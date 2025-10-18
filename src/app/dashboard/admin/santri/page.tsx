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
import { Checkbox } from '@/components/ui/checkbox'
import { Search, Plus, Eye, Edit, Trash2, Users, Bed, BookOpen, Phone, Mail, Calendar, Filter, X, Home, UserCheck } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface Santri {
  id: string
  nis: string
  nama: string
  email: string | null
  telepon: string | null
  alamat: string | null
  status: 'AKTIF' | 'MUTASI_KELUAR' | 'LULUS'
  tahunMasuk: string
  namaOrtu: string | null
  namaWali: string | null
  teleponWali: string | null
  password: string
  jenisKelamin: 'LAKI_LAKI' | 'PEREMPUAN' | null
  samaDenganOrtu: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminSantriManagement() {
  const { user } = useAuth()
  const [santriList, setSantriList] = useState<Santri[]>([])
  const [filteredSantri, setFilteredSantri] = useState<Santri[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedSantri, setSelectedSantri] = useState<Santri | null>(null)
  const [editFormData, setEditFormData] = useState<Santri | null>(null)
  const [addFormData, setAddFormData] = useState({
    nis: '',
    nama: '',
    email: '',
    telepon: '',
    alamat: '',
    status: 'AKTIF' as const,
    tahunMasuk: new Date().getFullYear().toString(),
    namaOrtu: '',
    namaWali: '',
    teleponWali: '',
    password: 'santri123',
    jenisKelamin: '' as 'LAKI_LAKI' | 'PEREMPUAN' | '',
    samaDenganOrtu: false
  })

  useEffect(() => {
    fetchSantri()
  }, [])

  useEffect(() => {
    let filtered = santriList

    if (searchTerm) {
      filtered = filtered.filter(santri =>
        santri.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        santri.nis.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(santri => santri.status === filterStatus)
    }

    setFilteredSantri(filtered)
  }, [santriList, searchTerm, filterStatus])

  const fetchSantri = async () => {
    try {
      const response = await fetch('/api/santri')
      if (response.ok) {
        const data = await response.json()
        setSantriList(data)
      }
    } catch (error) {
      console.error('Error fetching santri:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AKTIF':
        return <Badge className="bg-green-100 text-green-800">Aktif</Badge>
      case 'MUTASI_KELUAR':
        return <Badge className="bg-red-100 text-red-800">Mutasi Keluar</Badge>
      case 'LULUS':
        return <Badge className="bg-purple-100 text-purple-800">Lulus</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Tidak Aktif</Badge>
    }
  }

  const statuses = ['all', 'AKTIF', 'MUTASI_KELUAR', 'LULUS']
  const statusOptions = ['AKTIF', 'MUTASI_KELUAR', 'LULUS']
  
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
      nama: '',
      email: '',
      telepon: '',
      alamat: '',
      status: 'AKTIF',
      tahunMasuk: new Date().getFullYear().toString(),
      namaOrtu: '',
      namaWali: '',
      teleponWali: '',
      password: 'santri123',
      jenisKelamin: '',
      samaDenganOrtu: false
    })
    setAddDialogOpen(true)
  }
  
  const handleEditSubmit = async () => {
    if (editFormData) {
      try {
        const response = await fetch(`/api/santri/${editFormData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(editFormData)
        })

        if (response.ok) {
          setSantriList(prev => prev.map(santri => 
            santri.id === editFormData.id ? editFormData : santri
          ))
          setEditDialogOpen(false)
          setEditFormData(null)
        } else {
          alert('Gagal mengupdate data santri')
        }
      } catch (error) {
        alert('Terjadi kesalahan server')
      }
    }
  }
  
  const handleAddSubmit = async () => {
    try {
      const response = await fetch('/api/santri', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(addFormData)
      })

      if (response.ok) {
        setAddDialogOpen(false)
        fetchSantri() // Refresh data
        // Reset form
        setAddFormData({
          nis: '',
          nama: '',
          email: '',
          telepon: '',
          alamat: '',
          status: 'AKTIF',
          tahunMasuk: new Date().getFullYear().toString(),
          namaOrtu: '',
          namaWali: '',
          teleponWali: '',
          password: 'santri123',
          jenisKelamin: '',
          samaDenganOrtu: false
        })
      } else {
        const error = await response.json()
        alert('Gagal menambah santri: ' + (error.message || 'Terjadi kesalahan'))
      }
    } catch (error) {
      alert('Terjadi kesalahan server')
    }
  }
  
  const handleDeleteConfirm = async () => {
    if (selectedSantri) {
      try {
        const response = await fetch(`/api/santri/${selectedSantri.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (response.ok) {
          setSantriList(prev => prev.filter(santri => santri.id !== selectedSantri.id))
          setDeleteDialogOpen(false)
          setSelectedSantri(null)
        } else {
          alert('Gagal menghapus santri')
        }
      } catch (error) {
        alert('Terjadi kesalahan server')
      }
    }
  }

  // Handle checkbox change
  const handleSamaDenganOrtuChange = (checked: boolean) => {
    setAddFormData(prev => ({
      ...prev,
      samaDenganOrtu: checked,
      namaWali: checked ? prev.namaOrtu : prev.namaWali
    }))
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
              {santriList.filter(s => s.status === 'AKTIF').length}
            </div>
            <p className="text-xs text-muted-foreground">Sedang aktif</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mutasi Keluar</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {santriList.filter(s => s.status === 'MUTASI_KELUAR').length}
            </div>
            <p className="text-xs text-muted-foreground">Mutasi keluar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lulus</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {santriList.filter(s => s.status === 'LULUS').length}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Pencarian</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Cari nama atau NIS..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
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
                      {status === 'all' ? 'Semua Status' : status.replace('_', ' ')}
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
                  <TableHead>Jenis Kelamin</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSantri.map((santri) => (
                  <TableRow key={santri.id}>
                    <TableCell className="font-medium">{santri.nis}</TableCell>
                    <TableCell className="font-medium">{santri.nama}</TableCell>
                    <TableCell>
                      {santri.jenisKelamin === 'LAKI_LAKI' ? 'Laki-laki' : 
                       santri.jenisKelamin === 'PEREMPUAN' ? 'Perempuan' : '-'}
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
                <p className="font-medium">{selectedSantri.nama}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Jenis Kelamin</Label>
                <p className="font-medium">
                  {selectedSantri.jenisKelamin === 'LAKI_LAKI' ? 'Laki-laki' : 
                   selectedSantri.jenisKelamin === 'PEREMPUAN' ? 'Perempuan' : '-'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Email</Label>
                <p className="font-medium">{selectedSantri.email || '-'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Telepon</Label>
                <p className="font-medium">{selectedSantri.telepon || '-'}</p>
              </div>
              <div className="col-span-2">
                <Label className="text-sm font-medium text-gray-500">Alamat</Label>
                <p className="font-medium">{selectedSantri.alamat || '-'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Status</Label>
                <div>{getStatusBadge(selectedSantri.status)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Tahun Masuk</Label>
                <p className="font-medium">{selectedSantri.tahunMasuk}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Nama Ortu</Label>
                <p className="font-medium">{selectedSantri.namaOrtu || '-'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Nama Wali</Label>
                <p className="font-medium">{selectedSantri.namaWali || '-'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Telepon Wali</Label>
                <p className="font-medium">{selectedSantri.teleponWali || '-'}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Santri Baru</DialogTitle>
            <DialogDescription>
              Masukkan data santri baru
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nis">NIS</Label>
              <Input
                id="nis"
                value={addFormData.nis}
                onChange={(e) => setAddFormData(prev => ({ ...prev, nis: e.target.value }))}
                placeholder="Nomor Induk Santri"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Lengkap</Label>
              <Input
                id="nama"
                value={addFormData.nama}
                onChange={(e) => setAddFormData(prev => ({ ...prev, nama: e.target.value }))}
                placeholder="Nama lengkap santri"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jenisKelamin">Jenis Kelamin</Label>
              <Select 
                value={addFormData.jenisKelamin} 
                onValueChange={(value: 'LAKI_LAKI' | 'PEREMPUAN' | '') => 
                  setAddFormData(prev => ({ ...prev, jenisKelamin: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis kelamin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LAKI_LAKI">Laki-laki</SelectItem>
                  <SelectItem value="PEREMPUAN">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={addFormData.email}
                onChange={(e) => setAddFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Email santri"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telepon">Telepon</Label>
              <Input
                id="telepon"
                value={addFormData.telepon}
                onChange={(e) => setAddFormData(prev => ({ ...prev, telepon: e.target.value }))}
                placeholder="Nomor telepon"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password Default</Label>
              <Input
                id="password"
                value={addFormData.password}
                readOnly
                className="bg-gray-100 text-gray-600"
                title="Password default untuk santri"
              />
              <p className="text-xs text-gray-500">Password default: santri123</p>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="alamat">Alamat</Label>
              <Textarea
                id="alamat"
                value={addFormData.alamat}
                onChange={(e) => setAddFormData(prev => ({ ...prev, alamat: e.target.value }))}
                placeholder="Alamat lengkap"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={addFormData.status} onValueChange={(value: any) => setAddFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tahunMasuk">Tahun Masuk</Label>
              <Input
                id="tahunMasuk"
                value={addFormData.tahunMasuk}
                onChange={(e) => setAddFormData(prev => ({ ...prev, tahunMasuk: e.target.value }))}
                placeholder="Contoh: 2025"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="namaOrtu">Nama Orang Tua</Label>
              <Input
                id="namaOrtu"
                value={addFormData.namaOrtu}
                onChange={(e) => setAddFormData(prev => ({ ...prev, namaOrtu: e.target.value }))}
                placeholder="Nama orang tua/wali"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="namaWali">Nama Wali Santri</Label>
              <Input
                id="namaWali"
                value={addFormData.namaWali}
                onChange={(e) => setAddFormData(prev => ({ ...prev, namaWali: e.target.value }))}
                placeholder="Nama wali santri"
                disabled={addFormData.samaDenganOrtu}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teleponWali">Telepon Wali Santri</Label>
              <Input
                id="teleponWali"
                value={addFormData.teleponWali}
                onChange={(e) => setAddFormData(prev => ({ ...prev, teleponWali: e.target.value }))}
                placeholder="Nomor telepon wali santri"
              />
              {addFormData.namaWali && addFormData.teleponWali && (
                <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  💡 Akun Wali Santri akan dibuat otomatis dengan role WALI_SANTRI
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2 col-span-2">
              <Checkbox
                id="samaDenganOrtu"
                checked={addFormData.samaDenganOrtu}
                onCheckedChange={handleSamaDenganOrtuChange}
              />
              <Label htmlFor="samaDenganOrtu" className="text-sm">
                Sama dengan nama orang tua
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddSubmit}>
              Tambah Santri
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Data Santri</DialogTitle>
            <DialogDescription>
              Perbarui data santri
            </DialogDescription>
          </DialogHeader>
          {editFormData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nis">NIS</Label>
                <Input
                  id="edit-nis"
                  value={editFormData.nis}
                  onChange={(e) => setEditFormData(prev => prev ? { ...prev, nis: e.target.value } : null)}
                  placeholder="Nomor Induk Santri"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-nama">Nama Lengkap</Label>
                <Input
                  id="edit-nama"
                  value={editFormData.nama}
                  onChange={(e) => setEditFormData(prev => prev ? { ...prev, nama: e.target.value } : null)}
                  placeholder="Nama lengkap santri"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email || ''}
                  onChange={(e) => setEditFormData(prev => prev ? { ...prev, email: e.target.value } : null)}
                  placeholder="Email santri"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-telepon">Telepon</Label>
                <Input
                  id="edit-telepon"
                  value={editFormData.telepon || ''}
                  onChange={(e) => setEditFormData(prev => prev ? { ...prev, telepon: e.target.value } : null)}
                  placeholder="Nomor telepon"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-jenisKelamin">Jenis Kelamin</Label>
                <Select value={editFormData.jenisKelamin || ''} onValueChange={(value: 'LAKI_LAKI' | 'PEREMPUAN' | '') => setEditFormData(prev => prev ? { ...prev, jenisKelamin: value } : null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LAKI_LAKI">Laki-laki</SelectItem>
                    <SelectItem value="PEREMPUAN">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-alamat">Alamat</Label>
                <Textarea
                  id="edit-alamat"
                  value={editFormData.alamat || ''}
                  onChange={(e) => setEditFormData(prev => prev ? { ...prev, alamat: e.target.value } : null)}
                  placeholder="Alamat lengkap"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={editFormData.status} onValueChange={(value: any) => setEditFormData(prev => prev ? { ...prev, status: value } : null)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tahunMasuk">Tahun Masuk</Label>
                <Input
                  id="edit-tahunMasuk"
                  value={editFormData.tahunMasuk}
                  onChange={(e) => setEditFormData(prev => prev ? { ...prev, tahunMasuk: e.target.value } : null)}
                  placeholder="Contoh: 2025"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-namaOrtu">Nama Orang Tua</Label>
                <Input
                  id="edit-namaOrtu"
                  value={editFormData.namaOrtu || ''}
                  onChange={(e) => setEditFormData(prev => prev ? { ...prev, namaOrtu: e.target.value } : null)}
                  placeholder="Nama orang tua/wali"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-namaWali">Nama Wali Santri</Label>
                <Input
                  id="edit-namaWali"
                  value={editFormData.namaWali || ''}
                  onChange={(e) => setEditFormData(prev => prev ? { ...prev, namaWali: e.target.value } : null)}
                  placeholder="Nama wali santri"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-teleponWali">Telepon Wali Santri</Label>
                <Input
                  id="edit-teleponWali"
                  value={editFormData.teleponWali || ''}
                  onChange={(e) => setEditFormData(prev => prev ? { ...prev, teleponWali: e.target.value } : null)}
                  placeholder="Nomor telepon wali santri"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleEditSubmit}>
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Santri</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus data santri "{selectedSantri?.nama}"? 
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}