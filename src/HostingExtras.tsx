import { useState } from 'react';
import { confirmedCount, formatDate, formatTime, money, sumMoney } from './model';
import type { Gathering, NotebookEntry } from './model';
import { Icon } from './icons';

export function InvitationPlanner({ event, onEdit }: { event: Gathering; onEdit: (record: Partial<NotebookEntry>) => void }) {
  const [copyStatus, setCopyStatus] = useState('');
  const saved = event.notebook.find(n => n.section === 'Invitation message');
  const draft = saved?.notes || `Hello! We’d love to have you join us for ${event.title} on ${formatDate(event.date)} at ${formatTime(event.time)}${event.location ? ' at ' + event.location : ''}.\n\nPlease let us know if you can make it and how many people will be coming. Share any dietary needs and let us know if you would like to bring a dish.\n\nLooking forward to gathering together!`;
  async function copy() { try { await navigator.clipboard.writeText(draft); setCopyStatus('Message copied. Send it using your own messages or email.'); } catch { setCopyStatus('Select the message above and copy it using your device.'); } }
  return <section className="panel invitation-draft"><details><summary>Your invitation message</summary><p className="hint">Use your gathering details to write a short invitation. Save your own wording, then share it yourself.</p><label><span className="sr-only">Invitation message draft</span><textarea readOnly rows={8} value={draft} onFocus={e => e.target.select()} /></label><button className="text-button" onClick={() => void copy()}><Icon name="guests" size={16} />Copy invitation</button><button className="text-button" onClick={() => onEdit(saved ?? { section: 'Invitation message', title: 'Our invitation message', notes: draft, owner: 'Host', date: '', link: '' })}><Icon name="edit" size={16} />{saved ? 'Edit saved invitation' : 'Make this message mine'}</button>{copyStatus && <p className="hint" role="status">{copyStatus}</p>}</details></section>;
}
export function PortionPlan({ event, onPrint }: { event: Gathering; onPrint: () => void }) {
  return <section className="panel portion-panel"><div className="section-title"><div><span className="eyebrow">SERVINGS AT A GLANCE</span><h2>Your portion plan</h2></div><button className="text-button" onClick={onPrint}><Icon name="print" size={16} />Print plan</button></div><p className="hint">{confirmedCount(event)} confirmed people. Plan each dish for the guests who will enjoy it; ingredient amounts use the servings you enter.</p>{event.dishes.length ? <div className="portion-list">{event.dishes.map(d => <div key={d.id}><strong>{d.name}</strong><span className="data-font">{d.servings} servings</span><span>{d.course} · {d.owner}</span></div>)}</div> : <p className="hint section-hint">Add your first dish to see its servings here. Your guest list and recipes stay connected to this gathering.</p>}</section>;
}
export function BudgetBreakdown({ event }: { event: Gathering }) {
  const groceries = event.groceries.filter(g => g.status !== 'In pantry');
  const food = groceries.filter(g => !['Table & home', 'Other'].includes(g.aisle));
  const decor = groceries.filter(g => g.aisle === 'Table & home');
  const other = groceries.filter(g => g.aisle === 'Other');
  const foodExtras = event.expenses.filter(e => e.category === 'Food & drinks');
  const decorExtras = event.expenses.filter(e => ['Table & decor', 'Flowers', 'Supplies'].includes(e.category));
  const otherExtras = event.expenses.filter(e => !foodExtras.includes(e) && !decorExtras.includes(e));
  const orders = event.orders.filter(o => o.includeInBudget && o.status !== 'Returned');
  const groups = [
    { name: 'Food & drinks', rows: [...food, ...foodExtras] },
    { name: 'Table & decor', rows: [...decor, ...decorExtras] },
    { name: 'Other hosting', rows: [...other, ...otherExtras] },
    { name: 'Online orders', rows: orders },
  ];
  return <section className="panel budget-categories"><div className="section-title"><div><span className="eyebrow">A CLEARER VIEW OF THE COSTS</span><h2>Food, decor & everything else</h2></div><Icon name="shopping" size={22} /></div><div className="budget-category-grid">{groups.map(g => <div key={g.name}><strong>{g.name}</strong><span className="data-font">{money(sumMoney(g.rows.map(r => r.actual ?? 0)), event.currency)}</span><small>{money(sumMoney(g.rows.map(r => r.estimated)), event.currency)} estimated</small></div>)}</div><p className="hint">Pantry items and returned orders are excluded. Only orders you chose to include count toward this gathering.</p></section>;
}
