import type {
  AnalyticsRange,
  Budget,
  Client,
  FinanceEntry,
  FinanceEntryRecurrence,
  Product,
} from '../types';
import { getBudgetQuantity, isApprovedBudget } from './utils';

export type MonthlyFinancialPoint = {
  monthKey: string;
  label: string;
  revenue: number;
  expenses: number;
  profit: number;
  orders: number;
  pieces: number;
};

export type BusinessMetrics = {
  approvedBudgets: Budget[];
  pendingBudgets: Budget[];
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  weekRevenue: number;
  weekExpenses: number;
  weekProfit: number;
  monthRevenue: number;
  monthExpenses: number;
  monthProfit: number;
  monthSalesCount: number;
  pendingCount: number;
  activeClientsThisMonth: number;
  averageTicketThisMonth: number;
  totalPiecesSold: number;
  totalPrintHours: number;
  totalWeight: number;
  recurringRevenueMonthly: number;
  recurringExpensesMonthly: number;
};

export type FinanceOccurrence = FinanceEntry & {
  sourceEntryId: string;
  recurrence: FinanceEntryRecurrence;
};

export type RangeSummary = {
  revenue: number;
  expenses: number;
  profit: number;
  salesCount: number;
  pendingCount: number;
  averageTicket: number;
  activeClients: number;
  piecesSold: number;
  printHours: number;
  totalWeight: number;
  extraEntriesCount: number;
  recurringRevenueMonthly: number;
  recurringExpensesMonthly: number;
};

function parseEntryDate(value: string) {
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date) {
  const normalizedDate = startOfDay(date);
  const day = normalizedDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  normalizedDate.setDate(normalizedDate.getDate() + diff);
  return normalizedDate;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function toDateInputValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function normalizeRecurrence(recurrence?: FinanceEntryRecurrence): FinanceEntryRecurrence {
  return recurrence === 'Mensal' ? 'Mensal' : 'Unica';
}

function addMonthsClamped(baseDate: Date, monthsToAdd: number) {
  const targetMonthIndex = baseDate.getMonth() + monthsToAdd;
  const targetYear = baseDate.getFullYear() + Math.floor(targetMonthIndex / 12);
  const normalizedMonth = ((targetMonthIndex % 12) + 12) % 12;
  const lastDayOfMonth = new Date(targetYear, normalizedMonth + 1, 0).getDate();
  const targetDay = Math.min(baseDate.getDate(), lastDayOfMonth);

  return new Date(targetYear, normalizedMonth, targetDay);
}

export function getRangeStart(range: AnalyticsRange, referenceDate = new Date()) {
  const today = startOfDay(referenceDate);

  switch (range) {
    case '7d':
      today.setDate(today.getDate() - 6);
      return today;
    case '30d':
      today.setDate(today.getDate() - 29);
      return today;
    case '90d':
      today.setDate(today.getDate() - 89);
      return today;
    case '12m':
      return new Date(today.getFullYear(), today.getMonth() - 11, 1);
    case 'all':
    default:
      return undefined;
  }
}

function isDateInRange(date: Date, range: AnalyticsRange, referenceDate = new Date()) {
  const rangeStart = getRangeStart(range, referenceDate);
  const rangeEnd = endOfDay(referenceDate);

  if (rangeStart && date < rangeStart) {
    return false;
  }

  return date <= rangeEnd;
}

function getMonthlyRecurringTotals(financeEntries: FinanceEntry[], referenceDate = new Date()) {
  return financeEntries.reduce(
    (totals, entry) => {
      const entryDate = parseEntryDate(entry.date);
      if (!entryDate || entryDate > referenceDate || normalizeRecurrence(entry.recurrence) !== 'Mensal') {
        return totals;
      }

      const amount = Math.max(0, entry.amount);
      if (entry.type === 'Receita') {
        totals.revenue += amount;
      } else {
        totals.expenses += amount;
      }

      return totals;
    },
    { revenue: 0, expenses: 0 },
  );
}

export function buildFinanceOccurrences(
  financeEntries: FinanceEntry[],
  options: { startDate?: Date; endDate?: Date } = {},
): FinanceOccurrence[] {
  const startDate = options.startDate ? startOfDay(options.startDate) : undefined;
  const endDate = endOfDay(options.endDate ?? new Date());

  return financeEntries.flatMap((entry) => {
    const baseDate = parseEntryDate(entry.date);
    if (!baseDate || baseDate > endDate) {
      return [];
    }

    const recurrence = normalizeRecurrence(entry.recurrence);

    if (recurrence === 'Unica') {
      if (startDate && baseDate < startDate) {
        return [];
      }

      return [{
        ...entry,
        date: toDateInputValue(baseDate),
        sourceEntryId: entry.id,
        recurrence,
      }];
    }

    let monthOffset = 0;
    if (startDate) {
      monthOffset = Math.max(
        0,
        (startDate.getFullYear() - baseDate.getFullYear()) * 12 + (startDate.getMonth() - baseDate.getMonth()),
      );
    }

    let occurrenceDate = addMonthsClamped(baseDate, monthOffset);
    while (startDate && occurrenceDate < startDate) {
      monthOffset += 1;
      occurrenceDate = addMonthsClamped(baseDate, monthOffset);
    }

    const occurrences: FinanceOccurrence[] = [];
    while (occurrenceDate <= endDate) {
      occurrences.push({
        ...entry,
        date: toDateInputValue(occurrenceDate),
        sourceEntryId: entry.id,
        recurrence,
      });
      monthOffset += 1;
      occurrenceDate = addMonthsClamped(baseDate, monthOffset);
    }

    return occurrences;
  });
}

export function getFinanceEntryOccurrencesInRange(
  entry: FinanceEntry,
  range: AnalyticsRange,
  referenceDate = new Date(),
) {
  return buildFinanceOccurrences([entry], {
    startDate: getRangeStart(range, referenceDate),
    endDate: referenceDate,
  }).length;
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'short',
    year: '2-digit',
  }).format(date).replace('.', '');
}

function getBudgetCost(budget: Budget) {
  return Math.max(0, budget.price - budget.profit);
}

function createMonthBuckets(totalMonths: number) {
  const today = new Date();
  const buckets = new Map<string, MonthlyFinancialPoint>();

  for (let index = totalMonths - 1; index >= 0; index -= 1) {
    const bucketDate = new Date(today.getFullYear(), today.getMonth() - index, 1);
    const monthKey = getMonthKey(bucketDate);

    buckets.set(monthKey, {
      monthKey,
      label: formatMonthLabel(bucketDate),
      revenue: 0,
      expenses: 0,
      profit: 0,
      orders: 0,
      pieces: 0,
    });
  }

  return buckets;
}

export function calculateBusinessMetrics(budgets: Budget[], financeEntries: FinanceEntry[]): BusinessMetrics {
  const today = new Date();
  const weekStart = startOfWeek(today);
  const monthStart = startOfMonth(today);
  const approvedBudgets = budgets.filter((budget) => isApprovedBudget(budget.status));
  const pendingBudgets = budgets.filter((budget) => budget.status === 'Pendente');
  const activeClients = new Set<string>();
  const financeOccurrences = buildFinanceOccurrences(financeEntries, { endDate: today });
  const recurringTotals = getMonthlyRecurringTotals(financeEntries, today);

  let totalRevenue = 0;
  let totalExpenses = 0;
  let weekRevenue = 0;
  let weekExpenses = 0;
  let monthRevenue = 0;
  let monthExpenses = 0;
  let monthSalesCount = 0;
  let monthSalesRevenue = 0;
  let totalPiecesSold = 0;
  let totalPrintHours = 0;
  let totalWeight = 0;

  approvedBudgets.forEach((budget) => {
    const budgetDate = parseEntryDate(budget.date);
    const quantity = getBudgetQuantity(budget);
    const cost = getBudgetCost(budget);

    totalRevenue += budget.price;
    totalExpenses += cost;
    totalPiecesSold += quantity;
    totalPrintHours += budget.printTimeHours * quantity;
    totalWeight += budget.weightG * quantity;

    if (!budgetDate) {
      return;
    }

    if (budgetDate >= weekStart) {
      weekRevenue += budget.price;
      weekExpenses += cost;
    }

    if (budgetDate >= monthStart) {
      monthRevenue += budget.price;
      monthExpenses += cost;
      monthSalesRevenue += budget.price;
      monthSalesCount += 1;

      if (budget.clientId) {
        activeClients.add(budget.clientId);
      }
    }
  });

  financeOccurrences.forEach((entry) => {
    const entryDate = parseEntryDate(entry.date);
    const amount = Math.max(0, entry.amount);
    const isRevenue = entry.type === 'Receita';

    totalRevenue += isRevenue ? amount : 0;
    totalExpenses += isRevenue ? 0 : amount;

    if (!entryDate) {
      return;
    }

    if (entryDate >= weekStart) {
      weekRevenue += isRevenue ? amount : 0;
      weekExpenses += isRevenue ? 0 : amount;
    }

    if (entryDate >= monthStart) {
      monthRevenue += isRevenue ? amount : 0;
      monthExpenses += isRevenue ? 0 : amount;
    }
  });

  const totalProfit = totalRevenue - totalExpenses;
  const weekProfit = weekRevenue - weekExpenses;
  const monthProfit = monthRevenue - monthExpenses;
  const averageTicketThisMonth = monthSalesCount > 0 ? monthSalesRevenue / monthSalesCount : 0;

  return {
    approvedBudgets,
    pendingBudgets,
    totalRevenue,
    totalExpenses,
    totalProfit,
    weekRevenue,
    weekExpenses,
    weekProfit,
    monthRevenue,
    monthExpenses,
    monthProfit,
    monthSalesCount,
    pendingCount: pendingBudgets.length,
    activeClientsThisMonth: activeClients.size,
    averageTicketThisMonth,
    totalPiecesSold,
    totalPrintHours,
    totalWeight,
    recurringRevenueMonthly: recurringTotals.revenue,
    recurringExpensesMonthly: recurringTotals.expenses,
  };
}

export function calculateRangeSummary(
  budgets: Budget[],
  financeEntries: FinanceEntry[],
  range: AnalyticsRange,
  referenceDate = new Date(),
): RangeSummary {
  const rangeStart = getRangeStart(range, referenceDate);
  const approvedBudgets = budgets.filter(
    (budget) => isApprovedBudget(budget.status) && (() => {
      const budgetDate = parseEntryDate(budget.date);
      return budgetDate ? isDateInRange(budgetDate, range, referenceDate) : false;
    })(),
  );
  const pendingCount = budgets.filter(
    (budget) => budget.status === 'Pendente' && (() => {
      const budgetDate = parseEntryDate(budget.date);
      return budgetDate ? isDateInRange(budgetDate, range, referenceDate) : range === 'all';
    })(),
  ).length;
  const financeOccurrences = buildFinanceOccurrences(financeEntries, {
    startDate: rangeStart,
    endDate: referenceDate,
  });
  const activeClients = new Set<string>();
  const recurringTotals = getMonthlyRecurringTotals(financeEntries, referenceDate);

  let revenue = 0;
  let expenses = 0;
  let salesCount = 0;
  let salesRevenue = 0;
  let piecesSold = 0;
  let printHours = 0;
  let totalWeight = 0;

  approvedBudgets.forEach((budget) => {
    const quantity = getBudgetQuantity(budget);
    revenue += budget.price;
    expenses += getBudgetCost(budget);
    salesCount += 1;
    salesRevenue += budget.price;
    piecesSold += quantity;
    printHours += budget.printTimeHours * quantity;
    totalWeight += budget.weightG * quantity;

    if (budget.clientId) {
      activeClients.add(budget.clientId);
    }
  });

  financeOccurrences.forEach((entry) => {
    const amount = Math.max(0, entry.amount);

    if (entry.type === 'Receita') {
      revenue += amount;
    } else {
      expenses += amount;
    }
  });

  return {
    revenue,
    expenses,
    profit: revenue - expenses,
    salesCount,
    pendingCount,
    averageTicket: salesCount > 0 ? salesRevenue / salesCount : 0,
    activeClients: activeClients.size,
    piecesSold,
    printHours,
    totalWeight,
    extraEntriesCount: financeOccurrences.length,
    recurringRevenueMonthly: recurringTotals.revenue,
    recurringExpensesMonthly: recurringTotals.expenses,
  };
}

export function buildMonthlyFinancialSeries(
  budgets: Budget[],
  financeEntries: FinanceEntry[],
  totalMonths = 6,
) {
  const monthBuckets = createMonthBuckets(totalMonths);
  const today = new Date();
  const firstVisibleMonth = new Date(today.getFullYear(), today.getMonth() - (totalMonths - 1), 1);
  const financeOccurrences = buildFinanceOccurrences(financeEntries, {
    startDate: firstVisibleMonth,
    endDate: today,
  });

  budgets.filter((budget) => isApprovedBudget(budget.status)).forEach((budget) => {
    const budgetDate = parseEntryDate(budget.date);
    if (!budgetDate) {
      return;
    }

    const bucket = monthBuckets.get(getMonthKey(budgetDate));
    if (!bucket) {
      return;
    }

    const quantity = getBudgetQuantity(budget);
    bucket.revenue += budget.price;
    bucket.expenses += getBudgetCost(budget);
    bucket.profit += budget.profit;
    bucket.orders += 1;
    bucket.pieces += quantity;
  });

  financeOccurrences.forEach((entry) => {
    const entryDate = parseEntryDate(entry.date);
    if (!entryDate) {
      return;
    }

    const bucket = monthBuckets.get(getMonthKey(entryDate));
    if (!bucket) {
      return;
    }

    const amount = Math.max(0, entry.amount);

    if (entry.type === 'Receita') {
      bucket.revenue += amount;
      bucket.profit += amount;
      return;
    }

    bucket.expenses += amount;
    bucket.profit -= amount;
  });

  return Array.from(monthBuckets.values());
}

export function buildExpenseBreakdown(
  budgets: Budget[],
  financeEntries: FinanceEntry[],
  range: AnalyticsRange = 'all',
  referenceDate = new Date(),
) {
  const totals = new Map<string, number>();
  const rangeStart = getRangeStart(range, referenceDate);
  const financeOccurrences = buildFinanceOccurrences(financeEntries, {
    startDate: rangeStart,
    endDate: referenceDate,
  });

  budgets
    .filter((budget) => isApprovedBudget(budget.status))
    .filter((budget) => {
      const budgetDate = parseEntryDate(budget.date);
      return budgetDate ? isDateInRange(budgetDate, range, referenceDate) : false;
    })
    .forEach((budget) => {
      const quantity = getBudgetQuantity(budget);
      const materialCost = (budget.calculation?.unitMaterialCost ?? 0) * quantity;
      const energyCost = (budget.calculation?.unitEnergyCost ?? 0) * quantity;
      const laborCost = (budget.calculation?.unitLaborCost ?? 0) * quantity;
      const fixedCost = (budget.calculation?.unitFixedCost ?? 0) * quantity;

      totals.set('Material', (totals.get('Material') ?? 0) + materialCost);
      totals.set('Energia', (totals.get('Energia') ?? 0) + energyCost);
      totals.set('Mão de obra', (totals.get('Mão de obra') ?? 0) + laborCost);
      totals.set('Custos fixos', (totals.get('Custos fixos') ?? 0) + fixedCost);
    });

  financeOccurrences
    .filter((entry) => entry.type === 'Despesa')
    .forEach((entry) => {
      const category = entry.category?.trim() || 'Despesas gerais';
      totals.set(category, (totals.get(category) ?? 0) + Math.max(0, entry.amount));
    });

  return Array.from(totals.entries())
    .map(([name, value]) => ({ name, value }))
    .filter((item) => item.value > 0)
    .sort((left, right) => right.value - left.value);
}

export function buildRecentSales(
  budgets: Budget[],
  clients: Client[],
  products: Product[],
  limit = 6,
  range: AnalyticsRange = 'all',
  referenceDate = new Date(),
) {
  return budgets
    .filter((budget) => isApprovedBudget(budget.status))
    .filter((budget) => {
      const budgetDate = parseEntryDate(budget.date);
      return budgetDate ? isDateInRange(budgetDate, range, referenceDate) : false;
    })
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
    .slice(0, limit)
    .map((budget) => ({
      ...budget,
      clientName: clients.find((client) => client.id === budget.clientId)?.name || 'Cliente avulso',
      productName: products.find((product) => product.id === budget.productId)?.name || 'Peça personalizada',
      quantity: getBudgetQuantity(budget),
    }));
}
