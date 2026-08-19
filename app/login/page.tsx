// URL langsung ke halaman login (mis. https://mda-mengaji.vercel.app/login),
// dipakai admin/guru sejak tombol "Login Admin" dihapus dari homepage.
// Merender ulang komponen SPA yang sama seperti "/" — inisialisasi halamannya
// dideteksi lewat window.location.pathname di app/page.tsx.
export { default } from '../page';
