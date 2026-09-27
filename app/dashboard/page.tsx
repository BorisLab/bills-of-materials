"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Dropzone from '../components/Dropzone';
import ValidationTable, { BOMComponent } from '../components/ValidationTable';
import QuoteSummary, { QuoteOut } from '../components/QuoteSummary';
import CommercialDashboard from '../components/CommercialDashboard';
import AdminDashboard from '../components/AdminDashboard';
import BuyerDashboard from '../components/BuyerDashboard';
import ClientHistory from '../components/ClientHistory';
import { LogOut, FileText, History, Cpu, ShieldCheck, Tag, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [clientTab, setClientTab] = useState<'create' | 'history'>('create');

  const [isUploading, setIsUploading] = useState(false);
  const [parsedComponents, setParsedComponents] = useState<BOMComponent[] | null>(null);
  const [finalQuote, setFinalQuote] = useState<QuoteOut | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setTimeout(() => {
          setUserRole(payload.role || 'client');
          setUserEmail(payload.sub || '');
        }, 0);
      } catch {
        localStorage.removeItem('token');
        router.push('/login');
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Vous avez été déconnecté.');
    router.push('/login');
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setParsedComponents(null);
    setFinalQuote(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload-bom', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors du traitement du fichier.');
      }

      const data: BOMComponent[] = await response.json();
      setParsedComponents(data);
      toast.success('Fichier analysé avec succès !');
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || "Une erreur est survenue lors de l'analyse.");
      } else {
        toast.error("Une erreur est survenue lors de l'analyse.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveToDatabase = async (components: BOMComponent[]) => {
    setIsSaving(true);

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(components),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de la création du devis.');
      }

      const quoteData: QuoteOut = await response.json();
      setFinalQuote(quoteData);
      setParsedComponents(null);
      toast.success('Devis enregistré avec succès !');
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'Erreur lors de la sauvegarde.');
      } else {
        toast.error('Erreur lors de la sauvegarde.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const resetFlow = () => {
    setFinalQuote(null);
    setParsedComponents(null);
  };

  if (!userRole) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center text-gray-400 font-mono">
        Chargement de l&apos;application BOM...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-[#141414] border-b border-[#262626]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#ff7a18] rounded-md text-black font-bold">
                <Cpu className="h-5 w-5 stroke-[2.5]" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                BOM <span className="text-[#ff7a18]">SaaS</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-xs text-[11px] font-mono font-semibold uppercase tracking-wider bg-[#ff7a18]/10 text-[#ff7a18] border border-[#ff7a18]/30 flex items-center">
                {userRole === 'admin' && <ShieldCheck className="h-3 w-3 mr-1" />}
                {userRole === 'commercial' && <Tag className="h-3 w-3 mr-1" />}
                {userRole === 'acheteur' && <Truck className="h-3 w-3 mr-1" />}
                {userRole}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {userEmail && (
                <span className="hidden sm:inline text-xs font-mono text-gray-400">
                  {userEmail}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-1.5 border border-[#333333] text-xs font-medium rounded-md text-gray-300 bg-[#222222] hover:bg-[#2a2a2a] hover:text-white transition-colors"
              >
                <LogOut className="h-3.5 w-3.5 mr-1.5" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin space */}
        {userRole === 'admin' && <AdminDashboard />}

        {/* Commercial space */}
        {userRole === 'commercial' && <CommercialDashboard />}

        {/* Buyer / Sourcing space */}
        {userRole === 'acheteur' && <BuyerDashboard />}

        {/* Client space with tabs */}
        {userRole === 'client' && (
          <div className="space-y-6">
            {/* Tabs Bar */}
            <div className="flex border-b border-[#262626]">
              <button
                onClick={() => setClientTab('create')}
                className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
                  clientTab === 'create'
                    ? 'border-[#ff7a18] text-[#ff7a18]'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <FileText className="h-4 w-4 mr-2" />
                Nouveau Devis BOM
              </button>
              <button
                onClick={() => setClientTab('history')}
                className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
                  clientTab === 'history'
                    ? 'border-[#ff7a18] text-[#ff7a18]'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <History className="h-4 w-4 mr-2" />
                Historique des Devis
              </button>
            </div>

            {/* Tab 1: Create Quote Flow */}
            {clientTab === 'create' && (
              <div className="space-y-8">
                {!parsedComponents && !finalQuote && (
                  <section className="bg-[#181818] p-8 rounded-md shadow-xl border border-[#262626]">
                    <div className="mb-6">
                      <h1 className="text-xl font-bold text-white flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-[#ff7a18]" />
                        Analyse & Chiffrage de Nomenclature (BOM)
                      </h1>
                      <p className="mt-1 text-sm text-gray-400">
                        Importez votre fichier PDF ou image de nomenclature électronique pour extraire automatiquement les références.
                      </p>
                    </div>
                    <Dropzone onFileSelect={handleFileUpload} isUploading={isUploading} />
                  </section>
                )}

                {parsedComponents && !finalQuote && (
                  <section>
                    <ValidationTable
                      initialComponents={parsedComponents}
                      onSave={handleSaveToDatabase}
                      isSaving={isSaving}
                    />
                  </section>
                )}

                {finalQuote && (
                  <section>
                    <QuoteSummary quote={finalQuote} onReset={resetFlow} />
                  </section>
                )}
              </div>
            )}

            {/* Tab 2: History */}
            {clientTab === 'history' && <ClientHistory />}
          </div>
        )}
      </main>
    </div>
  );
}
