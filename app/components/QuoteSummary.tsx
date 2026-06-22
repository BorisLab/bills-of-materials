"use client";

import React from 'react';
import { Download, CheckCircle, ArrowLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface QuoteLineOut {
  id_ligne_devis: number;
  quantite_demande: number;
  libelle_extrait_comp: string;
  composant_id: number;
  num_composant_fabric: string;
  description: string;
  prix_unitaire: number;
}

export interface QuoteOut {
  id_devis: number;
  prix_total: number;
  statut: string;
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
      doc.setFontSize(20);
      doc.text(`Devis / BOM #${quote.id_devis}`, 14, 22);

      doc.setFontSize(11);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);
      doc.text(`Statut: ${quote.statut}`, 14, 36);

      // Table
      const tableColumn = ["Référence", "Description", "Quantité", "Prix Unitaire", "Total Ligne"];
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

      // @ts-expect-error autoTable is added by jspdf-autotable plugin
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [37, 99, 235] } // Blue-600
      });

      // Total
      // @ts-expect-error autoTable is added by jspdf-autotable plugin
      const finalY = doc.lastAutoTable.finalY || 60;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Total : ${quote.prix_total.toFixed(2)} €`, 14, finalY + 15);

      doc.save(`Devis_${quote.id_devis}.pdf`);
    } catch (error: unknown) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-8 text-center border-b border-gray-100 bg-gray-50">
        <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-4">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Devis généré avec succès !</h2>
        <p className="text-gray-500 mt-2">Le devis #{quote.id_devis} a bien été enregistré en base de données.</p>

        <div className="mt-6 inline-block bg-white border border-gray-200 px-6 py-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Prix Total Calculé</p>
          <p className="text-4xl font-extrabold text-blue-600 mt-1">{quote.prix_total.toFixed(2)} €</p>
        </div>

        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={generatePDF}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Télécharger le PDF
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Nouveau Devis
          </button>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Détails des composants</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Prix Unit.</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {quote.lignes.map((line) => (
                <tr key={line.id_ligne_devis} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{line.num_composant_fabric}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{line.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{line.quantite_demande}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{line.prix_unitaire.toFixed(2)} €</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
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
