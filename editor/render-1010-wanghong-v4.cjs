// 왕홍메이크업 v4: 베이스 영상 + 자막 렌더. 이미 있는 파일은 덮어쓰지 않음. 인자: still 프레임 번호 목록이면 스틸만.
const {bundle}=require('@remotion/bundler');const{selectComposition,renderMedia,renderStill}=require('@remotion/renderer');const path=require('path'),fs=require('fs');
(async()=>{const serveUrl=await bundle({entryPoint:path.join(__dirname,'src/history/1010wh4/index.tsx')});
const composition=await selectComposition({serveUrl,id:'WanghongV4'});
const P=(process.env.WH_PROJECT||path.resolve(__dirname,'../work'));
const stills=process.argv.slice(2);
if(stills.length){for(const s of stills){await renderStill({serveUrl,composition,frame:+s,output:path.join(P,'검수/v4_stills/f'+s+'.jpg'),imageFormat:'jpeg'});}console.log('stills done');return}
fs.mkdirSync(path.join(P,'작업'),{recursive:true});fs.mkdirSync(path.join(P,'검수'),{recursive:true});const out=path.join(P,'작업/v4/graphics_render.mp4');if(fs.existsSync(out))throw new Error('exists '+out);
await renderMedia({serveUrl,composition,codec:'h264',crf:16,outputLocation:out,concurrency:8,muted:true});console.log('DONE',out)})().catch(e=>{console.error(e);process.exit(1)});
