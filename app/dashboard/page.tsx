"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Dropzone from '../components/Dropzone';
import ValidationTable, { BOMComponent } from '../components/ValidationTable';
import QuoteSummary, { QuoteOut } from '../components/QuoteSummary';
import CommercialDashboard from '../components/CommercialDashboard';
import AdminDashboard from '../components/AdminDashboard';
import { LogOut, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

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
        setTimeout(() => setUserRole(payload.role || 'client'), 0);
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
      setParsedComponents(null); // Clear the table to show summary
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
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <span className="text-xl font-bold text-gray-900">Bill of Materials App</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 uppercase tracking-wider">
                {userRole}
              </span>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {userRole === 'admin' && <AdminDashboard />}
        {userRole === 'commercial' && <CommercialDashboard />}

        {userRole === 'client' && (
          <>
            <div className="mb-8 flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <FileText className="h-6 w-6 mr-2 text-gray-400" />
                  Nouveau Devis
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Importez votre fichier de nomenclature (PDF ou Image) pour l&apos;analyser automatiquement.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              {/* Section d'upload */}
              {!parsedComponents && !finalQuote && (
                <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 animate-in fade-in">
                  <Dropzone onFileSelect={handleFileUpload} isUploading={isUploading} />
                </section>
              )}

              {/* Section de validation */}
              {parsedComponents && !finalQuote && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <ValidationTable
                    initialComponents={parsedComponents}
                    onSave={handleSaveToDatabase}
                    isSaving={isSaving}
                  />
                </section>
              )}

              {/* Section Résumé du devis */}
              {finalQuote && (
                <section className="animate-in fade-in zoom-in-95 duration-500">
                  <QuoteSummary quote={finalQuote} onReset={resetFlow} />
                </section>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
