import {bundle} from '@remotion/bundler';
import {ensureBrowser,makeCancelSignal,renderMedia,renderStill,selectComposition} from '@remotion/renderer';
import {mkdir,readFile,rename,rm,stat,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {durationInFrames} from '../src/manifest';
import {ROOT,loadManifest,options,validateAssets} from './io';

const event=(type:string,data:Record<string,unknown>={})=>console.log(JSON.stringify({type,...data}));
const {cancelSignal,cancel}=makeCancelSignal();
const interrupt=()=>{event('cancelling');cancel();};
process.once('SIGINT',interrupt);
process.once('SIGTERM',interrupt);
let pendingOutput='';
try {
  const opts=options(process.argv.slice(2));
  const manifest=await loadManifest(opts.manifest);
  const output=opts.output||path.join(ROOT,'out',`${manifest.id}.mp4`);
  if(!output.toLowerCase().endsWith('.mp4')) throw new Error('Output must end in .mp4');
  await mkdir(path.dirname(output),{recursive:true});
  event('validated',{frames:durationInFrames(manifest),width:manifest.width,height:manifest.height});
  await ensureBrowser({logLevel:'info'});
  event('bundling');
  const serveUrl=await bundle({entryPoint:path.join(ROOT,'src/index.ts'),publicDir:path.join(ROOT,'public'),outDir:path.join(ROOT,'.cache','bundle')});
  const inputProps={manifest};
  const composition=await selectComposition({serveUrl,id:'ZombieFlight',inputProps});
  if(composition.width!==1080||composition.height!==1920||composition.fps!==30||composition.durationInFrames!==durationInFrames(manifest)) throw new Error('Resolved composition does not match manifest');
  if(!opts.stills) {
    pendingOutput=path.join(path.dirname(output),`.${manifest.id}-${randomUUID()}.partial.mp4`);
    let last=-1;
    await renderMedia({
      serveUrl,composition,inputProps,outputLocation:pendingOutput,codec:'h264',pixelFormat:'yuv420p',crf:18,
      concurrency:opts.concurrency,cancelSignal,logLevel:'warn',
      onProgress:({progress})=>{const n=Math.floor(progress*20)*5;if(n!==last){event('rendering',{percent:n});last=n;}},
    });
    if((await stat(pendingOutput)).size===0) throw new Error('Renderer produced an empty file');
    await rename(pendingOutput,output);
    pendingOutput='';
    const receipt={
      title:manifest.title,output,frames:composition.durationInFrames,width:composition.width,height:composition.height,fps:composition.fps,
      narration:false,audio:false,renderer:'remotion',version:'4.0.540',
      manifestSha256:createHash('sha256').update(JSON.stringify(manifest)).digest('hex'),
      assetSha256:await validateAssets(manifest),videoSha256:createHash('sha256').update(await readFile(output)).digest('hex'),
      manifest,
    };
    await writeFile(`${output}.json`,JSON.stringify(receipt,null,2));
    event('complete',{output,frames:composition.durationInFrames});
  }
  const directory=path.join(path.dirname(output),'frames');
  await mkdir(directory,{recursive:true});
  let offset=0;
  for(const [index,scene] of manifest.scenes.entries()) {
    for(const fraction of [.3,.78]) {
      const frame=offset+Math.floor(scene.durationFrames*fraction);
      const outputLocation=path.join(directory,`${String(index+1).padStart(2,'0')}-${scene.id}-${frame}.png`);
      await renderStill({serveUrl,composition,inputProps,frame,output:outputLocation,imageFormat:'png',logLevel:'warn'});
      event('still',{frame,output:outputLocation});
    }
    offset+=scene.durationFrames;
  }
} catch(error) {console.error(error);process.exitCode=1;}
finally {
  if(pendingOutput) await rm(pendingOutput,{force:true});
  process.removeListener('SIGINT',interrupt);process.removeListener('SIGTERM',interrupt);
}
