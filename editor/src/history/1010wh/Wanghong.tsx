import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence} from 'remotion';
import {loadFont} from '@remotion/fonts';
import data from './captions.json';

loadFont({family: 'Gaegu', url: staticFile('1010wh/Gaegu-Bold.ttf'), weight: '700'});
const FONT = 'Apple SD Gothic Neo, sans-serif';
const Y = '#ffe14d';
type Cap = {t: string; k?: string; step?: string; start: number; dur: number};
const caps = data.captions as Cap[];
const stroke = (w: number, c = '#000') => ({WebkitTextStroke: `${w}px ${c}`, paintOrder: 'stroke fill' as const});

const Pop: React.FC<{children: React.ReactNode; strength?: number}> = ({children, strength = 0.18}) => {
	const f = useCurrentFrame(); const {fps} = useVideoConfig();
	const s = spring({frame: f, fps, config: {damping: 11, stiffness: 220}});
	return <div style={{transform: `scale(${1 - strength + strength * s})`, opacity: Math.min(1, f / 2)}}>{children}</div>;
};

const Text: React.FC<{c: Cap}> = ({c}) => {
	const f = useCurrentFrame();
	const lines = c.t.split('\n');
	const base: React.CSSProperties = {fontFamily: FONT, fontWeight: 800, color: '#fff', textAlign: 'center', lineHeight: 1.18, letterSpacing: -1, ...stroke(14)};
	if (c.k === 'hook1') return <AbsoluteFill style={{top: 250, alignItems: 'center'}}><Pop><div style={{...base, fontSize: 96, ...stroke(18)}}>무쌍이<br/><span style={{color: Y}}>왕홍메이크업</span>을 받으면</div></Pop></AbsoluteFill>;
	if (c.k === 'hook2') {
		const shake = f < 8 ? Math.sin(f * 2.2) * 10 : 0;
		return <AbsoluteFill style={{alignItems: 'center', top: 1130}}><Pop strength={0.5}><div style={{...base, fontSize: 132, color: Y, ...stroke(22, '#c8102e'), transform: `rotate(-4deg) translateX(${shake}px)`}}>쌍꺼풀이<br/>생긴다구?!?!</div></Pop></AbsoluteFill>;
	}
	if (c.k === 'split') return <>
		<AbsoluteFill style={{top: 360, flexDirection: 'row', justifyContent: 'space-around'}}>
			{['BEFORE', 'AFTER'].map((x, i) => <div key={x} style={{fontFamily: FONT, fontWeight: 900, fontSize: 64, color: i ? Y : '#fff', ...stroke(12), transform: `scale(${Math.min(1, (f - i * 6) / 6)})`}}>{x}</div>)}
		</AbsoluteFill>
		<AbsoluteFill style={{top: 1440, alignItems: 'center'}}><Pop><div style={{...base, fontSize: 92}}>비포-애프터</div></Pop></AbsoluteFill>
	</>;
	if (c.k === 'cta') return <AbsoluteFill style={{top: 1180, alignItems: 'center'}}><Pop><div style={{...base, fontSize: 84, background: 'rgba(0,0,0,.55)', padding: '20px 40px', borderRadius: 28, ...stroke(0)}}>{lines[0]}<br/><span style={{color: Y}}>{lines[1]}</span></div></Pop></AbsoluteFill>;
	const style: React.CSSProperties = c.k === 'paren' ? {...base, fontSize: 64, color: '#eaeaea', fontWeight: 700}
		: c.k === 'hand' ? {...base, fontFamily: 'Gaegu', fontWeight: 700, fontSize: 80, color: Y, letterSpacing: 0, whiteSpace: 'nowrap'}
		: c.k === 'big' ? {...base, fontSize: 108, color: Y, ...stroke(18)}
		: {...base, fontSize: lines.some((l) => l.length > 14) ? 62 : 76};
	return <AbsoluteFill style={{top: 1260, alignItems: 'center', padding: '0 50px'}}><Pop strength={c.k === 'big' ? 0.4 : 0.15}><div style={style}>{lines.map((l, i) => <div key={i}>{l}</div>)}</div></Pop></AbsoluteFill>;
};

const Step: React.FC<{label: string}> = ({label}) => {
	const f = useCurrentFrame();
	const [n, ...rest] = label.split(' ');
	const x = interpolate(f, [0, 6], [-80, 0], {extrapolateRight: 'clamp'});
	return <AbsoluteFill style={{top: 210, left: 40, alignItems: 'flex-start'}}>
		<div style={{display: 'flex', alignItems: 'center', gap: 18, background: 'rgba(0,0,0,.62)', borderRadius: 60, padding: '12px 34px 12px 14px', transform: `translateX(${x}px)`, opacity: Math.min(1, f / 4)}}>
			<div style={{width: 72, height: 72, borderRadius: 36, background: Y, color: '#000', fontFamily: FONT, fontWeight: 900, fontSize: 46, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{n}</div>
			<div style={{fontFamily: FONT, fontWeight: 800, fontSize: 54, color: '#fff'}}>{rest.join(' ')}</div>
		</div>
	</AbsoluteFill>;
};

export const Wanghong: React.FC = () => {
	const f = useCurrentFrame(); const {durationInFrames} = useVideoConfig();
	const fr = (s: number) => Math.round(s * 30);
	// 강조 줌: hook2와 big 자막 구간에서 살짝 밀어넣기
	const zc = caps.find((c) => (c.k === 'hook2' || c.k === 'big') && f >= fr(c.start) && f < fr(c.start + c.dur));
	const zoom = zc ? interpolate(f - fr(zc.start), [0, fr(zc.dur)], [1, zc.k === 'hook2' ? 1.15 : 1.08]) : 1;
	const flash = caps.some((c) => (c.k === 'hook2' || c.k === 'split') && f - fr(c.start) >= 0 && f - fr(c.start) < 3);
	// 단계 표시: 같은 단계가 이어지면 한 번만 등장
	const steps: {label: string; from: number; to: number}[] = [];
	caps.forEach((c) => { if (!c.step) return; const l = steps[steps.length - 1];
		if (l && l.label === c.step && Math.abs(l.to - fr(c.start)) < 2) l.to = fr(c.start + c.dur); else steps.push({label: c.step, from: fr(c.start), to: fr(c.start + c.dur)}); });
	return <AbsoluteFill style={{background: '#000'}}>
		<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: zc?.k === 'hook2' ? '50% 30%' : '50% 40%'}}><OffthreadVideo src={staticFile('1010wh/base.mp4')} muted/></AbsoluteFill>
		{flash && <AbsoluteFill style={{background: 'rgba(255,255,255,.7)'}}/>}
		{steps.map((s, i) => <Sequence key={i} from={s.from} durationInFrames={s.to - s.from} layout="none"><Step label={s.label}/></Sequence>)}
		{caps.map((c, i) => <Sequence key={i} from={fr(c.start)} durationInFrames={fr(c.dur)} layout="none"><Text c={c}/></Sequence>)}
		<div style={{position: 'absolute', top: 0, left: 0, height: 10, width: `${(f / durationInFrames) * 100}%`, background: Y}}/>
	</AbsoluteFill>;
};
