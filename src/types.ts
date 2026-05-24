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
}

export interface Product {
  id: string;
  name: string;
  materialType: string;
  description: string;
  collection?: string;
  sourcePath?: string;
  imageUrl?: string;
  defaultWeightG?: number;
  basePrice?: number;
  stlUrl?: string;
  referenceUrl?: string;
  avgPrintTimeHours?: number;
  tags?: string;
  isPublic?: boolean;
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
