import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // Get active periode
    const activePeriode = await db.periode.findFirst({
      where: { isActive: true }
    })

    if (!activePeriode) {
      return NextResponse.json(
        { message: 'No active periode found' },
        { status: 400 }
      )
    }

    // Get kamar
    const kamar = await db.kamar.findMany()
    if (kamar.length === 0) {
      return NextResponse.json(
        { message: 'No kamar found' },
        { status: 400 }
      )
    }

    // Create sample santri
    const sampleSantri = [
      {
        nis: 'SANTRI001',
        nama: 'Ahmad Rizki',
        email: 'ahmad.rizki@pesantren.sch.id',
        noHp: '081234567801',
        alamat: 'Jakarta',
        namaOrtu: 'Bapak Ahmad',
        noHpOrtu: '081234567802',
        status: 'AKTIF' as const,
        tahunMasuk: '2025'
      },
      {
        nis: 'SANTRI002',
        nama: 'Siti Nurhaliza',
        email: 'siti.nur@pesantren.sch.id',
        noHp: '081234567803',
        alamat: 'Bandung',
        namaOrtu: 'Ibu Siti',
        noHpOrtu: '081234567804',
        status: 'AKTIF' as const,
        tahunMasuk: '2025'
      },
      {
        nis: 'SANTRI003',
        nama: 'Muhammad Fadli',
        email: 'muhammad.fadli@pesantren.sch.id',
        noHp: '081234567805',
        alamat: 'Surabaya',
        namaOrtu: 'Bapak Muhammad',
        noHpOrtu: '081234567806',
        status: 'AKTIF' as const,
        tahunMasuk: '2025'
      },
      {
        nis: 'SANTRI004',
        nama: 'Aisyah Putri',
        email: 'aisyah.putri@pesantren.sch.id',
        noHp: '081234567807',
        alamat: 'Yogyakarta',
        namaOrtu: 'Ibu Aisyah',
        noHpOrtu: '081234567808',
        status: 'AKTIF' as const,
        tahunMasuk: '2025'
      },
      {
        nis: 'SANTRI005',
        nama: 'Budi Santoso',
        email: 'budi.santoso@pesantren.sch.id',
        noHp: '081234567809',
        alamat: 'Semarang',
        namaOrtu: 'Bapak Budi',
        noHpOrtu: '081234567810',
        status: 'AKTIF' as const,
        tahunMasuk: '2025'
      }
    ]

    const createdSantri = await Promise.all(
      sampleSantri.map(async (santri) => {
        const created = await db.santri.create({
          data: santri
        })

        // Create santri history
        const randomKamar = kamar[Math.floor(Math.random() * kamar.length)]
        await db.santriHistory.create({
          data: {
            santriId: created.id,
            kamarId: randomKamar.id,
            periodeId: activePeriode.id,
            kelas: '1'
          }
        })

        return created
      })
    )

    return NextResponse.json({
      message: 'Sample santri created successfully',
      count: createdSantri.length
    })

  } catch (error) {
    console.error('Error creating sample santri:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat membuat sample santri' },
      { status: 500 }
    )
  }
}