import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { nip, nama, email, password, noHp, role } = await request.json()

    // Validate input
    if (!nip || !nama || !email || !password || !role) {
      return NextResponse.json(
        { message: 'Semua field harus diisi' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.pegawai.findFirst({
      where: {
        OR: [
          { email: email },
          { nip: nip }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email atau NIP sudah terdaftar' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await db.pegawai.create({
      data: {
        nip,
        nama,
        email,
        password: hashedPassword,
        noHp,
        role
      }
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'User berhasil dibuat',
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}