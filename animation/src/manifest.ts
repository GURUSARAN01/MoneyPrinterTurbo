export const ACTIONS = ['anxious', 'infected', 'flicker', 'freeze'] as const;
export const CHARACTERS = ['maya', 'eli', 'noah'] as const;
export type Action = typeof ACTIONS[number];
export type CharacterId = typeof CHARACTERS[number];
export type Scene = {
  id: string; durationFrames: number; background: 'cabin-night'; action: Action;
  characters: CharacterId[]; eyebrow: string; headline: string[]; caption: string; accent: string;
};
export type Manifest = {
  version: 1; id: string; title: string; width: 1080; height: 1920; fps: 30;
  assets: {fontBold: string; fontMedium: string}; scenes: Scene[];
};

const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
function requireValue(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Manifest: ${message}`);
}
function onlyKeys(v: Record<string, unknown>, keys: string[], context: string) {
  requireValue(Object.keys(v).every(k => keys.includes(k)), `unknown field in ${context}`);
}
function text(v: unknown, limit: number): v is string {
  return typeof v === 'string' && v.trim().length > 0 && v.length <= limit;
}
export function parseManifest(value: unknown): Manifest {
  requireValue(object(value), 'expected an object');
  onlyKeys(value, ['version','id','title','width','height','fps','assets','scenes'], 'episode');
  requireValue(value.version === 1, 'version must be 1');
  requireValue(text(value.id, 80) && /^[a-z0-9-]+$/.test(value.id), 'invalid episode id');
  requireValue(text(value.title, 160), 'title is required (max 160 characters)');
  requireValue(value.width === 1080 && value.height === 1920, 'dimensions must be 1080x1920');
  requireValue(value.fps === 30, 'fps must be 30');
  requireValue(object(value.assets), 'assets are required');
  onlyKeys(value.assets, ['fontBold','fontMedium'], 'assets');
  for (const name of ['fontBold','fontMedium']) {
    const asset = value.assets[name];
    requireValue(text(asset, 200) && /^[a-zA-Z0-9_/-]+\.(ttf|woff2)$/.test(asset) && !asset.startsWith('/') && !asset.split('/').includes('..'), `invalid local asset: ${name}`);
  }
  requireValue(Array.isArray(value.scenes) && value.scenes.length >= 1 && value.scenes.length <= 12, 'provide 1–12 scenes');
  const ids = new Set<string>();
  for (const [index, scene] of value.scenes.entries()) {
    requireValue(object(scene), `scene ${index} must be an object`);
    onlyKeys(scene, ['id','durationFrames','background','action','characters','eyebrow','headline','caption','accent'], `scene ${index}`);
    requireValue(text(scene.id, 60) && /^[a-z0-9-]+$/.test(scene.id) && !ids.has(scene.id), 'scene IDs must be unique');
    ids.add(scene.id);
    requireValue(Number.isInteger(scene.durationFrames) && Number(scene.durationFrames) >= 30 && Number(scene.durationFrames) <= 450, 'scene duration must be 30–450 whole frames');
    requireValue(scene.background === 'cabin-night', `missing background: ${scene.background}`);
    requireValue(ACTIONS.includes(scene.action as Action), `unknown action: ${scene.action}`);
    requireValue(Array.isArray(scene.characters) && scene.characters.length > 0 && scene.characters.every(c => CHARACTERS.includes(c as CharacterId)), 'missing character rig');
    requireValue(new Set(scene.characters).size === scene.characters.length, 'duplicate character');
    requireValue(text(scene.eyebrow, 42), 'eyebrow must contain 1–42 characters');
    requireValue(Array.isArray(scene.headline) && scene.headline.length === 2 && scene.headline.every(t => text(t, 22)), 'headline must have two lines (max 22 characters each)');
    requireValue(text(scene.caption, 65), 'caption must contain 1–65 characters');
    requireValue(typeof scene.accent === 'string' && /^#[0-9a-fA-F]{6}$/.test(scene.accent), 'accent must be a hex color');
  }
  const manifest = value as unknown as Manifest;
  requireValue(durationInFrames(manifest) <= 1800, 'episode exceeds 60 seconds');
  return manifest;
}
export function durationInFrames(manifest: Manifest): number {
  return manifest.scenes.reduce((sum, scene) => sum + scene.durationFrames, 0);
}
export function sceneAtFrame(manifest: Manifest, frame: number) {
  if (!Number.isInteger(frame) || frame < 0) throw new Error(`Invalid frame ${frame}`);
  let from = 0;
  for (const [index, scene] of manifest.scenes.entries()) {
    if (frame < from + scene.durationFrames) return {scene, index, from, localFrame: frame - from};
    from += scene.durationFrames;
  }
  throw new Error(`Frame ${frame} outside composition`);
}
