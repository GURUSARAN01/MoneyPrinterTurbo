import React from 'react';
import {interpolate} from 'remotion';
import type {CharacterId} from '../manifest';

export type Expression = 'anxious' | 'startled' | 'infected' | 'resolve';
export type Pose = 'seated' | 'recoil' | 'reach' | 'brace';
type Props = {id: CharacterId; instance: string; frame: number; expression: Expression; pose: Pose; x: number; y: number; scale?: number; lean?: number; gaze?: number};
const colors = {
  maya: {skin: '#DDA079', shadow: '#B87660', hair: '#283341', coat: '#E97762', coatShade: '#B94D4B', shirt: '#F6E6CE', pants: '#293C58'},
  eli: {skin: '#D9BC9C', shadow: '#B99280', hair: '#5B4541', coat: '#809184', coatShade: '#526D66', shirt: '#E4D9C4', pants: '#34444C'},
  noah: {skin: '#9F6D59', shadow: '#7B4D44', hair: '#25323B', coat: '#4C86A8', coatShade: '#31566F', shirt: '#DFEAF0', pants: '#233951'},
};
const ease = (f: number, a: number, b: number) => interpolate(f, [a,b], [0,1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

/** Original jointed SVG cut-out rig. All poses are evaluated from the frame. */
export const Character: React.FC<Props> = ({id,instance,frame,expression,pose,x,y,scale=1,lean=0,gaze=0}) => {
  const c = colors[id];
  const zombie = expression === 'infected';
  const fear = expression === 'startled';
  const skin = zombie ? '#B8CDA5' : c.skin;
  const shadow = zombie ? '#7EAA8B' : c.shadow;
  const outline = '#293747';
  const phase = id === 'maya' ? 0 : id === 'eli' ? 1.6 : 3.2;
  const breath = Math.sin(frame / 18 + phase) * (zombie ? 3.2 : 1.4);
  const blinkTime = (frame + (id === 'maya' ? 0 : 34)) % 113;
  const blink = !zombie && blinkTime > 91 && blinkTime < 97;
  const recoil = pose === 'recoil' ? ease(frame, 5, 22) : 0;
  const reach = pose === 'reach' ? ease(frame, 8, 50) : 0;
  const tremble = zombie ? Math.sin(frame / 6) * 2 + Math.sin(frame / 13) * 3 : 0;
  const headAngle = zombie ? -12 + tremble : (fear ? 7 : -3) + Math.sin(frame / 32 + phase) * 2;
  const leftShoulder = pose === 'brace' ? 30 : 12 + recoil * 26 + reach * 56;
  const rightShoulder = pose === 'brace' ? -30 : -8 - recoil * 25 - reach * 80;
  const leftElbow = pose === 'seated' ? -100 : pose === 'brace' ? 135 : -20 + recoil * 165 + reach * 22;
  const rightElbow = pose === 'seated' ? 12 : pose === 'brace' ? -135 : 18 - recoil * 168 + reach * 29;
  const seated = pose === 'seated';
  const Hand = ({side}: {side: number}) => <g transform={`scale(${side},1)`}>
    <path d="M-14 0 C-23 8 -22 23 -17 30 L-12 46 Q-9 52 -5 48 L-8 31 L-2 51 Q3 55 5 49 L0 29 L7 46 Q12 50 14 43 L8 26 L15 34 Q21 37 21 30 L13 12 Q10 5 8 1 Z" fill={skin}/>
    <path d="M-16 13 Q-30 10 -28 19 L-21 33" fill={skin} stroke={outline} strokeWidth="3"/>
    <path d="M-8 24 L3 22 M-7 30 L5 28" stroke={shadow} strokeWidth="2.5" fill="none"/>
  </g>;
  const Arm = ({side, shoulder, elbow}: {side: number; shoulder: number; elbow: number}) => <g transform={`translate(${side*73},229) rotate(${shoulder})`}>
    <path d="M-24 0 Q-29 -19 -8 -24 Q21 -26 26 1 L23 102 Q3 118 -22 102 Z" fill={c.coat} stroke={outline} strokeWidth="5"/>
    <path d="M16 8 L15 95" stroke={c.coatShade} strokeWidth="9" strokeLinecap="round"/>
    <g transform={`translate(0,100) rotate(${elbow})`}>
      <path d="M-22 -8 Q0 -19 22 -8 L18 87 Q0 100 -18 86 Z" fill={c.coat} stroke={outline} strokeWidth="5"/>
      <path d="M-18 78 L18 80 L18 94 L-18 92 Z" fill={c.coatShade} stroke={outline} strokeWidth="3"/>
      <g transform="translate(0,96)"><Hand side={side}/></g>
    </g>
  </g>;
  return <g transform={`translate(${x},${y}) scale(${scale})`} strokeLinecap="round" strokeLinejoin="round">
    <defs><linearGradient id={`${instance}-coat`} x1="0" x2="1" y1="0" y2="1"><stop stopColor={c.coat}/><stop offset="1" stopColor={c.coatShade}/></linearGradient></defs>
    <ellipse cx="0" cy={seated ? 559 : 609} rx="118" ry="18" fill="#091B2A" opacity=".3"/>
    <g transform={`rotate(${lean},0,410) translate(0,${breath})`}>
      <g stroke={outline} strokeWidth="5">
        <path d={seated ? 'M-65 390 Q-99 414 -109 457 L-103 535 Q-89 550 -61 537 L-53 472 L-8 447 L10 397 Z' : 'M-69 385 L-65 493 L-72 582 Q-48 598 -22 581 L-10 488 L6 402 Z'} fill={c.pants}/>
        <path d={seated ? 'M8 395 L70 393 Q103 421 113 462 L107 537 Q82 549 63 533 L55 472 L10 448 Z' : 'M4 399 L16 493 L32 584 Q57 595 79 578 L64 485 L71 385 Z'} fill={c.pants}/>
        <path d={seated ? 'M-103 532 L-62 533 L-58 555 Q-69 567 -118 563 Q-134 557 -122 547 Z' : 'M-73 577 L-25 578 L-20 604 Q-38 619 -95 609 Q-109 602 -92 589 Z'} fill="#E8DDD0"/>
        <path d={seated ? 'M63 530 L106 532 L125 548 Q136 560 114 565 L61 560 Z' : 'M31 579 L77 574 L100 591 Q116 606 91 612 L34 611 Z'} fill="#E8DDD0"/>
        <path d="M-43 432 L-40 500 M40 432 L49 501" fill="none" stroke="#94A8BA" strokeWidth="3" opacity=".32"/>
        <path d="M-43 188 L-85 210 Q-106 232 -91 288 L-76 397 Q-3 424 79 396 L92 269 Q99 224 72 207 L37 190 Z" fill={`url(#${instance}-coat)`}/>
        <path d="M-32 189 L0 214 L32 188 L38 390 Q3 402 -32 390 Z" fill={c.shirt} strokeWidth="3"/>
        <path d="M-39 194 L-57 227 L-33 247 L-43 263 L-18 353 L-20 216 Z" fill={c.coat} strokeWidth="3"/>
        <path d="M39 194 L57 227 L33 247 L44 263 L22 355 L20 215 Z" fill={c.coat} strokeWidth="3"/>
        <path d="M-79 339 L-42 343 L-44 364 L-75 361 M43 344 L76 338 L74 360 L45 365" fill="none" strokeWidth="3" opacity=".65"/>
        {id === 'eli' && <path d="M-10 219 L11 219 L16 235 L9 247 L22 312 L5 335 L-10 314 L-4 247 L-15 234 Z" fill="#CE8359" strokeWidth="3"/>}
        {id === 'noah' && <><path d="M-8 215 L10 215 L15 235 L2 283 L-10 235 Z" fill="#294861" strokeWidth="3"/><path d="M41 259 L69 250 L62 265 L45 269 L33 264 Z" fill="#F5D491" strokeWidth="2"/></>}
        <path d="M-25 157 L-29 195 Q-1 221 29 193 L24 154 Z" fill={skin}/>
        <path d="M-25 164 Q-1 185 25 166 L26 185 Q-2 202 -26 184 Z" fill={shadow} stroke="none"/>
      </g>
      <Arm side={-1} shoulder={leftShoulder} elbow={leftElbow}/>
      <Arm side={1} shoulder={rightShoulder} elbow={rightElbow}/>
      <g transform={`rotate(${headAngle},0,173)`}>
        {id === 'maya' && <path d="M-80 60 Q-106 86 -91 137 Q-112 168 -77 192 Q-52 204 -31 183 L49 188 Q96 193 95 153 Q111 113 83 70 Z" fill={c.hair} stroke={outline} strokeWidth="5"/>}
        <path d="M-72 92 Q-98 82 -94 110 Q-91 134 -70 128 M72 92 Q97 80 94 109 Q92 130 72 128" fill={skin} stroke={outline} strokeWidth="5"/>
        <path d="M-76 62 C-76 19 -41 1 5 4 C55 2 80 28 78 75 L72 132 C67 160 42 181 7 185 C-31 185 -65 160 -70 132 Z" fill={skin} stroke={outline} strokeWidth="5"/>
        <path d="M67 62 Q84 133 48 163 Q22 186 -10 174 Q30 171 45 143 Q62 111 55 72 Z" fill={shadow} opacity=".37"/>
        <path d="M-68 112 Q-86 98 -84 114 M79 111 L85 103" fill="none" stroke={shadow} strokeWidth="4"/>
        {id === 'maya' ? <>
          <path d="M-76 90 Q-96 65 -85 37 Q-99 11 -65 0 Q-48 -28 -16 -10 Q16 -29 39 -9 Q77 -12 82 21 Q103 38 84 78 L61 92 L54 43 Q19 62 -13 33 Q-22 65 -65 58 Z" fill={c.hair} stroke={outline} strokeWidth="5"/>
          <path d="M-66 22 Q-43 6 -22 17 M8 12 Q29 1 48 21 M-67 44 Q-48 32 -35 37" fill="none" stroke="#46556A" strokeWidth="7"/>
          <path d="M-80 128 Q-92 145 -80 151 Q-65 145 -74 130 M81 129 Q94 144 80 151 Q67 145 74 130" fill="none" stroke="#FFD685" strokeWidth="6"/>
        </> : id === 'eli' ? <>
          <path d="M-76 91 L-86 53 Q-94 11 -55 8 Q-36 -22 6 -13 Q40 -33 54 -10 Q92 -8 90 25 L83 83 L66 94 L59 37 Q21 57 -13 30 Q-27 53 -62 47 L-65 87 Z" fill={c.hair} stroke={outline} strokeWidth="5"/>
          <path d="M-58 27 Q-37 9 -12 18 M8 8 Q32 -1 48 16" fill="none" stroke="#7C6156" strokeWidth="6"/>
        </> : <>
          <path d="M-73 88 Q-93 65 -83 34 Q-87 11 -63 7 Q-48 -15 -28 -5 Q-2 -22 16 -7 Q43 -20 55 0 Q82 -1 81 25 Q98 50 78 87 L61 79 L60 41 Q5 56 -57 39 L-59 85 Z" fill={c.hair} stroke={outline} strokeWidth="5"/>
          <path d="M-55 147 Q-45 180 4 185 Q52 176 63 143 L48 143 Q18 162 -10 154 L-39 138 Z" fill={c.hair}/>
        </>}
        <g transform={`translate(${gaze},0)`}>
          {blink ? <path d="M-51 102 Q-34 111 -19 101 M16 102 Q34 111 50 101" fill="none" stroke={outline} strokeWidth="5"/> : <>
            <path d={zombie ? 'M-54 100 Q-38 91 -17 103 Q-34 119 -51 111 Z' : fear ? 'M-55 99 Q-44 77 -25 88 Q-10 102 -23 115 Q-45 124 -55 99 Z' : 'M-55 101 Q-40 84 -20 99 Q-15 111 -29 115 Q-47 119 -55 101 Z'} fill={zombie ? '#F1E8B8' : '#FFF7E9'} stroke={outline} strokeWidth="3"/>
            <path d={zombie ? 'M15 104 Q31 89 53 99 L50 112 Q29 121 15 104 Z' : fear ? 'M15 99 Q24 77 44 88 Q60 99 49 115 Q25 124 15 99 Z' : 'M15 99 Q32 83 51 100 Q53 114 37 116 Q22 117 15 99 Z'} fill={zombie ? '#F1E8B8' : '#FFF7E9'} stroke={outline} strokeWidth="3"/>
            <ellipse cx={-32+(fear?4:0)} cy="103" rx={zombie?4:6.5} ry={zombie?5:9} fill={zombie?'#AC6455':outline}/>
            <ellipse cx={35+(fear?4:0)} cy="103" rx={zombie?4:6.5} ry={zombie?5:9} fill={zombie?'#AC6455':outline}/>
            {!zombie && <><circle cx="-30" cy="100" r="2" fill="white"/><circle cx="37" cy="100" r="2" fill="white"/></>}
          </>}
        </g>
        <path d={zombie ? 'M-55 86 L-21 94 M19 91 L52 83' : fear ? 'M-54 78 Q-37 65 -20 75 M18 74 Q34 63 51 78' : 'M-54 83 Q-39 81 -22 72 M19 73 Q32 80 51 82'} fill="none" stroke={c.hair} strokeWidth="7"/>
        <path d="M2 105 L-5 127 Q2 135 12 128" fill="none" stroke={shadow} strokeWidth="4"/>
        {fear ? <path d="M-11 150 Q-10 134 6 139 Q23 144 18 161 Q2 170 -10 158 Z" fill="#593B43" stroke={outline} strokeWidth="3"/> : zombie ? <>
          <path d="M-19 147 Q4 143 28 151 L21 168 Q1 174 -17 160 Z" fill="#4E4D46" stroke={outline} strokeWidth="3"/>
          <path d="M-15 149 L-14 155 L-4 156 L-3 148 M5 149 L5 157 L15 158 L17 150" fill="#E7DFBD" stroke="none"/>
          <path d="M-56 122 L-45 128 L-48 135 M48 126 L39 132 L46 138" fill="none" stroke="#7B9D7D" strokeWidth="3"/>
        </> : <path d={expression === 'resolve' ? 'M-16 148 Q5 156 26 146' : 'M-17 152 Q5 140 24 151'} fill="none" stroke="#80544D" strokeWidth="4"/>}
        {!zombie && <><ellipse cx="-52" cy="126" rx="12" ry="6" fill="#D98070" opacity=".3"/><ellipse cx="47" cy="126" rx="11" ry="6" fill="#D98070" opacity=".25"/></>}
      </g>
      {expression === 'anxious' && <g fill="#A9DAE3" stroke="#456A85" strokeWidth="2" opacity={.6+.4*Math.sin(frame/22)**2}>
        <path d="M102 70 Q115 89 107 97 Q94 100 97 88 Z"/>
      </g>}
    </g>
  </g>;
};
