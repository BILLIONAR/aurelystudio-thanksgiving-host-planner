import { useId } from 'react';

/** Original harvest-table sculptures, drawn for this product. */
export function SeasonalBackdrop() {
 const id = useId();
 return <svg className="seasonal-backdrop" viewBox="0 0 1440 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
   <linearGradient id={id+'-amber'} x1=".13" y1=".07" x2=".9" y2=".95"><stop stopColor="#FFFFFF" stopOpacity=".82"/><stop offset=".29" stopColor="var(--accent)" stopOpacity=".2"/><stop offset=".67" stopColor="var(--main)" stopOpacity=".33"/><stop offset="1" stopColor="#FFFFFF" stopOpacity=".8"/></linearGradient>
   <linearGradient id={id+'-fold'} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#FFFFFF" stopOpacity=".83"/><stop offset=".42" stopColor="var(--accent)" stopOpacity=".19"/><stop offset="1" stopColor="var(--main)" stopOpacity=".29"/></linearGradient>
   <linearGradient id={id+'-grain'} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#FFFFFF" stopOpacity=".85"/><stop offset=".4" stopColor="var(--accent)" stopOpacity=".39"/><stop offset="1" stopColor="var(--main)" stopOpacity=".22"/></linearGradient>
   <filter id={id+'-depth'} x="-40%" y="-40%" width="200%" height="200%"><feDropShadow dx="13" dy="22" stdDeviation="13" floodColor="var(--main)" floodOpacity=".13"/></filter>
   <path id={id+'-leaf'} d="M0 143-15 86-57 105-40 64-89 45-44 26-70-9-28 5-24-46-3-26 0-106 21-37 42-60 37-8 77-17 59 22 107 33 65 62 77 98 34 83 14 145 7 182-1 182Z"/>
  </defs>
  <g className="harvest-maple" transform="translate(1352 400) rotate(-25) scale(1.65)" filter={'url(#'+id+'-depth)'}>
   <use href={'#'+id+'-leaf'} fill="var(--main)" fillOpacity=".12" transform="translate(4 7)"/>
   <use href={'#'+id+'-leaf'} fill={'url(#'+id+'-amber)'} stroke="#FFFFFF" strokeOpacity=".8" strokeWidth="1.4"/>
   <path d="M3 174 3-78m0 155 56-37M2 53-43 27m47 2 27-51M1 20-19-20m21 120 30-14M0 98-25 74" fill="none" stroke="#FFFFFF" strokeOpacity=".83" strokeWidth="2" strokeLinecap="round"/>
   <path d="m6-74 7 59m-51 45 14 11M69 37l-17 10" stroke="#FFFFFF" strokeOpacity=".82" strokeWidth="4" strokeLinecap="round"/>
  </g>
  <g className="harvest-maple maple-small" transform="translate(435 870) rotate(37) scale(.94)" filter={'url(#'+id+'-depth)'}>
   <use href={'#'+id+'-leaf'} fill={'url(#'+id+'-amber)'} stroke="#FFFFFF" strokeOpacity=".78" strokeWidth="1.7"/>
   <path d="M3 171 3-74m1 148 58-32M3 49-43 26m47-1 26-48M0 99-28 75" stroke="#FFFFFF" strokeWidth="2" strokeOpacity=".85" fill="none"/>
  </g>
  <g className="harvest-wheat" transform="translate(97 325) rotate(-23)" filter={'url(#'+id+'-depth)'}>
   <path d="M20 290Q34 172 29 30m-8 228Q-39 155-18 61M24 267Q92 166 104 97" fill="none" stroke="var(--accent)" strokeWidth="3" strokeOpacity=".32"/>
   {Array.from({length:7},(_,i)=><g key={i} transform={'translate('+(29+i*.5)+' '+(47+i*26)+')'}>
    <path d="M0 16C-24 9-34-9-27-25-8-20 3-7 0 16Z" fill={'url(#'+id+'-grain)'} stroke="#FFFFFF" strokeOpacity=".6"/>
    <path d="M0 28C23 16 28-1 21-16 4-7-3 10 0 28Z" fill={'url(#'+id+'-grain)'} stroke="#FFFFFF" strokeOpacity=".6"/>
   </g>)}
   <path d="M29 29c-6-16-5-34 2-49 12 17 13 36-2 49Z" fill={'url(#'+id+'-grain)'} stroke="#FFFFFF" strokeOpacity=".6"/>
  </g>
  <g className="harvest-napkin" transform="translate(1136 894) rotate(-16)" filter={'url(#'+id+'-depth)'}>
   <path d="M0 112-203-18-127-77 30 47Z" fill={'url(#'+id+'-fold)'} stroke="#FFFFFF" strokeOpacity=".83" strokeWidth="2"/>
   <path d="M0 112-127-77-52-100 30 47Z" fill={'url(#'+id+'-fold)'} stroke="#FFFFFF" strokeOpacity=".9" strokeWidth="2"/>
   <path d="M0 112-52-100 25-105 40 46Z" fill={'url(#'+id+'-fold)'} stroke="#FFFFFF" strokeOpacity=".87" strokeWidth="2"/>
   <path d="M0 112 25-105 104-69 47 47Z" fill={'url(#'+id+'-fold)'} stroke="#FFFFFF" strokeOpacity=".85" strokeWidth="2"/>
   <path d="M0 112 104-69 169-3 58 51Z" fill={'url(#'+id+'-fold)'} stroke="#FFFFFF" strokeOpacity=".8" strokeWidth="2"/>
   <path d="M0 112-28 167 23 172 61 53Z" fill={'url(#'+id+'-amber)'} stroke="#FFFFFF" strokeOpacity=".83" strokeWidth="2"/>
   <path d="m-116-65 98 166m-25-185 27 174m48-182-29 181" stroke="#FFFFFF" strokeOpacity=".5" strokeWidth="3" fill="none"/>
  </g>
 </svg>;
}

