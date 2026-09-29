export const APP_ID = 'aurelystudio-thanksgiving-host-planner';
export const STORAGE_KEY = APP_ID + '-v1';
export const VERSION = 1;
export const COURSES = ['Appetizers', 'Main dishes', 'Sides', 'Desserts', 'Drinks'] as const;
export const AISLES = ['Produce', 'Bakery', 'Dairy & eggs', 'Meat & alternatives', 'Pantry', 'Frozen', 'Drinks', 'Table & home', 'Other'] as const;
export const INVITATION_STATUSES = ['To send', 'Sent'] as const;
export const ACTIVITY_CATEGORIES = ['Game', 'Craft', 'Tradition', 'Playlist', 'Movie', 'Fall outing'] as const;
export const INVENTORY_CATEGORIES = ['Kitchen', 'Table', 'Decor', 'Pantry', 'Other'] as const;
export const LEFTOVER_STORAGE = ['Fridge', 'Freezer', 'Send home'] as const;
export const LEFTOVER_STATUSES = ['To pack', 'Packed', 'Used'] as const;
export const ORDER_STATUSES = ['To order', 'Ordered', 'Arrived', 'Returned'] as const;
export const NOTEBOOK_SECTIONS = ['Priorities', 'Brainstorm', 'Invitation message', 'Turkey plan', 'Table setting', 'Buffet', 'Kids table', 'Guest room', 'Outfit', 'Thank-you notes', 'Fall bucket list', 'Holiday shopping', 'Black Friday / Cyber Monday', 'Travel', 'Holiday cards', 'General notes'] as const;
export type Guest = { id: string; name: string; adults: number; children: number; rsvp: 'Invited' | 'Confirmed' | 'Declined'; dietary: string; bringing: string; seat: string; contact: string; invitation: typeof INVITATION_STATUSES[number]; invitedOn: string };
export type Ingredient = { id: string; name: string; quantity: number; unit: string; aisle: string };
export type Dish = { id: string; name: string; course: string; owner: string; baseServings: number; servings: number; recipe: string; notes: string; ingredients: Ingredient[] };
export type Grocery = { id: string; name: string; quantity: number; unit: string; aisle: string; store: string; status: 'Needed' | 'In pantry' | 'Bought'; estimated: number; actual: number | null; spentOn?: string; origin: string };
export type Task = { id: string; title: string; date: string; owner: string; category: string; done: boolean; templateKey?: string };
export type Slot = { id: string; title: string; date: string; time: string; minutes: number; resource: string; temperature: string; owner: string; done: boolean };
export type Expense = { id: string; name: string; category: string; estimated: number; actual: number | null; spentOn?: string };
export type Memory = { id: string; text: string; date: string };
export type Activity = { id: string; title: string; category: typeof ACTIVITY_CATEGORIES[number]; date: string; time: string; owner: string; supplies: string; notes: string; link: string; done: boolean };
export type InventoryItem = { id: string; name: string; category: typeof INVENTORY_CATEGORIES[number]; have: number; need: number; unit: string; source: string; notes: string };
export type Leftover = { id: string; name: string; quantity: number; unit: string; storage: typeof LEFTOVER_STORAGE[number]; recipient: string; packedOn: string; plan: string; notes: string; status: typeof LEFTOVER_STATUSES[number] };
export type Order = { id: string; name: string; store: string; link: string; orderedOn: string; expectedOn: string; status: typeof ORDER_STATUSES[number]; estimated: number; actual: number | null; spentOn?: string; includeInBudget: boolean; notes: string };
export type NotebookEntry = { id: string; section: typeof NOTEBOOK_SECTIONS[number]; title: string; owner: string; date: string; notes: string; link: string };
export type Gathering = { id: string; title: string; kind: string; date: string; time: string; location: string; budget: number; currency: string; guests: Guest[]; dishes: Dish[]; groceries: Grocery[]; tasks: Task[]; slots: Slot[]; expenses: Expense[]; memories: Memory[]; activities: Activity[]; inventory: InventoryItem[]; leftovers: Leftover[]; orders: Order[]; notebook: NotebookEntry[]; decor: string; nextYear: string };
export type Theme = { main: string; accent: string; background: string; preset: string; uiFont: string; headingFont: string; handwriting: string; coverage: 'Accents' | 'Headings' | 'Full Look'; night: boolean; calm: boolean };
export type State = { app: typeof APP_ID; version: number; profile: string; selected: string; theme: Theme; gatherings: Gathering[] };
export type RecordKind = 'guest' | 'dish' | 'grocery' | 'task' | 'slot' | 'expense' | 'memory' | 'activity' | 'inventory' | 'leftover' | 'order' | 'notebook';
export const COLLECTIONS = { guest: 'guests', dish: 'dishes', grocery: 'groceries', task: 'tasks', slot: 'slots', expense: 'expenses', memory: 'memories', activity: 'activities', inventory: 'inventory', leftover: 'leftovers', order: 'orders', notebook: 'notebook' } as const;
export const PRESETS: { name: string; main: string; accent: string; background: string; night?: boolean }[] = [
  { name: 'Amber Glass', main: '#914938', accent: '#AC8648', background: '#F6F1E8' },
  { name: 'Cranberry Table', main: '#782F45', accent: '#A37D48', background: '#F7EEEE' },
  { name: 'Autumn Olive', main: '#526044', accent: '#AB7344', background: '#F1F2E9' },
  { name: 'Golden Hour', main: '#7E5B28', accent: '#AA6650', background: '#FAF4E1' },
  { name: 'Pearl & Sage', main: '#53665E', accent: '#B58B60', background: '#F2ECE3', night: false },
  { name: 'Midnight Gold', main: '#D2AD75', accent: '#B68B51', background: '#EEE4D5', night: true },
];
export const DEFAULT_THEME: Theme = { ...PRESETS[0], preset: PRESETS[0].name, uiFont: 'DM Sans', headingFont: 'Cormorant Garamond', handwriting: 'Caveat', coverage: 'Accents', night: false, calm: false };
export function uid() { return globalThis.crypto?.randomUUID?.() ?? 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2); }
export function localDate(d = new Date()) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
export function parseDate(s: string) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12); }
export function validDate(s: unknown): s is string { return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(parseDate(s).getTime()) && localDate(parseDate(s)) === s; }
export function addDays(date: string, days: number) { const d = parseDate(date); d.setDate(d.getDate() + days); return localDate(d); }
export function thanksgivingDate(year: number) { const first = new Date(year, 10, 1, 12); return localDate(new Date(year, 10, 1 + (4 - first.getDay() + 7) % 7 + 21, 12)); }
export function upcomingThanksgiving(today = localDate()) { const year = parseDate(today).getFullYear(); const current = thanksgivingDate(year); return current < today ? thanksgivingDate(year + 1) : current; }
export function formatDate(date: string, short = false) { return parseDate(date).toLocaleDateString('en-US', { month: short ? 'short' : 'long', day: 'numeric', year: 'numeric' }); }
export function formatTime(time: string) { const [h, m] = time.split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; }
export function daysUntil(date: string, today = localDate()) { const a = parseDate(date), b = parseDate(today); return Math.round((Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()) - Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())) / 86400000); }
export function blankGathering(): Gathering { return { id: uid(), title: 'Thanksgiving at our table', kind: 'Thanksgiving', date: upcomingThanksgiving(), time: '16:00', location: '', budget: 0, currency: 'USD', guests: [], dishes: [], groceries: [], tasks: [], slots: [], expenses: [], memories: [], activities: [], inventory: [], leftovers: [], orders: [], notebook: [], decor: '', nextYear: '' }; }
export function freshState(): State { const event = blankGathering(); return { app: APP_ID, version: VERSION, profile: '', selected: event.id, theme: { ...DEFAULT_THEME }, gatherings: [event] }; }
export function confirmedCount(event: Gathering) { return event.guests.filter(g => g.rsvp === 'Confirmed').reduce((n, g) => n + g.adults + g.children, 0); }
export function headCount(event: Gathering, status?: Guest['rsvp']) { return event.guests.filter(g => !status || g.rsvp === status).reduce((n, g) => n + g.adults + g.children, 0); }
export function sumMoney(items: number[]) { return items.reduce((n, x) => n + Math.round(x * 100), 0) / 100; }
export function budgetTotals(event: Gathering) { const shopping = event.groceries.filter(g => g.status !== 'In pantry'); const orders = (event.orders ?? []).filter(o => o.includeInBudget && o.status !== 'Returned'); const estimated = sumMoney([...shopping.map(g => g.estimated), ...event.expenses.map(e => e.estimated), ...orders.map(o => o.estimated)]); const actual = sumMoney([...shopping.map(g => g.actual ?? 0), ...event.expenses.map(e => e.actual ?? 0), ...orders.map(o => o.actual ?? 0)]); return { estimated, actual, remaining: Math.round((event.budget - actual) * 100) / 100 }; }
export function money(value: number, currency = 'USD') { return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value); }
export function quantity(value: number) { return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value); }
export function transferIngredients(event: Gathering, dishId: string): Gathering { const dish = event.dishes.find(d => d.id === dishId); if (!dish) return event; const groceries = [...event.groceries]; for (const ingredient of dish.ingredients) { if (!ingredient.name.trim()) continue; const origin = `${dish.id}:${ingredient.id}`; const existing = groceries.findIndex(g => g.origin === origin); const row: Grocery = { id: existing >= 0 ? groceries[existing].id : uid(), name: ingredient.name, quantity: Math.round(ingredient.quantity * dish.servings / dish.baseServings * 100) / 100, unit: ingredient.unit, aisle: ingredient.aisle, store: '', status: 'Needed', estimated: 0, actual: null, origin }; if (existing >= 0) groceries[existing] = { ...groceries[existing], name: row.name, quantity: row.quantity, unit: row.unit, aisle: row.aisle }; else groceries.push(row); } return { ...event, groceries }; }
export function transferInventory(event: Gathering, itemId: string): Gathering {
  const item = event.inventory.find(i => i.id === itemId);
  if (!item || !item.name.trim()) return event;
  const shortage = Math.max(0, Math.round((item.need - item.have) * 100) / 100);
  const origin = `inventory:${item.id}`;
  const existing = event.groceries.findIndex(g => g.origin === origin);
  const saved = existing >= 0 ? event.groceries[existing] : undefined;
  if (!shortage) {
    if (!saved || saved.status !== 'Needed' || (saved.actual ?? 0) > 0) return event;
    const groceries = [...event.groceries];
    groceries[existing] = { ...saved, quantity: 0, status: 'In pantry' };
    return { ...event, groceries };
  }
  const groceries = [...event.groceries];
  const row: Grocery = { id: saved?.id ?? uid(), name: item.name, quantity: shortage, unit: item.unit, aisle: item.category === 'Pantry' ? 'Pantry' : 'Table & home', store: '', status: 'Needed', estimated: 0, actual: null, origin };
  if (saved) groceries[existing] = { ...saved, name: row.name, quantity: row.quantity, unit: row.unit, aisle: row.aisle, status: saved.status === 'In pantry' && saved.quantity === 0 && (saved.actual ?? 0) === 0 ? 'Needed' : saved.status };
  else groceries.push(row);
  return { ...event, groceries };
}
function timeMinutes(time: string) { const [h, m] = time.split(':').map(Number); return h * 60 + m; }
export function ovenConflicts(event: Gathering) { const slots = event.slots.filter(s => s.resource.startsWith('Oven') && !s.done); const conflicts: { a: Slot; b: Slot }[] = []; for (let i = 0; i < slots.length; i++) for (let j = i + 1; j < slots.length; j++) { const a = slots[i], b = slots[j]; const startA = daysUntil(a.date, '1970-01-01') * 1440 + timeMinutes(a.time), startB = daysUntil(b.date, '1970-01-01') * 1440 + timeMinutes(b.time); if (a.resource === b.resource && startA < startB + b.minutes && startB < startA + a.minutes) conflicts.push({ a, b }); } return conflicts; }
export function prepTemplate(event: Gathering): Task[] { const tasks = [
  ['invite-guests', -21, 'Invite guests and ask about dietary needs', 'Guests'], ['plan-menu', -14, 'Choose the menu and agree on potluck dishes', 'Menu'], ['check-table', -10, 'Check serving dishes, seats and table linens', 'Table'], ['shopping-list', -7, 'Build your shopping list and check the pantry', 'Shopping'], ['confirm-guests', -5, 'Confirm RSVPs and dish assignments', 'Guests'], ['buy-groceries', -3, 'Buy remaining groceries and table supplies', 'Shopping'], ['review-recipes', -2, 'Review recipe instructions and make-ahead steps', 'Kitchen'], ['set-table', -1, 'Set the table and label serving dishes', 'Table'], ['review-schedule', 0, 'Review the cooking schedule with your helpers', 'Kitchen'], ['set-serving', 0, 'Set out drinks, place cards and serving utensils', 'Table'],
  ['hosting-priorities', -28, 'Choose three priorities for your gathering', 'Other'], ['take-inventory', -21, 'Count kitchen tools, tableware and supplies', 'Home'], ['online-orders', -18, 'Review online orders and expected delivery dates', 'Shopping'], ['turkey-plan', -14, 'Write your turkey or main-dish plan from your chosen recipe', 'Kitchen'], ['activities-plan', -12, 'Choose a game, craft or tradition for the day', 'Other'], ['guest-room', -10, 'Prepare guest-room linens and overnight details', 'Home'], ['clean-guest-areas', -7, 'Tidy entryways, guest areas and seating spaces', 'Home'], ['table-buffet', -5, 'Plan the buffet, kids table and serving layout', 'Table'], ['clean-bathroom', -3, 'Refresh the guest bathroom and restock essentials', 'Home'], ['leftover-supplies', -2, 'Gather containers and labels for leftovers', 'Kitchen'], ['clear-kitchen', -1, 'Clear fridge space and reset kitchen work surfaces', 'Kitchen'], ['playlist-outfit', -1, 'Set aside your outfit and queue the gathering playlist', 'Other'], ['welcome-space', 0, 'Make room for coats, bags and arriving guests', 'Home'], ['gratitude-moment', 0, 'Leave time for a shared memory or gratitude moment', 'Other'], ['pack-leftovers', 0, 'Pack and label leftovers for your planned recipients', 'Kitchen'], ['reset-home', 1, 'Wash linens, put away tableware and reset the room', 'Home'], ['thank-helpers', 2, 'Send thank-you notes to guests and helpers', 'Guests'], ['next-year-reflection', 3, 'Record favorite dishes and ideas for next time', 'Other'],
  ] as const; return tasks.map(([templateKey, days, title, category]) => ({ id: uid(), title, date: addDays(event.date, days), owner: 'Host', category, done: false, templateKey })); }
export function mergePrepTemplate(event: Gathering): Gathering { const template = prepTemplate(event); let attachedKey = false; const tasks = event.tasks.map(existing => { if (existing.templateKey) return existing; const match = template.find(task => task.title === existing.title); if (!match) return existing; attachedKey = true; return { ...existing, templateKey: match.templateKey }; }); const candidates = template.filter(task => !tasks.some(existing => existing.templateKey === task.templateKey || existing.title === task.title)); return attachedKey || candidates.length ? { ...event, tasks: [...tasks, ...candidates] } : event; }
export function safeRecipeLink(url: string) { try { const parsed = new URL(url); return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.href : ''; } catch { return ''; } }
const obj = (v: unknown): Record<string, unknown> => { if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error('This file is not a valid planner backup.'); return v as Record<string, unknown>; };
const text = (v: unknown, fallback = '', max = 5000) => typeof v === 'string' ? v.slice(0, max) : fallback;
const amount = (v: unknown, fallback = 0) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 100000000 ? v : fallback;
const count = (v: unknown, fallback = 0) => Math.floor(amount(v, fallback));
const nullable = (v: unknown) => v === null || v === undefined ? null : amount(v);
const enumValue = <T extends string>(v: unknown, options: readonly T[], fallback: T): T => options.includes(v as T) ? v as T : fallback;
const dateValue = (v: unknown, fallback: string) => validDate(v) ? v : fallback;
const optionalDate = (v: unknown) => validDate(v) ? v : '';
const timeValue = (v: unknown, fallback = '16:00') => typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v) ? v : fallback;
const idValue = (v: unknown) => text(v, uid(), 120) || uid();
function rows<T>(v: unknown, parser: (v: Record<string, unknown>) => T): T[] { if (v === undefined) return []; if (!Array.isArray(v) || v.length > 10000) throw new Error('This backup contains an invalid list.'); const parsed = v.map(row => parser(obj(row))); const ids = new Set<string>(); for (const row of parsed) { const id = (row as { id: string }).id; if (ids.has(id)) throw new Error('This backup contains duplicate records.'); ids.add(id); } return parsed; }
export function normalizeState(input: unknown): State {
  const root = obj(input); if (root.app !== APP_ID || root.version !== VERSION || !Array.isArray(root.gatherings) || !root.gatherings.length || root.gatherings.length > 300) throw new Error('Choose a version 1 Thanksgiving Host Planner backup.');
  const theme = obj(root.theme ?? {}); const hex = (v: unknown, fallback: string) => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v) ? v : fallback;
  const gatherings = rows(root.gatherings, g => {
    if (typeof g.title !== 'string' || !g.title.trim() || !validDate(g.date)) throw new Error('A gathering in this backup is missing its title or date.');
    const date = g.date; return { id: idValue(g.id), title: text(g.title, '', 150), kind: text(g.kind, 'Thanksgiving', 80), date, time: timeValue(g.time), location: text(g.location, '', 200), budget: amount(g.budget), currency: enumValue(g.currency, ['USD', 'CAD', 'GBP', 'EUR'], 'USD'), decor: text(g.decor), nextYear: text(g.nextYear),
      guests: rows(g.guests, r => ({ id: idValue(r.id), name: text(r.name, 'Guest', 150), adults: count(r.adults, 1), children: count(r.children), rsvp: enumValue(r.rsvp, ['Invited', 'Confirmed', 'Declined'], 'Invited'), dietary: text(r.dietary, '', 1000), bringing: text(r.bringing, '', 200), seat: text(r.seat, '', 100), contact: text(r.contact, '', 200), invitation: enumValue(r.invitation, INVITATION_STATUSES, 'To send'), invitedOn: optionalDate(r.invitedOn) })),
      dishes: rows(g.dishes, r => ({ id: idValue(r.id), name: text(r.name, 'Dish', 150), course: enumValue(r.course, COURSES, 'Sides'), owner: text(r.owner, 'Host', 150), baseServings: Math.max(1, count(r.baseServings, 1)), servings: Math.max(1, count(r.servings, 1)), recipe: safeRecipeLink(text(r.recipe)), notes: text(r.notes), ingredients: rows(r.ingredients, i => ({ id: idValue(i.id), name: text(i.name, '', 150), quantity: amount(i.quantity), unit: text(i.unit, '', 30), aisle: enumValue(i.aisle, AISLES, 'Other') })) })),
      groceries: rows(g.groceries, r => ({ id: idValue(r.id), name: text(r.name, 'Item', 150), quantity: amount(r.quantity, 1), unit: text(r.unit, '', 30), aisle: enumValue(r.aisle, AISLES, 'Other'), store: text(r.store, '', 100), status: enumValue(r.status, ['Needed', 'In pantry', 'Bought'], 'Needed'), estimated: amount(r.estimated), actual: nullable(r.actual), spentOn: optionalDate(r.spentOn), origin: text(r.origin, '', 250) })),
      tasks: rows(g.tasks, r => ({ id: idValue(r.id), title: text(r.title, 'Task', 200), date: dateValue(r.date, date), owner: text(r.owner, 'Host', 150), category: text(r.category, 'Other', 80), done: r.done === true, ...(typeof r.templateKey === 'string' && r.templateKey ? { templateKey: text(r.templateKey, '', 120) } : {}) })),
      slots: rows(g.slots, r => ({ id: idValue(r.id), title: text(r.title, 'Prep', 200), date: dateValue(r.date, date), time: timeValue(r.time), minutes: Math.max(1, count(r.minutes, 30)), resource: text(r.resource, 'Counter', 80), temperature: text(r.temperature, '', 80), owner: text(r.owner, 'Host', 150), done: r.done === true })),
      expenses: rows(g.expenses, r => ({ id: idValue(r.id), name: text(r.name, 'Expense', 150), category: text(r.category, 'Other', 80), estimated: amount(r.estimated), actual: nullable(r.actual), spentOn: optionalDate(r.spentOn) })),
      memories: rows(g.memories, r => ({ id: idValue(r.id), text: text(r.text), date: dateValue(r.date, date) })),
      activities: rows(g.activities, r => ({ id: idValue(r.id), title: text(r.title, 'Activity', 200), category: enumValue(r.category, ACTIVITY_CATEGORIES, 'Game'), date: dateValue(r.date, date), time: timeValue(r.time), owner: text(r.owner, 'Host', 150), supplies: text(r.supplies, '', 2000), notes: text(r.notes), link: safeRecipeLink(text(r.link)), done: r.done === true })),
      inventory: rows(g.inventory, r => ({ id: idValue(r.id), name: text(r.name, 'Supply', 150), category: enumValue(r.category, INVENTORY_CATEGORIES, 'Other'), have: amount(r.have), need: amount(r.need), unit: text(r.unit, '', 30), source: text(r.source, '', 200), notes: text(r.notes) })),
      leftovers: rows(g.leftovers, r => ({ id: idValue(r.id), name: text(r.name, 'Leftover', 150), quantity: amount(r.quantity), unit: text(r.unit, '', 30), storage: enumValue(r.storage, LEFTOVER_STORAGE, 'Fridge'), recipient: text(r.recipient, '', 150), packedOn: optionalDate(r.packedOn), plan: text(r.plan, '', 2000), notes: text(r.notes), status: enumValue(r.status, LEFTOVER_STATUSES, 'To pack') })),
      orders: rows(g.orders, r => ({ id: idValue(r.id), name: text(r.name, 'Order', 150), store: text(r.store, '', 100), link: safeRecipeLink(text(r.link)), orderedOn: optionalDate(r.orderedOn), expectedOn: optionalDate(r.expectedOn), status: enumValue(r.status, ORDER_STATUSES, 'To order'), estimated: amount(r.estimated), actual: nullable(r.actual), spentOn: optionalDate(r.spentOn), includeInBudget: r.includeInBudget === true, notes: text(r.notes) })),
      notebook: rows(g.notebook, r => ({ id: idValue(r.id), section: enumValue(r.section, NOTEBOOK_SECTIONS, 'General notes'), title: text(r.title, 'Note', 200), owner: text(r.owner, 'Host', 150), date: optionalDate(r.date), notes: text(r.notes), link: safeRecipeLink(text(r.link)) })),
    } satisfies Gathering;
  });
  return { app: APP_ID, version: VERSION, profile: text(root.profile, '', 80), selected: gatherings.some(g => g.id === root.selected) ? root.selected as string : gatherings[0].id, gatherings, theme: { main: hex(theme.main, DEFAULT_THEME.main), accent: hex(theme.accent, DEFAULT_THEME.accent), background: hex(theme.background, DEFAULT_THEME.background), preset: text(theme.preset, DEFAULT_THEME.preset, 100), uiFont: enumValue(theme.uiFont, ['DM Sans', 'System sans', 'Arial'], 'DM Sans'), headingFont: enumValue(theme.headingFont, ['Cormorant Garamond', 'Lora', 'Georgia', 'DM Sans'], 'Cormorant Garamond'), handwriting: enumValue(theme.handwriting, ['Kalam', 'Caveat', 'Patrick Hand', 'Dancing Script', 'Sacramento'], 'Caveat'), coverage: enumValue(theme.coverage, ['Accents', 'Headings', 'Full Look'], 'Accents'), night: theme.night === true, calm: theme.calm === true } };
}
export function luminance(hex: string) { const rgb = [1, 3, 5].map(n => parseInt(hex.slice(n, n + 2), 16) / 255).map(x => x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4); return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722; }
export function contrast(a: string, b: string) { const la = luminance(a), lb = luminance(b); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); }
export function foreground(bg: string) { const best = contrast('#FFFFFF', bg) > contrast('#171412', bg) ? '#FFFFFF' : '#171412'; return contrast(best, bg) >= 4.5 ? best : '#000000'; }
export function mix(a: string, b: string, weight: number) { return '#' + [1, 3, 5].map(n => Math.round(parseInt(a.slice(n, n + 2), 16) * (1 - weight) + parseInt(b.slice(n, n + 2), 16) * weight).toString(16).padStart(2, '0')).join(''); }
