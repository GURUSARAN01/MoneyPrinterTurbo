# Milestone 1 validation

Prototype: **What If a Zombie Apocalypse Started on Your Flight?**

Implemented on `feature/animation-studio`. All added source/configuration/assets are inside `animation/`; the existing Python pipeline has no diff. No commit, paid provider request, TTS request, publishing, or upload was performed.

## Rendered artifact

- File: `out/zombie-flight.mp4`
- Duration: **14.000 seconds**
- Decoded frames: **420**
- Dimensions: **1080 × 1920**
- Frame rate: **30/1**
- Codec: **H.264**, 4:2:0; FFprobe reports full-range `yuvj420p`
- Audio streams: **0**, intentionally silent
- Size: **8,374,970 bytes**
- SHA-256: `a8a9a79a51472086433c23f2ded96a0bddc221022204daa01ea67ff2c408fe23`
- Resolved manifest and input/output hashes: `out/zombie-flight.mp4.json`

Generated output is ignored by Git. Regenerate it with `npm run render`.

## Checks performed

- `npm run check`: strict TypeScript passes; all **10 tests pass**; manifest/assets validate.
- Actual Remotion composition metadata matches the manifest.
- FFprobe decoded and counted all 420 frames, with the expected dimensions, rate, duration, and no audio stream.
- FFmpeg decoded the complete output with `-xerror` and no reported errors.
- Eight representative PNGs were rendered: frames 31, 81, 145, 210, 267, 310, 357, and 400.
- Frames from all four scenes were visually inspected. The first pass led to corrections to title spacing, arm/elbow poses, character placement, and the midnight time label. The corrected version was rendered again.
- Additional frames were extracted from the encoded MP4 at 1.033333, 8.6, and 13.333333 seconds and inspected for the opening, darkened cabin, and final question.

The native verification commands on this Windows installation used Remotion's bundled binaries:

```powershell
& '.\node_modules\@remotion\compositor-win32-x64-msvc\ffprobe.exe' -v error -count_frames -show_entries stream=codec_name,codec_type,width,height,pix_fmt,r_frame_rate,nb_read_frames,duration -show_entries format=duration,size -of json out\zombie-flight.mp4
& '.\node_modules\@remotion\compositor-win32-x64-msvc\ffmpeg.exe' -v error -xerror -i out\zombie-flight.mp4 -c:v rawvideo -f null -
```

The explicit `rawvideo` output encoder is needed because this bundled FFmpeg build omits the default `wrapped_avframe` encoder. A conventional full FFmpeg installation can also be used.

## Current limits

This is a deliberately constrained visual prototype: one setting, three original character variants, four authored actions, and no narration or lip sync. It does not automatically invent new scenes or support arbitrary character interactions. Custom manifest content still requires a visual review. Source motion is frame-driven and deterministic; the final frozen illustration holds while its text and progress indicator continue to animate. Byte-identical H.264 across different toolchains is not guaranteed.

Node 26 prints a tsx loader deprecation notice; it did not prevent type checking, tests, browser rendering, or encoding.
