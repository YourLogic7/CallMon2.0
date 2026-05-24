export const QM_CATEGORIES = [
  {
    id: 'A',
    name: 'Proses Layanan',
    weight: 20,
    parameters: [
      {
        id: 1,
        name: 'Mengucapkan salam pembuka',
        weight: 5,
        subParams: [
          '1.1. Salam pembuka diucapkan tidak lengkap dan tidak benar.',
          '1.2. Salam pembuka diucapkan tidak jelas (terlalu cepat/terlalu lambat/terputus).',
          '1.3. Salah menyebutkan salam waktu.',
          '1.4. Tidak jelas atau salah menyebutkan nama online.',
          '1.5. Tidak menyampaikan salam pembuka.'
        ]
      },
      {
        id: 2,
        name: 'Mengucapkan salam penutup',
        weight: 5,
        subParams: [
          '2.1. Salam penutup diucapkan tidak lengkap dan tidak benar',
          '2.2. Tidak menyampaikan edukasi closing',
          '2.3. Salah menyebutkan salam waktu',
          '2.4. Salah menyebutkan salam Buddies',
          '2.5. Salam penutup diucapkan tidak jelas (terlalu cepat/terlalu lambat/terputus)',
          '2.6. Tidak menyampaikan salam penutup',
          '2.7. Menyampaikan edukasi closing tidak lengkap'
        ]
      },
      {
        id: 3,
        name: 'Validasi data pemilik nomor',
        weight: 5,
        subParams: [
          '3.1. Tidak melakukan validasi dengan benar and lengkap',
          '3.2. Tidak menanyakan relasi penerima telepon',
          '3.3. Salah menyebutkan no tiket gangguan',
          '3.4. Salah menyebutkan nomor pelanggan',
          '3.5. Salah menyebutkan nama kepemilikan',
          '3.6. Salah atau tidak lengkap menyebutkan alamat pelanggan (min nama Jalan dan no rumah)'
        ]
      },
      {
        id: 4,
        name: 'Melakukan dokumentasi pada aplikasi terkait',
        weight: 5,
        subParams: [
          '4.1. Tidak mengisi kolom keterangan pada dokumentasi dengan lengkap',
          '4.2. Pengisian dokumentasi tidak valid',
          '4.3. Pengisian dokumentasi tidak lengkap',
          '4.4. Salah membuat status tiket',
          '4.5. Tidak create tiket',
          '4.6. Pengisian dokumentasi > 1',
          '4.7. Tidak mengisi/ membuat dokumentasi',
          '4.8. Salah/ tidak lengkap saat melakukan update worklog nossa'
        ]
      }
    ]
  },
  {
    id: 'B',
    name: 'Sikap Layanan',
    weight: 40,
    parameters: [
      {
        id: 5,
        name: 'Mengucapkan nama pelanggan minimal 3 kali (awal, tengah & akhir)',
        weight: 5,
        subParams: [
          '5.1. Menyebutkan nama pelanggan < 3x',
          '5.2. Menanyakan kembali nama pelanggan',
          '5.3. Tidak menyebutkan nama pelanggan',
          '5.4. Salah menyebutkan nama pelanggan',
          '5.5. Tidak menanyakan nama pelanggan'
        ]
      },
      {
        id: 6,
        name: 'Tidak memotong percakapan pelanggan',
        weight: 6,
        subParams: [
          '6.1. Agent memotong pembicaraan saat penelepon masih berbicara'
        ]
      },
      {
        id: 7,
        name: 'Menggunakan Bahasa Indonesia atau Inggris dengan baik dan benar',
        weight: 6,
        subParams: [
          '7.1. Menggunakan bahasa Indonesia/Inggris yang tidak baik dan tidak benar',
          '7.2. Menggunakan bahasa teknis dan tidak berusaha menerangkannya kepada penelepon',
          '7.3. Menggunakan bahasa daerah',
          '7.4. Agent tidak meminta ijin sebelum meminta pelanggan menunggu',
          '7.5. Agent tidak mengucapkan terimakasih setelah pelanggan menunggu dan setelah meminta data pelanggan',
          '7.6. Agent menggunakan kata berulang yg diucapkan tidak wajar'
        ]
      },
      {
        id: 8,
        name: 'Nada, intonasi dan artikulasi',
        weight: 10,
        subParams: [
          '8.1. Suara terdengar malas-malasan dalam melayani pelanggan',
          '8.2. Nada dan intonasi cenderung terdengar tinggi atau ketus/judes',
          '8.3. Nada dan intonasi tidak antusias',
          '8.4. Mengintimidasi dan membentak pelanggan',
          '8.5. Pengucapan kata-kata tidak sesuai dengan tata bahasa yang baik dan benar',
          '8.6. Terlalu cepat/lambat dalam melayani pelanggan dan pengucapan kata-kata menjadi tidak jelas',
          '8.7. Volume suara agent terdengar tidak jelas, terlalu kecil oleh pelanggan & penilai',
          '8.8. Volume suara agent terlalu keras oleh sehingga terkesan membentak pelanggan'
        ]
      },
      {
        id: 9,
        name: 'Kemauan membantu, melayani penuh perhatian dan empati',
        weight: 8,
        subParams: [
          '9.1. Tidak fokus pada saat melayani pelanggan',
          '9.2. Agent terdengar sedang berbicara dengan rekan kerja yang lain atau sedang tertawa',
          '9.3. Agent memutus percakapan sebelum pelayanan selesai',
          '9.4. Terkesan ingin cepat-cepat menyudahi percakapan atau tidak memberikan waktu kepada pelanggan untuk merespon',
          '9.5. Tidak empati dan tidak ada keinginan untuk membantu pelanggan',
          '9.6. Tidak merespon pembicaraan pelanggan atau pertanyaan pelanggan',
          '9.7. Hening di awal ,tengah dan akhir >5 dtk',
          '9.8. Agent tidak menginformasikan dengan lengkap tentang campaign',
          '9.9. Tidak menyampaikan pertanyaan survei dengan benar dan jelas',
          '9.10. Menyampaikan pertanyaan survei tidak lengkap'
        ]
      },
      {
        id: 10,
        name: 'Menangani keluhan pelanggan',
        weight: 5,
        subParams: [
          '10.1. Tidak identifikasi permasalahan pelanggan sesuai dengan tiket dan probis',
          '10.2. Tidak menggali pertanyaan pelanggan sesuai dengan permasalahan pelanggan',
          '10.3. Tidak memberikan edukasi kepada pelanggan',
          '10.4. Tidak menanyakan kedatangan petugas',
          '10.5. Menyalahkan/ menyudutkan Indihome Grup'
        ]
      }
    ]
  },
  {
    id: 'C',
    name: 'Solusi Layanan',
    weight: 40,
    parameters: [
      {
        id: 11,
        name: 'Informasi produk dan prosedur dengan akurat, tepat dan tidak berlebihan',
        weight: 35,
        subParams: [
          '11.1. Informasi yg diberikan tidak akurat atau tidak lengkap',
          '11.2. Tidak sesuai melakukan analisa data',
          '11.3. Agent tidak sesuai dgn prosedur pelayanan'
        ]
      },
      {
        id: 12,
        name: 'Summary dan Disclaimer',
        weight: 5,
        subParams: [
          '12.1. Tidak menyampaikan disclaimer dengan benar dan jelas',
          '12.2. Tidak membuat kesimpulan'
        ]
      }
    ]
  }
];
