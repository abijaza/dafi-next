import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const pegawai = await db.pegawai.findMany({
      select: {
        id: true,
        nama: true,
        nip: true,
        email: true,
        role: true,
        isAdmin: true,
        isKepalaKepengasuhan: true,
        isWaliKamar: true,
        isWaliSantri: true,
        isStafTU: true,
        createdAt: true
      },
      orderBy: [
        { role: 'asc' },
        { nama: 'asc' }
      ]
    })

    // Convert boolean fields to roles array for each pegawai
    const pegawaiWithRoles = pegawai.map(p => {
      const roles = []
      if (p.isAdmin) roles.push('ADMIN')
      if (p.isKepalaKepengasuhan) roles.push('KEPALA_KEPENGASUHAN')
      if (p.isWaliKamar) roles.push('WALI_KAMAR')
      if (p.isWaliSantri) roles.push('WALI_SANTRI')
      if (p.isStafTU) roles.push('STAF_TU')
      
      return {
        ...p,
        roles
      }
    })

    return NextResponse.json({
      message: 'Data pegawai berhasil diambil',
      total: pegawai.length,
      data: pegawaiWithRoles
    })
  } catch (error) {
    console.error('Error fetching pegawai:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pegawai' },
      { status: 500 }
    )
  }
}