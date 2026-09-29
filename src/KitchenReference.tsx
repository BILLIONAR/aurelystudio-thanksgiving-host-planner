import { useState } from 'react';
import { quantity } from './model';
import { Icon } from './icons';

const VOLUME_UNITS = { 'US cup': 48, 'Tablespoon': 3, 'Teaspoon': 1, 'US fluid ounce': 6 };
type VolumeUnit = keyof typeof VOLUME_UNITS;
export function KitchenReference() {
  const [value, setValue] = useState('1');
  const [from, setFrom] = useState<VolumeUnit>('US cup');
  const [to, setTo] = useState<VolumeUnit>('Tablespoon');
  const [temperature, setTemperature] = useState('350');
  const [scale, setScale] = useState('Fahrenheit');
  const amount = Number(value);
  const degrees = Number(temperature);
  const volumeResult = value !== '' && Number.isFinite(amount) && amount >= 0 ? quantity(amount * VOLUME_UNITS[from] / VOLUME_UNITS[to]) : '—';
  const temperatureResult = temperature !== '' && Number.isFinite(degrees) ? quantity(scale === 'Fahrenheit' ? (degrees - 32) * 5 / 9 : degrees * 9 / 5 + 32) : '—';
  return <section className="panel kitchen-reference"><div className="section-title"><div><span className="eyebrow">A SMALL KITCHEN REFERENCE</span><h2>Measures, made simpler.</h2></div><Icon name="menu" size={23} /></div><p className="hint">US volume measures: 1 cup = 16 tablespoons = 48 teaspoons = 8 fluid ounces. Ingredient weights depend on the ingredient.</p><div className="kitchen-converters"><div><h3>Volume conversion</h3><div className="conversion-fields"><label className="field"><span>Amount to convert</span><input type="number" min="0" max="1000000" step="any" value={value} onChange={e => setValue(e.target.value)} /></label><label className="field"><span>From volume unit</span><select value={from} onChange={e => setFrom(e.target.value as VolumeUnit)}>{Object.keys(VOLUME_UNITS).map(u => <option key={u}>{u}</option>)}</select></label><label className="field"><span>To volume unit</span><select value={to} onChange={e => setTo(e.target.value as VolumeUnit)}>{Object.keys(VOLUME_UNITS).map(u => <option key={u}>{u}</option>)}</select></label></div><output className="conversion-output data-font" aria-live="polite">{volumeResult} <small>{to.toLowerCase()}{volumeResult === '1' ? '' : 's'}</small></output></div><div><h3>Temperature conversion</h3><div className="conversion-fields temperature-fields"><label className="field"><span>Temperature to convert</span><input type="number" step="any" value={temperature} onChange={e => setTemperature(e.target.value)} /></label><label className="field"><span>Temperature scale</span><select value={scale} onChange={e => setScale(e.target.value)}><option>Fahrenheit</option><option>Celsius</option></select></label></div><output className="conversion-output data-font" aria-live="polite">{temperatureResult} <small>{scale === 'Fahrenheit' ? '°C' : '°F'}</small></output><p className="hint">Convert the setting in your own recipe. This calculator does not select cooking times or safe food temperatures.</p></div></div></section>;
}
