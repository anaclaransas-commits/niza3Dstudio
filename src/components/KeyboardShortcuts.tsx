/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Keyboard, X, Command } from 'lucide-react';

interface Shortcut {
  key: string;
  description: string;
  action: () => void;
}

interface KeyboardShortcutsProps {
  shortcuts: Shortcut[];
}

export function KeyboardShortcuts({ shortcuts }: KeyboardShortcutsProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open shortcuts help with ?
      if (e.key === '?' && !isOpen) {
        e.preventDefault();
        setIsOpen(true);
      }
      // Close with Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen) return; // Don't trigger shortcuts when modal is open

      const shortcut = shortcuts.find(s => {
        if (s.key.includes('+')) {
          const parts = s.key.split('+');
          const modifier = parts[0];
          const key = parts[1];
          
          if (modifier === 'Ctrl' || modifier === 'Cmd') {
            return (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === key.toLowerCase();
          }
          if (modifier === 'Shift') {
            return e.shiftKey && e.key.toLowerCase() === key.toLowerCase();
          }
        }
        return e.key.toLowerCase() === s.key.toLowerCase();
      });

      if (shortcut) {
        e.preventDefault();
        shortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Keyboard className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-bold text-slate-900">Atalhos de Teclado</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-4">
          <div className="space-y-4">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <span className="text-slate-700">{shortcut.description}</span>
                <kbd className="px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-lg text-sm font-mono text-slate-600">
                  {shortcut.key.includes('+') ? (
                    <span className="flex items-center gap-1">
                      {shortcut.key.split('+').map((part, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && <span className="text-slate-400">+</span>}
                          {part === 'Ctrl' || part === 'Cmd' ? <Command className="w-3 h-3" /> : part}
                        </React.Fragment>
                      ))}
                    </span>
                  ) : (
                    shortcut.key
                  )}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 text-center">
          Pressione <kbd className="px-2 py-1 bg-white rounded border border-slate-300 mx-1">Esc</kbd> para fechar
        </div>
      </div>
    </div>
  );
}