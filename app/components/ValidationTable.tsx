"use client";

import React, { useState } from 'react';
import { Trash2, Save, CheckCircle } from 'lucide-react';

export interface BOMComponent {
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

  const handleSave = () => {
    onSave(components);
  };

  if (components.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
        <p className="text-gray-500">Aucun composant n'a été trouvé. Veuillez vérifier votre document ou le rajouter manuellement.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            Validation des composants ({components.length})
          </h3>
          <p className="text-sm text-gray-500 mt-1">Veuillez corriger les éventuelles erreurs de l'OCR avant l'enregistrement.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
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
              Confirmer et Enregistrer
            </>
          )}
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Référence
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantité
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {components.map((comp, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    value={comp.num_composant_fabric}
                    onChange={(e) => handleUpdate(index, 'num_composant_fabric', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-2 py-1 border"
                  />
                </td>
                <td className="px-6 py-4 w-full">
                  <input
                    type="text"
                    value={comp.description}
                    onChange={(e) => handleUpdate(index, 'description', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-2 py-1 border"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    value={comp.quantite_demande}
                    onChange={(e) => handleUpdate(index, 'quantite_demande', parseInt(e.target.value) || 0)}
                    className="block w-24 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-2 py-1 border"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleRemove(index)}
                    className="text-red-600 hover:text-red-900 p-1"
                    title="Supprimer"
                  >
                    <Trash2 className="h-5 w-5" />
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
