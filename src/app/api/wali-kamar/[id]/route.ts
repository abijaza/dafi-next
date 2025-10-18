import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if assignment exists
    const existingAssignment = await db.waliKamarHistory.findUnique({
      where: { id: params.id }
    })

    if (!existingAssignment) {
      return NextResponse.json(
        { message: 'Penugasan tidak ditemukan' },
        { status: 404 }
      )
    }

    // Delete assignment
    await db.waliKamarHistory.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { message: 'Penugasan Wali Kamar berhasil dihapus' }
    )
  } catch (error) {
    console.error('Error deleting wali kamar assignment:', error)
    return NextResponse.json(
      { message: 'Gagal menghapus penugasan Wali Kamar' },
      { status: 500 }
    )
  }
}