import React from 'react';

export const Seat: React.FC<{x: number;y: number;scale?: number;side?: number;label?: string}> = ({x,y,scale=1,side=1,label='13A'}) => <g transform={`translate(${x},${y}) scale(${scale})`} strokeLinejoin="round">
  <ellipse cx="0" cy="526" rx="143" ry="27" fill="#071B2A" opacity=".4"/>
  <path d="M-102 397 L-114 517 L-80 523 L-58 416 M74 411 L82 520 L113 516 L108 397" fill="#3A5267" stroke="#1C3347" strokeWidth="7"/>
  <path d="M-124 53 Q-125 1 -75 0 L73 0 Q121 5 123 54 L109 355 Q105 409 64 420 L-66 420 Q-109 406 -110 361 Z" fill="#1D3F5A" stroke="#122D44" strokeWidth="8"/>
  <path d="M-104 68 Q-105 27 -70 23 L64 23 Q99 28 102 66 L91 308 L-93 308 Z" fill="#315976"/>
  <path d="M-85 94 Q-81 60 -50 59 L45 59 Q76 62 81 93 L72 142 L-75 142 Z" fill="#4F7892"/>
  <path d="M-48 29 L42 29 L46 100 Q0 114 -52 101 Z" fill="#ABC4C9"/>
  <path d="M-46 33 L40 33" stroke="#DAE2D9" strokeWidth="5"/>
  <path d="M-84 165 L-74 291 M76 165 L67 290" stroke="#527C91" strokeWidth="4" fill="none"/>
  <path d="M-97 314 Q-5 288 95 316 L122 389 Q4 430 -122 389 Z" fill="#416984" stroke="#1D3A52" strokeWidth="6"/>
  <path d="M-115 387 Q1 413 116 385 L111 420 Q-5 446 -112 415 Z" fill="#244B67"/>
  <path d="M-128 271 Q-144 271 -143 286 L-135 362 Q-112 378 -100 360 L-106 288 Z M126 271 Q144 271 142 288 L135 360 Q113 376 101 359 L107 289 Z" fill="#9AAEB4" stroke="#29465C" strokeWidth="6"/>
  <path d="M-135 287 L-110 286 M111 286 L135 286" stroke="#D2D9D2" strokeWidth="5"/>
  <path d={`M${side*75} 333 L${side*-18} 370 L${side*-75} 332`} fill="none" stroke="#182F40" strokeWidth="15"/>
  <rect x="-12" y="350" width="30" height="27" rx="5" fill="#A9B9BA" stroke="#284255" strokeWidth="3" transform="rotate(-13,0,360)"/>
  <text x="-82" y="201" fill="#A3BEC7" fontSize="17" fontFamily="Flight, sans-serif" letterSpacing="2">{label}</text>
</g>;

export const Cabin: React.FC<{frame: number; emergency?: boolean; instance: string}> = ({frame,emergency=false,instance}) => {
  const p = instance;
  return <g>
    <defs>
      <linearGradient id={`${p}-wall`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#7895A3"/><stop offset=".58" stopColor="#42657D"/><stop offset="1" stopColor="#213B55"/></linearGradient>
      <linearGradient id={`${p}-ceiling`} x1="0" x2="0" y1="0" y2="1"><stop stopColor="#152D49"/><stop offset="1" stopColor="#5D8090"/></linearGradient>
      <linearGradient id={`${p}-floor`} x1="0" x2="0" y1="0" y2="1"><stop stopColor="#29455B"/><stop offset="1" stopColor="#12263E"/></linearGradient>
      <linearGradient id={`${p}-night`}><stop stopColor="#142D4C"/><stop offset="1" stopColor="#284C70"/></linearGradient>
      <linearGradient id={`${p}-beam`} x1="0" x2="0" y1="0" y2="1"><stop stopColor="#F4DEAA" stopOpacity=".18"/><stop offset="1" stopColor="#F4DEAA" stopOpacity="0"/></linearGradient>
    </defs>
    <rect width="1080" height="1920" fill={`url(#${p}-wall)`}/>
    <path d="M-100 0 L1180 0 L805 664 Q539 611 274 664 Z" fill={`url(#${p}-ceiling)`}/>
    <path d="M-100 0 L210 0 L390 632 L275 666 L-100 439 Z M870 0 L1180 0 L1180 440 L805 667 L692 632 Z" fill="#91A8AC"/>
    <path d="M-100 352 L274 666 L305 731 L-50 528 M1180 352 L806 666 L775 731 L1130 528" fill="#34546C" stroke="#213E56" strokeWidth="9"/>
    <path d="M198 0 L388 624 M883 0 L693 624" fill="none" stroke="#D3CBAA" strokeWidth="12"/>
    <path d="M205 0 L395 624 M876 0 L686 624" fill="none" stroke={emergency?'#F58E78':'#DFE7C3'} strokeWidth="4"/>
    {[0,1,2,3,4].map(i => {
      const yy=70+i*119; const inset=i*28;
      return <g key={i} stroke="#57778B" strokeWidth="4" fill="none">
        <path d={`M${-10+inset} ${yy} L${230+inset/1.5} ${yy+91} M${1090-inset} ${yy} L${850-inset/1.5} ${yy+91}`}/>
        <path d={`M${95+inset} ${yy+44} l45 18 M${985-inset} ${yy+44} l-45 18`} stroke="#D7E0D6" strokeWidth="6"/>
      </g>;
    })}
    <path d="M393 635 L687 635 L1003 1920 L77 1920 Z" fill={`url(#${p}-floor)`}/>
    <path d="M462 720 L346 1920 M618 720 L735 1920" stroke="#536D7D" strokeWidth="3" opacity=".4"/>
    {[840,1020,1280,1660].map(y=><path key={y} d={`M280 ${y} H810`} stroke="#718591" opacity=".12" strokeWidth="3"/>)}
    <path d="M375 647 Q541 580 704 647 L711 835 L370 835 Z" fill="#36586D" stroke="#1B3D55" strokeWidth="8"/>
    <rect x="459" y="650" width="159" height="174" rx="30" fill="#65818C" stroke="#294A60" strokeWidth="6"/>
    <rect x="504" y="674" width="71" height="78" rx="19" fill="#253F55"/>
    <path d="M588 777 h-18" stroke="#D3D9CD" strokeWidth="6" strokeLinecap="round"/>
    <rect x="490" y="601" width="100" height="29" rx="7" fill={emergency?'#BA6259':'#67938F'}/>
    <text x="540" y="623" textAnchor="middle" fill="#E9EDD5" fontFamily="Flight, sans-serif" fontSize="17" letterSpacing="3">EXIT</text>
    {[{x:30,y:595,s:1.17},{x:187,y:675,s:.8},{x:290,y:726,s:.48}].map(({x,y,s},i)=><React.Fragment key={i}>
      {[false,true].map(right=><g key={String(right)} transform={`translate(${right?1080-x-116*s:x},${y}) scale(${s})`}>
        <rect x="-12" y="-11" width="139" height="205" rx="62" fill="#7994A2" stroke="#3D6079" strokeWidth="5"/>
        <rect width="115" height="183" rx="53" fill={`url(#${p}-night)`} stroke="#B2C1BD" strokeWidth="8"/>
        <path d="M8 121 Q49 107 107 130 L107 156 Q63 143 8 162 Z" fill="#486A87" opacity=".6"/>
        <path d="M14 88 L93 83 L108 90 L34 98 Z" fill="#7894AA" opacity=".7"/>
        {[{x:27,y:39},{x:75,y:50},{x:86,y:23}].map((v,k)=><circle key={k} cx={v.x} cy={v.y} r="1.8" fill="#E6EDE5" opacity={.45+.2*Math.sin(frame/40+k)}/>)}
        <path d="M9 171 Q55 183 109 170" stroke="#D7D8C7" fill="none" strokeWidth="5"/>
      </g>)}
    </React.Fragment>)}
    <path d="M0 1050 L351 858 M1080 1050 L729 858" stroke="#8BA2A7" strokeWidth="9" opacity=".5"/>
    <path d="M0 1100 L351 888 M1080 1100 L729 888" stroke="#213F58" strokeWidth="20"/>
    {[{x:394,y:786,s:.38},{x:681,y:786,s:.38},{x:305,y:898,s:.6},{x:780,y:898,s:.6},{x:160,y:1128,s:.89},{x:925,y:1128,s:.89}].map((s,i)=><Seat key={i} {...s} label={`${10+i}A`} side={i%2?1:-1}/>)}
    {[{x:360,y:450,s:.6},{x:720,y:450,s:.6},{x:281,y:211,s:.85},{x:802,y:211,s:.85}].map((o,i)=><g key={i} transform={`translate(${o.x},${o.y}) scale(${o.s})`}>
      <rect x="-46" y="-18" width="92" height="38" rx="18" fill="#42647C"/>
      <circle cx="-20" r="10" fill="#233F57" stroke="#A0B5B7" strokeWidth="3"/>
      <circle cx="17" r="9" fill={emergency?'#FF927B':'#FFE5A9'}/>
      <path d="M12 20 L-64 280 L105 280 L23 20 Z" fill={`url(#${p}-beam)`}/>
    </g>)}
  </g>;
};
