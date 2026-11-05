# Isolated cartoon renderer

An original, four-scene 2D cartoon prototype: **What If a Zombie Apocalypse Started on Your Flight?**

The default episode is 14 seconds (420 frames), 1080 × 1920, 30 fps, encoded as H.264 with 4:2:0 color in an MP4 container. It is intentionally silent: no narration, TTS, music service, paid API, publishing, or upload is invoked. This package does not import or modify the MoneyPrinterTurbo Python pipeline, and never calls `combine_videos()`.

## Install

Use Node.js 22 or newer and npm. From the repository root:

```powershell
cd animation
npm ci
```

Remotion packages are pinned to the same version in `package.json` and `package-lock.json`. The first render downloads Remotion's compatible Chrome Headless Shell if it is not installed. Installation and this initial browser download require internet access. Rendering subsequently uses local code, assets, and browser binaries; no provider credentials are needed.

On Windows PowerShell, use `npm.cmd` instead of `npm` if script execution policy blocks `npm.ps1`.

## Preview

```powershell
npm run preview
```

Open the URL printed by Remotion Studio and select **ZombieFlight**. Scrub the timeline or play it. Editing `manifests/zombie-flight.json` changes the default Studio composition.

## Render

```powershell
npm run render
```

Outputs:

- `out/zombie-flight.mp4` — full-resolution final video.
- `out/zombie-flight.mp4.json` — resolved manifest, dimensions, duration, and SHA-256 receipt.
- `out/frames/` — two full-resolution inspection frames per scene.

The command validates the manifest and assets before rendering, reports JSON progress events, and publishes the MP4 by renaming a private temporary file after encoding succeeds. Ctrl+C cancels the media render. A receipt or inspection-frame failure returns a nonzero exit code even if the finished MP4 was already published. Generated files and caches are ignored by Git.

```powershell
npm run frames
npm run render -- --manifest manifests/zombie-flight.json --output out/custom.mp4 --concurrency 2
```

`frames` produces inspection PNGs without encoding a video. Manifest/output paths supplied on the command line resolve against the working directory. Concurrency accepts 1–8 workers; two is the conservative default. Do not run simultaneous render commands in the same checkout, since the compiled bundle directory is shared.

## Checks

```powershell
npm run check
```

Runs strict TypeScript checking, Node's test runner, and asset/manifest validation. Tests cover the exact 420-frame composition, all scene boundaries, duration changes, dimension/frame-rate constraints, unknown rigs/actions/backgrounds, duplicate scene IDs, missing/empty files, unsafe asset paths, and CLI argument errors. The render entry point additionally checks Remotion's resolved composition metadata.

The completed prototype's inspection and encoded-media checks are recorded in [VALIDATION.md](VALIDATION.md).

## Scene manifest

The validated schema is in `src/manifest.ts`; the complete example is `manifests/zombie-flight.json`. Durations are whole frames. At 30 fps, 105 frames equals 3.5 seconds. The episode duration is the sum of scene durations; transitions occupy the first eight frames of the incoming scene without adding time.

```json
{
  "id": "uneasy",
  "durationFrames": 105,
  "background": "cabin-night",
  "action": "anxious",
  "characters": ["maya", "eli", "noah"],
  "eyebrow": "A MIDNIGHT FLIGHT",
  "headline": ["ZOMBIES.", "ON YOUR FLIGHT."],
  "caption": "Something is wrong in row 13.",
  "accent": "#FFD685"
}
```

Supported actions: `anxious`, `infected`, `flicker`, `freeze`. These are authored scene behaviors, not arbitrary executable instructions. `freeze` holds the preceding escalation pose while the question animates in. The milestone is a reusable template with constrained actions, not a general-purpose scene director. Custom manifests must stay within the documented layout/text limits and should be visually reviewed.

## Original artwork and animation

- `src/art/Character.tsx`: three original layered SVG character variants, jointed shoulders/elbows, articulated poses, facial expressions, blinking, gaze, breathing, and infection reactions. Maya has a coral jacket and dark wavy bob; Eli has a sage jacket and swept hair; Noah wears a blue cabin-crew uniform.
- `src/art/Cabin.tsx`: original perspective cabin and reusable seats, windows with night sky, overhead bins, vents, reading lights, aisle, seat belts, and exit door.
- `src/Episode.tsx`: scene staging, camera drift/push, lighting, alert overlay, kinetic typography, transition compositing, and the final freeze-frame.
- `src/Root.tsx`: manifest-driven composition metadata.
- `scripts/`: standalone validation and rendering; no Python application imports.

All motion is evaluated from the current frame. There are no CSS time-based animations, random stock clips, remote images, generated source code, or wall-clock-dependent effects. The cabin and characters remain vector layers during rendering. The freeze-frame is evaluated from a fixed frame, not a screenshot. The default scenes last 3.5, 4.5, 3, and 3 seconds.

Be Vietnam Pro Bold and Medium were copied from this repository's bundled fonts. Their SIL Open Font License is included in `public/fonts/OFL.txt`; source: https://github.com/google/fonts/tree/main/ofl/bevietnampro. All character and cabin artwork was created for this prototype and uses no third-party character designs. Remotion's own license applies to its dependencies: https://www.remotion.dev/license.

## Milestone boundaries

There is no narration, lip sync, audio mixing, LLM storyboard generation, paid generation, auto-publishing, or Python integration in this milestone. The single cabin setting, three character variants, and four authored actions are the supported art vocabulary. More actions and settings can be added without changing the Python pipeline. Full-episode renders are currently used; incremental scene caching is future work.
