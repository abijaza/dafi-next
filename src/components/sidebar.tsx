'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Home,
  Calendar,
  Users,
  UserCheck,
  Building,
  BookOpen,
  Award,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Menu
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MenuItem {
  icon: any
  label: string
  href: string
  active?: boolean
  badge?: string
  children?: MenuItem[]
}

interface SidebarProps {
  user: any
  menuItems: MenuItem[]
  onLogout: () => void
  onClose?: () => void
}

export function Sidebar({ user, menuItems, onLogout, onClose }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  // Auto-expand the parent menu of the active route (support nested menus)
  useEffect(() => {
    const findActiveParents = (items: MenuItem[], targetPath: string, parents: string[] = []): string[] => {
      for (const item of items) {
        // Check if current item matches the target path
        if (item.href === targetPath) {
          return parents
        }
        
        // Check if current item is active (for nested active states)
        if (item.active) {
          return parents
        }
        
        // Recursively check children
        if (item.children && item.children.length > 0) {
          const result = findActiveParents(item.children, targetPath, [...parents, item.label])
          if (result.length > 0 || item.active) {
            // If we found active children or current item is active, include this parent
            return [...parents, item.label]
          }
        }
      }
      return []
    }

    const activeParents = findActiveParents(menuItems, pathname)
    // For nested menus, we need to expand all parents in the hierarchy
    if (activeParents.length > 0) {
      setExpandedItems(activeParents)
    }
  }, [pathname, menuItems])

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev => {
      // If the clicked item is already expanded, collapse it
      if (prev.includes(label)) {
        return prev.filter(item => item !== label)
      }
      
      // For user interaction (not auto-expand), only keep one menu open at a time
      // This ensures clean UX when manually clicking menus
      return [label]
    })
  }

  const handleNavigation = (href: string, hasChildren: boolean = false, label: string = '') => {
    if (hasChildren) {
      toggleExpanded(label)
    } else {
      router.push(href)
      onClose?.()
    }
  }

  // Enhanced function to check if a menu item should be expanded
  const shouldExpand = (item: MenuItem): boolean => {
    // Check if this item is in the expanded items list
    if (expandedItems.includes(item.label)) {
      return true
    }
    
    // Check if any child is active (for auto-expand)
    if (item.children) {
      return item.children.some(child => 
        child.active || 
        (child.children && child.children.some(grandchild => grandchild.active))
      )
    }
    
    return false
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'KEPALA_KEPENGASUHAN': return 'bg-blue-100 text-blue-800'
      case 'WALI_KAMAR': return 'bg-green-100 text-green-800'
      case 'WALI_SANTRI': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Admin'
      case 'KEPALA_KEPENGASUHAN': return 'Kepala Kepengasuhan'
      case 'WALI_KAMAR': return 'Wali Kamar'
      case 'WALI_SANTRI': return 'Wali Santri'
      default: return role
    }
  }

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const isExpanded = shouldExpand(item)
    const hasChildren = item.children && item.children.length > 0
    const paddingClass = level === 0 ? '' : level === 1 ? 'pl-6' : level === 2 ? 'pl-10' : `pl-${6 + (level - 1) * 4}`

    if (hasChildren) {
      return (
        <div key={item.label}>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-between text-left hover:bg-gray-50",
              item.active && "bg-red-50 text-red-600 hover:bg-red-50",
              paddingClass
            )}
            onClick={() => handleNavigation(item.href, true, item.label)}
          >
            <div className="flex items-center space-x-3">
              <item.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          {isExpanded && (
            <div className="ml-2 mt-1 space-y-1">
              {item.children!.map((child) => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Button
        key={item.label}
        variant="ghost"
        className={cn(
          "w-full justify-start text-left hover:bg-gray-50",
          item.active && "bg-red-50 text-red-600 hover:bg-red-50",
          paddingClass
        )}
        onClick={() => handleNavigation(item.href)}
      >
        <div className="flex items-center space-x-3 flex-1">
          <item.icon className="h-4 w-4" />
          <span className="text-sm font-medium">{item.label}</span>
        </div>
        {item.badge && (
          <Badge className="bg-red-100 text-red-600 text-xs">
            {item.badge}
          </Badge>
        )}
      </Button>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* User Profile */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-red-100 text-red-600 font-semibold">
              {user?.nama?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.nama || 'User'}
            </p>
            <Badge className={cn("text-xs", getRoleColor(user?.role))}>
              {getRoleLabel(user?.role)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => renderMenuItem(item))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-left hover:bg-gray-50"
          onClick={() => handleNavigation('/settings')}
        >
          <Settings className="h-4 w-4 mr-3" />
          <span className="text-sm font-medium">Pengaturan</span>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-left hover:bg-red-50 text-red-600"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          <span className="text-sm font-medium">Keluar</span>
        </Button>
      </div>
    </div>
  )
}