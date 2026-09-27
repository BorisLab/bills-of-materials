"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Cpu } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de l\'inscription.');
      }

      toast.success('Inscription réussie ! Vous pouvez maintenant vous connecter.');
      router.push('/login?registered=true');
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Une erreur est survenue lors de l'inscription");
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
            Créer un compte BOM <span className="text-[#ff7a18]">SaaS</span>
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Vous avez déjà un compte ?{' '}
            <Link href="/login" className="font-medium text-[#ff7a18] hover:text-[#e0650d] transition-colors">
              Connectez-vous
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-mono text-gray-300 mb-1">
                Nom complet
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#121212] border border-[#333333] text-white font-mono rounded-md px-3 py-2 text-sm focus:border-[#ff7a18] focus:outline-none"
                placeholder="Jean Dupont"
              />
            </div>
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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#121212] border border-[#333333] text-white font-mono rounded-md px-3 py-2 text-sm focus:border-[#ff7a18] focus:outline-none"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-xs font-mono text-gray-300 mb-1">
                Rôle utilisateur
              </label>
              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#121212] border border-[#333333] text-white font-mono rounded-md px-3 py-2 text-sm focus:border-[#ff7a18] focus:outline-none"
              >
                <option value="client">Client</option>
                <option value="commercial">Commercial</option>
                <option value="acheteur">Acheteur / Sourcing</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#ff7a18] hover:bg-[#e0650d] transition-colors disabled:opacity-50 shadow-md font-sans"
            >
              {isLoading ? 'Inscription...' : 'Créer mon compte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
