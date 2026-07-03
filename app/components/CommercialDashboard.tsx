"use client";

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle } from 'lucide-react';

export default function CommercialDashboard() {
  const [quotes, setQuotes] = useState<{id_devis: number, prix_total: number, statut: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQuotes = async () => {
    try {
      const response = await fetch('/api/quotes/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setQuotes(data);
      }
    } catch {
      console.error('Erreur lors du chargement des devis');
      toast.error('Erreur lors du chargement des devis');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchQuotes();
  }, []);

  const updateStatus = async (id_devis: number, statut: string) => {
    try {
      const response = await fetch(`/api/quotes/${id_devis}?statut=${statut}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        toast.success(`Statut mis à jour : ${statut}`);
        fetchQuotes();
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    } catch {
      toast.error('Erreur réseau');
    }
  };

  if (isLoading) return <div>Chargement des devis...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Espace Commercial - Validation des Devis</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Devis</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {quotes.map((q) => (
              <tr key={q.id_devis}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{q.id_devis}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{q.prix_total.toFixed(2)} €</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${q.statut === 'valide' ? 'bg-green-100 text-green-800' : q.statut === 'rejete' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {q.statut}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {q.statut === 'en_attente' && (
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => updateStatus(q.id_devis, 'valide')} className="text-green-600 hover:text-green-900" title="Valider">
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button onClick={() => updateStatus(q.id_devis, 'rejete')} className="text-red-600 hover:text-red-900" title="Rejeter">
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {quotes.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">Aucun devis trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
