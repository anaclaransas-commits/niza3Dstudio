import React, { useCallback, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface DropzoneProps {
  onFilesDrop: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function Dropzone({
  onFilesDrop,
  accept = 'image/*',
  multiple = false,
  disabled = false,
  className,
  children,
}: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files) as File[];
      if (files.length > 0) {
        onFilesDrop(files);
      }
    },
    [onFilesDrop, disabled]
  );

  return (
    <div
      className={cn(
        'relative border-2 border-dashed rounded-xl transition-all duration-300',
        isDragging
          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
          : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'cursor-pointer',
        className
      )}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {children || (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Upload className="w-8 h-8 text-slate-400 mb-2" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Arraste e solte arquivos aqui
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            ou clique para selecionar
          </p>
        </div>
      )}
    </div>
  );
}
