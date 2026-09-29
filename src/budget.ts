import { budgetTotals, confirmedCount, validDate, type Gathering } from './model.ts';

export const BUDGET_CATEGORIES = [
  { key: 'food', label: 'Food & drinks' },
  { key: 'decor', label: 'Table & decor' },
  { key: 'other', label: 'Other' },
  { key: 'orders', label: 'Orders' },
] as const;

export type BudgetCategory = typeof BUDGET_CATEGORIES[number]['key'];
export type BudgetRow = {
  id: string;
  name: string;
  category: BudgetCategory;
  estimatedCents: number;
  actualCents: number | null;
  spentOn: string;
};
export type CategoryBudget = {
  key: BudgetCategory;
  label: string;
  count: number;
  estimatedCents: number;
  actualCents: number;
  projectedCents: number;
};
export type SpendingDay = { date: string; payments: number; actualCents: number; cumulativeCents: number };

export function toCents(value: number) { return Math.round(value * 100); }
export function categoryForGrocery(aisle: string): BudgetCategory {
  return aisle === 'Table & home' ? 'decor' : aisle === 'Other' ? 'other' : 'food';
}
export function categoryForExpense(category: string): BudgetCategory {
  return category === 'Food & drinks' ? 'food' : ['Table & decor', 'Flowers', 'Supplies'].includes(category) ? 'decor' : 'other';
}

export function budgetAnalytics(event: Gathering) {
  const rows: BudgetRow[] = [
    ...event.groceries.filter(row => row.status !== 'In pantry').map(row => ({
      id: 'grocery:' + row.id, name: row.name, category: categoryForGrocery(row.aisle),
      estimatedCents: toCents(row.estimated), actualCents: row.actual == null ? null : toCents(row.actual), spentOn: validDate(row.spentOn) ? row.spentOn : '',
    })),
    ...event.expenses.map(row => ({
      id: 'expense:' + row.id, name: row.name, category: categoryForExpense(row.category),
      estimatedCents: toCents(row.estimated), actualCents: row.actual == null ? null : toCents(row.actual), spentOn: validDate(row.spentOn) ? row.spentOn : '',
    })),
    ...(event.orders ?? []).filter(row => row.includeInBudget && row.status !== 'Returned').map(row => ({
      id: 'order:' + row.id, name: row.name, category: 'orders' as const,
      estimatedCents: toCents(row.estimated), actualCents: row.actual == null ? null : toCents(row.actual), spentOn: validDate(row.spentOn) ? row.spentOn : '',
    })),
  ];
  const categories: CategoryBudget[] = BUDGET_CATEGORIES.map(category => {
    const categoryRows = rows.filter(row => row.category === category.key);
    return { ...category, count: categoryRows.length,
      estimatedCents: categoryRows.reduce((total, row) => total + row.estimatedCents, 0),
      actualCents: categoryRows.reduce((total, row) => total + (row.actualCents ?? 0), 0),
      projectedCents: categoryRows.reduce((total, row) => total + (row.actualCents ?? row.estimatedCents), 0),
    };
  });
  const totals = budgetTotals(event);
  const estimatedCents = toCents(totals.estimated);
  const actualCents = toCents(totals.actual);
  const projectedCents = categories.reduce((total, category) => total + category.projectedCents, 0);
  const roundedCap = toCents(event.budget);
  const capCents = roundedCap > 0 ? roundedCap : null;
  const actualRows = rows.filter(row => row.actualCents !== null);
  const datedRows = actualRows.filter(row => validDate(row.spentOn));
  const undatedRows = actualRows.filter(row => !validDate(row.spentOn));
  const days = new Map<string, { actualCents: number; payments: number }>();
  for (const row of datedRows) {
    const day = days.get(row.spentOn) ?? { actualCents: 0, payments: 0 };
    days.set(row.spentOn, { actualCents: day.actualCents + (row.actualCents ?? 0), payments: day.payments + 1 });
  }
  let cumulativeCents = 0;
  const spendingDays: SpendingDay[] = [...days].sort(([a], [b]) => a.localeCompare(b)).map(([date, day]) => {
    cumulativeCents += day.actualCents;
    return { date, ...day, cumulativeCents };
  });
  const people = confirmedCount(event);
  return {
    rows, categories, estimatedCents, actualCents, projectedCents, capCents,
    remainingCents: capCents === null ? null : capCents - actualCents,
    projectedRemainingCents: capCents === null ? null : capCents - projectedCents,
    projectedOverspendCents: capCents === null ? null : Math.max(0, projectedCents - capCents),
    budgetUsedPercent: capCents === null ? null : Number((actualCents / capCents * 100).toFixed(2)),
    actualRecordCount: actualRows.length, unpricedCount: rows.filter(row => row.actualCents === null && row.estimatedCents === 0).length,
    spendingDays, datedRecordCount: datedRows.length, datedActualCents: cumulativeCents,
    undatedRecordCount: undatedRows.length, undatedActualCents: undatedRows.reduce((total, row) => total + (row.actualCents ?? 0), 0),
    confirmedPeople: people,
    actualPerPersonCents: people ? Math.round(actualCents / people) : null,
    projectedPerPersonCents: people ? Math.round(projectedCents / people) : null,
  };
}

export type BudgetAnalytics = ReturnType<typeof budgetAnalytics>;
