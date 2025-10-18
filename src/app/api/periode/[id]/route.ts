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

    const { tahunAjaran, semester, midSemester } = await request.json()

    // Validate input
    if (!tahunAjaran || !semester || !midSemester) {
      return NextResponse.json(
        { message: 'Semua field harus diisi' },
        { status: 400 }
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

    // Check if another periode with same data exists
    const duplicatePeriode = await db.periode.findFirst({
      where: {
        AND: [
          { id: { not: params.id } },
          { tahunAjaran },
          { semester },
          { midSemester }
        ]
      }
    })

    if (duplicatePeriode) {
      return NextResponse.json(
        { message: 'Periode dengan data yang sama sudah ada' },
        { status: 400 }
      )
    }

    // Update periode
    const periode = await db.periode.update({
      where: { id: params.id },
      data: {
        tahunAjaran,
        semester,
        midSemester
      }
    })

    return NextResponse.json({
      message: 'Periode berhasil diperbarui',
      periode
    })

  } catch (error) {
    console.error('Error updating periode:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Check if periode is active
    if (existingPeriode.isActive) {
      return NextResponse.json(
        { message: 'Tidak dapat menghapus periode yang aktif' },
        { status: 400 }
      )
    }

    // Delete periode
    await db.periode.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Periode berhasil dihapus'
    })

  } catch (error) {
    console.error('Error deleting periode:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}