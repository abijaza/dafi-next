import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Ambil semua pegawai dengan data yang diperlukan untuk filter
    const allPegawai = await db.pegawai.findMany({
      select: {
        role: true,
        _count: {
          select: {
            waliKamarHistories: {
              where: {
                periode: {
                  isActive: true
                }
              }
            },
            santriWali: true
          }
        }
      }
    })

    // Filter pegawai sesuai kriteria:
    // - Pegawai murni: role bukan WALI_SANTRI
    // - Pegawai sekaligus Wali Santri: memiliki role WALI_SANTRI + role lainnya
    // - Tidak termasuk: user yang HANYA memiliki role WALI_SANTRI
    const filteredPegawai = allPegawai.filter((pegawai: any) => {
      // Jika role bukan WALI_SANTRI, maka termasuk pegawai
      if (pegawai.role !== 'WALI_SANTRI') {
        return true
      }
      
      // Jika role WALI_SANTRI, cek apakah memiliki role lain (dari _count)
      // Jika memiliki waliKamarHistories > 0 atau santriWali > 0, 
      // berarti memiliki role lain selain WALI_SANTRI
      if (pegawai._count.waliKamarHistories > 0 || pegawai._count.santriWali > 0) {
        return true
      }
      
      // Jika hanya role WALI_SANTRI tanpa role lain, maka bukan pegawai
      return false
    })

    return NextResponse.json(filteredPegawai.length)
  } catch (error) {
    console.error('Error counting pegawai:', error)
    return NextResponse.json(0)
  }
}