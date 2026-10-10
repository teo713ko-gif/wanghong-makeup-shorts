import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence} from 'remotion';
import {loadFont} from '@remotion/fonts';
import data from './captions.json';

// 뷰티 자막 3종(참고자료/뷰티폰트1~3): 같은 길쭉한 손글씨체 + 흰/검정테두리 · 빨강/흰테두리 · 흰/보라글로우
loadFont({family: 'PoorStory', url: staticFile('1010wh/PoorStory-Regular.ttf')});
const HAND = 'PoorStory';
const GOTHIC = 'Apple SD Gothic Neo, sans-serif';
const RED = '#ec1c24', PURPLE = '#a96ee8', Y = '#ffe14d';
type Cap = {t: string; k?: string; s?: string; step?: string; start: number; dur: number};
const caps = data.captions as Cap[];
const st = (w: number, c: string) => ({WebkitTextStroke: `${w}px ${c}`, paintOrder: 'stroke fill' as const});

const LOOK: Record<string, React.CSSProperties> = {
	outline: {color: '#fff', ...st(16, '#111'), textShadow: '0 6px 0 rgba(0,0,0,.35)'},
	red: {color: RED, ...st(14, '#fff'), textShadow: '0 0 2px #fff, 0 7px 10px rgba(60,0,0,.55)'},
	glow: {color: '#fff', ...st(12, PURPLE), textShadow: `0 0 14px ${PURPLE}, 0 0 28px rgba(169,110,232,.85), 0 0 46px rgba(169,110,232,.6)`},
};

const Pop: React.FC<{children: React.ReactNode; strength?: number}> = ({children, strength = 0.18}) => {
	const f = useCurrentFrame(); const {fps} = useVideoConfig();
	const s = spring({frame: f, fps, config: {damping: 11, stiffness: 220}});
	return <div style={{transform: `scale(${1 - strength + strength * s})`, opacity: Math.min(1, f / 2)}}>{children}</div>;
};

// {강조} 부분은 빨강 스타일, 나머지는 base 스타일
const Rich: React.FC<{t: string; look: string}> = ({t, look}) => <>{t.split(/(\{[^}]+\})/).map((p, i) =>
	p.startsWith('{') ? <span key={i} style={LOOK.red}>{p.slice(1, -1)}</span> : <span key={i} style={LOOK[look]}>{p}</span>)}</>;

const handSize = (t: string, max = 128) => {
	const n = Math.max(...t.replace(/[{}]/g, '').split('\n').map((l) => l.length));
	return Math.max(86, Math.min(max, Math.floor(980 / (n * 0.86))));
};
// 긴 손글씨 자막은 가운데 가까운 띄어쓰기에서 두 줄로 나눔({ } 안은 나누지 않음)
const brk = (t: string) => {
	if (t.includes('\n') || t.replace(/[{}]/g, '').length <= 11) return t;
	let best = -1, depth = 0;
	[...t].forEach((ch, i) => { if (ch === '{') depth++; if (ch === '}') depth--; if (ch === ' ' && !depth && (best < 0 || Math.abs(i - t.length / 2) < Math.abs(best - t.length / 2))) best = i; });
	return best < 0 ? t : t.slice(0, best) + '\n' + t.slice(best + 1);
};
const handBase = (size: number): React.CSSProperties => ({whiteSpace: 'nowrap', fontFamily: HAND, fontSize: size, lineHeight: 1.08, textAlign: 'center', letterSpacing: -2});

const Text: React.FC<{c: Cap}> = ({c}) => {
	const f = useCurrentFrame();
	const lines = c.t.split('\n');
	const at = (top: number, node: React.ReactNode, strength = 0.18) => <AbsoluteFill style={{top, alignItems: 'center', padding: '0 40px'}}><Pop strength={strength}>{node}</Pop></AbsoluteFill>;
	if (c.k === 'hook1') return at(240, <div style={handBase(132)}><span style={LOOK.glow}>무쌍이</span><br/><span style={LOOK.red}>왕홍메이크업</span><span style={LOOK.glow}>을</span><br/><span style={LOOK.glow}>받으면</span></div>);
	if (c.k === 'hook2') {
		const shake = f < 8 ? Math.sin(f * 2.2) * 10 : 0;
		return at(1090, <div style={{...handBase(170), ...LOOK.red, ...st(18, '#fff'), transform: `rotate(-4deg) translateX(${shake}px)`}}>쌍꺼풀이<br/>생긴다구?!?!</div>, 0.5);
	}
	if (c.k === 'split') return <>
		<AbsoluteFill style={{top: 340, flexDirection: 'row', justifyContent: 'space-around'}}>
			{['BEFORE', 'AFTER'].map((x, i) => <div key={x} style={{...handBase(96), ...(i ? LOOK.red : LOOK.outline), transform: `scale(${Math.max(0, Math.min(1, (f - i * 6) / 6))})`}}>{x}</div>)}
		</AbsoluteFill>
		{at(1420, <div style={{...handBase(132), ...LOOK.outline}}>비포-애프터</div>)}
	</>;
	if (c.k === 'cta') return at(1150, <div style={handBase(120)}><span style={LOOK.glow}>{lines[0]}</span><br/><span style={LOOK.red}>{lines[1]}</span></div>);
	if (c.s === 'tag') return at(1300, <div style={{fontFamily: GOTHIC, fontWeight: 800, fontSize: 52, color: Y, background: 'rgba(0,0,0,.82)', padding: '8px 22px', borderRadius: 8}}>{c.t}</div>, 0.3);
	if (c.s === 'base') return <AbsoluteFill style={{top: 1330, alignItems: 'center', padding: '0 70px'}}>
		<div style={{fontFamily: GOTHIC, fontWeight: 700, fontSize: lines.some((l) => l.length > 16) ? 50 : 58, color: '#fff', textAlign: 'center', lineHeight: 1.3, opacity: Math.min(1, f / 3),
			textShadow: '0 0 6px rgba(0,0,0,.9), 0 2px 4px rgba(0,0,0,.9), 0 0 16px rgba(0,0,0,.5)'}}>{lines.map((l, i) => <div key={i}>{l}</div>)}</div>
	</AbsoluteFill>;
	const look = c.s === 'mix' ? 'outline' : (c.s ?? 'outline');
	const t2 = brk(c.t);
	const size = handSize(t2, c.s === 'red' ? 150 : 128);
	return at(1240, <div style={handBase(size)}>{t2.split('\n').map((l, i) => <div key={i}><Rich t={l} look={look}/></div>)}</div>, c.s === 'red' ? 0.45 : 0.2);
};

const Step: React.FC<{label: string}> = ({label}) => {
	const f = useCurrentFrame();
	const [n, ...rest] = label.split(' ');
	const x = interpolate(f, [0, 6], [-80, 0], {extrapolateRight: 'clamp'});
	// 레퍼런스 좌상단 챕터 칩(흰 카드) 스타일
	return <AbsoluteFill style={{top: 200, left: 40, alignItems: 'flex-start'}}>
		<div style={{display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,.95)', borderRadius: 22, padding: '12px 26px 12px 14px', boxShadow: '0 4px 14px rgba(0,0,0,.25)', transform: `translateX(${x}px)`, opacity: Math.min(1, f / 4)}}>
			<div style={{width: 56, height: 56, borderRadius: 28, background: PURPLE, color: '#fff', fontFamily: GOTHIC, fontWeight: 900, fontSize: 34, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{n}</div>
			<div style={{fontFamily: GOTHIC, fontWeight: 800, fontSize: 44, color: '#111'}}>{rest.join(' ')}</div>
		</div>
	</AbsoluteFill>;
};

export const Wanghong: React.FC = () => {
	const f = useCurrentFrame(); const {durationInFrames} = useVideoConfig();
	const fr = (s: number) => Math.round(s * 30);
	const zc = caps.find((c) => (c.k === 'hook2' || c.s === 'red') && f >= fr(c.start) && f < fr(c.start + c.dur));
	const zoom = zc ? interpolate(f - fr(zc.start), [0, fr(zc.dur)], [1, zc.k === 'hook2' ? 1.15 : 1.08]) : 1;
	const flash = caps.some((c) => (c.k === 'hook2' || c.k === 'split') && f - fr(c.start) >= 0 && f - fr(c.start) < 3);
	const steps: {label: string; from: number; to: number}[] = [];
	caps.forEach((c) => { if (!c.step) return; const l = steps[steps.length - 1];
		if (l && l.label === c.step && Math.abs(l.to - fr(c.start)) < 2) l.to = fr(c.start + c.dur); else steps.push({label: c.step, from: fr(c.start), to: fr(c.start + c.dur)}); });
	return <AbsoluteFill style={{background: '#000'}}>
		<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: zc?.k === 'hook2' ? '50% 30%' : '50% 40%'}}><OffthreadVideo src={staticFile('1010wh/base.mp4')} muted/></AbsoluteFill>
		{flash && <AbsoluteFill style={{background: 'rgba(255,255,255,.7)'}}/>}
		{steps.map((s, i) => <Sequence key={i} from={s.from} durationInFrames={s.to - s.from} layout="none"><Step label={s.label}/></Sequence>)}
		{caps.map((c, i) => <Sequence key={i} from={fr(c.start)} durationInFrames={fr(c.dur)} layout="none"><Text c={c}/></Sequence>)}
		<div style={{position: 'absolute', top: 0, left: 0, height: 10, width: `${(f / durationInFrames) * 100}%`, background: `linear-gradient(90deg, ${PURPLE}, ${RED})`}}/>
	</AbsoluteFill>;
};
