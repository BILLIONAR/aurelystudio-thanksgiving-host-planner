import { useId, useState } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import { daysUntil, formatDate, money, parseDate, quantity, type Gathering } from './model';
import { budgetAnalytics, type BudgetAnalytics, type BudgetCategory, type CategoryBudget } from './budget';
import { Icon } from './icons';
import './BudgetInsights.css';

type Props = { event: Gathering; onOpenBudget?: () => void; budgetActionLabel?: string };
const categoryColor = (key: BudgetCategory) => `var(--bi-${key})`;
const shortDay = (date: string) => parseDate(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

function SpendingTrend({ data, currency }: { data: BudgetAnalytics; currency: string }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [showDates, setShowDates] = useState(false);
  const gradientId = 'spending-' + useId().replace(/:/g, '');
  const selected = data.spendingDays.find(day => day.date === selectedDate) ?? data.spendingDays.at(-1);
  const first = data.spendingDays[0];
  const last = data.spendingDays.at(-1);
  const max = Math.max(data.datedActualCents, 100);
  const axisMoney = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: 'compact', maximumFractionDigits: 1 }).format(cents / 100);
  const span = first && last ? Math.max(1, daysUntil(last.date, first.date)) : 1;
  const point = (date: string, cents: number) => ({ x: data.spendingDays.length === 1 ? 232 : 65 + (first ? daysUntil(date, first.date) / span : 0) * 338, y: 192 - cents / max * 156 });
  const coordinates = data.spendingDays.map(day => ({ ...day, ...point(day.date, day.cumulativeCents) }));
  const path = coordinates.map((day, index) => index === 0 ? `M ${day.x} ${day.y}` : `H ${day.x} V ${day.y}`).join(' ');
  const area = coordinates.length > 1 ? `${path} L ${coordinates.at(-1)!.x} 192 L ${coordinates[0].x} 192 Z` : '';
  function selectPoint(event: KeyboardEvent<SVGCircleElement>, date: string) {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedDate(date); }
  }
  return <section className="bi-card bi-trend">
    <header className="bi-card-heading"><div><span className="bi-kicker">RECORDED PURCHASE DATES</span><h3>How spending added up</h3></div><span className="bi-small-total">{money(data.datedActualCents / 100, currency)}<small>dated actual costs</small></span></header>
    {first && last ? <>
      <svg className="bi-trend-svg" viewBox="0 0 420 250" role="group" aria-label={`Cumulative actual spending on ${data.spendingDays.length} recorded purchase date${data.spendingDays.length === 1 ? '' : 's'}. Select a point for details.`}>
        <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--main)" stopOpacity=".24" /><stop offset="100%" stopColor="var(--main)" stopOpacity=".015" /></linearGradient></defs>
        {[0, .5, 1].map(fraction => <g key={fraction} className="bi-chart-grid"><line x1="65" x2="403" y1={192 - fraction * 156} y2={192 - fraction * 156} /><text x="56" y={196 - fraction * 156} textAnchor="end">{axisMoney(max * fraction)}</text></g>)}
        {area && <path d={area} fill={`url(#${gradientId})`} />}
        {coordinates.length > 1 && <path d={path} className="bi-trend-line" />}
        {coordinates.map(day => <g key={day.date}>
          {selected?.date === day.date && <line x1={day.x} x2={day.x} y1="25" y2="192" className="bi-selected-guide" />}
          <circle cx={day.x} cy={day.y} r={selected?.date === day.date ? 6 : 4} className={`bi-trend-point ${selected?.date === day.date ? 'selected' : ''}`} tabIndex={0} role="button" aria-label={`${formatDate(day.date, true)}: ${money(day.actualCents / 100, currency)} paid; ${money(day.cumulativeCents / 100, currency)} cumulative.`} aria-pressed={selected?.date === day.date} onClick={() => setSelectedDate(day.date)} onFocus={() => setSelectedDate(day.date)} onMouseEnter={() => setSelectedDate(day.date)} onKeyDown={event => selectPoint(event, day.date)}><title>{shortDay(day.date)} · {money(day.cumulativeCents / 100, currency)} cumulative</title></circle>
        </g>)}
        {coordinates.length === 1 ? <text className="bi-chart-date" x="232" y="218" textAnchor="middle">{shortDay(first.date)}</text> : <><text className="bi-chart-date" x="65" y="218">{shortDay(first.date)}</text><text className="bi-chart-date" x="403" y="218" textAnchor="end">{shortDay(last.date)}</text></>}
      </svg>
      {data.spendingDays.length > 1 && <label className="bi-date-picker"><span>Inspect a purchase date</span><select value={selected?.date || ''} onChange={event => setSelectedDate(event.target.value)}>{data.spendingDays.map(day => <option key={day.date} value={day.date}>{formatDate(day.date, true)}</option>)}</select></label>}
      {selected && <div className="bi-date-detail" aria-live="polite"><span>{formatDate(selected.date, true)}<small>{selected.payments} recorded payment{selected.payments === 1 ? '' : 's'}</small></span><span><strong>{money(selected.actualCents / 100, currency)}</strong><small>{money(selected.cumulativeCents / 100, currency)} cumulative</small></span></div>}
      <p className="bi-chart-note">{first.date === last.date ? 'One recorded purchase date. Add spending dates to other actual costs to see the timeline grow.' : `${formatDate(first.date, true)} – ${formatDate(last.date, true)}. Steps change only on recorded purchase dates.`}</p>
    </> : <div className="bi-empty-chart"><Icon name="calendar" size={28} /><h4>No spending dates yet.</h4><p>Add a spending date to an actual cost in Shopping, expenses or Orders to build your timeline.</p></div>}
    <div className="bi-undated"><span>Actual costs without a spending date</span><strong>{money(data.undatedActualCents / 100, currency)}</strong><small>{data.undatedRecordCount} record{data.undatedRecordCount === 1 ? '' : 's'} · Included in your totals, separate from this timeline.</small></div>
    {data.spendingDays.length > 0 && <div className={`bi-date-values ${showDates ? 'open' : ''}`}><button className="bi-values-toggle" aria-expanded={showDates} aria-controls={gradientId + '-dates'} onClick={() => setShowDates(open => !open)}>{showDates ? 'Hide' : 'View'} spending dates & values</button><table id={gradientId + '-dates'}><thead><tr><th>Date</th><th>Paid that day</th><th>Cumulative</th></tr></thead><tbody>{data.spendingDays.map(day => <tr key={day.date}><td>{formatDate(day.date, true)}</td><td>{money(day.actualCents / 100, currency)}</td><td>{money(day.cumulativeCents / 100, currency)}</td></tr>)}</tbody></table></div>}
  </section>;
}

function CategoryDonut({ categories, total, currency, filter, onSelect }: { categories: CategoryBudget[]; total: number; currency: string; filter: BudgetCategory | 'all'; onSelect: (key: BudgetCategory) => void }) {
  const circumference = 2 * Math.PI * 73;
  const arcs = categories.map((category, index) => ({ ...category,
    length: total ? category.actualCents / total * circumference : 0,
    offset: total ? categories.slice(0, index).reduce((sum, row) => sum + row.actualCents, 0) / total * circumference : 0,
  }));
  return <section className="bi-card bi-category-card">
    <header className="bi-card-heading"><div><span className="bi-kicker">WHERE IT WENT</span><h3>A place for every cost</h3></div><Icon name="leaf" size={23} /></header>
    <div className="bi-donut-layout"><div className="bi-donut-visual"><svg viewBox="0 0 190 190" role="img" aria-label={total ? `Recorded spending by category: ${categories.map(category => `${category.label}, ${money(category.actualCents / 100, currency)}`).join('; ')}.` : 'No positive actual spending has been recorded.'}><circle cx="95" cy="95" r="73" className="bi-donut-track" />{arcs.filter(arc => arc.length > 0).map(arc => <circle key={arc.key} cx="95" cy="95" r="73" fill="none" stroke={categoryColor(arc.key)} strokeWidth="20" strokeDasharray={`${arc.length} ${circumference - arc.length}`} strokeDashoffset={-arc.offset} transform="rotate(-90 95 95)" />)}</svg><div className="bi-donut-center"><span>Actual total</span><strong>{money(total / 100, currency)}</strong><small>{total ? 'Select a category' : 'No paid amounts yet'}</small></div></div><div className="bi-donut-legend">{categories.map(category => <button key={category.key} className={`bi-category-button ${filter === category.key ? 'selected' : ''}`} aria-pressed={filter === category.key} onClick={() => onSelect(category.key)}><span className="bi-category-dot" style={{ '--category-color': categoryColor(category.key) } as CSSProperties} /><span><strong>{category.label}</strong><small>{total ? quantity(category.actualCents / total * 100) + '% of actual spending' : `${category.count} cost record${category.count === 1 ? '' : 's'}`}</small></span><b>{money(category.actualCents / 100, currency)}</b></button>)}</div></div>
    {!total && <p className="bi-chart-note">Your category chart fills as you enter actual costs. Estimates remain in the plan comparison below.</p>}
  </section>;
}

export function BudgetInsights({ event, onOpenBudget, budgetActionLabel = 'Manage budget' }: Props) {
  const data = budgetAnalytics(event);
  const [categoryFilter, setCategoryFilter] = useState<BudgetCategory | 'all'>('all');
  const [showRecords, setShowRecords] = useState(false);
  const fmt = (cents: number) => money(cents / 100, event.currency);
  const maxCategory = Math.max(1, ...data.categories.flatMap(category => [category.estimatedCents, category.actualCents]));
  const includedRows = data.rows.filter(row => categoryFilter === 'all' || row.category === categoryFilter);
  const categoryLabel = categoryFilter === 'all' ? 'All costs' : data.categories.find(category => category.key === categoryFilter)!.label;
  const largest = [...data.categories].sort((a, b) => b.actualCents - a.actualCents)[0];
  const used = data.budgetUsedPercent;
  function chooseCategory(key: BudgetCategory) { setCategoryFilter(current => current === key ? 'all' : key); setShowRecords(true); }

  return <section className="budget-insights" aria-label="Budget insights">
    <header className="bi-section-heading"><div><span className="bi-kicker">THE COST OF COMING TOGETHER</span><h2>Your budget, in balance.</h2><p>Real costs, a clear plan, and room for the gathering you want.</p></div>{onOpenBudget && <button className="text-button bi-budget-action" onClick={onOpenBudget}><Icon name="edit" size={16} />{budgetActionLabel}</button>}</header>
    <div className="bi-top-grid">
      <section className="bi-card bi-balance-card">
        <div className="bi-balance-heading"><span className="bi-kicker">ACTUAL SO FAR</span><span className={`bi-budget-status ${data.remainingCents !== null && data.remainingCents < 0 ? 'over' : ''}`}>{data.capCents === null ? 'Budget not set' : data.remainingCents! < 0 ? 'Over your budget' : 'Within your budget'}</span></div>
        <strong className="bi-main-amount">{fmt(data.actualCents)}</strong><p className="bi-payment-count">{data.actualRecordCount} cost{data.actualRecordCount === 1 ? '' : 's'} with an actual amount recorded</p>
        <div className="bi-limit-meta"><span>Hosting budget</span><strong>{data.capCents === null ? 'Not set' : fmt(data.capCents)}</strong></div><div className="bi-limit-track" role="img" aria-label={used === null ? 'No budget cap has been set.' : `${quantity(used)} percent of the hosting budget spent.`}><span style={{ width: `${used === null ? 0 : Math.min(100, Math.max(0, used))}%` }} /></div><div className="bi-limit-caption"><span>{used === null ? 'Set a limit when you are ready.' : `${quantity(used)}% spent`}</span><span>{data.remainingCents === null ? 'No cap applied' : data.remainingCents < 0 ? fmt(-data.remainingCents) + ' over' : fmt(data.remainingCents) + ' left'}</span></div>
        <div className="bi-balance-metrics"><div><span>Expected final total</span><strong>{fmt(data.projectedCents)}</strong><small>Actuals + remaining estimates</small></div><div><span>Per confirmed person</span><strong>{data.actualPerPersonCents === null ? '—' : fmt(data.actualPerPersonCents)}</strong><small>{data.confirmedPeople ? `${data.confirmedPeople} confirmed · ${fmt(data.projectedPerPersonCents!)} projected each` : 'Confirm guests to calculate this.'}</small></div></div>
        <div className={`bi-projection-note ${data.projectedOverspendCents ? 'over' : ''}`}><Icon name={data.projectedOverspendCents ? 'clock' : 'check'} size={17} /><span>{data.projectedOverspendCents === null ? 'A budget limit will show the room left in your plan.' : data.projectedOverspendCents > 0 ? `${fmt(data.projectedOverspendCents)} projected over your budget.` : `${fmt(data.projectedRemainingCents!)} left after the current plan.`}{data.unpricedCount > 0 && <small>{data.unpricedCount} cost{data.unpricedCount === 1 ? '' : 's'} still {data.unpricedCount === 1 ? 'needs' : 'need'} an estimate or actual amount.</small>}</span></div>
      </section>
      <CategoryDonut categories={data.categories} total={data.actualCents} currency={event.currency} filter={categoryFilter} onSelect={chooseCategory} />
    </div>
    <div className="bi-chart-grid-layout">
      <section className="bi-card bi-plan-chart"><header className="bi-card-heading"><div><span className="bi-kicker">PLAN & PAYMENT</span><h3>Estimates meet actuals</h3></div><div className="bi-bar-key"><span><i />Plan</span><span><i />Actual</span></div></header>
        {data.rows.length && (data.estimatedCents || data.actualCents) ? <div className="bi-category-bars">{data.categories.map(category => <div className="bi-category-bar-group" key={category.key}><button className="bi-bar-category" onClick={() => chooseCategory(category.key)} aria-pressed={categoryFilter === category.key}><span>{category.label}</span><Icon name="arrow" size={14} /></button><div className="bi-bar-row"><span>Plan</span><div className="bi-bar-track"><i className="planned" style={{ width: `${category.estimatedCents / maxCategory * 100}%` }} /></div><strong>{fmt(category.estimatedCents)}</strong></div><div className="bi-bar-row"><span>Actual</span><div className="bi-bar-track"><i style={{ width: `${category.actualCents / maxCategory * 100}%`, '--category-color': categoryColor(category.key) } as CSSProperties} /></div><strong>{fmt(category.actualCents)}</strong></div></div>)}</div> : <div className="bi-empty-chart"><Icon name="shopping" size={28} /><h4>{data.rows.length ? 'Give your plan a price.' : 'Your spending plan starts here.'}</h4><p>{data.rows.length ? 'Add estimates or actual amounts to see how your categories compare.' : 'Add groceries, expenses or an order you choose to include in your hosting budget.'}</p></div>}
        <p className="bi-chart-note">Every bar uses the same scale.{data.estimatedCents || data.actualCents ? ` Full width: ${fmt(maxCategory)}.` : ''} Select a category to see its source records.</p>
      </section>
      <SpendingTrend data={data} currency={event.currency} />
    </div>
    <section className="bi-card bi-values-card"><div className="bi-card-heading"><div><span className="bi-kicker">THE NUMBERS BEHIND THE CHARTS</span><h3>Every category, accounted for</h3></div><span className="bi-record-count">{data.rows.length} included record{data.rows.length === 1 ? '' : 's'}</span></div><p className="bi-table-hint">Scroll sideways for all values.</p><div className="bi-table-wrap" tabIndex={0} role="region" aria-label="Budget category values, scroll horizontally on smaller screens"><table className="bi-category-table"><caption className="sr-only">Category estimates, actual spending and projected final cost</caption><thead><tr><th>Category</th><th>Plan</th><th>Actual</th><th>Projected</th></tr></thead><tbody>{data.categories.map(category => <tr key={category.key}><th scope="row"><button className="bi-table-category" onClick={() => chooseCategory(category.key)} aria-pressed={categoryFilter === category.key}>{category.label}</button></th><td>{fmt(category.estimatedCents)}</td><td>{fmt(category.actualCents)}</td><td>{fmt(category.projectedCents)}</td></tr>)}</tbody><tfoot><tr><th scope="row">Total</th><td>{fmt(data.estimatedCents)}</td><td>{fmt(data.actualCents)}</td><td>{fmt(data.projectedCents)}</td></tr></tfoot></table></div><p className="bi-value-insight">{data.actualCents ? `${largest.label} currently accounts for ${fmt(largest.actualCents)} of your recorded spending.` : 'Enter actual costs to see which category takes the largest share.'} Projected totals use actual costs when recorded and estimates for the remaining rows.</p>
      <div className="bi-record-controls"><button className="text-button" aria-expanded={showRecords} onClick={() => setShowRecords(open => !open)}><Icon name="menu" size={16} />{showRecords ? 'Hide source records' : 'Explore source records'}</button>{showRecords && <div role="group" aria-label="Filter budget source records"><button aria-pressed={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')}>All costs</button>{data.categories.map(category => <button key={category.key} aria-pressed={categoryFilter === category.key} onClick={() => setCategoryFilter(category.key)}>{category.label}</button>)}</div>}</div>
      {showRecords && <div className="bi-source-records"><h4>{categoryLabel} · {includedRows.length} record{includedRows.length === 1 ? '' : 's'}</h4>{includedRows.length ? <><p className="bi-table-hint">Scroll sideways for all values.</p><div className="bi-table-wrap" tabIndex={0} role="region" aria-label="Budget source records, scroll horizontally on smaller screens"><table><caption className="sr-only">Saved records contributing to {categoryLabel.toLowerCase()}</caption><thead><tr><th>Record</th><th>Plan</th><th>Actual</th><th>Spent on</th></tr></thead><tbody>{includedRows.map(row => <tr key={row.id}><th scope="row">{row.name}</th><td>{fmt(row.estimatedCents)}</td><td>{row.actualCents === null ? '—' : fmt(row.actualCents)}</td><td>{row.spentOn ? formatDate(row.spentOn, true) : '—'}</td></tr>)}</tbody></table></div></> : <p>No included costs in this category yet.</p>}</div>}
      <footer className="bi-data-note">Pantry items, returned orders and orders tracked outside this budget are excluded. Spending dates are entered by you; undated costs stay in the totals. Per-person amounts are rounded to cents.</footer>
    </section>
  </section>;
}
