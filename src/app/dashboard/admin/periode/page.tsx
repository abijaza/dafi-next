'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Calendar, 
  Plus, 
  Edit, 
  Power, 
  PowerOff,
  Trash2
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface Periode {
  id: string
  tahunAjaran: string
  semester: string
  midSemester: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function PeriodeManagement() {
  const { user } = useAuth()
  const [periodes, setPeriodes] = useState<Periode[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPeriode, setEditingPeriode] = useState<Periode | null>(null)
  const [formData, setFormData] = useState({
    tahunAjaran: '',
    semester: '',
    midSemester: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
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

    fetchPeriodes()
  }, [router])

  const fetchPeriodes = async () => {
    try {
      const response = await fetch('/api/periode')
      if (response.ok) {
        const data = await response.json()
        setPeriodes(data)
      }
    } catch (error) {
      console.error('Error fetching periodes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const url = editingPeriode ? `/api/periode/${editingPeriode.id}` : '/api/periode'
      const method = editingPeriode ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSuccess(editingPeriode ? 'Periode berhasil diperbarui' : 'Periode berhasil dibuat')
        setDialogOpen(false)
        setEditingPeriode(null)
        setFormData({ tahunAjaran: '', semester: '', midSemester: '' })
        fetchPeriodes()
      } else {
        const data = await response.json()
        setError(data.message || 'Terjadi kesalahan')
      }
    } catch (error) {
      setError('Terjadi kesalahan server')
    }
  }

  const handleEdit = (periode: Periode) => {
    setEditingPeriode(periode)
    setFormData({
      tahunAjaran: periode.tahunAjaran,
      semester: periode.semester,
      midSemester: periode.midSemester
    })
    setDialogOpen(true)
  }

  const handleToggleActive = async (periode: Periode) => {
    try {
      const response = await fetch(`/api/periode/${periode.id}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const action = periode.isActive ? 'dinonaktifkan' : 'diaktifkan'
        setSuccess(`Periode berhasil ${action}. Data Periodik akan otomatis menyesuaikan.`)
        fetchPeriodes()
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(''), 5000)
      } else {
        const data = await response.json()
        setError(data.message || 'Terjadi kesalahan')
      }
    } catch (error) {
      setError('Terjadi kesalahan server')
    }
  }

  const handleDelete = async (periode: Periode) => {
    if (!confirm('Apakah Anda yakin ingin menghapus periode ini?')) return

    try {
      const response = await fetch(`/api/periode/${periode.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        setSuccess('Periode berhasil dihapus')
        fetchPeriodes()
      } else {
        const data = await response.json()
        setError(data.message || 'Terjadi kesalahan')
      }
    } catch (error) {
      setError('Terjadi kesalahan server')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Periode</h1>
          <p className="text-muted-foreground">Kelola periode akademik pesantren</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Periode
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingPeriode ? 'Edit Periode' : 'Tambah Periode Baru'}
              </DialogTitle>
              <DialogDescription>
                {editingPeriode ? 'Edit informasi periode akademik' : 'Buat periode akademik baru'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="tahunAjaran">Tahun Ajaran</Label>
                  <Input
                    id="tahunAjaran"
                    placeholder="2025/2026"
                    value={formData.tahunAjaran}
                    onChange={(e) => setFormData(prev => ({ ...prev, tahunAjaran: e.target.value }))}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Select value={formData.semester} onValueChange={(value) => setFormData(prev => ({ ...prev, semester: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GANJIL">Ganjil</SelectItem>
                      <SelectItem value="GENAP">Genap</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="midSemester">Mid Semester</Label>
                  <Select value={formData.midSemester} onValueChange={(value) => setFormData(prev => ({ ...prev, midSemester: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih mid semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TENGAH">Tengah Semester</SelectItem>
                      <SelectItem value="AKHIR">Akhir Semester</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {error && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="mb-4 border-green-200 bg-green-50">
                  <AlertDescription className="text-green-700">
                    {success}
                  </AlertDescription>
                </Alert>
              )}
              <DialogFooter>
                <Button type="submit">
                  {editingPeriode ? 'Update' : 'Buat'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Periode</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{periodes.length}</div>
            <p className="text-xs text-muted-foreground">Periode terdaftar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Periode Aktif</CardTitle>
            <Power className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {periodes.filter(p => p.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">Sedang berjalan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tidak Aktif</CardTitle>
            <PowerOff className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {periodes.filter(p => !p.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">Selesai/Non-aktif</p>
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

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Periode</CardTitle>
          <CardDescription>
            Kelola periode akademik yang aktif di pesantren
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Memuat data...</p>
            </div>
          ) : periodes.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Belum ada periode yang dibuat</p>
              <p className="text-sm text-muted-foreground">Buat periode baru untuk memulai</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tahun Ajaran</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Mid Semester</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dibuat</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {periodes.map((periode) => (
                    <TableRow key={periode.id}>
                      <TableCell className="font-medium">{periode.tahunAjaran}</TableCell>
                      <TableCell>{periode.semester}</TableCell>
                      <TableCell>{periode.midSemester}</TableCell>
                      <TableCell>
                        <Badge className={periode.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {periode.isActive ? 'Aktif' : 'Tidak Aktif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(periode.createdAt).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(periode)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(periode)}
                            className={periode.isActive ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                          >
                            {periode.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(periode)}
                            className="text-red-600 hover:text-red-700"
                            disabled={periode.isActive}
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}