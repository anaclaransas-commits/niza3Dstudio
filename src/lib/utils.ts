/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type Budget, type BudgetStatus } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function isApprovedBudget(status: BudgetStatus) {
  return status === "Aprovado" || status === "Concluido";
}

export function getBudgetQuantity(budget: Pick<Budget, "quantity" | "price" | "calculation">) {
  if (budget.quantity && budget.quantity > 0) {
    return budget.quantity;
  }

  const unitPrice = budget.calculation?.unitFinalPrice ?? 0;
  if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
    return 1;
  }

  const inferredQuantity = Math.round(budget.price / unitPrice);
  return inferredQuantity > 0 ? inferredQuantity : 1;
}

function escapeCsvCell(value: string | number | boolean | null | undefined) {
  const normalizedValue = value == null ? "" : String(value);
  if (/[;"\n]/.test(normalizedValue)) {
    return `"${normalizedValue.replace(/"/g, '""')}"`;
  }

  return normalizedValue;
}

export function downloadCsvFile(
  filename: string,
  rows: Array<Array<string | number | boolean | null | undefined>>,
) {
  if (typeof window === "undefined") {
    return;
  }

  const csvContent = rows
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(";"))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function calculate3DPrintCost(params: {
  pricePerKg: number;
  weightG: number;
  printTimeHours: number;
  powerConsumptionW: number;
  energyPriceKWh: number;
  failureRatePercent: number;
  laborRatePerHour: number;
  profitMarginPercent: number;
  maintenanceCostPerHour: number;
  quantity: number;
}) {
  const {
    pricePerKg,
    weightG,
    printTimeHours,
    powerConsumptionW,
    energyPriceKWh,
    failureRatePercent,
    laborRatePerHour,
    profitMarginPercent,
    maintenanceCostPerHour,
    quantity
  } = params;

  // Unit costs
  const unitMaterialCost = (pricePerKg / 1000) * weightG;
  const unitEnergyCost = (powerConsumptionW / 1000) * printTimeHours * energyPriceKWh;
  const unitLaborCost = printTimeHours * laborRatePerHour;
  const unitMaintCost = printTimeHours * maintenanceCostPerHour;
  
  const unitSubTotal = unitMaterialCost + unitEnergyCost + unitLaborCost + unitMaintCost;
  const unitFailureCost = unitSubTotal * (failureRatePercent / 100);
  const unitTotalCost = unitSubTotal + unitFailureCost;
  
  const unitProfit = unitTotalCost * (profitMarginPercent / 100);
  const unitFinalPrice = unitTotalCost + unitProfit;

  // Batch totals
  return {
    unitMaterialCost,
    unitEnergyCost,
    unitFailureCost,
    unitLaborCost,
    unitMaintCost,
    unitTotalCost,
    unitFinalPrice,
    unitProfit,
    batchTotalCost: unitTotalCost * quantity,
    batchFinalPrice: unitFinalPrice * quantity,
    batchTotalProfit: unitProfit * quantity
  };
}
