import type { Budget, Client, FinanceEntry, Product } from '../types';
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

  financeEntries.forEach((entry) => {
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
  };
}

export function buildMonthlyFinancialSeries(
  budgets: Budget[],
  financeEntries: FinanceEntry[],
  totalMonths = 6,
) {
  const monthBuckets = createMonthBuckets(totalMonths);

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

  financeEntries.forEach((entry) => {
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

export function buildExpenseBreakdown(budgets: Budget[], financeEntries: FinanceEntry[]) {
  const totals = new Map<string, number>();

  budgets.filter((budget) => isApprovedBudget(budget.status)).forEach((budget) => {
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

  financeEntries
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
) {
  return budgets
    .filter((budget) => isApprovedBudget(budget.status))
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
    .slice(0, limit)
    .map((budget) => ({
      ...budget,
      clientName: clients.find((client) => client.id === budget.clientId)?.name || 'Cliente avulso',
      productName: products.find((product) => product.id === budget.productId)?.name || 'Peça personalizada',
      quantity: getBudgetQuantity(budget),
    }));
}
