# 📊 Database Seed Documentation

## 🌱 Overview
Database seed telah dibuat untuk mengisi sistem pesantren dengan data contoh yang realistis untuk pengembangan dan testing.

## 📈 Data Summary

### 📅 Periode Akademik
- **3 periode**: 2025/2026 (Aktif), 2024/2025 (Selesai)
- **Semester**: GANJIL, GENAP
- **Mid Semester**: TENGAH, AKHIR

### 🏢 Gedung & Fasilitas
- **Gedung A**: Asrama Putra (2 lantai)
- **Gedung B**: Asrama Putri (2 lantai)  
- **Gedung C**: Fasilitas Umum & Kelas

### 🎓 Kelas Akademik
- **7 kelas**: VII-A, VII-B, VII-BILINGUAL, VIII-A, VIII-B, IX-A, IX-B
- **Program reguler dan bilingual**

### 🛏️ Kamar Asrama
- **8 kamar total**: 4 kamar putra, 4 kamar putri
- **Kapasitas**: 20-24 santri per kamar
- **Fasilitas**: Lantai 1 (kelas 7-8), Lantai 2 (kelas 9)

### 👥 Personil
- **8 pegawai** dengan berbagai role:
  - 1 Admin sistem
  - 1 Kepala Kepengasuhan
  - 4 Wali Kamar
  - 2 Wali Santri

### 👦👧 Santri
- **40 santri**: 20 putra, 20 putri
- **Status**: AKTIF (35), NAIK_KELAS (3), LULUS (2)
- **Tahun masuk**: 2024-2025
- **Assignment**: Sudah ditugaskan ke kamar dan kelas

### 📊 Sistem Penilaian
- **4 aspek**: Ibadah, Belajar, Karakter, Kemandirian
- **26 kategori penilaian** dengan bobot berbeda
- **50 sample nilai** untuk santri aktif

### 📋 Laporan & Komunikasi
- **20 laporan**: KEHADIRAN, PERILAKU, KESEHATAN, AKADEMIK, LAINNYA
- **15 komunikasi**: ORANG_TUA, SANTRI, WALI_KAMAR, LAINNYA

## 🔑 Login Credentials

| Role | Email | Password | Akses |
|------|-------|----------|-------|
| **Admin** | admin@dafi.sch.id | password123 | Full system access |
| **Kepala Kepengasuhan** | kepala.kepengasuhan@dafi.sch.id | password123 | Oversight & reporting |
| **Wali Kamar** | ali.rahman@dafi.sch.id | password123 | Room management |
| **Wali Santri** | abdul.rahman@dafi.sch.id | password123 | Student guidance |

## 🏠 Room Assignments (Periode Aktif)

### Gedung A - Putra
- **A-101**: 10 santri (Wali: Ustadz Ali Rahman)
- **A-102**: 8 santri (Wali: Ustadz Ali Rahman)

### Gedung B - Putri  
- **B-101**: 10 santri (Wali: Ustadzah Siti Nurhaliza)
- **B-102**: 8 santri (Wali: Ustadzah Siti Nurhaliza)

## 🎓 Class Assignments (Periode Aktif)

- **VII-A**: 12 santri
- **VII-B**: 12 santri  
- **VII-BILINGUAL**: 6 santri
- **VIII-A**: 5 santri
- **VIII-B**: Tersedia untuk penambahan

## 🚀 Usage

### Run Seed
```bash
npm run db:seed
```

### Reset & Seed
```bash
npm run db:reset
npm run db:seed
```

### View Data
1. Login dengan akun admin
2. Akses menu Dashboard untuk melihat statistik
3. Menu Pengaturan untuk mengelola data master
4. Menu Data Periodik untuk mengatur penempatan santri

## 📝 Notes

- Password semua akun: **password123**
- Data dapat dimodifikasi melalui interface aplikasi
- Seed dapat dijalankan ulang untuk reset data
- Constraint unik mencegah duplikasi data
- Realistic naming sesuai konteks pesantren Indonesia

## 🎯 Testing Scenarios

1. **Login multi-role**: Test berbagai role dan permissions
2. **Data Periodik**: Test drag & drop santri ke kelas/kamar
3. **Penilaian**: Test input nilai untuk berbagai kategori
4. **Laporan**: Test pembuatan laporan santri
5. **Statistik**: Test dashboard dan reporting

Data seed siap digunakan untuk development dan testing! 🎉