# Milestone 2: Eric narration pilot

This is a voice-paced **17.6-second** variant of the original silent Zombie Flight prototype. The submitted and approved English narration is **17.592 seconds**, encoded as mono MP3 at 24 kHz. We render at 30 fps, so the visual timeline is **528 frames** (17.600 seconds). This branch preserves the original 420-frame, silent storyboard.

## Prepare the audio locally

From the `MoneyPrinterTurbo\animation` folder in PowerShell:

```powershell
New-Item -ItemType Directory -Force public\narration
Copy-Item "C:\path\to\your\audio.mp3" "public\narration\zombie-flight-eric.mp3"
```

Replace `C:\path\to\your\audio.mp3` with your actual downloaded MP3 path. Do not commit the narration file to Git: `public/narration/` is ignored.

## Validate and render

```powershell
npm.cmd run check
npm.cmd run render -- --manifest manifests/zombie-flight-eric.json --output out/zombie-flight-eric.mp4
```

The standard `npm.cmd run render` continues to render the **original silent** `zombie-flight.json`. Use the command above for the narrated variant. `src/Root.tsx` accepts the custom manifest through its existing composition metadata resolver.

The renderer validates that the narration MP3 exists before encoding. The audio track is added with Remotion's `Audio` component, while all image and character assets remain unchanged. At 30 fps the scene lengths are:

| Scene | Frames | Timeline |
|---|---:|---|
| Uneasy / midnight | 176 | 0.000–5.867 s |
| Infection | 69 | 5.867–8.167 s |
| Blackout | 136 | 8.167–12.700 s |
| Decision | 147 | 12.700–17.600 s |

The scene boundaries are **editorial approximations**, based on pauses in the supplied voiceover. These are not forced-aligned word timestamps; a later milestone should derive exact word timing and drive on-screen captions from it.

## Validation notes

- `animation/src/manifest.ts` accepts an optional local narration asset and rejects remote/traversal paths.
- `animation/scripts/io.ts` checks every declared asset, including narration, before rendering.
- The original manifest remains unchanged and needs no audio.
- The new manifest requires a manually staged MP3; it is intentionally not stored on GitHub.
- Run `npm.cmd run check` and inspect the new MP4 on Windows before merging. The GitHub changes have not been run through Remotion in this environment.

## Remaining work

The existing graphical captions in `Episode.tsx` are still **scene captions**, not speech-aligned karaoke captions. Add word alignment and caption-layout collision checks before calling this a finished automated production pipeline. Ensure there is only one audio/caption owner when MoneyPrinterTurbo and Remotion are integrated.
