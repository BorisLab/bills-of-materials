"use client";

import React, { useCallback, useState, useEffect } from 'react';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
}

export default function Dropzone({ onFileSelect, isUploading }: DropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isUploading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          // Simulate progress slowing down near the end
          const increment = prev < 60 ? 5 : prev < 85 ? 2 : prev < 95 ? 0.5 : 0;
          return Math.min(prev + increment, 95); // Max 95% until done
        });
      }, 300);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [isUploading]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const clearFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer
            ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
            ${isUploading ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
            disabled={isUploading}
            accept="image/*,application/pdf"
          />
          <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900">
            Cliquez ou glissez-déposez un fichier ici
          </p>
          <p className="mt-1 text-sm text-gray-500">
            PDF, PNG, JPG supportés (Max 1MB pour la version gratuite)
          </p>
        </div>
      ) : (
        <div className="flex flex-col p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <FileIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            {!isUploading && (
              <button
                onClick={clearFile}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Retirer le fichier"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          
          {isUploading && (
            <div className="mt-4 w-full">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Analyse OCR en cours...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
