# Audit Kode Tidak Terpakai

Laporan hasil pengecekan kode yang tidak terpakai (dead code) di dua codebase proyek:
- **Web app** — `MDA-mengaji` (Next.js)
- **Mobile app** — `mobile_MDA_mengaji` (Expo/React Native)

Ini murni laporan temuan. Tidak ada kode yang dihapus sebagai bagian dari audit ini.

## Ringkasan

| Codebase | Status |
|---|---|
| Mobile app (`mobile_MDA_mengaji`) | Bersih — semua screen, util, dan route navigasi terpakai/terhubung |
| Web app (`MDA-mengaji`) | Ada beberapa kandidat kode tidak terpakai (lihat detail di bawah) |

## Temuan — Mobile App (`mobile_MDA_mengaji`)

- Tidak ada screen/komponen yatim (semua terdaftar di `App.tsx` atau `src/navigation/ParentTabs.tsx`).
- Tidak ada util/export tak terpakai di `src/utils/*` atau `src/config/*`.
- Tidak ada target `navigation.navigate()` yang menunjuk ke route yang tidak terdaftar.
- Tidak ada kode dikomentari/TODO yang ditinggalkan.
- **1 npm dependency mencurigakan**: `use-sync-external-store` — tidak ada import langsung di manapun; kemungkinan sisa dari versi React lama (React 19 sudah punya `useSyncExternalStore` bawaan).

## Temuan — Web App (`MDA-mengaji`)

### 1. Komponen tidak terpakai

- `components/Toast.tsx` — satu-satunya referensi di `app/page.tsx` sudah dikomentari (`// REMOVED`).
- `components/theme-provider.tsx` (`ThemeProvider`) — tidak diimport di manapun termasuk `app/layout.tsx`; otomatis membuat `next-themes` (npm package) juga tidak terpakai.
- **~40 komponen shadcn/ui boilerplate** di `components/ui/*` yang tidak pernah diimport di luar file definisinya sendiri:
  `accordion`, `alert`, `alert-dialog`, `aspect-ratio`, `avatar`, `badge`, `breadcrumb`, `button-group`, `calendar`, `card`, `carousel`, `chart`, `checkbox`, `collapsible`, `command`, `context-menu`, `drawer`, `dropdown-menu`, `empty`, `field`, `form`, `hover-card`, `input-group`, `input-otp`, `item`, `kbd`, `menubar`, `navigation-menu`, `pagination`, `popover`, `progress`, `radio-group`, `resizable`, `scroll-area`, `select`, `slider`, `sonner` (file ui, bukan package `sonner` yang memang dipakai), `spinner`, `switch`, `table`, `tabs`, `toggle-group`.
- Subgraph mati yang saling merujuk satu sama lain tapi tidak dipanggil dari `app/`/`components/pages`: `components/ui/toast.tsx`, `components/ui/toaster.tsx`, `components/ui/sidebar.tsx`, `hooks/use-toast.ts`, `hooks/use-mobile.ts`.
- Yang **masih terpakai** (jangan disentuh): `button`, `dialog`, `input`, `label`, `separator`, `sheet`, `skeleton`, `textarea`, `toggle`, `tooltip`.

### 2. API routes tanpa pemanggil

Tidak dipanggil dari web frontend maupun dari mobile app:

- `app/api/doa-records/route.ts`
- `app/api/export-pdf/route.ts` — isinya stub belum selesai (komentar "generate PDF using pdfkit or similar"); ekspor PDF asli sudah dilakukan client-side lewat `jspdf` di `RekapLaporanPage.tsx`.
- `app/api/memorization-records/route.ts`
- `app/api/users/route.ts` — halaman guru pakai `/api/teachers`, bukan ini.
- `app/api/verify-email/route.ts` — tidak ada kode kirim-email (`nodemailer`/`resend` terinstall tapi tak pernah diimport) yang menghasilkan link ke route ini.

*(Semua route di bawah `app/api/mobile/**` memang tidak dipanggil dari web frontend — itu wajar, dipakai oleh mobile app, bukan kode mati.)*

### 3. npm dependencies tidak terpakai

- `@ai-sdk/google`, `ai` — tidak ada import.
- `nodemailer`, `resend` — selaras dengan `verify-email` yang yatim.
- `html2canvas` — hanya disebut di komentar `export-pdf/route.ts`.
- `@hookform/resolvers`, `zod` — `react-hook-form` dipakai tapi tanpa resolver/schema.
- `date-fns` — kemungkinan cuma peer dependency `react-day-picker` (yang juga mati karena `calendar.tsx` tak terpakai).
- `dotenv` — tidak diimport di file `.ts`/`.js` manapun termasuk `scripts/*.js`.

### 4. Lain-lain (prioritas rendah)

- `components/pages/LandingPage.tsx` punya ~9 komentar `{/* TODO: ganti dengan ... asli */}` — ini placeholder konten (foto/kontak/peta asli), bukan kode mati, tapi perlu dibereskan sebelum go-live.
- `app/page.tsx` punya 1 baris import yang dikomentari mati: `/* import Toast ... // REMOVED */`.
- Tidak ditemukan `console.log` nyasar di `app/`, `components/`, `lib/` pada web app.

### Catatan validitas

Sebelum benar-benar menghapus apa pun, disarankan cross-check dengan tool khusus:
- `npx depcheck` untuk validasi npm dependencies.
- `ts-prune` untuk validasi export TypeScript tak terpakai.

Perhatian khusus untuk grup `date-fns` / `react-day-picker` / `calendar.tsx` yang saling terkait — validasi ketiganya bersama-sama, jangan dihapus satu-satu tanpa cek silang.

## Langkah Pembersihan (opsional, untuk referensi ke depan)

Jika suatu saat ingin dieksekusi, urutan yang disarankan (bisa dipilih sebagian):

1. Hapus `Toast.tsx`, `theme-provider.tsx`, dan baris import mati di `app/page.tsx`.
2. Hapus subgraph `toast` / `toaster` / `sidebar` / `use-toast` / `use-mobile` di `components/ui` & `hooks`.
3. Hapus ~40 komponen shadcn boilerplate yang tak terpakai (atau biarkan jika memang disiapkan untuk pengembangan mendatang — ini keputusan produk, bukan murni teknis).
4. Hapus 5 API route yatim (atau simpan `export-pdf` / `verify-email` jika memang fitur yang direncanakan tapi belum selesai).
5. Uninstall npm dependencies yang terkonfirmasi tak terpakai, setelah divalidasi dengan `depcheck`.
6. Hapus `use-sync-external-store` dari mobile app setelah dicek bukan peer-dep yang dibutuhkan.
