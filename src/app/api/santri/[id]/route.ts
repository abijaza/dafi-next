import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const santri = await db.santri.findUnique({
      where: { id: params.id },
      include: {
        kamar: {
          include: {
            gedung: true
          }
        },
        waliSantri: true
      }
    })

    if (!santri) {
      return NextResponse.json(
        { message: 'Santri tidak ditemukan' },
        { status: 404 }
      )
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
      namaWali: santri.namaOrtu, // Default ke nama ortu
      teleponWali: santri.noHpOrtu,
      jenisKelamin: santri.jenisKelamin,
      samaDenganOrtu: false, // Default logic
      createdAt: santri.createdAt,
      updatedAt: santri.updatedAt,
      kamar: santri.kamar,
      waliSantri: santri.waliSantri
    }

    return NextResponse.json(transformedSantri)
  } catch (error) {
    console.error('Error fetching santri:', error)
    return NextResponse.json(
      { message: 'Gagal mengambil data santri' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      nis,
      nama,
      email,
      telepon,
      alamat,
      namaOrtu,
      namaWali,
      teleponWali,
      status,
      tahunMasuk,
      samaDenganOrtu,
      kamarId,
      waliSantriId,
      jenisKelamin
    } = body

    // Check if santri exists
    const existingSantri = await db.santri.findUnique({
      where: { id: params.id },
      include: {
        waliSantri: true
      }
    })

    if (!existingSantri) {
      return NextResponse.json(
        { message: 'Santri tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check NIS uniqueness (if changed)
    if (nis && nis !== existingSantri.nis) {
      const existingNis = await db.santri.findUnique({
        where: { nis }
      })

      if (existingNis) {
        return NextResponse.json(
          { message: 'NIS sudah terdaftar' },
          { status: 400 }
        )
      }
    }

    // Check email uniqueness (if changed)
    if (email && email !== existingSantri.email) {
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

    // Handle samaDenganOrtu logic
    const finalNamaWali = samaDenganOrtu ? namaOrtu : namaWali

    // Prepare update data
    const updateData: any = {
      nis,
      nama,
      email: email || null,
      noHp: telepon || null,
      alamat: alamat || null,
      namaOrtu: namaOrtu || null,
      noHpOrtu: teleponWali || null,
      status,
      tahunMasuk,
      kamarId: kamarId || null,
      waliSantriId: waliSantriId || null,
      jenisKelamin: jenisKelamin || null
    }

    // If kamarId changed, check capacity
    if (kamarId && kamarId !== existingSantri.kamarId) {
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

      // Don't count current santri if they're moving from this kamar
      const currentOccupancy = existingSantri.kamarId === kamarId 
        ? kamar._count.santri 
        : kamar._count.santri

      if (currentOccupancy >= kamar.kapasitas) {
        return NextResponse.json(
          { message: 'Kamar sudah penuh' },
          { status: 400 }
        )
      }
    }

    // If waliSantriId changed, validate the new wali
    if (waliSantriId && waliSantriId !== existingSantri.waliSantriId) {
      const waliSantri = await db.pegawai.findUnique({
        where: { id: waliSantriId }
      })

      if (!waliSantri) {
        return NextResponse.json(
          { message: 'Wali santri tidak ditemukan' },
          { status: 400 }
        )
      }

      if (waliSantri.role !== 'WALI_SANTRI') {
        return NextResponse.json(
          { message: 'Pegawai tersebut bukan Wali Santri' },
          { status: 400 }
        )
      }
    }

    // Update santri
    const updatedSantri = await db.santri.update({
      where: { id: params.id },
      data: updateData,
      include: {
        kamar: {
          include: {
            gedung: true
          }
        },
        waliSantri: true
      }
    })

    // Handle update wali santri di tabel pegawai jika ada perubahan
    if (teleponWali && finalNamaWali) {
      // Cek apakah ada wali santri terkait dengan santri ini
      const relatedWaliSantri = await db.waliSantriAssignment.findMany({
        where: { santriId: params.id },
        include: { pegawai: true }
      })

      if (relatedWaliSantri.length > 0) {
        // Update existing wali santri
        for (const assignment of relatedWaliSantri) {
          // Update data pegawai (nama dan noHp)
          await db.pegawai.update({
            where: { id: assignment.pegawaiId },
            data: {
              nama: finalNamaWali,
              noHp: teleponWali,
              // Update email jika nama berubah
              email: assignment.pegawai.email?.includes('@') 
                ? assignment.pegawai.email 
                : `${finalNamaWali.toLowerCase().replace(/\s+/g, '.')}@dafi.sch.id`
            }
          })
        }
      } else {
        // Buat wali santri baru jika belum ada
        const existingPegawai = await db.pegawai.findFirst({
          where: { noHp: teleponWali }
        })

        if (!existingPegawai) {
          // Hash password default untuk wali santri
          const defaultWaliPassword = await bcrypt.hash('walisantri123', 10)

          // Generate email dari nama
          const waliEmail = `${finalNamaWali.toLowerCase().replace(/\s+/g, '.')}@dafi.sch.id`

          // Buat pegawai baru dengan role WALI_SANTRI
          const newWaliSantri = await db.pegawai.create({
            data: {
              nip: `WS${new Date().getFullYear()}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
              nama: finalNamaWali,
              email: waliEmail,
              password: defaultWaliPassword,
              noHp: teleponWali,
              role: 'WALI_SANTRI'
            }
          })

          // Buat assignment wali santri ke santri
          await db.waliSantriAssignment.create({
            data: {
              pegawaiId: newWaliSantri.id,
              santriId: params.id
            }
          })

          // Update santri dengan waliSantriId
          await db.santri.update({
            where: { id: params.id },
            data: { waliSantriId: newWaliSantri.id }
          })
        } else if (existingPegawai.role === 'WALI_SANTRI') {
          // Update data pegawai jika ada perubahan nama
          if (existingPegawai.nama !== finalNamaWali) {
            await db.pegawai.update({
              where: { id: existingPegawai.id },
              data: { 
                nama: finalNamaWali,
                email: existingPegawai.email?.includes('@dafi.sch.id')
                  ? `${finalNamaWali.toLowerCase().replace(/\s+/g, '.')}@dafi.sch.id`
                  : existingPegawai.email
              }
            })
          }

          // Buat assignment jika belum ada
          const existingAssignment = await db.waliSantriAssignment.findFirst({
            where: {
              pegawaiId: existingPegawai.id,
              santriId: params.id
            }
          })

          if (!existingAssignment) {
            await db.waliSantriAssignment.create({
              data: {
                pegawaiId: existingPegawai.id,
                santriId: params.id
              }
            })
          }

          // Update santri dengan waliSantriId
          await db.santri.update({
            where: { id: params.id },
            data: { waliSantriId: existingPegawai.id }
          })
        }
      }
    }

    // Transform response to match new interface
    const transformedSantri = {
      id: updatedSantri.id,
      nis: updatedSantri.nis,
      nama: updatedSantri.nama,
      email: updatedSantri.email,
      telepon: updatedSantri.noHp,
      alamat: updatedSantri.alamat,
      status: updatedSantri.status,
      tahunMasuk: updatedSantri.tahunMasuk,
      namaOrtu: updatedSantri.namaOrtu,
      namaWali: finalNamaWali,
      teleponWali: updatedSantri.noHpOrtu,
      jenisKelamin: updatedSantri.jenisKelamin,
      samaDenganOrtu: samaDenganOrtu,
      createdAt: updatedSantri.createdAt,
      updatedAt: updatedSantri.updatedAt,
      kamar: updatedSantri.kamar,
      waliSantri: updatedSantri.waliSantri
    }

    return NextResponse.json(transformedSantri)
  } catch (error) {
    console.error('Error updating santri:', error)
    return NextResponse.json(
      { message: 'Gagal memperbarui data santri' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if santri exists
    const existingSantri = await db.santri.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { 
            nilai: true,
            laporan: true
          }
        }
      }
    })

    if (!existingSantri) {
      return NextResponse.json(
        { message: 'Santri tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if santri has academic records
    if (existingSantri._count.nilai > 0 || existingSantri._count.laporan > 0) {
      return NextResponse.json(
        { 
          message: 'Tidak dapat menghapus santri yang memiliki catatan akademik. Ubah status menjadi "MUTASI_KELUAR" atau "LULUS" sebagai gantinya.' 
        },
        { status: 400 }
      )
    }

    // Cari semua wali santri yang terkait dengan santri ini
    const waliSantriAssignments = await db.waliSantriAssignment.findMany({
      where: { santriId: params.id },
      include: { pegawai: true }
    })

    // Hapus assignment wali santri
    await db.waliSantriAssignment.deleteMany({
      where: { santriId: params.id }
    })

    // Hapus wali santri dari tabel pegawai jika tidak memiliki santri lain
    for (const assignment of waliSantriAssignments) {
      // Cek apakah wali santri ini masih memiliki santri lain
      const otherAssignments = await db.waliSantriAssignment.findMany({
        where: { 
          pegawaiId: assignment.pegawaiId,
          santriId: { not: params.id }
        }
      })

      // Jika tidak memiliki santri lain, hapus dari tabel pegawai
      if (otherAssignments.length === 0) {
        await db.pegawai.delete({
          where: { id: assignment.pegawaiId }
        })
      }
    }

    // Delete santri
    await db.santri.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { 
        message: 'Santri dan wali santri terkait berhasil dihapus',
        deletedWaliSantriCount: waliSantriAssignments.length
      }
    )
  } catch (error) {
    console.error('Error deleting santri:', error)
    return NextResponse.json(
      { message: 'Gagal menghapus santri' },
      { status: 500 }
    )
  }
}