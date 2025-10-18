import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    // Reset admin password
    const adminPassword = await bcrypt.hash('admin123', 10)
    
    const admin = await db.pegawai.upsert({
      where: { nip: 'ADM001' },
      update: {
        password: adminPassword,
        role: 'ADMIN',
        isAdmin: true,
        email: 'admin@dafi.sch.id'
      },
      create: {
        nama: 'admin',
        nip: 'ADM001',
        email: 'admin@dafi.sch.id',
        password: adminPassword,
        role: 'ADMIN',
        isAdmin: true
      }
    })

    // Test login
    const testLogin = await db.pegawai.findFirst({
      where: {
        OR: [
          { email: 'admin@dafi.sch.id' },
          { nip: 'ADM001' }
        ]
      },
      select: {
        id: true,
        nama: true,
        nip: true,
        email: true,
        role: true,
        isAdmin: true,
        createdAt: true
      }
    })

    const isPasswordValid = await bcrypt.compare('admin123', adminPassword)

    return NextResponse.json({
      message: 'Admin password reset successful',
      loginData: {
        email: 'admin@dafi.sch.id',
        password: 'admin123'
      },
      admin: testLogin,
      isPasswordValid
    })
  } catch (error) {
    console.error('Error resetting admin:', error)
    return NextResponse.json(
      { error: 'Failed to reset admin' },
      { status: 500 }
    )
  }
}