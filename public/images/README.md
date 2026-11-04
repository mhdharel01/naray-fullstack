# Panduan Folder Aset Gambar Website (Naray Hospital)

Folder ini (`frontend/public/images/`) adalah lokasi utama untuk menyimpan seluruh aset gambar statis website Naray Hospital.
Semua file di dalam folder ini otomatis dapat diakses langsung oleh browser melalui URL root `/images/...`.

---

## 📁 Struktur Subfolder & Kegunaannya:

1. **`logo/`** (`frontend/public/images/logo/`)
   - Tempat meletakkan logo rumah sakit, favicon, logo akreditasi (KARS), logo partner/asuransi (BPJS, dsb).
   - Format disarankan: `.svg` (vektor), `.png` transparan (resolusi tinggi).
   - Contoh pemanggilan di JSX:
     ```jsx
     <img src="/images/logo/logo-naray.svg" alt="Naray Hospital" />
     ```

2. **`banners/`** (`frontend/public/images/banners/`)
   - Tempat meletakkan foto slide hero utama di beranda, banner promosi, atau gambar background header subpage.
   - Format disarankan: `.webp` atau `.jpg` berkualitas tinggi (resolusi 1920x800px / 16:9).
   - Contoh pemanggilan di JSX:
     ```jsx
     <img src="/images/banners/hero-utama.webp" alt="Naray Hospital Dumai" />
     ```

3. **`kamar/`** (`frontend/public/images/kamar/`)
   - Tempat meletakkan foto kamar rawat inap (VVIP, VIP, Kelas 1, Ruang ICU, Isolasi).
   - Format disarankan: `.webp` atau `.jpg` (resolusi 800x600px).
   - Contoh pemanggilan di JSX:
     ```jsx
     <img src="/images/kamar/vvip-pistillum.webp" alt="Kamar VVIP" />
     ```

4. **`dokter/`** (`frontend/public/images/dokter/`)
   - Tempat meletakkan foto profil dokter spesialis dan subspesialis.
   - Format disarankan: `.webp` atau `.png` (portrait 600x750px atau 1:1 square).
   - Contoh pemanggilan di JSX:
     ```jsx
     <img src="/images/dokter/dr-nama-dokter.webp" alt="dr. Spesialis" />
     ```

5. **`fasilitas/`** (`frontend/public/images/fasilitas/`)
   - Tempat meletakkan foto peralatan medis & diagnostik (CT-Scan, Laboratorium, Farmasi, Radiologi, Ambulans).
   - Format disarankan: `.webp` atau `.jpg` (resolusi 800x500px).
   - Contoh pemanggilan di JSX:
     ```jsx
     <img src="/images/fasilitas/ct-scan-128.webp" alt="CT-Scan 128 Slice" />
     ```

6. **`artikel/`** (`frontend/public/images/artikel/`)
   - Tempat meletakkan gambar thumbnail berita, artikel edukasi kesehatan, dan siaran pers.
   - Format disarankan: `.webp` atau `.jpg` (resolusi 800x450px / 16:9).
   - Contoh pemanggilan di JSX:
     ```jsx
     <img src="/images/artikel/edukasi-jantung.webp" alt="Tips Jantung Sehat" />
     ```

---

## 💡 Tips & Panduan:
- **Gunakan Nama File Huruf Kecil & Tanda Strip (-)**:  
  Contoh: `kamar-vvip.webp` (hindari spasi seperti `kamar vvip (1).jpg`).
- **Kompresi Gambar**:  
  Gunakan format modern `.webp` agar website terbuka sangat cepat dan ringan bagi pengunjung.
