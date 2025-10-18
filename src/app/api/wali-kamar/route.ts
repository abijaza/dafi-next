import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const periodeId = searchParams.get('periodeId')
    const pegawaiId = searchParams.get('pegawaiId')
    const kamarId = searchParams.get('kamarId')

    let whereClause: any = {}
    if (periodeId) whereClause.periodeId = periodeId
    if (pegawaiId) whereClause.pegawaiId = pegawaiId
    if (kamarId) whereClause.kamarId = kamarId

    const assignments = await db.waliKamarHistory.findMany({
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
        kamar: {
          include: {
            gedung: true,
            _count: {
              select: {
                santri: true
              }
            }
          }
        },
        periode: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Error fetching wali kamar assignments:', error)
    return NextResponse.json(
      { message: 'Gagal mengambil data penugasan Wali Kamar' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { pegawaiId, kamarId, periodeId } = await request.json()

    // Validate input
    if (!pegawaiId || !kamarId || !periodeId) {
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

    if (pegawai.role !== 'WALI_KAMAR') {
      return NextResponse.json(
        { message: 'Pegawai tersebut bukan Wali Kamar' },
        { status: 400 }
      )
    }

    // Check if kamar exists
    const kamar = await db.kamar.findUnique({
      where: { id: kamarId }
    })

    if (!kamar) {
      return NextResponse.json(
        { message: 'Kamar tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if periode exists
    const periode = await db.periode.findUnique({
      where: { id: periodeId }
    })

    if (!periode) {
      return NextResponse.json(
        { message: 'Periode tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if assignment already exists
    const existingAssignment = await db.waliKamarHistory.findFirst({
      where: {
        pegawaiId,
        kamarId,
        periodeId
      }
    })

    if (existingAssignment) {
      return NextResponse.json(
        { message: 'Penugasan ini sudah ada' },
        { status: 400 }
      )
    }

    // Check if pegawai already assigned to another kamar in the same periode
    const existingPegawaiAssignment = await db.waliKamarHistory.findFirst({
      where: {
        pegawaiId,
        periodeId
      }
    })

    if (existingPegawaiAssignment) {
      return NextResponse.json(
        { message: 'Pegawai ini sudah ditugaskan ke kamar lain pada periode yang sama' },
        { status: 400 }
      )
    }

    // Check if kamar already has a wali kamar in the same periode
    const existingKamarAssignment = await db.waliKamarHistory.findFirst({
      where: {
        kamarId,
        periodeId
      }
    })

    if (existingKamarAssignment) {
      return NextResponse.json(
        { message: 'Kamar ini sudah memiliki Wali Kamar pada periode yang sama' },
        { status: 400 }
      )
    }

    // Create assignment
    const assignment = await db.waliKamarHistory.create({
      data: {
        pegawaiId,
        kamarId,
        periodeId
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
        kamar: {
          include: {
            gedung: true,
            _count: {
              select: {
                santri: true
              }
            }
          }
        },
        periode: true
      }
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error('Error creating wali kamar assignment:', error)
    return NextResponse.json(
      { message: 'Gagal membuat penugasan Wali Kamar' },
      { status: 500 }
    )
  }
}