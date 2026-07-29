---
name: resume-pdf
description: Edit and rebuild public/SunnyKolattukudyResume.pdf, the resume PDF this site serves. Use when asked to update the resume, change a resume bullet, add a job or skill, or regenerate the PDF after editing the site's Experience section. Keeps the exact layout of the original (Inter, one page, fixed anchors).
---

# Resume PDF

The PDF at `public/SunnyKolattukudyResume.pdf` is generated, not hand-authored. Its original
source was lost, so the layout here was reverse-engineered from the shipped PDF and is
reproduced exactly — every text span lands on the same coordinates as the version that
existed before this skill.

**Edit content in `resume_content.py` only.** Never edit the PDF directly and never change
geometry constants in `build_resume.py` unless the design is deliberately being changed.

## Rebuild

```bash
python .claude/skills/resume-pdf/build_resume.py        # writes public/SunnyKolattukudyResume.pdf
python .claude/skills/resume-pdf/verify_layout.py       # asserts the layout anchors still hold
```

`build_resume.py` prints the last baseline and remaining slack; `verify_layout.py` fails if
the page count, anchors, rules, fonts, or bottom margin drift. Requires `reportlab`
(build) and `pymupdf` (verify).

The resume must stay **one page**. If the build reports OVERFLOW, tighten wording — do not
shrink the type or margins.

## Keep in sync with the site

`src/pages/index.astro` carries a shorter version of the same Experience bullets. A change
to a job's story belongs in both: the PDF bullet keeps the metric and the mechanism, the
site bullet is the condensed read. Titles and date ranges must match exactly.

## Layout spec

Top-left origin, points, US Letter 612×792, text column 52.8 → 559.2, bottom limit 739.2.

| Element | Font | Size | Color | Position |
|---|---|---|---|---|
| Name | Inter-Bold | 20 | `#111111` | centered, top 42.6 |
| Contact | Inter-Regular | 8.5 | `#888888` | centered, top 69.3 |
| Section head | Inter-SemiBold | 8 | `#444444` | left, rule 13.2 below |
| Company | Inter-SemiBold | 10 | `#111111` | left; meta 14 below |
| Meta | Inter-Italic | 8.5 | `#888888` | left |
| Body / bullets | Inter-Regular | 8.8 | `#1F1F1F` | leading 13 (13.5 in summary) |
| Rules | — | 0.5pt | `#DDDDDD` | 52.8 → 559.2, at 88.5 / 110.0 / 176.0 / below SKILLS |

Spacing: 3pt between paragraphs and bullets, 19pt between jobs, 21.5pt before EMPLOYMENT,
28.9pt before SKILLS. Bullets are an en dash + space at x=52.8; wrapped lines hang to 66.8.

Punctuation is load-bearing: `·` (U+00B7) separators, `–` (U+2013) for date ranges and the
bullet marker, `—` (U+2014) for asides.

## Fonts

`fonts/Inter-{Regular,Italic,SemiBold,Bold}.ttf` are the latin subsets from the
`@fontsource/inter` npm package (weights 400/400-italic/600/700), unpacked from WOFF to TTF
so ReportLab can embed them. Inter is SIL OFL 1.1 — see `fonts/LICENSE-Inter.txt`.
