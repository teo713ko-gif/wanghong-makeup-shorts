// 자막 스타일 프리셋. 새 예시를 받으면 여기에 항목을 추가하면 편집기 드롭다운에 바로 나타남.
export type StylePreset = {
	label: string;            // 편집기 표시 이름(예시 출처)
	font: string;             // loadFont family
	size: number;             // 기본 글자 크기(px, 1080 기준)
	color: string;            // 채움색
	stroke: number;           // 안쪽 테두리 두께
	strokeColor: string;
	outer?: string;           // 바깥 테두리색(이중 테두리)
	glow?: string;            // 글로우 색
	glowSize?: number;        // 글로우 세기 배수
	shadow?: string;          // 그림자
	scaleX?: number;          // 가로 압축
	letterSpacing?: string;
	lineHeight?: number;
	weight?: number;
};

export const FONTS: [string, string][] = [
	['PretendardLight', 'Pretendard-Light.otf'], ['PretendardSemiBold', 'Pretendard-SemiBold.otf'], ['PretendardMedium', 'Pretendard-Medium.otf'], ['YeonSung', 'YeonSung-Regular.ttf'], ['GowunBatangReg', 'GowunBatang-Regular.ttf'], ['GaeguBold', 'Gaegu-Bold.ttf'], ['JejuMyeongjo', 'JejuMyeongjo-Regular.ttf'], ['GowunBatang', 'GowunBatang-Bold.ttf'],
	['GowunDodum', 'GowunDodum-Regular.ttf'], ['Dokdo', 'Dokdo-Regular.ttf'], ['Aggro', 'SBAggroB.ttf'], ['PoorStory', 'PoorStory-Regular.ttf'], ['PlayfairItalic', 'PlayfairItalic.ttf'],
];

export const PRESETS = {
	// ── 예시: youtube.com/shorts/HxM6DROCO40 (상하이 왕홍 체험) ──
	hx_basic: {label: '[HxM6] 기본 말자막 — 흰 프리텐다드 중간굵기·은은한 그림자', font: 'PretendardMedium', size: 64, color: '#fff', stroke: 0, strokeColor: 'transparent', shadow: '0 0 4px rgba(0,0,0,.35), 0 2px 4px rgba(0,0,0,.4)', letterSpacing: '-0.02em', lineHeight: 1.25, weight: 500},
	hx_small: {label: '[HxM6] 아래 작은 보조 "(배우고 싶었음)"', font: 'PretendardMedium', size: 38, color: '#fff', stroke: 0, strokeColor: 'transparent', shadow: '0 0 4px rgba(0,0,0,.4), 0 1px 3px rgba(0,0,0,.4)', lineHeight: 1.2, weight: 500},
	hx_react: {label: '[HxM6] 리액션 "(칭찬 중)" — 둥근 손글씨·검정 굵은 테두리', font: 'GaeguBold', size: 118, color: '#fff', stroke: 9, strokeColor: '#1e1e1e', shadow: '0 5px 6px rgba(0,0,0,.3)', letterSpacing: '-0.06em', lineHeight: 1.0},
	hx_hand: {label: '[HxM6] 손글씨 "피부 : 살려줘"', font: 'YeonSung', size: 88, color: '#fff', stroke: 0, strokeColor: 'transparent', shadow: '0 0 5px rgba(0,0,0,.35), 0 3px 6px rgba(0,0,0,.45)', lineHeight: 1.15},
	hx_title: {label: '[HxM6] 오프닝 "왕홍 체험" — 베이지 손글씨·진한 그림자', font: 'YeonSung', size: 104, color: '#f3e3c3', stroke: 0, strokeColor: 'transparent', shadow: '0 3px 6px rgba(0,0,0,.65), 0 0 2px rgba(0,0,0,.5)', lineHeight: 1.1},
	hx_pink: {label: '[HxM6] 핑크 "코덕 대통합💜" — 핑크 글자·흰 테두리·은은한 글로우', font: 'GowunDodum', size: 96, color: '#ff8ccc', stroke: 4, strokeColor: '#fff', glow: 'rgba(255,255,255,.7)', glowSize: 0.5, shadow: '0 3px 6px rgba(0,0,0,.25)', lineHeight: 1.1},
	hx_point: {label: '[HxM6] 단어만 색 "파워 I라" — 핑크빨강 포인트', font: 'PretendardMedium', size: 64, color: '#ff4d6d', stroke: 0, strokeColor: 'transparent', shadow: '0 0 4px rgba(0,0,0,.35), 0 2px 4px rgba(0,0,0,.4)', letterSpacing: '-0.02em', lineHeight: 1.25, weight: 500},
	// ── 사용자 지정 예시 (참고자료/폰트예시) ──
	basic_m: {label: '[기본자막.png] 기본 — Pretendard Medium·그림자·예시의 2/3 크기', font: 'PretendardMedium', size: 54, color: '#fff', stroke: 0, strokeColor: 'transparent', shadow: '0 0 6px rgba(0,0,0,.35), 0 3px 6px rgba(0,0,0,.45)', letterSpacing: '-0.02em', lineHeight: 1.25, weight: 500},
	red_glow: {label: '[빨간.png] 흰 제주명조 + 빨간 글로우', font: 'JejuMyeongjo', size: 100, color: '#fff', stroke: 1, strokeColor: 'rgba(255,255,255,.9)', glow: 'rgba(255,45,75,.85)', glowSize: 0.9, shadow: '0 2px 3px rgba(120,0,20,.35)', letterSpacing: '-0.03em', lineHeight: 1.1},
	point_glow: {label: '[빨간.png] 단어 강조 — 흰 글자 + 빨간 글로우', font: 'PretendardMedium', size: 54, color: '#fff', stroke: 0, strokeColor: 'transparent', glow: 'rgba(255,45,75,.9)', glowSize: 0.6, letterSpacing: '-0.02em', lineHeight: 1.25, weight: 500},
	sha: {label: '[샤랄라.png] 얇은 명조 + 분홍 글로우 (샤랄라 애니메이션과 함께)', font: 'GowunBatangReg', size: 96, color: '#fff', stroke: 2, strokeColor: 'rgba(255,170,215,.95)', glow: 'rgba(255,110,190,.85)', glowSize: 0.9, letterSpacing: '-0.01em', lineHeight: 1.15},
	// ── 그 외 예시 ──
	thin: {label: '얇은 프리텐다드 설명 (프리텐다드.png)', font: 'PretendardLight', size: 50, color: '#fff', stroke: 2, strokeColor: 'rgba(0,0,0,.55)', shadow: '0 2px 6px rgba(0,0,0,.32)', lineHeight: 1.3, weight: 300},
	red2: {label: '[뷰티폰트2] 빨강 명조 강조', font: 'JejuMyeongjo', size: 120, color: '#e8141c', stroke: 10, strokeColor: '#fff', outer: '#2a0000', shadow: '0 5px 5px rgba(0,0,0,.35)', scaleX: 0.86, letterSpacing: '-0.04em', lineHeight: 1.05},
	white1: {label: '[뷰티폰트1] 흰 명조 + 검정 테두리', font: 'JejuMyeongjo', size: 116, color: '#fff', stroke: 9, strokeColor: '#111', shadow: '0 5px 6px rgba(0,0,0,.35)', scaleX: 0.86, letterSpacing: '-0.04em', lineHeight: 1.05},
	glow3: {label: '[뷰티폰트3] 흰 명조 + 보라 글로우', font: 'JejuMyeongjo', size: 112, color: '#fff', stroke: 4, strokeColor: 'rgba(150,90,220,.95)', glow: 'rgba(169,110,232,.85)', glowSize: 1, scaleX: 0.9, letterSpacing: '-0.03em', lineHeight: 1.08},
	pink6: {label: '세리프 + 핑크 글로우 타이틀 (폰트6)', font: 'GowunBatang', size: 96, color: '#fff', stroke: 3, strokeColor: 'rgba(255,111,174,.9)', glow: '#ff6fae', glowSize: 1.1, letterSpacing: '-0.02em', lineHeight: 1.15},
	brush: {label: '붓글씨 흰 + 검정 테두리 (폰트3·4·5)', font: 'Dokdo', size: 140, color: '#fff', stroke: 11, strokeColor: '#111', shadow: '0 5px 8px rgba(0,0,0,.45)', letterSpacing: '-0.09em', lineHeight: 0.9},
	label_thin: {label: '[폰트2 얇게] 노랑 단계 라벨 — Pretendard Medium·얇은 테두리', font: 'PretendardMedium', size: 58, color: '#ffe600', stroke: 3, strokeColor: 'rgba(0,0,0,.75)', shadow: '0 2px 6px rgba(0,0,0,.45)', letterSpacing: '-0.01em', lineHeight: 1.2, weight: 500},
	label2: {label: '노랑 굵은 고딕 라벨 (폰트2)', font: 'Aggro', size: 76, color: '#ffe600', stroke: 12, strokeColor: '#000', letterSpacing: '-0.02em', lineHeight: 1.1},
	bold7: {label: '흰 굵은 고딕 + 검정 테두리 (폰트7 메인)', font: 'Aggro', size: 96, color: '#fff', stroke: 12, strokeColor: '#000', letterSpacing: '-0.02em', lineHeight: 1.1},
	sub7: {label: '노랑 괄호 보조자막 (폰트7 위)', font: 'GowunDodum', size: 54, color: '#ffe600', stroke: 7, strokeColor: '#1a1400', shadow: '0 3px 6px rgba(0,0,0,.5)', lineHeight: 1.2},
	title2: {label: '흰 제목 (폰트2 위 띠)', font: 'PretendardSemiBold', size: 84, color: '#fff', stroke: 0, strokeColor: 'transparent', shadow: '0 2px 4px rgba(0,0,0,.6)', letterSpacing: '-0.02em', lineHeight: 1.25, weight: 600},
	round: {label: '둥근 손글씨 + 보라 글로우 (v2)', font: 'PoorStory', size: 120, color: '#fff', stroke: 12, strokeColor: '#a96ee8', glow: 'rgba(169,110,232,.8)', glowSize: 1, letterSpacing: '-0.02em', lineHeight: 1.08},
} satisfies Record<string, StylePreset>;

export type StyleId = keyof typeof PRESETS | 'custom';
export const STYLE_IDS = [...Object.keys(PRESETS), 'custom'] as unknown as [StyleId, ...StyleId[]];
export const STYLE_OR_AUTO = ['auto', ...STYLE_IDS] as unknown as ['auto' | StyleId, ...('auto' | StyleId)[]];
// 자막 역할: 역할마다 어떤 예시 스타일을 쓸지 한 번에 고름
export const ROLES = {basic: '기본 말자막', hand: '손글씨 혼잣말', react: '리액션·괄호', impact: '임팩트(뷰티폰트1)', punch: '펀치(뷰티폰트2)', pink: '핑크 포인트', title: '오프닝·타이틀'} as const;
export const ROLE_IDS = Object.keys(ROLES) as [keyof typeof ROLES, ...(keyof typeof ROLES)[]];

// 말하듯 나오는 연출
export const ANIMS = {
	talk: '말하듯 한 글자씩 톡톡',
	type: '타이핑(글자 순서대로)',
	pop: '통 튀어나오기',
	wave: '등장 후 물결',
	shake: '흔들림(강조)',
	fade: '부드럽게 블러인',
	sparkle: '샤랄라(분홍·흰 별과 하트 반짝, 글로우 일렁임)',
	starfield: '별무리(CapCut식 흰 반짝이 왼→오 퍼짐)',
	none: '없음',
} as const;
export const ANIM_IDS = Object.keys(ANIMS) as [keyof typeof ANIMS, ...(keyof typeof ANIMS)[]];
export const POS = {top: 220, upper: 420, middle: 1050, lower: 1230} as const;
// 삼등분(폰트2): 위 띠 0~412 제목 / 영상 412~1508 / 아래 띠 1508~1920
export const THIRDS = {barTop: 412, videoH: 1096} as const;
export const POS_THIRDS = {top: 440, upper: 600, middle: 1000, lower: 1220} as const;
