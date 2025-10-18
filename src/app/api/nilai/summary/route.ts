import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const periodeId = searchParams.get('periodeId')

    if (!periodeId) {
      return NextResponse.json(
        { message: 'Periode ID is required' },
        { status: 400 }
      )
    }

    // Get all nilai for the periode
    const nilaiList = await db.nilai.findMany({
      where: {
        periodeId
      },
      include: {
        santri: {
          select: {
            id: true,
            status: true
          }
        }
      }
    })

    // Get unique santri count (only active santri)
    const uniqueSantriIds = [...new Set(nilaiList.map(n => n.santriId))]
    const activeSantriCount = await db.santri.count({
      where: {
        id: { in: uniqueSantriIds },
        status: 'AKTIF'
      }
    })

    // Calculate average score
    const totalScore = nilaiList.reduce((sum, n) => sum + n.skor, 0)
    const averageScore = nilaiList.length > 0 ? Math.round(totalScore / nilaiList.length) : 0

    // Count predikat distribution
    const predikatCounts = nilaiList.reduce((acc, n) => {
      acc[n.predikat] = (acc[n.predikat] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Group by santri and calculate per-santri averages
    const santriAverages = new Map<string, number>()
    nilaiList.forEach(n => {
      if (!santriAverages.has(n.santriId)) {
        santriAverages.set(n.santriId, [])
      }
      const scores = santriAverages.get(n.santriId) as number[]
      scores.push(n.skor)
    })

    // Calculate final averages per santri
    const finalSantriAverages: number[] = []
    santriAverages.forEach((scores: number[]) => {
      const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      finalSantriAverages.push(avg)
    })

    // Count predikat based on final averages
    const finalPredikatCounts = finalSantriAverages.reduce((acc, avg) => {
      let predikat = 'D'
      if (avg >= 85) predikat = 'A'
      else if (avg >= 70) predikat = 'B'
      else if (avg >= 60) predikat = 'C'
      
      acc[predikat] = (acc[predikat] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const summary = {
      totalSantri: activeSantriCount,
      rataRataNilai: finalSantriAverages.length > 0 ? Math.round(finalSantriAverages.reduce((a, b) => a + b, 0) / finalSantriAverages.length) : 0,
      predikatA: finalPredikatCounts['A'] || 0,
      predikatB: finalPredikatCounts['B'] || 0,
      predikatC: finalPredikatCounts['C'] || 0,
      predikatD: finalPredikatCounts['D'] || 0
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error('Error fetching nilai summary:', error)
    return NextResponse.json(
      { message: 'Gagal mengambil ringkasan nilai' },
      { status: 500 }
    )
  }
}