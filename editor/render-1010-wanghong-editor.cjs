// 편집기(Studio에서 저장한 값) 그대로 렌더. 사용: node render-1010-wanghong-editor.cjs v6  |  스틸: node ... still 27 72 ...  |  카탈로그: node ... catalog
const {bundle}=require('@remotion/bundler');const{selectComposition,renderMedia,renderStill}=require('@remotion/renderer');const path=require('path'),fs=require('fs'),{execFileSync}=require('child_process');
(async()=>{const [mode,...rest]=process.argv.slice(2);const P=(process.env.WH_PROJECT||path.resolve(__dirname,'../work'));
const serveUrl=await bundle({entryPoint:path.join(__dirname,'src/1010wh-editor/index.ts')});
try{
if(mode==='still'){const c=await selectComposition({serveUrl,id:'WanghongEditor'});fs.mkdirSync(path.join(P,'검수/editor_stills'),{recursive:true});
 for(const s of rest)await renderStill({serveUrl,composition:c,frame:+s,output:path.join(P,'검수/editor_stills/f'+s+'.jpg'),imageFormat:'jpeg'});console.log('stills done');return}
if(mode==='catalog'){const c=await selectComposition({serveUrl,id:'StyleCatalog'});await renderStill({serveUrl,composition:c,frame:40,output:path.join(P,'검수/스타일카탈로그.jpg'),imageFormat:'jpeg'});console.log('catalog done');return}
if(!/^v\d+$/.test(mode||''))throw new Error('버전명 필요 (예: v6)');
const dir=path.join(P,'최종',mode),out=path.join(dir,`왕홍메이크업_${mode}.mp4`),tmp=path.join(P,'작업',`${mode}_graphics.mp4`);
if(fs.existsSync(out))throw new Error('이미 있음: '+out);fs.mkdirSync(dir,{recursive:true});
const c=await selectComposition({serveUrl,id:'WanghongEditor'});
await renderMedia({serveUrl,composition:c,codec:'h264',crf:16,outputLocation:tmp,concurrency:8,muted:true});
execFileSync('ffmpeg',['-v','error','-i',tmp,'-f','lavfi','-i','anullsrc=r=48000:cl=stereo','-shortest','-c:v','copy','-c:a','aac','-movflags','+faststart',out]);
fs.copyFileSync(path.join(__dirname,'src/1010wh-editor/Root.tsx'),path.join(dir,'편집기_Root_스냅샷.tsx'));console.log('DONE',out)
}finally{fs.rmSync(serveUrl,{recursive:true,force:true})}})().catch(e=>{console.error(e);process.exit(1)});
