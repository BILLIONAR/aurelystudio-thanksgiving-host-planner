import test from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_LIMITS, DEMO_STORAGE_KEY, demoLimitExceeded, demoState } from '../src/demo.ts';
import { STORAGE_KEY, budgetTotals, confirmedCount, freshState, normalizeState, upcomingThanksgiving } from '../src/model.ts';

test('Demo starts with one valid, dated sample gathering and meaningful dashboard data', () => {
  const state = demoState();
  assert.equal(state.gatherings.length, 1);
  assert.equal(state.gatherings[0].date, upcomingThanksgiving());
  assert.equal(normalizeState(JSON.parse(JSON.stringify(state))).selected, state.gatherings[0].id);
  const event = state.gatherings[0];
  assert.ok(confirmedCount(event) >= 8);
  assert.ok(event.dishes.length >= 5);
  assert.ok(event.tasks.some(task => task.done) && event.tasks.some(task => !task.done));
  assert.ok(budgetTotals(event).actual > 0);
  assert.ok(event.orders.length && event.notebook.length && event.inventory.length);
  assert.equal(demoLimitExceeded(event), null);
});

test('Demo data stays separate and caps only extra entries', () => {
  assert.notEqual(DEMO_STORAGE_KEY, STORAGE_KEY);
  assert.equal(freshState().gatherings[0].guests.length, 0);
  const event = structuredClone(demoState().gatherings[0]);
  event.guests.push({ ...event.guests[0], id: 'one-more' });
  assert.equal(demoLimitExceeded(event), null);
  event.guests.push({ ...event.guests[0], id: 'over-limit' });
  assert.equal(event.guests.length, DEMO_LIMITS.guests + 1);
  assert.equal(demoLimitExceeded(event), 'guests');
});
