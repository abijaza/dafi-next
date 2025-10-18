import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { nilai } = await request.json()

    if (!Array.isArray(nilai) || nilai.length === 0) {
      return NextResponse.json(
        { message: 'Data nilai harus berupa array yang tidak kosong' },
        { status: 400 }
      )
    }

    // Validate all input data
    for (const item of nilai) {
      if (!item.santriId || !item.kategoriId || !item.periodeId || item.skor === undefined) {
        return NextResponse.json(
          { message: 'Semua field harus diisi untuk setiap nilai' },
          { status: 400 }
        )
      }

      if (item.skor < 0 || item.skor > 100) {
        return NextResponse.json(
          { message: 'Skor harus antara 0 dan 100' },
          { status: 400 }
        )
      }
    }

    // Check if all related entities exist
    const santriIds = [...new Set(nilai.map(n => n.santriId))]
    const kategoriIds = [...new Set(nilai.map(n => n.kategoriId))]
    const periodeIds = [...new Set(nilai.map(n => n.periodeId))]

    const [santriList, kategoriList, periodeList] = await Promise.all([
      db.santri.findMany({
        where: { id: { in: santriIds } },
        select: { id: true }
      }),
      db.kategori.findMany({
        where: { id: { in: kategoriIds } },
        select: { id: true }
      }),
      db.periode.findMany({
        where: { id: { in: periodeIds } },
        select: { id: true }
      })
    ])

    const santriIdSet = new Set(santriList.map(s => s.id))
    const kategoriIdSet = new Set(kategoriList.map(k => k.id))
    const periodeIdSet = new Set(periodeList.map(p => p.id))

    for (const item of nilai) {
      if (!santriIdSet.has(item.santriId)) {
        return NextResponse.json(
          { message: `Santri dengan ID ${item.santriId} tidak ditemukan` },
          { status: 404 }
        )
      }

      if (!kategoriIdSet.has(item.kategoriId)) {
        return NextResponse.json(
          { message: `Kategori dengan ID ${item.kategoriId} tidak ditemukan` },
          { status: 404 }
        )
      }

      if (!periodeIdSet.has(item.periodeId)) {
        return NextResponse.json(
          { message: `Periode dengan ID ${item.periodeId} tidak ditemukan` },
          { status: 404 }
        )
      }
    }

    // Use transaction for batch insert/update
    const result = await db.$transaction(async (tx) => {
      const results = []

      for (const item of nilai) {
        // Check if nilai already exists
        const existingNilai = await tx.nilai.findFirst({
          where: {
            santriId: item.santriId,
            kategoriId: item.kategoriId,
            periodeId: item.periodeId
          }
        })

        let savedNilai
        if (existingNilai) {
          // Update existing nilai
          savedNilai = await tx.nilai.update({
            where: { id: existingNilai.id },
            data: {
              skor: item.skor,
              predikat: item.predikat || calculatePredikat(item.skor),
              deskripsi: item.deskripsi
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
        } else {
          // Create new nilai
          savedNilai = await tx.nilai.create({
            data: {
              santriId: item.santriId,
              kategoriId: item.kategoriId,
              periodeId: item.periodeId,
              skor: item.skor,
              predikat: item.predikat || calculatePredikat(item.skor),
              deskripsi: item.deskripsi
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
        }

        results.push(savedNilai)
      }

      return results
    })

    return NextResponse.json({
      message: 'Berhasil menyimpan nilai',
      data: result,
      count: result.length
    })
  } catch (error) {
    console.error('Error in batch nilai operation:', error)
    return NextResponse.json(
      { message: 'Gagal menyimpan nilai batch' },
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