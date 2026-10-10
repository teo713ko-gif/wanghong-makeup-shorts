import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {z} from 'zod';
import {zColor} from '@remotion/zod-types';
import {PRESETS, FONTS, STYLE_IDS, STYLE_OR_AUTO, ROLE_IDS, ANIM_IDS, POS, POS_THIRDS, THIRDS, StylePreset, StyleId} from './styles';

FONTS.forEach(([family, file]) => loadFont({family, url: staticFile('1010wh/' + file)}));

export const captionSchema = z.object({
	text: z.string(),
	sub: z.string(),
	role: z.enum(ROLE_IDS),
	style: z.enum(STYLE_OR_AUTO),
	emph: z.enum(STYLE_OR_AUTO),
	anim: z.enum(['auto', ...ANIM_IDS] as unknown as ['auto', ...typeof ANIM_IDS]),
	pos: z.enum(['top', 'upper', 'middle', 'lower']),
	scale: z.number().min(0.4).max(2.5).step(0.05),
	zoom: z.boolean(),
	flash: z.boolean(),
	labels: z.boolean(),
	step: z.string(),
	start: z.number().step(0.01),
	dur: z.number().min(0.1).step(0.01),
});
export const editorSchema = z.object({
	layout: z.enum(['thirds', 'full']),
	title: z.string(),
	titleStyle: z.enum(STYLE_IDS),
	bottomText: z.string(),
	roles: z.object(Object.fromEntries(ROLE_IDS.map((r) => [r, z.object({style: z.enum(STYLE_IDS), anim: z.enum(ANIM_IDS), scale: z.number().min(0.4).max(2.5).step(0.05)})])) as Record<(typeof ROLE_IDS)[number], z.ZodObject<{style: z.ZodEnum<{[k in StyleId]: k}>; anim: z.ZodEnum<{[k in (typeof ANIM_IDS)[number]]: k}>; scale: z.ZodNumber}>>),
	emphStyle: z.enum(STYLE_IDS),
	subPos: z.enum(['below', 'above']),
	captions: z.array(captionSchema),
	subStyle: z.enum(STYLE_IDS),
	showSteps: z.boolean(),
	stepStyle: z.enum(STYLE_IDS),
	stepScale: z.number().min(0.4).max(2).step(0.05),
	stepPos: z.enum(['top', 'upper', 'middle', 'lower', 'videoBottom']),
	talkSpeed: z.number().min(0.02).max(0.2).step(0.005),
	progressBar: z.boolean(),
	custom: z.object({
		font: z.enum(FONTS.map((f) => f[0]) as [string, ...string[]]),
		size: z.number().min(30).max(220),
		color: zColor(),
		stroke: z.number().min(0).max(24),
		strokeColor: zColor(),
		glow: zColor(),
		glowSize: z.number().min(0).max(3).step(0.1),
		scaleX: z.number().min(0.6).max(1.2).step(0.01),
	}),
});
export type EditorProps = z.infer<typeof editorSchema>;
type Cap = z.infer<typeof captionSchema>;

const presetOf = (id: StyleId, custom: EditorProps['custom']): StylePreset =>
	id === 'custom' ? {label: '커스텀', ...custom, letterSpacing: '-0.02em', lineHeight: 1.1, shadow: '0 4px 8px rgba(0,0,0,.4)'} : (PRESETS as Record<string, StylePreset>)[id];

const look = (p: StylePreset): React.CSSProperties => {
	const g = p.glow ? [10, 24, 44].map((r) => `0 0 ${r * (p.glowSize ?? 1)}px ${p.glow}`) : [];
	return {fontFamily: p.font, fontWeight: p.weight, color: p.color, WebkitTextStroke: `${p.stroke}px ${p.strokeColor}`, paintOrder: 'stroke fill',
		textShadow: [...g, p.shadow].filter(Boolean).join(', ') || undefined, letterSpacing: p.letterSpacing};
};
const outerFilter = (p: StylePreset) => p.outer ? `drop-shadow(0 0 1.2px ${p.outer}) drop-shadow(0 0 1.2px ${p.outer}) drop-shadow(0 0 1px ${p.outer})` : undefined;

// 긴 문장은 가운데 띄어쓰기에서 두 줄({ } 안은 안 나눔)
const brk = (t: string, max: number) => {
	if (t.includes('\n') || t.replace(/[{}]/g, '').length <= max) return t;
	let best = -1, depth = 0;
	[...t].forEach((ch, i) => { if (ch === '{') depth++; if (ch === '}') depth--; if (ch === ' ' && !depth && (best < 0 || Math.abs(i - t.length / 2) < Math.abs(best - t.length / 2))) best = i; });
	return best < 0 ? t : t.slice(0, best) + '\n' + t.slice(best + 1);
};

type Glyph = {ch: string; emph: boolean; idx: number};
const parse = (line: string, counter: {n: number}): Glyph[] => {
	const out: Glyph[] = []; let emph = false;
	for (const ch of Array.from(line)) { if (ch === '{') { emph = true; continue; } if (ch === '}') { emph = false; continue; } out.push({ch, emph, idx: counter.n++}); }
	return out;
};

const CharAnim: React.FC<{g: Glyph; anim: Cap['anim']; total: number; dur: number; speed: number; style: React.CSSProperties}> = ({g, anim, total, dur, speed, style}) => {
	const f = useCurrentFrame(); const {fps} = useVideoConfig();
	// 글자 간격: 자막 길이의 60% 안에 다 나오게
	const step = Math.min(speed, (dur * 0.6) / Math.max(total, 1)) * fps;
	const delay = anim === 'talk' || anim === 'type' ? g.idx * step : 0;
	const p = spring({frame: f - delay, fps, config: {damping: 12, stiffness: 260}});
	let tr = '', op = 1;
	if (anim === 'talk') { tr = `translateY(${(1 - p) * 18}px) scale(${0.6 + 0.4 * p})`; op = Math.min(1, Math.max(0, (f - delay) / 2)); }
	if (anim === 'type') op = f >= delay ? 1 : 0;
	if (anim === 'wave') tr = `translateY(${Math.sin((f - g.idx * 3) / 4) * 6}px)`;
	if (space(g.ch)) return <span style={{...style, whiteSpace: 'pre'}}> </span>;
	// 제주명조는 ?! 폭이 넓어 문장부호만 Gowun Batang으로
	const punct = /[?!]/.test(g.ch) && style.fontFamily === 'JejuMyeongjo' ? {fontFamily: 'GowunBatang', letterSpacing: '-0.02em'} : {};
	return <span style={{...style, ...punct, display: 'inline-block', transform: tr, opacity: op}}>{g.ch}</span>;
};
const space = (c: string) => c === ' ';

const CaptionView: React.FC<{c: Cap; props: EditorProps}> = ({c, props}) => {
	const f = useCurrentFrame(); const {fps} = useVideoConfig();
	const role = props.roles[c.role];
	const styleId = c.style === 'auto' ? role.style : c.style;
	const emphId = c.emph === 'auto' ? props.emphStyle : c.emph;
	const anim = c.anim === 'auto' ? role.anim : c.anim;
	const p = presetOf(styleId, props.custom), pe = presetOf(emphId, props.custom);
	const scale = c.scale * role.scale;
	const lines = brk(c.text, p.size * scale > 90 ? 10 : 18).split('\n');
	const n = Math.max(...lines.map((l) => l.replace(/[{}]/g, '').length));
	const size = Math.min(p.size * scale, 1000 / (n * 0.92 * (p.scaleX ?? 1)));
	const counter = {n: 0}; const glyphLines = lines.map((l) => parse(l, counter));
	const base = look(p), emph = emphId === styleId ? {...base, fontSize: '1.14em'} : {...look(pe), fontSize: pe.size > p.size * 1.3 ? '1.08em' : '1em'};
	const whole = spring({frame: f, fps, config: {damping: 10, stiffness: 220}});
	let wrapTr = '', wrapOp = 1, blur = 0;
	if (anim === 'pop') wrapTr = `scale(${0.6 + 0.4 * whole})`;
	if (anim === 'shake') wrapTr = `scale(${0.7 + 0.3 * whole}) rotate(${f < 10 ? Math.sin(f * 2.3) * 3 : 0}deg)`;
	if (anim === 'fade' || anim === 'sparkle') { wrapOp = Math.min(1, f / 8); blur = interpolate(f, [0, 8], [10, 0], {extrapolateRight: 'clamp'}); }
	const pulse = anim === 'sparkle' || anim === 'starfield' ? 0.75 + 0.35 * Math.sin(f / 5) : 1;
	if ((anim === 'sparkle' || anim === 'starfield') && p.glow) Object.assign(base, {textShadow: [10, 24, 44].map((r) => `0 0 ${r * (p.glowSize ?? 1) * pulse}px ${p.glow}`).join(', ')});
	const sp = presetOf(props.subStyle, props.custom);
	return <AbsoluteFill style={{top: (props.layout === 'thirds' ? POS_THIRDS : POS)[c.pos], alignItems: 'center', padding: '0 30px'}}>
		{c.sub && props.subPos === 'above' && <div style={{...look(sp), fontSize: sp.size, lineHeight: 1.2, marginBottom: 4}}>{c.sub}</div>}
		<div style={{transform: wrapTr, opacity: wrapOp, filter: blur ? `blur(${blur}px)` : undefined, ...(anim === 'starfield' ? (() => { const x = interpolate(f, [0, SWEEP], [-15, 115], {extrapolateRight: 'clamp'}); const m = `linear-gradient(90deg, #000 ${x - 10}%, transparent ${x + 10}%)`; return {WebkitMaskImage: m, maskImage: m}; })() : {})}}>
			<div style={{fontSize: size, lineHeight: p.lineHeight ?? 1.1, textAlign: 'center', whiteSpace: 'nowrap', transform: p.scaleX ? `scaleX(${p.scaleX})` : undefined, filter: outerFilter(p)}}>
				{glyphLines.map((gl, i) => <div key={i}>{gl.map((g) => <CharAnim key={g.idx} g={g} anim={anim} total={counter.n} dur={c.dur} speed={props.talkSpeed} style={g.emph ? emph : base}/>)}</div>)}
			</div>
		</div>
		{anim === 'sparkle' && <Sparkles w={Math.min(1000, n * size * 0.95 * (p.scaleX ?? 1))} h={size * lines.length * 1.2}/>}
		{anim === 'starfield' && <StarSweep w={Math.min(1000, n * size * 0.95 * (p.scaleX ?? 1))} h={size * lines.length * 1.2}/>}
		{c.sub && props.subPos === 'below' && <div style={{...look(sp), fontSize: sp.size, lineHeight: 1.2, marginTop: 2}}>{c.sub}</div>}
	</AbsoluteFill>;
};

// 샤랄라(CapCut 별무리 느낌): 흰 반짝이가 왼쪽→오른쪽으로 쓸고 지나가며 퍼지고 잠깐 반짝인 뒤 사라짐
const SWEEP = 22; // 왼→오 쓸고 가는 프레임 수
const rnd = (i: number, k: number) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const StarSweep: React.FC<{w: number; h: number}> = ({w, h}) => {
	const f = useCurrentFrame();
	const N = 60;
	return <div style={{position: 'absolute', top: 0, width: w, height: h, left: '50%', marginLeft: -w / 2, pointerEvents: 'none'}}>
		{Array.from({length: N}, (_, i) => {
			const fx = i / (N - 1);
			const born = fx * SWEEP + rnd(i, 1) * 4;
			const life = 14 + rnd(i, 2) * 18;
			const t = (f - born) / life;
			if (t < 0 || t > 1) return null;
			const op = Math.min(1, t * 6) * (1 - t) * 1.3 * (0.7 + 0.3 * Math.sin(f * 0.9 + i));
			const x = fx * w + (rnd(i, 3) - 0.3) * 60 + t * 40;
			const y = (rnd(i, 4) * 1.3 - 0.15) * h - t * 18;
			const size = 14 + rnd(i, 5) * 30;
			const star = rnd(i, 6) > 0.4;
			return star
				? <span key={i} style={{position: 'absolute', left: x, top: y, fontSize: size * 1.4, lineHeight: 1, color: '#fff', opacity: op, transform: `translate(-50%,-50%) scale(${0.6 + 0.6 * Math.min(1, t * 6) * (1 - t)})`, textShadow: '0 0 6px #fff, 0 0 14px rgba(255,255,255,.9)'}}>✦</span>
				: <span key={i} style={{position: 'absolute', left: x, top: y, width: size * 0.35, height: size * 0.35, borderRadius: '50%', background: '#fff', opacity: op, transform: 'translate(-50%,-50%)', boxShadow: `0 0 ${size * 0.6}px ${size * 0.25}px rgba(255,255,255,.85)`}}/>;
		})}
		{/* 쓸고 간 뒤에도 글자 위에서 흰 별이 계속 반짝임 */}
		{f > SWEEP * 0.6 && Array.from({length: 14}, (_, i) => {
			const per = 20 + rnd(i, 7) * 16, t = ((f + rnd(i, 8) * per) % per) / per, op = Math.sin(t * Math.PI);
			const size = 18 + rnd(i, 9) * 26;
			return <span key={'p' + i} style={{position: 'absolute', left: rnd(i, 10) * w, top: (rnd(i, 11) * 1.2 - 0.1) * h, fontSize: size, lineHeight: 1, color: '#fff', opacity: op, transform: `translate(-50%,-50%) scale(${0.4 + 0.8 * op}) rotate(${t * 45}deg)`, textShadow: '0 0 6px #fff, 0 0 16px rgba(255,255,255,.95)'}}>✦</span>;
		})}
	</div>;
};

// 샤랄라(하트): 글자 주변에 분홍·흰 별/하트가 순서대로 반짝 (원래 버전)
const Sparkles: React.FC<{w: number; h: number}> = ({w, h}) => {
	const f = useCurrentFrame();
	const pts = [[-0.08, 0.15, '✦'], [0.18, -0.3, '✧'], [0.45, -0.38, '✦'], [0.7, -0.3, '♡'], [0.98, 0.0, '✧'], [1.06, 0.55, '✦'], [-0.1, 0.65, '✧'], [0.88, -0.42, '♡']] as const;
	return <div style={{position: 'absolute', top: 0, width: w, height: h, left: '50%', marginLeft: -w / 2, pointerEvents: 'none'}}>
		{pts.map(([x, y, ch], i) => { const t = ((f + i * 7) % 28) / 28; const s = Math.sin(t * Math.PI);
			return <span key={i} style={{position: 'absolute', left: x * w, top: y * h - 20, fontSize: i % 3 === 2 ? 34 : 42, color: i % 2 ? '#fff' : '#ffb3dc', opacity: s, transform: `scale(${0.4 + 0.8 * s}) rotate(${t * 90}deg)`, textShadow: '0 0 10px #ff6fbe, 0 0 20px #ff6fbe'}}>{ch}</span>; })}
	</div>;
};

const Labels: React.FC<{top: number}> = ({top}) => {
	const f = useCurrentFrame();
	return <AbsoluteFill style={{top, flexDirection: 'row', justifyContent: 'space-around'}}>
		{['Before', 'After'].map((x, i) => <div key={x} style={{fontFamily: 'PlayfairItalic', fontWeight: 700, fontSize: 120, color: '#fff', textShadow: `0 3px 6px rgba(0,0,0,.55), 0 0 14px ${i ? '#ff6fae' : '#c8a2ff'}, 0 0 30px ${i ? '#ff6fae' : '#c8a2ff'}`, opacity: Math.max(0, Math.min(1, (f - i * 6) / 6))}}>{x}</div>)}
	</AbsoluteFill>;
};

const StepView: React.FC<{label: string; props: EditorProps}> = ({label, props}) => {
	const f = useCurrentFrame(); const p = presetOf(props.stepStyle, props.custom);
	const [n, ...rest] = label.split(' ');
	const top = props.stepPos === 'videoBottom' ? (props.layout === 'thirds' ? THIRDS.barTop + THIRDS.videoH - 170 : 1450) : (props.layout === 'thirds' ? POS_THIRDS : POS)[props.stepPos];
	return <AbsoluteFill style={{top, alignItems: 'center'}}>
		<div style={{...look(p), fontSize: p.size * props.stepScale, opacity: Math.min(1, f / 4), transform: `translateY(${interpolate(f, [0, 6], [-20, 0], {extrapolateRight: 'clamp'})}px)`, filter: outerFilter(p)}}>{n}. {rest.join(' ')}</div>
	</AbsoluteFill>;
};

// 삼등분 위 띠 제목 + 아래 띠 문구
const TitleBar: React.FC<{props: EditorProps}> = ({props}) => {
	const p = presetOf(props.titleStyle, props.custom);
	const lines = props.title.split('\n');
	const n = Math.max(...lines.map((l) => l.length));
	// 한글 실측 폭 ≈ 0.78em/자 → 화면 폭 1020px 안에서 최대한 크게
	const size = Math.min(p.size, 1020 / (n * 0.78 * (p.scaleX ?? 1)));
	return <>
		<div style={{position: 'absolute', top: 0, left: 0, width: 1080, height: THIRDS.barTop, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 14}}>{/* 제목은 영상 칸 바로 위에 붙임 */}
			<div style={{...look(p), fontSize: size, lineHeight: p.lineHeight, textAlign: 'center', whiteSpace: 'nowrap', transform: p.scaleX ? `scaleX(${p.scaleX})` : undefined, filter: outerFilter(p)}}>{lines.map((l, i) => <div key={i}>{l}</div>)}</div>
		</div>
		{props.bottomText && <div style={{position: 'absolute', top: THIRDS.barTop + THIRDS.videoH + 30, width: 1080, textAlign: 'center', ...look(p), fontSize: 56}}>{props.bottomText}</div>}
	</>;
};

export const Editor: React.FC<EditorProps> = (props) => {
	const f = useCurrentFrame(); const {durationInFrames} = useVideoConfig();
	const fr = (s: number) => Math.round(s * 30);
	const caps = props.captions;
	const zc = caps.find((c) => c.zoom && f >= fr(c.start) && f < fr(c.start + c.dur));
	const zoom = zc ? interpolate(f - fr(zc.start), [0, fr(zc.dur)], [1, 1.12]) : 1;
	const flash = caps.some((c) => c.flash && f - fr(c.start) >= 0 && f - fr(c.start) < 3);
	const steps: {label: string; from: number; to: number}[] = [];
	if (props.showSteps) caps.forEach((c) => { if (!c.step) return; const l = steps[steps.length - 1];
		if (l && l.label === c.step && Math.abs(l.to - fr(c.start)) < 2) l.to = fr(c.start + c.dur); else steps.push({label: c.step, from: fr(c.start), to: fr(c.start + c.dur)}); });
	return <AbsoluteFill style={{background: '#000'}}>
		{props.layout === 'thirds'
			? <div style={{position: 'absolute', top: THIRDS.barTop, left: 0, width: 1080, height: THIRDS.videoH, overflow: 'hidden'}}>
				<div style={{width: '100%', height: '100%', transform: `scale(${zoom})`, transformOrigin: '50% 40%'}}><OffthreadVideo src={staticFile('1010wh/base_square.mp4')} muted style={{width: 1080, height: THIRDS.videoH}}/></div></div>
			: <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 35%'}}><OffthreadVideo src={staticFile('1010wh/base.mp4')} muted/></AbsoluteFill>}
		{props.layout === 'thirds' && <TitleBar props={props}/>}
		{flash && <AbsoluteFill style={props.layout === 'thirds' ? {top: THIRDS.barTop, height: THIRDS.videoH, background: 'rgba(255,240,248,.7)'} : {background: 'rgba(255,240,248,.7)'}}/>}
		{steps.map((s, i) => <Sequence key={'s' + i} from={s.from} durationInFrames={s.to - s.from} layout="none"><StepView label={s.label} props={props}/></Sequence>)}
		{caps.map((c, i) => <Sequence key={i} from={fr(c.start)} durationInFrames={Math.max(1, fr(c.dur))} layout="none">
			{c.labels && <Labels top={props.layout === 'thirds' ? 440 : 330}/>}{c.text.trim() !== '' && <CaptionView c={c} props={props}/>}
		</Sequence>)}
		{props.progressBar && <div style={{position: 'absolute', top: 0, left: 0, height: 10, width: `${(f / durationInFrames) * 100}%`, background: 'linear-gradient(90deg, #c8a2ff, #ff6fae)', boxShadow: '0 0 12px #ff6fae'}}/>}
	</AbsoluteFill>;
};

// 스타일 카탈로그: 모든 프리셋을 같은 문장으로 비교
export const catalogSchema = z.object({sample: z.string(), anim: z.enum(ANIM_IDS)});
export const Catalog: React.FC<z.infer<typeof catalogSchema>> = ({sample, anim}) => {
	const ids = Object.keys(PRESETS) as (keyof typeof PRESETS)[];
	const all = PRESETS as Record<string, StylePreset>;
	return <AbsoluteFill style={{background: 'linear-gradient(160deg,#d9cfc7,#8d7f88)', padding: 30, display: 'flex', flexDirection: 'column', gap: 6}}>
		{ids.map((id) => { const p = all[id]; const counter = {n: 0}; const gl = parse(sample, counter);
			return <div key={id} style={{height: Math.floor(1860 / ids.length), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,.3)'}}>
				<div style={{fontFamily: 'PretendardLight', fontSize: 24, color: '#222', alignSelf: 'flex-start'}}>{id} — {p.label}</div>
				<div style={{fontSize: Math.min(p.size, 1000 / (gl.length * 0.92 * (p.scaleX ?? 1)), 1860 / ids.length - 36), lineHeight: p.lineHeight, whiteSpace: 'nowrap', transform: p.scaleX ? `scaleX(${p.scaleX})` : undefined, filter: outerFilter(p)}}>
					{gl.map((g) => <CharAnim key={g.idx} g={g} anim={anim} total={counter.n} dur={2} speed={0.06} style={look(p)}/>)}</div>
			</div>; })}
	</AbsoluteFill>;
};
