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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyAuth(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if periode exists
    const existingPeriode = await db.periode.findUnique({
      where: { id: params.id }
    })

    if (!existingPeriode) {
      return NextResponse.json(
        { message: 'Periode tidak ditemukan' },
        { status: 404 }
      )
    }

    // If activating this periode, deactivate all other periodes
    if (!existingPeriode.isActive) {
      await db.periode.updateMany({
        where: {
          isActive: true
        },
        data: {
          isActive: false
        }
      })
    }

    // Toggle periode status
    const periode = await db.periode.update({
      where: { id: params.id },
      data: {
        isActive: !existingPeriode.isActive
      }
    })

    return NextResponse.json({
      message: `Periode berhasil ${periode.isActive ? 'diaktifkan' : 'dinonaktifkan'}`,
      periode
    })

  } catch (error) {
    console.error('Error toggling periode:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}