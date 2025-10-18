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
  Square
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface Pegawai {
  id: string
  nip: string
  nama: string
  email: string
  noHp: string | null
  role: string
  roles: string[]
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

export default function PegawaiManagement() {
  const { user } = useAuth()
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPegawai, setEditingPegawai] = useState<Pegawai | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [formData, setFormData] = useState({
    nip: '',
    nama: '',
    email: '',
    password: '',
    noHp: '',
    jenisKelamin: '' as 'LAKI_LAKI' | 'PEREMPUAN' | '',
    roles: [] as string[]
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

    fetchPegawai()
  }, [router])

  const fetchPegawai = async () => {
    try {
      const response = await fetch('/api/pegawai', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setPegawaiList(data)
      }
    } catch (error) {
      console.error('Error fetching pegawai:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateAutoNIP = () => {
    const currentYear = new Date().getFullYear()
    const timestamp = Date.now().toString().slice(-4)
    const nip = `PEG${currentYear}${timestamp}`
    setAutoNIP(nip)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      const url = editingPegawai ? `/api/pegawai/${editingPegawai.id}` : '/api/pegawai'
      const method = editingPegawai ? 'PUT' : 'POST'

      const submitData = { ...formData }
      
      if (!editingPegawai && !submitData.password) {
        setError('Password harus diisi untuk pegawai baru')
        setIsSubmitting(false)
        return
      }

      if (submitData.roles.length === 0) {
        setError('Pilih minimal satu role untuk pegawai')
        setIsSubmitting(false)
        return
      }

      // Include autoNIP for new employees
      if (!editingPegawai && autoNIP) {
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
        setSuccess(editingPegawai ? 'Pegawai berhasil diperbarui' : 'Pegawai berhasil dibuat')
        setDialogOpen(false)
        setEditingPegawai(null)
        setFormData({ nip: '', nama: '', email: '', password: '', noHp: '', jenisKelamin: '', roles: [] })
        setAutoNIP('')
        fetchPegawai()
        
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

  const handleEdit = (pegawai: Pegawai) => {
    setEditingPegawai(pegawai)
    setFormData({
      nip: pegawai.nip,
      nama: pegawai.nama,
      email: pegawai.email,
      password: '',
      noHp: pegawai.noHp || '',
      jenisKelamin: pegawai.jenisKelamin || '',
      roles: pegawai.roles || [pegawai.role] // Use roles array or fallback to single role
    })
    setAutoNIP('') // Clear auto NIP when editing
    setDialogOpen(true)
  }

  const handleDelete = async (pegawai: Pegawai) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pegawai ini?')) return

    try {
      const response = await fetch(`/api/pegawai/${pegawai.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        setSuccess('Pegawai berhasil dihapus')
        fetchPegawai()
      } else {
        const data = await response.json()
        setError(data.message || 'Terjadi kesalahan')
      }
    } catch (error) {
      setError('Terjadi kesalahan server')
    }
  }

  const handleRoleToggle = (role: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }))
  }

  const availableRoles = [
    { value: 'ADMIN', label: 'Admin', color: 'bg-red-100 text-red-800' },
    { value: 'KEPALA_KEPENGASUHAN', label: 'Kepala Kepengasuhan', color: 'bg-blue-100 text-blue-800' },
    { value: 'WALI_KAMAR', label: 'Wali Kamar', color: 'bg-green-100 text-green-800' },
    { value: 'WALI_SANTRI', label: 'Wali Santri', color: 'bg-purple-100 text-purple-800' },
    { value: 'STAF_TU', label: 'Staf TU', color: 'bg-gray-100 text-gray-800' }
  ]

  const getRoleColor = (role: string) => {
    const roleData = availableRoles.find(r => r.value === role)
    return roleData ? roleData.color : 'bg-gray-100 text-gray-800'
  }

  const getRoleLabel = (role: string) => {
    const roleData = availableRoles.find(r => r.value === role)
    if (roleData) return roleData.label
    
    // Handle legacy roles that are not in the available list
    const legacyRoles: { [key: string]: string } = {
      'GURU': 'Guru',
      'KEPALA_SEKOLAH': 'Kepala Sekolah',
      'BENDAHARA': 'Bendahara',
      'KEPSEK': 'Kepsek',
      'KABID_KURIKULUM': 'Kabid Kurikulum',
      'KABID_KESISWAAN': 'Kabid Kesiswaan',
      'KABID_SARPRAS': 'Kabid Sarpras',
      'KABID_KEUANGAN': 'Kabid Keuangan',
      'KABID_HUMAS': 'Kabid Humas',
      'KABID_IT': 'Kabid IT',
      'KABID_KESEHATAN': 'Kabid Kesehatan',
      'KABID_KEAMANAN': 'Kabid Keamanan',
      'KABID_KEBERSIHAN': 'Kabid Kebersihan',
      'KABID_KONSUMSI': 'Kabid Konsumsi',
      'KABID_TRANSPORTASI': 'Kabid Transportasi',
      'KABID_PERPUSTAKAAN': 'Kabid Perpustakaan',
      'KABID_LABORATORIUM': 'Kabid Laboratorium'
    }
    
    return legacyRoles[role] || role
  }

  // Filter untuk menampilkan hanya pegawai sesuai kriteria:
  // - Pegawai murni: tidak memiliki role WALI_SANTRI
  // - Pegawai sekaligus Wali Santri: memiliki role WALI_SANTRI + role lainnya
  // - Tidak termasuk: user yang HANYA memiliki role WALI_SANTRI
  const filterPegawai = (pegawai: Pegawai) => {
    // Check if pegawai has WALI_SANTRI role
    const hasWaliSantriRole = pegawai.roles.includes('WALI_SANTRI')
    
    // If doesn't have WALI_SANTRI role, include as pegawai
    if (!hasWaliSantriRole) {
      return true
    }
    
    // If has WALI_SANTRI role, check if also has other roles
    const otherRoles = pegawai.roles.filter(role => role !== 'WALI_SANTRI')
    
    // If has other roles besides WALI_SANTRI, include as pegawai
    if (otherRoles.length > 0) {
      return true
    }
    
    // If only has WALI_SANTRI role, exclude from pegawai list
    return false
  }

  // Apply search and role filters
  const applyFilters = (pegawai: Pegawai) => {
    // First apply the basic pegawai filter
    if (!filterPegawai(pegawai)) {
      return false
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = 
        pegawai.nama.toLowerCase().includes(searchLower) ||
        pegawai.email.toLowerCase().includes(searchLower) ||
        pegawai.nip.toLowerCase().includes(searchLower) ||
        (pegawai.noHp && pegawai.noHp.toLowerCase().includes(searchLower))
      
      if (!matchesSearch) {
        return false
      }
    }

    // Apply role filter
    if (selectedRole !== 'all') {
      if (!pegawai.roles.includes(selectedRole)) {
        return false
      }
    }

    return true
  }

  const filteredPegawaiList = pegawaiList.filter(applyFilters)

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
          <h1 className="text-3xl font-bold">Manajemen Pegawai</h1>
          <p className="text-muted-foreground">
            Kelola data pegawai dan penugasan • {pegawaiList.filter(filterPegawai).length} pegawai dari {pegawaiList.length} total user
            {searchTerm || selectedRole !== 'all' ? ` • ${filteredPegawaiList.length} hasil filter` : ''}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (open && !editingPegawai) {
            generateAutoNIP()
          } else if (!open) {
            // Reset state when dialog closes
            setEditingPegawai(null)
            setFormData({ nip: '', nama: '', email: '', password: '', noHp: '', jenisKelamin: '', roles: [] })
            setAutoNIP('')
            setError('')
            setSuccess('')
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Pegawai
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] max-h-[85vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>
                {editingPegawai ? 'Edit Pegawai' : 'Tambah Pegawai Baru'}
              </DialogTitle>
              <DialogDescription>
                {editingPegawai ? 'Edit informasi pegawai' : 'Buat akun pegawai baru'}
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto pr-2">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="nip">NIP</Label>
                  {editingPegawai ? (
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
                        placeholder="PEG20250001"
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
                    {editingPegawai 
                      ? 'NIP tidak dapat diubah' 
                      : 'NIP akan digenerate otomatis (PEG + tahun + nomor urut)'
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
                      placeholder={editingPegawai ? 'Kosongkan jika tidak ingin mengubah' : 'Masukkan password'}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required={!editingPegawai}
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
                  <Label>Roles (Pilih minimal satu)</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                    {availableRoles.map((role) => (
                      <div key={role.value} className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleRoleToggle(role.value)}
                          className="flex items-center space-x-2 text-sm"
                        >
                          {formData.roles.includes(role.value) ? (
                            <CheckSquare className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Square className="h-4 w-4 text-gray-400" />
                          )}
                          <span className={formData.roles.includes(role.value) ? 'font-medium' : ''}>
                            {role.label}
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pegawai dapat memiliki lebih dari satu role/jabatan. Hanya role berikut yang tersedia: Admin, Kepala Kepengasuhan, Wali Kamar, Wali Santri, dan Staf TU.
                  </p>
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
              </form>
            </div>
            <DialogFooter className="flex-shrink-0 pt-4">
              <Button 
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? 'Menyimpan...' : (editingPegawai ? 'Update' : 'Buat')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pegawai</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pegawaiList.filter(filterPegawai).length}</div>
            <p className="text-xs text-muted-foreground">Pegawai terdaftar</p>
            <p className="text-xs text-muted-foreground">(tidak termasuk Wali Santri murni)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wali Kamar</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {pegawaiList.filter(p => p.roles.includes('WALI_KAMAR')).length}
            </div>
            <p className="text-xs text-muted-foreground">Wali kamar aktif</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wali Santri</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {pegawaiList.filter(p => p.roles.includes('WALI_SANTRI')).length}
            </div>
            <p className="text-xs text-muted-foreground">Wali santri aktif</p>
            <p className="text-xs text-muted-foreground">(termasuk yang multi-role)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin</CardTitle>
            <UserCheck className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {pegawaiList.filter(p => p.roles.includes('ADMIN')).length}
            </div>
            <p className="text-xs text-muted-foreground">Admin sistem</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kepala Kepengasuhan</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {pegawaiList.filter(p => p.roles.includes('KEPALA_KEPENGASUHAN')).length}
            </div>
            <p className="text-xs text-muted-foreground">Kepala kepengasuhan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staf TU</CardTitle>
            <UserCheck className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {pegawaiList.filter(p => p.roles.includes('STAF_TU')).length}
            </div>
            <p className="text-xs text-muted-foreground">Staf TU</p>
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
          <CardTitle>Daftar Pegawai</CardTitle>
          <CardDescription>
            Menampilkan {filteredPegawaiList.length} dari {pegawaiList.filter(filterPegawai).length} pegawai aktif 
            {searchTerm || selectedRole !== 'all' ? ' (filter aktif)' : ''}
            {!searchTerm && selectedRole === 'all' && ' (tidak termasuk user yang hanya berstatus Wali Santri)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Input
                  placeholder="Cari berdasarkan nama, email, NIP, atau no HP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            {/* Role Filter */}
            <div className="w-full sm:w-48">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Roles</SelectItem>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Clear Filters */}
            {(searchTerm || selectedRole !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedRole('all')
                }}
                className="w-full sm:w-auto"
              >
                Clear Filter
              </Button>
            )}
          </div>

          {/* Filter Info */}
          {(searchTerm || selectedRole !== 'all') && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-700">
                Filter aktif: 
                {searchTerm && <span className="font-medium"> Search: "{searchTerm}"</span>}
                {searchTerm && selectedRole !== 'all' && <span> • </span>}
                {selectedRole !== 'all' && (
                  <span className="font-medium"> Role: {getRoleLabel(selectedRole)}</span>
                )}
                <span className="ml-2">({filteredPegawaiList.length} hasil)</span>
              </p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Memuat data...</p>
            </div>
          ) : filteredPegawaiList.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || selectedRole !== 'all' 
                  ? 'Tidak ada pegawai yang cocok dengan filter' 
                  : 'Belum ada pegawai yang terdaftar'}
              </p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || selectedRole !== 'all' 
                  ? 'Coba ubah atau hapus filter untuk melihat hasil lain'
                  : 'Tambahkan pegawai baru untuk memulai'}
              </p>
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
                    <TableHead>Roles</TableHead>
                    <TableHead>Dibuat</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPegawaiList.map((pegawai) => (
                    <TableRow key={pegawai.id}>
                      <TableCell className="font-medium">{pegawai.nip}</TableCell>
                      <TableCell>{pegawai.nama}</TableCell>
                      <TableCell>
                        {pegawai.jenisKelamin === 'LAKI_LAKI' ? 'Laki-laki' : 
                         pegawai.jenisKelamin === 'PEREMPUAN' ? 'Perempuan' : '-'}
                      </TableCell>
                      <TableCell>{pegawai.email}</TableCell>
                      <TableCell>{pegawai.noHp || '-'}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {pegawai.roles.map((role) => (
                            <Badge key={role} className={getRoleColor(role)}>
                              {getRoleLabel(role)}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(pegawai.createdAt).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(pegawai)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(pegawai)}
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