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
  GraduationCap, 
  Users,
  ArrowLeftRight,
  Calendar,
  Search,
  CheckSquare,
  Square,
  Trash2,
  Move,
  UserPlus
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface Periode {
  id: string
  tahunAjaran: string
  semester: string
  midSemester: string
  isActive: boolean
}

interface Kelas {
  id: string
  nama: string
  deskripsi: string | null
  jenjang: {
    id: string
    nama: string
    tingkat: {
      id: string
      nama: string
    }
  }
}

interface Santri {
  id: string
  nis: string
  nama: string
  status: string
}

interface KelasPeriode {
  id: string
  kelas: Kelas
  periode: Periode
}

interface SantriKelas {
  id: string
  santri: Santri
  kelasPeriode: KelasPeriode
}

export default function KelasSantriManagement() {
  const { user } = useAuth()
  const [periodes, setPeriodes] = useState<Periode[]>([])
  const [kelas, setKelas] = useState<Kelas[]>([])
  const [kelasPeriodes, setKelasPeriodes] = useState<KelasPeriode[]>([])
  const [santri, setSantri] = useState<Santri[]>([])
  const [santriKelas, setSantriKelas] = useState<SantriKelas[]>([])
  const [selectedPeriode, setSelectedPeriode] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [draggedSantri, setDraggedSantri] = useState<Santri | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState<string | null>(null)
  const [bulkLoading, setBulkLoading] = useState(false)
  
  // Search and filter states
  const [searchAvailable, setSearchAvailable] = useState('')
  const [searchKelas, setSearchKelas] = useState('')
  const [selectedKelasFilter, setSelectedKelasFilter] = useState<string>('all')
  const [selectedTingkatFilter, setSelectedTingkatFilter] = useState<string>('all')
  const [selectedJenjangFilter, setSelectedJenjangFilter] = useState<string>('all')
  
  // Multi-select states
  const [selectedAvailableSantri, setSelectedAvailableSantri] = useState<string[]>([])
  const [selectedKelasSantri, setSelectedKelasSantri] = useState<{ [kelasId: string]: string[] }>({})
  const [isSelectMode, setIsSelectMode] = useState(false)

  // Reset jenjang and kelas filters when tingkat filter changes
  useEffect(() => {
    setSelectedJenjangFilter('all')
    setSelectedKelasFilter('all')
  }, [selectedTingkatFilter])

  // Reset kelas filter when jenjang filter changes
  useEffect(() => {
    setSelectedKelasFilter('all')
  }, [selectedJenjangFilter])
  
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
      fetchKelasPeriodes()
      fetchSantriKelas()
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

  // Add effect to trigger re-render when santriKelas changes
  useEffect(() => {
    // This will ensure the component re-renders when santriKelas changes
    // which affects the getAvailableSantri() calculation
  }, [santriKelas, santri])

  const fetchInitialData = async () => {
    try {
      const [periodesRes, kelasRes, santriRes] = await Promise.all([
        fetch('/api/periode'),
        fetch('/api/kelas'),
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

      if (kelasRes.ok) {
        const kelasData = await kelasRes.json()
        // Handle both old format (array) and new format (with data property)
        const kelasArray = Array.isArray(kelasData) ? kelasData : (kelasData.data || kelasData)
        setKelas(kelasArray)
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

  const fetchKelasPeriodes = async () => {
    try {
      const response = await fetch(`/api/kelas-periode?periodeId=${selectedPeriode}`)
      if (response.ok) {
        const data = await response.json()
        setKelasPeriodes(data)
      }
    } catch (error) {
      console.error('Error fetching kelas periodes:', error)
    }
  }

  const fetchSantriKelas = async () => {
    try {
      const response = await fetch(`/api/santri-kelas?periodeId=${selectedPeriode}`)
      if (response.ok) {
        const data = await response.json()
        setSantriKelas(data)
      }
    } catch (error) {
      console.error('Error fetching santri kelas:', error)
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

  const handleDropToKelas = async (e: React.DragEvent, kelasPeriodeId: string) => {
    e.preventDefault()
    setIsDraggingOver(null)
    if (!draggedSantri) return

    try {
      const response = await fetch('/api/santri-kelas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          santriId: draggedSantri.id,
          kelasPeriodeId
        })
      })

      if (response.ok) {
        setSuccess(`${draggedSantri.nama} berhasil ditambahkan ke kelas`)
        fetchSantriKelas()
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
    
    // Find the santri kelas entry for this dragged santri
    const santriKelasItem = santriKelas.find(sk => sk.santri.id === draggedSantri.id)
    
    if (santriKelasItem) {
      try {
        const response = await fetch(`/api/santri-kelas/${santriKelasItem.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (response.ok) {
          setSuccess(`${draggedSantri.nama} berhasil dikeluarkan dari kelas`)
          // Refresh both santri kelas and available santri data
          await fetchSantriKelas()
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
    const assignedSantriIds = santriKelas.map(sk => sk.santri.id)
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

  const getSantriByKelas = (kelasPeriodeId: string) => {
    let santriInKelas = santriKelas.filter(sk => sk.kelasPeriode.id === kelasPeriodeId)
    
    // Apply search filter
    if (searchKelas) {
      santriInKelas = santriInKelas.filter(sk => 
        sk.santri.nama.toLowerCase().includes(searchKelas.toLowerCase()) ||
        sk.santri.nis.toLowerCase().includes(searchKelas.toLowerCase())
      )
    }
    
    return santriInKelas
  }

  const getFilteredKelasPeriodes = () => {
    let filtered = kelasPeriodes

    // Filter by tingkat
    if (selectedTingkatFilter !== 'all') {
      filtered = filtered.filter(kp => 
        kp.kelas.jenjang?.tingkat?.id === selectedTingkatFilter
      )
    }

    // Filter by jenjang
    if (selectedJenjangFilter !== 'all') {
      filtered = filtered.filter(kp => 
        kp.kelas.jenjang?.id === selectedJenjangFilter
      )
    }

    // Filter by specific kelas
    if (selectedKelasFilter !== 'all') {
      filtered = filtered.filter(kp => kp.kelas.id === selectedKelasFilter)
    }

    return filtered
  }

  const getAvailableTingkat = () => {
    const tingkatMap = new Map()
    kelasPeriodes.forEach(kp => {
      if (kp.kelas.jenjang?.tingkat) {
        const tingkat = kp.kelas.jenjang.tingkat
        if (!tingkatMap.has(tingkat.id)) {
          tingkatMap.set(tingkat.id, tingkat)
        }
      }
    })
    return Array.from(tingkatMap.values())
  }

  const getAvailableJenjang = () => {
    const jenjangMap = new Map()
    kelasPeriodes.forEach(kp => {
      if (kp.kelas.jenjang) {
        const jenjang = kp.kelas.jenjang
        if (!jenjangMap.has(jenjang.id)) {
          jenjangMap.set(jenjang.id, jenjang)
        }
      }
    })
    return Array.from(jenjangMap.values())
  }

  const getFilteredJenjang = () => {
    if (selectedTingkatFilter === 'all') {
      return getAvailableJenjang()
    }
    return getAvailableJenjang().filter(j => j.tingkat?.id === selectedTingkatFilter)
  }

  // Multi-select functions
  const toggleSelectAvailableSantri = (santriId: string) => {
    setSelectedAvailableSantri(prev => 
      prev.includes(santriId) 
        ? prev.filter(id => id !== santriId)
        : [...prev, santriId]
    )
  }

  const toggleSelectAllAvailable = () => {
    const availableIds = getAvailableSantri().map(s => s.id)
    if (selectedAvailableSantri.length === availableIds.length) {
      setSelectedAvailableSantri([])
    } else {
      setSelectedAvailableSantri(availableIds)
    }
  }

  const toggleSelectKelasSantri = (kelasId: string, santriId: string) => {
    setSelectedKelasSantri(prev => ({
      ...prev,
      [kelasId]: prev[kelasId]?.includes(santriId)
        ? prev[kelasId].filter(id => id !== santriId)
        : [...(prev[kelasId] || []), santriId]
    }))
  }

  const toggleSelectAllKelas = (kelasId: string) => {
    const kelasSantriIds = getSantriByKelas(kelasId).map(sk => sk.santri.id)
    if (selectedKelasSantri[kelasId]?.length === kelasSantriIds.length) {
      setSelectedKelasSantri(prev => ({
        ...prev,
        [kelasId]: []
      }))
    } else {
      setSelectedKelasSantri(prev => ({
        ...prev,
        [kelasId]: kelasSantriIds
      }))
    }
  }

  const bulkMoveToKelas = async (kelasPeriodeId: string) => {
    if (selectedAvailableSantri.length === 0) return

    setBulkLoading(true)
    try {
      const promises = selectedAvailableSantri.map(santriId =>
        fetch('/api/santri-kelas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            santriId,
            kelasPeriodeId
          })
        })
      )

      const results = await Promise.all(promises)
      const successCount = results.filter(r => r.ok).length
      const failCount = results.length - successCount

      if (successCount > 0) {
        setSuccess(`${successCount} santri berhasil ditambahkan ke kelas${failCount > 0 ? ` (${failCount} gagal)` : ''}`)
        setSelectedAvailableSantri([])
        await fetchSantriKelas()
      } else {
        setError('Semua santri gagal ditambahkan ke kelas')
      }
    } catch (error) {
      setError('Terjadi kesalahan server')
    } finally {
      setBulkLoading(false)
    }
  }

  const bulkMoveToAvailable = async (kelasId: string) => {
    const selectedIds = selectedKelasSantri[kelasId] || []
    if (selectedIds.length === 0) return

    setBulkLoading(true)
    try {
      const santriKelasItems = santriKelas.filter(sk => 
        sk.kelasPeriode.id === kelasId && selectedIds.includes(sk.santri.id)
      )

      const promises = santriKelasItems.map(item =>
        fetch(`/api/santri-kelas/${item.id}`, {
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
        setSuccess(`${successCount} santri berhasil dikeluarkan dari kelas${failCount > 0 ? ` (${failCount} gagal)` : ''}`)
        setSelectedKelasSantri(prev => ({ ...prev, [kelasId]: [] }))
        await fetchSantriKelas()
        setSantri(prev => [...prev])
      } else {
        setError('Semua santri gagal dikeluarkan dari kelas')
      }
    } catch (error) {
      setError('Terjadi kesalahan server')
    } finally {
      setBulkLoading(false)
    }
  }

  const emptyKelas = async (kelasPeriodeId: string) => {
    const santriInKelas = getSantriByKelas(kelasPeriodeId)
    if (santriInKelas.length === 0) return

    if (!confirm(`Apakah Anda yakin ingin mengosongkan kelas ini? ${santriInKelas.length} santri akan dikeluarkan.`)) {
      return
    }

    setBulkLoading(true)
    try {
      const promises = santriInKelas.map(item =>
        fetch(`/api/santri-kelas/${item.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      )

      const results = await Promise.all(promises)
      const successCount = results.filter(r => r.ok).length

      if (successCount > 0) {
        setSuccess(`Kelas berhasil dikosongkan (${successCount} santri dikeluarkan)`)
        setSelectedKelasSantri(prev => ({ ...prev, [kelasPeriodeId]: [] }))
        await fetchSantriKelas()
        setSantri(prev => [...prev])
      } else {
        setError('Gagal mengosongkan kelas')
      }
    } catch (error) {
      setError('Terjadi kesalahan server')
    } finally {
      setBulkLoading(false)
    }
  }

  const addKelasToPeriode = async (kelasId: string) => {
    try {
      const response = await fetch('/api/kelas-periode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          periodeId: selectedPeriode,
          kelasId
        })
      })

      if (response.ok) {
        setSuccess('Kelas berhasil ditambahkan ke periode')
        fetchKelasPeriodes()
      } else {
        const data = await response.json()
        setError(data.message || 'Terjadi kesalahan')
      }
    } catch (error) {
      setError('Terjadi kesalahan server')
    }
  }

  const availableKelas = kelas.filter(k => 
    !kelasPeriodes.some(kp => kp.kelas.id === k.id && kp.periode.id === selectedPeriode)
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pengaturan Kelas Santri</h1>
          <p className="text-muted-foreground">Kelola penempatan santri di kelas berdasarkan periode</p>
        </div>
      </div>

      {/* Periode Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Pilih Periode</CardTitle>
          <CardDescription>
            Pilih periode akademik untuk mengatur kelas santri
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

      {/* Add Kelas to Periode */}
      {selectedPeriode && availableKelas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tambah Kelas ke Periode</CardTitle>
            <CardDescription>
              Pilih kelas untuk ditambahkan ke periode terpilih
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {availableKelas.map((kelasItem) => (
                <Button
                  key={kelasItem.id}
                  variant="outline"
                  onClick={() => addKelasToPeriode(kelasItem.id)}
                  className="flex items-center gap-2"
                >
                  <GraduationCap className="h-4 w-4" />
                  {kelasItem.nama}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
            <CardTitle className="text-sm font-medium">Santri Terkelas</CardTitle>
            <GraduationCap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{santriKelas.length}</div>
            <p className="text-xs text-muted-foreground">Sudah ditempatkan di kelas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kelas Aktif</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{kelasPeriodes.length}</div>
            <p className="text-xs text-muted-foreground">Kelas dalam periode</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Belum Berkelas</CardTitle>
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
                Seret santri ke kanan untuk memasukkan ke kelas, atau seret dari kelas ke sini untuk mengeluarkan
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
              
              {/* Multi-select Controls */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSelectMode(!isSelectMode)}
                    className="flex items-center gap-1"
                  >
                    {isSelectMode ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                    {isSelectMode ? 'Selesai' : 'Pilih'}
                  </Button>
                  
                  {isSelectMode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleSelectAllAvailable}
                      className="flex items-center gap-1"
                    >
                      {selectedAvailableSantri.length === getAvailableSantri().length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                    </Button>
                  )}
                </div>
                
                {selectedAvailableSantri.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {selectedAvailableSantri.length} terpilih
                    </Badge>
                    <Select value="" onValueChange={(value) => value && bulkMoveToKelas(value)}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Pindahkan ke kelas..." />
                      </SelectTrigger>
                      <SelectContent>
                        {getFilteredKelasPeriodes().map((kelasPeriode) => (
                          <SelectItem key={kelasPeriode.id} value={kelasPeriode.id}>
                            {kelasPeriode.kelas.jenjang?.tingkat?.nama || ''} {kelasPeriode.kelas.jenjang?.nama || ''} - {kelasPeriode.kelas.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div 
                key={`available-${santriKelas.length}`} // Force re-render when santriKelas changes
                className={`space-y-2 max-h-96 overflow-y-auto border-2 border-dashed rounded-lg p-3 min-h-[200px] transition-colors ${
                  isDraggingOver === 'available' 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
                onDragOver={(e) => handleDragOver(e, 'available')}
                onDragLeave={handleDragLeave}
                onDrop={handleDropToAvailableArea}
              >
                {getAvailableSantri().length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    {searchAvailable 
                      ? 'Tidak ada santri yang cocok dengan pencarian' 
                      : 'Semua santri sudah ditempatkan di kelas'
                    }
                  </p>
                ) : (
                  getAvailableSantri().map((santriItem) => (
                    <div
                      key={santriItem.id}
                      draggable={!isSelectMode}
                      onDragStart={() => !isSelectMode && handleDragStart(santriItem)}
                      className={`p-3 border rounded-lg cursor-move transition-colors ${
                        isSelectMode 
                          ? 'bg-white hover:bg-gray-50 cursor-pointer'
                          : 'bg-white hover:bg-gray-50'
                      } ${selectedAvailableSantri.includes(santriItem.id) 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : ''
                      }`}
                      onClick={() => isSelectMode && toggleSelectAvailableSantri(santriItem.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isSelectMode && (
                            <Checkbox
                              checked={selectedAvailableSantri.includes(santriItem.id)}
                              onChange={() => toggleSelectAvailableSantri(santriItem.id)}
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

          {/* Classes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Kelas Periode
                </div>
                <Badge variant="outline" className="text-sm">
                  {santriKelas.length} Santri
                </Badge>
              </CardTitle>
              <CardDescription>
                Drop zone untuk santri ({getFilteredKelasPeriodes().length} kelas)
              </CardDescription>
              
              {/* Filter by Kelas */}
              <div className="space-y-3">
                {/* Filter by Tingkat */}
                <Select value={selectedTingkatFilter} onValueChange={setSelectedTingkatFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter berdasarkan tingkat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Tingkat</SelectItem>
                    {getAvailableTingkat().map((tingkat) => (
                      <SelectItem key={tingkat.id} value={tingkat.id}>
                        {tingkat.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Filter by Jenjang */}
                <Select value={selectedJenjangFilter} onValueChange={setSelectedJenjangFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter berdasarkan jenjang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Jenjang</SelectItem>
                    {getFilteredJenjang().map((jenjang) => (
                      <SelectItem key={jenjang.id} value={jenjang.id}>
                        {jenjang.tingkat?.nama || ''} {jenjang.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Filter by Kelas */}
                <Select value={selectedKelasFilter} onValueChange={setSelectedKelasFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter berdasarkan kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kelas</SelectItem>
                    {kelas
                      .filter(k => {
                        if (selectedTingkatFilter !== 'all' && k.jenjang?.tingkat?.id !== selectedTingkatFilter) {
                          return false
                        }
                        if (selectedJenjangFilter !== 'all' && k.jenjang.id !== selectedJenjangFilter) {
                          return false
                        }
                        return true
                      })
                      .map((kelasItem) => (
                        <SelectItem key={kelasItem.id} value={kelasItem.id}>
                          {kelasItem.jenjang?.tingkat?.nama || ''} {kelasItem.jenjang?.nama || ''} - {kelasItem.nama}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                
                {/* Search for Santri in Classes */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari santri di kelas..."
                    value={searchKelas}
                    onChange={(e) => setSearchKelas(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {getFilteredKelasPeriodes().length === 0 ? (
                  <div className="text-center py-8">
                    <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {selectedKelasFilter !== 'all' 
                        ? 'Tidak ada kelas yang cocok dengan filter' 
                        : 'Belum ada kelas dalam periode ini'
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedKelasFilter !== 'all' 
                        ? 'Coba pilih filter lain' 
                        : 'Tambah kelas terlebih dahulu'
                      }
                    </p>
                  </div>
                ) : (
                  getFilteredKelasPeriodes().map((kelasPeriode) => {
                    const santriInKelas = getSantriByKelas(kelasPeriode.id)
                    return (
                      <div
                        key={kelasPeriode.id}
                        onDragOver={(e) => handleDragOver(e, kelasPeriode.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDropToKelas(e, kelasPeriode.id)}
                        className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
                          isDraggingOver === kelasPeriode.id
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">
  {kelasPeriode.kelas.jenjang?.tingkat?.nama || ''} {kelasPeriode.kelas.jenjang?.nama || ''} - {kelasPeriode.kelas.nama}
</h4>
                            <div className="flex items-center gap-2">
                              {isSelectMode && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => toggleSelectAllKelas(kelasPeriode.id)}
                                  className="flex items-center gap-1"
                                >
                                  {selectedKelasSantri[kelasPeriode.id]?.length === santriInKelas.length ? 'Batal' : 'Pilih Semua'}
                                </Button>
                              )}
                              <Badge variant="secondary">{santriInKelas.length} santri</Badge>
                              {selectedKelasSantri[kelasPeriode.id]?.length > 0 && (
                                <Badge variant="default">
                                  {selectedKelasSantri[kelasPeriode.id].length} terpilih
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => emptyKelas(kelasPeriode.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={santriInKelas.length === 0 || bulkLoading}
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
                        <div className="space-y-2">
                          {santriInKelas.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-2">
                              {searchKelas 
                                ? 'Tidak ada santri yang cocok dengan pencarian' 
                                : 'Drop santri di sini'
                              }
                            </p>
                          ) : (
                            santriInKelas.map((santriKelasItem) => (
                              <div
                                key={santriKelasItem.id}
                                draggable={!isSelectMode}
                                onDragStart={() => !isSelectMode && handleDragStart(santriKelasItem.santri)}
                                className={`p-2 border rounded cursor-move transition-colors ${
                                  isSelectMode 
                                    ? 'bg-white border-gray-200 hover:bg-gray-50 cursor-pointer'
                                    : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                                } ${selectedKelasSantri[kelasPeriode.id]?.includes(santriKelasItem.santri.id) 
                                  ? 'ring-2 ring-blue-500 bg-blue-100' 
                                  : ''
                                }`}
                                onClick={() => isSelectMode && toggleSelectKelasSantri(kelasPeriode.id, santriKelasItem.santri.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {isSelectMode && (
                                      <Checkbox
                                        checked={selectedKelasSantri[kelasPeriode.id]?.includes(santriKelasItem.santri.id) || false}
                                        onChange={() => toggleSelectKelasSantri(kelasPeriode.id, santriKelasItem.santri.id)}
                                      />
                                    )}
                                    <div>
                                      <div className="text-sm font-medium">{santriKelasItem.santri.nama}</div>
                                      <div className="text-xs text-muted-foreground">{santriKelasItem.santri.nis}</div>
                                    </div>
                                  </div>
                                  {!isSelectMode && <ArrowLeftRight className="h-3 w-3 text-muted-foreground" />}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        {/* Bulk Action Buttons */}
                        {isSelectMode && selectedKelasSantri[kelasPeriode.id]?.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                {selectedKelasSantri[kelasPeriode.id].length} santri terpilih
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => bulkMoveToAvailable(kelasPeriode.id)}
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                disabled={bulkLoading}
                              >
                                {bulkLoading ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-orange-600 mr-1"></div>
                                    Memproses...
                                  </>
                                ) : (
                                  <>
                                    <Move className="h-3 w-3 mr-1" />
                                    Pindahkan ke Tersedia
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
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