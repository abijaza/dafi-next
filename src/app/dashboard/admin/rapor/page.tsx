'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  Users, 
  Building,
  GraduationCap,
  Award,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  User
} from 'lucide-react'
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
  alamat: string
  namaOrtu: string
  noHpOrtu: string
  kamarInfo?: {
    kamar: string
    gedung: string
  }
  kelas: string
}

interface NilaiByAspek {
  [aspekName: string]: Array<{
    kategori: string
    deskripsi: string
    nilai: number
    predikat: string
    predikatDesc: string
  }>
}

interface AveragesByAspek {
  [aspekName: string]: {
    average: number
    predikat: string
    predikatDesc: string
  }
}

interface RaporData {
  santri: Santri
  nilaiByAspek: NilaiByAspek
  averagesByAspek: AveragesByAspek
  overallAverage: {
    average: number
    predikat: string
    predikatDesc: string
  }
  periode: Periode
}

export default function RaporManagement() {
  const [activeTab, setActiveTab] = useState('view')
  const [periodeList, setPeriodeList] = useState<Periode[]>([])
  const [santriList, setSantriList] = useState<Santri[]>([])
  const [raporList, setRaporList] = useState<RaporData[]>([])
  const [selectedPeriode, setSelectedPeriode] = useState<string>('')
  const [selectedSantri, setSelectedSantri] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedRapor, setSelectedRapor] = useState<RaporData | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (selectedPeriode) {
      fetchRaporData()
    }
  }, [selectedPeriode, selectedSantri])

  const fetchInitialData = async () => {
    try {
      const [periodeRes, santriRes] = await Promise.all([
        fetch('/api/periode'),
        fetch('/api/santri?status=AKTIF')
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
      }
    } catch (error) {
      console.error('Error fetching initial data:', error)
      toast.error('Gagal memuat data')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRaporData = async () => {
    if (!selectedPeriode) return

    setIsLoading(true)
    try {
      const params = new URLSearchParams({ periodeId: selectedPeriode })
      if (selectedSantri) {
        params.append('santriId', selectedSantri)
      }

      const response = await fetch(`/api/rapor?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setRaporList(data)
      } else {
        const error = await response.json()
        toast.error(error.message || 'Gagal mengambil data rapor')
      }
    } catch (error) {
      console.error('Error fetching rapor data:', error)
      toast.error('Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
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

  const getPredikatIcon = (predikat: string) => {
    switch (predikat) {
      case 'A': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'B': return <CheckCircle className="h-4 w-4 text-blue-600" />
      case 'C': return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'D': return <AlertCircle className="h-4 w-4 text-red-600" />
      default: return null
    }
  }

  const handlePreviewRapor = (rapor: RaporData) => {
    setSelectedRapor(rapor)
    setIsPreviewOpen(true)
  }

  const handleGeneratePDF = async (rapor: RaporData) => {
    setIsGenerating(true)
    try {
      // TODO: Implement PDF generation
      toast.success('PDF rapor akan segera tersedia')
    } catch (error) {
      toast.error('Gagal generate PDF')
    } finally {
      setIsGenerating(false)
    }
  }

  const activePeriode = periodeList.find(p => p.id === selectedPeriode)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Rapor</h1>
        <p className="text-gray-600">Lihat dan generate rapor santri berdasarkan periode akademik</p>
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
              <label className="text-sm font-medium">Santri (Opsional)</label>
              <Select value={selectedSantri} onValueChange={setSelectedSantri}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua santri" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua santri</SelectItem>
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
          <TabsTrigger value="view" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Lihat Rapor
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Generate PDF
          </TabsTrigger>
        </TabsList>

        {/* Lihat Rapor Tab */}
        <TabsContent value="view" className="space-y-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat data rapor...</p>
            </div>
          ) : raporList.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Belum ada data rapor untuk periode ini</p>
                <Button 
                  onClick={() => setActiveTab('generate')}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Generate Rapor
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {raporList.map((rapor) => (
                <Card key={rapor.santri.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{rapor.santri.nama}</CardTitle>
                        <CardDescription className="text-sm">
                          NIS: {rapor.santri.nis}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1">
                        {getPredikatIcon(rapor.overallAverage.predikat)}
                        <Badge className={getPredikatColor(rapor.overallAverage.predikat)}>
                          {rapor.overallAverage.average}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-600">
                          {rapor.santri.kamarInfo?.kamar || '-'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <GraduationCap className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-600">
                          {rapor.santri.kelas}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Nilai per Aspek:</div>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(rapor.averagesByAspek).map(([aspek, data]) => (
                          <div key={aspek} className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">{aspek}:</span>
                            <Badge className={`text-xs ${getPredikatColor(data.predikat)}`}>
                              {data.average}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreviewRapor(rapor)}
                        className="flex-1"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleGeneratePDF(rapor)}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                        disabled={isGenerating}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Generate PDF Tab */}
        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Rapor PDF</CardTitle>
              <CardDescription>
                Generate rapor untuk semua santri atau santri tertentu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => {
                    // TODO: Implement bulk PDF generation
                    toast.success('Generate semua rapor akan segera tersedia')
                  }}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isGenerating}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Generate Semua Rapor
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // TODO: Implement selective PDF generation
                    toast.success('Generate rapor terpilih akan segera tersedia')
                  }}
                  disabled={isGenerating}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Generate Santri Terpilih
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview Rapor</DialogTitle>
            <DialogDescription>
              {selectedRapor?.santri.nama} - {selectedRapor?.periode.tahunAjaran} Semester {selectedRapor?.periode.semester}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRapor && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Nama:</span>
                    <span className="text-sm">{selectedRapor.santri.nama}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">NIS:</span>
                    <span className="text-sm">{selectedRapor.santri.nis}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Kelas:</span>
                    <span className="text-sm">{selectedRapor.santri.kelas}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Kamar:</span>
                    <span className="text-sm">{selectedRapor.santri.kamarInfo?.kamar || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Orang Tua:</span>
                    <span className="text-sm">{selectedRapor.santri.namaOrtu || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">No. HP:</span>
                    <span className="text-sm">{selectedRapor.santri.noHpOrtu || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Nilai per Aspek */}
              {Object.entries(selectedRapor.nilaiByAspek).map(([aspekName, kategoriNilai]) => (
                <Card key={aspekName}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{aspekName}</CardTitle>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Rata-rata:</span>
                        <Badge className={getPredikatColor(selectedRapor.averagesByAspek[aspekName].predikat)}>
                          {selectedRapor.averagesByAspek[aspekName].average} ({selectedRapor.averagesByAspek[aspekName].predikat})
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {kategoriNilai.map((kategori, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex-1">
                            <div className="font-medium">{kategori.kategori}</div>
                            <div className="text-sm text-gray-600">{kategori.deskripsi}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">{kategori.nilai}</div>
                            <Badge className={`text-xs ${getPredikatColor(kategori.predikat)}`}>
                              {kategori.predikatDesc}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Overall Summary */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-red-600" />
                    Nilai Keseluruhan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600">Rata-rata keseluruhan</div>
                      <div className="text-2xl font-bold">{selectedRapor.overallAverage.average}</div>
                    </div>
                    <div className="text-right">
                      <Badge className={`text-lg px-4 py-2 ${getPredikatColor(selectedRapor.overallAverage.predikat)}`}>
                        {selectedRapor.overallAverage.predikat} - {selectedRapor.overallAverage.predikatDesc}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}