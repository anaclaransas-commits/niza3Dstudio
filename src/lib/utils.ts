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

type DecimalInput = number | string;

type DecimalValue = {
  value: bigint;
  scale: number;
};

const TEN_POWERS = new Map<number, bigint>([[0, 1n]]);

function getPowerOfTen(exponent: number) {
  const cached = TEN_POWERS.get(exponent);
  if (cached) {
    return cached;
  }

  let result = 1n;
  for (let index = 0; index < exponent; index += 1) {
    result *= 10n;
  }

  TEN_POWERS.set(exponent, result);
  return result;
}

function normalizeDecimalInput(value: DecimalInput) {
  let normalizedValue = String(value ?? "").trim();
  if (!normalizedValue) {
    return "";
  }

  normalizedValue = normalizedValue.replace(/\s+/g, "");

  if (normalizedValue.includes(",") && normalizedValue.includes(".")) {
    normalizedValue = normalizedValue.replace(/\./g, "").replace(",", ".");
  } else {
    normalizedValue = normalizedValue.replace(",", ".");
  }

  return /^[+-]?\d*(\.\d*)?$/.test(normalizedValue) ? normalizedValue : "";
}

function parseDecimal(value: DecimalInput): DecimalValue {
  const normalizedValue = normalizeDecimalInput(value);
  if (!normalizedValue) {
    return { value: 0n, scale: 0 };
  }

  const isNegative = normalizedValue.startsWith("-");
  const unsignedValue = normalizedValue.replace(/^[+-]/, "");
  const [integerPart = "0", fractionPart = ""] = unsignedValue.split(".");
  const trimmedFraction = fractionPart.replace(/0+$/, "");
  const digits = `${integerPart || "0"}${trimmedFraction}`.replace(/^0+(?=\d)/, "") || "0";
  const signedDigits = isNegative && digits !== "0" ? `-${digits}` : digits;

  return {
    value: BigInt(signedDigits),
    scale: trimmedFraction.length,
  };
}

function clampToNonNegative(decimalValue: DecimalValue) {
  if (decimalValue.value < 0n) {
    return { value: 0n, scale: decimalValue.scale };
  }

  return decimalValue;
}

function alignDecimalScale(firstValue: DecimalValue, secondValue: DecimalValue): [DecimalValue, DecimalValue] {
  if (firstValue.scale === secondValue.scale) {
    return [firstValue, secondValue];
  }

  if (firstValue.scale > secondValue.scale) {
    const scaleDiff = firstValue.scale - secondValue.scale;
    return [
      firstValue,
      {
        value: secondValue.value * getPowerOfTen(scaleDiff),
        scale: firstValue.scale,
      },
    ];
  }

  const scaleDiff = secondValue.scale - firstValue.scale;
  return [
    {
      value: firstValue.value * getPowerOfTen(scaleDiff),
      scale: secondValue.scale,
    },
    secondValue,
  ];
}

function addDecimalValues(firstValue: DecimalValue, secondValue: DecimalValue) {
  const [normalizedFirstValue, normalizedSecondValue] = alignDecimalScale(firstValue, secondValue);

  return {
    value: normalizedFirstValue.value + normalizedSecondValue.value,
    scale: normalizedFirstValue.scale,
  };
}

function multiplyDecimalValues(firstValue: DecimalValue, secondValue: DecimalValue) {
  return {
    value: firstValue.value * secondValue.value,
    scale: firstValue.scale + secondValue.scale,
  };
}

function divideDecimalByPowerOfTen(decimalValue: DecimalValue, exponent: number) {
  return {
    value: decimalValue.value,
    scale: decimalValue.scale + exponent,
  };
}

function roundDecimalValue(decimalValue: DecimalValue, precision: number) {
  if (decimalValue.scale <= precision) {
    return decimalValue;
  }

  const divisor = getPowerOfTen(decimalValue.scale - precision);
  const absoluteValue = decimalValue.value < 0n ? -decimalValue.value : decimalValue.value;
  const quotient = absoluteValue / divisor;
  const remainder = absoluteValue % divisor;
  const roundedQuotient = remainder * 2n >= divisor ? quotient + 1n : quotient;

  return {
    value: decimalValue.value < 0n ? -roundedQuotient : roundedQuotient,
    scale: precision,
  };
}

function decimalValueToNumber(decimalValue: DecimalValue, precision = 6) {
  const roundedValue = roundDecimalValue(decimalValue, precision);
  const sign = roundedValue.value < 0n ? "-" : "";
  const absoluteDigits = (roundedValue.value < 0n ? -roundedValue.value : roundedValue.value).toString();

  if (roundedValue.scale === 0) {
    return Number(`${sign}${absoluteDigits}`);
  }

  const paddedDigits = absoluteDigits.padStart(roundedValue.scale + 1, "0");
  const integerDigits = paddedDigits.slice(0, -roundedValue.scale) || "0";
  const fractionDigits = paddedDigits.slice(-roundedValue.scale);

  return Number(`${sign}${integerDigits}.${fractionDigits}`);
}

export function parseLocalizedNumber(value: DecimalInput, fallback = 0) {
  const normalizedValue = normalizeDecimalInput(value);
  if (!normalizedValue) {
    return fallback;
  }

  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

export function roundCurrencyValue(value: number, precision = 2) {
  const multiplier = 10 ** precision;
  return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
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
  pricePerKg: DecimalInput;
  weightG: DecimalInput;
  printTimeHours: DecimalInput;
  powerConsumptionW: DecimalInput;
  energyPriceKWh: DecimalInput;
  laborCostFixed: DecimalInput;
  fixedCostPerPiece: DecimalInput;
  profitMarginPercent: DecimalInput;
  quantity: DecimalInput;
}) {
  const {
    pricePerKg,
    weightG,
    printTimeHours,
    powerConsumptionW,
    energyPriceKWh,
    laborCostFixed,
    fixedCostPerPiece,
    profitMarginPercent,
    quantity,
  } = params;

  const quantityValue = Math.max(1, Math.floor(parseLocalizedNumber(quantity, 1)));
  const pricePerKgValue = clampToNonNegative(parseDecimal(pricePerKg));
  const weightValue = clampToNonNegative(parseDecimal(weightG));
  const printTimeValue = clampToNonNegative(parseDecimal(printTimeHours));
  const powerConsumptionValue = clampToNonNegative(parseDecimal(powerConsumptionW));
  const energyPriceValue = clampToNonNegative(parseDecimal(energyPriceKWh));
  const laborCostFixedValue = clampToNonNegative(parseDecimal(laborCostFixed));
  const fixedCostValue = clampToNonNegative(parseDecimal(fixedCostPerPiece));
  const profitMarginValue = clampToNonNegative(parseDecimal(profitMarginPercent));

  // Custo do filamento: (preço/kg ÷ 1000) × gramas
  const unitMaterialCost = roundDecimalValue(
    divideDecimalByPowerOfTen(multiplyDecimalValues(pricePerKgValue, weightValue), 3),
    6,
  );

  // Custo de energia: (W ÷ 1000) × horas × R$/kWh
  const unitEnergyCost = roundDecimalValue(
    divideDecimalByPowerOfTen(
      multiplyDecimalValues(
        multiplyDecimalValues(powerConsumptionValue, printTimeValue),
        energyPriceValue,
      ),
      3,
    ),
    6,
  );

  // Mão de obra: valor fixo por peça (não por hora)
  const unitLaborCost = roundDecimalValue(laborCostFixedValue, 6);

  // Custos fixos: valor fixo por peça (desgaste, acabamento, etc.)
  const unitFixedCost = roundDecimalValue(fixedCostValue, 6);

  // Custo total = filamento + energia + mão de obra (fixo) + custos fixos (fixo)
  const unitTotalCost = roundDecimalValue(
    addDecimalValues(
      addDecimalValues(unitMaterialCost, unitEnergyCost),
      addDecimalValues(unitLaborCost, unitFixedCost),
    ),
    6,
  );

  // Lucro = custo total × margem%
  const unitProfit = roundDecimalValue(
    divideDecimalByPowerOfTen(multiplyDecimalValues(unitTotalCost, profitMarginValue), 2),
    6,
  );

  // Preço final = custo total + lucro
  const unitFinalPrice = roundDecimalValue(addDecimalValues(unitTotalCost, unitProfit), 6);

  const quantityDecimal = parseDecimal(quantityValue);
  const batchTotalCost = roundDecimalValue(multiplyDecimalValues(unitTotalCost, quantityDecimal), 6);
  const batchFinalPrice = roundDecimalValue(multiplyDecimalValues(unitFinalPrice, quantityDecimal), 6);
  const batchTotalProfit = roundDecimalValue(multiplyDecimalValues(unitProfit, quantityDecimal), 6);

  return {
    unitMaterialCost: decimalValueToNumber(unitMaterialCost),
    unitEnergyCost: decimalValueToNumber(unitEnergyCost),
    unitLaborCost: decimalValueToNumber(unitLaborCost),
    unitFixedCost: decimalValueToNumber(unitFixedCost),
    unitTotalCost: decimalValueToNumber(unitTotalCost),
    unitFinalPrice: decimalValueToNumber(unitFinalPrice),
    unitProfit: decimalValueToNumber(unitProfit),
    batchTotalCost: decimalValueToNumber(batchTotalCost),
    batchFinalPrice: decimalValueToNumber(batchFinalPrice),
    batchTotalProfit: decimalValueToNumber(batchTotalProfit),
  };
}
