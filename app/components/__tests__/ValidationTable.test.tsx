import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ValidationTable, { BOMComponent } from '../ValidationTable';

const mockComponents: BOMComponent[] = [
  {
    num_composant_fabric: 'RES-10K',
    description: 'Resistor 10K',
    quantite_demande: 5,
  },
  {
    num_composant_fabric: 'CAP-01',
    description: 'Capacitor 0.1uF',
    quantite_demande: 10,
  }
];

describe('ValidationTable Component', () => {
  const mockOnSave = jest.fn();

  beforeEach(() => {
    mockOnSave.mockClear();
  });

  it('renders correctly with components', () => {
    render(<ValidationTable initialComponents={mockComponents} onSave={mockOnSave} isSaving={false} />);
    
    // Check if the inputs are populated with initial data
    expect(screen.getByDisplayValue('RES-10K')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Capacitor 0.1uF')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
  });

  it('renders empty state if no components', () => {
    render(<ValidationTable initialComponents={[]} onSave={mockOnSave} isSaving={false} />);
    expect(screen.getByText(/Aucun composant n'a été trouvé/i)).toBeInTheDocument();
  });

  it('allows editing values', () => {
    render(<ValidationTable initialComponents={mockComponents} onSave={mockOnSave} isSaving={false} />);
    
    const qtyInput = screen.getByDisplayValue('5') as HTMLInputElement;
    fireEvent.change(qtyInput, { target: { value: '15' } });
    
    expect(qtyInput.value).toBe('15');
  });

  it('calls onSave with updated data when clicking save', () => {
    render(<ValidationTable initialComponents={mockComponents} onSave={mockOnSave} isSaving={false} />);
    
    // Edit the quantity
    const qtyInput = screen.getByDisplayValue('5');
    fireEvent.change(qtyInput, { target: { value: '15' } });
    
    // Click save
    const saveBtn = screen.getByText(/Confirmer et Enregistrer/i);
    fireEvent.click(saveBtn);
    
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    const savedData = mockOnSave.mock.calls[0][0];
    expect(savedData[0].quantite_demande).toBe(15);
  });
});
