import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ZAI } from 'z-ai-web-dev-sdk'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    
    // Fetch student with their nilai (scores) including related kategori and aspek
    const santri = await db.santri.findUnique({
      where: { id },
      include: {
        nilai: {
          include: {
            kategori: {
              include: {
                aspek: true
              }
            }
          }
        }
      }
    })

    if (!santri) {
      return NextResponse.json({ error: 'Santri not found' }, { status: 404 })
    }

    // Group scores by category
    const nilaiByKategori = santri.nilai.reduce((acc, nilai) => {
      const kategoriNama = nilai.kategori.nama
      if (!acc[kategoriNama]) {
        acc[kategoriNama] = {
          aspek: nilai.kategori.aspek.nama,
          items: []
        }
      }
      acc[kategoriNama].items.push({
        kegiatan: nilai.kegiatan,
        predikat: nilai.predikat,
        keterangan: nilai.keterangan
      })
      return acc
    }, {} as Record<string, { aspek: string; items: { kegiatan: string; predikat: string; keterangan: string }[] }>)

    // Format the response
    const formattedData = {
      nama: santri.nama,
      kamar: santri.kamar,
      nilai: nilaiByKategori
    }

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('Error fetching rapor:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rapor' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const { catatanWaliKelas, catatanKepengasuhan } = await request.json()

    // Fetch student data
    const santri = await db.santri.findUnique({
      where: { id },
      include: {
        nilai: {
          include: {
            kategori: {
              include: {
                aspek: true
              }
            }
          }
        }
      }
    })

    if (!santri) {
      return NextResponse.json({ error: 'Santri not found' }, { status: 404 })
    }

    // Group scores by category
    const nilaiByKategori = santri.nilai.reduce((acc, nilai) => {
      const kategoriNama = nilai.kategori.nama
      if (!acc[kategoriNama]) {
        acc[kategoriNama] = {
          aspek: nilai.kategori.aspek.nama,
          items: []
        }
      }
      acc[kategoriNama].items.push({
        kegiatan: nilai.kegiatan,
        predikat: nilai.predikat,
        keterangan: nilai.keterangan
      })
      return acc
    }, {} as Record<string, { aspek: string; items: { kegiatan: string; predikat: string; keterangan: string }[] }>)

    // Create formatted data for AI
    const raporData = {
      nama: santri.nama,
      kamar: santri.kamar,
      nilai: nilaiByKategori,
      catatanWaliKelas,
      catatanKepengasuhan
    }

    // Generate PDF using AI
    const zai = await ZAI.create()
    
    const prompt = `Buatkan laporan kepengasuhan formal untuk santri berikut:

Nama: ${raporData.nama}
Kamar: ${raporData.kamar}

Catatan Wali Kelas: ${catatanWaliKelas || '-'}
Catatan Kepengasuhan: ${catatanKepengasuhan || '-'}

Nilai-nilai:
${Object.entries(raporData.nilai).map(([kategori, data]) => `
${kategori} (${data.aspek}):
${data.items.map(item => `- ${item.kegiatan}: ${item.predikat} (${item.keterangan})`).join('\n')}
`).join('\n')}

Format laporan:
1. Header dengan nama santri dan periode
2. Tabel nilai per kategori
3. Catatan dari wali kelas dan kepengasuhan
4. Tanda tangan

Buat dalam format HTML yang bisa dicetak dengan styling yang rapi.`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates formal reports in HTML format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    const htmlContent = completion.choices[0]?.message?.content || ''

    return NextResponse.json({
      success: true,
      htmlContent
    })

  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}