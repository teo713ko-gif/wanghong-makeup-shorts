"""v5 자막 데이터 → 편집기 Root.tsx(defaultProps 인라인, Studio Save로 덮어써짐). 최초 1회만 실행."""
import json,sys,os
src,out=sys.argv[1],sys.argv[2]
if os.path.exists(out): sys.exit('Root.tsx 이미 있음: Studio 저장본 보호를 위해 중단')
d=json.load(open(src));caps=[]
for c in d['captions']:
    k,s=c.get('k'),c.get('s')
    e=dict(text=c['t'],sub=c.get('sub',''),style='red2',emph='red2',anim='talk',pos='lower',scale=1.0,zoom=False,flash=False,labels=False,step=c.get('step',''),start=c['start'],dur=c['dur'])
    if k=='hook1': e.update(text='무쌍이\n왕홍메이크업을 받으면',style='thin',emph='thin',pos='top',scale=1.55)
    elif k=='hook2': e.update(text='쌍꺼풀이\n생긴다구?!?!',pos='middle',scale=1.35,anim='shake',zoom=True,flash=True)
    elif k=='split': e.update(style='pink6',emph='pink6',anim='pop',flash=True,labels=True,scale=1.1)
    elif k=='cta': e.update(text='여러분 선택은?',sub='(비포 vs 애프터)',pos='middle',anim='pop',scale=1.05)
    elif s=='base': e.update(style='thin',emph='red2',scale=1.0)
    elif s=='tag': e.update(style='glow3',emph='glow3',anim='fade',scale=0.8,pos='middle')
    elif s=='punch': e.update(anim='shake',zoom=True,scale=1.25,pos='middle')
    caps.append(e)
props=dict(captions=caps,subStyle='sub7',showSteps=True,stepStyle='thin',stepScale=1.1,talkSpeed=0.06,progressBar=True,
  custom=dict(font='JejuMyeongjo',size=110,color='#ffffff',stroke=8,strokeColor='#111111',glow='#ff6fae',glowSize=1.0,scaleX=0.88))
dur=round(d['duration']*30)
open(out,'w').write(f"""import {{Composition, Folder}} from 'remotion';
import {{Editor, editorSchema, Catalog, catalogSchema}} from './Editor';
// 편집기 Root. 자막 값은 Remotion Studio 오른쪽 Props 패널에서 바꾸고 Save 하면 이 파일에 저장됨.
export const RemotionRoot = () => <>
	<Folder name="왕홍메이크업">
		<Composition id="WanghongEditor" component={{Editor}} schema={{editorSchema}} durationInFrames={{{dur}}} fps={{30}} width={{1080}} height={{1920}}
			defaultProps={{{json.dumps(props,ensure_ascii=False,indent='\t')}}}/>
		<Composition id="StyleCatalog" component={{Catalog}} schema={{catalogSchema}} durationInFrames={{90}} fps={{30}} width={{1080}} height={{1920}}
			defaultProps={{{{sample: '아니 {{12만원}} 나왔어요', anim: 'talk' as const}}}}/>
	</Folder>
</>;
""")
print('captions',len(caps),'frames',dur)
