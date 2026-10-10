"""자막(원본 시각) → 컷 목록 + 출력 시각 자막. 출력: cuts.json, captions_out.json"""
import json,os
W=os.path.dirname(os.path.abspath(__file__))
caps=json.load(open(W+'/captions_src.json'))
OVR={40.7:(42.3,43.2),42.3:(43.2,44.2),48.0:(50.3,51.1),50.3:(51.1,51.9),132.8:(136.5,137.9),136.4:(137.9,139.5)}
FIX={'hook1':1.3,'hook2':1.6,'split':2.3}
cuts=[];out=[];t=0
for c in caps:
    s,e=OVR.get(c['a'],(c['a'],c['b']));vl=e-s;n=len(c['t'].replace('\n',''))
    d=FIX.get(c.get('k'),min(max(0.4+0.068*n,0.9),1.9))
    if c.get('k')=='big': d=max(d,1.5)
    if vl<d: d=vl
    sp=vl/d
    if sp>3: m=(s+e)/2; s,e=m-1.5*d,m+1.5*d; sp=3
    cuts.append({'id':c['t'][:10],'s':round(s,3),'e':round(e,3),'sp':round(sp,4),'fit':c.get('fit',False),'z':1.1 if s>=149 else 1})
    out.append({**{k:v for k,v in c.items() if k not in('a','b')},'start':round(t,3),'dur':round(d,3),'src':[round(s,2),round(e,2)]});t+=d
END=[(170.5,173.0,1.5,None),(318.0,321.0,1.5,None),(420.0,423.5,1.0,'비포 vs 애프터\n여러분 선택은?'),(4.5,7.4,1.0,None)]  # 마지막 비포/애프터: v1~v5는 4.6~5.9(1.3초), 편집기부터 2.9초
for s,e,sp,txt in END:
    d=(e-s)/sp;cuts.append({'id':'end','s':s,'e':e,'sp':sp,'fit':s<10,'z':1 if s<10 else 1.1})
    if txt: out.append({'t':txt,'k':'cta','start':round(t,3),'dur':round(d+1.3,3),'added':True})
    t+=d
json.dump(cuts,open(W+'/cuts.json','w'),ensure_ascii=False,indent=1)
json.dump({'duration':round(t,3),'captions':out},open(W+'/captions_out.json','w'),ensure_ascii=False,indent=1)
print('total',round(t,2),'cuts',len(cuts))
