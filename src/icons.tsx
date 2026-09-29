import { useId } from 'react';
export type IconName = 'home' | 'guests' | 'menu' | 'shopping' | 'prep' | 'heart' | 'theme' | 'print' | 'settings' | 'plus' | 'arrow' | 'check' | 'close' | 'edit' | 'trash' | 'chevron' | 'clock' | 'download' | 'leaf' | 'search' | 'calendar' | 'bars';
const paths: Record<IconName, string> = {
  bars: 'M4 6h16M4 12h16M4 18h16', home: 'M3 10 12 3l9 7v10H3V10Zm6 10v-7h6v7', guests: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.9M15 3.2a4 4 0 0 1 0 7.6M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  menu: 'M5 3v6m4-6v6M3 3v5a4 4 0 0 0 8 0V3M7 12v9m12 0V3c-3 0-5 5-5 9h5', shopping: 'M6 7h14l-2 9H8L5 3H2m7 17h.01M17 20h.01', prep: 'M8 3v4m8-4v4M3 9h18M5 5h14a2 2 0 0 1 2 2v13H3V7a2 2 0 0 1 2-2Zm3 8h3m-3 4h7',
  heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z', theme: 'M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 0-4h-1a2 2 0 0 1 0-4h3a6 6 0 0 0 6-5c0-3-4-5-9-5ZM7 8h.01M11 6h.01M16 7h.01M5 13h.01',
  print: 'M6 9V3h12v6M6 17H3V9h18v8h-3M6 14h12v7H6v-7ZM17 11h.01', settings: 'M4 6h16M4 12h16M4 18h16M8 3v6m8 0v6M10 15v6', plus: 'M12 5v14M5 12h14', arrow: 'M4 12h16m-6-6 6 6-6 6', check: 'M5 12 10 17 20 6', close: 'M6 6l12 12M18 6 6 18', edit: 'm15 4 5 5M4 20l1-5L16 4a2 2 0 0 1 3 3L8 19l-4 1Z', trash: 'M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7', chevron: 'm9 5 7 7-7 7', clock: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0', download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5', leaf: 'M20 3C9 2 2 8 5 16s15 5 15-13ZM5 19 17 7M9 14v-4m4 0h4', search: 'm16 16 5 5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0', calendar: 'M8 3v4m8-4v4M3 10h18M5 5h14a2 2 0 0 1 2 2v14H3V7a2 2 0 0 1 2-2',
};
export function Icon({ name, size = 20 }: { name: IconName; size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>; }
export function HarvestArt() {
  const id = useId();
  return <svg className="harvest-art" viewBox="0 0 450 300" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id={id+'-glass'} x1="130" y1="91" x2="300" y2="244" gradientUnits="userSpaceOnUse"><stop stopColor="#FFFFFF" stopOpacity=".94"/><stop offset=".23" stopColor="var(--accent)" stopOpacity=".42"/><stop offset=".6" stopColor="var(--accent)" stopOpacity=".75"/><stop offset=".86" stopColor="var(--main)" stopOpacity=".91"/><stop offset="1" stopColor="#FFDFC0" stopOpacity=".8"/></linearGradient>
      <linearGradient id={id+'-rib'} x1="155" y1="110" x2="280" y2="235" gradientUnits="userSpaceOnUse"><stop stopColor="#FFFFFF" stopOpacity=".82"/><stop offset=".38" stopColor="var(--accent)" stopOpacity=".12"/><stop offset=".73" stopColor="var(--main)" stopOpacity=".35"/><stop offset="1" stopColor="#FFF9ED" stopOpacity=".6"/></linearGradient>
      <linearGradient id={id+'-stem'} x1="213" y1="54" x2="242" y2="108" gradientUnits="userSpaceOnUse"><stop stopColor="#F8E3B2"/><stop offset=".42" stopColor="var(--accent)"/><stop offset="1" stopColor="var(--main)"/></linearGradient>
      <linearGradient id={id+'-leaf'} x1="318" y1="150" x2="390" y2="209" gradientUnits="userSpaceOnUse"><stop stopColor="#F4DBA6"/><stop offset=".3" stopColor="var(--accent)"/><stop offset="1" stopColor="var(--main)"/></linearGradient>
      <filter id={id+'-shadow'} x="-40%" y="-35%" width="180%" height="190%"><feDropShadow dx="8" dy="16" stdDeviation="11" floodColor="var(--main)" floodOpacity=".18"/></filter>
      <filter id={id+'-soft'}><feGaussianBlur stdDeviation="6"/></filter>
    </defs>
    <ellipse cx="241" cy="271" rx="123" ry="11" fill="var(--main)" opacity=".13" filter={'url(#'+id+'-soft)'}/>
    <ellipse cx="238" cy="259" rx="156" ry="24" fill="#FFF9EF" fillOpacity=".4" stroke="#FFFFFF" strokeOpacity=".9" strokeWidth="2"/>
    <ellipse cx="238" cy="263" rx="157" ry="23" stroke="var(--accent)" strokeOpacity=".24"/>
    <g filter={'url(#'+id+'-shadow)'}>
      <path d="M221 114c-8-20-4-43 16-61l10 9c-15 14-17 31-10 49Z" fill={'url(#'+id+'-stem)'} stroke="#FFFFFF" strokeOpacity=".45"/>
      <path d="M227 109c-2-17 2-31 13-44" stroke="#FFF0C6" strokeWidth="2" strokeOpacity=".6"/>
      <path d="M212 108c-18-12-45-7-62 12-27 30-30 74-10 101 20 28 56 35 85 29 29 6 66-3 85-31 19-29 9-76-19-99-20-15-40-20-59-10-7 1-14 1-20-2Z" fill={'url(#'+id+'-glass)'} stroke="#FFF6E7" strokeWidth="1.7"/>
      <ellipse cx="171" cy="179" rx="33" ry="67" transform="rotate(-9 171 179)" fill={'url(#'+id+'-rib)'} stroke="#FFFFFF" strokeOpacity=".38"/>
      <ellipse cx="277" cy="180" rx="34" ry="66" transform="rotate(9 277 180)" fill={'url(#'+id+'-rib)'} stroke="#FFFFFF" strokeOpacity=".38"/>
      <ellipse cx="196" cy="177" rx="31" ry="75" fill={'url(#'+id+'-rib)'} stroke="#FFFFFF" strokeOpacity=".42"/>
      <ellipse cx="254" cy="179" rx="31" ry="75" fill={'url(#'+id+'-rib)'} stroke="#FFF0D7" strokeOpacity=".5"/>
      <ellipse cx="224" cy="178" rx="31" ry="77" fill={'url(#'+id+'-rib)'} stroke="#FFF9EE" strokeOpacity=".8"/>
      <path d="M197 117c-12 23-17 45-14 68M220 117c-9 24-12 53-9 72M150 134c-8 18-10 32-7 46" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity=".73"/>
      <path d="M284 212c-5 14-17 24-26 26m-22 4c-13 4-28 3-35-1" stroke="#FFE8C3" strokeWidth="3" strokeLinecap="round" opacity=".72"/>
      <ellipse cx="212" cy="110" rx="8" ry="3" fill="#FFFDF9" opacity=".78"/>
    </g>
    <g transform="rotate(18 350 216)" filter={'url(#'+id+'-shadow)'}>
      <path d="M315 239c-15-38 4-69 39-84l-3 25 30-5-15 25 21 9-31 12 6 18-32-2-12 23Z" fill={'url(#'+id+'-leaf)'} stroke="#FFF0CF" strokeWidth="1.3"/>
      <path d="M318 260c13-26 24-52 35-86m-17 50 29-13m-27 3-14-15" stroke="#FFE8BA" strokeWidth="1.7" strokeLinecap="round" opacity=".85"/>
    </g>
    <path d="M354 128h10m-5-5v10" stroke="var(--accent)" strokeWidth="1.2" opacity=".7"/>
  </svg>;
}
