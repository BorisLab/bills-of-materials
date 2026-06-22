import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Dropzone from '../Dropzone';

describe('Dropzone Component', () => {
  const mockOnFileSelect = jest.fn();

  beforeEach(() => {
    mockOnFileSelect.mockClear();
  });

  it('renders correctly', () => {
    render(<Dropzone onFileSelect={mockOnFileSelect} isUploading={false} />);
    expect(screen.getByText('Cliquez ou glissez-déposez un fichier ici')).toBeInTheDocument();
  });

  it('shows uploading state with progress bar', () => {
    // First we must render with a file, then update to uploading=true
    // But since the internal state is lost if we don't simulate it, we can just fire the event then rerender
    const { rerender } = render(<Dropzone onFileSelect={mockOnFileSelect} isUploading={false} />);
    
    const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    
    // Now rerender with isUploading = true
    rerender(<Dropzone onFileSelect={mockOnFileSelect} isUploading={true} />);
    
    expect(screen.getByText(/Analyse OCR en cours\.\.\./i)).toBeInTheDocument();
  });

  it('handles file selection', () => {
    render(<Dropzone onFileSelect={mockOnFileSelect} isUploading={false} />);
    
    // Create a mock file
    const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
    
    // Find the hidden input element inside the component
    // We can't query it by label text since it's absolute positioned over the div
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).not.toBeNull();
    
    // Fire change event
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(mockOnFileSelect).toHaveBeenCalledTimes(1);
    expect(mockOnFileSelect).toHaveBeenCalledWith(file);
    
    // Check if the selected file name is displayed
    expect(screen.getByText('example.png')).toBeInTheDocument();
  });
});
