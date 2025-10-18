'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { Home, Users, UserCheck, Building, BookOpen, Award, Calendar, BarChart3, FileText, MessageSquare, Settings, GraduationCap, Clock, CheckSquare } from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    try {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      
      if (!token || !userData) {
        router.push('/login')
        return
      }
      
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const getMenuItems = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return [
          {
            icon: Home,
            label: 'Dashboard',
            href: '/dashboard/admin',
            active: pathname === '/dashboard/admin'
          },
          {
            icon: Settings,
            label: 'Pengaturan',
            children: [
              {
                icon: Building,
                label: 'Gedung',
                href: '/dashboard/admin/pengaturan/gedung',
                active: pathname?.includes('/pengaturan/gedung')
              },
              {
                icon: Calendar,
                label: 'Kamar',
                href: '/dashboard/admin/pengaturan/kamar',
                active: pathname?.includes('/pengaturan/kamar')
              },
              {
                icon: GraduationCap,
                label: 'Kelas',
                href: '/dashboard/admin/pengaturan/kelas',
                active: pathname?.includes('/pengaturan/kelas')
              },
              {
                icon: CheckSquare,
                label: 'Penilaian',
                children: [
                  {
                    icon: Award,
                    label: 'NonAkademik',
                    href: '/dashboard/admin/pengaturan/penilaian/nonakademik',
                    active: pathname?.includes('/pengaturan/penilaian/nonakademik')
                  },
                  {
                    icon: FileText,
                    label: 'Aspek & Kegiatan',
                    href: '/dashboard/admin/pengaturan/penilaian/aspek-kegiatan',
                    active: pathname?.includes('/pengaturan/penilaian/aspek-kegiatan')
                  }
                ]
              },
              {
                icon: Calendar,
                label: 'Periode',
                href: '/dashboard/admin/periode',
                active: pathname?.includes('/periode')
              }
            ]
          },
          {
            icon: Clock,
            label: 'Data Periodik',
            children: [
              {
                icon: Calendar,
                label: 'Pengaturan Kamar Periode',
                href: '/dashboard/admin/data-periodik/kamar-periode',
                active: pathname?.includes('/data-periodik/kamar-periode')
              },
              {
                icon: GraduationCap,
                label: 'Pengaturan Kelas Santri',
                href: '/dashboard/admin/data-periodik/kelas-santri',
                active: pathname?.includes('/data-periodik/kelas-santri')
              },
              {
                icon: Users,
                label: 'Pengaturan Kamar Santri',
                href: '/dashboard/admin/data-periodik/kamar-santri',
                active: pathname?.includes('/data-periodik/kamar-santri')
              }
            ]
          },
          {
            icon: Users,
            label: 'Manajemen',
            children: [
              {
                icon: Users,
                label: 'Santri',
                href: '/dashboard/admin/santri',
                active: pathname?.includes('/santri')
              },
              {
                icon: UserCheck,
                label: 'Pegawai',
                href: '/dashboard/admin/pegawai',
                active: pathname?.includes('/pegawai')
              },
              {
                icon: UserCheck,
                label: 'Wali Santri',
                href: '/dashboard/admin/wali-santri',
                active: pathname?.includes('/wali-santri')
              }
              // Fasilitas dinonaktifkan sementara
              // {
              //   icon: Building,
              //   label: 'Fasilitas',
              //   href: '/dashboard/admin/fasilitas',
              //   active: pathname?.includes('/fasilitas')
              // }
            ]
          },
          {
            icon: BookOpen,
            label: 'Akademik',
            children: [
              {
                icon: BookOpen,
                label: 'Input Nilai',
                href: '/dashboard/admin/nilai',
                active: pathname?.includes('/nilai')
              },
              {
                icon: Award,
                label: 'Rapor',
                href: '/dashboard/admin/rapor',
                active: pathname?.includes('/rapor')
              }
            ]
          }
        ]
      
      case 'KEPALA_KEPENGASUHAN':
        return [
          {
            icon: BarChart3,
            label: 'Dashboard',
            href: '/dashboard/kepengasuhan',
            active: pathname === '/dashboard/kepengasuhan'
          },
          {
            icon: Users,
            label: 'Santri',
            href: '/dashboard/kepengasuhan/santri',
            active: pathname?.includes('/santri')
          },
          {
            icon: UserCheck,
            label: 'Pegawai',
            href: '/dashboard/kepengasuhan/pegawai',
            active: pathname?.includes('/pegawai')
          },
          {
            icon: Building,
            label: 'Fasilitas',
            href: '/dashboard/kepengasuhan/fasilitas',
            active: pathname?.includes('/fasilitas')
          }
        ]
      
      case 'WALI_KAMAR':
        return [
          {
            icon: Home,
            label: 'Dashboard',
            href: '/dashboard/wali-kamar',
            active: pathname === '/dashboard/wali-kamar'
          },
          {
            icon: Users,
            label: 'Santri',
            href: '/dashboard/wali-kamar/santri',
            active: pathname?.includes('/santri')
          },
          {
            icon: FileText,
            label: 'Catatan',
            href: '/dashboard/wali-kamar/catatan',
            active: pathname?.includes('/catatan')
          }
        ]
      
      case 'WALI_SANTRI':
        return [
          {
            icon: Home,
            label: 'Dashboard',
            href: '/dashboard/wali-santri',
            active: pathname === '/dashboard/wali-santri'
          },
          {
            icon: Users,
            label: 'Santri',
            href: '/dashboard/wali-santri/santri',
            active: pathname?.includes('/santri')
          },
          {
            icon: BookOpen,
            label: 'Nilai',
            href: '/dashboard/wali-santri/nilai',
            active: pathname?.includes('/nilai')
          },
          {
            icon: MessageSquare,
            label: 'Komunikasi',
            href: '/dashboard/wali-santri/komunikasi',
            active: pathname?.includes('/komunikasi')
          }
        ]
      
      default:
        return []
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const menuItems = getMenuItems(user.role)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar 
          user={user} 
          menuItems={menuItems} 
          onLogout={handleLogout}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">Sistem Pesantren</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}