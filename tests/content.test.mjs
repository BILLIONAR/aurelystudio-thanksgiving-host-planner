import test from 'node:test';
import assert from 'node:assert/strict';
import { APP_ID, STORAGE_KEY, VERSION, NOTEBOOK_SECTIONS, freshState, blankGathering, normalizeState, budgetTotals, prepTemplate, mergePrepTemplate, transferInventory, addDays } from '../src/model.ts';

const collections = ['activities', 'inventory', 'leftovers', 'orders', 'notebook'];
const clone = value => JSON.parse(JSON.stringify(value));

function populatedState() {
  const state = normalizeState(freshState());
  const gathering = state.gatherings[0];
  gathering.guests = [{ id: 'guest', name: 'Avery & family', adults: 2, children: 1, rsvp: 'Confirmed', dietary: 'Check the nut-free dessert', bringing: 'Apple pie', seat: 'Table 1', contact: 'avery@example.test', invitation: 'Sent', invitedOn: '2021-11-02' }];
  gathering.activities = [{ id: 'activity', title: 'Thankful story circle', category: 'Tradition', date: '2021-11-25', time: '17:30', owner: 'Avery', supplies: 'Prompt cards', notes: 'One memory each', link: 'https://example.test/prompts', done: false }];
  gathering.inventory = [{ id: 'inventory', name: 'Dinner plates', category: 'Table', have: 6, need: 10, unit: 'plates', source: 'Borrow from Avery', notes: 'Use matching sizes' }];
  gathering.leftovers = [{ id: 'leftover', name: 'Roasted vegetables', quantity: 3, unit: 'containers', storage: 'Send home', recipient: 'Avery', packedOn: '2021-11-25', plan: 'Give one container to each household', notes: 'Labels on the lids', status: 'Packed' }];
  gathering.orders = [{ id: 'order', name: 'Table napkins', store: 'Local shop', link: 'https://example.test/napkins', orderedOn: '2021-11-05', expectedOn: '2021-11-10', status: 'Arrived', estimated: 12.30, actual: 11.95, spentOn: '', includeInBudget: true, notes: 'Checked delivery' }];
  gathering.notebook = [{ id: 'note', section: 'Turkey plan', title: 'Our main dish', owner: 'Host', date: '2021-11-25', notes: 'Use our family recipe and its instructions', link: 'https://example.test/recipe' }];
  return state;
}

test('Existing version 1 backups retain history, preferences and guest notes with additive defaults', () => {
  const state = populatedState();
  const event = state.gatherings[0];
  event.date = '2021-11-25';
  event.decor = 'Grandma’s linen';
  event.nextYear = 'Make the pie a day earlier';
  event.memories = [{ id: 'memory', text: 'Everyone helped at the table.', date: '2021-11-25' }];
  event.tasks = [{ id: 'task', title: 'My existing edited task', date: '2021-11-24', owner: 'Avery', category: 'Home', done: true }];
  event.slots = [{ id: 'slot', title: 'Warm sides', date: '2021-11-25', time: '15:00', minutes: 30, resource: 'Oven 1', temperature: 'From the recipe', owner: 'Host', done: false }];
  for (const key of collections) delete event[key];
  delete event.guests[0].contact;
  delete event.guests[0].invitation;
  delete event.guests[0].invitedOn;
  const archived = clone(event);
  archived.id = 'archived';
  archived.title = 'Earlier family gathering';
  archived.date = '2020-11-26';
  state.gatherings.push(archived);
  state.selected = 'archived';
  state.profile = 'Sam';
  state.theme.main = '#782F45';
  state.theme.handwriting = 'Kalam';
  state.theme.coverage = 'Full Look';
  state.theme.night = true;
  const result = normalizeState(clone(state));
  assert.equal(APP_ID, 'aurelystudio-thanksgiving-host-planner');
  assert.equal(STORAGE_KEY, APP_ID + '-v1');
  assert.equal(VERSION, 1);
  assert.equal(result.selected, 'archived');
  assert.equal(result.profile, 'Sam');
  assert.deepEqual(result.theme, state.theme);
  assert.deepEqual(result.gatherings.map(g => g.date), ['2021-11-25', '2020-11-26']);
  assert.deepEqual(result.gatherings[0].tasks, event.tasks);
  assert.deepEqual(result.gatherings[0].slots, event.slots);
  assert.deepEqual(result.gatherings[0].memories, event.memories);
  assert.equal(result.gatherings[0].decor, event.decor);
  assert.equal(result.gatherings[0].nextYear, event.nextYear);
  assert.deepEqual(result.gatherings[0].guests[0], { ...event.guests[0], contact: '', invitation: 'To send', invitedOn: '' });
  for (const g of result.gatherings) for (const key of collections) assert.deepEqual(g[key], []);
});

test('Every added content record and invitation field survives a backup round trip', () => {
  const state = populatedState();
  state.gatherings[0].tasks = prepTemplate(state.gatherings[0]);
  assert.deepEqual(normalizeState(clone(state)), state);
  assert.equal(NOTEBOOK_SECTIONS.length, 16);
  assert.ok(NOTEBOOK_SECTIONS.includes('Invitation message'));
  assert.ok(NOTEBOOK_SECTIONS.includes('Black Friday / Cyber Monday'));
  assert.ok(NOTEBOOK_SECTIONS.includes('Thank-you notes'));
});

test('New content lists reject malformed rows and duplicate IDs rather than discarding them', () => {
  const original = populatedState();
  for (const key of collections) {
    const duplicate = clone(original);
    duplicate.gatherings[0][key].push(clone(duplicate.gatherings[0][key][0]));
    assert.throws(() => normalizeState(duplicate), /duplicate records/, key);
    const malformedList = clone(original);
    malformedList.gatherings[0][key] = { id: 'not-an-array' };
    assert.throws(() => normalizeState(malformedList), /invalid list/, key);
    const malformedRow = clone(original);
    malformedRow.gatherings[0][key] = [null];
    assert.throws(() => normalizeState(malformedRow), /not a valid planner backup/, key);
  }
});

test('Added content sanitizes links, optional dates, enums and finite nonnegative amounts', () => {
  const state = populatedState();
  const event = state.gatherings[0];
  Object.assign(event.guests[0], { invitation: 'Unknown', invitedOn: '2026-02-30' });
  Object.assign(event.activities[0], { category: 'Unknown', date: '2026-02-30', time: '28:80', link: 'javascript:alert(1)' });
  Object.assign(event.inventory[0], { category: 'Unknown', have: -2, need: Infinity });
  Object.assign(event.leftovers[0], { storage: 'Unknown', status: 'Unknown', quantity: -1, packedOn: '2026-02-30' });
  Object.assign(event.orders[0], { link: 'data:text/html,test', orderedOn: 'invalid', expectedOn: '2026-02-30', status: 'Unknown', estimated: -1, actual: NaN, includeInBudget: 'true' });
  Object.assign(event.notebook[0], { section: 'Unknown', date: '2026-02-30', link: 'file:///tmp/test', notes: 'x'.repeat(6000) });
  const result = normalizeState(state).gatherings[0];
  assert.equal(result.guests[0].invitation, 'To send');
  assert.equal(result.guests[0].invitedOn, '');
  assert.equal(result.activities[0].category, 'Game');
  assert.equal(result.activities[0].date, event.date);
  assert.equal(result.activities[0].time, '16:00');
  assert.equal(result.activities[0].link, '');
  assert.equal(result.inventory[0].category, 'Other');
  assert.equal(result.inventory[0].have, 0);
  assert.equal(result.inventory[0].need, 0);
  assert.equal(result.leftovers[0].storage, 'Fridge');
  assert.equal(result.leftovers[0].status, 'To pack');
  assert.equal(result.leftovers[0].quantity, 0);
  assert.equal(result.leftovers[0].packedOn, '');
  assert.equal(result.orders[0].status, 'To order');
  assert.equal(result.orders[0].estimated, 0);
  assert.equal(result.orders[0].actual, 0);
  assert.equal(result.orders[0].includeInBudget, false);
  assert.equal(result.orders[0].link, '');
  assert.equal(result.orders[0].orderedOn, '');
  assert.equal(result.orders[0].expectedOn, '');
  assert.equal(result.notebook[0].section, 'General notes');
  assert.equal(result.notebook[0].date, '');
  assert.equal(result.notebook[0].link, '');
  assert.equal(result.notebook[0].notes.length, 5000);
});

test('Only explicitly included non-returned orders affect the hosting budget, using cents', () => {
  const event = blankGathering();
  event.budget = 10;
  event.groceries = [{ estimated: 0.1, actual: 0.1, status: 'Bought' }, { estimated: 40, actual: 40, status: 'In pantry' }];
  event.expenses = [{ estimated: 0.2, actual: 0.2 }];
  event.orders = [
    { includeInBudget: true, status: 'Ordered', estimated: 0.2, actual: 0.2 },
    { includeInBudget: true, status: 'To order', estimated: 1.2, actual: null },
    { includeInBudget: false, status: 'Arrived', estimated: 99, actual: 99 },
    { includeInBudget: true, status: 'Returned', estimated: 50, actual: 50 },
  ];
  assert.deepEqual(budgetTotals(event), { estimated: 1.7, actual: 0.5, remaining: 9.5 });
});

test('Expanded editable prep template follows historical dates and keeps modified tasks on repeat', () => {
  const event = blankGathering();
  event.date = '2021-11-25';
  const original = prepTemplate(event);
  assert.equal(original.length, 28);
  assert.equal(new Set(original.map(t => t.templateKey)).size, 28);
  assert.equal(original[0].title, 'Invite guests and ask about dietary needs');
  assert.equal(original[0].date, '2021-11-04');
  assert.equal(original[9].title, 'Set out drinks, place cards and serving utensils');
  assert.ok(original.some(t => t.date > event.date));
  event.tasks = [{ id: 'existing', title: original[2].title, date: addDays(event.date, -8), owner: 'Avery', category: 'Table', done: true }, { id: 'custom', title: 'Our family-only tradition', date: event.date, owner: 'Host', category: 'Other', done: false }];
  const merged = mergePrepTemplate(event);
  assert.equal(merged.tasks.length, 29);
  assert.deepEqual(merged.tasks[0], { ...event.tasks[0], templateKey: 'check-table' });
  assert.equal(merged.tasks[1], event.tasks[1]);
  merged.tasks[0].title = 'My updated serving supplies task';
  const keyed = merged.tasks.find(t => t.templateKey === 'invite-guests');
  Object.assign(keyed, { title: 'My personal invitation wording', owner: 'Avery', done: true, date: '2021-11-01' });
  const repeated = mergePrepTemplate(merged);
  assert.equal(repeated, merged);
  assert.equal(repeated.tasks.find(t => t.id === keyed.id), keyed);
  const restored = normalizeState({ ...freshState(), selected: merged.id, gatherings: [merged] });
  assert.equal(mergePrepTemplate(restored.gatherings[0]), restored.gatherings[0]);
  assert.equal(restored.gatherings[0].tasks.find(t => t.id === keyed.id).templateKey, 'invite-guests');
});

test('Inventory shortages transfer once and retain recorded shopping details on updates', () => {
  const event = populatedState().gatherings[0];
  let updated = transferInventory(event, 'inventory');
  assert.equal(updated.groceries.length, 1);
  assert.equal(updated.groceries[0].quantity, 4);
  assert.equal(updated.groceries[0].origin, 'inventory:inventory');
  assert.equal(updated.groceries[0].aisle, 'Table & home');
  updated.groceries[0] = { ...updated.groceries[0], status: 'Bought', store: 'Local market', estimated: 14, actual: 12 };
  const groceryId = updated.groceries[0].id;
  updated.inventory[0] = { ...updated.inventory[0], name: 'Serving plates', have: 5, need: 12, unit: 'pieces' };
  updated = transferInventory(updated, 'inventory');
  assert.equal(updated.groceries.length, 1);
  assert.equal(updated.groceries[0].id, groceryId);
  assert.equal(updated.groceries[0].name, 'Serving plates');
  assert.equal(updated.groceries[0].quantity, 7);
  assert.equal(updated.groceries[0].unit, 'pieces');
  assert.equal(updated.groceries[0].status, 'Bought');
  assert.equal(updated.groceries[0].store, 'Local market');
  assert.equal(updated.groceries[0].estimated, 14);
  assert.equal(updated.groceries[0].actual, 12);
  const pantry = blankGathering();
  pantry.inventory = [{ id: 'pantry', name: 'Flour', category: 'Pantry', have: 0.3, need: 0.7, unit: 'kg', source: '', notes: '' }];
  assert.equal(transferInventory(pantry, 'pantry').groceries[0].quantity, 0.4);
  assert.equal(transferInventory(pantry, 'pantry').groceries[0].aisle, 'Pantry');
  pantry.inventory[0].have = 1;
  assert.equal(transferInventory(pantry, 'pantry'), pantry);
  assert.equal(pantry.groceries.length, 0);
  assert.equal(transferInventory(pantry, 'missing'), pantry);
});

test('Resolved inventory shortages retain rows and purchase history, and renewed shortages become needed', () => {
  for (const actual of [null, 0]) {
    const event = populatedState().gatherings[0];
    event.orders = [];
    event.budget = 100;
    let updated = transferInventory(event, 'inventory');
    updated.groceries[0] = { ...updated.groceries[0], store: 'Local market', estimated: 14, actual };
    const groceryId = updated.groceries[0].id;
    updated.inventory[0] = { ...updated.inventory[0], have: 10, need: 10 };
    updated = transferInventory(updated, 'inventory');
    assert.equal(updated.groceries.length, 1);
    assert.equal(updated.groceries[0].id, groceryId);
    assert.equal(updated.groceries[0].quantity, 0);
    assert.equal(updated.groceries[0].status, 'In pantry');
    assert.equal(updated.groceries[0].store, 'Local market');
    assert.equal(updated.groceries[0].estimated, 14);
    assert.equal(updated.groceries[0].actual, actual);
    assert.deepEqual(budgetTotals(updated), { estimated: 0, actual: 0, remaining: 100 });
    assert.equal(transferInventory(updated, 'inventory'), updated);
    updated.inventory[0] = { ...updated.inventory[0], need: 12 };
    updated = transferInventory(updated, 'inventory');
    assert.equal(updated.groceries.length, 1);
    assert.equal(updated.groceries[0].id, groceryId);
    assert.equal(updated.groceries[0].quantity, 2);
    assert.equal(updated.groceries[0].status, 'Needed');
    assert.equal(updated.groceries[0].store, 'Local market');
    assert.equal(updated.groceries[0].estimated, 14);
    assert.equal(updated.groceries[0].actual, actual);
  }
  for (const purchase of [{ status: 'Bought', actual: 12 }, { status: 'Bought', actual: null }, { status: 'Needed', actual: 12 }]) {
    const event = populatedState().gatherings[0];
    const updated = transferInventory(event, 'inventory');
    updated.groceries[0] = { ...updated.groceries[0], ...purchase, store: 'Local market', estimated: 14 };
    const savedRow = clone(updated.groceries[0]);
    updated.inventory[0] = { ...updated.inventory[0], have: 15, need: 10 };
    const reconciled = transferInventory(updated, 'inventory');
    assert.equal(reconciled, updated);
    assert.deepEqual(reconciled.groceries[0], savedRow);
  }
});
