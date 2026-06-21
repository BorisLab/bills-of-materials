"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Dropzone from '../components/Dropzone';
import ValidationTable, { BOMComponent } from '../components/ValidationTable';
import { LogOut, FileText, LayoutDashboard } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [parsedComponents, setParsedComponents] = useState<BOMComponent[] | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setParsedComponents(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/upload-bom', {
        method: 'POST',
        // headers: {
        //   'Authorization': `Bearer ${localStorage.getItem('token')}`
        // },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors du traitement du fichier.');
      }

      const data: BOMComponent[] = await response.json();
      setParsedComponents(data);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveToDatabase = async (components: BOMComponent[]) => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Pour le moment, l'API backend pour sauvegarder le devis n'est pas encore connectée
      // On simule une requête
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      console.log('Composants à sauvegarder:', components);
      setSuccess('Le BOM a été enregistré avec succès en base de données !');
      
      // On réinitialise l'état après quelques secondes
      setTimeout(() => {
        setParsedComponents(null);
        setSuccess(null);
      }, 3000);
      
    } catch (err: any) {
      setError('Erreur lors de la sauvegarde.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <LayoutDashboard className="h-8 w-8 text-blue-600 mr-3" />
              <span className="text-xl font-bold text-gray-900">Bill of Materials App</span>
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="h-6 w-6 mr-2 text-gray-400" />
            Nouveau Devis / BOM
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Importez votre fichier de nomenclature (PDF ou Image) pour l'analyser automatiquement.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Section d'upload */}
          {!parsedComponents && (
            <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <Dropzone onFileSelect={handleFileUpload} isUploading={isUploading} />
            </section>
          )}

          {/* Section de validation */}
          {parsedComponents && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ValidationTable
                initialComponents={parsedComponents}
                onSave={handleSaveToDatabase}
                isSaving={isSaving}
              />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
