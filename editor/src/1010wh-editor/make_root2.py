"""역할 기반 편집기 Root 생성(HxM6 예시 기본값). 인자: v5 captions_out.json, 출력 Root.tsx, --force"""
import json,sys,os
src,out=sys.argv[1],sys.argv[2]
if os.path.exists(out) and '--force' not in sys.argv: sys.exit('Root.tsx 있음(--force 필요)')
d=json.load(open(src));caps=[]
IMPACT={'맛있어서 봐준다','쌍꺼풀 안 보이죠ㅋㅋ','요래됐습당','뽀용해졌죠'}
PINK={'이것이 바로 {왕홍 애교}':'이것이 바로 왕홍 애교💗'}
for c in d['captions']:
    k,s,t=c.get('k'),c.get('s'),c['t']
    e=dict(text=t,sub=c.get('sub',''),role='basic',style='auto',emph='auto',anim='auto',pos='lower',scale=1.0,zoom=False,flash=False,labels=False,step=c.get('step',''),start=c['start'],dur=c['dur'])
    if k=='hook1': e.update(text='',role='title')
    elif k=='hook2': e.update(text='쌍꺼풀이\n생긴다구?!?!',role='punch',pos='middle',zoom=True,flash=True)
    elif k=='split': e.update(role='title',flash=True,labels=True)
    elif k=='cta': e.update(text='여러분 선택은?',sub='(비포 vs 애프터)',role='impact',pos='middle')
    elif t in PINK: e.update(text=PINK[t],role='pink')
    elif t in IMPACT: e.update(role='impact',zoom=True)
    elif s=='tag': e.update(role='react')
    elif s=='glow': e.update(role='hand')
    caps.append(e)
roles=dict(basic=dict(style='hx_basic',anim='none',scale=1.0),hand=dict(style='hx_hand',anim='none',scale=1.0),react=dict(style='hx_react',anim='pop',scale=1.0),
  impact=dict(style='white1',anim='pop',scale=0.95),punch=dict(style='red2',anim='shake',scale=1.2),pink=dict(style='hx_pink',anim='pop',scale=1.0),title=dict(style='hx_title',anim='pop',scale=1.0))
props=dict(layout='thirds',title='무쌍이 왕홍메이크업 받으면\n쌍꺼풀 생길까?',titleStyle='title2',bottomText='',roles=roles,emphStyle='hx_point',subPos='below',
  captions=caps,subStyle='hx_small',showSteps=True,stepStyle='label2',stepScale=0.7,stepPos='top',talkSpeed=0.06,progressBar=True,
  custom=dict(font='JejuMyeongjo',size=110,color='#ffffff',stroke=8,strokeColor='#111111',glow='#ff6fae',glowSize=1.0,scaleX=0.88))
dur=round(d['duration']*30)
open(out,'w').write(f"""import {{Composition, Folder}} from 'remotion';
import {{Editor, editorSchema, Catalog, catalogSchema}} from './Editor';
// 편집기 Root. Studio 오른쪽 Props에서 바꾸고 Save 하면 이 파일에 저장됨.
// roles: 역할별로 어떤 예시 스타일을 쓸지 / captions[].role: 자막 역할 / style·anim 'auto' = 역할 설정 따름
export const RemotionRoot = () => <>
	<Folder name="wanghong-makeup">
		<Composition id="WanghongEditor" component={{Editor}} schema={{editorSchema}} durationInFrames={{{dur}}} fps={{30}} width={{1080}} height={{1920}}
			defaultProps={{{json.dumps(props,ensure_ascii=False,indent='\t')}}}/>
		<Composition id="StyleCatalog" component={{Catalog}} schema={{catalogSchema}} durationInFrames={{90}} fps={{30}} width={{1080}} height={{1920}}
			defaultProps={{{{sample: '아니 {{12만원}} 나왔어요', anim: 'none' as const}}}}/>
	</Folder>
</>;
""")
from collections import Counter;print(Counter(c['role'] for c in caps))
