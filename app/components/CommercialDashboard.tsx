"use client";

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Search, Eye, Filter, Tag, MessageSquare } from 'lucide-react';
import { QuoteOut } from './QuoteSummary';

export default function CommercialDashboard() {
  const [quotes, setQuotes] = useState<QuoteOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [inspectQuote, setInspectQuote] = useState<QuoteOut | null>(null);
  const [remiseInput, setRemiseInput] = useState<number>(0);
  const [commentaireInput, setCommentaireInput] = useState<string>('');

  const fetchQuotes = () => {
    fetch('/api/quotes', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setQuotes(data))
      .catch(() => toast.error('Erreur lors du chargement des devis'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetch('/api/quotes', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setQuotes(data))
      .catch(() => toast.error('Erreur lors du chargement des devis'))
      .finally(() => setIsLoading(false));
  }, []);

  const openInspection = (q: QuoteOut) => {
    setInspectQuote(q);
    setRemiseInput(q.remise_pourcentage || 0);
    setCommentaireInput(q.commentaire_commercial || '');
  };

  const handleUpdateStatus = async (id_devis: number, newStatut: string) => {
    try {
      const url = `/api/quotes/${id_devis}?statut=${newStatut}&remise_pourcentage=${remiseInput}${commentaireInput ? `&commentaire_commercial=${encodeURIComponent(commentaireInput)}` : ''}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        toast.success(`Devis #${id_devis} mis à jour : ${newStatut}`);
        setInspectQuote(null);
        fetchQuotes();
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    } catch {
      toast.error('Erreur réseau');
    }
  };

  const filteredQuotes = quotes.filter(q => {
    const matchesSearch = q.id_devis.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || q.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return <div className="p-8 text-center text-gray-400 font-mono">Chargement de l&apos;espace commercial...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center">
            <Tag className="h-5 w-5 mr-2 text-[#ff7a18]" />
            Espace Commercial - Validation & Négociation des Devis
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Examinez les lignes de composants, appliquez des remises et validez ou rejetez les devis clients.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par N° devis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#181818] border border-[#262626] text-white pl-9 pr-3 py-2 text-sm rounded-md focus:outline-none focus:border-[#ff7a18]"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1 bg-[#181818] p-1 border border-[#262626] rounded-md">
            <Filter className="h-4 w-4 text-gray-400 ml-2 mr-1" />
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${statusFilter === 'all' ? 'bg-[#ff7a18] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Tous
            </button>
            <button
              onClick={() => setStatusFilter('en_attente')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${statusFilter === 'en_attente' ? 'bg-[#ff7a18] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              En attente
            </button>
            <button
              onClick={() => setStatusFilter('valide')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${statusFilter === 'valide' ? 'bg-[#ff7a18] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Validés
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#181818] rounded-md shadow-xl border border-[#262626] overflow-hidden">
        <table className="min-w-full divide-y divide-[#262626]">
          <thead className="bg-[#121212]">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-mono text-gray-400 uppercase tracking-wider">N° Devis</th>
              <th className="px-6 py-3.5 text-left text-xs font-mono text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3.5 text-left text-xs font-mono text-gray-400 uppercase tracking-wider">Lignes</th>
              <th className="px-6 py-3.5 text-left text-xs font-mono text-gray-400 uppercase tracking-wider">Prix Total</th>
              <th className="px-6 py-3.5 text-left text-xs font-mono text-gray-400 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3.5 text-right text-xs font-mono text-gray-400 uppercase tracking-wider">Inspection & Actions</th>
            </tr>
          </thead>
          <tbody className="bg-[#181818] divide-y divide-[#262626]">
            {filteredQuotes.map((q) => (
              <tr key={q.id_devis} className="hover:bg-[#202020] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-[#ff7a18]">
                  #{q.id_devis}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-400">
                  {q.cree_le || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300">
                  {q.lignes ? q.lignes.length : 0} composant(s)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-white">
                  {q.prix_total.toFixed(2)} €
                  {q.remise_pourcentage ? <span className="ml-2 text-xs font-normal text-emerald-400">(-{q.remise_pourcentage}%)</span> : null}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {q.statut === 'valide' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Validé
                    </span>
                  )}
                  {q.statut === 'refuse' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      Refusé
                    </span>
                  )}
                  {q.statut === 'en_attente' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-[#ff7a18] border border-[#ff7a18]/20">
                      En attente
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end items-center space-x-2">
                    <button
                      onClick={() => openInspection(q)}
                      className="px-3 py-1.5 bg-[#222222] hover:bg-[#2a2a2a] text-gray-200 text-xs font-medium rounded-md border border-[#333333] inline-flex items-center transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1 text-[#ff7a18]" />
                      Inspecter & Traiter
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredQuotes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm font-mono text-gray-400">
                  Aucun devis ne correspond à votre filtre.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Inspection Modal */}
      {inspectQuote && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-[#262626] rounded-md max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-[#262626] pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Inspection du Devis #{inspectQuote.id_devis}</h3>
                <p className="text-xs font-mono text-gray-400 mt-1">Statut actuel : {inspectQuote.statut}</p>
              </div>
              <button
                onClick={() => setInspectQuote(null)}
                className="text-gray-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Component Lines Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-gray-400">Détail des composants scannés</h4>
              <div className="border border-[#262626] rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-[#262626]">
                  <thead className="bg-[#121212]">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-mono text-gray-400">Référence</th>
                      <th className="px-4 py-2.5 text-left text-xs font-mono text-gray-400">Description</th>
                      <th className="px-4 py-2.5 text-right text-xs font-mono text-gray-400">Qté</th>
                      <th className="px-4 py-2.5 text-right text-xs font-mono text-gray-400">Prix U.</th>
                      <th className="px-4 py-2.5 text-right text-xs font-mono text-gray-400">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626] bg-[#181818]">
                    {(inspectQuote.lignes || []).map((line, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-xs font-mono text-[#ff7a18] font-bold">{line.num_composant_fabric}</td>
                        <td className="px-4 py-3 text-xs text-gray-300">{line.description || line.libelle_extrait_comp || "N/A"}</td>
                        <td className="px-4 py-3 text-xs font-mono text-right text-gray-300">{line.quantite_demande}</td>
                        <td className="px-4 py-3 text-xs font-mono text-right text-gray-300">{line.prix_unitaire.toFixed(2)} €</td>
                        <td className="px-4 py-3 text-xs font-mono text-right text-white font-bold">
                          {(line.prix_unitaire * line.quantite_demande).toFixed(2)} €
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Discount & Comment Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#141414] p-4 rounded-md border border-[#262626]">
              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1 flex items-center">
                  <Tag className="h-3.5 w-3.5 mr-1 text-[#ff7a18]" />
                  Remise Commerciale (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={remiseInput}
                  onChange={(e) => setRemiseInput(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#181818] border border-[#333333] text-white font-mono rounded-md px-3 py-1.5 text-sm focus:border-[#ff7a18] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1 flex items-center">
                  <MessageSquare className="h-3.5 w-3.5 mr-1 text-[#ff7a18]" />
                  Note / Commentaire Commercial
                </label>
                <input
                  type="text"
                  placeholder="Ex: Remise fidélité appliquée..."
                  value={commentaireInput}
                  onChange={(e) => setCommentaireInput(e.target.value)}
                  className="w-full bg-[#181818] border border-[#333333] text-white rounded-md px-3 py-1.5 text-sm focus:border-[#ff7a18] focus:outline-none"
                />
              </div>
            </div>

            {/* Decision Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-[#262626]">
              <button
                onClick={() => setInspectQuote(null)}
                className="px-4 py-2 bg-[#222222] hover:bg-[#2a2a2a] text-gray-300 text-sm font-medium rounded-md"
              >
                Annuler
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleUpdateStatus(inspectQuote.id_devis, 'refuse')}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-md inline-flex items-center shadow-sm"
                >
                  <XCircle className="h-4 w-4 mr-1.5" />
                  Rejeter le Devis
                </button>
                <button
                  onClick={() => handleUpdateStatus(inspectQuote.id_devis, 'valide')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md inline-flex items-center shadow-sm"
                >
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                  Valider & Envoyer Devis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
