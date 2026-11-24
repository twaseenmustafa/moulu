# CREDITS — Higgsfield budget (hard limit 100)

Account balance at start: 263.87 (only 100 may be used). Quoted costs (estimate tools, 2026-11-23):

| Model | Setting | Cost |
|---|---|---|
| `gpt_image_2_6` | 1 image | 0.75 |
| `kling3_0` | 5 s, pro, sound off | 8.75 |
| `kling3_0` | 5 s, std, sound off | 7.5 |
| `seedance_2_0` | 5 s, fast 720p, no audio | 12.5 |
| `grok_video_v15` | 5 s 720p | 22.5 |
| `seedance_2_5` | 5 s 720p | 35 |

## Plan (before generating)
| Bucket | Items | Est. |
|---|---|---|
| Master sofa | 4 variants of 1 prompt (pick 1) | 3.0 |
| Variations from master | Chalk + Cocoa fabric edits, 3/4 cutout on flat bg, Pebble + Crumb (ref = master), craft macro, anatomy, story | ~8 |
| Lifestyle / room | hero room 16:9 + 9:16, 2 scenes | ~3 |
| Background removal | 3 cutouts | ~3 (TBC) |
| Video | hero 16:9 (kling pro 5 s), hero 9:16 mobile, turntable (start = cutout) | ~27 |
| **Reserve** for regenerations | | ~56 → keep ≥ 20 unspent |

## Ledger
| # | Asset | Model | Credits | Result |
|---|---|---|---|---|
| 1 | Master sofa, 4 variants (picked `9a377c31`) | gpt_image_2_6 low/1k | 3.00 | all 4 clean; #3 chosen |
| 2 | Dune Ember cutout (transparent, 2k high) | gpt_image_2_6 | 2.00 | ok |
| 3 | Pebble + Crumb cutouts (ref = master) | gpt_image_2_6 | 4.00 | ok, same family |
| 4 | Room 16:9 + 9:16, macro, workshop, reading corner | gpt_image_2_6 | 10.00 | ok; hands checked at 100% |
| 5 | Dune Chalk + Cocoa (edit of Ember cutout), anatomy | gpt_image_2_6 | 6.00 | ok; same crop → clean crossfade |
| 6 | Desktop film, mobile film, turntable (5 s, pro, silent) | kling3_0 | 26.25 | ok; turntable ≈180°, no deformation |
| | **Total used** | | **51.25** | balance 263.87 → 212.62 (verified via transactions) |
| | **Remaining of 100 budget** | | **48.75** | no regenerations were needed |

Rejected shots: none — every output passed the AI-error check (seams, legs, fabric, text). Remove-background was not needed (model output transparent PNGs directly).

## Sub-page visuals (2026-11-24, separate 10-credit budget)
| # | Asset | Model | Credits | Result |
|---|---|---|---|---|
| 7 | Privacy: Pebble chair, curtains drawn (ref = master) | gpt_image_2_6 high 2k | 2.00 | ok |
| 8 | Imprint: maker flat-lay (3 swatches, tools, blank brass plate) | gpt_image_2_6 high 2k | 2.00 | ok, no text artefacts |
| | **Used / budget** | | **4.00 / 10** | balance 212.62 -> 208.62 (verified) |
