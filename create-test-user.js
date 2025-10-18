const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.pegawai.findFirst({
      where: { email: 'admin@pesantren.sch.id' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.pegawai.create({
      data: {
        nip: 'ADMIN001',
        nama: 'Administrator',
        email: 'admin@pesantren.sch.id',
        password: hashedPassword,
        noHp: '08123456789',
        role: 'ADMIN'
      }
    });

    console.log('Admin user created:', admin);

    // Create Kepala Kepengasuhan user
    const hashedPasswordKK = await bcrypt.hash('kepala123', 10);
    
    const kepala = await prisma.pegawai.create({
      data: {
        nip: 'KK001',
        nama: 'Budi Santoso, S.Pd.I',
        email: 'kepala@pesantren.sch.id',
        password: hashedPasswordKK,
        noHp: '08123456790',
        role: 'KEPALA_KEPENGASUHAN'
      }
    });

    console.log('Kepala Kepengasuhan user created:', kepala);

    // Create Wali Kamar user
    const hashedPasswordWK = await bcrypt.hash('wali123', 10);
    
    const waliKamar = await prisma.pegawai.create({
      data: {
        nip: 'WK001',
        nama: 'Ahmad Rifai, S.Pd.I',
        email: 'walikamar@pesantren.sch.id',
        password: hashedPasswordWK,
        noHp: '08123456791',
        role: 'WALI_KAMAR'
      }
    });

    console.log('Wali Kamar user created:', waliKamar);

    // Create Wali Santri user
    const hashedPasswordWS = await bcrypt.hash('walisantri123', 10);
    
    const waliSantri = await prisma.pegawai.create({
      data: {
        nip: 'WS001',
        nama: 'Dwi Wahyuni, S.Pd.I',
        email: 'walisantri@pesantren.sch.id',
        password: hashedPasswordWS,
        noHp: '08123456792',
        role: 'WALI_SANTRI'
      }
    });

    console.log('Wali Santri user created:', waliSantri);

    console.log('\nAll test users created successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@pesantren.sch.id / admin123');
    console.log('Kepala Kepengasuhan: kepala@pesantren.sch.id / kepala123');
    console.log('Wali Kamar: walikamar@pesantren.sch.id / wali123');
    console.log('Wali Santri: walisantri@pesantren.sch.id / walisantri123');

  } catch (error) {
    console.error('Error creating test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();