import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import QuoteSummary, { QuoteOut } from '../QuoteSummary';

// Mock jsPDF
jest.mock('jspdf', () => {
  return {
    jsPDF: jest.fn().mockImplementation(() => {
      return {
        setFontSize: jest.fn(),
        text: jest.fn(),
        setFont: jest.fn(),
        save: jest.fn(),
        autoTable: jest.fn(),
        lastAutoTable: { finalY: 100 }
      };
    })
  };
});

describe('QuoteSummary Component', () => {
  const mockQuote: QuoteOut = {
    id_devis: 1234,
    statut: "en_attente",
    prix_total: 145.50,
    lignes: [
      {
        id_ligne_devis: 1,
        quantite_demande: 2,
        libelle_extrait_comp: "Resistor",
        composant_id: 10,
        num_composant_fabric: "RES-01",
        description: "10k Ohm",
        prix_unitaire: 1.50
      }
    ]
  };

  const mockOnReset = jest.fn();

  beforeEach(() => {
    mockOnReset.mockClear();
  });

  it('renders quote details correctly', () => {
    render(<QuoteSummary quote={mockQuote} onReset={mockOnReset} />);
    
    expect(screen.getByText(/Devis généré avec succès !/i)).toBeInTheDocument();
    expect(screen.getByText(/Le devis #1234 a bien été enregistré/i)).toBeInTheDocument();
    expect(screen.getByText('145.50 €')).toBeInTheDocument();
    expect(screen.getByText('RES-01')).toBeInTheDocument();
    expect(screen.getByText('10k Ohm')).toBeInTheDocument();
  });

  it('calls onReset when Nouveau Devis button is clicked', () => {
    render(<QuoteSummary quote={mockQuote} onReset={mockOnReset} />);
    
    const resetBtn = screen.getByText(/Nouveau Devis/i);
    fireEvent.click(resetBtn);
    
    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });
});
