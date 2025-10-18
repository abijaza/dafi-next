import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Middleware to verify token and admin role
function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = verifyAuth(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    let whereClause = {}
    if (role) {
      // Filter by specific role using boolean fields
      switch (role) {
        case 'ADMIN':
          whereClause = { isAdmin: true }
          break
        case 'KEPALA_KEPENGASUHAN':
          whereClause = { isKepalaKepengasuhan: true }
          break
        case 'WALI_KAMAR':
          whereClause = { isWaliKamar: true }
          break
        case 'WALI_SANTRI':
          whereClause = { isWaliSantri: true }
          break
        case 'STAF_TU':
          whereClause = { isStafTU: true }
          break
        default:
          whereClause = { role }
      }
    }

    const pegawai = await db.pegawai.findMany({
      where: whereClause,
      select: {
        id: true,
        nip: true,
        nama: true,
        email: true,
        noHp: true,
        role: true,
        isAdmin: true,
        isKepalaKepengasuhan: true,
        isWaliKamar: true,
        isWaliSantri: true,
        isStafTU: true,
        jenisKelamin: true,
        createdAt: true,
        updatedAt: true,
        // Don't include password
        _count: {
          select: {
            waliKamarHistories: {
              where: {
                periode: {
                  isActive: true
                }
              }
            },
            santriWali: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Convert boolean fields to roles array for each pegawai
    const pegawaiWithRoles = pegawai.map(p => {
      const roles = []
      if (p.isAdmin) roles.push('ADMIN')
      if (p.isKepalaKepengasuhan) roles.push('KEPALA_KEPENGASUHAN')
      if (p.isWaliKamar) roles.push('WALI_KAMAR')
      if (p.isWaliSantri) roles.push('WALI_SANTRI')
      if (p.isStafTU) roles.push('STAF_TU')
      
      return {
        ...p,
        roles
      }
    })
    
    return NextResponse.json(pegawaiWithRoles)
  } catch (error) {
    console.error('Error fetching pegawai:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = verifyAuth(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { nip, nama, email, password, noHp, jenisKelamin, roles } = await request.json()

    // Validate input
    if (!nama || !email || !password || !roles || roles.length === 0) {
      return NextResponse.json(
        { message: 'Semua field harus diisi dan minimal satu role dipilih' },
        { status: 400 }
      )
    }

    // Check if pegawai already exists
    const existingPegawai = await db.pegawai.findFirst({
      where: {
        OR: [
          { email }
        ]
      }
    })

    if (existingPegawai) {
      return NextResponse.json(
        { message: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate NIP if not provided
    const finalNIP = nip || `PEG${new Date().getFullYear()}${Date.now().toString().slice(-4)}`

    // Convert roles array to individual boolean fields
    const roleFields = {
      isAdmin: roles.includes('ADMIN'),
      isKepalaKepengasuhan: roles.includes('KEPALA_KEPENGASUHAN'),
      isWaliKamar: roles.includes('WALI_KAMAR'),
      isWaliSantri: roles.includes('WALI_SANTRI'),
      isStafTU: roles.includes('STAF_TU')
    }

    // Use first role as primary role (for backward compatibility)
    const primaryRole = roles[0]

    // Create pegawai
    const pegawai = await db.pegawai.create({
      data: {
        nip: finalNIP,
        nama,
        email,
        password: hashedPassword,
        noHp,
        jenisKelamin: jenisKelamin || null,
        role: primaryRole,
        ...roleFields
      },
      select: {
        id: true,
        nip: true,
        nama: true,
        email: true,
        noHp: true,
        role: true,
        isAdmin: true,
        isKepalaKepengasuhan: true,
        isWaliKamar: true,
        isWaliSantri: true,
        isStafTU: true,
        jenisKelamin: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Convert boolean fields back to roles array for response
    const pegawaiRoles = []
    if (pegawai.isAdmin) pegawaiRoles.push('ADMIN')
    if (pegawai.isKepalaKepengasuhan) pegawaiRoles.push('KEPALA_KEPENGASUHAN')
    if (pegawai.isWaliKamar) pegawaiRoles.push('WALI_KAMAR')
    if (pegawai.isWaliSantri) pegawaiRoles.push('WALI_SANTRI')
    if (pegawai.isStafTU) pegawaiRoles.push('STAF_TU')

    return NextResponse.json({
      message: 'Pegawai berhasil dibuat',
      pegawai: {
        ...pegawai,
        roles: pegawaiRoles
      }
    })

  } catch (error) {
    console.error('Error creating pegawai:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}