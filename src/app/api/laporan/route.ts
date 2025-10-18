import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const periodeId = searchParams.get('periodeId')
    const santriId = searchParams.get('santriId')
    const kategori = searchParams.get('kategori')

    let whereClause: any = {}
    if (periodeId) whereClause.periodeId = periodeId
    if (santriId) whereClause.santriId = santriId
    if (kategori) whereClause.kategori = kategori

    const laporan = await db.laporan.findMany({
      where: whereClause,
      include: {
        santri: {
          select: {
            id: true,
            nis: true,
            nama: true,
            status: true
          }
        },
        periode: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(laporan)
  } catch (error) {
    console.error('Error fetching laporan:', error)
    return NextResponse.json(
      { message: 'Gagal mengambil data laporan' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { santriId, periodeId, judul, isi, kategori } = await request.json()

    // Validate input
    if (!santriId || !periodeId || !judul || !isi || !kategori) {
      return NextResponse.json(
        { message: 'Semua field harus diisi' },
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

    // Validate kategori
    const validKategori = ['KEHADIRAN', 'PERILAKU', 'KESEHATAN', 'AKADEMIK', 'LAINNYA']
    if (!validKategori.includes(kategori)) {
      return NextResponse.json(
        { message: 'Kategori tidak valid' },
        { status: 400 }
      )
    }

    // Create laporan
    const laporan = await db.laporan.create({
      data: {
        santriId,
        periodeId,
        judul,
        isi,
        kategori
      },
      include: {
        santri: {
          select: {
            id: true,
            nis: true,
            nama: true,
            status: true
          }
        },
        periode: true
      }
    })

    return NextResponse.json(laporan, { status: 201 })
  } catch (error) {
    console.error('Error creating laporan:', error)
    return NextResponse.json(
      { message: 'Gagal membuat laporan' },
      { status: 500 }
    )
  }
}