import React, {useEffect, useState} from 'react';
import {AbsoluteFill, cancelRender, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {Character} from './art/Character';
import {Cabin, Seat} from './art/Cabin';
import {durationInFrames, sceneAtFrame, type Manifest, type Scene} from './manifest';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const lerp = (f: number, range: number[], values: number[]) => interpolate(f,range,values,clamp);
const pop = (f: number, delay=0) => spring({frame:f-delay,fps:30,config:{damping:18,stiffness:125,mass:.8}});
const ink='#10263C';

function useFonts(manifest: Manifest) {
  const [handle] = useState(() => delayRender('Load bundled Flight fonts'));
  useEffect(() => {
    let alive=true;
    Promise.all([
      new FontFace('Flight', `url("${staticFile(manifest.assets.fontBold)}")`, {weight:'700'}).load(),
      new FontFace('Flight', `url("${staticFile(manifest.assets.fontMedium)}")`, {weight:'500'}).load(),
    ]).then(fonts => {if(alive){ fonts.forEach(font => document.fonts.add(font)); continueRender(handle);}})
      .catch(error => cancelRender(new Error(`Cannot load bundled font: ${error}`)));
    return () => {alive=false;};
  },[handle,manifest.assets.fontBold,manifest.assets.fontMedium]);
}

const AlertIcon = () => <g fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"><path d="M0 -26 L30 26 L-30 26 Z"/><path d="M0 -7 V8"/><path d="M0 18 V19"/></g>;
const Alarm: React.FC<{frame:number; accent:string}> = ({frame,accent}) => {
  const appear=pop(frame,14);
  return <g transform={`translate(540,690) scale(${.85+.15*appear})`} opacity={lerp(frame,[14,20],[0,1])}>
    <rect x="-205" y="-48" width="410" height="96" rx="22" fill="#182D40" stroke={accent} strokeWidth="3"/>
    <g transform="translate(-149,0) scale(.65)" color={accent}><AlertIcon/></g>
    <text x="-108" y="8" fill="#FFF1D8" fontSize="22" fontWeight="700" letterSpacing="2">CABIN ALERT</text>
    <circle cx="164" r="7" fill={accent} opacity={.5+.5*Math.sin(frame/6)**2}/>
  </g>;
};

const World: React.FC<{scene:Scene; frame:number; instance:string; freezeFrame?:number}> = ({scene,frame,instance,freezeFrame=89}) => {
  const frozen=scene.action==='freeze';
  const f=frozen?freezeFrame:frame;
  const action=frozen?'flicker':scene.action;
  const emergency=action==='flicker';
  const first=action==='anxious';
  const s=first?1+f/2100:action==='infected'?1.025+Math.min(f,100)/2200:1.07;
  const drift=first?Math.sin(f/80)*9:action==='infected'?-lerp(f,[0,90],[0,15]):Math.sin(f/22)*3;
  const has=(id: 'maya'|'eli'|'noah')=>scene.characters.includes(id);
  const reveal=action==='infected'?lerp(f,[0,40],[0,1]):1;
  const flicker=emergency && ((f>=8 && f<=10)||(f>=18 && f<=21)||(f>=35 && f<=36)||(f>=61 && f<=63));
  return <g>
    <g transform={`translate(${drift},0) translate(540,1120) scale(${s}) translate(-540,-1120)`}>
      <Cabin frame={f} emergency={emergency} instance={instance}/>
      {has('noah') && <Character id="noah" instance={`${instance}-noah`} x={first?535:393} y={first?780:793} scale={.54} frame={first?f:f+16} expression={first?'anxious':'startled'} pose={first?'seated':'brace'} gaze={first?4:7}/>}
      {first ? <>
        <Seat x={342} y={1017} scale={1.45} label="13A" side={-1}/>
        <Seat x={795} y={1030} scale={.98} label="13C"/>
        {has('eli') && <Character id="eli" instance={`${instance}-eli`} x={795} y={869} scale={.99} frame={f} expression={f>68?'infected':'anxious'} pose="seated" lean={6+Math.sin(f/12)*2} gaze={-5}/>}
        {has('maya') && <Character id="maya" instance={`${instance}-maya`} x={340} y={789} scale={1.45} frame={f} expression="anxious" pose="seated" lean={-2} gaze={lerp(f,[25,48,60,85],[-3,-3,6,6])}/>}
        <g transform={`translate(622,867) rotate(${Math.sin(f/7)*5})`} opacity={lerp(f,[53,67],[0,1])}>
          <path d="M0 0 L-8 -23 M20 4 L28 -19" stroke="#D4D9AF" strokeWidth="6" strokeLinecap="round"/>
        </g>
      </> : <>
        <Seat x={148} y={1122} scale={1.12} side={-1} label="13A"/>
        <Seat x={949} y={1102} scale={1.1} label="13C"/>
        {has('maya') && <Character id="maya" instance={`${instance}-maya`} x={260-12*reveal} y={991} scale={1.02} frame={f} expression="startled" pose="recoil" lean={-6*reveal} gaze={6}/>}
        <g transform={`translate(0,${action==='infected'?lerp(f,[0,41],[125,0]):0})`}>
          {has('eli') && <Character id="eli" instance={`${instance}-eli`} x={664} y={796} scale={1.34} frame={f} expression="infected" pose="reach" lean={-5-Math.sin(f/14)*1.8} gaze={-3}/>}
        </g>
        <g fill="none" stroke="#F9D9A0" strokeWidth="6" strokeLinecap="round" opacity={lerp(f,[10,22,45,60],[0,1,1,0])}>
          <path d="M135 929 L115 902 M171 914 L162 884 M117 959 L90 947"/>
        </g>
      </>}
      <path d="M-70 1668 Q29 1601 133 1684 L218 1920 L-80 1920 Z M1190 1645 Q1070 1588 974 1686 L893 1920 L1190 1920 Z" fill="#16364D" stroke="#26485F" strokeWidth="14"/>
    </g>
    {emergency && <>
      <rect width="1080" height="1920" fill="#071523" opacity={flicker?.72:.12}/>
      <path d="M0 0 H160 L420 1920 H0 Z M1080 0 H920 L660 1920 H1080 Z" fill="#E77C68" opacity={flicker?.02:.065}/>
    </>}
  </g>;
};

const Titles: React.FC<{scene:Scene;frame:number;index:number}> = ({scene,frame,index}) => {
  const freeze=scene.action==='freeze';
  const baseY=freeze?368:270;
  return <g fontFamily="Flight, sans-serif">
    <g opacity={lerp(frame,[0,10],[0,1])} transform={`translate(0,${lerp(frame,[0,16],[18,0])})`}>
      <rect x="75" y={baseY-115} width="5" height="24" rx="2" fill={scene.accent}/>
      <text x="96" y={baseY-96} fontSize="21" letterSpacing="3" fill={scene.accent} fontWeight="700">{scene.eyebrow}</text>
    </g>
    {scene.headline.map((line,i)=>{
      const size=freeze?(i===0?81:138):(line.length>16?65:line.length>12?77:92);
      const y=baseY+i*(freeze?139:103);
      return <g key={i} opacity={lerp(frame,[3+i*5,10+i*5],[0,1])} transform={`translate(75,${y+(1-pop(frame,3+i*5))*55})`}>
        {freeze && i===1 && <path d="M-7 17 Q300 31 680 11 L685 33 Q300 48 -6 36 Z" fill={scene.accent} opacity=".85"/>}
        <text y="0" fill={i===1?scene.accent:'#FCF3DF'} fontSize={size} fontWeight="700" letterSpacing={freeze?-5:-3}>{line}</text>
      </g>;
    })}
    {!freeze && <g opacity={lerp(frame,[14,24],[0,1])}>
      <rect x="75" y="429" width="171" height="40" rx="20" fill="#A6BEC4" fillOpacity=".12" stroke="#9EB5BB" strokeOpacity=".25"/>
      <text x="160" y="455" textAnchor="middle" fill="#D1E0DD" fontSize="17" letterSpacing="2" fontWeight="500">{['12:17 AM','ROW 13','SIGNAL LOST'][index]}</text>
    </g>}
  </g>;
};

const SceneView: React.FC<{scene:Scene;frame:number;index:number;freezeFrame?:number}> = ({scene,frame,index,freezeFrame}) => {
  const freeze=scene.action==='freeze';
  return <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{position:'absolute',inset:0}}>
    <defs>
      <linearGradient id={`top-${index}`} x1="0" x2="0" y1="0" y2="1"><stop stopColor={ink}/><stop offset=".65" stopColor={ink} stopOpacity=".94"/><stop offset="1" stopColor={ink} stopOpacity="0"/></linearGradient>
      <linearGradient id={`bottom-${index}`} x1="0" x2="0" y1="0" y2="1"><stop stopColor={ink} stopOpacity="0"/><stop offset=".55" stopColor={ink} stopOpacity=".93"/><stop offset="1" stopColor={ink}/></linearGradient>
    </defs>
    <World scene={scene} frame={frame} instance={`scene-${index}`} freezeFrame={freezeFrame}/>
    <rect width="1080" height={freeze?870:680} fill={`url(#top-${index})`}/>
    <rect y="1480" width="1080" height="440" fill={`url(#bottom-${index})`}/>
    {freeze && <>
      <rect width="1080" height="1920" fill="#0C2134" opacity=".16"/>
      <path d="M70 760 V710 H120 M960 710 H1010 V760 M70 1470 V1520 H120 M960 1520 H1010 V1470" stroke="#FFD685" strokeWidth="3" fill="none" opacity=".65"/>
      <g transform="translate(896,123)" fill="#FFD685" opacity={lerp(frame,[0,6],[0,1])}><rect width="9" height="27" rx="2"/><rect x="17" width="9" height="27" rx="2"/></g>
      <text x="75" y="1634" fontFamily="Flight, sans-serif" fontSize="23" fill="#FFD685" letterSpacing="4">THINK FAST.</text>
    </>}
    {scene.action==='flicker' && <Alarm frame={frame} accent={scene.accent}/>}
    <Titles scene={scene} frame={frame} index={index}/>
    <g opacity={lerp(frame,[16,27],[0,1])} transform={`translate(0,${(1-pop(frame,16))*18})`}>
      <path d="M75 1680 H124" stroke={scene.accent} strokeWidth="4" strokeLinecap="round"/>
      <text x="75" y="1737" fontFamily="Flight, sans-serif" fill="#F3EEDC" fontSize="30" fontWeight="500" letterSpacing="-.6">{scene.caption}</text>
    </g>
  </svg>;
};

export const Episode: React.FC<{manifest:Manifest}> = ({manifest}) => {
  useFonts(manifest);
  const frame=useCurrentFrame();
  const {scene,index,localFrame}=sceneAtFrame(manifest,frame);
  const transition=index>0 && scene.action!=='freeze'?lerp(localFrame,[0,8],[0,1]):1;
  const previous=manifest.scenes[index-1];
  return <AbsoluteFill style={{background:ink,fontFamily:'Flight, sans-serif'}}>
    {transition<1 && previous && <SceneView scene={previous} frame={previous.durationFrames-1} index={index-1}/>}
    <AbsoluteFill style={{opacity:transition,transform:`translateX(${(1-transition)*22}px)`}}>
      <SceneView scene={scene} frame={localFrame} index={index} freezeFrame={previous?.durationFrames?previous.durationFrames-1:89}/>
    </AbsoluteFill>
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{position:'absolute',inset:0}} fontFamily="Flight, sans-serif">
      <g transform="translate(75,88)">
        <path d="M0 8 L18 0 L36 8 L18 18 Z" fill="#FFD685"/>
        <path d="M18 8 V26 M8 14 V22 M28 14 V22" stroke="#FFD685" strokeWidth="2"/>
        <text x="53" y="21" fill="#C8D5D5" fontSize="18" fontWeight="700" letterSpacing="4">THE WHAT IF FILES</text>
      </g>
      <text x="974" y="109" textAnchor="end" fill="#B1C4CD" fontSize="17" letterSpacing="2">01 / FLIGHT</text>
      <g transform="translate(75,1810)">
        {manifest.scenes.map((s,i)=>{
          const width=915/manifest.scenes.length-12;
          return <g key={s.id} transform={`translate(${i*(width+12)},0)`}>
            <rect width={width} height="4" rx="2" fill="#496070"/>
            <rect width={width*(i<index?1:i===index?(localFrame+1)/scene.durationFrames:0)} height="4" rx="2" fill={scene.accent}/>
          </g>;
        })}
        <text y="42" fill="#92A8B8" fontSize="16" letterSpacing="2">AN ORIGINAL ANIMATED WHAT IF</text>
        <text x="915" y="42" textAnchor="end" fill="#92A8B8" fontSize="16" letterSpacing="2">{String(Math.floor(frame/30)).padStart(2,'0')} / {durationInFrames(manifest)/30}s</text>
      </g>
    </svg>
  </AbsoluteFill>;
};
