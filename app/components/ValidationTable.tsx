"use client";

import React, { useState } from 'react';
import { Trash2, Save, CheckCircle, Plus } from 'lucide-react';

export interface BOMComponent {
  texte_extrait?: string;
  num_composant_fabric: string;
  description: string;
  quantite_demande: number;
}

interface ValidationTableProps {
  initialComponents: BOMComponent[];
  onSave: (components: BOMComponent[]) => void;
  isSaving: boolean;
}

export default function ValidationTable({ initialComponents, onSave, isSaving }: ValidationTableProps) {
  const [components, setComponents] = useState<BOMComponent[]>(initialComponents);

  const handleRemove = (index: number) => {
    const newComponents = [...components];
    newComponents.splice(index, 1);
    setComponents(newComponents);
  };

  const handleUpdate = (index: number, field: keyof BOMComponent, value: string | number) => {
    const newComponents = [...components];
    newComponents[index] = { ...newComponents[index], [field]: value };
    setComponents(newComponents);
  };

  const handleAddComponent = () => {
    setComponents([
      ...components,
      {
        texte_extrait: "Saisie manuelle",
        num_composant_fabric: "REF-" + Math.floor(1000 + Math.random() * 9000),
        description: "Nouveau composant",
        quantite_demande: 1
      }
    ]);
  };

  const handleSave = () => {
    onSave(components);
  };

  if (components.length === 0) {
    return (
      <div className="bg-[#181818] p-8 rounded-md shadow-lg border border-[#262626] text-center">
        <p className="text-gray-400">Aucun composant n&apos;a été trouvé.</p>
        <button
          onClick={handleAddComponent}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#ff7a18] hover:bg-[#e0650d] transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un composant manuellement
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#181818] rounded-md shadow-xl border border-[#262626] overflow-hidden">
      <div className="p-6 border-b border-[#262626] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#141414]">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center">
            <CheckCircle className="h-5 w-5 text-[#ff7a18] mr-2" />
            Validation des composants ({components.length})
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Vérifiez et ajustez la liste extraite par l&apos;OCR avant d&apos;enregistrer le devis.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleAddComponent}
            className="inline-flex items-center px-3 py-2 border border-[#333333] text-sm font-medium rounded-md text-gray-300 bg-[#222222] hover:bg-[#2a2a2a] hover:text-white transition-colors"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Ajouter une ligne
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#ff7a18] hover:bg-[#e0650d] transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Confirmer & Enregistrer Devis
              </>
            )}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#262626]">
          <thead className="bg-[#121212]">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-mono text-gray-400 uppercase tracking-wider border-r border-[#262626]">
                Texte extrait (OCR)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-mono text-gray-400 uppercase tracking-wider">
                Référence Fabricant
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-mono text-gray-400 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-mono text-gray-400 uppercase tracking-wider">
                Quantité
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-mono text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-[#181818] divide-y divide-[#262626]">
            {components.map((comp, index) => (
              <tr key={index} className="hover:bg-[#202020] transition-colors">
                <td className="px-6 py-4 text-xs font-mono text-gray-400 border-r border-[#262626] bg-[#141414]/50">
                  {comp.texte_extrait || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    value={comp.num_composant_fabric}
                    onChange={(e) => handleUpdate(index, 'num_composant_fabric', e.target.value)}
                    className="block w-full bg-[#121212] border border-[#333333] text-white font-mono rounded-md shadow-sm focus:ring-[#ff7a18] focus:border-[#ff7a18] text-sm px-3 py-1.5"
                  />
                </td>
                <td className="px-6 py-4 w-full">
                  <input
                    type="text"
                    value={comp.description}
                    onChange={(e) => handleUpdate(index, 'description', e.target.value)}
                    className="block w-full bg-[#121212] border border-[#333333] text-white rounded-md shadow-sm focus:ring-[#ff7a18] focus:border-[#ff7a18] text-sm px-3 py-1.5"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    value={comp.quantite_demande}
                    onChange={(e) => handleUpdate(index, 'quantite_demande', parseInt(e.target.value) || 0)}
                    className="block w-28 bg-[#121212] border border-[#333333] text-white font-mono rounded-md shadow-sm focus:ring-[#ff7a18] focus:border-[#ff7a18] text-sm px-3 py-1.5 text-right"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleRemove(index)}
                    className="text-gray-400 hover:text-red-400 p-1.5 rounded-md hover:bg-red-400/10 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
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
