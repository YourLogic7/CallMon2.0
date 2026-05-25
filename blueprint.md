# Blueprint Proyek: QM Score Monitoring Tool (CallMon2.0)

## 1. Ringkasan & Kapabilitas Sistem
Aplikasi **QM Score Monitoring Tool (CallMon2.0)** dirancang khusus untuk mempermudah Quality Control (QC), Team Leader (TL), dan Agent dalam memantau, melakukan evaluasi, serta melihat performa Quality Monitoring (QM) Agent secara real-time.

### Kapabilitas Utama:
- **Sistem Autentikasi & Multi-role (Privilege)**: Mendukung peran Superadmin, QC, TL, dan Agent dengan pembatasan hak akses rute menu secara dinamis di frontend dan backend.
- **Interactive Performance Dashboard**: Visualisasi tren rata-rata nilai QMS, total evaluasi, peringkat Agent, pencarian data interaktif, pengurutan (sorting), pembagian halaman (pagination), serta popup modal detail riwayat temuan (modal overlay).
- **Kalkulator QMS Standar Baru (12 Parameter)**: Formulir input evaluasi otomatis dengan accordion kategori bobot parameter, durasi panggilan, metadata tiket, serta checkbox sub-kegagalan dinamis saat skor parameter bernilai 0 (Fail).
- **Relasi & Manajemen SDM**: Panel pengelolaan pembuatan akun privilege serta pembentukan pasangan kemitraan terstruktur antara Team Leader dan Agent.

---

## 2. Struktur Penilaian QMS (12 Parameter)
Penilaian evaluasi QMS dihitung secara dinamis berdasarkan 3 kategori utama dengan bobot akumulatif 100%:

### A. Proses Layanan (Bobot 20%)
1. Mengucapkan salam pembuka (5%)
2. Mengucapkan salam penutup (5%)
3. Validasi data pemilik nomor (5%)
4. Melakukan dokumentasi pada aplikasi (5%)

### B. Sikap Layanan (Bobot 40%)
5. Nama pelanggan min 3x (5%)
6. Tidak memotong percakapan (6%)
7. Bahasa Indonesia/Inggris baik (6%)
8. Nada, intonasi, artikulasi (10%)
9. Kemauan membantu & empati (8%)
10. Menangani keluhan pelanggan (5%)

### C. Solusi Layanan (Bobot 40%)
11. Akurasi informasi produk & prosedur (35%)
12. Summary & Disclaimer (5%)

---

## 3. Arsitektur State & Database API Endpoints
Aplikasi terhubung ke database MongoDB melalui Express serverless backend dengan arsitektur berikut:

### Rute Backend API (`server/index.js`):
- `POST /api/login` & `POST /api/signup`: Mengontrol autentikasi pengguna dan pembuatan token JWT (masa berlaku 5 jam).
- `GET /api/users` & `DELETE /api/users/:id`: Mengambil seluruh daftar pengguna terdaftar dan menghapus pengguna (Superadmin).
- `GET /api/findings` & `POST /api/findings`: Mengambil data audit historis serta menambahkan data audit evaluasi baru yang dikomputasi otomatis.
- `GET`, `POST`, `DELETE` `/api/team-leaders`: Mengelola pendaftaran Team Leader.
- `GET`, `POST`, `DELETE` `/api/sdm`: Mengelola daftar Agent beserta pasangan timnya.

### State Context (`src/context/AppContext.jsx`):
- `AppContextProvider` bertindak sebagai penyedia state global tunggal untuk data pengguna aktif (`currentUser`), status muatan (`isLoading`), login/signup/logout, dan data entitas (findings, users, teamLeaders, sdmList).
- Mengelola penyematan `Bearer Token` secara otomatis melalui Axios interceptors pada header `Authorization` untuk menjamin keamanan rute API.

---

## 4. Dokumentasi Gaya Desain & Visual (Premium Styles)
- **Glassmorphism**: Lapisan card transparan menggunakan efek `backdrop-filter: blur(20px)` dengan border tipis transparan (`rgba(255, 255, 255, 0.08)`).
- **Neon Dark Palette**: Perpaduan harmonis radial gradient gelap (`#17153b` ke `#0c0f1a`) dengan warna aksen indigo `#6366f1` dan ungu `#a855f7` yang berpendar.
- **Micro-Animations & Interaction**: Tombol, input teks, dan tautan menu memiliki transisi halus, peningkatan kecerahan (brightness), efek angkat (translateY), serta pendaran bayangan (shadow glow) saat difokuskan.
- **Taktil & Kedalaman**: Tekstur noise super halus di latar belakang disatukan dengan bayangan multi-layer elevasi tinggi untuk menampilkan kedalaman ruang visual.
- **Mobile Responsive Layout**: Sidebar navigasi otomatis melipat menjadi menu *drawer* mobile tersembunyi dengan tombol pemicu burger di header seluler, menjamin kompatibilitas 100% pada layar HP maupun desktop.

---

## 5. Rencana Pengembangan & Deployment
### Status Implementasi Saat Ini:
- [x] Dasar State Management & Penyatuan Context (`AppContext`)
- [x] Sistem Autentikasi JWT & Role-based Access Rute
- [x] Form Input QMS 12 Parameter (Kalkulator Skor Dinamis + Accordion)
- [x] Dashboard Monitoring (Pencarian, Filter, Sorting, Pagination, Modal Detail)
- [x] Manajemen Akun & Manajemen Tim (CRUD TL & CRUD Agent)
- [x] API Database Backend (Findings, SDM, TL, dan User Delete) terhubung ke MongoDB Atlas
- [x] Kompilasi Build Produksi Vite & Analisis Linter Bersih

### Langkah Berikutnya:
- Fitur ekspor laporan hasil audit ke dalam format spreadsheet Excel / PDF.
- Sistem notifikasi email otomatis ke email Agent saat proses evaluasi selesai diinput oleh QC/TL.
- Grafik chart tren peningkatan skor QMS bulanan secara visual (SVG/ChartJS).
