import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Middleware to verify token
function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded
  } catch {
    return null
  }
}

// Helper function to convert nilai to predikat
function getPredikat(nilai: number): string {
  if (nilai >= 85) return 'A'
  if (nilai >= 70) return 'B'
  if (nilai >= 60) return 'C'
  return 'D'
}

// Helper function to get predikat description
function getPredikatDescription(predikat: string): string {
  switch (predikat) {
    case 'A': return 'Baik Sekali'
    case 'B': return 'Baik'
    case 'C': return 'Cukup'
    case 'D': return 'Kurang'
    default: return ''
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = verifyAuth(request)
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const santriId = searchParams.get('santriId')
    const periodeId = searchParams.get('periodeId')

    // Get active periode if not specified
    let targetPeriodeId = periodeId
    if (!targetPeriodeId) {
      const activePeriode = await db.periode.findFirst({
        where: { isActive: true }
      })
      targetPeriodeId = activePeriode?.id
    }

    if (!targetPeriodeId) {
      return NextResponse.json(
        { message: 'Tidak ada periode aktif' },
        { status: 400 }
      )
    }

    // Get santri data
    let santriData = []
    if (santriId) {
      // Get specific santri
      const santri = await db.santri.findUnique({
        where: { id: santriId },
        include: {
          santriKamar: {
            where: { periodeId: targetPeriodeId },
            include: {
              kamar: {
                include: {
                  gedung: true
                }
              }
            }
          },
          santriKelas: {
            where: { periodeId: targetPeriodeId }
          }
        }
      })
      if (santri) {
        santriData = [santri]
      }
    } else {
      // Get all santri based on user role
      if (user.role === 'WALI_SANTRI') {
        // Get santri assigned to this wali santri
        santriData = await db.santri.findMany({
          where: { waliSantriId: user.id },
          include: {
            santriKamar: {
              where: { periodeId: targetPeriodeId },
              include: {
                kamar: {
                  include: {
                    gedung: true
                  }
                }
              }
            },
            santriKelas: {
              where: { periodeId: targetPeriodeId }
            }
          }
        })
      } else if (user.role === 'WALI_KAMAR') {
        // Get santri in wali kamar's assigned rooms
        const kamarPeriodes = await db.kamarPeriode.findMany({
          where: { 
            waliKamarId: user.id,
            periodeId: targetPeriodeId
          },
          include: {
            kamar: {
              include: {
                santriKamar: {
                  where: { periodeId: targetPeriodeId },
                  include: {
                    santri: true
                  }
                }
              }
            }
          }
        })
        
        const santriIds = new Set()
        kamarPeriodes.forEach(kp => {
          kp.kamar.santriKamar.forEach(sk => {
            santriIds.add(sk.santriId)
          })
        })

        santriData = await db.santri.findMany({
          where: {
            id: { in: Array.from(santriIds) }
          },
          include: {
            santriKamar: {
              where: { periodeId: targetPeriodeId },
              include: {
                kamar: {
                  include: {
                    gedung: true
                  }
                }
              }
            },
            santriKelas: {
              where: { periodeId: targetPeriodeId }
            }
          }
        })
      } else {
        // Admin and Kepala Kepengasuhan can see all santri
        santriData = await db.santri.findMany({
          include: {
            santriKamar: {
              where: { periodeId: targetPeriodeId },
              include: {
                kamar: {
                  include: {
                    gedung: true
                  }
                }
              }
            },
            santriKelas: {
              where: { periodeId: targetPeriodeId }
            }
          }
        })
      }
    }

    // Get all aspek and kategori for structure
    const aspekNilai = await db.aspekNilai.findMany({
      include: {
        kategori: true
      }
    })

    // Get nilai data for each santri
    const raporData = await Promise.all(
      santriData.map(async (santri) => {
        // Get all nilai for this santri in this periode
        const nilaiList = await db.nilai.findMany({
          where: {
            santriId: santri.id,
            periodeId: targetPeriodeId
          },
          include: {
            kategori: {
              include: {
                aspek: true
              }
            }
          }
        })

        // Group nilai by aspek
        const nilaiByAspek: any = {}
        
        aspekNilai.forEach(aspek => {
          nilaiByAspek[aspek.nama] = []
          
          aspek.kategori.forEach(kategori => {
            const nilai = nilaiList.find(n => n.kategoriId === kategori.id)
            if (nilai) {
              nilaiByAspek[aspek.nama].push({
                kategori: kategori.nama,
                deskripsi: kategori.deskripsi,
                nilai: nilai.skor,
                predikat: nilai.predikat,
                predikatDesc: getPredikatDescription(nilai.predikat)
              })
            } else {
              nilaiByAspek[aspek.nama].push({
                kategori: kategori.nama,
                deskripsi: kategori.deskripsi,
                nilai: 0,
                predikat: 'D',
                predikatDesc: getPredikatDescription('D')
              })
            }
          })
        })

        // Calculate averages
        const averagesByAspek: any = {}
        let totalNilai = 0
        let totalKategori = 0

        Object.entries(nilaiByAspek).forEach(([aspekName, kategoriNilai]: [string, any]) => {
          const aspekNilaiValues = (kategoriNilai as any[]).map(k => k.nilai).filter(n => n > 0)
          const average = aspekNilaiValues.length > 0 
            ? Math.round(aspekNilaiValues.reduce((a, b) => a + b, 0) / aspekNilaiValues.length)
            : 0
          
          averagesByAspek[aspekName] = {
            average,
            predikat: getPredikat(average),
            predikatDesc: getPredikatDescription(getPredikat(average))
          }

          totalNilai += aspekNilaiValues.reduce((a, b) => a + b, 0)
          totalKategori += aspekNilaiValues.length
        })

        const overallAverage = totalKategori > 0 ? Math.round(totalNilai / totalKategori) : 0

        // Get current kamar and class
        const currentKamar = santri.santriKamar[0]
        const currentKelas = santri.santriKelas[0]
        const kamarInfo = currentKamar ? {
          kamar: currentKamar.kamar.nama,
          gedung: currentKamar.kamar.gedung.nama,
        } : null

        return {
          santri: {
            id: santri.id,
            nis: santri.nis,
            nama: santri.nama,
            alamat: santri.alamat,
            namaOrtu: santri.namaOrtu,
            noHpOrtu: santri.noHpOrtu,
            kamarInfo,
            kelas: currentKelas?.kelas || '-'
          },
          nilaiByAspek,
          averagesByAspek,
          overallAverage: {
            average: overallAverage,
            predikat: getPredikat(overallAverage),
            predikatDesc: getPredikatDescription(getPredikat(overallAverage))
          },
          periode: await db.periode.findUnique({
            where: { id: targetPeriodeId }
          })
        }
      })
    )

    return NextResponse.json(raporData)

  } catch (error) {
    console.error('Error fetching rapor:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}