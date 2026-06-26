'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email dan password wajib diisi');
      return;
    }

    setLoading(true);

    if (isRegister) {
      const { error } = await signUp(email, password);
      if (error) {
        setError(error);
      } else {
        alert('Akun berhasil dibuat! Silakan login.');
        setIsRegister(false);
        setPassword('');
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
      } else {
        router.push('/profile');
      }
    }

    setLoading(false);
  };

  return (
    <div className="flex-1 min-w-0 flex flex-col items-center justify-center min-h-screen relative bg-[#0a0a0c] overflow-y-auto z-0 p-4 py-10">
      {/* Background removed as requested */}

      <div className="w-full max-w-[400px] relative z-10 flex flex-col items-center">
        {/* Form Card */}
        <div className="w-full bg-[#1e1e1e] rounded-2xl p-6 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-2xl font-semibold text-white mb-2 text-center">
              Selamat Datang<br/>Kembali!
            </h1>
            <p className="text-zinc-400 text-sm">Silakan masuk untuk melanjutkan.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="text-red-500 text-sm font-medium text-center bg-red-500/10 py-2 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm text-zinc-300 mb-2">Username atau Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan username atau email"
                  className="w-full px-4 py-3 rounded-lg bg-[#252525] border border-[#333] text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-zinc-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password Anda"
                  className="w-full px-4 py-3 rounded-lg bg-[#252525] border border-[#333] text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                />
              </div>
              {!isRegister && (
                <div className="text-right mt-3">
                  <button type="button" className="text-zinc-300 text-sm hover:text-white transition-colors">
                    Lupa Password?
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-[#007aff] hover:bg-blue-600 text-white font-bold rounded-xl transition-all disabled:opacity-50"
            >
              {loading ? 'MEMPROSES...' : (isRegister ? 'Daftar' : 'Login')}
            </button>
          </form>

          <div className="text-center text-sm text-zinc-400 mt-8">
            {isRegister ? 'Sudah punya akun? ' : 'Belum punya akun? '}
            <button
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-[#00bfff] font-bold hover:underline"
            >
              {isRegister ? 'Login di sini' : 'Daftar di sini'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
