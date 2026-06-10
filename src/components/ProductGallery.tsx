/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { uploadCatalogAsset } from '../lib/catalogApi';
import { coerceProductImageUrls } from '../lib/catalogUtils';

interface ProductGalleryProps {
  imageUrls: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
}

function slugifySegment(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'geral';
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Falha ao carregar imagem.'));
    reader.readAsDataURL(file);
  });
}

export function ProductGallery({ imageUrls, onChange, disabled }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const gallery = coerceProductImageUrls(imageUrls);

  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const asset = await uploadCatalogAsset({
        dataUrl,
        fileName: file.name,
        folder: `products/${slugifySegment('geral')}`,
      });

      if (asset.url && !gallery.includes(asset.url)) {
        onChange([...gallery, asset.url]);
      }
    } catch (error) {
      console.error('Erro ao adicionar imagem:', error);
      alert('Erro ao adicionar imagem. Tente novamente.');
    } finally {
      setIsUploading(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const newGallery = gallery.filter((_, i) => i !== index);
    onChange(newGallery);
    if (currentIndex >= newGallery.length) {
      setCurrentIndex(Math.max(0, newGallery.length - 1));
    }
  };

  const handleSetCover = (index: number) => {
    // Move a imagem selecionada para o início (será a capa)
    const newGallery = [...gallery];
    const [selected] = newGallery.splice(index, 1);
    newGallery.unshift(selected);
    onChange(newGallery);
    setCurrentIndex(0);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % gallery.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  if (gallery.length === 0) {
    return (
      <div className="border-2 border-dashed rounded-2xl p-6 text-center" style={{ borderColor: '#e7e5e4', backgroundColor: '#faf9f5' }}>
        <input
          type="file"
          onChange={handleAddImage}
          accept="image/*"
          disabled={disabled || isUploading}
          className="hidden"
          id="gallery-add-first"
        />
        <label
          htmlFor="gallery-add-first"
          className="cursor-pointer flex flex-col items-center gap-3"
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#003247' }}>
            <Plus className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: '#1c1917' }}>
              {isUploading ? 'Enviando...' : 'Adicionar foto extra'}
            </p>
            <p className="text-xs mt-1" style={{ color: '#78716c' }}>
              Clique para selecionar uma imagem
            </p>
          </div>
        </label>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main image display */}
      <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg" style={{ backgroundColor: '#f5f2eb' }}>
        {gallery[currentIndex] && (
          <>
            <img
              src={gallery[currentIndex]}
              alt={`Foto ${currentIndex + 1}`}
              className="w-full h-full object-cover transition-opacity duration-300"
              style={{ opacity: isUploading ? 0.5 : 1 }}
            />
            
            {/* Navigation arrows */}
            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  style={{ backgroundColor: 'rgba(255,255,255,0.9)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                  disabled={disabled}
                >
                  <ChevronLeft className="w-5 h-5" style={{ color: '#003247' }} />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  style={{ backgroundColor: 'rgba(255,255,255,0.9)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                  disabled={disabled}
                >
                  <ChevronRight className="w-5 h-5" style={{ color: '#003247' }} />
                </button>
              </>
            )}

            {/* Image counter */}
            {gallery.length > 1 && (
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: 'rgba(0,50,71,0.9)', color: 'white' }}>
                {currentIndex + 1} / {gallery.length}
              </div>
            )}

            {/* Remove button */}
            <button
              type="button"
              onClick={() => handleRemoveImage(currentIndex)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              style={{ backgroundColor: 'rgba(239,68,68,0.9)', color: 'white' }}
              disabled={disabled}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Set as cover button - only show if not already cover */}
            {currentIndex !== 0 && (
              <button
                type="button"
                onClick={() => handleSetCover(currentIndex)}
                className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: 'rgba(0,50,71,0.9)', color: 'white' }}
                disabled={disabled}
              >
                Definir como capa
              </button>
            )}
          </>
        )}
      </div>

      {/* Thumbnails */}
      {gallery.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {gallery.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 hover:scale-105"
              style={{
                borderColor: index === currentIndex ? '#003247' : '#e7e5e4',
                opacity: isUploading ? 0.5 : 1,
                transform: index === currentIndex ? 'scale(1.05)' : 'scale(1)',
                boxShadow: index === currentIndex ? '0 4px 12px rgba(0,50,71,0.2)' : 'none',
              }}
              disabled={disabled}
            >
              <img src={url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
          
          {/* Add new image button */}
          <input
            type="file"
            onChange={handleAddImage}
            accept="image/*"
            disabled={disabled || isUploading}
            className="hidden"
            id="gallery-add-more"
          />
          <label
            htmlFor="gallery-add-more"
            className="flex-shrink-0 w-20 h-20 rounded-xl flex items-center justify-center border-2 border-dashed cursor-pointer transition-all duration-300 hover:scale-105 hover:border-solid"
            style={{
              borderColor: '#e7e5e4',
              backgroundColor: '#faf9f5',
            }}
          >
            <Plus className="w-6 h-6" style={{ color: '#003247' }} />
          </label>
        </div>
      )}
    </div>
  );
}
