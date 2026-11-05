import React from 'react';
import {interpolate} from 'remotion';
import type {CharacterId} from '../manifest';
import type {Expression, Pose as LegacyPose} from './Character';

/**
 * Lightweight cartoon rig. Unlike the detailed cutout rig, this deliberately
 * uses round heads, capsule bodies, single-stroke limbs and distinctive outfits.
 * Geometry is sized to be a drop-in replacement in the existing airplane scenes.
 * Every animation is deterministic from Remotion's current frame.
 */
export type Pose = LegacyPose | 'walk' | 'run' | 'point' | 'panic' | 'fall' | 'hold';

type Props = {
  id: CharacterId;
  instance: string;
  frame: number;
  expression: Expression;
  pose: Pose;
  x: number;
  y: number;
  scale?: number;
  lean?: number;
  gaze?: number;
};

type Outfit = {
  skin: string;
  hair: string;
  coat: string;
  detail: string;
  trousers: string;
  shoes: string;
};

export const OUTFITS: Record<CharacterId, Outfit> = {
  maya: {
    skin: '#E5B28B', hair: '#2C334B', coat: '#F27C62',
    detail: '#FFCB81', trousers: '#364C70', shoes: '#F9E3CA',
  },
  eli: {
    skin: '#E8C9A7', hair: '#614D42', coat: '#78A68F',
    detail: '#EEC078', trousers: '#3F555D', shoes: '#E8E1D0',
  },
  noah: {
    skin: '#A87663', hair: '#273849', coat: '#558FB8',
    detail: '#F3D585', trousers: '#314A68', shoes: '#E3E6E2',
  },
};

const ink = '#27394C';
const ease = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

/** The same characters remain recognizable at thumbnail size. */
export const Character: React.FC<Props> = ({
  id, instance, frame, expression, pose, x, y, scale = 1, lean = 0, gaze = 0,
}) => {
  const outfit = OUTFITS[id];
  const zombie = expression === 'infected';
  const scared = expression === 'startled' || expression === 'anxious';
  const skin = zombie ? '#A9C69C' : outfit.skin;
  const phase = id === 'maya' ? 0 : id === 'eli' ? 1.8 : 3.4;
  const bob = Math.sin(frame / 16 + phase) * 2.2;
  const shake = zombie ? Math.sin(frame / 4.3) * 4 : (scared ? Math.sin(frame / 7) * 1.5 : 0);
  const recoil = pose === 'recoil' || pose === 'panic' ? ease(frame, 4, 23) : 0;
  const lunge = pose === 'reach' ? ease(frame, 8, 41) : 0;
  const steps = pose === 'walk' || pose === 'run';
  const stride = steps ? Math.sin(frame / (pose === 'run' ? 3.8 : 6.7)) * (pose === 'run' ? 38 : 24) : 0;
  const seated = pose === 'seated';
  const tilt = lean + shake * 0.5 + (zombie ? -6 : -2) - recoil * 8;
  const blinkAt = (frame + (id === 'eli' ? 27 : id === 'noah' ? 61 : 0)) % 111;
  const eyesClosed = !zombie && blinkAt >= 94 && blinkAt <= 98;

  const leftArm = seated ? -17 + Math.sin(frame / 22) * 3 :
    pose === 'brace' ? -54 : pose === 'recoil' ? -65 * recoil :
    pose === 'reach' ? -10 : pose === 'point' ? -75 :
    pose === 'panic' ? -65 : steps ? -20 + stride * .8 : -9;
  const rightArm = seated ? 18 + Math.sin(frame / 24) * 3 :
    pose === 'brace' ? 52 : pose === 'recoil' ? 66 * recoil :
    pose === 'reach' ? -82 * lunge : pose === 'point' ? -103 :
    pose === 'panic' ? 65 : steps ? 22 - stride * .8 : 10;

  // All characters share proportions and joint coordinates, so the same poses work.
  const Arm = ({side, angle}: {side: -1 | 1; angle: number}) => (
    <g transform={'translate(' + (side * 53) + ',245) rotate(' + angle + ')'}>
      <path d={'M0 0 Q' + (side * 17) + ' 48 ' + (side * 22) + ' 94'} fill="none"
        stroke={outfit.coat} strokeWidth="24" strokeLinecap="round"/>
      <path d={'M' + (side * 22) + ' 94 Q' + (side * 34) + ' 121 ' + (side * 27) + ' 145'} fill="none"
        stroke={skin} strokeWidth="15" strokeLinecap="round"/>
      <circle cx={side * 27} cy="145" r="11" fill={skin} stroke={ink} strokeWidth="3"/>
      <path d={'M' + (side * 20) + ' 92 L' + (side * 26) + ' 103'} stroke={outfit.detail}
        strokeWidth="6" strokeLinecap="round"/>
    </g>
  );

  const Leg = ({side}: {side: -1 | 1}) => {
    const sx = side * 28;
    const kneeX = seated ? side * 60 : side * 33 + (side === 1 ? stride : -stride);
    const kneeY = seated ? 470 : 500;
    const footX = seated ? side * 100 : side * 39 + (side === 1 ? stride * .7 : -stride * .7);
    return <g>
      <path d={'M' + sx + ' 399 L' + kneeX + ' ' + kneeY + ' L' + footX + ' 583'}
        stroke={outfit.trousers} strokeWidth="27" fill="none"
        strokeLinecap="round" strokeLinejoin="round"/>
      <path d={'M' + (footX - 19) + ' 594 Q' + (footX + 7) + ' 605 ' + (footX + 35) + ' 595'}
        fill="none" stroke={outfit.shoes} strokeWidth="25" strokeLinecap="round"/>
    </g>;
  };

  return <g transform={'translate(' + x + ',' + y + ') scale(' + scale + ')'}
    strokeLinecap="round" strokeLinejoin="round" aria-label={instance}>
    <ellipse cx="0" cy="615" rx="92" ry="15" fill="#0A1B30" opacity=".23"/>
    <g transform={'translate(0,' + bob + ') rotate(' + tilt + ',0,325)'}>
      <Leg side={-1}/>
      <Leg side={1}/>
      <path d="M-41 220 Q-69 230 -62 276 L-52 405 Q0 418 52 405 L62 276 Q69 230 40 220 Z"
        fill={outfit.coat} stroke={ink} strokeWidth="5"/>
      <path d="M-29 238 Q0 266 29 238" stroke={outfit.detail} strokeWidth="9" fill="none"/>
      <path d="M-22 288 L-22 396" stroke={outfit.detail} strokeOpacity=".5"
        strokeWidth="5" fill="none"/>
      <path d="M-22 393 Q0 403 22 393" stroke={ink} strokeOpacity=".18" strokeWidth="4" fill="none"/>

      {id === 'maya' && <>
        <path d="M-48 248 L39 367" stroke="#FFCC8C" strokeWidth="8" opacity=".85"/>
        <rect x="22" y="345" width="45" height="48" rx="10" fill="#F7C18F"
          stroke={ink} strokeWidth="4"/>
      </>}
      {id === 'eli' && <>
        <path d="M-32 227 Q0 252 36 225" stroke="#D6AC72" strokeWidth="16" fill="none"/>
        <path d="M10 240 L32 315" stroke="#D6AC72" strokeWidth="13" fill="none"/>
      </>}
      {id === 'noah' && <>
        <path d="M-10 237 L9 237 L7 300 L-6 300 Z" fill="#2C4B67"/>
        <rect x="21" y="273" width="30" height="13" rx="3" fill={outfit.detail}/>
      </>}

      <Arm side={-1} angle={leftArm}/>
      <Arm side={1} angle={rightArm}/>

      <g transform={'rotate(' + (Math.sin(frame / 24 + phase) * 2 + shake * .4) + ',0,130)'}>
        <rect x="-16" y="192" width="32" height="38" rx="12" fill={skin}/>
        {id === 'maya' && <path d="M-67 81 Q-89 125 -71 188 L-43 192 L44 187 Q81 174 66 85 Z"
          fill={outfit.hair} stroke={ink} strokeWidth="4"/>}
        <circle cx="0" cy="125" r="76" fill={skin} stroke={ink} strokeWidth="5"/>
        {id === 'maya' ? <>
          <path d="M-73 105 Q-83 59 -53 46 Q-32 28 -2 48 Q29 25 60 47 Q81 60 71 105
          Q44 82 27 72 Q6 104 -22 78 Q-41 108 -73 105 Z" fill={outfit.hair}/>
          <circle cx="-71" cy="151" r="6" fill="#F8D180"/>
          <circle cx="71" cy="151" r="6" fill="#F8D180"/>
        </> : id === 'eli' ? <>
          <path d="M-73 103 L-75 76 L-54 45 L-30 55 L-11 29 L12 48 L39 32 L66 55
          L75 100 Q39 76 14 73 Q-22 97 -48 83 Z" fill={outfit.hair}/>
        </> : <>
          <path d="M-72 93 Q-66 43 -20 41 Q28 28 64 57 L70 92 Q24 65 -26 77 Z" fill={outfit.hair}/>
          <path d="M-79 81 Q-9 52 77 79 L91 89 Q0 105 -84 91 Z" fill={outfit.coat} stroke={ink} strokeWidth="3"/>
          <rect x="-8" y="63" width="17" height="9" rx="2" fill={outfit.detail}/>
        </>}
        <g transform={'translate(' + gaze + ',0)'}>
          {eyesClosed ? <>
            <path d="M-41 130 L-18 130 M18 130 L41 130" stroke={ink} strokeWidth="5"/>
          </> : <>
            <circle cx="-30" cy="132" r={scared ? 8 : 6} fill={zombie ? '#A94344' : ink}/>
            <circle cx="30" cy="132" r={scared ? 8 : 6} fill={zombie ? '#A94344' : ink}/>
          </>}
        </g>
        <path d={zombie ? 'M-44 114 L-17 120 M17 120 L44 114' :
          scared ? 'M-42 112 Q-30 101 -17 111 M17 111 Q30 101 43 112' :
          'M-42 115 L-19 112 M19 112 L42 115'}
          stroke={ink} strokeWidth="5" fill="none"/>
        {zombie ? <>
          <path d="M-22 163 Q0 153 24 164 L18 180 L-18 180 Z" fill="#485348" stroke={ink} strokeWidth="3"/>
          <path d="M-12 163 L-11 172 L-3 173 M5 164 L6 174 L14 173"
            fill="none" stroke="#F4E9C8" strokeWidth="3"/>
          <path d="M-63 149 L-51 154 M50 153 L62 148" stroke="#688D69" strokeWidth="5"/>
        </> : scared ? <>
          <ellipse cx="0" cy="170" rx={expression === 'startled' ? 10 : 7}
            ry={expression === 'startled' ? 15 : 7} fill="#754E50"/>
        </> : <path d={expression === 'resolve' ? 'M-18 166 Q0 181 19 165' : 'M-15 170 Q0 162 15 170'}
          stroke="#85544B" strokeWidth="4" fill="none"/>}
      </g>
    </g>
  </g>;
};
