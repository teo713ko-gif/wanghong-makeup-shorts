"""삼등분 레이아웃용 베이스: 같은 컷(cuts.json)을 잘림 없이 1080x1096으로. 시간축은 build_base.py와 동일."""
import json,subprocess,sys,os
W=os.path.dirname(os.path.abspath(__file__)); SRC=os.environ.get('WH_SOURCE',os.path.join(W,'../work/원본/왕홍메이크업_1차.mp4'))
cuts=json.load(open(os.path.join(W,'cuts.json')))
C="crop=2160:2192:0:824"
args=['ffmpeg','-v','error','-y'];fc=[]
for i,c in enumerate(cuts):
    args+=['-ss',str(c['s']),'-t',str(c['e']-c['s']),'-i',SRC]
    z=max(c.get('z',1),1.07);w=int(1080*z)//2*2;h=int(1096*z)//2*2
    # z>1: 카메라 시간표시 가리려 살짝 확대 후 아래쪽 기준 자르기
    fc.append(f"[{i}:v]{C},setpts=(PTS-STARTPTS)/{c['sp']},scale={w}:{h},crop=1080:1096:(iw-1080)/2:ih-1096,fps=30,setsar=1,format=yuv420p[v{i}]")
fc.append(''.join(f'[v{i}]' for i in range(len(cuts)))+f"concat=n={len(cuts)}:v=1:a=0[out]")
args+=['-filter_complex',';'.join(fc),'-map','[out]','-c:v','h264_videotoolbox','-b:v','16M','-r','30',sys.argv[1]]
subprocess.run(args,check=True)
