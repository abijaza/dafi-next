import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validasi input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Username/email dan password wajib diisi' },
        { status: 400 }
      )
    }

    // Cari pegawai dengan role WALI_SANTRI berdasarkan email atau nip
    const waliSantri = await db.pegawai.findFirst({
      where: {
        AND: [
          { role: 'WALI_SANTRI' },
          {
            OR: [
              { email: email },
              { nip: email }
            ]
          }
        ]
      },
      include: {
        waliSantriAssignments: {
          include: {
            santri: {
              include: {
                kamar: {
                  include: {
                    gedung: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!waliSantri) {
      return NextResponse.json(
        { message: 'Username/email atau password salah' },
        { status: 401 }
      )
    }

    // Cek role
    if (waliSantri.role !== 'WALI_SANTRI') {
      return NextResponse.json(
        { message: 'Anda tidak memiliki akses sebagai wali santri' },
        { status: 401 }
      )
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, waliSantri.password)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Username/email atau password salah' },
        { status: 401 }
      )
    }

    // Return data wali santri (tanpa password)
    const { password: _, ...waliSantriData } = waliSantri

    return NextResponse.json({
      message: 'Login berhasil',
      user: {
        id: waliSantriData.id,
        nip: waliSantriData.nip,
        nama: waliSantriData.nama,
        email: waliSantriData.email,
        role: 'WALI_SANTRI',
        santriList: waliSantriData.waliSantriAssignments.map(assignment => assignment.santri)
      }
    })

  } catch (error) {
    console.error('Error during wali santri login:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}