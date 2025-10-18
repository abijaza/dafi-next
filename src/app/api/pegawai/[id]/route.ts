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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = verifyAuth(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { nama, email, password, noHp, jenisKelamin, roles } = await request.json()

    // Validate input
    if (!nama || !email || !roles || roles.length === 0) {
      return NextResponse.json(
        { message: 'Semua field harus diisi dan minimal satu role dipilih' },
        { status: 400 }
      )
    }

    // Check if pegawai exists
    const existingPegawai = await db.pegawai.findUnique({
      where: { id: params.id }
    })

    if (!existingPegawai) {
      return NextResponse.json(
        { message: 'Pegawai tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if email is already used by another pegawai
    const emailExists = await db.pegawai.findFirst({
      where: {
        email,
        NOT: {
          id: params.id
        }
      }
    })

    if (emailExists) {
      return NextResponse.json(
        { message: 'Email sudah digunakan oleh pegawai lain' },
        { status: 400 }
      )
    }

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

    // Prepare update data
    const updateData: any = {
      nama,
      email,
      noHp,
      jenisKelamin: jenisKelamin || null,
      role: primaryRole,
      ...roleFields
    }

    // Only update password if provided
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10)
    }

    // Update pegawai
    const pegawai = await db.pegawai.update({
      where: { id: params.id },
      data: updateData,
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
      message: 'Pegawai berhasil diperbarui',
      pegawai: {
        ...pegawai,
        roles: pegawaiRoles
      }
    })

  } catch (error) {
    console.error('Error updating pegawai:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = verifyAuth(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if pegawai exists
    const existingPegawai = await db.pegawai.findUnique({
      where: { id: params.id }
    })

    if (!existingPegawai) {
      return NextResponse.json(
        { message: 'Pegawai tidak ditemukan' },
        { status: 404 }
      )
    }

    // Prevent deletion of admin users
    if (existingPegawai.role === 'ADMIN') {
      return NextResponse.json(
        { message: 'Tidak dapat menghapus user admin' },
        { status: 400 }
      )
    }

    // Delete pegawai
    await db.pegawai.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Pegawai berhasil dihapus'
    })

  } catch (error) {
    console.error('Error deleting pegawai:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}