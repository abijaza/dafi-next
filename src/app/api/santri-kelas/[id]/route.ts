import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const kelasPeriodeId = searchParams.get('kelasPeriodeId')
    
    if (!kelasPeriodeId) {
      return NextResponse.json(
        { error: 'kelasPeriodeId is required' },
        { status: 400 }
      )
    }

    await db.santriKelas.deleteMany({
      where: {
        santriId: params.id,
        kelasPeriodeId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting santri kelas:', error)
    return NextResponse.json(
      { error: 'Failed to delete santri kelas' },
      { status: 500 }
    )
  }
}