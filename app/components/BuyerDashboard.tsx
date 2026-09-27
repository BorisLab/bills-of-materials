"use client";

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Truck, Save, Package, Search } from 'lucide-react';

interface ComponentFull {
  id_composant: number;
  num_composant_fabric: string;
  description: string;
  prix_unitaire: number;
  stock_disponible: number;
  delai_livraison_semaines: number;
  equivalent_ref: string | null;
}

export default function BuyerDashboard() {
  const [components, setComponents] = useState<ComponentFull[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchComponents = () => {
    fetch('/api/components', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setComponents(data))
      .catch(() => toast.error('Erreur lors du chargement des stocks et délais'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetch('/api/components', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setComponents(data))
      .catch(() => toast.error('Erreur lors du chargement des stocks et délais'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleFieldChange = (index: number, field: keyof ComponentFull, val: string | number) => {
    const updated = [...components];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updated[index] as any)[field] = val;
    setComponents(updated);
  };

  const saveComponentChanges = async (comp: ComponentFull) => {
    try {
      const response = await fetch(`/api/components/${comp.id_composant}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          stock_disponible: comp.stock_disponible,
          delai_livraison_semaines: comp.delai_livraison_semaines,
          equivalent_ref: comp.equivalent_ref
        })
      });
      if (response.ok) {
        toast.success(`Informations composant #${comp.num_composant_fabric} sauvegardées`);
        fetchComponents();
      } else {
        toast.error('Erreur lors de la sauvegarde');
      }
    } catch {
      toast.error('Erreur réseau');
    }
  };

  const filteredComponents = components.filter(c =>
    c.num_composant_fabric.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return <div className="p-8 text-center text-gray-400 font-mono">Chargement des données Sourcing & Stock...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center">
            <Truck className="h-5 w-5 mr-2 text-[#ff7a18]" />
            Espace Acheteur & Sourcing - Gestion des Stocks & Délais
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Gérez les stocks disponibles, ajustez les délais d&apos;approvisionnement et renseignez les références d&apos;équivalences.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Filtrer par référence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#181818] border border-[#262626] text-[#ffffff] pl-9 pr-4 py-2 text-sm rounded-md focus:outline-none focus:border-[#ff7a18]"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#181818] rounded-md shadow-xl border border-[#262626] overflow-hidden">
        <table className="min-w-full divide-y divide-[#262626]">
          <thead className="bg-[#121212]">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-mono text-gray-400 uppercase tracking-wider">Référence Fabricant</th>
              <th className="px-6 py-3.5 text-left text-xs font-mono text-gray-400 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3.5 text-left text-xs font-mono text-gray-400 uppercase tracking-wider">Stock Dispo</th>
              <th className="px-6 py-3.5 text-left text-xs font-mono text-gray-400 uppercase tracking-wider">Délai (Semaines)</th>
              <th className="px-6 py-3.5 text-left text-xs font-mono text-gray-400 uppercase tracking-wider">Référence Équivalente</th>
              <th className="px-6 py-3.5 text-right text-xs font-mono text-gray-400 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-[#181818] divide-y divide-[#262626]">
            {filteredComponents.map((c, idx) => (
              <tr key={c.id_composant} className="hover:bg-[#202020] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-[#ff7a18]">
                  {c.num_composant_fabric}
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {c.description || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-1">
                    <Package className="h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      value={c.stock_disponible}
                      onChange={(e) => handleFieldChange(idx, 'stock_disponible', parseInt(e.target.value) || 0)}
                      className="w-24 bg-[#121212] border border-[#333333] text-white font-mono px-2 py-1 text-sm rounded-md focus:border-[#ff7a18] focus:outline-none"
                    />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    value={c.delai_livraison_semaines}
                    onChange={(e) => handleFieldChange(idx, 'delai_livraison_semaines', parseInt(e.target.value) || 1)}
                    className="w-20 bg-[#121212] border border-[#333333] text-white font-mono px-2 py-1 text-sm rounded-md focus:border-[#ff7a18] focus:outline-none"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    placeholder="Ex: ALT-9902"
                    value={c.equivalent_ref || ''}
                    onChange={(e) => handleFieldChange(idx, 'equivalent_ref', e.target.value)}
                    className="w-36 bg-[#121212] border border-[#333333] text-white font-mono px-2 py-1 text-sm rounded-md focus:border-[#ff7a18] focus:outline-none"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => saveComponentChanges(c)}
                    className="inline-flex items-center px-3 py-1.5 bg-[#ff7a18] hover:bg-[#e0650d] text-white text-xs font-medium rounded-md transition-colors shadow-sm"
                  >
                    <Save className="h-3.5 w-3.5 mr-1" />
                    Enregistrer
                  </button>
                </td>
              </tr>
            ))}
            {filteredComponents.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm font-mono text-gray-400">
                  Aucun composant trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
