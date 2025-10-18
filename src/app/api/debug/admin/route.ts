import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // Cari admin di database
    const admin = await db.pegawai.findFirst({
      where: {
        OR: [
          { email: 'admin@dafi.sch.id' },
          { nip: 'ADM001' },
          { nama: 'admin' }
        ]
      },
      select: {
        id: true,
        nama: true,
        nip: true,
        email: true,
        role: true,
        isAdmin: true,
        password: true,
        createdAt: true
      }
    })

    if (!admin) {
      return NextResponse.json({
        message: 'Admin tidak ditemukan',
        data: null
      })
    }

    // Test password verification
    const isPasswordValid = await bcrypt.compare('admin123', admin.password)

    return NextResponse.json({
      message: 'Data admin ditemukan',
      data: {
        ...admin,
        password: '[HIDDEN]',
        isPasswordValid
      }
    })
  } catch (error) {
    console.error('Error checking admin:', error)
    return NextResponse.json(
      { error: 'Failed to check admin' },
      { status: 500 }
    )
  }
}