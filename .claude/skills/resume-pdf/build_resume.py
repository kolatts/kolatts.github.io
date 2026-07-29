# -*- coding: utf-8 -*-
"""Rebuild SunnyKolattukudyResume.pdf, matching the original layout exactly.

Geometry (top-left origin, points) reverse-engineered from the previous PDF:
  page 612x792, text column 52.8 -> 559.2
  name Inter-Bold 20 #111111 centered @ 42.6      contact Inter-Regular 8.5 #888888 centered @ 69.3
  rules 0.5pt #DDDDDD                             section heads Inter-SemiBold 8 #444444
  company Inter-SemiBold 10 #111111               meta Inter-Italic 8.5 #888888
  body Inter-Regular 8.8 #1F1F1F, leading 13 (13.5 in summary), 3pt between paragraphs
  bullets: en dash + space at 52.8, wrapped lines hang to 66.8
"""
import os
import sys

from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from resume_content import NAME, CONTACT, SUMMARY, JOBS, SKILLS, BULLET  # noqa: E402

REPO_ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
DEFAULT_OUT = os.path.join(REPO_ROOT, "public", "SunnyKolattukudyResume.pdf")
OUT = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_OUT

PAGE_W, PAGE_H = 612.0, 792.0
LEFT, RIGHT = 52.8, 559.2
CENTER = PAGE_W / 2
BOTTOM_LIMIT = PAGE_H - 52.8

REG, ITAL, SEMI, BOLD = "Inter-Regular", "Inter-Italic", "Inter-SemiBold", "Inter-Bold"
for name in (REG, ITAL, SEMI, BOLD):
    pdfmetrics.registerFont(TTFont(name, os.path.join(HERE, "fonts", name + ".ttf")))

INK = HexColor("#111111")
BODY = HexColor("#1F1F1F")
HEAD = HexColor("#444444")
MUTED = HexColor("#888888")
RULE = HexColor("#DDDDDD")

BODY_SIZE, BODY_LEAD = 8.8, 13.0
SUMMARY_LEAD = 13.5
PARA_GAP = 3.0            # extra space between paragraphs / bullets
HANG = 14.0               # wrapped-line indent for bullets
ASCENT = 0.9688           # Inter hhea ascent, used to map span-top -> baseline

c = canvas.Canvas(OUT, pagesize=(PAGE_W, PAGE_H))
c.setTitle("Sunny Kolattukudy — Resume")
c.setAuthor("Sunny Kolattukudy")
c.setSubject("Resume")


def baseline(y_top, size):
    return PAGE_H - (y_top + ASCENT * size)


def text(s, y_top, x=LEFT, font=REG, size=BODY_SIZE, color=BODY, centered=False):
    c.setFont(font, size)
    c.setFillColor(color)
    if centered:
        c.drawCentredString(CENTER, baseline(y_top, size), s)
    else:
        c.drawString(x, baseline(y_top, size), s)


def rule(y_top):
    c.setStrokeColor(RULE)
    c.setLineWidth(0.5)
    c.line(LEFT, PAGE_H - y_top, RIGHT, PAGE_H - y_top)


def wrap(words, width, font=REG, size=BODY_SIZE):
    """Greedy wrap; returns (line, remaining_words)."""
    line = ""
    while words:
        trial = (line + " " + words[0]).strip()
        if pdfmetrics.stringWidth(trial, font, size) > width and line:
            break
        line = trial
        words = words[1:]
    return line, words


def paragraph(body, y_top, x=LEFT, width=None, lead=BODY_LEAD, font=REG, size=BODY_SIZE, color=BODY):
    width = width if width is not None else RIGHT - x
    words = body.split()
    y = y_top
    while words:
        line, words = wrap(words, width, font, size)
        text(line, y, x=x, font=font, size=size, color=color)
        if words:
            y += lead
    return y


def bullet(body, y_top):
    """En-dash bullet at LEFT; first line shares that line, wraps hang to LEFT+HANG."""
    prefix = BULLET + " "
    first_x = LEFT + pdfmetrics.stringWidth(prefix, REG, BODY_SIZE)
    text(prefix, y_top)
    words = body.split()
    line, words = wrap(words, RIGHT - first_x)
    text(line, y_top, x=first_x)
    y = y_top
    if words:
        y = paragraph(" ".join(words), y_top + BODY_LEAD, x=LEFT + HANG, width=RIGHT - (LEFT + HANG))
    return y


# ── Header ──
text(NAME, 42.6, font=BOLD, size=20, color=INK, centered=True)
text(CONTACT, 69.3, font=REG, size=8.5, color=MUTED, centered=True)
rule(88.5)

# ── Summary ──
text("SUMMARY", 96.8, font=SEMI, size=8, color=HEAD)
rule(110.0)
y = paragraph(SUMMARY, 114.3, lead=SUMMARY_LEAD)

# ── Employment ──
y += 21.5
text("EMPLOYMENT", y, font=SEMI, size=8, color=HEAD)
rule(y + 13.2)
y += 19.5                                     # first company baseline block (162.8 -> 182.3)

for i, (company, meta, bullets) in enumerate(JOBS):
    if i:
        y += 19.0
    text(company, y, font=SEMI, size=10, color=INK)
    text(meta, y + 14.0, font=ITAL, size=8.5, color=MUTED)
    y += 14.0 + 16.0
    for j, b in enumerate(bullets):
        if j:
            y += BODY_LEAD + PARA_GAP
        y = bullet(b, y)

# ── Skills ──
y += 28.9
text("SKILLS", y, font=SEMI, size=8, color=HEAD)
rule(y + 13.3)
y += 17.6
for i, line in enumerate(SKILLS):
    if i:
        y += BODY_LEAD + PARA_GAP
    y = paragraph(line, y)

overflow = (y + ASCENT * BODY_SIZE) - BOTTOM_LIMIT
print(f"last baseline top: {y:.1f}   bottom limit: {BOTTOM_LIMIT:.1f}   "
      f"{'OVERFLOW ' + format(overflow, '.1f') if overflow > 0 else 'fits (' + format(-overflow, '.1f') + 'pt slack)'}")

c.showPage()
c.save()
print("wrote", OUT, os.path.getsize(OUT), "bytes")
