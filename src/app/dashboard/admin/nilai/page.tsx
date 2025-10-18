'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Edit, Save, X, CheckCircle, AlertCircle, Users, Calendar, FileText } from 'lucide-react'
import { toast } from 'sonner'

interface Periode {
  id: string
  tahunAjaran: string
  semester: string
  midSemester: string
  isActive: boolean
}

interface Santri {
  id: string
  nis: string
  nama: string
  status: string
  kamar?: {
    nama: string
    gedung: { nama: string }
  }
  waliSantri?: {
    nama: string
    email: string
  }
}

interface AspekNilai {
  id: string
  nama: string
  deskripsi: string
  kategori: Kategori[]
}

interface Kategori {
  id: string
  aspekId: string
  nama: string
  deskripsi: string
  bobot: number
}

interface Nilai {
  id: string
  santriId: string
  kategoriId: string
  periodeId: string
  skor: number
  predikat: string
  deskripsi: string
  createdAt: string
  updatedAt: string
  santri: Santri
  kategori: Kategori
  periode: Periode
}

export default function NilaiManagement() {
  const [activeTab, setActiveTab] = useState('input')
  const [periodeList, setPeriodeList] = useState<Periode[]>([])
  const [santriList, setSantriList] = useState<Santri[]>([])
  const [aspekNilaiList, setAspekNilaiList] = useState<AspekNilai[]>([])
  const [nilaiList, setNilaiList] = useState<Nilai[]>([])
  const [selectedPeriode, setSelectedPeriode] = useState<string>('')
  const [selectedSantri, setSelectedSantri] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingNilai, setEditingNilai] = useState<Nilai | null>(null)
  const [formData, setFormData] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedPeriode && selectedSantri) {
      fetchNilai()
    }
  }, [selectedPeriode, selectedSantri])

  const fetchData = async () => {
    try {
      const [periodeRes, santriRes, aspekRes] = await Promise.all([
        fetch('/api/periode'),
        fetch('/api/santri?status=AKTIF'),
        fetch('/api/aspek-nilai')
      ])

      if (periodeRes.ok) {
        const periodeData = await periodeRes.json()
        setPeriodeList(periodeData)
        const activePeriode = periodeData.find((p: Periode) => p.isActive)
        if (activePeriode) {
          setSelectedPeriode(activePeriode.id)
        }
      }

      if (santriRes.ok) {
        const santriData = await santriRes.json()
        setSantriList(santriData)
        if (santriData.length > 0) {
          setSelectedSantri(santriData[0].id)
        }
      }

      if (aspekRes.ok) {
        const aspekData = await aspekRes.json()
        setAspekNilaiList(aspekData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Gagal memuat data')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchNilai = async () => {
    if (!selectedPeriode || !selectedSantri) return

    try {
      const response = await fetch(`/api/nilai?periodeId=${selectedPeriode}&santriId=${selectedSantri}`)
      if (response.ok) {
        const data = await response.json()
        setNilaiList(data)
        
        // Initialize form data with existing values
        const initialFormData: Record<string, number> = {}
        data.forEach((nilai: Nilai) => {
          initialFormData[nilai.kategoriId] = nilai.skor
        })
        setFormData(initialFormData)
      }
    } catch (error) {
      console.error('Error fetching nilai:', error)
    }
  }

  const handleScoreChange = (kategoriId: string, skor: number) => {
    setFormData(prev => ({
      ...prev,
      [kategoriId]: skor
    }))
  }

  const getPredikat = (skor: number): string => {
    if (skor >= 85) return 'A'
    if (skor >= 70) return 'B'
    if (skor >= 60) return 'C'
    return 'D'
  }

  const getPredikatColor = (predikat: string): string => {
    switch (predikat) {
      case 'A': return 'bg-green-100 text-green-800'
      case 'B': return 'bg-blue-100 text-blue-800'
      case 'C': return 'bg-yellow-100 text-yellow-800'
      case 'D': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPredikatText = (predikat: string): string => {
    switch (predikat) {
      case 'A': return 'Baik Sekali'
      case 'B': return 'Baik'
      case 'C': return 'Cukup'
      case 'D': return 'Kurang'
      default: return predikat
    }
  }

  const handleSave = async () => {
    if (!selectedPeriode || !selectedSantri) {
      toast.error('Pilih periode dan santri terlebih dahulu')
      return
    }

    setIsSaving(true)
    try {
      const nilaiData = Object.entries(formData).map(([kategoriId, skor]) => ({
        santriId: selectedSantri,
        kategoriId,
        periodeId: selectedPeriode,
        skor,
        predikat: getPredikat(skor)
      }))

      const response = await fetch('/api/nilai/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nilai: nilaiData }),
      })

      if (response.ok) {
        toast.success('Nilai berhasil disimpan')
        fetchNilai()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Gagal menyimpan nilai')
      }
    } catch (error) {
      console.error('Error saving nilai:', error)
      toast.error('Terjadi kesalahan')
    } finally {
      setIsSaving(false)
    }
  }

  const calculateAspekAverage = (aspekId: string): number => {
    const aspekKategori = aspekNilaiList.find(a => a.id === aspekId)?.kategori || []
    const aspekNilai = aspekKategori.map(k => formData[k.id] || 0).filter(s => s > 0)
    
    if (aspekNilai.length === 0) return 0
    return Math.round(aspekNilai.reduce((a, b) => a + b, 0) / aspekNilai.length)
  }

  const calculateOverallAverage = (): number => {
    const allScores = Object.values(formData).filter(s => s > 0)
    if (allScores.length === 0) return 0
    return Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
  }

  const activeSantri = santriList.find(s => s.id === selectedSantri)
  const activePeriode = periodeList.find(p => p.id === selectedPeriode)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Nilai</h1>
        <p className="text-gray-600">Input dan kelola nilai santri berdasarkan aspek pembinaan</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filter Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Periode</label>
              <Select value={selectedPeriode} onValueChange={setSelectedPeriode}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih periode" />
                </SelectTrigger>
                <SelectContent>
                  {periodeList.map((periode) => (
                    <SelectItem key={periode.id} value={periode.id}>
                      {periode.tahunAjaran} - Semester {periode.semester} ({periode.midSemester === 'TENGAH' ? 'Tengah Semester' : 'Akhir Semester'}){periode.isActive && ' - Aktif'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Santri</label>
              <Select value={selectedSantri} onValueChange={setSelectedSantri}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih santri" />
                </SelectTrigger>
                <SelectContent>
                  {santriList.map((santri) => (
                    <SelectItem key={santri.id} value={santri.id}>
                      {santri.nama} ({santri.nis})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="input" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Input Nilai
          </TabsTrigger>
          <TabsTrigger value="review" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Review Nilai
          </TabsTrigger>
        </TabsList>

        {/* Input Nilai Tab */}
        <TabsContent value="input" className="space-y-6">
          {activeSantri && activePeriode && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Input Nilai Santri</CardTitle>
                <CardDescription>
                  {activeSantri.nama} ({activeSantri.nis}) - {activePeriode.tahunAjaran} Semester {activePeriode.semester}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {aspekNilaiList.map((aspek) => (
                    <div key={aspek.id} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{aspek.nama}</h3>
                          <p className="text-sm text-gray-600">{aspek.deskripsi}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Rata-rata</div>
                          <div className="text-lg font-bold">
                            {calculateAspekAverage(aspek.id)}
                            <Badge className={`ml-2 ${getPredikatColor(getPredikat(calculateAspekAverage(aspek.id)))}`}>
                              {getPredikat(calculateAspekAverage(aspek.id))}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {aspek.kategori.map((kategori) => (
                          <div key={kategori.id} className="space-y-2">
                            <label className="text-sm font-medium">{kategori.nama}</label>
                            <p className="text-xs text-gray-500 mb-2">{kategori.deskripsi}</p>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={formData[kategori.id] || 0}
                                onChange={(e) => handleScoreChange(kategori.id, parseInt(e.target.value))}
                                className="flex-1"
                              />
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={formData[kategori.id] || ''}
                                onChange={(e) => handleScoreChange(kategori.id, parseInt(e.target.value) || 0)}
                                className="w-16 px-2 py-1 border rounded text-center"
                              />
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">Bobot: {kategori.bobot}</span>
                              <Badge className={`text-xs ${getPredikatColor(getPredikat(formData[kategori.id] || 0))}`}>
                                {getPredikat(formData[kategori.id] || 0)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {/* Overall Summary */}
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Nilai Keseluruhan</h3>
                        <p className="text-sm text-gray-600">Rata-rata dari semua aspek</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Total Rata-rata</div>
                        <div className="text-2xl font-bold">
                          {calculateOverallAverage()}
                          <Badge className={`ml-2 ${getPredikatColor(getPredikat(calculateOverallAverage()))}`}>
                            {getPredikat(getPredikat(calculateOverallAverage()))} - {getPredikatText(getPredikat(calculateOverallAverage()))}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSave}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Simpan Nilai
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Review Nilai Tab */}
        <TabsContent value="review" className="space-y-6">
          {activeSantri && activePeriode && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Review Nilai Santri</CardTitle>
                <CardDescription>
                  {activeSantri.nama} ({activeSantri.nis}) - {activePeriode.tahunAjaran} Semester {activePeriode.semester}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {nilaiList.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p>Belum ada nilai untuk santri ini pada periode ini</p>
                    <Button 
                      onClick={() => setActiveTab('input')}
                      className="mt-4 bg-red-600 hover:bg-red-700"
                    >
                      Input Nilai Sekarang
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {aspekNilaiList.map((aspek) => {
                      const aspekNilai = nilaiList.filter(n => n.kategori.aspekId === aspek.id)
                      if (aspekNilai.length === 0) return null

                      const aspekAverage = Math.round(aspekNilai.reduce((sum, n) => sum + n.skor, 0) / aspekNilai.length)

                      return (
                        <div key={aspek.id} className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold">{aspek.nama}</h3>
                              <p className="text-sm text-gray-600">{aspek.deskripsi}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500">Rata-rata</div>
                              <div className="text-lg font-bold">
                                {aspekAverage}
                                <Badge className={`ml-2 ${getPredikatColor(getPredikat(aspekAverage))}`}>
                                  {getPredikat(aspekAverage)} - {getPredikatText(getPredikat(aspekAverage))}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {aspekNilai.map((nilai) => (
                              <div key={nilai.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-medium">{nilai.kategori.nama}</h4>
                                  <Badge className={getPredikatColor(nilai.predikat)}>
                                    {nilai.predikat}
                                  </Badge>
                                </div>
                                <div className="text-2xl font-bold mb-1">{nilai.skor}</div>
                                <p className="text-xs text-gray-500 mb-2">{nilai.kategori.deskripsi}</p>
                                <div className="text-xs text-gray-400">
                                  Bobot: {nilai.kategori.bobot}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}

                    {/* Overall Summary */}
                    <div className="border-t pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">Nilai Keseluruhan</h3>
                          <p className="text-sm text-gray-600">Rata-rata dari semua aspek</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Total Rata-rata</div>
                          <div className="text-2xl font-bold">
                            {Math.round(nilaiList.reduce((sum, n) => sum + n.skor, 0) / nilaiList.length)}
                            <Badge className={`ml-2 ${getPredikatColor(getPredikat(Math.round(nilaiList.reduce((sum, n) => sum + n.skor, 0) / nilaiList.length)))}`}>
                              {getPredikat(Math.round(nilaiList.reduce((sum, n) => sum + n.skor, 0) / nilaiList.length))} - {getPredikatText(getPredikat(Math.round(nilaiList.reduce((sum, n) => sum + n.skor, 0) / nilaiList.length)))}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}