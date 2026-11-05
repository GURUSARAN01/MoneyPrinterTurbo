import {readFile, realpath, stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {parseManifest, type Manifest} from '../src/manifest';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DEFAULT_MANIFEST = path.join(ROOT, 'manifests/zombie-flight.json');
export async function validateAssets(manifest: Manifest, publicDir=path.join(ROOT,'public')) {
  const root=await realpath(publicDir);
  const hashes: Record<string,string>={};
  for(const [name,relative] of Object.entries(manifest.assets)) {
    let asset: string;
    try {asset=await realpath(path.resolve(root,relative));} catch {throw new Error(`Missing asset ${name}: ${relative}`);}
    const within=path.relative(root,asset);
    if(within.startsWith('..')||path.isAbsolute(within)) throw new Error(`Asset escapes public directory: ${name}`);
    const info=await stat(asset);
    if(!info.isFile()||info.size===0) throw new Error(`Empty or invalid asset: ${name}`);
    hashes[name]=createHash('sha256').update(await readFile(asset)).digest('hex');
  }
  return hashes;
}
export async function loadManifest(file=DEFAULT_MANIFEST) {
  const manifest=parseManifest(JSON.parse(await readFile(file,'utf8')));
  await validateAssets(manifest);
  return manifest;
}
export function options(args: string[]) {
  const result={manifest:DEFAULT_MANIFEST,output:'',stills:false,concurrency:2};
  for(let i=0;i<args.length;i++) {
    const arg=args[i];
    if(arg==='--stills') {result.stills=true;continue;}
    if(!['--manifest','--output','--concurrency'].includes(arg)) throw new Error(`Unknown option: ${arg}`);
    const value=args[++i];
    if(!value || value.startsWith('--')) throw new Error(`Missing value for ${arg}`);
    if(arg==='--manifest') result.manifest=path.resolve(value);
    if(arg==='--output') result.output=path.resolve(value);
    if(arg==='--concurrency') {
      result.concurrency=Number(value);
      if(!Number.isInteger(result.concurrency)||result.concurrency<1||result.concurrency>8) throw new Error('Concurrency must be an integer from 1 to 8');
    }
  }
  return result;
}
