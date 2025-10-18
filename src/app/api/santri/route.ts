import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const kamarId = searchParams.get('kamarId')
    const waliSantriId = searchParams.get('waliSantriId')
    const waliKamarId = searchParams.get('waliKamarId')

    let whereClause: any = {}
    if (status) whereClause.status = status as any
    if (kamarId) whereClause.kamarId = kamarId
    if (waliSantriId) whereClause.waliSantriId = waliSantriId

    // If waliKamarId is provided, we need to find the kamar assigned to this wali kamar
    if (waliKamarId) {
      const activePeriode = await db.periode.findFirst({
        where: { isActive: true }
      })

      if (activePeriode) {
        const waliKamarAssignment = await db.waliKamarHistory.findFirst({
          where: {
            pegawaiId: waliKamarId,
            periodeId: activePeriode.id
          }
        })

        if (waliKamarAssignment) {
          whereClause.kamarId = waliKamarAssignment.kamarId
        }
      }
    }

    const santri = await db.santri.findMany({
      where: whereClause,
      include: {
        kamar: {
          include: {
            gedung: true
          }
        },
        waliSantri: true,
        _count: {
          select: {
            nilai: true,
            laporan: true
          }
        }
      },
      orderBy: {
        nama: 'asc'
      }
    })

    // Transform data to match the new interface
    const transformedSantri = santri.map(s => ({
      id: s.id,
      nis: s.nis,
      nama: s.nama,
      email: s.email,
      telepon: s.noHp,
      alamat: s.alamat,
      status: s.status,
      tahunMasuk: s.tahunMasuk,
      namaOrtu: s.namaOrtu,
      namaWali: s.namaOrtu, // Default ke nama ortu jika tidak ada field khusus
      teleponWali: s.noHpOrtu,
      password: 'santri123', // Default password untuk ditampilkan di form
      jenisKelamin: s.jenisKelamin,
      samaDenganOrtu: false, // Default logic
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      kamar: s.kamar,
      waliSantri: s.waliSantri,
      _count: s._count
    }))

    return NextResponse.json(transformedSantri)
  } catch (error) {
    console.error('Error fetching santri:', error)
    return NextResponse.json(
      { message: 'Gagal mengambil data santri' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      nis,
      nama,
      email,
      telepon,
      alamat,
      status = 'AKTIF',
      tahunMasuk,
      namaOrtu,
      namaWali,
      teleponWali,
      jenisKelamin,
      samaDenganOrtu = false,
      kamarId,
      waliSantriId
    } = body

    // Validasi required fields
    if (!nis || !nama || !tahunMasuk) {
      return NextResponse.json(
        { message: 'NIS, nama, dan tahun masuk wajib diisi' },
        { status: 400 }
      )
    }

    // Cek NIS sudah ada
    const existingNis = await db.santri.findUnique({
      where: { nis }
    })

    if (existingNis) {
      return NextResponse.json(
        { message: 'NIS sudah terdaftar' },
        { status: 400 }
      )
    }

    // Cek email sudah ada (jika email diisi)
    if (email) {
      const existingEmail = await db.santri.findUnique({
        where: { email }
      })

      if (existingEmail) {
        return NextResponse.json(
          { message: 'Email sudah terdaftar' },
          { status: 400 }
        )
      }
    }

    // If kamarId ditentukan, cek kapasitas
    if (kamarId) {
      const kamar = await db.kamar.findUnique({
        where: { id: kamarId },
        include: {
          _count: {
            select: { santri: true }
          }
        }
      })

      if (!kamar) {
        return NextResponse.json(
          { message: 'Kamar tidak ditemukan' },
          { status: 400 }
        )
      }

      if (kamar._count.santri >= kamar.kapasitas) {
        return NextResponse.json(
          { message: 'Kamar sudah penuh' },
          { status: 400 }
        )
      }
    }

    // Jika waliSantriId ditentukan, cek apakah pegawai tersebut ada dan role-nya WALI_SANTRI
    if (waliSantriId) {
      const waliSantri = await db.pegawai.findUnique({
        where: { id: waliSantriId }
      })

      if (!waliSantri) {
        return NextResponse.json(
          { message: 'Wali santri tidak ditemukan' },
          { status: 400 }
        )
      }

      if (!waliSantri.isWaliSantri) {
        return NextResponse.json(
          { message: 'Pegawai tersebut bukan Wali Santri' },
          { status: 400 }
        )
      }
    }

    // Handle samaDenganOrtu logic
    const finalNamaWali = samaDenganOrtu ? namaOrtu : namaWali

    // Hash password default untuk santri
    const defaultSantriPassword = await bcrypt.hash('santri123', 10)

    // Create santri
    const santri = await db.santri.create({
      data: {
        nis,
        nama,
        email: email || null,
        noHp: telepon || null,
        alamat: alamat || null,
        namaOrtu: namaOrtu || null,
        noHpOrtu: teleponWali || null,
        password: defaultSantriPassword,
        jenisKelamin: jenisKelamin || null,
        status,
        tahunMasuk,
        kamarId: kamarId || null,
        waliSantriId: waliSantriId || null
      },
      include: {
        kamar: {
          include: {
            gedung: true
          }
        },
        waliSantri: true
      }
    })

    // Logic untuk membuat wali santri di tabel pegawai
    let createdWaliSantri = null
    if (teleponWali && finalNamaWali) {
      // Cek apakah sudah ada pegawai dengan noHp yang sama
      const existingPegawai = await db.pegawai.findFirst({
        where: { noHp: teleponWali }
      })

      if (!existingPegawai) {
        // Hash password default untuk wali santri
        const defaultWaliPassword = await bcrypt.hash('walisantri123', 10)

        // Generate email dari nama jika tidak ada email
        const waliEmail = email || `${finalNamaWali.toLowerCase().replace(/\s+/g, '.')}@dafi.sch.id`

        // Buat pegawai baru dengan role WALI_SANTRI
        createdWaliSantri = await db.pegawai.create({
          data: {
            nip: nis, // Gunakan NIS sebagai NIP
            nama: finalNamaWali,
            email: waliEmail,
            password: defaultWaliPassword,
            noHp: teleponWali,
            role: 'WALI_SANTRI',
            isWaliSantri: true // Set boolean field untuk role WALI_SANTRI
          }
        })

        // Buat assignment wali santri ke santri
        await db.waliSantriAssignment.create({
          data: {
            pegawaiId: createdWaliSantri.id,
            santriId: santri.id
          }
        })

        // Update santri dengan waliSantriId
        await db.santri.update({
          where: { id: santri.id },
          data: { waliSantriId: createdWaliSantri.id }
        })
      } else if (existingPegawai.isWaliSantri) {
        // Update data pegawai jika ada perubahan nama
        if (existingPegawai.nama !== finalNamaWali) {
          await db.pegawai.update({
            where: { id: existingPegawai.id },
            data: { 
              nama: finalNamaWali,
              // Update email jika nama berubah dan email adalah auto-generated
              email: existingPegawai.email?.includes('@dafi.sch.id')
                ? `${finalNamaWali.toLowerCase().replace(/\s+/g, '.')}@dafi.sch.id`
                : existingPegawai.email
            }
          })
        }

        // Cek apakah assignment sudah ada
        const existingAssignment = await db.waliSantriAssignment.findFirst({
          where: {
            pegawaiId: existingPegawai.id,
            santriId: santri.id
          }
        })

        if (!existingAssignment) {
          await db.waliSantriAssignment.create({
            data: {
              pegawaiId: existingPegawai.id,
              santriId: santri.id
            }
          })
        }

        // Update santri dengan waliSantriId
        await db.santri.update({
          where: { id: santri.id },
          data: { waliSantriId: existingPegawai.id }
        })

        createdWaliSantri = existingPegawai
      }
    }

    // Transform response to match new interface
    const transformedSantri = {
      id: santri.id,
      nis: santri.nis,
      nama: santri.nama,
      email: santri.email,
      telepon: santri.noHp,
      alamat: santri.alamat,
      status: santri.status,
      tahunMasuk: santri.tahunMasuk,
      namaOrtu: santri.namaOrtu,
      namaWali: finalNamaWali,
      teleponWali: santri.noHpOrtu,
      password: 'santri123', // Default password
      jenisKelamin: santri.jenisKelamin,
      samaDenganOrtu: samaDenganOrtu,
      createdAt: santri.createdAt,
      updatedAt: santri.updatedAt,
      kamar: santri.kamar,
      waliSantri: santri.waliSantri,
      createdWaliSantri: createdWaliSantri ? {
        id: createdWaliSantri.id,
        nip: createdWaliSantri.nip,
        nama: createdWaliSantri.nama,
        email: createdWaliSantri.email,
        noHp: createdWaliSantri.noHp,
        role: createdWaliSantri.role
      } : null
    }

    return NextResponse.json(transformedSantri, { status: 201 })
  } catch (error) {
    console.error('Error creating santri:', error)
    return NextResponse.json(
      { message: 'Gagal membuat santri baru' },
      { status: 500 }
    )
  }
}