# Blueprint Proyek: QM Score Monitoring Tool

## 1. Ringkasan & Kapabilitas Sistem
Aplikasi **QM Score Monitoring Tool** dirancang khusus untuk mempermudah Quality Control (QC) dan Team Leader (TL) dalam memonitoring serta melakukan audit terhadap performa Quality Monitoring (QM) Agent.

### Kapabilitas Utama:
- **Sistem Autentikasi & Multi-role (Privilege)**: Mendukung peran QC, TL, Agent, dan Superadmin dengan kontrol akses menu yang dinamis.
- **Interactive Dashboard**: Visualisasi data performa dengan statistik rata-rata, tren skor, perbandingan agent, dan riwayat audit mendetail.
- **Kalkulator QMS Standar Baru**: Form input findings berdasarkan 12 parameter standar dengan sistem penilaian 1/0 dan dokumentasi sub-parameter kegagalan.

---

## 2. Struktur Penilaian QMS (12 Parameter)
Penilaian dibagi menjadi 3 kategori utama dengan total bobot 100%:

### A. Proses Layanan (Bobot 20%)
1. **Mengucapkan salam pembuka** (5%)
2. **Mengucapkan salam penutup** (5%)
3. **Validasi data pemilik nomor** (5%)
4. **Melakukan dokumentasi pada aplikasi** (5%)

### B. Sikap Layanan (Bobot 40%)
5. **Nama pelanggan min 3x** (5%)
6. **Tidak memotong percakapan** (6%)
7. **Bahasa Indonesia/Inggris baik** (6%)
8. **Nada, intonasi, artikulasi** (10%)
9. **Kemauan membantu & empati** (8%)
10. **Menangani keluhan pelanggan** (5%)

### C. Solusi Layanan (Bobot 40%)
11. **Akurasi informasi produk & prosedur** (35%)
12. **Summary & Disclaimer** (5%)

---

## 3. Dokumentasi Gaya Desain & Visual
- **Glassmorphism**: Card semi-transparan dengan efek blur dan shadow berlapis.
- **Dynamic Feedback**: Warna skor berubah otomatis (Hijau >= 90%, Kuning >= 80%, Merah < 80%).
- **Interactive Forms**: Dropdown 1/0 yang secara dinamis memunculkan checkbox sub-parameter jika nilai 0 (Fail) dipilih.

---

## 4. Rencana Pengembangan & Deployment
### Status Implementasi:
- [x] Dasar State Management & Context
- [x] Sistem Autentikasi & Role-based Access
- [x] Form Input QMS 12 Parameter (Hybrid Dropdown + Checkbox)
- [x] Dashboard Monitoring & Detail Audit Modal
- [x] Konfigurasi Vercel Hybrid Hosting (React + Express Serverless)

### Langkah Berikutnya:
- Sinkronisasi database MongoDB Atlas untuk penyimpanan permanen findings.
- Fitur ekspor laporan ke format Excel/PDF.
- Sistem notifikasi email otomatis ke Agent saat audit selesai.

---

## 5. Konfigurasi Hosting (Vercel)
- **Frontend**: Vite built to `dist/`.
- **Backend**: Express Serverless in `api/`.
- **Environment**: Membutuhkan `MONGODB_URI` di dashboard Vercel.
