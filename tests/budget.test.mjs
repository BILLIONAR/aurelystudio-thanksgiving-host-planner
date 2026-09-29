import test from 'node:test';
import assert from 'node:assert/strict';
import { blankGathering, budgetTotals, freshState, normalizeState } from '../src/model.ts';
import { budgetAnalytics } from '../src/budget.ts';

const grocery = (id, patch = {}) => ({ id, name: id, aisle: 'Produce', status: 'Needed', estimated: 0, actual: null, spentOn: '', ...patch });
const expense = (id, patch = {}) => ({ id, name: id, category: 'Other', estimated: 0, actual: null, spentOn: '', ...patch });
const order = (id, patch = {}) => ({ id, name: id, status: 'Ordered', includeInBudget: true, estimated: 0, actual: null, spentOn: '', orderedOn: '', ...patch });

test('Budget analytics totals preserve exact cents and match the existing budget truth', () => {
  const event = blankGathering(); event.budget = 20;
  event.groceries = [grocery('a', { estimated: .1, actual: .1 }), grocery('b', { estimated: .2, actual: .2 }), grocery('pantry', { estimated: 50, actual: 50, status: 'In pantry' })];
  event.expenses = [expense('c', { estimated: 2.55, actual: 1.25 })];
  event.orders = [order('d', { estimated: 3.33, actual: 3.13 }), order('returned', { estimated: 9, actual: 9, status: 'Returned' }), order('separate', { estimated: 8, actual: 8, includeInBudget: false })];
  const data = budgetAnalytics(event); const truth = budgetTotals(event);
  assert.equal(data.estimatedCents, 618); assert.equal(data.actualCents, 468); assert.equal(data.remainingCents, 1532);
  assert.equal(data.estimatedCents / 100, truth.estimated); assert.equal(data.actualCents / 100, truth.actual); assert.equal(data.remainingCents / 100, truth.remaining);
  assert.equal(data.rows.length, 4); assert.equal(data.categories.reduce((n, c) => n + c.actualCents, 0), data.actualCents);
});

test('Projection replaces estimates with recorded actuals, including a genuine zero cost', () => {
  const event = blankGathering(); event.budget = 15;
  event.groceries = [grocery('free', { estimated: 10, actual: 0 }), grocery('unpaid', { estimated: 20, actual: null }), grocery('unpriced')];
  const data = budgetAnalytics(event);
  assert.equal(data.estimatedCents, 3000); assert.equal(data.actualCents, 0); assert.equal(data.projectedCents, 2000);
  assert.equal(data.projectedOverspendCents, 500); assert.equal(data.actualRecordCount, 1); assert.equal(data.unpricedCount, 1);
});

test('Categories consistently separate food, table supplies, other expenses and opted-in orders', () => {
  const event = blankGathering();
  event.groceries = [grocery('food', { aisle: 'Pantry', actual: 5 }), grocery('plates', { aisle: 'Table & home', actual: 2 }), grocery('other', { aisle: 'Other', actual: 1 })];
  event.expenses = [expense('food-extra', { category: 'Food & drinks', actual: 3 }), expense('flowers', { category: 'Flowers', actual: 4 }), expense('supplies', { category: 'Supplies', actual: 1 }), expense('other-extra', { category: 'Other', actual: 2 })];
  event.orders = [order('delivery', { actual: 6 })];
  const data = budgetAnalytics(event);
  assert.deepEqual(data.categories.map(c => [c.key, c.actualCents]), [['food', 800], ['decor', 700], ['other', 300], ['orders', 600]]);
});

test('Spending history aggregates only actual costs with valid spending dates, leaving other costs undated', () => {
  const event = blankGathering();
  event.groceries = [grocery('later', { actual: 2.2, spentOn: '2026-11-24' }), grocery('first', { actual: .1, spentOn: '2026-11-21' }), grocery('invalid', { actual: 1, spentOn: '2026-02-30' }), grocery('estimate-only', { estimated: 20, spentOn: '2026-11-20' })];
  event.expenses = [expense('same-day', { actual: .2, spentOn: '2026-11-21' }), expense('zero', { actual: 0, spentOn: '2026-11-24' })];
  event.orders = [order('order-date-is-not-payment-date', { actual: 5, orderedOn: '2026-11-19' }), order('dated-order', { actual: 3, spentOn: '2026-11-24' })];
  const data = budgetAnalytics(event);
  assert.deepEqual(data.spendingDays, [{ date: '2026-11-21', actualCents: 30, cumulativeCents: 30, payments: 2 }, { date: '2026-11-24', actualCents: 520, cumulativeCents: 550, payments: 3 }]);
  assert.equal(data.datedRecordCount, 5); assert.equal(data.undatedRecordCount, 2); assert.equal(data.undatedActualCents, 600);
  assert.equal(data.datedActualCents + data.undatedActualCents, data.actualCents);
});

test('Per-person costs use confirmed households and handle an unset cap or zero guests', () => {
  const event = blankGathering(); event.expenses = [expense('meal', { actual: 10, estimated: 12 })];
  let data = budgetAnalytics(event);
  assert.equal(data.actualPerPersonCents, null); assert.equal(data.capCents, null); assert.equal(data.budgetUsedPercent, null); assert.equal(data.projectedOverspendCents, null);
  event.guests = [{ adults: 2, children: 1, rsvp: 'Confirmed' }, { adults: 4, children: 0, rsvp: 'Invited' }];
  data = budgetAnalytics(event);
  assert.equal(data.confirmedPeople, 3); assert.equal(data.actualPerPersonCents, 333); assert.equal(data.projectedPerPersonCents, 333);
});

test('Budget pressure reports actual overspending and the future projection independently', () => {
  const event = blankGathering(); event.budget = 100;
  event.expenses = [expense('paid', { estimated: 90, actual: 110 }), expense('next', { estimated: 15 })];
  const data = budgetAnalytics(event);
  assert.equal(data.remainingCents, -1000); assert.equal(data.projectedCents, 12500); assert.equal(data.projectedOverspendCents, 2500); assert.equal(data.budgetUsedPercent, 110);
});

test('Spending dates round-trip in backups while old missing dates and invalid days stay undated', () => {
  const state = freshState(); const event = state.gatherings[0];
  event.groceries = [grocery('valid', { spentOn: '2026-11-21' }), grocery('old')]; delete event.groceries[1].spentOn;
  event.expenses = [expense('invalid', { spentOn: '2026-02-30' }), expense('historical', { spentOn: '2021-11-24' })];
  event.orders = [order('order', { spentOn: '2026-11-23' }), order('missing')]; delete event.orders[1].spentOn;
  const restored = normalizeState(JSON.parse(JSON.stringify(state))).gatherings[0];
  assert.deepEqual(restored.groceries.map(row => row.spentOn), ['2026-11-21', '']);
  assert.deepEqual(restored.expenses.map(row => row.spentOn), ['', '2021-11-24']);
  assert.deepEqual(restored.orders.map(row => row.spentOn), ['2026-11-23', '']);
});

test('A zero or sub-cent budget cannot produce division by zero', () => {
  const event = blankGathering(); event.budget = .001;
  const data = budgetAnalytics(event);
  assert.equal(data.capCents, null); assert.equal(data.budgetUsedPercent, null); assert.equal(data.projectedRemainingCents, null);
});
