"use client";

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FileText, Download, Eye, Search, Clock, CheckCircle, XCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { QuoteOut } from './QuoteSummary';

export default function ClientHistory() {
  const [quotes, setQuotes] = useState<QuoteOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<QuoteOut | null>(null);

  useEffect(() => {
    fetch('/api/quotes', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setQuotes(data))
      .catch(() => toast.error("Erreur lors de la récupération de l'historique"))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredQuotes = quotes.filter(q =>
    q.id_devis.toString().includes(searchTerm) ||
    q.statut.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generatePDF = (quote: QuoteOut) => {
    try {
      const doc = new jsPDF();
      doc.setFillColor(24, 24, 24);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 122, 24);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("BOM SaaS Logistics - Devis Component", 14, 20);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Devis N° #${quote.id_devis} | Date: ${quote.cree_le || new Date().toLocaleDateString()}`, 14, 30);

      doc.setTextColor(50, 50, 50);
      doc.setFontSize(11);
      doc.text(`Statut : ${quote.statut.toUpperCase()}`, 14, 50);

      const tableColumn = ["Référence", "Description", "Quantité", "Prix Unit. (€)", "Total Ligne (€)"];
      const tableRows: (string | number)[][] = [];

      (quote.lignes || []).forEach(line => {
        tableRows.push([
          line.num_composant_fabric,
          line.description || line.libelle_extrait_comp || "N/A",
          line.quantite_demande,
          `${line.prix_unitaire.toFixed(2)} €`,
          `${(line.prix_unitaire * line.quantite_demande).toFixed(2)} €`
        ]);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 58,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 4 },
        headStyles: { fillColor: [255, 122, 24], textColor: [255, 255, 255], fontStyle: 'bold' }
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const finalY = (doc as any).lastAutoTable?.finalY || 80;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Total : ${quote.prix_total.toFixed(2)} €`, 14, finalY + 15);

      doc.save(`Devis_BOM_${quote.id_devis}.pdf`);
    } catch (err) {
      console.error(err);
      toast.error("Erreur de génération PDF");
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-400 font-mono">Chargement de votre historique...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center">
            <FileText className="h-5 w-5 mr-2 text-[#ff7a18]" />
            Historique de vos devis BOM
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Consultez tous vos devis enregistrés, suivez leur statut et téléchargez vos documents PDF.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un devis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#181818] border border-[#262626] text-white pl-9 pr-4 py-2 text-sm rounded-md focus:outline-none focus:border-[#ff7a18]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#181818] rounded-md border border-[#262626] overflow-hidden shadow-lg">
        <table className="min-w-full divide-y divide-[#262626]">
          <thead className="bg-[#121212]">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-mono text-gray-400 uppercase tracking-wider">N° Devis</th>
              <th className="px-6 py-3.5 text-left text-xs font-mono text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3.5 text-left text-xs font-mono text-gray-400 uppercase tracking-wider">Composants</th>
              <th className="px-6 py-3.5 text-left text-xs font-mono text-gray-400 uppercase tracking-wider">Prix Total</th>
              <th className="px-6 py-3.5 text-left text-xs font-mono text-gray-400 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3.5 text-right text-xs font-mono text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262626] bg-[#181818]">
            {filteredQuotes.map((q) => (
              <tr key={q.id_devis} className="hover:bg-[#202020] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-[#ff7a18] font-bold">
                  #{q.id_devis}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-400">
                  {q.cree_le || "Récents"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                  {q.lignes ? q.lignes.length : 0} référence(s)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-white">
                  {q.prix_total.toFixed(2)} €
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {q.statut === 'valide' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle className="h-3 w-3 mr-1" /> Validé
                    </span>
                  )}
                  {q.statut === 'refuse' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <XCircle className="h-3 w-3 mr-1" /> Refusé
                    </span>
                  )}
                  {q.statut === 'en_attente' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-[#ff7a18] border border-[#ff7a18]/20">
                      <Clock className="h-3 w-3 mr-1" /> En attente
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => setSelectedQuote(q)}
                    className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-[#2a2a2a] transition-colors"
                    title="Voir le détail"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => generatePDF(q)}
                    className="p-1.5 text-[#ff7a18] hover:text-[#e0650d] rounded-md hover:bg-[#ff7a18]/10 transition-colors"
                    title="Télécharger PDF"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredQuotes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400 font-mono">
                  Aucun devis trouvé dans votre historique.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-[#262626] rounded-md max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-[#262626] pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Devis #{selectedQuote.id_devis}</h3>
                <p className="text-xs font-mono text-gray-400 mt-1">Statut: {selectedQuote.statut}</p>
              </div>
              <button
                onClick={() => setSelectedQuote(null)}
                className="text-gray-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Liste des composants</h4>
              <div className="border border-[#262626] rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-[#262626]">
                  <thead className="bg-[#121212]">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-mono text-gray-400">Référence</th>
                      <th className="px-4 py-2 text-left text-xs font-mono text-gray-400">Description</th>
                      <th className="px-4 py-2 text-right text-xs font-mono text-gray-400">Qté</th>
                      <th className="px-4 py-2 text-right text-xs font-mono text-gray-400">Prix U.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626] bg-[#181818]">
                    {(selectedQuote.lignes || []).map((l, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2 text-xs font-mono text-[#ff7a18]">{l.num_composant_fabric}</td>
                        <td className="px-4 py-4 text-xs text-gray-300">{l.description || l.libelle_extrait_comp || "N/A"}</td>
                        <td className="px-4 py-2 text-xs font-mono text-right text-gray-300">{l.quantite_demande}</td>
                        <td className="px-4 py-2 text-xs font-mono text-right text-gray-300">{l.prix_unitaire.toFixed(2)} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center bg-[#141414] p-4 rounded-md border border-[#262626]">
                <span className="text-sm text-gray-400 font-mono">Montant Total :</span>
                <span className="text-2xl font-bold font-mono text-[#ff7a18]">{selectedQuote.prix_total.toFixed(2)} €</span>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-[#262626]">
              <button
                onClick={() => generatePDF(selectedQuote)}
                className="px-4 py-2 bg-[#ff7a18] hover:bg-[#e0650d] text-white text-sm font-medium rounded-md flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter PDF
              </button>
              <button
                onClick={() => setSelectedQuote(null)}
                className="px-4 py-2 bg-[#222222] hover:bg-[#2a2a2a] text-gray-300 text-sm font-medium rounded-md"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
