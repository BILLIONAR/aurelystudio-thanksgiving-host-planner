import { addDays, confirmedCount, formatDate, formatTime, money, NOTEBOOK_SECTIONS, parseDate, quantity, type Gathering } from './model';

export const HOSTING_PRINT_SECTIONS: string[] = [
  'Invitations',
  'Recipe sheets',
  'Portion plan',
  'Kitchen & decor inventory',
  'Leftovers',
  'Activities & traditions',
  'Hosting notebook',
  'Online orders',
  'Seating plan',
  'Food labels',
  'Week at a glance',
  'Kitchen reference',
  'Cleaning checklist',
  'Planning pages',
];

function dateLabel(date: string) { return date ? formatDate(date, true) : '—'; }
function timeLabel(time: string) { return time ? formatTime(time) : '—'; }

const PLANNING_PROMPTS: Record<string, string> = {
  Priorities: 'The three things I most want our gathering to feel like…',
  Brainstorm: 'Ideas, little details and possibilities to explore…',
  'Invitation message': 'A welcome, gathering details and what guests need to know…',
  'Turkey plan': 'My chosen recipe, quantities, preparation notes and assigned helpers…',
  'Table setting': 'Place settings, linens, centerpiece and finishing touches…',
  Buffet: 'Serving layout, dish placement, utensils and refilling plans…',
  'Kids table': 'Seats, supplies and activities for our younger guests…',
  'Guest room': 'Overnight arrangements, linens and welcome details…',
  Outfit: 'What to wear and what to set aside before the day…',
  'Thank-you notes': 'People to thank and the moments I want to mention…',
  'Fall bucket list': 'Seasonal outings, small adventures and traditions to enjoy…',
  'Holiday shopping': 'People, gift ideas, spending plans and errands…',
  'Black Friday / Cyber Monday': 'Planned purchases, prices to compare and spending limits…',
  Travel: 'Routes, times, packing and arrangements to confirm…',
  'Holiday cards': 'Recipients, addresses, messages and mailing plans…',
  'General notes': 'Anything else I want to remember…',
};

export function HostingPrintSections({ event, sections }: { event: Gathering; sections: string[] }) {
  const weekStart = addDays(event.date, -((parseDate(event.date).getDay() + 6) % 7));
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const notebookSections = [...new Set(event.notebook.map(entry => entry.section))];
  const cleaningTasks = event.tasks.filter(task => ['Cleaning', 'Home'].includes(task.category) || /clean|cleanup|clear-kitchen/.test(task.templateKey || '') || /\b(clean|cleaning|cleanup|tidy|tidying|vacuum|dust|sweep|wipe|laundry|trash|garbage|recycling)\b/i.test(task.title));

  return <>
    {sections.includes('Invitations') && <section>
      <h2>Invitations</h2>
      <h3>{event.title}</h3>
      <p>{formatDate(event.date)} · {formatTime(event.time)}<br />{event.location || 'Location not entered yet.'}</p>
      {event.notebook.filter(entry => entry.section === 'Invitation message' && entry.notes).map(entry => <div key={entry.id}><h3>{entry.title}</h3><p className="preserve-lines">{entry.notes}</p></div>)}
      <table><thead><tr><th>Guest household</th><th>Contact</th><th>Invitation</th><th>People / RSVP</th></tr></thead><tbody>
        {event.guests.map(guest => <tr key={guest.id}><td>{guest.name}</td><td>{guest.contact || '—'}</td><td>{guest.invitation}<br /><small>Sent: {dateLabel(guest.invitedOn)}</small></td><td>{guest.adults + guest.children} · {guest.rsvp}</td></tr>)}
      </tbody></table>
      {!event.guests.length && <p>No guest invitations entered yet.</p>}
    </section>}

    {sections.includes('Recipe sheets') && <section>
      <h2>Recipe sheets</h2>
      {event.dishes.map(dish => <section key={dish.id}>
        <h3>{dish.name}</h3>
        <p>{dish.course} · Prepared by {dish.owner || '—'}<br />{dish.baseServings} original serving{dish.baseServings === 1 ? '' : 's'} · {dish.servings} planned serving{dish.servings === 1 ? '' : 's'}</p>
        <table><thead><tr><th>Ingredient</th><th>Quantity for {dish.servings} serving{dish.servings === 1 ? '' : 's'}</th><th>Aisle</th></tr></thead><tbody>
          {dish.ingredients.map(ingredient => <tr key={ingredient.id}><td>{ingredient.name}</td><td>{quantity(ingredient.quantity * dish.servings / dish.baseServings)} {ingredient.unit}</td><td>{ingredient.aisle}</td></tr>)}
        </tbody></table>
        {!dish.ingredients.length && <p>No ingredients entered for this recipe.</p>}
        <p><strong>Recipe link</strong><br />{dish.recipe || 'No recipe link entered.'}</p>
        <p className="preserve-lines"><strong>Recipe & preparation notes</strong><br />{dish.notes || 'No recipe notes entered.'}</p>
      </section>)}
      {!event.dishes.length && <p>No recipes entered yet.</p>}
    </section>}

    {sections.includes('Portion plan') && <section>
      <h2>Portion plan</h2>
      <p><strong>{confirmedCount(event)} confirmed {confirmedCount(event) === 1 ? 'person' : 'people'}</strong> · Servings shown are the amounts you entered for each dish.</p>
      <table><thead><tr><th>Dish</th><th>Course</th><th>Planned servings</th><th>Prepared by</th></tr></thead><tbody>
        {event.dishes.map(dish => <tr key={dish.id}><td>{dish.name}</td><td>{dish.course}</td><td>{dish.servings}</td><td>{dish.owner || '—'}</td></tr>)}
      </tbody></table>
      {!event.dishes.length && <p>Add a dish and its planned servings to build your portion plan.</p>}
    </section>}

    {sections.includes('Kitchen & decor inventory') && <section>
      <h2>Kitchen & decor inventory</h2>
      <table><thead><tr><th>Item / category</th><th>Have</th><th>Need</th><th>Source / notes</th></tr></thead><tbody>
        {event.inventory.map(item => <tr key={item.id}><td>{item.name}<br /><small>{item.category}</small></td><td>{quantity(item.have)} {item.unit}</td><td>{quantity(item.need)} {item.unit}</td><td>{item.source || '—'}{item.notes && <p className="preserve-lines">{item.notes}</p>}</td></tr>)}
      </tbody></table>
      {!event.inventory.length && <p>No kitchen or decor inventory entered yet.</p>}
      {event.decor && <><h3>Table & decor notes</h3><p className="preserve-lines">{event.decor}</p></>}
    </section>}

    {sections.includes('Leftovers') && <section>
      <h2>Leftovers</h2>
      <table><thead><tr><th>Food / quantity</th><th>Status / storage</th><th>Packed / recipient</th><th>Plan / notes</th></tr></thead><tbody>
        {event.leftovers.map(item => <tr key={item.id}><td>{item.name}<br /><small>{quantity(item.quantity)} {item.unit}</small></td><td>{item.status}<br /><small>{item.storage || '—'}</small></td><td>{dateLabel(item.packedOn)}<br /><small>{item.recipient || '—'}</small></td><td>{item.plan || '—'}{item.notes && <p className="preserve-lines">{item.notes}</p>}</td></tr>)}
      </tbody></table>
      {!event.leftovers.length && <p>No leftovers entered yet.</p>}
    </section>}

    {sections.includes('Activities & traditions') && <section>
      <h2>Activities & traditions</h2>
      <table><thead><tr><th>Activity</th><th>When</th><th>Host / supplies</th><th>Notes / link</th></tr></thead><tbody>
        {[...event.activities].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).map(activity => <tr key={activity.id}><td>{activity.title}{activity.done ? ' (done)' : ''}<br /><small>{activity.category}</small></td><td>{dateLabel(activity.date)}<br />{timeLabel(activity.time)}</td><td>{activity.owner || '—'}<br /><small>{activity.supplies || 'No supplies entered.'}</small></td><td>{activity.notes || '—'}{activity.link && <p>{activity.link}</p>}</td></tr>)}
      </tbody></table>
      {!event.activities.length && <p>No activities or traditions entered yet.</p>}
    </section>}

    {sections.includes('Hosting notebook') && <section>
      <h2>Hosting notebook</h2>
      {notebookSections.map(section => <div key={section}>
        <h3>{section || 'Notes'}</h3>
        {event.notebook.filter(entry => entry.section === section).map(entry => <div key={entry.id}>
          <p><strong>{entry.title}</strong><br /><small>{dateLabel(entry.date)} · {entry.owner || '—'}</small></p>
          <p className="preserve-lines">{entry.notes || 'No notes entered.'}</p>
          {entry.link && <p>{entry.link}</p>}
        </div>)}
      </div>)}
      {!event.notebook.length && <p>No hosting notebook entries yet.</p>}
    </section>}

    {sections.includes('Online orders') && <section>
      <h2>Online orders</h2>
      <table><thead><tr><th>Order / store</th><th>Progress / dates</th><th>Estimated / actual</th><th>Link / notes</th></tr></thead><tbody>
        {event.orders.map(order => <tr key={order.id}><td>{order.name}<br /><small>{order.store || '—'}</small></td><td>{order.status}<br /><small>Ordered: {dateLabel(order.orderedOn)}<br />Expected: {dateLabel(order.expectedOn)}</small></td><td>{money(order.estimated, event.currency)} / {order.actual === null ? '—' : money(order.actual, event.currency)}<br /><small>{order.includeInBudget && order.status !== 'Returned' ? 'Included in budget' : 'Excluded from budget'}</small></td><td>{order.link || '—'}{order.notes && <p className="preserve-lines">{order.notes}</p>}</td></tr>)}
      </tbody></table>
      {!event.orders.length && <p>No online orders entered yet.</p>}
    </section>}

    {sections.includes('Seating plan') && <section>
      <h2>Seating plan</h2>
      <table><thead><tr><th>Guest household</th><th>People / RSVP</th><th>Seat or table</th><th>Dietary notes</th></tr></thead><tbody>
        {event.guests.map(guest => <tr key={guest.id}><td>{guest.name}</td><td>{guest.adults + guest.children} · {guest.rsvp}<br /><small>Adults: {guest.adults} · Children: {guest.children}</small></td><td>{guest.seat || 'Not assigned'}</td><td>{guest.dietary || '—'}</td></tr>)}
      </tbody></table>
      {!event.guests.length && <p>Add guest households and seat notes to create your seating plan.</p>}
    </section>}

    {sections.includes('Food labels') && <section className="place-card-section">
      <h2>Food labels</h2>
      <div className="place-cards">
        {event.dishes.map(dish => <div className="place-card" key={dish.id}><span>{dish.course}</span><strong>{dish.name}</strong><span>Prepared by {dish.owner || '—'}</span><small>AurelyStudio</small></div>)}
      </div>
      {!event.dishes.length && <p>Add a dish to create its food label.</p>}
    </section>}

    {sections.includes('Week at a glance') && <section>
      <h2>Week at a glance</h2>
      <p>{formatDate(weekStart, true)} – {formatDate(weekDays[6], true)}</p>
      {weekDays.map(date => {
        const tasks = event.tasks.filter(task => task.date === date);
        const slots = event.slots.filter(slot => slot.date === date).sort((a, b) => a.time.localeCompare(b.time));
        const activities = event.activities.filter(activity => activity.date === date).sort((a, b) => a.time.localeCompare(b.time));
        return <div key={date}>
          <h3>{parseDate(date).toLocaleDateString('en-US', { weekday: 'long' })} · {formatDate(date, true)}</h3>
          {tasks.map(task => <p className="print-task" key={'task-' + task.id}><span>{task.done ? '☑' : '☐'}</span><span>{task.title}<br /><small>{task.category} · {task.owner || '—'}</small></span></p>)}
          {slots.map(slot => <p className="print-task" key={'slot-' + slot.id}><span>{slot.done ? '☑' : '☐'}</span><span>{formatTime(slot.time)} · {slot.title}<br /><small>{slot.resource} · {slot.minutes} min{slot.temperature ? ' · ' + slot.temperature : ''} · {slot.owner || '—'}</small></span></p>)}
          {activities.map(activity => <p className="print-task" key={'activity-' + activity.id}><span>{activity.done ? '☑' : '☐'}</span><span>{activity.time ? formatTime(activity.time) + ' · ' : ''}{activity.title}<br /><small>{activity.category} · {activity.owner || '—'}</small></span></p>)}
          {!tasks.length && !slots.length && !activities.length && <p>No tasks, cooking steps or activities planned.</p>}
        </div>;
      })}
    </section>}

    {sections.includes('Kitchen reference') && <section>
      <h2>Kitchen reference</h2>
      <h3>US volume measures</h3>
      <table><thead><tr><th>Measure</th><th>Equivalent</th><th>Approximate milliliters</th></tr></thead><tbody>
        <tr><td>1 US cup</td><td>16 tablespoons · 48 teaspoons · 8 US fluid ounces</td><td>236.59 mL</td></tr>
        <tr><td>1 US tablespoon</td><td>3 teaspoons · ½ US fluid ounce</td><td>14.79 mL</td></tr>
        <tr><td>1 US teaspoon</td><td>⅓ tablespoon · ⅙ US fluid ounce</td><td>4.93 mL</td></tr>
      </tbody></table>
      <p>These are US customary volume measures. Metric values are rounded. Fluid ounces measure volume; ounces and grams measure weight. A dry ingredient’s weight per cup depends on the ingredient.</p>
      <p><small>Reference: NIST, Household Weights and Measures · nist.gov/pml/owm/metric-household</small></p>
    </section>}

    {sections.includes('Cleaning checklist') && <section>
      <h2>Cleaning & home checklist</h2>
      {[...cleaningTasks].sort((a, b) => a.date.localeCompare(b.date)).map(task => <p className="print-task" key={task.id}><span>{task.done ? '☑' : '☐'}</span><span>{task.title}<br /><small>{dateLabel(task.date)} · {task.category} · {task.owner || '—'}</small></span></p>)}
      {!cleaningTasks.length && <p>No cleaning or home tasks entered yet.</p>}
    </section>}

    {sections.includes('Planning pages') && <section>
      <h2>Planning pages</h2>
      <p>Use these blank writing pages for the notes you prefer to make by hand.</p>
      {NOTEBOOK_SECTIONS.map(section => <section className="planning-writing-section" key={section}>
        <h3>{section}</h3>
        <p>{PLANNING_PROMPTS[section] || 'Plans, ideas and details to remember…'}</p>
        <table aria-label={section + ' blank writing space'}><tbody>
          {Array.from({ length: 6 }, (_, index) => <tr key={index}><td>&nbsp;</td></tr>)}
        </tbody></table>
      </section>)}
    </section>}
  </>;
}
