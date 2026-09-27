"use client";

import React from 'react';
import { Download, CheckCircle, ArrowLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface QuoteLineOut {
  id_ligne_devis: number;
  quantite_demande: number;
  libelle_extrait_comp?: string;
  composant_id: number;
  num_composant_fabric: string;
  description?: string;
  prix_unitaire: number;
}

export interface QuoteOut {
  id_devis: number;
  prix_total: number;
  remise_pourcentage?: number;
  commentaire_commercial?: string;
  statut: string;
  cree_le?: string;
  lignes: QuoteLineOut[];
}

interface QuoteSummaryProps {
  quote: QuoteOut;
  onReset: () => void;
}

export default function QuoteSummary({ quote, onReset }: QuoteSummaryProps) {
  const generatePDF = () => {
    try {
      const doc = new jsPDF();

      // Header
      doc.setFillColor(24, 24, 24);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 122, 24); // Moooss Amber
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("BOM SaaS Logistics - Devis Component", 14, 20);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Devis N° #${quote.id_devis} | Date: ${quote.cree_le || new Date().toLocaleDateString()}`, 14, 30);

      // Status
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(11);
      doc.text(`Statut actuel du devis : ${quote.statut.toUpperCase()}`, 14, 50);

      if (quote.remise_pourcentage && quote.remise_pourcentage > 0) {
        doc.text(`Remise commerciale appliquée : ${quote.remise_pourcentage}%`, 14, 56);
      }

      // Table
      const tableColumn = ["Référence", "Description", "Quantité", "Prix Unit. (€)", "Total Ligne (€)"];
      const tableRows: (string | number)[][] = [];

      quote.lignes.forEach(line => {
        const lineData = [
          line.num_composant_fabric,
          line.description || line.libelle_extrait_comp || "N/A",
          line.quantite_demande,
          `${line.prix_unitaire.toFixed(2)} €`,
          `${(line.prix_unitaire * line.quantite_demande).toFixed(2)} €`
        ];
        tableRows.push(lineData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: quote.remise_pourcentage ? 64 : 58,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 4 },
        headStyles: { fillColor: [255, 122, 24], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });

      // Total
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const finalY = (doc as any).lastAutoTable?.finalY || 80;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(24, 24, 24);
      doc.text(`Montant Total Devis : ${quote.prix_total.toFixed(2)} €`, 14, finalY + 15);

      doc.save(`Devis_BOM_${quote.id_devis}.pdf`);
    } catch (error: unknown) {
      console.error('Erreur génération PDF:', error);
    }
  };

  return (
    <div className="bg-[#181818] rounded-md shadow-xl border border-[#262626] overflow-hidden">
      <div className="p-8 text-center border-b border-[#262626] bg-[#141414]">
        <div className="inline-flex items-center justify-center p-3 bg-[#ff7a18]/10 text-[#ff7a18] rounded-full mb-4 border border-[#ff7a18]/20">
          <CheckCircle className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-white">Devis n°#{quote.id_devis} Généré !</h2>
        <p className="text-gray-400 mt-2 text-sm">Le devis a été enregistré et transmis à l&apos;équipe commerciale.</p>

        <div className="mt-6 inline-block bg-[#1a1a1a] border border-[#262626] px-8 py-5 rounded-md shadow-inner">
          <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">Prix Total du Devis</p>
          <p className="text-4xl font-extrabold font-mono text-[#ff7a18] mt-1">{quote.prix_total.toFixed(2)} €</p>
          {quote.remise_pourcentage !== undefined && quote.remise_pourcentage > 0 && (
            <p className="text-xs font-mono text-emerald-400 mt-1">Remise commerciale de {quote.remise_pourcentage}% incluse</p>
          )}
        </div>

        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={generatePDF}
            className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#ff7a18] hover:bg-[#e0650d] transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Télécharger le Devis (PDF)
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center px-5 py-2.5 border border-[#333333] text-sm font-medium rounded-md text-gray-300 bg-[#222222] hover:bg-[#2a2a2a] hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Nouveau Devis
          </button>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-bold text-white mb-4">Détails des composants inclus</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#262626]">
            <thead className="bg-[#121212]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-mono text-gray-400 uppercase tracking-wider">Référence</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-mono text-gray-400 uppercase tracking-wider">Description</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-mono text-gray-400 uppercase tracking-wider">Quantité</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-mono text-gray-400 uppercase tracking-wider">Prix Unit.</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-mono text-gray-400 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-[#181818] divide-y divide-[#262626]">
              {quote.lignes.map((line) => (
                <tr key={line.id_ligne_devis} className="hover:bg-[#202020] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-[#ff7a18]">{line.num_composant_fabric}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{line.description || line.libelle_extrait_comp || "N/A"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300 text-right">{line.quantite_demande}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300 text-right">{line.prix_unitaire.toFixed(2)} €</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-white text-right">
                    {(line.prix_unitaire * line.quantite_demande).toFixed(2)} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
