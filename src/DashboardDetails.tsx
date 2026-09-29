import type { ReactNode } from 'react';
import { COURSES, formatDate, formatTime, localDate, daysUntil, ovenConflicts, quantity } from './model';
import type { Gathering, Order } from './model';
import { Icon } from './icons';
import type { IconName } from './icons';
import './DashboardDetails.css';

type DashboardPage = 'guests' | 'menu' | 'shopping' | 'prep' | 'notebook' | 'table';
type DashboardProps = { event: Gathering; onNavigate: (page: DashboardPage) => void };

const plural = (value: number, noun: string) => `${value} ${value === 1 ? noun : /[^aeiou]y$/.test(noun) ? noun.slice(0, -1) + 'ies' : /(?:s|sh|ch|x|z)$/.test(noun) ? noun + 'es' : noun + 's'}`;

function DashboardLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button type="button" className="text-button dd-link" onClick={onClick}>{children}<Icon name="arrow" size={15} /></button>;
}

function DashboardHeading({ eyebrow, title, icon, id }: { eyebrow: string; title: string; icon: IconName; id: string }) {
  return <div className="dd-card-heading"><div><span className="eyebrow">{eyebrow}</span><h2 id={id}>{title}</h2></div><span className="dd-glass-icon"><Icon name={icon} size={21} /></span></div>;
}

function deliveryNote(order: Order, today: string) {
  if (order.status === 'To order') return 'Not ordered yet';
  if (order.status === 'Returned') return 'Marked returned';
  if (order.status === 'Arrived') return 'Marked arrived';
  if (!order.expectedOn) return 'Expected date not set';
  const days = daysUntil(order.expectedOn, today);
  if (days === 0) return 'Expected today';
  if (days < 0) return 'Expected date has passed';
  return `Expected in ${plural(days, 'day')}`;
}

export function DashboardDetails({ event, onNavigate }: DashboardProps) {
  const today = localDate();
  const activeGuests = event.guests.filter(guest => guest.rsvp !== 'Declined');
  const confirmedGuests = event.guests.filter(guest => guest.rsvp === 'Confirmed');
  const invitationsSent = activeGuests.filter(guest => guest.invitation === 'Sent').length;
  const waitingForReply = event.guests.filter(guest => guest.rsvp === 'Invited').length;
  const seatedGuests = confirmedGuests.filter(guest => guest.seat.trim()).length;
  const dietaryNotes = activeGuests.filter(guest => guest.dietary.trim()).length;
  const potluckNotes = activeGuests.filter(guest => guest.bringing.trim()).length;
  const courses = COURSES.map(course => {
    const dishes = event.dishes.filter(dish => dish.course === course);
    return { course, dishes: dishes.length, servings: dishes.reduce((total, dish) => total + dish.servings, 0) };
  });
  const plannedCourses = courses.filter(course => course.dishes > 0).length;
  const largestCourse = Math.max(0, ...courses.map(course => course.servings));
  const needed = event.groceries.filter(item => item.status === 'Needed').length;
  const bought = event.groceries.filter(item => item.status === 'Bought').length;
  const inPantry = event.groceries.filter(item => item.status === 'In pantry').length;
  const readyItems = bought + inPantry;
  const groceryCount = event.groceries.length;
  const shortages = event.inventory.map(item => ({ ...item, missing: Math.max(0, Math.round((item.need - item.have) * 100) / 100) })).filter(item => item.missing > 0);
  const tasksDone = event.tasks.filter(task => task.done).length;
  const prepAreaMap = new Map<string, { category: string; total: number; done: number }>();
  for (const task of event.tasks) {
    const category = task.category.trim() || 'Other';
    const area = prepAreaMap.get(category) ?? { category, total: 0, done: 0 };
    area.total += 1;
    if (task.done) area.done += 1;
    prepAreaMap.set(category, area);
  }
  const prepAreas = [...prepAreaMap.values()].sort((a, b) => b.total - a.total || a.category.localeCompare(b.category));
  const largestPrepArea = Math.max(0, ...prepAreas.map(area => area.total));
  const ordered = event.orders.filter(order => order.status === 'Ordered').length;
  const arrived = event.orders.filter(order => order.status === 'Arrived').length;
  const toOrder = event.orders.filter(order => order.status === 'To order').length;
  const openOrders = event.orders.filter(order => order.status === 'Ordered' || order.status === 'To order').sort((a, b) => {
    if (a.status !== b.status) return a.status === 'Ordered' ? -1 : 1;
    return (a.expectedOn || '9999-12-31').localeCompare(b.expectedOn || '9999-12-31');
  });
  const shownOrders = openOrders.length ? openOrders.slice(0, 3) : event.orders.filter(order => order.status === 'Arrived').slice(-3).reverse();
  const timeline = [...event.slots].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const conflicts = ovenConflicts(event);
  const gatheringDaySteps = event.slots.filter(slot => slot.date === event.date).length;
  const leftoversToPack = event.leftovers.filter(leftover => leftover.status === 'To pack').length;
  const leftoversPacked = event.leftovers.filter(leftover => leftover.status === 'Packed').length;
  const activitiesDone = event.activities.filter(activity => activity.done).length;
  const notebookSections = new Set(event.notebook.map(note => note.section)).size;
  const route: { title: string; icon: IconName; page: DashboardPage; detail: string; started: boolean; progress?: { value: number; total: number; label: string } }[] = [
    { title: 'Invite your people', icon: 'guests', page: 'guests', detail: activeGuests.length ? `${invitationsSent} of ${activeGuests.length} invitations sent` : 'Start your guest list', started: activeGuests.length > 0, progress: activeGuests.length ? { value: invitationsSent, total: activeGuests.length, label: 'Invitations sent' } : undefined },
    { title: 'Choose the menu', icon: 'menu', page: 'menu', detail: plannedCourses ? `${plural(plannedCourses, 'course')} planned` : 'Save a favorite dish', started: event.dishes.length > 0 },
    { title: 'Stock your kitchen', icon: 'shopping', page: 'shopping', detail: groceryCount ? `${readyItems} of ${groceryCount} items ready` : 'Check the pantry first', started: groceryCount > 0, progress: groceryCount ? { value: readyItems, total: groceryCount, label: 'Shopping items ready' } : undefined },
    { title: 'Make a prep plan', icon: 'prep', page: 'prep', detail: event.tasks.length ? `${tasksDone} of ${event.tasks.length} tasks done` : 'Add your prep checklist', started: event.tasks.length > 0, progress: event.tasks.length ? { value: tasksDone, total: event.tasks.length, label: 'Prep tasks completed' } : undefined },
    { title: 'Set your table', icon: 'leaf', page: 'table', detail: confirmedGuests.length ? `${seatedGuests} of ${confirmedGuests.length} guest entries seated` : event.decor.trim() ? 'Your decor notes are saved' : 'Plan the seats and details', started: Boolean(event.decor.trim() || seatedGuests), progress: confirmedGuests.length ? { value: seatedGuests, total: confirmedGuests.length, label: 'Confirmed guest entries with seats' } : undefined },
  ];

  return <div className="dashboard-details">
    <section className="panel dd-route" aria-labelledby="dd-route-title">
      <div className="dd-route-heading"><div><span className="eyebrow">FROM THE INVITATION TO THE TABLE</span><h2 id="dd-route-title">Your hosting route.</h2></div><p>Five places to keep the day in order. Pick up wherever you are.</p></div>
      <ol className="dd-route-list">{route.map((step, index) => <li key={step.page}><button type="button" className={`dd-route-step ${step.started ? 'is-started' : ''}`} onClick={() => onNavigate(step.page)}><span className="dd-route-top"><span className="dd-route-icon"><Icon name={step.icon} size={20} /></span><span className="dd-route-number data-font">0{index + 1}</span></span><strong>{step.title}</strong><span className="dd-route-detail data-font">{step.detail}</span>{step.progress ? <span className="dd-route-progress" role="progressbar" aria-label={step.progress.label} aria-valuemin={0} aria-valuemax={step.progress.total} aria-valuenow={step.progress.value}><span style={{ width: `${step.progress.value / step.progress.total * 100}%` }} /></span> : <span className="dd-route-unmeasured">{step.started ? 'Make it your own' : 'Open to begin'}<Icon name="arrow" size={12} /></span>}</button></li>)}</ol>
    </section>

    <section className="panel dd-prep-areas" aria-labelledby="dd-prep-areas-title"><div className="dd-prep-intro"><DashboardHeading eyebrow="THE WORK, BY AREA" title="Where your prep stands." icon="prep" id="dd-prep-areas-title" />{event.tasks.length ? <><div className="dd-prep-remaining"><strong className="data-font">{event.tasks.length - tasksDone}</strong><span>{event.tasks.length === tasksDone ? 'tasks left. Every recorded task is done.' : 'tasks left across your prep plan.'}</span></div><p>Compare the tasks planned for each area with the ones you’ve finished.</p><div className="dd-prep-legend"><span><i className="dd-prep-legend-total" />Planned</span><span><i className="dd-prep-legend-done" />Completed</span></div></> : <p>Add tasks for the kitchen, table, guest spaces and the rest of your day. Your area-by-area chart will grow with the list.</p>}<DashboardLink onClick={() => onNavigate('prep')}>{event.tasks.length ? 'Review Prep & cooking' : 'Add your prep list'}</DashboardLink></div>{prepAreas.length ? <div className="dd-prep-chart" role="group" aria-label="Prep task completion by area">{prepAreas.map(area => <div className="dd-prep-chart-row" key={area.category}><div className="dd-prep-chart-label"><strong>{area.category}</strong><span className="data-font"><strong>{area.done}</strong> / {area.total} done</span></div><div className="dd-prep-chart-track" role="img" aria-label={`${area.category}: ${area.done} of ${area.total} tasks completed`}><span className="dd-prep-chart-total" style={{ width: `${area.total / largestPrepArea * 100}%` }}><span className="dd-prep-chart-done" style={{ width: `${area.done / area.total * 100}%` }} /></span></div></div>)}</div> : <div className="dd-prep-chart-empty"><Icon name="prep" size={34} /><h3>A clear list makes a calmer day.</h3><span>No prep tasks recorded for this gathering yet.</span></div>}</section>

    <div className="dd-overview-grid">
      <section className="panel dd-menu-summary" aria-labelledby="dd-menu-title">
        <DashboardHeading eyebrow="A MENU WITH ROOM FOR YOUR FAVORITES" title="Every course, in view." icon="menu" id="dd-menu-title" />
        <div className="dd-course-list">{courses.map(course => <button type="button" className={`dd-course ${course.dishes ? 'is-planned' : ''}`} key={course.course} onClick={() => onNavigate('menu')}><span className="dd-course-name"><span className="dd-course-tick">{course.dishes ? <Icon name="check" size={13} /> : <span />}</span>{course.course}</span><span className="dd-course-amount data-font">{course.dishes ? <><strong>{plural(course.dishes, 'dish')}</strong><small>{quantity(course.servings)} planned servings</small></> : <span>Not planned</span>}</span>{largestCourse > 0 && <span className="dd-course-track" aria-hidden="true"><span style={{ width: `${course.servings / largestCourse * 100}%` }} /></span>}</button>)}</div>
        <p className="dd-footnote">Choose only the courses you want.{largestCourse > 0 ? ' Bars compare planned dish servings by course.' : ' Save a dish to see your course totals.'}</p>
        <DashboardLink onClick={() => onNavigate('menu')}>{event.dishes.length ? 'Review menu & recipes' : 'Add your first dish'}</DashboardLink>
      </section>

      <section className="panel dd-guest-summary" aria-labelledby="dd-guest-title">
        <DashboardHeading eyebrow="INVITATIONS & REPLIES" title="Who’s heard from you?" icon="guests" id="dd-guest-title" />
        <div className="dd-invitation-count">{activeGuests.length > 0 && <svg className="dd-invitation-ring" viewBox="0 0 64 64" role="img" aria-label={`${invitationsSent} of ${activeGuests.length} invitations marked sent`}><circle className="dd-ring-base" cx="32" cy="32" r="25" /><circle className="dd-ring-value" cx="32" cy="32" r="25" pathLength="100" strokeDasharray={`${invitationsSent / activeGuests.length * 100} 100`} transform="rotate(-90 32 32)" /><text x="32" y="37" className="data-font" textAnchor="middle">{Math.round(invitationsSent / activeGuests.length * 100)}%</text></svg>}<strong className="data-font">{invitationsSent}<span> / {activeGuests.length}</span></strong><div><span>invitations marked sent</span><small>Non-declined guest or household entries</small></div></div>
        {event.guests.length ? <><div className="dd-rsvp-list">{(['Invited', 'Confirmed', 'Declined'] as const).map(status => <div className="dd-rsvp-row" key={status}><span>{status === 'Invited' ? 'Awaiting a reply' : status}</span><strong className="data-font">{event.guests.filter(guest => guest.rsvp === status).length}<small>entries</small></strong></div>)}</div><div className="dd-guest-annotations"><span><Icon name="menu" size={15} /><strong className="data-font">{potluckNotes}</strong> bringing something</span><span><Icon name="leaf" size={15} /><strong className="data-font">{dietaryNotes}</strong> with dietary notes</span></div></> : <p className="dd-empty-copy">Keep contacts, invitation dates, replies and potluck plans together. Add yourself for a complete guest count.</p>}
        <DashboardLink onClick={() => onNavigate('guests')}>{event.guests.length ? waitingForReply ? 'Check invitations & replies' : 'Open the guest list' : 'Start your guest list'}</DashboardLink>
      </section>

      <section className="panel dd-shopping-summary" aria-labelledby="dd-shopping-title">
        <DashboardHeading eyebrow="FROM YOUR PANTRY TO YOUR LIST" title="What’s still needed?" icon="shopping" id="dd-shopping-title" />
        {groceryCount ? <><div className="dd-shopping-ready"><strong className="data-font">{readyItems}<span> / {groceryCount}</span></strong><span>shopping items ready</span></div><div className="dd-shopping-bar" role="img" aria-label={`${bought} bought, ${inPantry} in pantry, ${needed} needed`}><span className="dd-bought" style={{ width: `${bought / groceryCount * 100}%` }} /><span className="dd-pantry" style={{ width: `${inPantry / groceryCount * 100}%` }} /><span className="dd-needed" style={{ width: `${needed / groceryCount * 100}%` }} /></div><div className="dd-shopping-legend"><span><i className="dd-bought" /><strong className="data-font">{bought}</strong> Bought</span><span><i className="dd-pantry" /><strong className="data-font">{inPantry}</strong> In pantry</span><span><i className="dd-needed" /><strong className="data-font">{needed}</strong> Needed</span></div></> : <p className="dd-empty-copy">Check what you have, then add groceries or transfer the ingredients from your recipes.</p>}
        <div className="dd-supply-check"><div><span className="dd-supply-label">TABLEWARE & SUPPLIES</span><span className="data-font">{event.inventory.length ? shortages.length ? plural(shortages.length, 'supply gap') : 'Recorded quantities covered' : 'Not counted yet'}</span></div>{shortages.length ? <ul>{shortages.slice(0, 3).map(item => <li key={item.id}><span>{item.name}</span><strong className="data-font">{quantity(item.missing)}{item.unit ? ` ${item.unit}` : ''} short</strong></li>)}</ul> : <p>{event.inventory.length ? 'Your have / need amounts show no shortages.' : 'Count plates, tools and linens before buying more.'}</p>}</div>
        <div className="dd-card-actions"><DashboardLink onClick={() => onNavigate('shopping')}>{groceryCount ? 'Open shopping list' : 'Build your shopping list'}</DashboardLink><DashboardLink onClick={() => onNavigate('notebook')}>Check supplies</DashboardLink></div>
      </section>

      <section className="panel dd-delivery-summary" aria-labelledby="dd-delivery-title">
        <DashboardHeading eyebrow="KEEP AN EYE ON THE DOORSTEP" title="Orders & deliveries." icon="home" id="dd-delivery-title" />
        {event.orders.length ? <><div className="dd-order-statuses"><span><strong className="data-font">{toOrder}</strong> to order</span><span><strong className="data-font">{ordered}</strong> ordered</span><span><strong className="data-font">{arrived}</strong> arrived</span></div>{shownOrders.length ? <div className="dd-order-list">{shownOrders.map(order => <div className="dd-order-row" key={order.id}><span className="dd-order-icon"><Icon name={order.status === 'Arrived' ? 'check' : 'download'} size={17} /></span><div><strong>{order.name}</strong><span>{order.store || 'Store not noted'}{order.expectedOn ? ` · ${formatDate(order.expectedOn, true)}` : ''}</span><small className={order.status === 'Ordered' && order.expectedOn && order.expectedOn < today ? 'dd-date-attention' : ''}>{deliveryNote(order, today)}</small></div></div>)}</div> : <p className="dd-empty-copy">No open orders. Your returned orders are kept in the hosting notebook.</p>}<p className="dd-footnote">Expected dates come from your records. Mark arrivals as they reach you.</p></> : <p className="dd-empty-copy">Save the store, expected delivery date and order status for anything arriving before your gathering.</p>}
        <DashboardLink onClick={() => onNavigate('notebook')}>{event.orders.length ? 'Review your orders' : 'Add an online order'}</DashboardLink>
      </section>

      <section className="panel dd-kitchen-summary" aria-labelledby="dd-kitchen-title">
        <div className="dd-kitchen-heading"><DashboardHeading eyebrow="GIVE EACH DISH ITS MOMENT" title="Kitchen, in order." icon="clock" id="dd-kitchen-title" /><div className="dd-gathering-time"><span className="eyebrow">GATHERING DAY</span><strong>{formatDate(event.date, true)}</strong><span className="data-font">{formatTime(event.time)} · {plural(gatheringDaySteps, 'scheduled step')}</span></div></div>
        {conflicts.length > 0 && <div className="dd-oven-notice" role="status"><span className="dd-glass-icon"><Icon name="clock" size={18} /></span><div><strong>{plural(conflicts.length, 'oven overlap')} to review</strong>{conflicts.slice(0, 2).map(({ a, b }) => <p key={a.id + ':' + b.id}>{a.title} + {b.title} · {a.resource} · {formatDate(a.date, true)}</p>)}<DashboardLink onClick={() => onNavigate('prep')}>Adjust your oven plan</DashboardLink></div></div>}
        {timeline.length ? <ol className="dd-kitchen-list">{timeline.slice(0, 5).map(slot => <li key={slot.id} className={slot.done ? 'is-done' : ''}><div className="dd-timeline-time data-font"><strong>{formatTime(slot.time)}</strong><span>{formatDate(slot.date, true)}</span></div><span className="dd-timeline-mark">{slot.done ? <Icon name="check" size={14} /> : <span />}</span><div className="dd-timeline-copy"><strong>{slot.title}</strong><span>{slot.owner} · {slot.resource} · <span className="data-font">{slot.minutes} min</span>{slot.temperature ? ` · ${slot.temperature}` : ''}</span></div><span className="dd-step-state">{slot.done ? 'Done' : slot.date === event.date ? 'Gathering day' : 'Prep day'}</span></li>)}</ol> : <div className="dd-kitchen-empty"><span className="dd-empty-number data-font">01</span><div><h3>Start with the dish that needs the oven.</h3><p>Add the times from your recipes, then place the other cooking and serving steps around them.</p></div></div>}
        <div className="dd-kitchen-footer"><span>{timeline.length ? `${plural(timeline.filter(slot => slot.done).length, 'step')} complete${timeline.length > 5 ? ` · Showing 5 of ${timeline.length}` : ''}` : 'Overlapping steps on the same oven are flagged for review.'}</span><DashboardLink onClick={() => onNavigate('prep')}>{timeline.length ? 'Open the full cooking plan' : 'Add a cooking step'}</DashboardLink></div>
      </section>
    </div>

    <section className="panel dd-little-things" aria-labelledby="dd-little-things-title"><div className="dd-little-heading"><span className="eyebrow">BEYOND THE MAIN DISH</span><h2 id="dd-little-things-title">Leave room for the little things.</h2></div><div className="dd-little-grid"><button type="button" onClick={() => onNavigate('notebook')}><span className="dd-glass-icon"><Icon name="shopping" size={20} /></span><div><strong>Leftovers, with a plan</strong><span className="data-font">{event.leftovers.length ? `${leftoversToPack} to pack · ${leftoversPacked} packed` : 'Choose containers and recipients'}</span></div><Icon name="arrow" size={15} /></button><button type="button" onClick={() => onNavigate('notebook')}><span className="dd-glass-icon"><Icon name="heart" size={20} /></span><div><strong>A game, a story, a tradition</strong><span className="data-font">{event.activities.length ? `${plural(event.activities.length, 'activity')} · ${activitiesDone} done` : 'Add something to share together'}</span></div><Icon name="arrow" size={15} /></button><button type="button" onClick={() => onNavigate('notebook')}><span className="dd-glass-icon"><Icon name="leaf" size={20} /></span><div><strong>Ideas worth keeping</strong><span className="data-font">{event.notebook.length ? `${plural(event.notebook.length, 'note')} in ${plural(notebookSections, 'section')}` : 'Save priorities, thank-yous and next ideas'}</span></div><Icon name="arrow" size={15} /></button></div><div className="dd-keepsake-link"><span>{event.memories.length ? `${plural(event.memories.length, 'memory')} kept for this gathering.` : 'One small memory can become next year’s favorite tradition.'}</span><DashboardLink onClick={() => onNavigate('table')}>{event.memories.length ? 'Revisit your memories' : 'Keep a little gratitude'}</DashboardLink></div></section>
  </div>;
}
