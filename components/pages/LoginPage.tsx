import { useState, useEffect } from 'react';
import { Landmark, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { User, UserRole } from '@/types';

interface LoginPageProps {
  onLogin: (role: UserRole, user?: User) => void;
  initialShowRegister?: boolean;
}
export default function LoginPage({ onLogin, initialShowRegister = false }: LoginPageProps) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      // Small timeout to ensure sonner toaster is mounted
      setTimeout(() => {
        if (error === 'UnverifiedEmail') {
          toast.error('Gagal Masuk: Email Anda belum diverifikasi. Silakan cek link yang diberikan saat pendaftaran.');
        } else if (error === 'MosqueNotApproved') {
          toast.error('Gagal Masuk: Masjid Anda dalam status menunggu persetujuan Super Admin.');
        } else if (error === 'UserNotFound' || error === 'InvalidEmail') {
          toast.error('Gagal Masuk: Email ini tidak terdaftar di sistem kami.');
        } else if (error === 'InvalidPassword') {
          toast.error('Gagal Masuk: Password yang Anda masukkan salah.');
        } else if (error === 'CredentialsSignin') {
           toast.error('Gagal Masuk: Kredensial tidak valid.');
        } else {
          toast.error('Gagal Masuk: Terjadi kesalahan pada proses otentikasi.');
        }
      }, 100);
      
      // Remove error from URL without refreshing the page or triggering a Next.js re-render
      window.history.replaceState(null, '', '/');
    }
  }, [searchParams]);

  
  

  return (
    <div className="min-h-screen flex items-center justify-center md:bg-slate-50 md:p-6 relative overflow-hidden">
      {/* Mobile background */}
      <div 
        className="absolute inset-0 md:hidden bg-[#0E945F]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='none' stroke='%23ffffff' stroke-width='1' stroke-opacity='0.08'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}
      ></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row rounded-[2rem] md:shadow-2xl overflow-hidden md:bg-white md:h-[600px]">
        
        {/* Left Side: Branding / Illustration */}
        <div 
          className="md:w-[55%] flex flex-col justify-center items-center p-6 md:p-12 text-white bg-transparent md:bg-[#0E945F] relative"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='none' stroke='%23ffffff' stroke-width='1' stroke-opacity='0.08'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        >
          <div className="w-24 h-24 bg-white text-[#0E945F] rounded-[2rem] flex items-center justify-center mx-auto mb-4 md:mb-8 shadow-xl relative z-10 md:scale-110">
            {/* Custom Mosque Icon to match screenshot */}
            <svg width="50" height="50" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C11.5 2 11 2.5 11 3v2.1A5.002 5.002 0 0 0 7 10v4H5a2 2 0 0 0-2 2v2h18v-2a2 2 0 0 0-2-2h-2v-4a5.002 5.002 0 0 0-4-4.9V3c0-.5-.5-1-1-1zm0 24c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zM9 13v-3c0-1.7 1.3-3 3-3s3 1.3 3 3v3h-6zm-4 7v-2h14v2H5z"/>
            </svg>
          </div>
          <h1 className="text-[2rem] md:text-[2.5rem] font-black mb-2 md:mb-4 tracking-tight leading-tight text-center relative z-10">MDA Masjid<br/>Nurul Huda</h1>
          <p className="text-white/90 text-sm md:text-lg font-medium text-center relative z-10 md:mb-8">Aplikasi Manajemen MDA Terpadu</p>
          
          {/* Desktop Features Highlight */}
          <div className="hidden md:flex flex-col gap-4 mt-8 relative z-10 w-full max-w-sm">
            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
               <div className="bg-white/20 p-3 rounded-xl"><Shield size={24} className="text-white" /></div>
               <div>
                 <h4 className="font-bold text-sm text-white mb-0.5">Akses Tersentralisasi</h4>
                 <p className="text-xs text-emerald-50 leading-relaxed">Pantau seluruh data santri, guru, dan kelompok dalam satu ekosistem.</p>
               </div>
            </div>
            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
               <div className="bg-white/20 p-3 rounded-xl"><Landmark size={24} className="text-white" /></div>
               <div>
                 <h4 className="font-bold text-sm text-white mb-0.5">Transparansi Data</h4>
                 <p className="text-xs text-emerald-50 leading-relaxed">Monitoring progres tahfidz, kehadiran harian, dan evaluasi capaian santri.</p>
               </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:w-[45%] flex flex-col justify-center items-center p-6 md:p-12 bg-transparent md:bg-white relative">
          <div className="w-full bg-white text-slate-800 p-8 md:p-10 rounded-3xl shadow-2xl md:shadow-none max-w-sm mx-auto border border-transparent md:border-slate-100">
            <div className="mb-8 text-center md:text-left">
              <h3 className="font-black text-[#1E293B] text-2xl mb-2 hidden md:block">Selamat Datang 👋</h3>
              <h3 className="font-bold text-center mb-6 text-[#1E293B] text-[1.1rem] md:hidden">Masuk Aplikasi</h3>
              <p className="text-sm text-slate-500 font-medium hidden md:block">Silakan masuk menggunakan akun Google Anda yang telah didaftarkan ke sistem.</p>
            </div>

            <button 
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="w-full bg-white border border-slate-200 hover:bg-slate-50 hover:border-emerald-500 hover:shadow-md text-[#1E293B] font-bold py-3.5 md:py-4 rounded-2xl shadow-sm transition-all focus:ring-4 focus:ring-emerald-50 flex items-center justify-center gap-3 mb-5 group"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                className="w-6 h-6 group-hover:scale-110 transition-transform"
                alt="Google Logo"
              />
              Masuk dengan Google
            </button>

            <div className="relative flex py-5 items-center hidden md:flex">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Akses Aman</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <p className="text-center text-[11px] text-slate-400 font-medium px-2 mt-2 md:mt-0">
              Dengan masuk, Anda menyetujui <span className="underline cursor-pointer hover:text-[#0E945F] transition-colors">Ketentuan Layanan</span> kami.
            </p>
          </div>
        </div>

      </div>


    </div>
  );
}
