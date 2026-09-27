"use client";

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Save, ShieldAlert, Plus, Search, Layers } from 'lucide-react';

interface ComponentAdmin {
  id_composant: number;
  num_composant_fabric: string;
  description: string;
  prix_unitaire: number;
  stock_disponible?: number;
  delai_livraison_semaines?: number;
}

export default function AdminDashboard() {
  const [components, setComponents] = useState<ComponentAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New component form state
  const [newRef, setNewRef] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState<number>(0.0);
  const [newStock, setNewStock] = useState<number>(100);

  const fetchComponents = () => {
    fetch('/api/components', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setComponents(data))
      .catch(() => toast.error('Erreur lors du chargement du catalogue'))
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
      .catch(() => toast.error('Erreur lors du chargement du catalogue'))
      .finally(() => setIsLoading(false));
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
        toast.success('Prix du composant mis à jour');
      } else {
        toast.error('Erreur de mise à jour');
      }
    } catch {
      toast.error('Erreur réseau');
    }
  };

  const handleCreateComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRef) {
      toast.error('La référence est obligatoire');
      return;
    }

    try {
      const response = await fetch('/api/components', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          num_composant_fabric: newRef,
          description: newDesc,
          prix_unitaire: newPrice,
          stock_disponible: newStock,
          delai_livraison_semaines: 1
        })
      });

      if (response.ok) {
        toast.success('Composant ajouté au catalogue');
        setShowAddModal(false);
        setNewRef('');
        setNewDesc('');
        setNewPrice(0);
        fetchComponents();
      } else {
        const errData = await response.json();
        toast.error(errData.detail || 'Erreur lors de la création');
      }
    } catch {
      toast.error('Erreur serveur');
    }
  };

  const filteredComponents = components.filter(c =>
    c.num_composant_fabric.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return <div className="p-8 text-center text-gray-400 font-mono">Chargement du catalogue administrateur...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center">
            <ShieldAlert className="h-5 w-5 mr-2 text-[#ff7a18]" />
            Espace Administrateur - Gestion du Catalogue
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Gérez les références du catalogue, ajustez les prix unitaires et ajoutez de nouveaux composants.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher composant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#181818] border border-[#262626] text-white pl-9 pr-3 py-2 text-sm rounded-md focus:outline-none focus:border-[#ff7a18]"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#ff7a18] hover:bg-[#e0650d] text-white text-sm font-medium rounded-md inline-flex items-center transition-colors whitespace-nowrap shadow-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Nouveau Composant
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#181818] rounded-md shadow-xl border border-[#262626] overflow-hidden">
        <table className="min-w-full divide-y divide-[#262626]">
          <thead className="bg-[#121212]">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-mono text-gray-400 uppercase tracking-wider">Référence Fabricant</th>
              <th className="px-6 py-3.5 text-left text-xs font-mono text-gray-400 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3.5 text-left text-xs font-mono text-gray-400 uppercase tracking-wider">Prix Unitaire (€)</th>
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
                  <input
                    type="number"
                    step="0.01"
                    value={c.prix_unitaire}
                    onChange={(e) => handlePriceChange(idx, e.target.value)}
                    className="w-32 bg-[#121212] border border-[#333333] text-white font-mono px-3 py-1 text-sm rounded-md focus:border-[#ff7a18] focus:outline-none"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => updatePrice(c.id_composant, c.prix_unitaire)}
                    className="px-3 py-1.5 bg-[#ff7a18]/10 hover:bg-[#ff7a18] text-[#ff7a18] hover:text-white border border-[#ff7a18]/30 rounded-md text-xs font-medium inline-flex items-center transition-colors"
                  >
                    <Save className="h-3.5 w-3.5 mr-1" />
                    Enregistrer
                  </button>
                </td>
              </tr>
            ))}
            {filteredComponents.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm font-mono text-gray-400">
                  Aucun composant trouvé dans le catalogue.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Component Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateComponent} className="bg-[#181818] border border-[#262626] rounded-md max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#262626] pb-3">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Layers className="h-5 w-5 mr-2 text-[#ff7a18]" />
                Ajouter un Composant au Catalogue
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">Référence Fabricant *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: RES-10K-0805"
                  value={newRef}
                  onChange={(e) => setNewRef(e.target.value)}
                  className="w-full bg-[#121212] border border-[#333333] text-white font-mono px-3 py-2 text-sm rounded-md focus:border-[#ff7a18] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Ex: Résistance 10kOhm 1/8W 5%"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[#121212] border border-[#333333] text-white px-3 py-2 text-sm rounded-md focus:border-[#ff7a18] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1">Prix Unitaire (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#121212] border border-[#333333] text-white font-mono px-3 py-2 text-sm rounded-md focus:border-[#ff7a18] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1">Stock Initial</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#121212] border border-[#333333] text-white font-mono px-3 py-2 text-sm rounded-md focus:border-[#ff7a18] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-[#262626]">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-[#222222] hover:bg-[#2a2a2a] text-gray-300 text-sm font-medium rounded-md"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#ff7a18] hover:bg-[#e0650d] text-white text-sm font-medium rounded-md"
              >
                Créer Composant
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
