/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Printer {
  id: string;
  name: string;
  brand: string;
  model: string;
  powerConsumption: number; // Watts
  purchasePrice: number;
  maintenanceCostPerHour: number;
}

export interface Filament {
  id: string;
  name: string;
  brand: string;
  material: "PLA" | "ABS" | "PETG" | "SLA" | "TPU" | "Other";
  weightKg: number;
  pricePerKg: number;
  color: string;
}

export interface ResinSupply {
  id: string;
  name: string;
  brand: string;
  type: "Resin" | "Supply";
  volumeMl?: number;
  pricePerUnit: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  address?: string;
  notes?: string;
  loyaltyTier?: 'Novo' | 'Regular' | 'Frequente' | 'VIP';
  totalOrders?: number;
  totalRevenue?: number;
  discountPercent?: number;
  preferences?: string;
  paymentTerms?: string;
}

export interface Product {
  id: string;
  name: string;
  materialType: string;
  description: string;
  collection?: string;
  sourcePath?: string;
  imageUrl?: string;
  /** Imagens adicionais da galeria (a capa fica em imageUrl). */
  imageUrls?: string[];
  defaultWeightG?: number;
  basePrice?: number;
  stlUrl?: string;
  referenceUrl?: string;
  avgPrintTimeHours?: number;
  tags?: string;
  isPublic?: boolean;
  isFeatured?: boolean;
  variants?: ProductVariant[];
  discountCodes?: string[];
  dimensions?: string; // Tamanho do produto (ex: "4cm x 4cm")
  /** Campos específicos para filtros do catálogo */
  tipo?: string;
  ambiente?: string;
  material?: string;
  público?: string;
  estilo?: string;
  ocasião?: string;
  coleção?: string;
}

export interface CatalogSettings {
  businessName: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  logoUrl?: string;
  coverImageUrl?: string;
  announcementText?: string;
  heroDescription?: string;
  highlightOne?: string;
  highlightTwo?: string;
  highlightThree?: string;
  catalogHeadline?: string;
  catalogSubheadline?: string;
  aboutTitle?: string;
  aboutText?: string;
  contactHeadline?: string;
  contactText?: string;
  primaryCtaLabel?: string;
  primaryCtaUrl?: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
  whatsapp?: string;
  instagram?: string;
  email?: string;
  footerNote?: string;
  emailNotifications?: {
    enabled: boolean;
    recipientEmail?: string;
    notifyOnNewQuote?: boolean;
    notifyOnOrder?: boolean;
  };
  ecommerceIntegration?: {
    enabled: boolean;
    platform?: 'shopify' | 'mercadolivre';
    apiKey?: string;
    storeUrl?: string;
  };
}

export interface CalculationResult {
  unitMaterialCost: number;
  unitEnergyCost: number;
  unitLaborCost: number;
  unitFixedCost: number;
  unitTotalCost: number;
  unitFinalPrice: number;
  unitProfit: number;
  batchTotalCost: number;
  batchFinalPrice: number;
  batchTotalProfit: number;
}

export interface CalculatorDefaults {
  selectedFilamentId: string;
  selectedPrinterId: string;
  manualFilamentPrice: string;
  manualPowerConsumptionW: string;
  energyPriceKWh: string;
  laborCostFixed: string;
  fixedCostPerPiece: string;
  margin: string;
  quantity: string;
}

export type AnalyticsRange = "7d" | "30d" | "90d" | "12m" | "all";

export type FinanceEntryType = "Receita" | "Despesa";
export type FinanceEntryRecurrence = "Unica" | "Mensal";

export interface FinanceEntry {
  id: string;
  title: string;
  category: string;
  type: FinanceEntryType;
  amount: number;
  date: string;
  recurrence?: FinanceEntryRecurrence;
  notes?: string;
}

export type BudgetStatus = "Pendente" | "Aprovado" | "Recusado" | "Concluido";

export interface Budget {
  id: string;
  clientId: string;
  productId: string;
  printerId: string;
  filamentId: string;
  status: BudgetStatus;
  date: string;
  printTimeHours: number;
  weightG: number;
  quantity?: number;
  price: number;
  profit: number;
  calculation: CalculationResult;
}

export interface SalesChannel {
  id: string;
  name: string;
  feePercentage: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  size?: string;
  color?: string;
  material?: string;
  priceAdjustment: number;
  defaultWeightG?: number;
}

export interface DiscountCode {
  id: string;
  code: string;
  discountPercent: number;
  minOrderValue?: number;
  maxUses?: number;
  currentUses?: number;
  validUntil?: string;
  applicableClients?: string[];
  applicableProducts?: string[];
  isActive: boolean;
}

export interface CalculatorTemplate {
  id: string;
  name: string;
  filamentId: string;
  printerId: string;
  weightG: number;
  printTimeHours: number;
  margin: number;
  laborCostFixed: number;
  fixedCostPerPiece: number;
  quantity: number;
}

export interface PrintQueueItem {
  id: string;
  budgetId: string;
  printerId: string;
  status: 'queued' | 'printing' | 'completed' | 'paused';
  priority: 'low' | 'normal' | 'high';
  estimatedStartTime?: string;
  estimatedCompletionTime?: string;
  actualStartTime?: string;
  actualCompletionTime?: string;
  progress?: number;
}

export interface TimeTrackingEntry {
  id: string;
  budgetId: string;
  estimatedHours: number;
  actualHours?: number;
  difference?: number;
  notes?: string;
}

export interface QualityControlEntry {
  id: string;
  budgetId: string;
  pass: boolean;
  photos?: string[];
  notes?: string;
  issues?: string[];
  inspector?: string;
  date: string;
}

export interface ActivityLog {
  id: string;
  type: 'sale' | 'approval' | 'production' | 'client' | 'system';
  description: string;
  entityId?: string;
  entityType?: string;
  timestamp: string;
  userId?: string;
}

export interface Reminder {
  id: string;
  budgetId: string;
  type: 'follow_up' | 'payment' | 'production';
  scheduledDate: string;
  sent: boolean;
  notes?: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  color: string;
  budget?: number;
}
