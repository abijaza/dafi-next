import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if assignment exists
    const existingAssignment = await db.waliSantriAssignment.findFirst({
      where: { santriId: params.id }
    })

    if (!existingAssignment) {
      return NextResponse.json(
        { message: 'Penugasan tidak ditemukan' },
        { status: 404 }
      )
    }

    // Delete assignment
    await db.waliSantriAssignment.deleteMany({
      where: { santriId: params.id }
    })

    return NextResponse.json(
      { message: 'Penugasan Wali Santri berhasil dihapus' }
    )
  } catch (error) {
    console.error('Error deleting wali santri assignment:', error)
    return NextResponse.json(
      { message: 'Gagal menghapus penugasan Wali Santri' },
      { status: 500 }
    )
  }
}