'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Target, 
  ListTodo, 
  Search,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { toast } from 'sonner'

interface Aspek {
  id: string
  nama: string
  deskripsi?: string
  jenis: string
  createdAt: string
  kategori: any[]
  kegiatan?: Kegiatan[]
}

interface Kegiatan {
  id: string
  aspekId: string
  nama: string
  deskripsi?: string
  frekuensi?: string
  target?: string
  createdAt: string
  updatedAt: string
  aspek: {
    id: string
    nama: string
  }
}

export default function AspekKegiatanPage() {
  const [aspek, setAspek] = useState<Aspek[]>([])
  const [kegiatan, setKegiatan] = useState<Kegiatan[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedAspek, setExpandedAspek] = useState<string[]>([])
  
  // Form states
  const [aspekForm, setAspekForm] = useState({ nama: '', deskripsi: '' })
  const [kegiatanForm, setKegiatanForm] = useState({ 
    aspekId: '', 
    nama: '', 
    deskripsi: '', 
    frekuensi: '', 
    target: '' 
  })
  
  // Dialog states
  const [aspekDialogOpen, setAspekDialogOpen] = useState(false)
  const [kegiatanDialogOpen, setKegiatanDialogOpen] = useState(false)
  const [editingAspek, setEditingAspek] = useState<Aspek | null>(null)
  const [editingKegiatan, setEditingKegiatan] = useState<Kegiatan | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [aspekRes, kegiatanRes] = await Promise.all([
        fetch('/api/aspek-nilai?jenis=NON_AKADEMIK'),
        fetch('/api/kegiatan')
      ])

      if (aspekRes.ok && kegiatanRes.ok) {
        const aspekResponse = await aspekRes.json()
        const kegiatanData = await kegiatanRes.json()
        
        // Handle aspek response format
        const aspekData = aspekResponse.data || aspekResponse
        
        // Ensure data is an array
        setAspek(Array.isArray(aspekData) ? aspekData : [])
        setKegiatan(Array.isArray(kegiatanData) ? kegiatanData : [])
      } else {
        console.error('API Error:', { 
          aspekStatus: aspekRes.status, 
          kegiatanStatus: kegiatanRes.status 
        })
        setAspek([])
        setKegiatan([])
        toast.error('Gagal mengambil data dari server')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setAspek([])
      setKegiatan([])
      toast.error('Gagal mengambil data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAspek = async () => {
    try {
      const response = await fetch('/api/aspek-nilai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...aspekForm, jenis: 'NON_AKADEMIK' })
      })

      if (response.ok) {
        toast.success('Aspek berhasil dibuat')
        setAspekForm({ nama: '', deskripsi: '' })
        setAspekDialogOpen(false)
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal membuat aspek')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    }
  }

  const handleUpdateAspek = async () => {
    if (!editingAspek) return

    try {
      const response = await fetch(`/api/aspek-nilai/${editingAspek.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aspekForm)
      })

      if (response.ok) {
        toast.success('Aspek berhasil diupdate')
        setAspekForm({ nama: '', deskripsi: '' })
        setEditingAspek(null)
        setAspekDialogOpen(false)
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal mengupdate aspek')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    }
  }

  const handleDeleteAspek = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus aspek ini?')) return

    try {
      const response = await fetch(`/api/aspek-nilai/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Aspek berhasil dihapus')
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal menghapus aspek')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    }
  }

  const handleCreateKegiatan = async () => {
    try {
      const response = await fetch('/api/kegiatan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kegiatanForm)
      })

      if (response.ok) {
        toast.success('Kegiatan berhasil dibuat')
        setKegiatanForm({ aspekId: '', nama: '', deskripsi: '', frekuensi: '', target: '' })
        setKegiatanDialogOpen(false)
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal membuat kegiatan')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    }
  }

  const handleUpdateKegiatan = async () => {
    if (!editingKegiatan) return

    try {
      const response = await fetch(`/api/kegiatan/${editingKegiatan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kegiatanForm)
      })

      if (response.ok) {
        toast.success('Kegiatan berhasil diupdate')
        setKegiatanForm({ aspekId: '', nama: '', deskripsi: '', frekuensi: '', target: '' })
        setEditingKegiatan(null)
        setKegiatanDialogOpen(false)
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal mengupdate kegiatan')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    }
  }

  const handleDeleteKegiatan = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kegiatan ini?')) return

    try {
      const response = await fetch(`/api/kegiatan/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Kegiatan berhasil dihapus')
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal menghapus kegiatan')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    }
  }

  const openAspekDialog = (aspek?: Aspek) => {
    if (aspek) {
      setEditingAspek(aspek)
      setAspekForm({ nama: aspek.nama, deskripsi: aspek.deskripsi || '' })
    } else {
      setEditingAspek(null)
      setAspekForm({ nama: '', deskripsi: '' })
    }
    setAspekDialogOpen(true)
  }

  const openKegiatanDialog = (kegiatan?: Kegiatan, aspekId?: string) => {
    if (kegiatan) {
      setEditingKegiatan(kegiatan)
      setKegiatanForm({ 
        aspekId: kegiatan.aspekId, 
        nama: kegiatan.nama, 
        deskripsi: kegiatan.deskripsi || '', 
        frekuensi: kegiatan.frekuensi || '', 
        target: kegiatan.target || '' 
      })
    } else {
      setEditingKegiatan(null)
      setKegiatanForm({ 
        aspekId: aspekId || '', 
        nama: '', 
        deskripsi: '', 
        frekuensi: '', 
        target: '' 
      })
    }
    setKegiatanDialogOpen(true)
  }

  const toggleExpanded = (aspekId: string) => {
    setExpandedAspek(prev => 
      prev.includes(aspekId) 
        ? prev.filter(id => id !== aspekId)
        : [...prev, aspekId]
    )
  }

  const getKegiatanByAspek = (aspekId: string) => {
    return kegiatan.filter(k => k.aspekId === aspekId)
  }

  const filteredAspek = aspek.filter(item => 
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Aspek & Kegiatan</h1>
          <p className="text-gray-600">Kelola aspek penilaian dan kegiatan santri</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={aspekDialogOpen} onOpenChange={setAspekDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openAspekDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Aspek
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingAspek ? 'Edit Aspek' : 'Tambah Aspek Baru'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="aspek-nama">Nama Aspek</Label>
                  <Input
                    id="aspek-nama"
                    value={aspekForm.nama}
                    onChange={(e) => setAspekForm({ ...aspekForm, nama: e.target.value })}
                    placeholder="Contoh: Ibadah, Belajar, Karakter"
                  />
                </div>
                <div>
                  <Label htmlFor="aspek-deskripsi">Deskripsi</Label>
                  <Textarea
                    id="aspek-deskripsi"
                    value={aspekForm.deskripsi}
                    onChange={(e) => setAspekForm({ ...aspekForm, deskripsi: e.target.value })}
                    placeholder="Deskripsi aspek penilaian"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setAspekDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={editingAspek ? handleUpdateAspek : handleCreateAspek}>
                    {editingAspek ? 'Update' : 'Simpan'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={kegiatanDialogOpen} onOpenChange={setKegiatanDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => openKegiatanDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Kegiatan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingKegiatan ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="kegiatan-aspek">Aspek</Label>
                  <Select
                    value={kegiatanForm.aspekId}
                    onValueChange={(value) => setKegiatanForm({ ...kegiatanForm, aspekId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih aspek" />
                    </SelectTrigger>
                    <SelectContent>
                      {aspek.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="kegiatan-nama">Nama Kegiatan</Label>
                  <Input
                    id="kegiatan-nama"
                    value={kegiatanForm.nama}
                    onChange={(e) => setKegiatanForm({ ...kegiatanForm, nama: e.target.value })}
                    placeholder="Contoh: Shalat Dhuha, Belajar malam"
                  />
                </div>
                <div>
                  <Label htmlFor="kegiatan-deskripsi">Deskripsi</Label>
                  <Textarea
                    id="kegiatan-deskripsi"
                    value={kegiatanForm.deskripsi}
                    onChange={(e) => setKegiatanForm({ ...kegiatanForm, deskripsi: e.target.value })}
                    placeholder="Deskripsi kegiatan"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="kegiatan-frekuensi">Frekuensi</Label>
                    <Input
                      id="kegiatan-frekuensi"
                      value={kegiatanForm.frekuensi}
                      onChange={(e) => setKegiatanForm({ ...kegiatanForm, frekuensi: e.target.value })}
                      placeholder="Contoh: 3x seminggu"
                    />
                  </div>
                  <div>
                    <Label htmlFor="kegiatan-target">Target</Label>
                    <Input
                      id="kegiatan-target"
                      value={kegiatanForm.target}
                      onChange={(e) => setKegiatanForm({ ...kegiatanForm, target: e.target.value })}
                      placeholder="Contoh: 80%"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setKegiatanDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={editingKegiatan ? handleUpdateKegiatan : handleCreateKegiatan}>
                    {editingKegiatan ? 'Update' : 'Simpan'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Cari aspek atau kegiatan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Aspek Cards with Kegiatan */}
      <div className="grid gap-4">
        {filteredAspek.map((item) => {
          const aspekKegiatan = getKegiatanByAspek(item.id)
          const isExpanded = expandedAspek.includes(item.id)

          return (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      {item.nama}
                    </CardTitle>
                    {item.deskripsi && (
                      <p className="text-gray-600 mt-1 text-sm">{item.deskripsi}</p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <ListTodo className="h-3 w-3" />
                        {aspekKegiatan.length} Kegiatan
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {item.kategori?.length || 0} Kategori
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAspekDialog(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAspek(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Kegiatan Section */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-sm text-gray-700">Kegiatan</h4>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(item.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        {isExpanded ? 'Sembunyikan' : 'Tampilkan'} 
                        {aspekKegiatan.length > 0 && ` (${aspekKegiatan.length})`}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openKegiatanDialog(undefined, item.id)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Tambah
                      </Button>
                    </div>
                  </div>

                  {aspekKegiatan.length > 0 ? (
                    <div className={`space-y-2 ${isExpanded ? 'block' : 'hidden'}`}>
                      {aspekKegiatan.map((kegiatanItem) => (
                        <div
                          key={kegiatanItem.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm">{kegiatanItem.nama}</div>
                            {kegiatanItem.deskripsi && (
                              <div className="text-xs text-gray-600 mt-1">
                                {kegiatanItem.deskripsi}
                              </div>
                            )}
                            <div className="flex gap-3 mt-1">
                              {kegiatanItem.frekuensi && (
                                <span className="text-xs text-blue-600">
                                  <Clock className="h-3 w-3 inline mr-1" />
                                  {kegiatanItem.frekuensi}
                                </span>
                              )}
                              {kegiatanItem.target && (
                                <span className="text-xs text-green-600">
                                  <Target className="h-3 w-3 inline mr-1" />
                                  {kegiatanItem.target}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openKegiatanDialog(kegiatanItem)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteKegiatan(kegiatanItem.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`text-center py-4 text-gray-500 text-sm ${isExpanded ? 'block' : 'hidden'}`}>
                      Belum ada kegiatan untuk aspek ini
                    </div>
                  )}

                  {!isExpanded && aspekKegiatan.length > 0 && (
                    <div className="text-xs text-gray-500">
                      {aspekKegiatan.slice(0, 2).map((k, i) => (
                        <span key={k.id}>
                          {k.nama}{i < Math.min(1, aspekKegiatan.length - 1) ? ', ' : ''}
                        </span>
                      ))}
                      {aspekKegiatan.length > 2 && ` +${aspekKegiatan.length - 2} lainnya`}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {filteredAspek.length === 0 && (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Tidak ada aspek yang cocok' : 'Belum ada aspek penilaian'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'Coba ubah kata kunci pencarian' 
                : 'Mulai dengan menambah aspek penilaian pertama'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => openAspekDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Aspek Pertama
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}