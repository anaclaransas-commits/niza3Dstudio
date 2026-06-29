import { create } from 'zustand';
import { ToastType } from '../components/Toast';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (type, message, duration) => {
    const id = crypto.randomUUID();
    set((state) => ({
      toasts: [...state.toasts, { id, type, message, duration }],
    }));
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
}));

export function useToast() {
  const { addToast, removeToast } = useToastStore();

  const toast = (type: ToastType, message: string, duration?: number) => {
    addToast(type, message, duration);
  };

  const success = (message: string, duration?: number) => toast('success', message, duration);
  const error = (message: string, duration?: number) => toast('error', message, duration);
  const warning = (message: string, duration?: number) => toast('warning', message, duration);
  const info = (message: string, duration?: number) => toast('info', message, duration);

  return { toast, success, error, warning, info, removeToast };
}
