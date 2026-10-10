import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence} from 'remotion';
import {loadFont} from '@remotion/fonts';
import data from './captions.json';

// 폰트 예시(참고자료/폰트예시/폰트1~7) 대응
// 폰트1 내레이션 → Gowun Batang Bold / 폰트3·4·5 붓글씨 리액션·괄호 → Dokdo
// 폰트2 단계 라벨, 폰트7 메인 → 어그로체 / 폰트6 타이틀 → Gowun Batang + Playfair Italic + 핑크 글로우
// 폰트7 위 괄호 보조자막 → Gowun Dodum 노랑
const FONTS: [string, string][] = [['Dokdo', 'Dokdo-Regular.ttf'], ['GowunBatang', 'GowunBatang-Bold.ttf'], ['GowunDodum', 'GowunDodum-Regular.ttf'], ['Aggro', 'SBAggroB.ttf'], ['PlayfairItalic', 'PlayfairItalic.ttf'], ['PretendardLight', 'Pretendard-Light.otf'], ['JejuMyeongjo', 'JejuMyeongjo-Regular.ttf']];
FONTS.forEach(([family, file]) => loadFont({family, url: staticFile('1010wh/' + file)}));

const PINK = '#ff6fae', LILAC = '#c8a2ff', YEL = '#ffe600';
type Cap = {t: string; k?: string; s?: string; sub?: string; step?: string; start: number; dur: number};
const caps = data.captions as Cap[];
const st = (w: number, c: string) => ({WebkitTextStroke: `${w}px ${c}`, paintOrder: 'stroke fill' as const});
const glow = (c: string, a = 1) => `0 0 ${10 * a}px ${c}, 0 0 ${24 * a}px ${c}, 0 0 ${44 * a}px ${c}`;

const B2: React.CSSProperties = {fontFamily: 'JejuMyeongjo', color: '#e8141c', ...st(10, '#fff'), letterSpacing: '-0.04em', wordSpacing: '0.02em',
	filter: 'drop-shadow(0 0 1.2px #2a0000) drop-shadow(0 0 1.2px #2a0000) drop-shadow(0 0 1px #2a0000) drop-shadow(0 5px 5px rgba(0,0,0,.35))'};
const S = {
	// 폰트1: 부드러운 세리프 + 어두운 얇은 테두리 + 그림자
	// 설명 자막(참고자료/폰트예시/프리텐다드.png): Pretendard Light, 얇은 테두리, 연한 검정 그림자, 스샷보다 작게
	narr: {fontFamily: 'PretendardLight', fontWeight: 300, color: '#fff', ...st(2, 'rgba(0,0,0,.55)'), textShadow: '0 2px 6px rgba(0,0,0,.32)', letterSpacing: -0.5} as React.CSSProperties,
	// 괄호 자막: 제주명조 + 뷰티폰트3식 보라 글로우
	paren: {fontFamily: 'JejuMyeongjo', color: '#fff', ...st(4, 'rgba(150,90,220,.95)'), textShadow: glow('rgba(169,110,232,.85)', 0.9), letterSpacing: -1} as React.CSSProperties,
	// 폰트3·5: 붓글씨 흰색 + 검정 테두리 + 은은한 라일락 글로우
	brush: {fontFamily: 'Dokdo', letterSpacing: '-0.09em', color: '#fff', ...st(11, '#111'), textShadow: `0 5px 8px rgba(0,0,0,.45), ${glow('rgba(200,162,255,.55)', 0.8)}`} as React.CSSProperties,
	// 펀치: 붓글씨 + 진한 핑크 글로우
	punch: {fontFamily: 'Dokdo', letterSpacing: '-0.09em', color: '#fff', ...st(10, '#2a0016'), textShadow: glow(PINK, 1.2)} as React.CSSProperties,
	// 부분 강조 단어: 핑크 글자 + 핑크 글로우
	hi: {fontFamily: 'Dokdo', letterSpacing: '-0.09em', color: '#ffc2dd', ...st(11, '#3a0020'), textShadow: glow(PINK, 0.9)} as React.CSSProperties,
	// 폰트6: 세리프 타이틀 + 핑크 글로우
	title: {fontFamily: 'GowunBatang', color: '#fff', ...st(3, 'rgba(255,111,174,.9)'), textShadow: glow(PINK, 1.1), letterSpacing: -1} as React.CSSProperties,
	// 폰트7 위 보조자막
	// 맨 위 텍스트: Pretendard Light 얇게 + 연한 그림자
	top: {fontFamily: 'PretendardLight', fontWeight: 300, color: '#fff', ...st(2, 'rgba(0,0,0,.5)'), textShadow: '0 2px 8px rgba(0,0,0,.35)', letterSpacing: -1} as React.CSSProperties,
	sub: {fontFamily: 'GowunDodum', color: YEL, ...st(7, '#1a1400'), fontSize: 56, textShadow: '0 3px 6px rgba(0,0,0,.5)'} as React.CSSProperties,
	// 폰트2·7: 굵은 고딕
	bold: {fontFamily: 'Aggro', color: '#fff', ...st(12, '#000'), letterSpacing: -2} as React.CSSProperties,
};

const Pop: React.FC<{children: React.ReactNode; strength?: number}> = ({children, strength = 0.18}) => {
	const f = useCurrentFrame(); const {fps} = useVideoConfig();
	const s = spring({frame: f, fps, config: {damping: 11, stiffness: 220}});
	return <div style={{transform: `scale(${1 - strength + strength * s})`, opacity: Math.min(1, f / 2)}}>{children}</div>;
};

// 긴 자막은 가운데 근처 띄어쓰기에서 두 줄({ } 안은 안 나눔)
const brk = (t: string, max: number) => {
	if (t.includes('\n') || t.replace(/[{}]/g, '').length <= max) return t;
	let best = -1, depth = 0;
	[...t].forEach((ch, i) => { if (ch === '{') depth++; if (ch === '}') depth--; if (ch === ' ' && !depth && (best < 0 || Math.abs(i - t.length / 2) < Math.abs(best - t.length / 2))) best = i; });
	return best < 0 ? t : t.slice(0, best) + '\n' + t.slice(best + 1);
};
const fit = (t: string, max: number, min: number, k: number) => {
	const n = Math.max(...t.replace(/[{}]/g, '').split('\n').map((l) => l.length));
	return Math.max(min, Math.min(max, Math.floor(980 / (n * k))));
};
const Lines: React.FC<{t: string; look: React.CSSProperties; size: number}> = ({t, look, size}) => look === B2 ? <div style={{fontSize: size, lineHeight: 1.05, textAlign: 'center', whiteSpace: 'nowrap', transform: 'scaleX(0.86)'}}>
	{t.split('\n').map((l, i) => <div key={i} style={B2}>{l.split(/(\{[^}]+\})/).map((p, j) => p.startsWith('{') ? <span key={j} style={{fontSize: '1.14em'}}>{p.slice(1, -1)}</span> : p.split(/([?!]+)/).map((q, k) => /^[?!]+$/.test(q) ? <span key={j + '-' + k} style={{fontFamily: 'GowunBatang', letterSpacing: '-0.02em', marginLeft: '0.04em'}}>{q}</span> : <span key={j + '-' + k}>{q}</span>))}</div>)}
</div> : <div style={{fontSize: size, lineHeight: look.fontFamily === 'Dokdo' ? 0.9 : look.fontFamily === 'PretendardLight' ? 1.3 : 1.15, textAlign: 'center', whiteSpace: 'nowrap'}}>
	{t.split('\n').map((l, i) => <div key={i}>{l.split(/(\{[^}]+\})/).map((p, j) => p.startsWith('{') ? <span key={j} style={S.hi}>{p.slice(1, -1)}</span> : <span key={j} style={look}>{p}</span>)}</div>)}
</div>;

const Block: React.FC<{top: number; sub?: string; strength?: number; children: React.ReactNode}> = ({top, sub, strength = 0.18, children}) => {
	const f = useCurrentFrame();
	return <AbsoluteFill style={{top, alignItems: 'center', padding: '0 30px'}}>
		{sub && <div style={{...S.sub, marginBottom: 6, opacity: Math.min(1, f / 4), transform: `translateY(${interpolate(f, [0, 6], [12, 0], {extrapolateRight: 'clamp'})}px)`}}>{sub}</div>}
		<Pop strength={strength}>{children}</Pop>
	</AbsoluteFill>;
};

const Text: React.FC<{c: Cap}> = ({c}) => {
	const f = useCurrentFrame();
	if (c.k === 'hook1') return <Block top={230}><div style={{textAlign: 'center', lineHeight: 1.15, whiteSpace: 'nowrap'}}>
		<div style={{...S.top, fontSize: 70}}>무쌍이</div><div style={{...S.top, fontSize: 78}}>왕홍메이크업을 받으면</div></div></Block>;
	if (c.k === 'hook2') {
		const shake = f < 8 ? Math.sin(f * 2.2) * 10 : 0;
		return <Block top={1100} strength={0.5}><div style={{transform: `rotate(-3deg) translateX(${shake}px)`}}><Lines t={'쌍꺼풀이\n생긴다구?!?!'} look={B2} size={170}/></div></Block>;
	}
	if (c.k === 'split') return <>
		<AbsoluteFill style={{top: 330, flexDirection: 'row', justifyContent: 'space-around'}}>
			{['Before', 'After'].map((x, i) => <div key={x} style={{fontFamily: 'PlayfairItalic', fontWeight: 700, fontSize: 104, color: '#fff', textShadow: glow(i ? PINK : LILAC, 1), opacity: Math.max(0, Math.min(1, (f - i * 6) / 6))}}>{x}</div>)}
		</AbsoluteFill>
		<Block top={1430}><div style={{...S.title, fontSize: 110}}>비포-애프터</div></Block>
	</>;
	if (c.k === 'cta') return <Block top={1150} sub="(비포 vs 애프터)"><Lines t={'여러분 선택은?'} look={B2} size={130}/></Block>;
	if (c.s === 'tag') return <Block top={1240} strength={0.3}><Lines t={c.t} look={S.paren} size={fit(c.t, 96, 70, 1.0)}/></Block>;
	if (c.s === 'base') { const t = brk(c.t, 18); return <Block top={1330} strength={0.05}><Lines t={t} look={S.narr} size={fit(t, 52, 44, 1.0)}/></Block>; }
	if (c.s === 'punch') { const t = brk(c.t, 8); return <Block top={1180} sub={c.sub} strength={0.45}><Lines t={t} look={B2} size={fit(t, 160, 120, 0.82)}/></Block>; }
	const t = brk(c.t, 10);
	return <Block top={1200} sub={c.sub} strength={0.22}><Lines t={t} look={B2} size={fit(t, 136, 100, 0.82)}/></Block>;
};

// 폰트2: 노랑 굵은 고딕 + 검정 테두리 단계 라벨
const Step: React.FC<{label: string}> = ({label}) => {
	const f = useCurrentFrame();
	const [n, ...rest] = label.split(' ');
	return <AbsoluteFill style={{top: 210, alignItems: 'center'}}>
		<div style={{...S.top, fontSize: 54, opacity: Math.min(1, f / 4), transform: `translateY(${interpolate(f, [0, 6], [-20, 0], {extrapolateRight: 'clamp'})}px)`}}>{n}. {rest.join(' ')}</div>
	</AbsoluteFill>;
};

export const Wanghong: React.FC = () => {
	const f = useCurrentFrame(); const {durationInFrames} = useVideoConfig();
	const fr = (s: number) => Math.round(s * 30);
	const zc = caps.find((c) => (c.k === 'hook2' || c.s === 'punch') && f >= fr(c.start) && f < fr(c.start + c.dur));
	const zoom = zc ? interpolate(f - fr(zc.start), [0, fr(zc.dur)], [1, zc.k === 'hook2' ? 1.15 : 1.08]) : 1;
	const flash = caps.some((c) => (c.k === 'hook2' || c.k === 'split') && f - fr(c.start) >= 0 && f - fr(c.start) < 3);
	const steps: {label: string; from: number; to: number}[] = [];
	caps.forEach((c) => { if (!c.step) return; const l = steps[steps.length - 1];
		if (l && l.label === c.step && Math.abs(l.to - fr(c.start)) < 2) l.to = fr(c.start + c.dur); else steps.push({label: c.step, from: fr(c.start), to: fr(c.start + c.dur)}); });
	return <AbsoluteFill style={{background: '#000'}}>
		<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: zc?.k === 'hook2' ? '50% 30%' : '50% 40%'}}><OffthreadVideo src={staticFile('1010wh/base.mp4')} muted/></AbsoluteFill>
		{flash && <AbsoluteFill style={{background: 'rgba(255,240,248,.7)'}}/>}
		{steps.map((s, i) => <Sequence key={i} from={s.from} durationInFrames={s.to - s.from} layout="none"><Step label={s.label}/></Sequence>)}
		{caps.map((c, i) => <Sequence key={i} from={fr(c.start)} durationInFrames={fr(c.dur)} layout="none"><Text c={c}/></Sequence>)}
		<div style={{position: 'absolute', top: 0, left: 0, height: 10, width: `${(f / durationInFrames) * 100}%`, background: `linear-gradient(90deg, ${LILAC}, ${PINK})`, boxShadow: `0 0 12px ${PINK}`}}/>
	</AbsoluteFill>;
};
