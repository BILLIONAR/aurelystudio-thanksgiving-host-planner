import { addDays, blankGathering, freshState, localDate } from './model.ts';
import type { Gathering, State } from './model.ts';

export const DEMO_STORAGE_KEY = 'aurelystudio-thanksgiving-host-planner-demo-v1';

// The demo keeps one editable sample gathering. Counts leave room to try each workflow.
export const DEMO_LIMITS = {
  guests: 8, dishes: 8, groceries: 12, tasks: 14, slots: 6, expenses: 6,
  memories: 4, activities: 5, inventory: 5, leftovers: 4, orders: 4, notebook: 6,
} as const satisfies Partial<Record<keyof Gathering, number>>;

export function demoLimitExceeded(next: Gathering): keyof typeof DEMO_LIMITS | null {
  for (const key of Object.keys(DEMO_LIMITS) as (keyof typeof DEMO_LIMITS)[]) {
    if (next[key].length > DEMO_LIMITS[key]) return key;
  }
  return null;
}

export function demoState(): State {
  const state = freshState();
  const g = blankGathering();
  const day = g.date;
  const spent = addDays(localDate(), -3);
  g.id = 'demo-gathering';
  g.title = 'A Thanksgiving around our table';
  g.location = 'At home';
  g.budget = 480;
  g.guests = [
    { id: 'demo-guest-alex', name: 'Alex', adults: 1, children: 0, rsvp: 'Confirmed', dietary: '', bringing: 'Roast turkey', seat: 'Host', contact: '', invitation: 'Sent', invitedOn: addDays(day, -21) },
    { id: 'demo-guest-jordan', name: 'Jordan', adults: 1, children: 0, rsvp: 'Confirmed', dietary: '', bringing: 'Cranberry sauce', seat: 'Table 1', contact: '', invitation: 'Sent', invitedOn: addDays(day, -21) },
    { id: 'demo-guest-maya', name: 'Maya & Eli', adults: 2, children: 0, rsvp: 'Confirmed', dietary: 'Eli is vegetarian', bringing: 'Roasted squash', seat: 'Table 1', contact: '', invitation: 'Sent', invitedOn: addDays(day, -20) },
    { id: 'demo-guest-ruth', name: 'Aunt Ruth', adults: 1, children: 0, rsvp: 'Confirmed', dietary: '', bringing: 'Apple pie', seat: 'Table 1', contact: '', invitation: 'Sent', invitedOn: addDays(day, -20) },
    { id: 'demo-guest-priya', name: 'Priya & family', adults: 2, children: 1, rsvp: 'Confirmed', dietary: 'One child prefers mild food', bringing: 'Green salad', seat: 'Table 2', contact: '', invitation: 'Sent', invitedOn: addDays(day, -19) },
    { id: 'demo-guest-noah', name: 'Noah & Taylor', adults: 2, children: 0, rsvp: 'Confirmed', dietary: '', bringing: 'Sparkling cider', seat: 'Table 2', contact: '', invitation: 'Sent', invitedOn: addDays(day, -19) },
    { id: 'demo-guest-sam', name: 'Sam', adults: 1, children: 0, rsvp: 'Invited', dietary: '', bringing: '', seat: '', contact: '', invitation: 'Sent', invitedOn: addDays(day, -18) },
  ];
  g.dishes = [
    { id: 'demo-dish-turkey', name: 'Herb roast turkey', course: 'Main dishes', owner: 'Host', baseServings: 10, servings: 10, recipe: '', notes: 'Rest before carving.', ingredients: [{ id: 'demo-i-turkey', name: 'Turkey', quantity: 1, unit: 'whole', aisle: 'Meat & alternatives' }, { id: 'demo-i-herbs', name: 'Fresh herbs', quantity: 2, unit: 'bunches', aisle: 'Produce' }] },
    { id: 'demo-dish-squash', name: 'Maple roasted squash', course: 'Sides', owner: 'Maya & Eli', baseServings: 6, servings: 10, recipe: '', notes: 'Vegetarian option.', ingredients: [{ id: 'demo-i-squash', name: 'Butternut squash', quantity: 2, unit: 'whole', aisle: 'Produce' }] },
    { id: 'demo-dish-potatoes', name: 'Creamy mashed potatoes', course: 'Sides', owner: 'Host', baseServings: 8, servings: 10, recipe: '', notes: 'Keep warm until serving.', ingredients: [{ id: 'demo-i-potatoes', name: 'Potatoes', quantity: 5, unit: 'lb', aisle: 'Produce' }] },
    { id: 'demo-dish-salad', name: 'Autumn green salad', course: 'Sides', owner: 'Priya & family', baseServings: 8, servings: 10, recipe: '', notes: 'Dressing on the side.', ingredients: [] },
    { id: 'demo-dish-pie', name: 'Apple pie', course: 'Desserts', owner: 'Aunt Ruth', baseServings: 8, servings: 10, recipe: '', notes: 'Serve with vanilla ice cream.', ingredients: [] },
    { id: 'demo-dish-cider', name: 'Sparkling apple cider', course: 'Drinks', owner: 'Noah & Taylor', baseServings: 10, servings: 10, recipe: '', notes: 'Chill before guests arrive.', ingredients: [] },
  ];
  g.groceries = [
    { id: 'demo-g-turkey', name: 'Turkey', quantity: 1, unit: 'whole', aisle: 'Meat & alternatives', store: 'Market', status: 'Needed', estimated: 76, actual: null, origin: 'demo-dish-turkey:demo-i-turkey' },
    { id: 'demo-g-potatoes', name: 'Potatoes', quantity: 6, unit: 'lb', aisle: 'Produce', store: 'Market', status: 'Needed', estimated: 13, actual: null, origin: 'demo-dish-potatoes:demo-i-potatoes' },
    { id: 'demo-g-herbs', name: 'Fresh herbs', quantity: 2, unit: 'bunches', aisle: 'Produce', store: 'Market', status: 'Needed', estimated: 8, actual: null, origin: 'demo-dish-turkey:demo-i-herbs' },
    { id: 'demo-g-rolls', name: 'Dinner rolls', quantity: 12, unit: 'rolls', aisle: 'Bakery', store: 'Bakery', status: 'Needed', estimated: 14, actual: null, origin: '' },
    { id: 'demo-g-butter', name: 'Butter', quantity: 2, unit: 'packs', aisle: 'Dairy & eggs', store: 'Market', status: 'Bought', estimated: 11, actual: 10.49, spentOn: spent, origin: '' },
    { id: 'demo-g-cider', name: 'Apple cider', quantity: 2, unit: 'bottles', aisle: 'Drinks', store: 'Market', status: 'Bought', estimated: 15, actual: 14.38, spentOn: spent, origin: '' },
    { id: 'demo-g-salt', name: 'Sea salt', quantity: 1, unit: 'jar', aisle: 'Pantry', store: '', status: 'In pantry', estimated: 0, actual: null, origin: '' },
  ];
  g.tasks = [
    { id: 'demo-task-menu', title: 'Agree on potluck dishes', date: addDays(day, -14), owner: 'Alex', category: 'Menu', done: true },
    { id: 'demo-task-rsvp', title: 'Confirm final RSVPs and dietary notes', date: addDays(day, -7), owner: 'Alex', category: 'Guests', done: true },
    { id: 'demo-task-inventory', title: 'Count plates and serving dishes', date: addDays(day, -6), owner: 'Jordan', category: 'Home', done: true },
    { id: 'demo-task-shop', title: 'Buy remaining groceries', date: addDays(day, -3), owner: 'Alex', category: 'Shopping', done: false },
    { id: 'demo-task-pie', title: 'Check dessert and drink plan', date: addDays(day, -2), owner: 'Alex', category: 'Menu', done: false },
    { id: 'demo-task-table', title: 'Set the table', date: addDays(day, -1), owner: 'Jordan', category: 'Table', done: false },
    { id: 'demo-task-cook', title: 'Review the oven schedule', date: day, owner: 'Alex', category: 'Kitchen', done: false },
    { id: 'demo-task-leftovers', title: 'Label leftover containers', date: day, owner: 'Jordan', category: 'Kitchen', done: false },
    { id: 'demo-task-thanks', title: 'Send thank-you notes', date: addDays(day, 2), owner: 'Alex', category: 'Guests', done: false },
  ];
  g.slots = [
    { id: 'demo-slot-turkey', title: 'Roast the turkey', date: day, time: '11:30', minutes: 180, resource: 'Oven 1', temperature: '325°F', owner: 'Alex', done: false },
    { id: 'demo-slot-rest', title: 'Rest and carve the turkey', date: day, time: '14:45', minutes: 40, resource: 'Counter', temperature: '', owner: 'Alex', done: false },
    { id: 'demo-slot-potatoes', title: 'Warm the potatoes', date: day, time: '15:15', minutes: 25, resource: 'Stovetop', temperature: '', owner: 'Jordan', done: false },
  ];
  g.expenses = [
    { id: 'demo-e-flowers', name: 'Flowers', category: 'Flowers', estimated: 28, actual: 25.5, spentOn: spent },
    { id: 'demo-e-napkins', name: 'Linen napkins', category: 'Table & decor', estimated: 35, actual: 32.4, spentOn: addDays(localDate(), -5) },
    { id: 'demo-e-containers', name: 'Leftover containers', category: 'Supplies', estimated: 18, actual: null },
    { id: 'demo-e-cards', name: 'Thanksgiving game cards', category: 'Other', estimated: 9, actual: 7.5, spentOn: addDays(localDate(), -4) },
  ];
  g.memories = [
    { id: 'demo-memory-one', text: 'Leave a little space for everyone to share something they are grateful for.', date: day },
  ];
  g.activities = [
    { id: 'demo-a-gratitude', title: 'Gratitude cards', category: 'Tradition', date: day, time: '16:45', owner: 'Alex', supplies: 'Small cards and pens', notes: 'Put a card by each place setting.', link: '', done: false },
    { id: 'demo-a-walk', title: 'After-dinner neighborhood walk', category: 'Fall outing', date: day, time: '18:30', owner: 'Jordan', supplies: '', notes: '', link: '', done: false },
  ];
  g.inventory = [
    { id: 'demo-in-plates', name: 'Dinner plates', category: 'Table', have: 8, need: 11, unit: 'plates', source: 'Home', notes: 'Borrow three.' },
    { id: 'demo-in-glasses', name: 'Drinking glasses', category: 'Table', have: 12, need: 11, unit: 'glasses', source: 'Home', notes: '' },
    { id: 'demo-in-pan', name: 'Large roasting pan', category: 'Kitchen', have: 1, need: 1, unit: 'pan', source: 'Home', notes: '' },
  ];
  g.leftovers = [{ id: 'demo-l-turkey', name: 'Turkey', quantity: 4, unit: 'portions', storage: 'Send home', recipient: 'Guests', packedOn: '', plan: 'Pack after dinner.', notes: 'Use labeled containers.', status: 'To pack' }];
  g.orders = [{ id: 'demo-o-candles', name: 'Unscented taper candles', store: 'Home shop', link: '', orderedOn: addDays(localDate(), -7), expectedOn: addDays(localDate(), 2), status: 'Ordered', estimated: 22, actual: 21, spentOn: addDays(localDate(), -7), includeInBudget: true, notes: 'For the dining table.' }];
  g.notebook = [
    { id: 'demo-n-priorities', section: 'Priorities', title: 'Our three priorities', owner: 'Alex', date: '', notes: 'A relaxed pace, room for everyone, and enough time together after dinner.', link: '' },
    { id: 'demo-n-table', section: 'Table setting', title: 'Warm candlelit table', owner: 'Jordan', date: addDays(day, -1), notes: 'Linen napkins, low flowers, and unscented candles.', link: '' },
    { id: 'demo-n-buffet', section: 'Buffet', title: 'Serving order', owner: 'Alex', date: day, notes: 'Plates first, mains and sides next, drinks on the sideboard.', link: '' },
  ];
  g.decor = 'Low flowers, soft linens, and unscented candles so everyone can see across the table.';
  g.nextYear = 'Save the timing that worked and ask guests for their favorite dish.';
  state.selected = g.id;
  state.gatherings = [g];
  return state;
}
