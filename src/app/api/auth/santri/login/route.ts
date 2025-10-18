import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nis, password } = body

    // Validasi input
    if (!nis || !password) {
      return NextResponse.json(
        { message: 'NIS dan password wajib diisi' },
        { status: 400 }
      )
    }

    // Cari santri berdasarkan NIS
    const santri = await db.santri.findUnique({
      where: { nis },
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
        { message: 'NIS atau password salah' },
        { status: 401 }
      )
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, santri.password)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'NIS atau password salah' },
        { status: 401 }
      )
    }

    // Cek status santri
    if (santri.status !== 'AKTIF') {
      return NextResponse.json(
        { message: 'Akun santri tidak aktif' },
        { status: 401 }
      )
    }

    // Return data santri (tanpa password)
    const { password: _, ...santriData } = santri

    return NextResponse.json({
      message: 'Login berhasil',
      user: {
        id: santriData.id,
        nis: santriData.nis,
        nama: santriData.nama,
        email: santriData.email,
        role: 'SANTRI',
        kamar: santriData.kamar,
        waliSantri: santriData.waliSantri
      }
    })

  } catch (error) {
    console.error('Error during santri login:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}