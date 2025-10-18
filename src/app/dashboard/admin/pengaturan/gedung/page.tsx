'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Search, Plus, Eye, Edit, Trash2, Building, MapPin } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface Gedung {
  id: string
  idGedung: string
  namaGedung: string
  deskripsi?: string
  createdAt: string
  updatedAt: string
  _count: {
    kamar: number
  }
}

export default function GedungManagement() {
  const { user } = useAuth()
  const [gedungList, setGedungList] = useState<Gedung[]>([])
  const [filteredGedung, setFilteredGedung] = useState<Gedung[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedGedung, setSelectedGedung] = useState<Gedung | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState<Gedung | null>(null)
  const [addForm, setAddForm] = useState({ nama: '', deskripsi: '' })

  useEffect(() => {
    // Fetch data from API
    fetchGedungData()
  }, [])

  // Refresh data when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !document.hidden) {
        fetchGedungData()
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
          namaGedung: g.nama,
          deskripsi: g.deskripsi,
          createdAt: g.createdAt,
          updatedAt: g.updatedAt,
          _count: {
            kamar: g.kamar?.length || 0
          }
        }))
        setGedungList(transformedGedung)
        setFilteredGedung(transformedGedung)
      }
    } catch (error) {
      console.error('Error fetching gedung:', error)
      // Fallback to mock data
      const mockGedung: Gedung[] = [
        {
          id: '1',
          idGedung: 'GDG001',
          namaGedung: 'Gedung Aisyah',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-15T00:00:00.000Z',
          _count: {
            kamar: 12
          }
        },
        {
          id: '2',
          idGedung: 'GDG002',
          namaGedung: 'Gedung Fatimah',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-15T00:00:00.000Z',
          _count: {
            kamar: 10
          }
        },
        {
          id: '3',
          idGedung: 'GDG003',
          namaGedung: 'Gedung Khadijah',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-15T00:00:00.000Z',
          _count: {
            kamar: 8
          }
        },
        {
          id: '4',
          idGedung: 'GDG004',
          namaGedung: 'Gedung Belajar',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-15T00:00:00.000Z',
          _count: {
            kamar: 0
          }
        },
        {
          id: '5',
          idGedung: 'GDG005',
          namaGedung: 'Gedung Administrasi',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-15T00:00:00.000Z',
          _count: {
            kamar: 0
          }
        }
      ]
      setGedungList(mockGedung)
      setFilteredGedung(mockGedung)
    }
  }

  useEffect(() => {
    let filtered = gedungList

    if (searchTerm) {
      filtered = filtered.filter(gedung =>
        gedung.namaGedung.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredGedung(filtered)
  }, [gedungList, searchTerm])

  // Handler functions
  const handleView = (gedung: Gedung) => {
    setSelectedGedung(gedung)
    setIsViewDialogOpen(true)
  }

  const handleEdit = async (gedung: Gedung) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/gedung/${gedung.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const transformedData = {
          id: data.id,
          idGedung: `GDG${data.id.padStart(3, '0')}`,
          namaGedung: data.nama,
          deskripsi: data.deskripsi,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          _count: {
            kamar: data.kamar?.length || 0
          }
        }
        setEditForm(transformedData)
        setIsEditDialogOpen(true)
      } else {
        // Fallback to existing data
        setEditForm({...gedung})
        setIsEditDialogOpen(true)
      }
    } catch (error) {
      console.error('Error fetching gedung details:', error)
      // Fallback to existing data
      setEditForm({...gedung})
      setIsEditDialogOpen(true)
    }
  }

  const handleDelete = async (gedung: Gedung) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data gedung ${gedung.namaGedung}?`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/gedung/${gedung.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        // Refresh the data
        fetchGedungData()
      } else {
        const error = await response.json()
        alert(error.message || 'Gagal menghapus gedung')
      }
    } catch (error) {
      console.error('Error deleting gedung:', error)
      alert('Terjadi kesalahan server')
    }
  }

  const handleSaveEdit = async () => {
    if (!editForm || !editForm.namaGedung.trim()) {
      alert('Nama gedung harus diisi!')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/gedung/${editForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nama: editForm.namaGedung,
          deskripsi: editForm.deskripsi || ''
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        // Refresh the data
        fetchGedungData()
        setIsEditDialogOpen(false)
        setEditForm(null)
      } else {
        const error = await response.json()
        alert(error.message || 'Gagal memperbarui gedung')
      }
    } catch (error) {
      console.error('Error updating gedung:', error)
      alert('Terjadi kesalahan server')
    }
  }

  const handleAddGedung = async () => {
    if (!addForm.nama.trim()) {
      alert('Nama gedung harus diisi!')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/gedung', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nama: addForm.nama,
          deskripsi: addForm.deskripsi
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        // Refresh the data
        fetchGedungData()
        setIsAddDialogOpen(false)
        setAddForm({ nama: '', deskripsi: '' })
      } else {
        const error = await response.json()
        alert(error.message || 'Gagal menambah gedung')
      }
    } catch (error) {
      console.error('Error adding gedung:', error)
      alert('Terjadi kesalahan server')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Master Data Gedung</h1>
          <p className="text-muted-foreground">Kelola data gedung pesantren</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Gedung
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tambah Gedung Baru</DialogTitle>
              <DialogDescription>
                Tambahkan gedung baru ke sistem
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="idGedung">ID Gedung</Label>
                <Input id="idGedung" placeholder="GDG001" disabled />
                <p className="text-xs text-muted-foreground">Akan dibuat otomatis</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="namaGedung">Nama Gedung</Label>
                <Input 
                  id="namaGedung" 
                  placeholder="Masukkan nama gedung" 
                  value={addForm.nama}
                  onChange={(e) => setAddForm(prev => ({ ...prev, nama: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deskripsiGedung">Deskripsi</Label>
                <Input 
                  id="deskripsiGedung" 
                  placeholder="Masukkan deskripsi gedung" 
                  value={addForm.deskripsi}
                  onChange={(e) => setAddForm(prev => ({ ...prev, deskripsi: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsAddDialogOpen(false)
                setAddForm({ nama: '', deskripsi: '' })
              }}>
                Batal
              </Button>
              <Button onClick={handleAddGedung}>
                Simpan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gedung</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gedungList.length}</div>
            <p className="text-xs text-muted-foreground">Gedung terdaftar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kamar</CardTitle>
            <MapPin className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {gedungList.reduce((total, gedung) => total + gedung._count.kamar, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Kamar tersedia</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Kamar</CardTitle>
            <Building className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {gedungList.length > 0 ? Math.round(gedungList.reduce((total, gedung) => total + gedung._count.kamar, 0) / gedungList.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Per gedung</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Pencarian Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari Nama Gedung..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Gedung</CardTitle>
          <CardDescription>
            Menampilkan {filteredGedung.length} dari {gedungList.length} gedung
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Gedung</TableHead>
                  <TableHead>Jumlah Kamar</TableHead>
                  <TableHead>Tanggal Dibuat</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGedung.map((gedung) => (
                  <TableRow key={gedung.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        {gedung.namaGedung}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={gedung._count.kamar > 0 ? "default" : "secondary"}>
                        {gedung._count.kamar} kamar
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(gedung.createdAt).toLocaleDateString('id-ID', {
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
                          onClick={() => handleView(gedung)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(gedung)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(gedung)}
                          className="text-red-600 hover:text-red-700"
                          disabled={gedung._count.kamar > 0}
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
            <DialogTitle>Detail Gedung</DialogTitle>
            <DialogDescription>
              Informasi lengkap mengenai gedung
            </DialogDescription>
          </DialogHeader>
          {selectedGedung && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">ID Gedung</Label>
                  <p className="text-sm text-muted-foreground">{selectedGedung.idGedung}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Nama Gedung</Label>
                  <p className="text-sm text-muted-foreground">{selectedGedung.namaGedung}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Jumlah Kamar</Label>
                  <p className="text-sm text-muted-foreground">{selectedGedung._count.kamar} kamar</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedGedung._count.kamar > 0 ? 'Aktif' : 'Belum ada kamar'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Tanggal Dibuat</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedGedung.createdAt).toLocaleDateString('id-ID', {
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
                    {new Date(selectedGedung.updatedAt).toLocaleDateString('id-ID', {
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
            <DialogTitle>Edit Gedung</DialogTitle>
            <DialogDescription>
              Perbarui informasi gedung
            </DialogDescription>
          </DialogHeader>
          {editForm && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-idGedung">ID Gedung</Label>
                <Input
                  id="edit-idGedung"
                  value={editForm.idGedung}
                  disabled
                />
                <p className="text-xs text-muted-foreground">ID Gedung tidak dapat diubah</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-namaGedung">Nama Gedung</Label>
                <Input
                  id="edit-namaGedung"
                  value={editForm.namaGedung}
                  onChange={(e) => setEditForm({...editForm, namaGedung: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-deskripsiGedung">Deskripsi</Label>
                <Input
                  id="edit-deskripsiGedung"
                  value={editForm.deskripsi || ''}
                  onChange={(e) => setEditForm({...editForm, deskripsi: e.target.value})}
                  placeholder="Masukkan deskripsi gedung"
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