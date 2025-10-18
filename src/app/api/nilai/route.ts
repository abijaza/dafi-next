import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const periodeId = searchParams.get('periodeId')
    const santriId = searchParams.get('santriId')
    const kategoriId = searchParams.get('kategoriId')

    let whereClause: any = {}
    if (periodeId) whereClause.periodeId = periodeId
    if (santriId) whereClause.santriId = santriId
    if (kategoriId) whereClause.kategoriId = kategoriId

    const nilai = await db.nilai.findMany({
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
        kategori: {
          include: {
            aspek: true
          }
        },
        periode: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(nilai)
  } catch (error) {
    console.error('Error fetching nilai:', error)
    return NextResponse.json(
      { message: 'Gagal mengambil data nilai' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { santriId, kategoriId, periodeId, skor, predikat, deskripsi } = await request.json()

    // Validate input
    if (!santriId || !kategoriId || !periodeId || skor === undefined) {
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

    // Check if kategori exists
    const kategori = await db.kategori.findUnique({
      where: { id: kategoriId }
    })

    if (!kategori) {
      return NextResponse.json(
        { message: 'Kategori tidak ditemukan' },
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

    // Check if nilai already exists
    const existingNilai = await db.nilai.findFirst({
      where: {
        santriId,
        kategoriId,
        periodeId
      }
    })

    if (existingNilai) {
      return NextResponse.json(
        { message: 'Nilai untuk kategori ini sudah ada' },
        { status: 400 }
      )
    }

    // Calculate predikat if not provided
    const calculatedPredikat = predikat || calculatePredikat(skor)

    // Create nilai
    const nilai = await db.nilai.create({
      data: {
        santriId,
        kategoriId,
        periodeId,
        skor,
        predikat: calculatedPredikat,
        deskripsi
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
        kategori: {
          include: {
            aspek: true
          }
        },
        periode: true
      }
    })

    return NextResponse.json(nilai, { status: 201 })
  } catch (error) {
    console.error('Error creating nilai:', error)
    return NextResponse.json(
      { message: 'Gagal membuat nilai' },
      { status: 500 }
    )
  }
}

function calculatePredikat(skor: number): string {
  if (skor >= 85) return 'A'
  if (skor >= 70) return 'B'
  if (skor >= 60) return 'C'
  return 'D'
}