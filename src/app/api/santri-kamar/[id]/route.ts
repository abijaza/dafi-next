import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = verifyAuth(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if santri kamar exists
    const existingSantriKamar = await db.santriKamar.findUnique({
      where: {
        id: id
      }
    })

    if (!existingSantriKamar) {
      return NextResponse.json(
        { message: 'Santri kamar tidak ditemukan' },
        { status: 404 }
      )
    }

    // Delete santri kamar
    await db.santriKamar.delete({
      where: {
        id: id
      }
    })

    return NextResponse.json({
      message: 'Santri berhasil dikeluarkan dari kamar'
    })

  } catch (error) {
    console.error('Error deleting santri kamar:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}