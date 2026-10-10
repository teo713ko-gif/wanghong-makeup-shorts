"""사용자가 CapCut에서 뽑은 '검정 배경 자막 트랙 영상'(참고자료/왕홍메이크업_자막.mp4)에서
자막이 바뀌는 시각을 찾고, 구간마다 글자 영역만 잘라 세로로 이어 붙인 판독용 이미지를 만든다.
글자는 사람이(또는 AI가 이미지로) 읽어 pipeline/captions_src.json에 옮겨 적는다.
자막 트랙의 시각은 원본 영상의 시각과 1:1로 맞았다(장면 전환 시각과 ±0.2초 일치로 확인).
사용: python3 pipeline/extract_caption_track.py references/왕홍메이크업_자막.mp4 work/자막판독
"""
import sys,os,subprocess
import numpy as np
from PIL import Image,ImageDraw
src,out=sys.argv[1],sys.argv[2];os.makedirs(out,exist_ok=True)
raw=os.path.join(out,'cap.gray')
subprocess.run(['ffmpeg','-v','error','-y','-i',src,'-vf','scale=540:960,format=gray','-r','10','-f','rawvideo',raw],check=True)
d=np.memmap(raw,dtype=np.uint8,mode='r').reshape(-1,960,540)
prev=None;ts=[]
for i,f in enumerate(d):
    m=f>60
    if prev is None or (m^prev).sum()>40: ts.append(i/10)   # 글자 픽셀이 40개 넘게 바뀌면 새 자막
    prev=m
total=len(d)/10;del d;os.remove(raw)
open(os.path.join(out,'cap_changes.txt'),'w').write(' '.join(f'{t:.1f}' for t in ts)+f'\n{total}\n')
ts=sorted(set(ts+[total]));rows=[]
for i,(a,b) in enumerate(zip(ts,ts[1:])):
    p=os.path.join(out,f'm_{i:03d}.png')
    subprocess.run(['ffmpeg','-v','error','-y','-ss',str((a+b)/2),'-i',src,'-frames:v','1','-vf','scale=1080:1920',p],check=True)
    im=Image.open(p).convert('L');arr=np.array(im);ys,xs=np.where(arr>60)
    crop=None if len(ys)==0 else im.crop((max(xs.min()-10,0),max(ys.min()-10,0),min(xs.max()+10,1080),min(ys.max()+10,1920)))
    rows.append((i,a,b,crop))
H=sum((r[3].height if r[3] else 20)+30 for r in rows);sheet=Image.new('L',(1100,H),0);dr=ImageDraw.Draw(sheet);y=0
for i,a,b,c in rows:
    dr.text((0,y),f'#{i} {a:.1f}-{b:.1f}',fill=128);y+=14
    if c: sheet.paste(c,(0,y));y+=c.height+16
    else: y+=16
for k,s in enumerate(range(0,y,1800)): sheet.crop((0,s,1100,min(s+1800,y))).save(os.path.join(out,f'cap_read_{k}.png'))
print('구간',len(rows),'→',out)
