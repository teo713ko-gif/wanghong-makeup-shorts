"""editor/src/1010wh-editor/styles.ts + Root.tsx → docs/09_자막제목_스타일가이드.md 자동 생성.
스타일·제목·자막 값을 바꾼 뒤 저장소 루트에서: python3 tools/make_style_doc.py
"""
import re, json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
st = open(os.path.join(ROOT, 'editor/src/1010wh-editor/styles.ts')).read()
rt = open(os.path.join(ROOT, 'editor/src/1010wh-editor/Root.tsx')).read()

presets = {}
for m in re.finditer(r"^\t(\w+): \{(label: .*)\},?$", st, re.M):
    presets[m.group(1)] = {k: v.strip("'") for k, v in re.findall(r"(\w+): ('(?:[^'\\]|\\.)*'|[-\d.]+)", m.group(2))}
a = rt.index('defaultProps={') + 14
b = rt.index('}/>\n\t\t<Composition id="StyleCatalog"')
P = json.loads(rt[a:b])
FONTFILE = dict(re.findall(r"\['(\w+)', '([^']+)'\]", st))
ai = st.index('export const ANIMS')
ANIMS = dict(re.findall(r"^\t(\w+): '([^']+)',$", st[ai:st.index('} as const;', ai)], re.M))
ROLES = dict(re.findall(r"(\w+): '([^']+)'", re.search(r"export const ROLES = \{(.*?)\} as const", st).group(1)))


def css(p):
    g = []
    if p.get('glow'):
        x = float(p.get('glowSize', '1'))
        g = [f"0 0 {round(r * x)}px {p['glow']}" for r in (10, 24, 44)]
    sh = ', '.join(g + ([p['shadow']] if p.get('shadow') else [])) or 'none'
    out = [f"font-family: '{p['font']}';", f"font-size: {p['size']}px;"]
    if p.get('weight'): out.append(f"font-weight: {p['weight']};")
    out.append(f"color: {p['color']};")
    if float(p.get('stroke', '0')) > 0: out += [f"-webkit-text-stroke: {p['stroke']}px {p['strokeColor']};", "paint-order: stroke fill;"]
    out.append(f"text-shadow: {sh};")
    if p.get('outer'): out.append(f"filter: drop-shadow(0 0 1.2px {p['outer']}) drop-shadow(0 0 1.2px {p['outer']}) drop-shadow(0 0 1px {p['outer']});")
    if p.get('letterSpacing'): out.append(f"letter-spacing: {p['letterSpacing']};")
    if p.get('lineHeight'): out.append(f"line-height: {p['lineHeight']};")
    if p.get('scaleX'): out.append(f"transform: scaleX({p['scaleX']});")
    return '\n'.join(out)


used = {P['titleStyle'], P['subStyle'], P['stepStyle'], P['emphStyle']} | {r['style'] for r in P['roles'].values()}
o = []
w = o.append
w("# 09. 자막·제목 스타일 가이드 (현재 확정본)\n")
w("> 이 문서는 `editor/src/1010wh-editor/styles.ts`와 `Root.tsx`에서 **자동으로 뽑은 값**입니다. 값을 바꾸면 `python3 tools/make_style_doc.py`로 다시 만드세요.\n")
w("크기는 모두 **1080×1920 세로 화면 기준 px**입니다. CapCut 등 다른 편집기에서 쓸 때는 화면 폭 1080 기준으로 비율을 맞추면 됩니다.\n")
w("## 1. 화면 구성(삼등분)\n")
w("![제목과 단계 라벨](../qa/editor_title.jpg)\n")
w("| 영역 | y 범위(px) | 내용 |\n|---|---|---|")
w("| 위 검정 띠 | 0 ~ 412 | 제목. **아래 정렬**(여백 14px) → 영상 칸 바로 위에 붙음 |")
w("| 영상 | 412 ~ 1508 | 1080×1096 영상 |")
w("| 아래 검정 띠 | 1508 ~ 1920 | 비움(쇼츠 UI가 덮는 자리) |\n")
w("자막 세로 위치(글자 위쪽 기준, 삼등분): `top 440`(단계 라벨) · `upper 600` · `middle 1000` · **`lower 1220`(기본 — 화면 중앙에서 살짝 아래)**\n")
tp = presets[P['titleStyle']]
w("## 2. 제목 스타일\n")
w("| 항목 | 값 |\n|---|---|")
w(f"| 문구 | `{P['title'].replace(chr(10), ' / ')}` |")
w(f"| 프리셋 | `{P['titleStyle']}` — {tp['label']} |")
w(f"| 폰트 | {tp['font']} (`{FONTFILE.get(tp['font'], '')}`) |")
w(f"| 크기 | {tp['size']}px (긴 줄이 화면 폭 1020px를 넘으면 자동 축소: 한글 1자 ≈ 0.78em) |")
w("| 정렬 | 가운데, 위 띠의 아래쪽(영상 바로 위) |\n")
w("```css\n" + css(tp) + "\n```\n")
w("## 3. 자막 역할별 스타일\n")
w("자막마다 역할(role)이 있고, 역할마다 쓸 스타일·연출을 정합니다. 개별 자막에서 덮어쓸 수 있습니다.\n")
w("| 역할 | 뜻 | 스타일 | 연출 | 배율 |\n|---|---|---|---|---|")
for r, v in P['roles'].items():
    w(f"| `{r}` | {ROLES.get(r, '')} | `{v['style']}` — {presets[v['style']]['label']} | `{v['anim']}` {ANIMS.get(v['anim'], '')} | {v['scale']} |")
w(f"\n- 강조 단어 `{{단어}}` → `{P['emphStyle']}` ({presets[P['emphStyle']]['label']})")
w(f"- 보조자막(sub) → `{P['subStyle']}` ({presets[P['subStyle']]['label']}), 위치 `{P['subPos']}`")
w(f"- 단계 라벨 → `{P['stepStyle']}` ({presets[P['stepStyle']]['label']}), 배율 {P['stepScale']}, 위치 `{P['stepPos']}`\n")
w("## 4. 사용 중인 스타일 상세(CSS 그대로)\n")
w("글로우는 `text-shadow` 3겹(10·24·44px × glowSize), 테두리는 `-webkit-text-stroke` + `paint-order: stroke fill`(글자 바깥쪽에만 테두리).\n")
for k in [k for k in presets if k in used]:
    p = presets[k]
    w(f"### `{k}` — {p['label']}\n")
    w(f"폰트 파일: `editor/public/1010wh/{FONTFILE.get(p['font'], '?')}`\n")
    w("```css\n" + css(p) + "\n```\n")
w("### 미리보기\n")
for img, cap in [('editor_first.jpg', '제목(두 줄) + 첫 자막(샤랄라)'), ('editor_heart.jpg', '샤랄라(sha + sparkle) — 뽀용해졌죠'),
                 ('editor_mat.jpg', '리액션(hx_react) — 맛있어서 봐준다'), ('editor_check3.jpg', '단계 라벨(label_thin)·기본 자막(basic_m)·강조 단어(point_glow)'),
                 ('editor_end.jpg', '엔딩 Before/After 라벨')]:
    w(f"**{cap}**\n\n![{cap}](../qa/{img})\n")
w("## 5. 연출 상세\n")
w("| id | 설명 | 구현 요점 |\n|---|---|---|")
impl = {'talk': '글자마다 spring(0.6→1)+아래서 18px 올라옴, 자막 길이 60% 안에 다 나옴(talkSpeed 0.06초/자)', 'type': '글자 순서대로 즉시 표시',
        'pop': '자막 전체 spring scale 0.6→1', 'wave': '글자별 sin 위아래 6px', 'shake': 'scale 0.7→1 + 10프레임 ±3° 흔들림',
        'fade': '8프레임 블러 10→0px + 투명→불투명',
        'sparkle': '블러인 + 분홍 글로우 세기 0.75~1.1 일렁임 + 글자 위·옆 8곳에 ✦✧♡(분홍 #ffb3dc/흰색, 34~42px, 분홍 글로우)가 28프레임 주기로 크기 0.4→1.2 반짝',
        'starfield': '글자 왼→오 마스크 공개(22프레임) + 흰 ✦·빛가루 60개가 앞을 따라 퍼짐 + 이후 흰 ✦ 14개 반짝', 'none': '바로 표시(기본 말자막)'}
for k, v in ANIMS.items():
    w(f"| `{k}` | {v} | {impl.get(k, '')} |")
w("\n기타 효과: `zoom`(자막 동안 영상 1→1.12 확대), `flash`(3프레임 흰 번쩍 rgba(255,240,248,.7)), `labels`(Before/After — Playfair Display Italic 700, 120px, 흰색, 그림자 0 3px 6px rgba(0,0,0,.55) + 보라 #c8a2ff / 분홍 #ff6fae 글로우).\n")
w("## 6. 줄바꿈·크기 자동 규칙\n")
w("- 큰 글씨(실제 90px 이상)는 10자, 작은 글씨는 18자를 넘으면 가운데에 가까운 띄어쓰기에서 두 줄. `{ }` 안은 나누지 않음.")
w("- 줄이 화면 폭(1000px)을 넘으면 `1000 / (글자수 × 0.92 × 가로비율)`로 축소.")
w("- 원하는 곳에서 끊으려면 문구에 줄바꿈을 직접 넣음.")
w("- 제주명조의 `?!`는 폭이 넓어 Gowun Batang으로 대체.\n")
w("## 7. 자막 전체 목록(현재 값)\n")
w("| # | 시작(초) | 길이 | 역할 | 스타일 | 연출 | 문구 | 보조자막 | 단계 |\n|---|---|---|---|---|---|---|---|---|")
for i, c in enumerate(P['captions']):
    role = P['roles'][c['role']]
    stl = c['style'] if c['style'] != 'auto' else role['style']
    an = c['anim'] if c['anim'] != 'auto' else role['anim']
    extra = (' +zoom' if c['zoom'] else '') + (' +flash' if c['flash'] else '') + (' +Before/After' if c['labels'] else '')
    t = c['text'].replace('\n', ' / ').replace('|', '\\|') or '(라벨만)'
    w(f"| {i} | {c['start']:.2f} | {c['dur']:.2f} | {c['role']} | `{stl}` | `{an}`{extra} | {t} | {c['sub']} | {c['step']} |")
w("\n## 8. CapCut에서 손으로 따라 할 때\n")
w("| Remotion 값 | CapCut 설정 |\n|---|---|")
w("| font-size(px, 1080 기준) | 텍스트 크기 — 1080 폭 프로젝트에서 같은 비율로 맞춤(미리보기와 나란히 놓고 조절) |")
w("| -webkit-text-stroke | 스타일 → 획(Stroke): 색·두께 |")
w("| text-shadow(검정) | 스타일 → 그림자: 검정, 불투명도 35~45%, 흐림 높게, 거리 2~3 |")
w("| 글로우(text-shadow 0 0) | 스타일 → 발광(Glow) 또는 그림자(거리 0, 흐림 최대, 색=글로우색) |")
w("| scaleX(0.86) | 텍스트 가로 비율 86%(지원 안 되면 자간을 좁혀 대체) |")
w("| sparkle | 텍스트 효과 '반짝임'류 + 하트/별 스티커 |")
w("| starfield | 효과 '별무리' |")
open(os.path.join(ROOT, 'docs/09_자막제목_스타일가이드.md'), 'w').write('\n'.join(o) + '\n')
print('docs/09_자막제목_스타일가이드.md 생성, 사용 스타일:', sorted(used))
