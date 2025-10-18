# Perbaikan Tombol Logout untuk Dashboard

## Masalah
User melaporkan bahwa tombol logout tidak ada saat login sebagai **Wali Kamar** dan **Kepala Kepengasuhan**.

## Penyebab
Dashboard Wali Kamar dan Kepala Kepengasuhan tidak menggunakan komponen `Sidebar` yang sudah memiliki fungsi logout. Mereka menggunakan layout tersendiri tanpa sidebar.

## Solusi yang Diterapkan

### 1. Membuat Layout Dashboard Universal
- Membuat file `/src/app/dashboard/layout.tsx`
- Layout ini secara otomatis:
  - Mengecek autentikasi user
  - Menampilkan sidebar yang sesuai dengan role
  - Menyediakan tombol logout untuk semua role
  - Mendukung responsive design (mobile & desktop)

### 2. Memperbaiki Dashboard yang Ada
- **Admin Dashboard**: Disederhanakan agar menggunakan layout universal
- **Wali Kamar Dashboard**: Dipertahankan fungsionalitasnya, otomatis menggunakan layout
- **Kepala Kepengasuhan Dashboard**: Dipertahankan fungsionalitasnya, otomatis menggunakan layout  
- **Wali Santri Dashboard**: Dipertahankan fungsionalitasnya, otomatis menggunakan layout

### 3. Menu Sidebar per Role
Setiap role sekarang memiliki menu yang sesuai:

#### Admin
- Dashboard
- Manajemen (Santri, Pegawai, Fasilitas)
- Akademik (Input Nilai, Rapor)
- Periode

#### Kepala Kepengasuhan
- Dashboard
- Santri
- Pegawai  
- Fasilitas

#### Wali Kamar
- Dashboard
- Santri
- Catatan

#### Wali Santri
- Dashboard
- Santri
- Nilai
- Komunikasi

### 4. Fitur Sidebar
- ✅ **Profile User**: Menampilkan nama, foto, dan role
- ✅ **Navigasi Menu**: Sesuai role masing-masing
- ✅ **Tombol Logout**: Tersedia untuk semua role
- ✅ **Mobile Responsive**: Sidebar dapat disembunyikan di mobile
- ✅ **Active State**: Menandai halaman yang sedang aktif

## Cara Mengakses Logout
Sekarang semua user dapat logout dengan:
1. Klik ikon **Settings** (roda gigi) di sidebar bawah
2. Klik tombol **Keluar** (warna merah) di sidebar bawah

## Testing
Silakan test dengan akun berikut:
- **Wali Kamar**: walikamar@pesantren.sch.id / wali123
- **Kepala Kepengasuhan**: kepala@pesantren.sch.id / kepala123
- **Admin**: admin@pesantren.sch.id / admin123
- **Wali Santri**: walisantri@pesantren.sch.id / walisantri123

Semua role sekarang memiliki akses logout yang konsisten.