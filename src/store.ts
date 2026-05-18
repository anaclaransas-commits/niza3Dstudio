/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  type Budget,
  type BudgetStatus,
  type CatalogSettings,
  type Client,
  type Filament,
  type Printer,
  type Product,
  type ResinSupply,
  type SalesChannel,
} from './types';

const STORAGE_KEYS = {
  printers: '3d_printers',
  filaments: '3d_filaments',
  resins: '3d_resins',
  clients: '3d_clients',
  products: '3d_products',
  budgets: '3d_budgets',
  channels: '3d_channels',
  catalogSettings: '3d_catalog_settings',
} as const;

const defaultCatalogSettings: CatalogSettings = {
  businessName: '3DPrint Master',
  tagline: 'Impressão 3D com qualidade e precisão',
  primaryColor: '#1e293b',
  accentColor: '#3b82f6',
  whatsapp: '',
  instagram: '',
  email: '',
  footerNote: '',
};

const defaultPrinters: Printer[] = [
  {
    id: 'p1',
    name: 'Ender 3 V2 Pro',
    brand: 'Creality',
    model: 'Ender 3',
    powerConsumption: 250,
    purchasePrice: 1500,
    maintenanceCostPerHour: 0.5,
  },
  {
    id: 'p2',
    name: 'Bambu Lab P1P',
    brand: 'Bambu Lab',
    model: 'P1P',
    powerConsumption: 350,
    purchasePrice: 4500,
    maintenanceCostPerHour: 0.2,
  },
];

const defaultFilaments: Filament[] = [
  {
    id: 'f1',
    name: 'PLA Silky Blue',
    brand: '3D LAB',
    material: 'PLA',
    weightKg: 1,
    pricePerKg: 120,
    color: '#3b82f6',
  },
  {
    id: 'f2',
    name: 'ABS Premium Grey',
    brand: 'Esun',
    material: 'ABS',
    weightKg: 1,
    pricePerKg: 95,
    color: '#64748b',
  },
];

const defaultClients: Client[] = [
  { id: 'c1', name: 'João Silva', email: 'joao@email.com', phone: '(11) 98765-4321', cpf: '123.456.789-00' },
  { id: 'c2', name: 'Decora House', email: 'contato@decorahouse.com', phone: '(11) 91234-5678' },
];

const defaultProducts: Product[] = [
  {
    id: 'pr1',
    name: 'Vaso Low Poly',
    materialType: 'PLA',
    description: 'Vaso decorativo com estilo geométrico moderno.',
    defaultWeightG: 85,
    basePrice: 65,
    imageUrl: 'https://images.unsplash.com/photo-1631125915902-58ba9235ff27?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'pr2',
    name: 'Articulated Dragon',
    materialType: 'PLA',
    description: 'Dragão articulado impresso em uma única peça.',
    defaultWeightG: 120,
    basePrice: 150,
    imageUrl: 'https://images.unsplash.com/photo-1596489397685-6e0ef6637ef6?auto=format&fit=crop&q=80&w=400',
  },
];

function readStoredValue<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const savedValue = localStorage.getItem(key);
    return savedValue ? (JSON.parse(savedValue) as T) : fallback;
  } catch (error) {
    console.warn(`Falha ao ler a chave ${key} do localStorage.`, error);
    return fallback;
  }
}

function writeStoredValue(key: string, value: unknown) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Falha ao salvar a chave ${key} no localStorage.`, error);
  }
}

type StoreContextValue = {
  printers: Printer[];
  filaments: Filament[];
  resins: ResinSupply[];
  clients: Client[];
  products: Product[];
  budgets: Budget[];
  channels: SalesChannel[];
  catalogSettings: CatalogSettings;
  addPrinter: (data: Omit<Printer, 'id'>) => Printer;
  addFilament: (data: Omit<Filament, 'id'>) => Filament;
  addResin: (data: Omit<ResinSupply, 'id'>) => ResinSupply;
  addClient: (data: Omit<Client, 'id'>) => Client;
  addProduct: (data: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, data: Partial<Omit<Product, 'id'>>) => void;
  addBudget: (data: Omit<Budget, 'id'>) => Budget;
  addChannel: (data: Omit<SalesChannel, 'id'>) => SalesChannel;
  updateBudgetStatus: (budgetId: string, status: BudgetStatus) => void;
  deleteBudget: (budgetId: string) => void;
  removeProduct: (productId: string) => void;
  updateCatalogSettings: (settings: Partial<CatalogSettings>) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [printers, setPrinters] = useState<Printer[]>(() => readStoredValue(STORAGE_KEYS.printers, defaultPrinters));
  const [filaments, setFilaments] = useState<Filament[]>(() => readStoredValue(STORAGE_KEYS.filaments, defaultFilaments));
  const [resins, setResins] = useState<ResinSupply[]>(() => readStoredValue(STORAGE_KEYS.resins, []));
  const [clients, setClients] = useState<Client[]>(() => readStoredValue(STORAGE_KEYS.clients, defaultClients));
  const [products, setProducts] = useState<Product[]>(() => readStoredValue(STORAGE_KEYS.products, defaultProducts));
  const [budgets, setBudgets] = useState<Budget[]>(() => readStoredValue(STORAGE_KEYS.budgets, []));
  const [channels, setChannels] = useState<SalesChannel[]>(() => readStoredValue(STORAGE_KEYS.channels, []));
  const [catalogSettings, setCatalogSettings] = useState<CatalogSettings>(() => readStoredValue(STORAGE_KEYS.catalogSettings, defaultCatalogSettings));

  useEffect(() => {
    writeStoredValue(STORAGE_KEYS.printers, printers);
    writeStoredValue(STORAGE_KEYS.filaments, filaments);
    writeStoredValue(STORAGE_KEYS.resins, resins);
    writeStoredValue(STORAGE_KEYS.clients, clients);
    writeStoredValue(STORAGE_KEYS.products, products);
    writeStoredValue(STORAGE_KEYS.budgets, budgets);
    writeStoredValue(STORAGE_KEYS.channels, channels);
    writeStoredValue(STORAGE_KEYS.catalogSettings, catalogSettings);
  }, [printers, filaments, resins, clients, products, budgets, channels, catalogSettings]);

  const addPrinter = (data: Omit<Printer, 'id'>) => {
    const newPrinter = { ...data, id: uuidv4() };
    setPrinters((currentPrinters) => [...currentPrinters, newPrinter]);
    return newPrinter;
  };

  const addFilament = (data: Omit<Filament, 'id'>) => {
    const newFilament = { ...data, id: uuidv4() };
    setFilaments((currentFilaments) => [...currentFilaments, newFilament]);
    return newFilament;
  };

  const addResin = (data: Omit<ResinSupply, 'id'>) => {
    const newResin = { ...data, id: uuidv4() };
    setResins((currentResins) => [...currentResins, newResin]);
    return newResin;
  };

  const addClient = (data: Omit<Client, 'id'>) => {
    const newClient = { ...data, id: uuidv4() };
    setClients((currentClients) => [...currentClients, newClient]);
    return newClient;
  };

  const addProduct = (data: Omit<Product, 'id'>) => {
    const newProduct = { ...data, id: uuidv4() };
    setProducts((currentProducts) => [...currentProducts, newProduct]);
    return newProduct;
  };

  const addBudget = (data: Omit<Budget, 'id'>) => {
    const newBudget = { ...data, id: uuidv4() };
    setBudgets((currentBudgets) => [newBudget, ...currentBudgets]);
    return newBudget;
  };

  const addChannel = (data: Omit<SalesChannel, 'id'>) => {
    const newChannel = { ...data, id: uuidv4() };
    setChannels((currentChannels) => [...currentChannels, newChannel]);
    return newChannel;
  };

  const updateBudgetStatus = (budgetId: string, status: BudgetStatus) => {
    setBudgets((currentBudgets) =>
      currentBudgets.map((budget) => (budget.id === budgetId ? { ...budget, status } : budget)),
    );
  };

  const deleteBudget = (budgetId: string) => {
    setBudgets((currentBudgets) => currentBudgets.filter((budget) => budget.id !== budgetId));
  };

  const removeProduct = (productId: string) => {
    setProducts((currentProducts) => currentProducts.filter((product) => product.id !== productId));
  };

  const updateProduct = (id: string, data: Partial<Omit<Product, 'id'>>) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) => (product.id === id ? { ...product, ...data } : product)),
    );
  };

  const updateCatalogSettings = (settings: Partial<CatalogSettings>) => {
    setCatalogSettings((prev) => ({ ...prev, ...settings }));
  };

  const value = useMemo<StoreContextValue>(
    () => ({
      printers,
      filaments,
      resins,
      clients,
      products,
      budgets,
      channels,
      catalogSettings,
      addPrinter,
      addFilament,
      addResin,
      addClient,
      addProduct,
      updateProduct,
      addBudget,
      addChannel,
      updateBudgetStatus,
      deleteBudget,
      removeProduct,
      updateCatalogSettings,
    }),
    [printers, filaments, resins, clients, products, budgets, channels, catalogSettings],
  );

  return createElement(StoreContext.Provider, { value }, children);
}

export function useStore() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error('useStore precisa ser usado dentro de StoreProvider.');
  }

  return context;
}

