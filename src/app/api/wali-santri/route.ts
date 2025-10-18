import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pegawaiId = searchParams.get('pegawaiId')
    const santriId = searchParams.get('santriId')

    let whereClause: any = {}
    if (pegawaiId) whereClause.pegawaiId = pegawaiId
    if (santriId) whereClause.santriId = santriId

    const assignments = await db.waliSantriAssignment.findMany({
      where: whereClause,
      include: {
        pegawai: {
          select: {
            id: true,
            nama: true,
            nip: true,
            email: true,
            role: true
          }
        },
        santri: {
          select: {
            id: true,
            nis: true,
            nama: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Error fetching wali santri assignments:', error)
    return NextResponse.json(
      { message: 'Gagal mengambil data penugasan Wali Santri' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { pegawaiId, santriId } = await request.json()

    // Validate input
    if (!pegawaiId || !santriId) {
      return NextResponse.json(
        { message: 'Semua field harus diisi' },
        { status: 400 }
      )
    }

    // Check if pegawai exists and has correct role
    const pegawai = await db.pegawai.findUnique({
      where: { id: pegawaiId }
    })

    if (!pegawai) {
      return NextResponse.json(
        { message: 'Pegawai tidak ditemukan' },
        { status: 404 }
      )
    }

    if (pegawai.role !== 'WALI_SANTRI') {
      return NextResponse.json(
        { message: 'Pegawai tersebut bukan Wali Santri' },
        { status: 400 }
      )
    }

    // Check if santri exists
    const santri = await db.santri.findUnique({
      where: { id: santriId }
    })

    if (!santri) {
      return NextResponse.json(
        { message: 'Santri tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if assignment already exists
    const existingAssignment = await db.waliSantriAssignment.findFirst({
      where: {
        pegawaiId,
        santriId
      }
    })

    if (existingAssignment) {
      return NextResponse.json(
        { message: 'Penugasan ini sudah ada' },
        { status: 400 }
      )
    }

    // Check if santri already has a wali santri
    const existingSantriAssignment = await db.waliSantriAssignment.findFirst({
      where: {
        santriId
      }
    })

    if (existingSantriAssignment) {
      return NextResponse.json(
        { message: 'Santri ini sudah memiliki Wali Santri' },
        { status: 400 }
      )
    }

    // Create assignment
    const assignment = await db.waliSantriAssignment.create({
      data: {
        pegawaiId,
        santriId
      },
      include: {
        pegawai: {
          select: {
            id: true,
            nama: true,
            nip: true,
            email: true,
            role: true
          }
        },
        santri: {
          select: {
            id: true,
            nis: true,
            nama: true,
            status: true
          }
        }
      }
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error('Error creating wali santri assignment:', error)
    return NextResponse.json(
      { message: 'Gagal membuat penugasan Wali Santri' },
      { status: 500 }
    )
  }
}