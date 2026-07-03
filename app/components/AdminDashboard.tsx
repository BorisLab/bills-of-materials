"use client";

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';

export default function AdminDashboard() {
  const [components, setComponents] = useState<{id_composant: number, num_composant_fabric: string, description: string, prix_unitaire: number}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComponents = async () => {
    try {
      const response = await fetch('/api/components/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setComponents(data);
      }
    } catch {
      toast.error('Erreur lors du chargement du catalogue');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchComponents();
  }, []);

  const handlePriceChange = (index: number, val: string) => {
    const newComps = [...components];
    newComps[index].prix_unitaire = parseFloat(val) || 0;
    setComponents(newComps);
  };

  const updatePrice = async (id: number, price: number) => {
    try {
      const response = await fetch(`/api/components/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ prix_unitaire: price })
      });
      if (response.ok) {
        toast.success('Prix mis à jour');
      } else {
        toast.error('Erreur de mise à jour');
      }
    } catch {
      toast.error('Erreur réseau');
    }
  };

  if (isLoading) return <div>Chargement du catalogue...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Espace Administrateur - Gestion du Catalogue</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix Unitaire (€)</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {components.map((c, idx) => (
              <tr key={c.id_composant}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.num_composant_fabric}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{c.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <input
                    type="number"
                    step="0.01"
                    value={c.prix_unitaire}
                    onChange={(e) => handlePriceChange(idx, e.target.value)}
                    className="block w-24 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-2 py-1 border"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => updatePrice(c.id_composant, c.prix_unitaire)} className="text-blue-600 hover:text-blue-900 flex items-center justify-end w-full">
                    <Save className="h-4 w-4 mr-1" />
                    Enregistrer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
