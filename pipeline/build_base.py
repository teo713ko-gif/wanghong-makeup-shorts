import json,subprocess,sys,os
W=os.path.dirname(os.path.abspath(__file__)); SRC=os.environ.get('WH_SOURCE',os.path.join(W,'../work/원본/왕홍메이크업_1차.mp4'))
cuts=json.load(open(os.path.join(W,'cuts.json')))
C="crop=2160:2192:0:824"
args=['ffmpeg','-v','error','-y'];fc=[];t=0;tl=[]
for i,c in enumerate(cuts):
    args+=['-ss',str(c['s']),'-t',str(c['e']-c['s']),'-i',SRC]
    sp=c['sp'];pts=f"setpts=(PTS-STARTPTS)/{sp}"
    if c['fit']:
        fc.append(f"[{i}:v]{C},{pts},split[a{i}][b{i}];[a{i}]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=30:2,eq=brightness=-0.15[bg{i}];[b{i}]scale=1080:-2[fg{i}];[bg{i}][fg{i}]overlay=0:(H-h)/2,fps=30,setsar=1,format=yuv420p[v{i}]")
    else:
        z=c.get("z",1);H=int(1920*z)//2*2
        fc.append(f"[{i}:v]{C},{pts},scale=-2:{H},crop=1080:1920:(iw-1080)/2:ih-1920,fps=30,setsar=1,format=yuv420p[v{i}]")
    d=(c['e']-c['s'])/sp; tl.append({**c,'out_start':round(t,3),'dur':round(d,3)}); t+=d
fc.append(''.join(f'[v{i}]' for i in range(len(cuts)))+f"concat=n={len(cuts)}:v=1:a=0[out]")
args+=['-filter_complex',';'.join(fc),'-map','[out]','-c:v','h264_videotoolbox','-b:v','20M','-r','30',sys.argv[1]]
subprocess.run(args,check=True)
json.dump(tl,open(os.path.join(W,'timeline.json'),'w'),ensure_ascii=False,indent=1)
print('total',round(t,2))
