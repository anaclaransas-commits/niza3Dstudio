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
  type CalculatorDefaults,
  type CalculatorTemplate,
  type CatalogSettings,
  type Client,
  type DiscountCode,
  type ExpenseCategory,
  type Filament,
  type FinanceEntry,
  type Printer,
  type PrintQueueItem,
  type Product,
  type QualityControlEntry,
  type ResinSupply,
  type SalesChannel,
  type TimeTrackingEntry,
  type ActivityLog,
  type Reminder,
} from './types';
import {
  deleteCatalogProduct,
  getCatalogAdminData,
  replaceCatalogAdminData,
  saveCatalogProduct,
  saveCatalogSettings,
} from './lib/catalogApi';

const STORAGE_KEYS = {
  printers: '3d_printers',
  filaments: '3d_filaments',
  resins: '3d_resins',
  clients: '3d_clients',
  products: '3d_products',
  budgets: '3d_budgets',
  financeEntries: '3d_finance_entries',
  calculatorDefaults: '3d_calculator_defaults',
  channels: '3d_channels',
  catalogSettings: '3d_catalog_settings',
  calculatorTemplates: '3d_calculator_templates',
  discountCodes: '3d_discount_codes',
  printQueue: '3d_print_queue',
  timeTracking: '3d_time_tracking',
  qualityControl: '3d_quality_control',
  activityLog: '3d_activity_log',
  reminders: '3d_reminders',
  expenseCategories: '3d_expense_categories',
} as const;

const defaultCatalogSettings: CatalogSettings = {
  businessName: 'Niza3D Studio',
  tagline: 'Peças impressas em 3D com acabamento premium e produção sob medida.',
  primaryColor: '#22271b',
  accentColor: '#8b9964',
  coverImageUrl: '',
  announcementText: 'Catálogo sob encomenda • personalização de cor, escala e acabamento • atendimento direto',
  heroDescription: 'A Niza3D Studio cria peças decorativas, utilitárias e presentes personalizados com visual limpo, produção cuidadosa e contato rápido para orçamento.',
  highlightOne: 'Decoração, organização e presentes',
  highlightTwo: 'Escala, cor e acabamento sob medida',
  highlightThree: 'Atendimento rápido pelo WhatsApp',
  catalogHeadline: 'Peças que saem do catálogo para o seu projeto',
  catalogSubheadline: 'Explore as coleções, escolha o modelo ideal e fale com a Niza3D Studio para personalizar cada detalhe.',
  aboutTitle: 'Feito com atenção aos detalhes',
  aboutText: 'Na Niza3D Studio, cada peça é produzida sob demanda com foco em acabamento, proporção e apresentação. Trabalhamos com modelos decorativos, organizadores e itens personalizados para presente ou uso diário.',
  contactHeadline: 'Vamos montar sua versão ideal',
  contactText: 'Se você já escolheu um modelo, fale com a gente para ajustar medidas, cor, quantidade e prazo de produção.',
  primaryCtaLabel: 'Pedir orçamento',
  primaryCtaUrl: '',
  secondaryCtaLabel: 'Ver Instagram',
  secondaryCtaUrl: '',
  whatsapp: '',
  instagram: '',
  email: '',
  footerNote: 'Produção sob demanda em impressão 3D.',
  filterValues: {
    tipo: [],
    ambiente: [],
    público: [],
    estilo: [],
    ocasião: [],
    coleção: [],
    material: [],
  },
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

const defaultCalculatorDefaults: CalculatorDefaults = {
  selectedFilamentId: '',
  selectedPrinterId: '',
  manualFilamentPrice: '120',
  manualPowerConsumptionW: '200',
  energyPriceKWh: '0.85858',
  laborCostFixed: '0',
  fixedCostPerPiece: '0',
  margin: '30',
  quantity: '1',
};

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

let lastCatalogPublishErrorAt = 0;

function notifyCatalogPublishError(action: string, error: unknown) {
  console.warn(`Falha ao ${action} no catálogo publicado.`, error);

  if (typeof window === 'undefined') {
    return;
  }

  const now = Date.now();
  if (now - lastCatalogPublishErrorAt < 5000) {
    return;
  }

  lastCatalogPublishErrorAt = now;
  window.alert(
    'Os dados ficaram salvos neste navegador, mas não foram publicados no catálogo do cliente. Se o site estiver no Netlify, configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas variáveis do deploy ou mantenha a API do catálogo ativa.',
  );
}

type StoreContextValue = {
  printers: Printer[];
  filaments: Filament[];
  resins: ResinSupply[];
  clients: Client[];
  products: Product[];
  budgets: Budget[];
  financeEntries: FinanceEntry[];
  calculatorDefaults: CalculatorDefaults;
  channels: SalesChannel[];
  catalogSettings: CatalogSettings;
  setCatalogSettings: (settings: CatalogSettings) => void;
  calculatorTemplates: CalculatorTemplate[];
  discountCodes: DiscountCode[];
  printQueue: PrintQueueItem[];
  timeTracking: TimeTrackingEntry[];
  qualityControl: QualityControlEntry[];
  activityLog: ActivityLog[];
  reminders: Reminder[];
  expenseCategories: ExpenseCategory[];
  addPrinter: (data: Omit<Printer, 'id'>) => Printer;
  addFilament: (data: Omit<Filament, 'id'>) => Filament;
  addResin: (data: Omit<ResinSupply, 'id'>) => ResinSupply;
  addClient: (data: Omit<Client, 'id'>) => Client;
  updateClient: (id: string, data: Partial<Omit<Client, 'id'>>) => void;
  deleteClient: (clientId: string) => void;
  addProduct: (data: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, data: Partial<Omit<Product, 'id'>>) => void;
  addBudget: (data: Omit<Budget, 'id'>) => Budget;
  addFinanceEntry: (data: Omit<FinanceEntry, 'id'>) => FinanceEntry;
  removeFinanceEntry: (entryId: string) => void;
  addChannel: (data: Omit<SalesChannel, 'id'>) => SalesChannel;
  updateBudgetStatus: (budgetId: string, status: BudgetStatus) => void;
  deleteBudget: (budgetId: string) => void;
  removeProduct: (productId: string) => void;
  updateCalculatorDefaults: (settings: Partial<CalculatorDefaults>) => void;
  updateCatalogSettings: (settings: Partial<CatalogSettings>) => void;
  addCalculatorTemplate: (data: Omit<CalculatorTemplate, 'id'>) => CalculatorTemplate;
  removeCalculatorTemplate: (templateId: string) => void;
  addDiscountCode: (data: Omit<DiscountCode, 'id'>) => DiscountCode;
  updateDiscountCode: (id: string, data: Partial<Omit<DiscountCode, 'id'>>) => void;
  removeDiscountCode: (codeId: string) => void;
  addPrintQueueItem: (data: Omit<PrintQueueItem, 'id'>) => PrintQueueItem;
  updatePrintQueueItem: (id: string, data: Partial<Omit<PrintQueueItem, 'id'>>) => void;
  removePrintQueueItem: (itemId: string) => void;
  addTimeTrackingEntry: (data: Omit<TimeTrackingEntry, 'id'>) => TimeTrackingEntry;
  updateTimeTrackingEntry: (id: string, data: Partial<Omit<TimeTrackingEntry, 'id'>>) => void;
  addQualityControlEntry: (data: Omit<QualityControlEntry, 'id'>) => QualityControlEntry;
  addActivityLog: (data: Omit<ActivityLog, 'id'>) => ActivityLog;
  addReminder: (data: Omit<Reminder, 'id'>) => Reminder;
  updateReminder: (id: string, data: Partial<Omit<Reminder, 'id'>>) => void;
  removeReminder: (reminderId: string) => void;
  addExpenseCategory: (data: Omit<ExpenseCategory, 'id'>) => ExpenseCategory;
  updateExpenseCategory: (id: string, data: Partial<Omit<ExpenseCategory, 'id'>>) => void;
  removeExpenseCategory: (categoryId: string) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [printers, setPrinters] = useState<Printer[]>(() => readStoredValue(STORAGE_KEYS.printers, defaultPrinters));
  const [filaments, setFilaments] = useState<Filament[]>(() => readStoredValue(STORAGE_KEYS.filaments, defaultFilaments));
  const [resins, setResins] = useState<ResinSupply[]>(() => readStoredValue(STORAGE_KEYS.resins, []));
  const [clients, setClients] = useState<Client[]>(() => readStoredValue(STORAGE_KEYS.clients, defaultClients));
  const [products, setProducts] = useState<Product[]>(() => readStoredValue(STORAGE_KEYS.products, defaultProducts));
  const [budgets, setBudgets] = useState<Budget[]>(() => readStoredValue(STORAGE_KEYS.budgets, []));
  const [financeEntries, setFinanceEntries] = useState<FinanceEntry[]>(() => readStoredValue(STORAGE_KEYS.financeEntries, []));
  const [calculatorDefaults, setCalculatorDefaults] = useState<CalculatorDefaults>(() => readStoredValue(STORAGE_KEYS.calculatorDefaults, defaultCalculatorDefaults));
  const [channels, setChannels] = useState<SalesChannel[]>(() => readStoredValue(STORAGE_KEYS.channels, []));
  const [catalogSettings, setCatalogSettings] = useState<CatalogSettings>(() => readStoredValue(STORAGE_KEYS.catalogSettings, defaultCatalogSettings));
  const [calculatorTemplates, setCalculatorTemplates] = useState<CalculatorTemplate[]>(() => readStoredValue(STORAGE_KEYS.calculatorTemplates, []));
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>(() => readStoredValue(STORAGE_KEYS.discountCodes, []));
  const [printQueue, setPrintQueue] = useState<PrintQueueItem[]>(() => readStoredValue(STORAGE_KEYS.printQueue, []));
  const [timeTracking, setTimeTracking] = useState<TimeTrackingEntry[]>(() => readStoredValue(STORAGE_KEYS.timeTracking, []));
  const [qualityControl, setQualityControl] = useState<QualityControlEntry[]>(() => readStoredValue(STORAGE_KEYS.qualityControl, []));
  const [activityLog, setActivityLog] = useState<ActivityLog[]>(() => readStoredValue(STORAGE_KEYS.activityLog, []));
  const [reminders, setReminders] = useState<Reminder[]>(() => readStoredValue(STORAGE_KEYS.reminders, []));
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(() => readStoredValue(STORAGE_KEYS.expenseCategories, [
    { id: 'ec1', name: 'Materiais', color: '#3b82f6', budget: 1000 },
    { id: 'ec2', name: 'Manutenção', color: '#ef4444', budget: 500 },
    { id: 'ec3', name: 'Software', color: '#8b5cf6', budget: 200 },
    { id: 'ec4', name: 'Marketing', color: '#f59e0b', budget: 300 },
    { id: 'ec5', name: 'Outros', color: '#6b7280', budget: 200 },
  ]));

  useEffect(() => {
    let isMounted = true;

    const syncCatalogFromServer = async () => {
      try {
        const remoteCatalog = await getCatalogAdminData();

        if (!isMounted) {
          return;
        }

        if (!remoteCatalog.fileExists) {
          await replaceCatalogAdminData({
            catalogSettings,
            products,
          });
          return;
        }

        setProducts(remoteCatalog.products);
        setCatalogSettings(remoteCatalog.catalogSettings);
      } catch (error) {
        notifyCatalogPublishError('sincronizar catálogo', error);
      }
    };

    void syncCatalogFromServer();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    writeStoredValue(STORAGE_KEYS.printers, printers);
    writeStoredValue(STORAGE_KEYS.filaments, filaments);
    writeStoredValue(STORAGE_KEYS.resins, resins);
    writeStoredValue(STORAGE_KEYS.clients, clients);
    writeStoredValue(STORAGE_KEYS.products, products);
    writeStoredValue(STORAGE_KEYS.budgets, budgets);
    writeStoredValue(STORAGE_KEYS.financeEntries, financeEntries);
    writeStoredValue(STORAGE_KEYS.calculatorDefaults, calculatorDefaults);
    writeStoredValue(STORAGE_KEYS.channels, channels);
    writeStoredValue(STORAGE_KEYS.catalogSettings, catalogSettings);
    writeStoredValue(STORAGE_KEYS.calculatorTemplates, calculatorTemplates);
    writeStoredValue(STORAGE_KEYS.discountCodes, discountCodes);
    writeStoredValue(STORAGE_KEYS.printQueue, printQueue);
    writeStoredValue(STORAGE_KEYS.timeTracking, timeTracking);
    writeStoredValue(STORAGE_KEYS.qualityControl, qualityControl);
    writeStoredValue(STORAGE_KEYS.activityLog, activityLog);
    writeStoredValue(STORAGE_KEYS.reminders, reminders);
    writeStoredValue(STORAGE_KEYS.expenseCategories, expenseCategories);
  }, [
    printers,
    filaments,
    resins,
    clients,
    products,
    budgets,
    financeEntries,
    calculatorDefaults,
    channels,
    catalogSettings,
    calculatorTemplates,
    discountCodes,
    printQueue,
    timeTracking,
    qualityControl,
    activityLog,
    reminders,
    expenseCategories,
  ]);

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

  const updateClient = (id: string, data: Partial<Omit<Client, 'id'>>) => {
    setClients((currentClients) =>
      currentClients.map((client) => (client.id === id ? { ...client, ...data } : client))
    );
  };

  const deleteClient = (clientId: string) => {
    setClients((currentClients) => currentClients.filter((client) => client.id !== clientId));
  };

  const addProduct = (data: Omit<Product, 'id'>) => {
    const newProduct = { ...data, id: uuidv4() };
    setProducts((currentProducts) => [...currentProducts, newProduct]);
    void saveCatalogProduct(newProduct).catch((error) => {
      notifyCatalogPublishError('publicar produto', error);
    });
    return newProduct;
  };

  const addBudget = (data: Omit<Budget, 'id'>) => {
    const newBudget = { ...data, id: uuidv4() };
    setBudgets((currentBudgets) => [newBudget, ...currentBudgets]);
    return newBudget;
  };

  const addFinanceEntry = (data: Omit<FinanceEntry, 'id'>) => {
    const newEntry = {
      ...data,
      id: uuidv4(),
      recurrence: data.recurrence ?? 'Unica',
    };
    setFinanceEntries((currentEntries) => [newEntry, ...currentEntries]);
    return newEntry;
  };

  const removeFinanceEntry = (entryId: string) => {
    setFinanceEntries((currentEntries) => currentEntries.filter((entry) => entry.id !== entryId));
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
    void deleteCatalogProduct(productId).catch((error) => {
      notifyCatalogPublishError('remover produto', error);
    });
  };

  const updateProduct = (id: string, data: Partial<Omit<Product, 'id'>>) => {
    setProducts((currentProducts) => {
      const nextProducts = currentProducts.map((product) =>
        product.id === id ? { ...product, ...data } : product,
      );
      const nextProduct = nextProducts.find((product) => product.id === id);

      if (nextProduct) {
        void saveCatalogProduct(nextProduct).catch((error) => {
          notifyCatalogPublishError('atualizar produto', error);
        });
      }

      return nextProducts;
    });
  };

  const updateCalculatorDefaults = (settings: Partial<CalculatorDefaults>) => {
    setCalculatorDefaults((prev) => {
      const next = { ...prev, ...settings };
      const hasChanges = (Object.keys(next) as Array<keyof CalculatorDefaults>).some(
        (key) => prev[key] !== next[key],
      );

      return hasChanges ? next : prev;
    });
  };

  const updateCatalogSettings = (settings: Partial<CatalogSettings>) => {
    setCatalogSettings((prev) => {
      const nextSettings = { ...prev, ...settings };
      void saveCatalogSettings(nextSettings).catch((error) => {
        notifyCatalogPublishError('atualizar configurações do catálogo', error);
      });
      return nextSettings;
    });
  };

  const addCalculatorTemplate = (data: Omit<CalculatorTemplate, 'id'>) => {
    const newTemplate = { ...data, id: uuidv4() };
    setCalculatorTemplates((currentTemplates) => [...currentTemplates, newTemplate]);
    return newTemplate;
  };

  const removeCalculatorTemplate = (templateId: string) => {
    setCalculatorTemplates((currentTemplates) => currentTemplates.filter((template) => template.id !== templateId));
  };

  const addDiscountCode = (data: Omit<DiscountCode, 'id'>) => {
    const newCode = { ...data, id: uuidv4() };
    setDiscountCodes((currentCodes) => [...currentCodes, newCode]);
    return newCode;
  };

  const updateDiscountCode = (id: string, data: Partial<Omit<DiscountCode, 'id'>>) => {
    setDiscountCodes((currentCodes) =>
      currentCodes.map((code) => (code.id === id ? { ...code, ...data } : code))
    );
  };

  const removeDiscountCode = (codeId: string) => {
    setDiscountCodes((currentCodes) => currentCodes.filter((code) => code.id !== codeId));
  };

  const addPrintQueueItem = (data: Omit<PrintQueueItem, 'id'>) => {
    const newItem = { ...data, id: uuidv4() };
    setPrintQueue((currentQueue) => [...currentQueue, newItem]);
    return newItem;
  };

  const updatePrintQueueItem = (id: string, data: Partial<Omit<PrintQueueItem, 'id'>>) => {
    setPrintQueue((currentQueue) =>
      currentQueue.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
  };

  const removePrintQueueItem = (itemId: string) => {
    setPrintQueue((currentQueue) => currentQueue.filter((item) => item.id !== itemId));
  };

  const addTimeTrackingEntry = (data: Omit<TimeTrackingEntry, 'id'>) => {
    const newEntry = { ...data, id: uuidv4() };
    setTimeTracking((currentTracking) => [...currentTracking, newEntry]);
    return newEntry;
  };

  const updateTimeTrackingEntry = (id: string, data: Partial<Omit<TimeTrackingEntry, 'id'>>) => {
    setTimeTracking((currentTracking) =>
      currentTracking.map((entry) => (entry.id === id ? { ...entry, ...data } : entry))
    );
  };

  const addQualityControlEntry = (data: Omit<QualityControlEntry, 'id'>) => {
    const newEntry = { ...data, id: uuidv4() };
    setQualityControl((currentQC) => [...currentQC, newEntry]);
    return newEntry;
  };

  const addActivityLog = (data: Omit<ActivityLog, 'id'>) => {
    const newLog = { ...data, id: uuidv4(), timestamp: data.timestamp || new Date().toISOString() };
    setActivityLog((currentLog) => [newLog, ...currentLog].slice(0, 100)); // Keep last 100 entries
    return newLog;
  };

  const addReminder = (data: Omit<Reminder, 'id'>) => {
    const newReminder = { ...data, id: uuidv4() };
    setReminders((currentReminders) => [...currentReminders, newReminder]);
    return newReminder;
  };

  const updateReminder = (id: string, data: Partial<Omit<Reminder, 'id'>>) => {
    setReminders((currentReminders) =>
      currentReminders.map((reminder) => (reminder.id === id ? { ...reminder, ...data } : reminder))
    );
  };

  const removeReminder = (reminderId: string) => {
    setReminders((currentReminders) => currentReminders.filter((reminder) => reminder.id !== reminderId));
  };

  const addExpenseCategory = (data: Omit<ExpenseCategory, 'id'>) => {
    const newCategory = { ...data, id: uuidv4() };
    setExpenseCategories((currentCategories) => [...currentCategories, newCategory]);
    return newCategory;
  };

  const updateExpenseCategory = (id: string, data: Partial<Omit<ExpenseCategory, 'id'>>) => {
    setExpenseCategories((currentCategories) =>
      currentCategories.map((category) => (category.id === id ? { ...category, ...data } : category))
    );
  };

  const removeExpenseCategory = (categoryId: string) => {
    setExpenseCategories((currentCategories) => currentCategories.filter((category) => category.id !== categoryId));
  };

  const value = useMemo<StoreContextValue>(
    () => ({
      printers,
      filaments,
      resins,
      clients,
      products,
      budgets,
      financeEntries,
      calculatorDefaults,
      channels,
      catalogSettings,
      setCatalogSettings,
      calculatorTemplates,
      discountCodes,
      printQueue,
      timeTracking,
      qualityControl,
      activityLog,
      reminders,
      expenseCategories,
      addPrinter,
      addFilament,
      addResin,
      addClient,
      updateClient,
      deleteClient,
      addProduct,
      updateProduct,
      addBudget,
      addFinanceEntry,
      removeFinanceEntry,
      addChannel,
      updateBudgetStatus,
      deleteBudget,
      removeProduct,
      updateCalculatorDefaults,
      updateCatalogSettings,
      addCalculatorTemplate,
      removeCalculatorTemplate,
      addDiscountCode,
      updateDiscountCode,
      removeDiscountCode,
      addPrintQueueItem,
      updatePrintQueueItem,
      removePrintQueueItem,
      addTimeTrackingEntry,
      updateTimeTrackingEntry,
      addQualityControlEntry,
      addActivityLog,
      addReminder,
      updateReminder,
      removeReminder,
      addExpenseCategory,
      updateExpenseCategory,
      removeExpenseCategory,
    }),
    [
      printers,
      filaments,
      resins,
      clients,
      products,
      budgets,
      financeEntries,
      calculatorDefaults,
      channels,
      catalogSettings,
      calculatorTemplates,
      discountCodes,
      printQueue,
      timeTracking,
      qualityControl,
      activityLog,
      reminders,
      expenseCategories,
    ],
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
