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
  Users, 
  Plus, 
  Edit, 
  Trash2,
  UserCheck,
  Eye,
  EyeOff,
  CheckSquare,
  Square,
  UserX
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface WaliSantri {
  id: string
  nip: string
  nama: string
  email: string
  noHp: string | null
  role: string
  isAdmin: boolean
  isKepalaKepengasuhan: boolean
  isWaliKamar: boolean
  isWaliSantri: boolean
  isStafTU: boolean
  jenisKelamin: 'LAKI_LAKI' | 'PEREMPUAN' | null
  createdAt: string
  updatedAt: string
  _count: {
    waliKamarHistories: number
    santriWali: number
  }
}

export default function WaliSantriManagement() {
  const { user } = useAuth()
  const [waliSantriList, setWaliSantriList] = useState<WaliSantri[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingWaliSantri, setEditingWaliSantri] = useState<WaliSantri | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    nip: '',
    nama: '',
    email: '',
    password: '',
    noHp: '',
    jenisKelamin: '' as 'LAKI_LAKI' | 'PEREMPUAN' | ''
  })
  const [autoNIP, setAutoNIP] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
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

    fetchWaliSantri()
  }, [router])

  const fetchWaliSantri = async () => {
    try {
      const response = await fetch('/api/pegawai', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        // Filter hanya user yang memiliki role WALI_SANTRI
        const waliSantriUsers = data.filter((pegawai: WaliSantri) => {
          // Hanya termasuk jika isWaliSantri true
          if (!pegawai.isWaliSantri) {
            return false
          }
          
          // Ini adalah user dengan role Wali Santri (bisa murni atau multi-role)
          return true
        })
        setWaliSantriList(waliSantriUsers)
      }
    } catch (error) {
      console.error('Error fetching wali santri:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateAutoNIP = () => {
    const currentYear = new Date().getFullYear()
    const timestamp = Date.now().toString().slice(-4)
    const nip = `WS${currentYear}${timestamp}`
    setAutoNIP(nip)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      const url = editingWaliSantri ? `/api/pegawai/${editingWaliSantri.id}` : '/api/pegawai'
      const method = editingWaliSantri ? 'PUT' : 'POST'

      const submitData = { 
        ...formData,
        roles: ['WALI_SANTRI'] // Selalu WALI_SANTRI untuk halaman ini
      }
      
      if (!editingWaliSantri && !submitData.password) {
        setError('Password harus diisi untuk wali santri baru')
        setIsSubmitting(false)
        return
      }

      // Include autoNIP for new wali santri
      if (!editingWaliSantri && autoNIP) {
        submitData.nip = autoNIP
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(submitData)
      })

      if (response.ok) {
        setSuccess(editingWaliSantri ? 'Wali Santri berhasil diperbarui' : 'Wali Santri berhasil dibuat')
        setDialogOpen(false)
        setEditingWaliSantri(null)
        setFormData({ nip: '', nama: '', email: '', password: '', noHp: '', jenisKelamin: '' })
        setAutoNIP('')
        fetchWaliSantri()
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const data = await response.json()
        setError(data.error || data.message || 'Terjadi kesalahan')
        
        // Clear error message after 5 seconds
        setTimeout(() => setError(''), 5000)
      }
    } catch (error) {
      setError('Terjadi kesalahan server')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (waliSantri: WaliSantri) => {
    setEditingWaliSantri(waliSantri)
    setFormData({
      nip: waliSantri.nip,
      nama: waliSantri.nama,
      email: waliSantri.email,
      password: '',
      noHp: waliSantri.noHp || '',
      jenisKelamin: waliSantri.jenisKelamin || ''
    })
    setAutoNIP('') // Clear auto NIP when editing
    setDialogOpen(true)
  }

  const handleDelete = async (waliSantri: WaliSantri) => {
    if (!confirm('Apakah Anda yakin ingin menghapus wali santri ini?')) return

    try {
      const response = await fetch(`/api/pegawai/${waliSantri.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        setSuccess('Wali Santri berhasil dihapus')
        fetchWaliSantri()
      } else {
        const data = await response.json()
        setError(data.message || 'Terjadi kesalahan')
      }
    } catch (error) {
      setError('Terjadi kesalahan server')
    }
  }

  const getRoleColor = (pegawai: WaliSantri) => {
    // Jika multi-role, gunakan warna yang berbeda
    const roleCount = [pegawai.isAdmin, pegawai.isKepalaKepengasuhan, pegawai.isWaliKamar, pegawai.isWaliSantri, pegawai.isStafTU].filter(Boolean).length;
    if (roleCount > 1) {
      return 'bg-orange-100 text-orange-800';
    }
    // Pure Wali Santri
    return 'bg-purple-100 text-purple-800';
  }

  const getRoleLabel = (pegawai: WaliSantri) => {
    const roles = [];
    if (pegawai.isAdmin) roles.push('Admin');
    if (pegawai.isKepalaKepengasuhan) roles.push('Kepala Kepengasuhan');
    if (pegawai.isWaliKamar) roles.push('Wali Kamar');
    if (pegawai.isWaliSantri) roles.push('Wali Santri');
    if (pegawai.isStafTU) roles.push('Staf TU');
    
    return roles.join(', ');
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
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
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Wali Santri</h1>
          <p className="text-muted-foreground">
            Kelola data wali santri • {waliSantriList.length} wali santri
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (open && !editingWaliSantri) {
            generateAutoNIP()
          } else if (!open) {
            // Reset state when dialog closes
            setEditingWaliSantri(null)
            setFormData({ nip: '', nama: '', email: '', password: '', noHp: '', jenisKelamin: '' })
            setAutoNIP('')
            setError('')
            setSuccess('')
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Wali Santri
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] max-h-[85vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>
                {editingWaliSantri ? 'Edit Wali Santri' : 'Tambah Wali Santri Baru'}
              </DialogTitle>
              <DialogDescription>
                {editingWaliSantri ? 'Edit informasi wali santri' : 'Buat akun wali santri baru'}
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto pr-2">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="nip">NIP</Label>
                  {editingWaliSantri ? (
                    <Input
                      id="nip"
                      value={formData.nip}
                      disabled
                      className="bg-gray-100"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        id="nip"
                        value={autoNIP}
                        disabled
                        placeholder="WS20250001"
                        className="bg-gray-100"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateAutoNIP}
                      >
                        🔄
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {editingWaliSantri 
                      ? 'NIP tidak dapat diubah' 
                      : 'NIP akan digenerate otomatis (WS + tahun + nomor urut)'
                    }
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nama">Nama Lengkap</Label>
                  <Input
                    id="nama"
                    placeholder="Ahmad Fadli"
                    value={formData.nama}
                    onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="jenisKelamin">Jenis Kelamin</Label>
                  <Select 
                    value={formData.jenisKelamin} 
                    onValueChange={(value: 'LAKI_LAKI' | 'PEREMPUAN' | '') => 
                      setFormData(prev => ({ ...prev, jenisKelamin: value }))
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
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ahmad@pesantren.sch.id"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={editingWaliSantri ? 'Kosongkan jika tidak ingin mengubah' : 'Masukkan password'}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required={!editingWaliSantri}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="noHp">No. HP</Label>
                  <Input
                    id="noHp"
                    placeholder="081234567890"
                    value={formData.noHp}
                    onChange={(e) => setFormData(prev => ({ ...prev, noHp: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Role</Label>
                  <div className="p-3 border rounded-md bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <CheckSquare className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-purple-700">Wali Santri</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    User ini akan memiliki role Wali Santri.
                  </p>
                </div>
                {error && (
                  <Alert className="mb-4 border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
                <DialogFooter className="flex-shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Menyimpan...' : (editingWaliSantri ? 'Update' : 'Simpan')}
                  </Button>
                </DialogFooter>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Wali Santri</CardTitle>
          <CardDescription>
            Menampilkan semua user yang memiliki role Wali Santri
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Memuat data...</p>
            </div>
          ) : waliSantriList.length === 0 ? (
            <div className="text-center py-8">
              <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Belum ada wali santri yang terdaftar</p>
              <p className="text-sm text-muted-foreground">Tambahkan wali santri baru untuk memulai</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NIP</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Jenis Kelamin</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>No. HP</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Dibuat</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waliSantriList.map((waliSantri) => (
                    <TableRow key={waliSantri.id}>
                      <TableCell className="font-medium">{waliSantri.nip}</TableCell>
                      <TableCell>{waliSantri.nama}</TableCell>
                      <TableCell>
                        {waliSantri.jenisKelamin === 'LAKI_LAKI' ? 'Laki-laki' : 
                         waliSantri.jenisKelamin === 'PEREMPUAN' ? 'Perempuan' : '-'}
                      </TableCell>
                      <TableCell>{waliSantri.email}</TableCell>
                      <TableCell>{waliSantri.noHp || '-'}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Badge className={getRoleColor(waliSantri)}>
                            {getRoleLabel(waliSantri)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(waliSantri.createdAt).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(waliSantri)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(waliSantri)}
                            className="text-red-600 hover:text-red-700"
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