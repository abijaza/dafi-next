'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users,
  Building,
  ArrowLeftRight,
  Calendar,
  Bed,
  Search,
  CheckSquare,
  Square,
  Trash2,
  UserPlus,
  Move
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface Periode {
  id: string
  tahunAjaran: string
  semester: string
  midSemester: string
  isActive: boolean
}

interface Kamar {
  id: string
  nama: string
  kapasitas: number
  deskripsi: string | null
  gedung: {
    id: string
    nama: string
  }
}

interface KamarPeriode {
  id: string
  kamar: Kamar
  gedung: {
    id: string
    nama: string
  }
  waliKamar: {
    id: string
    nama: string
  } | null
}

interface Santri {
  id: string
  nis: string
  nama: string
  status: string
}

interface SantriKamar {
  id: string
  santri: Santri
  kamarPeriode: KamarPeriode
}

export default function KamarSantriManagement() {
  const { user } = useAuth()
  const [periodes, setPeriodes] = useState<Periode[]>([])
  const [kamar, setKamar] = useState<Kamar[]>([])
  const [kamarPeriodes, setKamarPeriodes] = useState<KamarPeriode[]>([])
  const [santri, setSantri] = useState<Santri[]>([])
  const [santriKamar, setSantriKamar] = useState<SantriKamar[]>([])
  const [selectedPeriode, setSelectedPeriode] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [draggedSantri, setDraggedSantri] = useState<Santri | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState<string | null>(null)
  
  // Search and filter states
  const [searchAvailable, setSearchAvailable] = useState('')
  const [searchKamar, setSearchKamar] = useState('')
  const [selectedKamarFilter, setSelectedKamarFilter] = useState<string>('all')
  
  // Multi-select states - simplified
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [selectedAvailableSantri, setSelectedAvailableSantri] = useState<string[]>([])
  const [selectedKamarSantri, setSelectedKamarSantri] = useState<{ [kamarId: string]: string[] }>({})
  const [bulkLoading, setBulkLoading] = useState(false)
  
  // Simple toggle function
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode)
    setSelectedAvailableSantri([])
    setSelectedKamarSantri({})
  }
  
  const toggleAvailableSantriSelection = (santriId: string) => {
    if (selectedAvailableSantri.includes(santriId)) {
      setSelectedAvailableSantri(selectedAvailableSantri.filter(id => id !== santriId))
    } else {
      setSelectedAvailableSantri([...selectedAvailableSantri, santriId])
    }
  }

  // Multi-select functions for kamar
  const toggleSelectKamarSantri = (kamarId: string, santriId: string) => {
    setSelectedKamarSantri(prev => ({
      ...prev,
      [kamarId]: prev[kamarId]?.includes(santriId)
        ? prev[kamarId].filter(id => id !== santriId)
        : [...(prev[kamarId] || []), santriId]
    }))
  }

  const toggleSelectAllKamar = (kamarId: string) => {
    const kamarSantriIds = getSantriByKamar(kamarId).map(sk => sk.santri.id)
    if (selectedKamarSantri[kamarId]?.length === kamarSantriIds.length) {
      setSelectedKamarSantri(prev => ({
        ...prev,
        [kamarId]: []
      }))
    } else {
      setSelectedKamarSantri(prev => ({
        ...prev,
        [kamarId]: kamarSantriIds
      }))
    }
  }

  // Bulk operations
  const bulkMoveToKamar = async (kamarPeriodeId: string) => {
    if (selectedAvailableSantri.length === 0) return

    setBulkLoading(true)
    try {
      const promises = selectedAvailableSantri.map(santriId =>
        fetch('/api/santri-kamar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            santriId,
            kamarPeriodeId
          })
        })
      )

      const results = await Promise.all(promises)
      const successCount = results.filter(r => r.ok).length
      const failCount = results.length - successCount

      if (successCount > 0) {
        setSuccess(`${successCount} santri berhasil ditambahkan ke kamar${failCount > 0 ? ` (${failCount} gagal)` : ''}`)
        setSelectedAvailableSantri([])
        await fetchSantriKamar()
      } else {
        setError('Semua santri gagal ditambahkan ke kamar')
      }
    } catch (error) {
      setError('Terjadi kesalahan server')
    } finally {
      setBulkLoading(false)
    }
  }

  const bulkMoveToAvailable = async (kamarId: string) => {
    const selectedIds = selectedKamarSantri[kamarId] || []
    if (selectedIds.length === 0) return

    setBulkLoading(true)
    try {
      const santriKamarItems = santriKamar.filter(sk => 
        sk.kamarPeriode.id === kamarId && selectedIds.includes(sk.santri.id)
      )

      const promises = santriKamarItems.map(item =>
        fetch(`/api/santri-kamar/${item.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      )

      const results = await Promise.all(promises)
      const successCount = results.filter(r => r.ok).length
      const failCount = results.length - successCount

      if (successCount > 0) {
        setSuccess(`${successCount} santri berhasil dikeluarkan dari kamar${failCount > 0 ? ` (${failCount} gagal)` : ''}`)
        setSelectedKamarSantri(prev => ({ ...prev, [kamarId]: [] }))
        await fetchSantriKamar()
        setSantri(prev => [...prev])
      } else {
        setError('Semua santri gagal dikeluarkan dari kamar')
      }
    } catch (error) {
      setError('Terjadi kesalahan server')
    } finally {
      setBulkLoading(false)
    }
  }

  const emptyKamar = async (kamarPeriodeId: string) => {
    const santriInKamar = getSantriByKamar(kamarPeriodeId)
    if (santriInKamar.length === 0) return

    if (!confirm(`Apakah Anda yakin ingin mengosongkan kamar ini? ${santriInKamar.length} santri akan dikeluarkan.`)) {
      return
    }

    setBulkLoading(true)
    try {
      const promises = santriInKamar.map(item =>
        fetch(`/api/santri-kamar/${item.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      )

      const results = await Promise.all(promises)
      const successCount = results.filter(r => r.ok).length

      if (successCount > 0) {
        setSuccess(`Kamar berhasil dikosongkan (${successCount} santri dikeluarkan)`)
        setSelectedKamarSantri(prev => ({ ...prev, [kamarPeriodeId]: [] }))
        await fetchSantriKamar()
        setSantri(prev => [...prev])
      } else {
        setError('Gagal mengosongkan kamar')
      }
    } catch (error) {
      setError('Terjadi kesalahan server')
    } finally {
      setBulkLoading(false)
    }
  }
  
  const router = useRouter()

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

    fetchInitialData()
  }, [router])

  useEffect(() => {
    if (selectedPeriode) {
      fetchKamarPeriodes()
      fetchSantriKamar()
    }
  }, [selectedPeriode])

  // Add effect to monitor active periode changes
  useEffect(() => {
    const checkActivePeriode = async () => {
      try {
        const response = await fetch('/api/periode/active')
        if (response.ok) {
          const activePeriode = await response.json()
          if (activePeriode && activePeriode.id !== selectedPeriode) {
            setSelectedPeriode(activePeriode.id)
            setSuccess('Periode aktif diperbarui secara otomatis')
            setTimeout(() => setSuccess(''), 3000)
          }
        }
      } catch (error) {
        console.error('Error checking active periode:', error)
      }
    }

    // Check immediately when component mounts
    checkActivePeriode()

    // Set up polling to check for active periode changes every 5 seconds
    const interval = setInterval(checkActivePeriode, 5000)

    return () => clearInterval(interval)
  }, [selectedPeriode])

  // Add effect to trigger re-render when santriKamar changes
  useEffect(() => {
    // This will ensure the component re-renders when santriKamar changes
    // which affects the getAvailableSantri() calculation
  }, [santriKamar, santri])

  const fetchInitialData = async () => {
    try {
      const [periodesRes, kamarRes, santriRes] = await Promise.all([
        fetch('/api/periode'),
        fetch('/api/kamar'),
        fetch('/api/santri')
      ])

      if (periodesRes.ok) {
        const periodesData = await periodesRes.json()
        setPeriodes(periodesData)
        if (periodesData.length > 0) {
          // Cari periode yang aktif, jika tidak ada fallback ke periode pertama
          const activePeriode = periodesData.find((p: Periode) => p.isActive)
          setSelectedPeriode(activePeriode ? activePeriode.id : periodesData[0].id)
        }
      }

      if (kamarRes.ok) {
        const kamarData = await kamarRes.json()
        setKamar(kamarData)
      }

      if (santriRes.ok) {
        const santriData = await santriRes.json()
        setSantri(santriData.filter((s: any) => s.status === 'AKTIF'))
      }
    } catch (error) {
      console.error('Error fetching initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchKamarPeriodes = async () => {
    try {
      const response = await fetch(`/api/kamar-periode?periodeId=${selectedPeriode}`)
      if (response.ok) {
        const data = await response.json()
        setKamarPeriodes(data)
      }
    } catch (error) {
      console.error('Error fetching kamar periodes:', error)
    }
  }

  const fetchSantriKamar = async () => {
    try {
      const response = await fetch(`/api/santri-kamar?periodeId=${selectedPeriode}`)
      if (response.ok) {
        const data = await response.json()
        setSantriKamar(data)
      }
    } catch (error) {
      console.error('Error fetching santri kamar:', error)
    }
  }

  const handleDragStart = (santri: Santri) => {
    setDraggedSantri(santri)
  }

  const handleDragOver = (e: React.DragEvent, target?: string) => {
    e.preventDefault()
    if (target) {
      setIsDraggingOver(target)
    }
  }

  const handleDragLeave = () => {
    setIsDraggingOver(null)
  }

  const handleDropToKamar = async (e: React.DragEvent, kamarPeriodeId: string) => {
    e.preventDefault()
    setIsDraggingOver(null)
    if (!draggedSantri) return

    try {
      const response = await fetch('/api/santri-kamar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          santriId: draggedSantri.id,
          kamarPeriodeId
        })
      })

      if (response.ok) {
        setSuccess(`${draggedSantri.nama} berhasil ditambahkan ke kamar`)
        fetchSantriKamar()
      } else {
        const data = await response.json()
        setError(data.message || 'Terjadi kesalahan')
      }
    } catch (error) {
      setError('Terjadi kesalahan server')
    }

    setDraggedSantri(null)
  }

  const handleDropToAvailableArea = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(null)
    
    if (!draggedSantri) return
    
    // Find the santri kamar entry for this dragged santri
    const santriKamarItem = santriKamar.find(sk => sk.santri.id === draggedSantri.id)
    
    if (santriKamarItem) {
      try {
        const response = await fetch(`/api/santri-kamar/${santriKamarItem.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (response.ok) {
          setSuccess(`${draggedSantri.nama} berhasil dikeluarkan dari kamar`)
          // Refresh both santri kamar and available santri data
          await fetchSantriKamar()
          // Force re-render by updating a dummy state
          setSantri(prev => [...prev])
        } else {
          const data = await response.json()
          setError(data.message || 'Terjadi kesalahan')
        }
      } catch (error) {
        setError('Terjadi kesalahan server')
      }
    }
    
    setDraggedSantri(null)
  }

  const getAvailableSantri = () => {
    const assignedSantriIds = santriKamar.map(sk => sk.santri.id)
    let available = santri.filter(s => !assignedSantriIds.includes(s.id))
    
    // Apply search filter
    if (searchAvailable) {
      available = available.filter(s => 
        s.nama.toLowerCase().includes(searchAvailable.toLowerCase()) ||
        s.nis.toLowerCase().includes(searchAvailable.toLowerCase())
      )
    }
    
    return available
  }

  const getSantriByKamar = (kamarPeriodeId: string) => {
    let santriInKamar = santriKamar.filter(sk => sk.kamarPeriode.id === kamarPeriodeId)
    
    // Apply search filter
    if (searchKamar) {
      santriInKamar = santriInKamar.filter(sk => 
        sk.santri.nama.toLowerCase().includes(searchKamar.toLowerCase()) ||
        sk.santri.nis.toLowerCase().includes(searchKamar.toLowerCase())
      )
    }
    
    return santriInKamar
  }

  const getFilteredKamarPeriodes = () => {
    if (selectedKamarFilter === 'all') {
      return kamarPeriodes
    }
    return kamarPeriodes.filter(kp => kp.kamar.id === selectedKamarFilter)
  }

  const getOccupancyStats = (kamarPeriode: KamarPeriode) => {
    const occupants = getSantriByKamar(kamarPeriode.id)
    const percentage = (occupants.length / kamarPeriode.kamar.kapasitas) * 100
    return {
      current: occupants.length,
      max: kamarPeriode.kamar.kapasitas,
      percentage,
      isFull: occupants.length >= kamarPeriode.kamar.kapasitas
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pengaturan Kamar Santri</h1>
        <p className="text-muted-foreground">Kelola penempatan santri di kamar berdasarkan periode</p>
      </div>

      {/* Periode Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Pilih Periode</CardTitle>
          <CardDescription>
            Pilih periode akademik untuk mengatur kamar santri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedPeriode} onValueChange={setSelectedPeriode}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih periode" />
            </SelectTrigger>
            <SelectContent>
              {periodes.map((periode) => (
                <SelectItem key={periode.id} value={periode.id}>
                  {periode.tahunAjaran} - {periode.semester} - {periode.midSemester}
                  {periode.isActive && <Badge className="ml-2 bg-green-100 text-green-800">Aktif</Badge>}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Santri Aktif</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{santri.length}</div>
            <p className="text-xs text-muted-foreground">Santri aktif tersedia</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Santri Berkamar</CardTitle>
            <Bed className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{santriKamar.length}</div>
            <p className="text-xs text-muted-foreground">Sudah ditempatkan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kamar Tersedia</CardTitle>
            <Building className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{kamarPeriodes.length}</div>
            <p className="text-xs text-muted-foreground">Kamar dalam periode</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kapasitas</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {kamarPeriodes.reduce((total, kp) => total + kp.kamar.kapasitas, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total tempat tidur</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Belum Berkamar</CardTitle>
            <UserPlus className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{getAvailableSantri().length}</div>
            <p className="text-xs text-muted-foreground">Perlu penempatan</p>
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

      {/* Main Content */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      ) : !selectedPeriode ? (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Pilih periode terlebih dahulu</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Santri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Santri Tersedia
                </div>
                <Badge variant="outline" className="text-sm">
                  {getAvailableSantri().length} Santri
                </Badge>
              </CardTitle>
              <CardDescription>
                {isSelectMode 
                  ? "Klik santri untuk memilih, atau gunakan checkbox di atas untuk seleksi semua"
                  : "Seret santri ke kanan untuk memasukkan ke kamar, atau seret dari kamar ke sini untuk mengeluarkan"
                }
              </CardDescription>
              
              {/* Search for Available Santri */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari santri tersedia..."
                  value={searchAvailable}
                  onChange={(e) => setSearchAvailable(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Multi-Select Toggle Button */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={toggleSelectMode}
                    variant={isSelectMode ? "default" : "outline"}
                    className="flex items-center gap-2"
                  >
                    {isSelectMode ? (
                      <>
                        <CheckSquare className="h-4 w-4" />
                        Selesai
                      </>
                    ) : (
                      <>
                        <Square className="h-4 w-4" />
                        Pilih
                      </>
                    )}
                  </Button>
                  {isSelectMode && (
                    <Badge variant="secondary">
                      {selectedAvailableSantri.length} dipilih
                    </Badge>
                  )}
                  {selectedAvailableSantri.length > 0 && (
                    <Select value="" onValueChange={(value) => value && bulkMoveToKamar(value)}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Pindahkan ke kamar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {kamarPeriodes.map((kamarPeriode) => (
                          <SelectItem key={kamarPeriode.id} value={kamarPeriode.id}>
                            {kamarPeriode.kamar.nama} ({kamarPeriode.gedung.nama})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                {isSelectMode && (
                  <div className="text-xs text-muted-foreground">
                    Mode seleksi aktif
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div 
                key={`available-${santriKamar.length}`}
                className={`space-y-2 max-h-96 overflow-y-auto border-2 border-dashed rounded-lg p-3 min-h-[200px] transition-colors ${
                  isDraggingOver === 'available' 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
                onDragOver={(e) => !isSelectMode && handleDragOver(e, 'available')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => !isSelectMode && handleDropToAvailableArea(e)}
              >
                {/* Select all control for available santri */}
                {isSelectMode && getAvailableSantri().length > 0 && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedAvailableSantri.length === getAvailableSantri().length}
                        onCheckedChange={() => {
                          if (selectedAvailableSantri.length === getAvailableSantri().length) {
                            setSelectedAvailableSantri([])
                          } else {
                            setSelectedAvailableSantri(getAvailableSantri().map(s => s.id))
                          }
                        }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {selectedAvailableSantri.length} dari {getAvailableSantri().length} dipilih
                      </span>
                    </div>
                  </div>
                )}
                
                {getAvailableSantri().length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    {searchAvailable 
                      ? 'Tidak ada santri yang cocok dengan pencarian' 
                      : 'Semua santri sudah ditempatkan di kamar'
                    }
                  </p>
                ) : (
                  getAvailableSantri().map((santriItem) => (
                    <div
                      key={santriItem.id}
                      draggable={!isSelectMode}
                      onDragStart={() => !isSelectMode && handleDragStart(santriItem)}
                      onClick={() => isSelectMode && toggleAvailableSantriSelection(santriItem.id)}
                      className={`p-3 border rounded-lg transition-colors bg-white ${
                        isSelectMode 
                          ? 'cursor-pointer hover:bg-gray-50' 
                          : 'cursor-move hover:bg-gray-50'
                      } ${
                        selectedAvailableSantri.includes(santriItem.id) 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200'
                      }`}
                    >
                        <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isSelectMode && (
                            <Checkbox
                              checked={selectedAvailableSantri.includes(santriItem.id)}
                              onCheckedChange={() => toggleAvailableSantriSelection(santriItem.id)}
                            />
                          )}
                          <div>
                            <div className="font-medium">{santriItem.nama}</div>
                            <div className="text-sm text-muted-foreground">{santriItem.nis}</div>
                          </div>
                        </div>
                        <Badge variant="outline">{santriItem.status}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Rooms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Kamar Periode
                </div>
                <Badge variant="outline" className="text-sm">
                  {santriKamar.length} Santri
                </Badge>
              </CardTitle>
              <CardDescription>
                Drop zone untuk santri ({getFilteredKamarPeriodes().length} kamar)
              </CardDescription>
              
              {/* Filter by Kamar */}
              <div className="space-y-3">
                <Select value={selectedKamarFilter} onValueChange={setSelectedKamarFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter berdasarkan kamar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kamar</SelectItem>
                    {kamar.map((kamarItem) => (
                      <SelectItem key={kamarItem.id} value={kamarItem.id}>
                        {kamarItem.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Search for Santri in Rooms */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari santri di kamar..."
                    value={searchKamar}
                    onChange={(e) => setSearchKamar(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {getFilteredKamarPeriodes().length === 0 ? (
                  <div className="text-center py-8">
                    <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {selectedKamarFilter !== 'all' 
                        ? 'Tidak ada kamar yang cocok dengan filter' 
                        : 'Belum ada kamar dalam periode ini'
                      }
                    </p>
                  </div>
                ) : (
                  getFilteredKamarPeriodes().map((kamarPeriode) => {
                    const stats = getOccupancyStats(kamarPeriode)
                    const santriInKamar = getSantriByKamar(kamarPeriode.id)
                    
                    return (
                      <div
                        key={kamarPeriode.id}
                        onDragOver={(e) => !isSelectMode && handleDragOver(e, kamarPeriode.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => !isSelectMode && handleDropToKamar(e, kamarPeriode.id)}
                        className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
                          stats.isFull 
                            ? 'border-red-300 bg-red-50' 
                            : isDraggingOver === kamarPeriode.id && !isSelectMode
                              ? 'border-blue-400 bg-blue-50'
                              : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{kamarPeriode.kamar.nama}</h4>
                            <p className="text-sm text-muted-foreground">
                              {kamarPeriode.gedung.nama} • {kamarPeriode.waliKamar?.nama || 'Belum ada wali kamar'}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={stats.isFull ? "destructive" : "secondary"}
                              className="text-xs"
                            >
                              {stats.current}/{stats.max}
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              {stats.percentage.toFixed(0)}% penuh
                            </div>
                          </div>
                        </div>
                        
                        {/* Multi-select controls for kamar */}
                        {isSelectMode && (
                          <div className="flex items-center justify-between mb-3 p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={selectedKamarSantri[kamarPeriode.id]?.length === santriInKamar.length && santriInKamar.length > 0}
                                onCheckedChange={() => toggleSelectAllKamar(kamarPeriode.id)}
                              />
                              <span className="text-sm text-muted-foreground">
                                {selectedKamarSantri[kamarPeriode.id]?.length || 0} dipilih
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {selectedKamarSantri[kamarPeriode.id]?.length > 0 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => bulkMoveToAvailable(kamarPeriode.id)}
                                  disabled={bulkLoading}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  {bulkLoading ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-1"></div>
                                  ) : (
                                    <Move className="h-3 w-3 mr-1" />
                                  )}
                                  Pindah ke Tersedia
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => emptyKamar(kamarPeriode.id)}
                                disabled={santriInKamar.length === 0 || bulkLoading}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                {bulkLoading ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-1"></div>
                                    Memproses...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Kosongkan
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          {santriInKamar.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-2">
                              {searchKamar 
                                ? 'Tidak ada santri yang cocok dengan pencarian' 
                                : stats.isFull 
                                  ? 'Kamar penuh' 
                                  : 'Drop santri di sini'
                              }
                            </p>
                          ) : (
                            santriInKamar.map((santriKamarItem) => (
                              <div
                                key={santriKamarItem.id}
                                draggable={!isSelectMode}
                                onDragStart={() => !isSelectMode && handleDragStart(santriKamarItem.santri)}
                                onClick={() => isSelectMode && toggleSelectKamarSantri(kamarPeriode.id, santriKamarItem.santri.id)}
                                className={`p-2 border rounded transition-colors ${
                                  isSelectMode 
                                    ? 'cursor-pointer hover:bg-gray-50' 
                                    : 'cursor-move hover:bg-blue-100 bg-blue-50 border-blue-200'
                                } ${
                                  selectedKamarSantri[kamarPeriode.id]?.includes(santriKamarItem.santri.id) 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : isSelectMode 
                                      ? 'border-gray-200 bg-white'
                                      : 'border-blue-200 bg-blue-50'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {isSelectMode && (
                                      <Checkbox
                                        checked={selectedKamarSantri[kamarPeriode.id]?.includes(santriKamarItem.santri.id)}
                                        onCheckedChange={() => toggleSelectKamarSantri(kamarPeriode.id, santriKamarItem.santri.id)}
                                      />
                                    )}
                                    <div>
                                      <div className="text-sm font-medium">{santriKamarItem.santri.nama}</div>
                                      <div className="text-xs text-muted-foreground">{santriKamarItem.santri.nis}</div>
                                    </div>
                                  </div>
                                  {!isSelectMode && <ArrowLeftRight className="h-3 w-3 text-muted-foreground" />}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}