import {durationInFrames} from '../src/manifest';
import {loadManifest,options} from './io';

try {
  const opts=options(process.argv.slice(2));
  const m=await loadManifest(opts.manifest);
  console.log(JSON.stringify({valid:true,id:m.id,title:m.title,width:m.width,height:m.height,fps:m.fps,frames:durationInFrames(m),seconds:durationInFrames(m)/m.fps,scenes:m.scenes.length}));
} catch(error) {console.error(String(error));process.exitCode=1;}
