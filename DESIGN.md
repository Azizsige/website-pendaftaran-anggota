# DESIGN.md: Portal Pendaftaran Anggota Organisasi Mahasiswa

## 1. Identitas & Posisi Produk
- **Jenis Produk:** Portal resmi pendaftaran anggota baru organisasi kampus/kemahasiswaan dan penerbitan Kartu Tanda Anggota (KTA) digital.
- **Pengguna Utama:** Mahasiswa calon anggota yang ingin mendaftar menggunakan NIM dan KTM, serta anggota/pendaftar yang memeriksa status penerimaan dan mengunduh KTA digital di `/cek-status`.
- **Nada Suara:** Tegas-institusional, informatif, jujur sesuai kondisi sistem, dan ringkas dalam Bahasa Indonesia. Menghindari jargon SaaS/AI, klaim tak berbukti, maupun angka statistik rekaan.

## 2. Design Read & Three Dials
> Reading this as: Portal resmi pendaftaran anggota dan penerbitan KTA digital organisasi mahasiswa untuk calon anggota & anggota terdaftar, dengan gaya editorial institusional yang bersih dan berbasis fungsi nyata, dial `ENERGY 2 / RHYTHM 3 / MOTION 1`.

- **ENERGY 2 (Balanced-Assertive):** Tegas dan terstruktur dengan pratinjau format KTA digital nyata di hero dan status pendaftaran langsung dari basis data, tanpa elemen latar melayang atau efek neon.
- **RHYTHM 3 (Varied Composition):** Setiap section pada Beranda memiliki komposisi berbeda agar tidak monoton:
  1. Hero split 2-kolom asimetris (7/5): status gelombang + aksi utama di kiri, pratinjau format KTA digital di kanan.
  2. Band Syarat & Alur 2-kolom (5/7) pada latar putih: daftar syarat dinamis dari pengaturan sistem di kiri, daftar 4 tahap terstruktur di kanan.
  3. Sorotan Layanan Cek Status & Validasi (6/6, orientasi visual dibalik) pada latar `#f7f9fb`: pratinjau alur pencarian `/cek-status` di kiri, ringkasan fitur nyata di kanan.
  4. Band CTA penutup ringkas + satu footer tunggal resmi organisasi.
- **MOTION 1 (Calm):** Hanya transisi hover dan fokus yang ringan; tidak ada animasi infinite loop (`pulse`, `float`, `bounce`), serta mematuhi `prefers-reduced-motion: reduce`.

## 3. Palet Warna (Terverifikasi WCAG AA)
- **Netral Dasar:**
  - Latar halaman: `#f7f9fb`
  - Permukaan kartu/band alternatif: `#ffffff`
  - Permukaan halus: `#f2f4f6`
  - Teks utama: `#191c1e` (rasio > 16:1 di `#f7f9fb`)
  - Teks sekunder: `#3c4a42` (rasio > 8.8:1 di `#f7f9fb`)
  - Teks meta/muted aman: `#4b5850` (rasio > 7.0:1 di `#f7f9fb`)
  - Border kontrol & garis non-teks: `#5c6b62` (rasio > 5.1:1 di `#f2f4f6` dan `#ffffff`, memenuhi WCAG 1.4.11 >= 3.0:1)
- **Warna Primer Organisasi:**
  - Hijau Organisasi: `#006c49` (rasio 6.48:1 di `#ffffff`)
  - Hijau Gelap (hover/penekanan): `#005236`
  - Teks di atas latar `#006c49`: `#ffffff` (6.48:1) atau `#ecfdf5` (6.15:1)
  - Latar badge status aktif: `#e6f4ee` dengan teks `#005236` (8.20:1)
- **Aksen Tunggal (Key Moments Only):**
  - Amber Institusional untuk penanda status non-aktif/tutup (`#fef3c7` dengan teks `#92400e`, rasio 6.37:1) serta aksen identitas resmi pada komponen KTA Digital (`#0b1e3f` + `#f59e0b`).

## 4. Tipografi
- **Display & Heading (`--font-jakarta`):** `Plus Jakarta Sans` via `next/font/google`. Dipilih karena memiliki karakter geometris yang tegas namun tetap ramah untuk lingkungan akademik dan organisasi mahasiswa Indonesia.
- **Body (`--font-inter`):** `Inter` via `next/font/google`. Dipilih untuk keterbacaan paragraf instruksi, syarat berkas, dan label formulir yang padat.
- **Monospace (`--font-mono`):** `JetBrains Mono` via `next/font/google`, dibatasi hanya untuk kode identifikasi teknis seperti pratinjau format NIM/nomor anggota pada KTA.
- **Skala Responsif:** Judul utama menggunakan `clamp(2rem, 4.2vw, 3.125rem)` agar tetap proporsional di layar 375px maupun desktop 1440px.

## 5. Sistem Radius, Elevasi, & Ikonografi
- **Border Radius (R-11):**
  - Tombol aksi & input: `rounded-lg` (`8px`)
  - Kartu informasi & panel: `rounded-xl` (`12px`) atau `rounded-2xl` (`16px`)
  - Badge status fungsional: `rounded-md` (`6px`)
- **Elevasi (R-12):** Sebagian besar elemen duduk datar dengan border terukur; hanya pratinjau kartu KTA Digital yang memakai shadow ringan (`shadow-md`) sebagai fokus visual utama di hero.
- **Ikonografi (R-04):** Halaman Beranda dan navigasi publik hanya menggunakan `lucide-react` secara konsisten tanpa mencampur library ikon lain dan tanpa memuat font ikon eksternal yang memblokir render.

## 6. Justifikasi Keputusan Utama (R-31)
- **Mengapa split hero dengan pratinjau KTA?** Calon pendaftar langsung melihat dokumen nyata yang mereka peroleh setelah disetujui sekaligus mengetahui status buka/tutup pendaftaran saat ini.
- **Mengapa tidak ada section statistik angka?** Basis data pendaftaran baru tidak boleh dipalsukan dengan angka ribuan statis; hanya sisa kuota dan status periode asli dari basis data yang ditampilkan.
- **Mengapa 1 warna primer hijau + netral + aksen amber terbatas?** Menjaga konsistensi identitas sistem yang sudah dipakai di halaman daftar, cek status, dan admin tanpa bentrok warna dekoratif.

## 7. Portal Admin & Overview /admin
- **Referensi Tata Letak:** Diadaptasi dari pola analitik modern berkartu putih (clean light canvas) yang selaras dengan identitas Portal Organisasi Kampus dalam Bahasa Indonesia penuh.
- **Energi & Ritme (`ENERGY 2 / RHYTHM 3 / MOTION 1`):** Permukaan kerja bernapas di `#f4f6f8` dengan kartu datar putih `#ffffff` berbingkai `#e2e8f0`, sudut `12px`, tanpa bayangan tebal atau elemen dekoratif mengambang.
- **Warna Tervalidasi Kontras (AA):**
  - Teks utama `#191c1e`, teks sekunder `#4b5850` / `#52606d`.
  - Aksen primer `#006c49` (emerald institusional), permukaan aktif `#e6f4ee` dengan teks `#005236` dan indikator garis kiri `3px` di `#006c49`.
  - Semantik status: disetujui (`#005236` / `#e6f4ee`), menunggu (`#92400e` / `#fef3c7`, grafik `#d97706`), ditolak (`#991b1b` / `#fef2f2`, grafik `#dc2626`), pendaftar umum (`#1e40af` / `#eff6ff`, grafik `#1d4ed8`).
- **Kejujuran Data & Interaksi (`R-17`, `R-26`, `R-27`, `R-36`):**
  - Seluruh angka KPI, tren mikro 7 hari, grafik tren bulanan/harian, donat komposisi status, distribusi fakultas, distribusi angkatan, jadwal periode/kuota, dan tabel pendaftar terbaru dibaca langsung dari PostgreSQL melalui Prisma tanpa persentase dummy, nama tim fiktif, atau widget metrik peramban/peta dunia yang tidak memiliki sumber data.
  - Pencarian cepat pada header langsung mengarah ke `/admin/pendaftar?search=...`; seluruh target interaksi memenuhi minimal `44px`, dan kondisi memuat/kosong/gagal tampil eksplisit tanpa `animate-pulse` berulang (`MOTION 1`).
- **Tabel, Paginasi & Kontrol Form `/admin/*`:**
  - Seluruh tabel admin (`/admin/pendaftar`, `/admin/members`, `/admin/reports`, dan `/admin/settings`) menggunakan komponen terstandarisasi `DataTable` berkepala `#f8fafc` (`#52606d` uppercase AA-verified), pemisah baris `#f1f5f9`, tombol aksi bundar `44px` (`#e6f4ee`/`#005236`, `#fef3c7`/`#92400e`, `#fef2f2`/`#991b1b`), dan paginasi kapsul bundar (`Pagination` `01, 02...`).
  - Seluruh input, textarea, select/dropdown, sakelar toggle (`role="switch"`), dan kotak centang memakai garis tepi AA-compliant `#85929f` pada `#ffffff` dengan fokus `#006c49`, label `htmlFor` terikat eksplisit, dan copy Bahasa Indonesia penuh tanpa `confirm()` bawaan browser.
