import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Check if admin already exists
    const existingAdmin = await db.pegawai.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      return NextResponse.json(
        { message: 'Admin already exists' },
        { status: 400 }
      )
    }

    // Hash passwords
    const hashedPassword = await bcrypt.hash('admin123', 10)
    const hashedPassword2 = await bcrypt.hash('password123', 10)

    // Create initial users
    const admin = await db.pegawai.create({
      data: {
        nip: 'ADMIN001',
        nama: 'Administrator',
        email: 'admin@pesantren.sch.id',
        password: hashedPassword,
        noHp: '081234567890',
        role: 'ADMIN'
      }
    })

    const kepalaKepengasuhan = await db.pegawai.create({
      data: {
        nip: 'KK001',
        nama: 'Ustadz Ahmad Fadli',
        email: 'kepala@pesantren.sch.id',
        password: hashedPassword2,
        noHp: '081234567891',
        role: 'KEPALA_KEPENGASUHAN'
      }
    })

    const waliKamar = await db.pegawai.create({
      data: {
        nip: 'WK001',
        nama: 'Ustadz Budi Santoso',
        email: 'wali.kamar@pesantren.sch.id',
        password: hashedPassword2,
        noHp: '081234567892',
        role: 'WALI_KAMAR'
      }
    })

    const waliSantri = await db.pegawai.create({
      data: {
        nip: 'WS001',
        nama: 'Ustadzah Siti Nurhaliza',
        email: 'wali.santri@pesantren.sch.id',
        password: hashedPassword2,
        noHp: '081234567893',
        role: 'WALI_SANTRI'
      }
    })

    // Create initial gedung
    const gedung1 = await db.gedung.create({
      data: {
        nama: 'Gedung A',
        deskripsi: 'Gedung Putra'
      }
    })

    const gedung2 = await db.gedung.create({
      data: {
        nama: 'Gedung B',
        deskripsi: 'Gedung Putri'
      }
    })

    // Create initial kamar
    const kamar1 = await db.kamar.create({
      data: {
        gedungId: gedung1.id,
        nama: 'A1',
        kapasitas: 20,
        deskripsi: 'Kamar Putra Lantai 1'
      }
    })

    const kamar2 = await db.kamar.create({
      data: {
        gedungId: gedung1.id,
        nama: 'A2',
        kapasitas: 20,
        deskripsi: 'Kamar Putra Lantai 1'
      }
    })

    const kamar3 = await db.kamar.create({
      data: {
        gedungId: gedung2.id,
        nama: 'B1',
        kapasitas: 20,
        deskripsi: 'Kamar Putri Lantai 1'
      }
    })

    // Create initial periode
    const periode = await db.periode.create({
      data: {
        tahunAjaran: '2025/2026',
        semester: 'GANJIL',
        midSemester: 'TENGAH',
        isActive: true
      }
    })

    // Create aspek nilai
    const aspekIbadah = await db.aspekNilai.create({
      data: {
        nama: 'IBADAH',
        deskripsi: 'Penilaian aspek ibadah'
      }
    })

    const aspekBelajar = await db.aspekNilai.create({
      data: {
        nama: 'BELAJAR',
        deskripsi: 'Penilaian aspek belajar'
      }
    })

    const aspekKarakter = await db.aspekNilai.create({
      data: {
        nama: 'KARAKTER',
        deskripsi: 'Penilaian aspek karakter'
      }
    })

    const aspekKemandirian = await db.aspekNilai.create({
      data: {
        nama: 'KEMANDIRIAN',
        deskripsi: 'Penilaian aspek kemandirian'
      }
    })

    // Create kategori nilai (sample)
    await db.kategori.createMany({
      data: [
        // Aspek Ibadah
        { aspekId: aspekIbadah.id, nama: 'Sholat Wajib', deskripsi: 'Kedisiplinan sholat 5 waktu', bobot: 1.0 },
        { aspekId: aspekIbadah.id, nama: 'Sholat Sunnah', deskripsi: 'Sholat sunnah rawatib', bobot: 0.8 },
        { aspekId: aspekIbadah.id, nama: 'Puasa', deskripsi: 'Puasa sunnah Senin Kamis', bobot: 0.8 },
        { aspekId: aspekIbadah.id, nama: 'Baca Quran', deskripsi: 'Konsistensi baca Quran', bobot: 1.0 },
        
        // Aspek Belajar
        { aspekId: aspekBelajar.id, nama: 'Hafalan Quran', deskripsi: 'Target hafalan Quran', bobot: 1.0 },
        { aspekId: aspekBelajar.id, nama: 'Kitab Kuning', deskripsi: 'Pemahaman kitab kuning', bobot: 1.0 },
        { aspekId: aspekBelajar.id, nama: 'Bahasa Arab', deskripsi: 'Kemampuan bahasa Arab', bobot: 0.9 },
        { aspekId: aspekBelajar.id, nama: 'Bahasa Inggris', deskripsi: 'Kemampuan bahasa Inggris', bobot: 0.8 },
        
        // Aspek Karakter
        { aspekId: aspekKarakter.id, nama: 'Sopan Santun', deskripsi: 'Tata krama dan sopan santun', bobot: 1.0 },
        { aspekId: aspekKarakter.id, nama: 'Jujur', deskripsi: 'Kejujuran dalam perilaku', bobot: 1.0 },
        { aspekId: aspekKarakter.id, nama: 'Tanggung Jawab', deskripsi: 'Rasa tanggung jawab', bobot: 1.0 },
        { aspekId: aspekKarakter.id, nama: 'Disiplin', deskripsi: 'Kedisiplinan waktu', bobot: 0.9 },
        
        // Aspek Kemandirian
        { aspekId: aspekKemandirian.id, nama: 'Merapikan Kamar', deskripsi: 'Kebersihan dan kerapian kamar', bobot: 0.8 },
        { aspekId: aspekKemandirian.id, nama: 'Cuci Baju', deskripsi: 'Mandiri mencuci baju', bobot: 0.7 },
        { aspekId: aspekKemandirian.id, nama: 'Masak', deskripsi: 'Kemampuan memasak', bobot: 0.7 },
        { aspekId: aspekKemandirian.id, nama: 'Pengelolaan Waktu', deskripsi: 'Manajemen waktu pribadi', bobot: 0.9 }
      ]
    })

    return NextResponse.json({
      message: 'Database seeded successfully',
      data: {
        admin: admin.email,
        users: [
          { email: kepalaKepengasuhan.email, role: 'KEPALA_KEPENGASUHAN', password: 'password123' },
          { email: waliKamar.email, role: 'WALI_KAMAR', password: 'password123' },
          { email: waliSantri.email, role: 'WALI_SANTRI', password: 'password123' }
        ]
      }
    })

  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat seeding database' },
      { status: 500 }
    )
  }
}