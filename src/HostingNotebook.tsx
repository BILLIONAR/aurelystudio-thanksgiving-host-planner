import { useState } from 'react';
import type { Gathering, RecordKind, Activity, NotebookEntry } from './model';
import { NOTEBOOK_SECTIONS, formatDate, formatTime, money, quantity, safeRecipeLink, uid } from './model';
import { Icon } from './icons';
import './HostingNotebook.css';

type Board = 'inventory' | 'plans' | 'activities' | 'leftovers' | 'orders';
const BOARDS: { id: Board; title: string; subtitle: string; kind: RecordKind }[] = [
  { id: 'inventory', title: 'Home & supplies', subtitle: 'Cookware, linens, pantry & decor', kind: 'inventory' },
  { id: 'plans', title: 'Your hosting plans', subtitle: 'Turkey, tables, invitations & ideas', kind: 'notebook' },
  { id: 'activities', title: 'Time together', subtitle: 'Games, crafts, music & traditions', kind: 'activity' },
  { id: 'leftovers', title: 'After the feast', subtitle: 'Pack, share & plan another meal', kind: 'leftover' },
  { id: 'orders', title: 'Orders & wish lists', subtitle: 'Purchases, deliveries & holiday plans', kind: 'order' },
];
export const ACTIVITY_IDEAS = [
  { title: 'One small thank-you', category: 'Tradition', supplies: 'None', notes: 'Go around the table and share one small thing you appreciated this week. Anyone can pass, or write their thought instead.' },
  { title: 'Whose kitchen memory?', category: 'Game', supplies: 'Small paper slips and pens', notes: 'Everyone writes a happy food memory without their name. Read them aloud and invite the table to guess whose memory it is.' },
  { title: 'Make a place-card leaf', category: 'Craft', supplies: 'Paper, pencils and coloring supplies', notes: 'Draw a leaf on folded paper, add a name and decorate it. Put each finished card beside that person’s place setting.' },
  { title: 'A photo for next year', category: 'Tradition', supplies: 'A camera or phone', notes: 'Choose a moment after the meal for a group photo. Add one sentence about the day to your keepsakes.' },
  { title: 'A gentle dinner soundtrack', category: 'Playlist', supplies: 'Your own music app or playlist link', notes: 'Build a short playlist together before guests arrive. Keep it quiet enough for conversation and save the link for next time.' },
  { title: 'Pick an after-dinner movie', category: 'Movie', supplies: 'Your own viewing service or collection', notes: 'Ask the group for two favorites, choose one together and note the planned start time. Leave a comfortable seat for anyone joining later.' },
] as const;
export function activityIdeas(event: Gathering): Activity[] {
  return ACTIVITY_IDEAS.filter(i => !event.activities.some(a => a.title === i.title)).map(i => ({ ...i, id: uid(), date: event.date, time: '18:00', owner: 'Host', link: '', done: false }));
}
const PLAN_IDEAS: Pick<NotebookEntry, 'section' | 'title' | 'notes'>[] = [
  { section: 'Priorities', title: 'The three things that matter most', notes: 'Choose three priorities for this gathering. Write one thing you can simplify, one thing you can share with a helper, and one moment you want to enjoy.' },
  { section: 'Turkey plan', title: 'My main-dish preparation plan', notes: 'Record your chosen recipe, amount, shopping or pickup date, equipment and recipe-specific preparation steps. Add the actual cooking and resting times to Prep & cooking.' },
  { section: 'Table setting', title: 'A table that works for everyone', notes: 'Plan the linens, centerpiece, plates, cutlery, glasses and serving pieces. Count what you already have in Home & supplies, then assign seats on the Guests page.' },
  { section: 'Buffet', title: 'A clear serving route', notes: 'Choose a place for plates, main dishes, sides, drinks and desserts. Note each dish’s serving utensil, label and any space needed for refills.' },
  { section: 'Kids table', title: 'A welcoming children’s corner', notes: 'Plan seats, simple place cards, coloring supplies and a shared activity. Ask a helper to check that the setup suits the children attending.' },
  { section: 'Guest room', title: 'A comfortable overnight stay', notes: 'Note the guests staying over, clean bedding, towels, charging space and arrival details. Put room preparation and cleanup on your dated prep checklist.' },
  { section: 'Thank-you notes', title: 'People I want to thank', notes: 'List who helped, what they brought or did, and one specific thing you appreciated. Write your own short message when you are ready.' },
  { section: 'Fall bucket list', title: 'A little autumn to look forward to', notes: 'Choose a few realistic outings or cozy activities. Add dates, costs you want to track and the people you would like to invite.' },
  { section: 'Black Friday / Cyber Monday', title: 'A considered holiday shopping plan', notes: 'List only things you already want or need, your own spending limit, and links to check. Record purchases in Orders; add a cost to your hosting budget only when it belongs to this gathering.' },
];

type Props = {
  event: Gathering;
  onEdit: (kind: RecordKind, record?: object) => void;
  onRemove: (kind: RecordKind, id: string, name: string) => void;
  onChange: (fn: (event: Gathering) => Gathering) => void;
  onInventoryTransfer: (id: string) => void;
  onStarterActivities: () => void;
  onPrint: (sections: string[]) => void;
};
function Actions({ name, edit, remove }: { name: string; edit: () => void; remove: () => void }) {
  return <div className="row-actions"><button className="icon-button" aria-label={`Edit ${name}`} onClick={edit}><Icon name="edit" size={17} /></button><button className="icon-button" aria-label={`Delete ${name}`} onClick={remove}><Icon name="trash" size={17} /></button></div>;
}
function Link({ url }: { url: string }) { const safe = safeRecipeLink(url); return safe ? <a className="text-button" href={safe} target="_blank" rel="noopener noreferrer">Open saved link <Icon name="arrow" size={15} /></a> : null; }
export function HostingNotebook({ event, onEdit, onRemove, onChange, onInventoryTransfer, onStarterActivities, onPrint }: Props) {
  const [board, setBoard] = useState<Board>('inventory');
  const [section, setSection] = useState('All plans');
  const active = BOARDS.find(b => b.id === board)!;
  const counts = { inventory: event.inventory.length, plans: event.notebook.length, activities: event.activities.length, leftovers: event.leftovers.length, orders: event.orders.length };
  const printSections: Record<Board, string[]> = { inventory: ['Kitchen & decor inventory'], plans: ['Hosting notebook'], activities: ['Activities & traditions'], leftovers: ['Leftovers'], orders: ['Online orders'] };
  const newRecord = board === 'plans' && section !== 'All plans' ? { section } : undefined;
  const notePlans = event.notebook.filter(n => section === 'All plans' || n.section === section);
  return <>
    <div className="page-heading"><div><span className="eyebrow">ALL THE LITTLE THINGS</span><h1>Your hosting notebook.</h1><p>From the first idea to the last packed dish. Keep practical plans, supplies and shared moments together.</p></div><button className="button" onClick={() => onEdit(active.kind, newRecord)}><Icon name="plus" size={17} />{board === 'inventory' ? 'Add supply' : board === 'plans' ? 'Add plan' : board === 'activities' ? 'Add activity' : board === 'leftovers' ? 'Add leftover' : 'Add order'}</button></div>
    <div className="hosting-boards" role="group" aria-label="Hosting notebook sections">{BOARDS.map(b => <button key={b.id} className={`panel hosting-board ${board === b.id ? 'selected' : ''}`} aria-pressed={board === b.id} onClick={() => setBoard(b.id)}><span className="hosting-board-count data-font">{String(counts[b.id]).padStart(2, '0')}</span><strong>{b.title}</strong><small>{b.subtitle}</small><Icon name="arrow" size={16} /></button>)}</div>
    <div className="section-title hosting-section-title"><div><span className="eyebrow">{event.title}</span><h2>{active.title}</h2></div><button className="text-button" onClick={() => onPrint(printSections[board])}><Icon name="print" size={16} />Print these pages</button></div>

    {board === 'inventory' && <>
      <p className="hint hosting-intro">Count what you have and what you need. Missing supplies can go straight to your shopping list.</p>
      {event.inventory.length ? <div className="hosting-record-grid">{event.inventory.map(i => { const missing = Math.max(0, i.need - i.have); return <article className="panel hosting-record" key={i.id}><div className="section-title"><span className="eyebrow">{i.category}</span><Actions name={i.name} edit={() => onEdit('inventory', i)} remove={() => onRemove('inventory', i.id, i.name)} /></div><h3>{i.name}</h3><div className="inventory-numbers hosting-data"><span><strong>{quantity(i.have)}</strong>have</span><span><strong>{quantity(i.need)}</strong>need</span><span><strong>{quantity(missing)}</strong>{i.unit || 'still needed'}</span></div><p className={`hosting-status ${missing ? '' : 'ready'}`}>{missing ? `${quantity(missing)} ${i.unit || 'items'} still needed` : 'Ready to use'}</p>{i.source && <p className="hint">Borrow / buy from: {i.source}</p>}{i.notes && <p className="hosting-notes">{i.notes}</p>}{(missing > 0 || event.groceries.some(g => g.origin === 'inventory:' + i.id)) && <button className="text-button bottom-link" onClick={() => onInventoryTransfer(i.id)}><Icon name="shopping" size={16} />{event.groceries.some(g => g.origin === 'inventory:' + i.id) ? missing > 0 ? 'Update shopping quantity' : 'Update supply availability' : 'Add missing supplies to shopping'}</button>}</article>; })}</div> : <div className="panel hosting-empty"><Icon name="home" size={29} /><h3>Start with what you already have.</h3><p>Serving bowls, chairs, linens, decorations and pantry basics. Add the amount you need, then count what is ready.</p><button className="button secondary" onClick={() => onEdit('inventory')}>Add your first supply</button></div>}
    </>}

    {board === 'plans' && <>
      <div className="hosting-plan-filter"><label className="field"><span>Show a planning page</span><select value={section} onChange={e => setSection(e.target.value)}><option>All plans</option>{NOTEBOOK_SECTIONS.map(s => <option key={s}>{s}</option>)}</select></label><p className="hint">Priorities, turkey preparation, buffet, kids’ table, guest rooms, outfits, thank-you notes and holiday plans.</p></div>
      {notePlans.length > 0 && <div className="hosting-record-grid">{notePlans.map(n => <article className="panel hosting-record" key={n.id}><div className="section-title"><span className="eyebrow">{n.section}</span><Actions name={n.title} edit={() => onEdit('notebook', n)} remove={() => onRemove('notebook', n.id, n.title)} /></div><h3>{n.title}</h3><p className="hint">{n.owner}{n.date ? ' · ' + formatDate(n.date, true) : ''}</p><p className="hosting-notes">{n.notes || 'Add the details when you’re ready.'}</p><Link url={n.link} /></article>)}</div>}
      <section className="panel hosting-prompts"><span className="eyebrow">A PLACE TO START</span><h3>{notePlans.length ? 'Make room for another idea.' : 'Choose a page, make it yours.'}</h3><p className="hint">These editable prompts give you a starting point. They become part of your plan only when you save them.</p><div className="hosting-prompt-list">{PLAN_IDEAS.filter(i => section === 'All plans' || i.section === section).map(i => <button key={i.section} onClick={() => onEdit('notebook', { ...i, owner: 'Host', date: '', link: '' })}><span><strong>{i.section}</strong><small>{i.title}</small></span><Icon name="plus" size={17} /></button>)}{section !== 'All plans' && !PLAN_IDEAS.some(i => i.section === section) && <button onClick={() => onEdit('notebook', { section })}><span><strong>Start a {section.toLowerCase()} page</strong><small>Your own ideas, notes and links.</small></span><Icon name="plus" size={17} /></button>}</div></section>
    </>}

    {board === 'activities' && <>
      <div className="hosting-callout panel"><div><span className="eyebrow">SIMPLE WAYS TO COME TOGETHER</span><h3>A game, a craft, a shared story.</h3><p className="hint">Add six editable ideas, or plan your own games, traditions, playlist and movie time.</p></div><button className="button secondary" onClick={onStarterActivities}><Icon name="plus" size={17} />Add activity ideas</button></div>
      {event.activities.length ? <div className="hosting-record-grid">{[...event.activities].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).map(a => <article className={`panel hosting-record ${a.done ? 'hosting-done' : ''}`} key={a.id}><div className="section-title"><span className="eyebrow">{a.category}</span><Actions name={a.title} edit={() => onEdit('activity', a)} remove={() => onRemove('activity', a.id, a.title)} /></div><label className="task-label"><input type="checkbox" checked={a.done} onChange={() => onChange(g => ({ ...g, activities: g.activities.map(r => r.id === a.id ? { ...r, done: !r.done } : r) }))} /><h3>{a.title}</h3></label><p className="hint">{formatDate(a.date, true)} · {formatTime(a.time)} · {a.owner}</p>{a.supplies && <p className="hosting-data"><strong>Bring / prepare:</strong> {a.supplies}</p>}<p className="hosting-notes">{a.notes}</p><Link url={a.link} /></article>)}</div> : <p className="notice">Your activity plan is empty. Add a favorite or use the editable ideas above.</p>}
    </>}

    {board === 'leftovers' && <>
      <p className="hint hosting-intro">Record amounts, containers, recipients and a next-meal idea. Packed dates are your own records; follow your recipe and official guidance for safe storage.</p>
      {event.leftovers.length ? <div className="hosting-record-grid">{event.leftovers.map(l => <article className="panel hosting-record" key={l.id}><div className="section-title"><span className="eyebrow">{l.storage}</span><Actions name={l.name} edit={() => onEdit('leftover', l)} remove={() => onRemove('leftover', l.id, l.name)} /></div><h3>{l.name}</h3><p className="hosting-data">{quantity(l.quantity)} {l.unit}{l.recipient ? ` · For ${l.recipient}` : ''}</p><span className="hosting-status">{l.status}</span>{l.packedOn && <p className="hint">Packed: {formatDate(l.packedOn, true)}</p>}{l.plan && <><span className="eyebrow">NEXT MEAL</span><p className="hosting-notes">{l.plan}</p></>}{l.notes && <p className="hosting-notes">{l.notes}</p>}</article>)}</div> : <div className="panel hosting-empty"><Icon name="menu" size={29} /><h3>A plan for what’s left.</h3><p>Save containers to the supply list, decide what to share and make a note of the meals you would like to make next.</p><button className="button secondary" onClick={() => onEdit('leftover')}>Add your first leftover</button></div>}
    </>}

    {board === 'orders' && <>
      <p className="hint hosting-intro">Track planned purchases and deliveries. Include a cost in the hosting budget only once, using the order checkbox; avoid adding the same cost to a grocery or expense row.</p>
      {event.orders.length ? <div className="hosting-record-grid">{event.orders.map(o => <article className="panel hosting-record" key={o.id}><div className="section-title"><span className="eyebrow">{o.status}</span><Actions name={o.name} edit={() => onEdit('order', o)} remove={() => onRemove('order', o.id, o.name)} /></div><h3>{o.name}</h3>{o.store && <p className="hint">{o.store}</p>}<p className="hosting-data">{money(o.estimated, event.currency)} estimated{o.actual !== null ? ' · ' + money(o.actual, event.currency) + ' paid' : ''}</p>{o.orderedOn && <p className="hint">Ordered: {formatDate(o.orderedOn, true)}</p>}{o.expectedOn && <p className="hint">Expected: {formatDate(o.expectedOn, true)}</p>}<p className="hosting-status">{o.includeInBudget ? 'Included in hosting budget' : 'Tracked separately'}</p>{o.notes && <p className="hosting-notes">{o.notes}</p>}<Link url={o.link} /></article>)}</div> : <div className="panel hosting-empty"><Icon name="shopping" size={29} /><h3>A delivery worth remembering.</h3><p>Track ordered supplies, a borrowed item to collect or a planned holiday purchase. Keep holiday wish lists in Your hosting plans.</p><button className="button secondary" onClick={() => onEdit('order')}>Add your first order</button></div>}
    </>}
  </>;
}
