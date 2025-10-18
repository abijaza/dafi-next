import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // Data Aspek berdasarkan PDF
    const aspekData = [
      {
        nama: 'Ibadah',
        deskripsi: 'Aspek penilaian terkait kegiatan ibadah harian dan spiritualitas santri'
      },
      {
        nama: 'Belajar',
        deskripsi: 'Aspek penilaian terkait aktivitas belajar dan pengembangan ilmu'
      },
      {
        nama: 'Karakter',
        deskripsi: 'Aspek penilaian terkait pembentukan karakter dan perilaku santri'
      },
      {
        nama: 'Kemandirian',
        deskripsi: 'Aspek penilaian terkait kemandirian dan tanggung jawab pribadi santri'
      }
    ]

    // Data Kegiatan berdasarkan PDF
    const kegiatanData = [
      // Ibadah
      { aspekNama: 'Ibadah', nama: 'Shalat Jamaah tidak masbuq', frekuensi: '5 kali/hari', target: 'Tidak terlambat' },
      { aspekNama: 'Ibadah', nama: 'Shalat Rawatib', frekuensi: '3 kali/hari', target: 'Dikerjakan dengan khusyuk' },
      { aspekNama: 'Ibadah', nama: 'Qiyamul lail', frekuensi: '2 kali/pekan', target: 'Bangun malam untuk ibadah' },
      { aspekNama: 'Ibadah', nama: 'Shalat Dhuha', frekuensi: '2 kali/pekan', target: 'Dikerjakan secara rutin' },
      { aspekNama: 'Ibadah', nama: 'Tilawah', frekuensi: '1/2 juz/hari', target: 'Membaca Al-Quran dengan tartil' },
      { aspekNama: 'Ibadah', nama: 'Puasa Sunnah', frekuensi: '1 kali/pekan', target: 'Puasa Senin atau Kamis' },
      { aspekNama: 'Ibadah', nama: 'Zikir pagi dan sore', frekuensi: '1 kali/hari', target: 'Dzikir rutin setiap hari' },
      { aspekNama: 'Ibadah', nama: 'Infaq', frekuensi: '3 kali/pekan', target: 'Bersedekah secara rutin' },
      
      // Belajar
      { aspekNama: 'Belajar', nama: 'Menghadiri majelis ilmu', frekuensi: '1 kali/hari', target: 'Hadir tepat waktu' },
      { aspekNama: 'Belajar', nama: 'Menghadiri kegiatan Bina Karakter', frekuensi: '1 kali/hari', target: 'Aktif mengikuti kegiatan' },
      { aspekNama: 'Belajar', nama: 'Belajar malam', frekuensi: '1 kali/hari', target: 'Belajar dengan serius' },
      { aspekNama: 'Belajar', nama: 'Menghadiri Halaqah Tahfizh', frekuensi: '3 kali/pekan', target: 'Hafalan dan murajaah' },
      
      // Karakter
      { aspekNama: 'Karakter', nama: 'Bersikap tawadhu\' kepada Ustadz dan Ustadzah', frekuensi: 'Selalu', target: 'Sopan dan rendah hati' },
      { aspekNama: 'Karakter', nama: 'Berbicara dengan sopan dan santun dan jujur (menjaga lisan)', frekuensi: 'Selalu', target: 'Menjaga ucapan dan perkataan' },
      { aspekNama: 'Karakter', nama: 'Memakai pakaian yang syar\'i dan sesuai aturan', frekuensi: 'Selalu', target: 'Pakaian rapi dan menutup aurat' },
      { aspekNama: 'Karakter', nama: 'Menjalankan adab makan', frekuensi: 'Selalu', target: 'Adab makan yang benar' },
      { aspekNama: 'Karakter', nama: 'Membudayakan antri', frekuensi: 'Selalu', target: 'Disiplin dalam antri' },
      { aspekNama: 'Karakter', nama: 'Menjalankan 5S 5R 1M', frekuensi: 'Selalu', target: 'Kebersihan dan kerapian' },
      { aspekNama: 'Karakter', nama: 'Menjaga pandangan', frekuensi: 'Selalu', target: 'Menundukkan pandangan' },
      
      // Kemandirian
      { aspekNama: 'Kemandirian', nama: 'Bangun tidur sendiri', frekuensi: '1 kali/hari', target: 'Bangun tanpa dibangunkan' },
      { aspekNama: 'Kemandirian', nama: 'Menjaga Kebersihan diri dan lingkungan', frekuensi: 'Selalu', target: 'Bersih dan sehat' },
      { aspekNama: 'Kemandirian', nama: 'Melaksanakan piket harian', frekuensi: '1 kali/hari', target: 'Tanggung jawab piket' },
      { aspekNama: 'Kemandirian', nama: 'Menjaga kesehatan diri', frekuensi: 'Selalu', target: 'Pola hidup sehat' },
      { aspekNama: 'Kemandirian', nama: 'Menjalankan aktivitas sehari-hari dengan disiplin', frekuensi: 'Selalu', target: 'Disiplin waktu' },
      { aspekNama: 'Kemandirian', nama: 'Berkomunikasi dengan bahasa Arab', frekuensi: 'Selalu', target: 'Menggunakan bahasa Arab' },
      { aspekNama: 'Kemandirian', nama: 'Taat aturan perizinan', frekuensi: 'Selalu', target: 'Mematuhi aturan' }
    ]

    // Create or find aspek
    const createdAspek = []
    for (const aspek of aspekData) {
      const existingAspek = await db.aspekNilai.findFirst({
        where: { nama: aspek.nama }
      })

      if (!existingAspek) {
        const newAspek = await db.aspekNilai.create({
          data: aspek
        })
        createdAspek.push(newAspek)
      } else {
        createdAspek.push(existingAspek)
      }
    }

    // Create kegiatan
    for (const kegiatan of kegiatanData) {
      const aspek = createdAspek.find(a => a.nama === kegiatan.aspekNama)
      if (aspek) {
        const existingKegiatan = await db.kegiatan.findFirst({
          where: {
            aspekId: aspek.id,
            nama: kegiatan.nama
          }
        })

        if (!existingKegiatan) {
          await db.kegiatan.create({
            data: {
              aspekId: aspek.id,
              nama: kegiatan.nama,
              frekuensi: kegiatan.frekuensi,
              target: kegiatan.target
            }
          })
        }
      }
    }

    return NextResponse.json({
      message: 'Data aspek dan kegiatan berhasil di-seed',
      totalAspek: createdAspek.length,
      totalKegiatan: kegiatanData.length
    })
  } catch (error) {
    console.error('Error seeding data:', error)
    return NextResponse.json(
      { error: 'Gagal melakukan seed data' },
      { status: 500 }
    )
  }
}