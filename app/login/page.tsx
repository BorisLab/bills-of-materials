"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Cpu } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error('Email ou mot de passe incorrect.');
      }

      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      toast.success('Connexion réussie !');
      router.push('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'Email ou mot de passe incorrect');
      } else {
        toast.error('Email ou mot de passe incorrect');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000000] text-white py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-[#181818] p-8 rounded-md shadow-2xl border border-[#262626]">
        <div className="text-center">
          <div className="inline-flex p-3 bg-[#ff7a18] text-black rounded-md mb-3 font-bold shadow-md">
            <Cpu className="h-8 w-8 stroke-[2.5]" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Connexion BOM <span className="text-[#ff7a18]">SaaS</span>
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Ou{' '}
            <Link href="/register" className="font-medium text-[#ff7a18] hover:text-[#e0650d] transition-colors">
              créez un nouveau compte
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-xs font-mono text-gray-300 mb-1">
                Adresse email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#121212] border border-[#333333] text-white font-mono rounded-md px-3 py-2 text-sm focus:border-[#ff7a18] focus:outline-none"
                placeholder="nom@domaine.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-mono text-gray-300 mb-1">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#121212] border border-[#333333] text-white font-mono rounded-md px-3 py-2 text-sm focus:border-[#ff7a18] focus:outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#ff7a18] hover:bg-[#e0650d] transition-colors disabled:opacity-50 shadow-md font-sans"
            >
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
