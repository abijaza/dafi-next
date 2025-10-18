import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seeding...')

  // Create Tingkat
  const ma = await prisma.tingkat.upsert({
    where: { nama: 'MA' },
    update: {},
    create: {
      nama: 'MA',
      deskripsi: 'Madrasah Aliyah'
    }
  })

  const smp = await prisma.tingkat.upsert({
    where: { nama: 'SMP' },
    update: {},
    create: {
      nama: 'SMP',
      deskripsi: 'Sekolah Menengah Pertama'
    }
  })

  // Create Jenjang for MA
  const ma10 = await prisma.jenjang.upsert({
    where: { 
      tingkatId_nama: {
        tingkatId: ma.id,
        nama: '10'
      }
    },
    update: {},
    create: {
      nama: '10',
      tingkatId: ma.id
    }
  })

  const ma11 = await prisma.jenjang.upsert({
    where: { 
      tingkatId_nama: {
        tingkatId: ma.id,
        nama: '11'
      }
    },
    update: {},
    create: {
      nama: '11',
      tingkatId: ma.id
    }
  })

  const ma12 = await prisma.jenjang.upsert({
    where: { 
      tingkatId_nama: {
        tingkatId: ma.id,
        nama: '12'
      }
    },
    update: {},
    create: {
      nama: '12',
      tingkatId: ma.id
    }
  })

  // Create Jenjang for SMP
  const smp7 = await prisma.jenjang.upsert({
    where: { 
      tingkatId_nama: {
        tingkatId: smp.id,
        nama: '7'
      }
    },
    update: {},
    create: {
      nama: '7',
      tingkatId: smp.id
    }
  })

  const smp8 = await prisma.jenjang.upsert({
    where: { 
      tingkatId_nama: {
        tingkatId: smp.id,
        nama: '8'
      }
    },
    update: {},
    create: {
      nama: '8',
      tingkatId: smp.id
    }
  })

  const smp9 = await prisma.jenjang.upsert({
    where: { 
      tingkatId_nama: {
        tingkatId: smp.id,
        nama: '9'
      }
    },
    update: {},
    create: {
      nama: '9',
      tingkatId: smp.id
    }
  })

  // Create Kelas examples
  const kelasData = [
    // MA Kelas 10
    { nama: 'X-A', jenjangId: ma10.id, deskripsi: 'Kelas X-A' },
    { nama: 'X-B', jenjangId: ma10.id, deskripsi: 'Kelas X-B' },
    
    // MA Kelas 11
    { nama: 'XI-Bilingual', jenjangId: ma11.id, deskripsi: 'Kelas XI Bilingual' },
    { nama: 'XI-A', jenjangId: ma11.id, deskripsi: 'Kelas XI-A' },
    
    // MA Kelas 12
    { nama: 'XII-A', jenjangId: ma12.id, deskripsi: 'Kelas XII-A' },
    { nama: 'XII-B', jenjangId: ma12.id, deskripsi: 'Kelas XII-B' },
    
    // SMP Kelas 7
    { nama: 'VII-A', jenjangId: smp7.id, deskripsi: 'Kelas VII-A' },
    { nama: 'VII-B', jenjangId: smp7.id, deskripsi: 'Kelas VII-B' },
    { nama: 'VII-C', jenjangId: smp7.id, deskripsi: 'Kelas VII-C' },
    
    // SMP Kelas 8
    { nama: 'VIII-A', jenjangId: smp8.id, deskripsi: 'Kelas VIII-A' },
    { nama: 'VIII-B', jenjangId: smp8.id, deskripsi: 'Kelas VIII-B' },
    
    // SMP Kelas 9
    { nama: 'IX-A', jenjangId: smp9.id, deskripsi: 'Kelas IX-A' },
    { nama: 'IX-B', jenjangId: smp9.id, deskripsi: 'Kelas IX-B' },
  ]

  for (const kelas of kelasData) {
    await prisma.kelas.upsert({
      where: {
        jenjangId_nama: {
          jenjangId: kelas.jenjangId,
          nama: kelas.nama
        }
      },
      update: {},
      create: kelas
    })
  }

  // Create Pegawai (Staff)
  const waliKamarData = [
    { nama: 'Nur Wahidah, S.Ag., Al Hafizah', nip: 'WK001' },
    { nama: 'Nabila Taqiyya, S.Pd.', nip: 'WK002' },
    { nama: 'Tathmainnul Qulub, S.Pd.', nip: 'WK003' },
    { nama: 'Alvin Nahdah, Al Hafizah', nip: 'WK004' },
    { nama: 'Jihan Naura Hafidzoh', nip: 'WK005' },
    { nama: 'Azizah Izzatul Ulya, B.Sh.', nip: 'WK006' },
    { nama: 'Fitriyah, S.E.', nip: 'WK007' },
    { nama: 'Izdihar Hafidzaty Millati, S.Hum', nip: 'WK008' },
    { nama: 'Dini Mustaqim Billah A., A.Ma.', nip: 'WK009' },
    { nama: 'Amilatul Rosidah, S.Pd.', nip: 'WK010' },
    { nama: 'Dewi Herningtyas, Al Hafizah', nip: 'WK011' },
    { nama: 'Evin Oklidiana, S.Pd, M. Pd, Al Hafizah', nip: 'WK012' },
    { nama: 'Maria Ulfa, Lc., Al Hafizah', nip: 'WK013' },
    { nama: 'Binti R Wazniyatul Haq, A.Ma.', nip: 'WK014' },
    { nama: 'Salsabilla Rahma El Nadiya, Al Hafizah', nip: 'WK015' },
    { nama: 'Siti M Ismi Ila Ilmiyati, A,Ma, Al Hafizah', nip: 'WK016' },
    { nama: 'Khoirun Nisa, S.Pd', nip: 'WK017' }
  ]

  // Create Wali Kamar
  for (const pegawai of waliKamarData) {
    const email = pegawai.nama.toLowerCase().replace(/[^a-z0-9]/g, '.') + '@dafi.sch.id'
    const hashedPassword = await bcrypt.hash('pegawai123', 10)
    
    await prisma.pegawai.upsert({
      where: { nip: pegawai.nip },
      update: {},
      create: {
        nama: pegawai.nama,
        nip: pegawai.nip,
        email: email,
        password: hashedPassword,
        role: 'WALI_KAMAR',
        isWaliKamar: true
      }
    })
  }

  // Create Kepala Kepengasuhan (also Wali Kamar)
  const kepalaKepengasuhanPassword = await bcrypt.hash('pegawai123', 10)
  await prisma.pegawai.upsert({
    where: { nip: 'KK001' },
    update: {},
    create: {
      nama: 'Dwi Wahyuni, S.Pd.I.',
      nip: 'KK001',
      email: 'dwi.wahyuni@dafi.sch.id',
      password: kepalaKepengasuhanPassword,
      role: 'KEPALA_KEPENGASUHAN',
      isKepalaKepengasuhan: true,
      isWaliKamar: true
    }
  })

  // Create Admin
  const adminPassword = await bcrypt.hash('admin123', 10)
  await prisma.pegawai.upsert({
    where: { nip: 'ADM001' },
    update: {},
    create: {
      nama: 'admin',
      nip: 'ADM001',
      email: 'admin@dafi.sch.id',
      password: adminPassword,
      role: 'ADMIN',
      isAdmin: true
    }
  })

  console.log('Database seeding completed!')
  console.log(`Created ${await prisma.tingkat.count()} tingkat`)
  console.log(`Created ${await prisma.jenjang.count()} jenjang`)
  console.log(`Created ${await prisma.kelas.count()} kelas`)
  console.log(`Created ${await prisma.pegawai.count()} pegawai`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })