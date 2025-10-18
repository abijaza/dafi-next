'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, Settings, ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface AspekNilai {
  id: string
  nama: string
  deskripsi: string
  createdAt: string
}

interface Aspek {
  id: string
  nama: string
  deskripsi: string
  kategori: Kategori[]
}

interface Kategori {
  id: string
  nama: string
  deskripsi: string
  aspekId: string
  aspek?: AspekNilai
}

interface Kegiatan {
  id: string
  nama: string
  deskripsi: string
  kategoriId: string
}

export default function PenilaianPage() {
  const [aspekList, setAspekList] = useState<Aspek[]>([])
  const [loading, setLoading] = useState(true)
  const [aspekDialogOpen, setAspekDialogOpen] = useState(false)
  const [kategoriDialogOpen, setKategoriDialogOpen] = useState(false)
  const [editingAspek, setEditingAspek] = useState<Aspek | null>(null)
  const [editingKategori, setEditingKategori] = useState<Kategori | null>(null)
  const [selectedAspek, setSelectedAspek] = useState<string>('')
  const [expandedAspek, setExpandedAspek] = useState<Set<string>>(new Set())

  const [aspekForm, setAspekForm] = useState({
    nama: '',
    deskripsi: ''
  })

  const [kategoriForm, setKategoriForm] = useState({
    nama: '',
    deskripsi: '',
    aspekId: ''
  })

  useEffect(() => {
    fetchAspek()
  }, [])

  const fetchAspek = async () => {
    try {
      const response = await fetch('/api/aspek-nilai')
      if (response.ok) {
        const data = await response.json()
        setAspekList(data)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat data aspek penilaian',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAspek = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingAspek ? `/api/aspek-nilai/${editingAspek.id}` : '/api/aspek-nilai'
      const method = editingAspek ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aspekForm)
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Aspek penilaian berhasil ${editingAspek ? 'diperbarui' : 'ditambahkan'}`
        })
        setAspekDialogOpen(false)
        setEditingAspek(null)
        setAspekForm({ nama: '', deskripsi: '' })
        fetchAspek()
      } else {
        throw new Error('Gagal menyimpan aspek')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan aspek penilaian',
        variant: 'destructive'
      })
    }
  }

  const handleSubmitKategori = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingKategori ? `/api/kategori/${editingKategori.id}` : '/api/kategori'
      const method = editingKategori ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kategoriForm)
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Kategori berhasil ${editingKategori ? 'diperbarui' : 'ditambahkan'}`
        })
        setKategoriDialogOpen(false)
        setEditingKategori(null)
        setKategoriForm({ nama: '', deskripsi: '', aspekId: '' })
        fetchAspek()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Gagal menyimpan kategori')
      }
    } catch (error) {
      console.error('Error saving kategori:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal menyimpan kategori',
        variant: 'destructive'
      })
    }
  }

  const handleEditAspek = (aspek: Aspek) => {
    setEditingAspek(aspek)
    setAspekForm({
      nama: aspek.nama,
      deskripsi: aspek.deskripsi
    })
    setAspekDialogOpen(true)
  }

  const handleEditKategori = (kategori: Kategori) => {
    setEditingKategori(kategori)
    setKategoriForm({
      nama: kategori.nama,
      deskripsi: kategori.deskripsi,
      aspekId: kategori.aspekId
    })
    setKategoriDialogOpen(true)
  }

  const handleDeleteAspek = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus aspek ini?')) return
    
    try {
      const response = await fetch(`/api/aspek-nilai/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Aspek berhasil dihapus'
        })
        fetchAspek()
      } else {
        throw new Error('Gagal menghapus aspek')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus aspek penilaian',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteKategori = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return
    
    try {
      const response = await fetch(`/api/kategori/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Kategori berhasil dihapus'
        })
        fetchAspek()
      } else {
        throw new Error('Gagal menghapus kategori')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus kategori',
        variant: 'destructive'
      })
    }
  }

  const toggleAspekExpand = (aspekId: string) => {
    setExpandedAspek(prev => {
      const newSet = new Set(prev)
      if (newSet.has(aspekId)) {
        newSet.delete(aspekId)
      } else {
        newSet.add(aspekId)
      }
      return newSet
    })
  }

  const toggleAllAspek = (expand: boolean) => {
    if (expand) {
      setExpandedAspek(new Set(aspekList.map(aspek => aspek.id)))
    } else {
      setExpandedAspek(new Set())
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Penilaian</h1>
          <p className="text-muted-foreground">Kelola aspek dan kategori penilaian santri</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleAllAspek(false)}
            disabled={expandedAspek.size === 0}
          >
            <EyeOff className="h-4 w-4 mr-2" />
            Collapse All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleAllAspek(true)}
            disabled={expandedAspek.size === aspekList.length}
          >
            <Eye className="h-4 w-4 mr-2" />
            Expand All
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Aspek Penilaian</h2>
          <Dialog open={aspekDialogOpen} onOpenChange={setAspekDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingAspek(null)
                setAspekForm({ nama: '', deskripsi: '' })
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Aspek
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingAspek ? 'Edit Aspek' : 'Tambah Aspek Baru'}
                </DialogTitle>
                <DialogDescription>
                  {editingAspek ? 'Perbarui data aspek penilaian' : 'Tambah aspek penilaian baru'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitAspek} className="space-y-4">
                <div>
                  <Label htmlFor="nama">Nama Aspek</Label>
                  <Input
                    id="nama"
                    value={aspekForm.nama}
                    onChange={(e) => setAspekForm({ ...aspekForm, nama: e.target.value })}
                    placeholder="Contoh: Ibadah"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="deskripsi">Deskripsi</Label>
                  <Textarea
                    id="deskripsi"
                    value={aspekForm.deskripsi}
                    onChange={(e) => setAspekForm({ ...aspekForm, deskripsi: e.target.value })}
                    placeholder="Deskripsi aspek penilaian"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setAspekDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit">
                    {editingAspek ? 'Perbarui' : 'Simpan'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {aspekList.map((aspek) => {
            const isExpanded = expandedAspek.has(aspek.id)
            return (
              <Card key={aspek.id} className="transition-all duration-300 hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-8 w-8 hover:bg-muted transition-colors"
                        onClick={() => toggleAspekExpand(aspek.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                        ) : (
                          <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                        )}
                      </Button>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{aspek.nama}</CardTitle>
                        <CardDescription className="truncate">{aspek.deskripsi}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs px-2 py-1">
                        {aspek.kategori?.length || 0} Kategori
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAspek(aspek)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAspek(aspek.id)}
                        className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {isExpanded && (
                  <CardContent className="border-t pt-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <Badge variant="outline" className="text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          {aspek.kategori?.length || 0} Kategori
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAspek(aspek.id)
                          setEditingKategori(null)
                          setKategoriForm({ 
                            nama: '', 
                            deskripsi: '', 
                            aspekId: aspek.id 
                          })
                          setKategoriDialogOpen(true)
                        }}
                        className="text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Tambah Kategori
                      </Button>
                    </div>
                    {aspek.kategori && aspek.kategori.length > 0 ? (
                      <div className="space-y-2 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                        {aspek.kategori.map((kategori) => (
                          <div key={kategori.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-all duration-200 group">
                            <div className="flex-1 min-w-0 mr-3">
                              <p className="font-medium text-sm truncate">{kategori.nama}</p>
                              <p className="text-xs text-muted-foreground mt-1 truncate">{kategori.deskripsi}</p>
                            </div>
                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 hover:bg-primary/10"
                                onClick={() => handleEditKategori(kategori)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleDeleteKategori(kategori.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
                        <div className="flex flex-col items-center space-y-3">
                          <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                            <Eye className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Belum ada kategori</p>
                            <p className="text-xs text-muted-foreground mt-1">Tambah kategori pertama untuk aspek ini</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedAspek(aspek.id)
                              setEditingKategori(null)
                              setKategoriForm({ 
                                nama: '', 
                                deskripsi: '', 
                                aspekId: aspek.id 
                              })
                              setKategoriDialogOpen(true)
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Kategori Pertama
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      </div>

      {/* Dialog untuk Kategori */}
      <Dialog open={kategoriDialogOpen} onOpenChange={(open) => {
        setKategoriDialogOpen(open)
        if (!open) {
          setEditingKategori(null)
          setKategoriForm({ nama: '', deskripsi: '', aspekId: '' })
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingKategori ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </DialogTitle>
            <DialogDescription>
              {editingKategori ? 'Perbarui data kategori' : 'Tambah kategori baru'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitKategori} className="space-y-4">
            <div>
              <Label htmlFor="aspek">Aspek</Label>
              <Select
                value={kategoriForm.aspekId}
                onValueChange={(value) => setKategoriForm({ ...kategoriForm, aspekId: value })}
                disabled={!!editingKategori}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih aspek" />
                </SelectTrigger>
                <SelectContent>
                  {aspekList.map((aspek) => (
                    <SelectItem key={aspek.id} value={aspek.id}>
                      {aspek.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editingKategori && (
                <p className="text-sm text-muted-foreground mt-1">
                  Aspek tidak dapat diubah saat mengedit kategori
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="nama">Nama Kategori</Label>
              <Input
                id="nama"
                value={kategoriForm.nama}
                onChange={(e) => setKategoriForm({ ...kategoriForm, nama: e.target.value })}
                placeholder="Contoh: Shalat Jamaah"
                required
              />
            </div>
            <div>
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Textarea
                id="deskripsi"
                value={kategoriForm.deskripsi}
                onChange={(e) => setKategoriForm({ ...kategoriForm, deskripsi: e.target.value })}
                placeholder="Deskripsi kategori"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => {
                setKategoriDialogOpen(false)
                setEditingKategori(null)
                setKategoriForm({ nama: '', deskripsi: '', aspekId: '' })
              }}>
                Batal
              </Button>
              <Button type="submit">
                {editingKategori ? 'Perbarui' : 'Simpan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}