'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  GraduationCap, 
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Search,
  Layers,
  BookOpen,
  Users
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface Tingkat {
  id: string
  nama: string
  deskripsi: string | null
  jenjang: Jenjang[]
}

interface Jenjang {
  id: string
  nama: string
  tingkatId: string
  tingkat: Tingkat
  kelas: Kelas[]
}

interface Kelas {
  id: string
  nama: string
  jenjangId: string
  deskripsi: string | null
  jenjang: Jenjang
}

type DialogType = 'create-tingkat' | 'edit-tingkat' | 'create-jenjang' | 'edit-jenjang' | 'create-kelas' | 'edit-kelas' | null

export default function KelasManagement() {
  const { user } = useAuth()
  const router = useRouter()
  
  // Data states
  const [tingkat, setTingkat] = useState<Tingkat[]>([])
  const [jenjang, setJenjang] = useState<Jenjang[]>([])
  const [kelas, setKelas] = useState<Kelas[]>([])
  
  // UI states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedTingkat, setExpandedTingkat] = useState<string[]>([])
  const [expandedJenjang, setExpandedJenjang] = useState<string[]>([])
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<DialogType>(null)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      const [tingkatRes, jenjangRes, kelasRes] = await Promise.all([
        fetch('/api/tingkat'),
        fetch('/api/jenjang'),
        fetch('/api/kelas?limit=100') // Ambil semua data kelas
      ])

      if (tingkatRes.ok) {
        const tingkatData = await tingkatRes.json()
        setTingkat(tingkatData.data || tingkatData)
      }

      if (jenjangRes.ok) {
        const jenjangData = await jenjangRes.json()
        setJenjang(jenjangData.data || jenjangData)
      }

      if (kelasRes.ok) {
        const kelasData = await kelasRes.json()
        setKelas(kelasData.data || kelasData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Terjadi kesalahan saat mengambil data')
    } finally {
      setLoading(false)
    }
  }

  const toggleTingkat = (tingkatId: string) => {
    setExpandedTingkat(prev => 
      prev.includes(tingkatId) 
        ? prev.filter(id => id !== tingkatId)
        : [...prev, tingkatId]
    )
  }

  const toggleJenjang = (jenjangId: string) => {
    setExpandedJenjang(prev => 
      prev.includes(jenjangId) 
        ? prev.filter(id => id !== jenjangId)
        : [...prev, jenjangId]
    )
  }

  const openDialog = (type: DialogType, item?: any) => {
    setDialogType(type)
    setSelectedItem(item)
    
    if (type?.includes('create')) {
      setFormData({})
    } else if (item) {
      setFormData(item)
    }
    
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setDialogType(null)
    setSelectedItem(null)
    setFormData({})
    setError('')
  }

  const handleSubmit = async () => {
    try {
      setError('')
      let url = ''
      let method = 'POST'
      let body = formData

      switch (dialogType) {
        case 'create-tingkat':
          url = '/api/tingkat'
          break
        case 'edit-tingkat':
          url = `/api/tingkat/${selectedItem.id}`
          method = 'PUT'
          break
        case 'create-jenjang':
          url = '/api/jenjang'
          break
        case 'edit-jenjang':
          url = `/api/jenjang/${selectedItem.id}`
          method = 'PUT'
          break
        case 'create-kelas':
          url = '/api/kelas'
          break
        case 'edit-kelas':
          url = `/api/kelas/${selectedItem.id}`
          method = 'PUT'
          break
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        setSuccess('Data berhasil disimpan')
        closeDialog()
        fetchData()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const data = await response.json()
        const errorMessage = data.details ? `${data.error}: ${data.details}` : data.error
        setError(errorMessage || 'Terjadi kesalahan')
      }
    } catch (error) {
      setError('Terjadi kesalahan server')
    }
  }

  const handleDelete = async (type: 'tingkat' | 'jenjang' | 'kelas', id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/${type}/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSuccess('Data berhasil dihapus')
        fetchData()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const data = await response.json()
        setError(data.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      setError('Terjadi kesalahan server')
    }
  }

  const getJenjangByTingkat = (tingkatId: string) => {
    return jenjang.filter(j => j.tingkatId === tingkatId)
  }

  const getKelasByJenjang = (jenjangId: string) => {
    return kelas.filter(k => k.jenjangId === jenjangId)
  }

  const filteredTingkat = tingkat.filter(t => 
    t.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pengaturan Kelas</h1>
          <p className="text-muted-foreground">Kelola hierarki Tingkat → Jenjang → Kelas</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => openDialog('create-tingkat')}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Tingkat
          </Button>
          <Button onClick={() => openDialog('create-jenjang')}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Jenjang
          </Button>
          <Button onClick={() => openDialog('create-kelas')}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Kelas
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tingkat</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tingkat.length}</div>
            <p className="text-xs text-muted-foreground">Tingkat pendidikan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jenjang</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jenjang.length}</div>
            <p className="text-xs text-muted-foreground">Tingkat kelas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kelas</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kelas.length}</div>
            <p className="text-xs text-muted-foreground">Ruang kelas</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-700">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari tingkat..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Hierarchical View */}
      <div className="space-y-4">
        {filteredTingkat.map((tingkatItem) => {
          const jenjangList = getJenjangByTingkat(tingkatItem.id)
          const isExpanded = expandedTingkat.includes(tingkatItem.id)

          return (
            <Card key={tingkatItem.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleTingkat(tingkatItem.id)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                    <div>
                      <CardTitle className="text-lg">{tingkatItem.nama}</CardTitle>
                      {tingkatItem.deskripsi && (
                        <CardDescription>{tingkatItem.deskripsi}</CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {jenjangList.length} jenjang
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDialog('edit-tingkat', tingkatItem)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete('tingkat', tingkatItem.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="space-y-3 ml-8">
                    {jenjangList.map((jenjangItem) => {
                      const kelasList = getKelasByJenjang(jenjangItem.id)
                      const isJenjangExpanded = expandedJenjang.includes(jenjangItem.id)

                      return (
                        <div key={jenjangItem.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleJenjang(jenjangItem.id)}
                              >
                                {isJenjangExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                              <div>
                                <div className="font-medium">
                                  {tingkatItem.nama} {jenjangItem.nama}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {kelasList.length} kelas
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDialog('edit-jenjang', jenjangItem)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete('jenjang', jenjangItem.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {isJenjangExpanded && (
                            <div className="mt-3 ml-8 space-y-2">
                              {kelasList.map((kelasItem) => (
                                <div
                                  key={kelasItem.id}
                                  className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                                >
                                  <div className="flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <div className="font-medium text-sm">{kelasItem.nama}</div>
                                      {kelasItem.deskripsi && (
                                        <div className="text-xs text-muted-foreground">
                                          {kelasItem.deskripsi}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openDialog('edit-kelas', kelasItem)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDelete('kelas', kelasItem.id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                              
                              {kelasList.length === 0 && (
                                <div className="text-center py-4 text-muted-foreground text-sm">
                                  Belum ada kelas di jenjang ini
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                    
                    {jenjangList.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        Belum ada jenjang di tingkat ini
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
        
        {filteredTingkat.length === 0 && (
          <div className="text-center py-8">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'Tidak ada tingkat yang cocok dengan pencarian' : 'Belum ada data tingkat'}
            </p>
          </div>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'create-tingkat' && 'Tambah Tingkat'}
              {dialogType === 'edit-tingkat' && 'Edit Tingkat'}
              {dialogType === 'create-jenjang' && 'Tambah Jenjang'}
              {dialogType === 'edit-jenjang' && 'Edit Jenjang'}
              {dialogType === 'create-kelas' && 'Tambah Kelas'}
              {dialogType === 'edit-kelas' && 'Edit Kelas'}
            </DialogTitle>
            <DialogDescription>
              {dialogType?.includes('tingkat') && 'Kelola data tingkat pendidikan'}
              {dialogType?.includes('jenjang') && 'Kelola data jenjang kelas'}
              {dialogType?.includes('kelas') && 'Kelola data ruang kelas'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {dialogType?.includes('tingkat') && (
              <>
                <div>
                  <label className="text-sm font-medium">Nama Tingkat</label>
                  <Input
                    value={formData.nama || ''}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Contoh: MA, SMP, SD"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Deskripsi</label>
                  <Textarea
                    value={formData.deskripsi || ''}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    placeholder="Contoh: Madrasah Aliyah, Sekolah Menengah Pertama"
                  />
                </div>
              </>
            )}

            {dialogType?.includes('jenjang') && (
              <>
                <div>
                  <label className="text-sm font-medium">Tingkat</label>
                  <Select
                    value={formData.tingkatId || ''}
                    onValueChange={(value) => setFormData({ ...formData, tingkatId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tingkat" />
                    </SelectTrigger>
                    <SelectContent>
                      {tingkat.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Nama Jenjang</label>
                  <Input
                    value={formData.nama || ''}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Contoh: 10, 11, 12, 7, 8, 9"
                  />
                </div>
              </>
            )}

            {dialogType?.includes('kelas') && (
              <>
                <div>
                  <label className="text-sm font-medium">Tingkat</label>
                  <Select
                    value={formData.tingkatId || ''}
                    onValueChange={(value) => {
                      const selectedTingkat = tingkat.find(t => t.id === value)
                      setFormData({ 
                        ...formData, 
                        tingkatId: value,
                        jenjangId: '' // Reset jenjang when tingkat changes
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tingkat" />
                    </SelectTrigger>
                    <SelectContent>
                      {tingkat.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Jenjang</label>
                  <Select
                    value={formData.jenjangId || ''}
                    onValueChange={(value) => setFormData({ ...formData, jenjangId: value })}
                    disabled={!formData.tingkatId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenjang" />
                    </SelectTrigger>
                    <SelectContent>
                      {jenjang
                        .filter(j => j.tingkatId === formData.tingkatId)
                        .map((j) => (
                          <SelectItem key={j.id} value={j.id}>
                            {j.nama}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Nama Kelas</label>
                  <Input
                    value={formData.nama || ''}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Contoh: X-A, XI-Bilingual, VII-C"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Deskripsi</label>
                  <Textarea
                    value={formData.deskripsi || ''}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    placeholder="Deskripsi kelas (opsional)"
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Batal
            </Button>
            <Button onClick={handleSubmit}>
              {dialogType?.includes('create') ? 'Tambah' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}