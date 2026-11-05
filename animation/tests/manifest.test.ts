import assert from 'node:assert/strict';
import {test} from 'node:test';
import {mkdir,mkdtemp,rm,writeFile} from 'node:fs/promises';
import path from 'node:path';
import prototype from '../manifests/zombie-flight.json';
import {durationInFrames,parseManifest,sceneAtFrame} from '../src/manifest';
import {ROOT,loadManifest,options,validateAssets} from '../scripts/io';

const copy=()=>structuredClone(prototype);
test('prototype resolves to exactly 14 seconds at 1080x1920 / 30 fps',()=>{
  const m=parseManifest(copy());
  assert.equal(durationInFrames(m),420);assert.equal(m.width,1080);assert.equal(m.height,1920);assert.equal(m.fps,30);
});
test('all 420 frames belong to exactly one scene and cuts land on correct frames',()=>{
  const m=parseManifest(copy());
  for(let frame=0;frame<420;frame++) {const s=sceneAtFrame(m,frame);assert.ok(s.localFrame>=0&&s.localFrame<s.scene.durationFrames);}
  assert.equal(sceneAtFrame(m,104).scene.id,'uneasy');assert.equal(sceneAtFrame(m,105).scene.id,'infection');
  assert.equal(sceneAtFrame(m,240).scene.id,'blackout');assert.equal(sceneAtFrame(m,330).scene.id,'decision');
  assert.throws(()=>sceneAtFrame(m,420));assert.throws(()=>sceneAtFrame(m,-1));
});
test('JSON scene duration drives total composition duration',()=>{
  const m=copy();m.scenes[1].durationFrames=150;assert.equal(durationInFrames(parseManifest(m)),435);
});
test('unsupported dimensions and frame rate are rejected',()=>{
  for(const [key,value] of [['width',720],['height',1080],['fps',24]] as const) {const m=copy();m[key]=value;assert.throws(()=>parseManifest(m));}
});
test('bad durations are rejected',()=>{
  for(const duration of [0,-1,29,30.5,NaN,Infinity,451]) {const m=copy();m.scenes[0].durationFrames=duration;assert.throws(()=>parseManifest(m));}
});
test('unknown character, action, background and duplicate scene IDs fail before rendering',()=>{
  const variants=[()=>{const m=copy();m.scenes[0].characters=['missing'];return m;},()=>{const m=copy();m.scenes[0].action='arbitrary-code';return m;},()=>{const m=copy();m.scenes[0].background='missing';return m;},()=>{const m=copy();m.scenes[1].id=m.scenes[0].id;return m;}];
  for(const variant of variants) assert.throws(()=>parseManifest(variant()));
});
test('remote and traversal assets are rejected',()=>{
  for(const name of ['https://example.com/font.ttf','../font.ttf','/font.ttf','C:/font.ttf']) {const m=copy();m.assets.fontBold=name;assert.throws(()=>parseManifest(m));}
});
test('bundled prototype assets exist and have content',async()=>{const m=await loadManifest();const hashes=await validateAssets(m);assert.equal(hashes.fontBold.length,64);});
test('missing and empty assets fail preflight',async()=>{
  await mkdir(path.join(ROOT,'.cache'),{recursive:true});
  const directory=await mkdtemp(path.join(ROOT,'.cache','assets-test-'));
  try {
    const m=parseManifest(copy());await assert.rejects(validateAssets(m,directory),/Missing asset/);
    await mkdir(path.join(directory,'fonts'));await writeFile(path.join(directory,m.assets.fontBold),'');
    await assert.rejects(validateAssets(m,directory),/Empty or invalid/);
  } finally {
    assert.ok(path.resolve(directory).startsWith(path.resolve(ROOT,'.cache')+path.sep));
    await rm(directory,{recursive:true,force:true});
  }
});
test('malformed CLI arguments fail without starting a renderer',()=>{
  assert.throws(()=>options(['--manifest']));assert.throws(()=>options(['--wat']));assert.throws(()=>options(['--concurrency','0']));
});
