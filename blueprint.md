# Blueprint Proyek: QM Score Monitoring Tool

## 1. Ringkasan & Kapabilitas Sistem
Aplikasi **QM Score Monitoring Tool** dirancang khusus untuk mempermudah Quality Control (QC) dan Team Leader (TL) dalam memonitoring serta melakukan audit terhadap performa Quality Monitoring (QM) Agent. 

### Kapabilitas Utama:
- **Sistem Autentikasi & Multi-role (Privilege)**: Mendukung peran QC, TL, Agent, dan Superadmin dengan kontrol akses menu yang dinamis.
- **Interactive Dashboard**: Panel visualisasi data performa QM Score dengan statistik rata-rata, tingkat kesalahan fatal, grafik tren interaktif, grafik perbandingan agent, serta tabel riwayat audit yang filterable.
- **Kalkulator QMS Realtime**: Form input findings yang secara instan menghitung skor akhir berdasarkan bobot parameter audit dan secara otomatis memicu kegagalan total (Skor 0) jika terjadi Fatal Error.

---

## 2. Dokumentasi Gaya Desain & Desain Visual
Aplikasi ini menerapkan standar visual modern premium untuk memberikan pengalaman pengguna terbaik:
- **Tema & Warna**:
  - Palet warna Indigo/Purple sebagai aksen premium (`#aa3bff` / `#c084fc`).
  - Latar belakang dinamis dengan dukungan mode Gelap (Dark Mode) bawaan dari sistem.
- **Glassmorphism**: 
  - Card, panel sidebar, dan form login memiliki tampilan semi-transparan dengan `backdrop-filter: blur(12px)` serta shadow berlapis untuk efek kedalaman visual ("lifted depth").
- **Glow & Shadow Effects**:
  - Tombol-tombol penting dan KPI Cards memiliki bayangan berwarna (colored glow shadow) yang berkilau lembut saat di-hover.
- **Interaktivitas & Animasi Mikro**:
  - Efek hover yang hidup (scaling kecil, transisi opacity, pergeseran warna).
  - Grafik SVG interaktif dengan animasi hover point dan tooltip pop-up.

---

## 3. Rencana & Langkah Pengembangan Saat Ini
Berikut adalah langkah-langkah implementasi terperinci untuk membangun fondasi awal aplikasi:

### Langkah 1: Instalasi Dependensi
- Menginstal paket pendukung routing: `react-router-dom` dan ikon: `lucide-react`.

### Langkah 2: State Management Global (`AppContext`)
- Membuat file `src/context/AppContext.jsx`.
- Menginisialisasi basis data mock berisi:
  - 4 Akun Demo dengan hak akses berbeda.
  - Data historis audit (findings) selama 3 bulan terakhir agar grafik terlihat kaya dan informatif secara instan.
  - State pelacakan login aktif.

### Langkah 3: Antarmuka Landing & Autentikasi (`AuthPage`)
- Membuat tampilan login dan signup di `src/components/Auth.jsx`.
- Menambahkan kartu "Demo Login" yang memungkinkan penguji melakukan login instan satu-klik sebagai QC, TL, Agent, atau Superadmin.

### Langkah 4: Panel Navigasi Sisi (`Sidebar`)
- Membuat menu sidebar yang meluncur halus di `src/components/Sidebar.jsx`.
- Menyembunyikan menu "Input Finding" untuk role Agent dan hanya menampilkannya untuk QC, TL, dan Superadmin.

### Langkah 5: Dashboard Monitoring Interaktif (`Dashboard`)
- Membuat visualisasi performa di `src/components/Dashboard.jsx`.
- Mengimplementasikan 3 grafik SVG interaktif murni tanpa pustaka berat:
  1. *Line Chart* (Tren QMS bulanan/harian).
  2. *Bar Chart* (Perbandingan QMS antar Agent).
  3. *Radial Donut Chart* (Persentase audit Lolos vs Fatal).
- Menyediakan komponen Filter filter berdasarkan nama Agent, Bulan, Tahun, dan Rentang Tanggal.
- Membuat tabel riwayat audit yang dapat dicari dan diurutkan.

### Langkah 6: Form Penilaian Audit (`InputFinding`)
- Membuat form pengisian audit di `src/components/InputFinding.jsx`.
- Menyusun parameter penilaian:
  - **Soft Skills** (Bobot 30%)
  - **Product Knowledge** (Bobot 30%)
  - **Process Compliance** (Bobot 40%)
  - **Critical/Fatal Issue** (Jika diatur ke "Yes", total skor QMS langsung menjadi 0!).
- Input data finding akan otomatis memicu pembaruan state global, sehingga dashboard langsung memperbarui data secara dinamis.
