#!/usr/bin/env python3
"""
PhynxTimer Wireframe Builder
Generates an Excalidraw JSON file with 26 panels for the PhynxTimer redesign.
Reads the spec at PHYNXTIMER-WIREFRAME-SPEC.md and produces
phynxtimer-wireframes.excalidraw in the same directory.
"""
import json
import os
import random
import time

# ---------- Output paths ----------
HERE = os.path.dirname(os.path.abspath(__file__))
OUTPUT_PATH = os.path.join(HERE, "phynxtimer-wireframes.excalidraw")

# ---------- Design system ----------
WHITE = "#ffffff"
BORDER = "#e5e7eb"
TITLE = "#0f172a"
LABEL = "#334155"
BODY = "#475569"
MUTED = "#94a3b8"
PRIMARY = "#0ea5e9"
SUCCESS = "#10b981"
DANGER = "#ef4444"
C_BLUE = "#3b82f6"
C_GREEN = "#22c55e"
C_PURPLE = "#a855f7"
C_GRAY = "#64748b"
SELECT_BG = "#e0f2fe"
PANEL_BG = "#f8fafc"

# ---------- Layout ----------
PANEL_W = 1500
PANEL_H = 1100
GAP_X = 200
GAP_Y = 300
COLS = 3

# Panel content zones
PAD = 40
HEADER_H = 60
WIREFRAME_W = 900
NOTES_W = 500
NOTES_X_OFFSET = PAD + WIREFRAME_W + 40  # x from panel origin

# Timestamp and ID generator
NOW = int(time.time() * 1000)
_id_counter = 0


def next_id():
    global _id_counter
    _id_counter += 1
    return f"el{_id_counter:05d}"


def seed():
    return random.randint(1, 2_000_000_000)


# ---------- Element factories ----------
def base(**kwargs):
    """Fields common to every element."""
    el = {
        "id": next_id(),
        "type": kwargs.get("type", "rectangle"),
        "x": float(kwargs["x"]),
        "y": float(kwargs["y"]),
        "width": float(kwargs.get("width", 100)),
        "height": float(kwargs.get("height", 40)),
        "angle": 0,
        "strokeColor": kwargs.get("strokeColor", TITLE),
        "backgroundColor": kwargs.get("backgroundColor", "transparent"),
        "fillStyle": kwargs.get("fillStyle", "solid"),
        "strokeWidth": kwargs.get("strokeWidth", 1),
        "strokeStyle": kwargs.get("strokeStyle", "solid"),
        "roughness": kwargs.get("roughness", 1),
        "opacity": 100,
        "groupIds": [],
        "frameId": None,
        "roundness": kwargs.get("roundness", None),
        "seed": seed(),
        "version": 1,
        "versionNonce": seed(),
        "isDeleted": False,
        "boundElements": None,
        "updated": NOW,
        "link": None,
        "locked": False,
    }
    return el


def rect(x, y, w, h, stroke=TITLE, fill="transparent", fill_style="solid",
         rounded=False, stroke_width=1, stroke_style="solid", rough=1):
    el = base(
        type="rectangle",
        x=x, y=y, width=w, height=h,
        strokeColor=stroke,
        backgroundColor=fill,
        fillStyle=fill_style,
        strokeWidth=stroke_width,
        strokeStyle=stroke_style,
        roughness=rough,
        roundness={"type": 3} if rounded else None,
    )
    return el


def ellipse(x, y, w, h, stroke=TITLE, fill="transparent", fill_style="solid",
            stroke_width=1, rough=1):
    el = base(
        type="ellipse",
        x=x, y=y, width=w, height=h,
        strokeColor=stroke,
        backgroundColor=fill,
        fillStyle=fill_style,
        strokeWidth=stroke_width,
        roughness=rough,
    )
    return el


def diamond(x, y, w, h, stroke=TITLE, fill="transparent", fill_style="solid",
            stroke_width=1, rough=1):
    el = base(
        type="diamond",
        x=x, y=y, width=w, height=h,
        strokeColor=stroke,
        backgroundColor=fill,
        fillStyle=fill_style,
        strokeWidth=stroke_width,
        roughness=rough,
    )
    return el


def text(x, y, content, size=14, color=BODY, align="left", width=None, height=None):
    # Default width: rough width estimate from text length
    if width is None:
        width = max(len(content) * size * 0.55, 20)
    if height is None:
        height = size * 1.3
    el = base(
        type="text",
        x=x, y=y,
        width=width,
        height=height,
        strokeColor=color,
        backgroundColor="transparent",
        fillStyle="solid",
        strokeWidth=1,
        strokeStyle="solid",
        roughness=1,
    )
    el["fontSize"] = size
    el["fontFamily"] = 1  # Virgil
    el["text"] = content
    el["textAlign"] = align
    el["verticalAlign"] = "top"
    el["baseline"] = int(size * 0.85)
    el["containerId"] = None
    el["originalText"] = content
    el["lineHeight"] = 1.25
    el["autoResize"] = True
    return el


def line(x, y, points, stroke=BODY, stroke_width=1, stroke_style="solid", rough=0):
    # points = list of [dx, dy] offsets from (x, y). First is usually [0,0].
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    w = max(xs) - min(xs) if xs else 0
    h = max(ys) - min(ys) if ys else 0
    el = base(
        type="line",
        x=x, y=y,
        width=w if w > 0 else 1,
        height=h if h > 0 else 1,
        strokeColor=stroke,
        backgroundColor="transparent",
        fillStyle="solid",
        strokeWidth=stroke_width,
        strokeStyle=stroke_style,
        roughness=rough,
    )
    el["points"] = [[float(p[0]), float(p[1])] for p in points]
    el["lastCommittedPoint"] = None
    el["startBinding"] = None
    el["endBinding"] = None
    el["startArrowhead"] = None
    el["endArrowhead"] = None
    return el


def arrow(x, y, points, stroke=PRIMARY, stroke_width=2):
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    w = max(xs) - min(xs) if xs else 0
    h = max(ys) - min(ys) if ys else 0
    el = base(
        type="arrow",
        x=x, y=y,
        width=w if w > 0 else 1,
        height=h if h > 0 else 1,
        strokeColor=stroke,
        backgroundColor="transparent",
        fillStyle="solid",
        strokeWidth=stroke_width,
        strokeStyle="solid",
        roughness=1,
    )
    el["points"] = [[float(p[0]), float(p[1])] for p in points]
    el["lastCommittedPoint"] = None
    el["startBinding"] = None
    el["endBinding"] = None
    el["startArrowhead"] = None
    el["endArrowhead"] = "arrow"
    return el


# ---------- Panel-level helpers ----------
def draw_panel_container(px, py, title_str):
    """Draw outer container + title. Returns list of elements."""
    els = []
    # Outer container
    els.append(rect(px, py, PANEL_W, PANEL_H, stroke=BORDER, fill=WHITE,
                    fill_style="solid", rounded=True, stroke_width=2, rough=1))
    # Panel title
    els.append(text(px + PAD, py + PAD, title_str, size=28, color=TITLE))
    # Divider under title
    els.append(line(px + PAD, py + PAD + 45, [[0, 0], [PANEL_W - 2 * PAD, 0]],
                    stroke=BORDER, stroke_width=1))
    return els


def draw_notes(px, py, notes):
    """Draw notes column on right side of panel. notes: list of strings."""
    els = []
    nx = px + NOTES_X_OFFSET
    ny = py + PAD + 70
    els.append(text(nx, ny, "NOTES", size=14, color=LABEL))
    ny += 25
    els.append(line(nx, ny, [[0, 0], [NOTES_W - 60, 0]], stroke=BORDER, stroke_width=1))
    ny += 15
    for n in notes:
        # Wrap long notes to ~60 chars
        bullet = "• "
        # Simple wrap
        max_chars = 55
        words = n.split()
        line_str = ""
        lines = []
        for w in words:
            if len(line_str) + len(w) + 1 <= max_chars:
                line_str = (line_str + " " + w).strip()
            else:
                if line_str:
                    lines.append(line_str)
                line_str = w
        if line_str:
            lines.append(line_str)
        for i, ln in enumerate(lines):
            prefix = bullet if i == 0 else "  "
            els.append(text(nx, ny, prefix + ln, size=12, color=BODY))
            ny += 18
        ny += 4
    return els


def wf_origin(px, py):
    """Top-left of wireframe canvas inside a panel."""
    return px + PAD, py + PAD + 70


# ---------- Panel builders ----------
# Each builder takes (px, py) and returns a list of elements.
# Wireframe canvas is ~900 wide, ~950 tall below the header.

def panel_1_1(px, py):
    els = []
    els += draw_panel_container(px, py, "1.1  Today (Dashboard)")
    wx, wy = wf_origin(px, py)

    # Top header bar
    els.append(rect(wx, wy, 900, 50, stroke=BORDER, fill=PANEL_BG, fill_style="solid", rounded=True))
    els.append(text(wx + 14, wy + 16, "PhynxTimer", size=16, color=TITLE))
    # Center ticker pill
    els.append(rect(wx + 260, wy + 10, 320, 30, stroke=PRIMARY, fill="#e0f2fe", fill_style="solid", rounded=True))
    els.append(text(wx + 278, wy + 17, "THIS WEEK: $1,420 BILLABLE", size=12, color=PRIMARY))
    # Running entry pill
    els.append(rect(wx + 620, wy + 10, 220, 30, stroke=SUCCESS, fill="#ecfdf5", fill_style="solid", rounded=True))
    els.append(ellipse(wx + 632, wy + 19, 12, 12, stroke=SUCCESS, fill=SUCCESS, fill_style="solid"))
    els.append(text(wx + 650, wy + 17, "Acme  0:42:15", size=12, color=SUCCESS))
    # Avatar
    els.append(ellipse(wx + 856, wy + 11, 28, 28, stroke=LABEL, fill=MUTED, fill_style="solid"))

    # Hero AI sentence
    y = wy + 80
    els.append(text(wx, y, "You've logged 3h 12m today  $180 billable  18% above", size=20, color=TITLE))
    els.append(text(wx, y + 30, "weekly avg  last entry 40m ago", size=20, color=TITLE))

    # Micro-analytics chip row
    y += 80
    chips = [
        ("[fire] 14 day streak", C_BLUE),
        ("[zap] Focus 7.3/10", PRIMARY),
        ("[up] Backend -18%", SUCCESS),
        ("[goal] 32/40h (80%)", C_PURPLE),
    ]
    cx = wx
    for txt, col in chips:
        w = 200
        els.append(rect(cx, y, w, 36, stroke=col, fill="#f8fafc", fill_style="solid", rounded=True))
        els.append(text(cx + 10, y + 10, txt, size=12, color=col))
        cx += w + 10

    # Command bar
    y += 60
    els.append(rect(wx, y, 900, 56, stroke=LABEL, fill=WHITE, fill_style="solid", rounded=True, stroke_width=2))
    els.append(rect(wx + 14, y + 14, 28, 28, stroke=LABEL, fill=PANEL_BG, fill_style="solid", rounded=True))
    els.append(text(wx + 20, y + 19, "CK", size=12, color=LABEL))
    els.append(text(wx + 58, y + 18, "What did you do? (press / to start typing)", size=16, color=MUTED))

    # Hint
    els.append(text(wx, y + 66, "Press Space to resume Acme", size=11, color=MUTED))

    # Section label
    y += 100
    els.append(text(wx, y, "TODAY  MON APRIL 10", size=14, color=LABEL))

    # Entry rows
    y += 26
    entries = [
        (True, C_BLUE, "Acme", "Landing hero section", "90m", "$150", "9:32-11:02"),
        (False, C_GREEN, "B Co", "Email discovery", "25m", "$40", "8:55-9:20"),
        (False, C_GRAY, "Personal", "Reading", "18m", "-", "8:30-8:48"),
        (False, C_BLUE, "Acme", "Stripe webhook fix", "2h 15m", "$225", "6:10-8:25"),
    ]
    for run, col, proj, name, dur, price, tm in entries:
        els.append(rect(wx, y, 900, 50, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
        if run:
            els.append(ellipse(wx + 14, y + 18, 14, 14, stroke=SUCCESS, fill=SUCCESS, fill_style="solid"))
        else:
            els.append(ellipse(wx + 14, y + 18, 14, 14, stroke=MUTED, fill="transparent"))
        els.append(rect(wx + 36, y + 16, 8, 18, stroke=col, fill=col, fill_style="solid"))
        els.append(text(wx + 52, y + 16, f"{proj}  {name}", size=14, color=TITLE))
        els.append(text(wx + 500, y + 16, dur, size=13, color=BODY))
        els.append(text(wx + 600, y + 16, price, size=13, color=SUCCESS))
        els.append(text(wx + 680, y + 16, tm, size=13, color=MUTED))
        els.append(text(wx + 870, y + 16, "...", size=14, color=MUTED))
        y += 58

    # Yesterday collapsed
    y += 10
    els.append(text(wx, y, "YESTERDAY  (4 entries, tap to expand)", size=14, color=MUTED))

    # Footer links
    y += 36
    els.append(text(wx, y, "Daily Rewind  Insights  Timesheet  Timeline  Reports", size=11, color=PRIMARY))

    notes = [
        "Dense list-first. No circles, no 3D.",
        "Header always shows running entry for status from any screen.",
        "Ticker strip shows live weekly billable (motivational flywheel).",
        "Filled green dot = running, outline circle = stopped.",
        "Rows click to inline edit or full dialog.",
        "Shortcuts: Space start/stop, J/K nav, N new, E edit, Cmd+K palette.",
        "AI hero sentence regenerates every 30s.",
        "Yesterday collapses by default.",
    ]
    els += draw_notes(px, py, notes)
    return els


def panel_1_2(px, py):
    els = []
    els += draw_panel_container(px, py, "1.2  Command Palette (Cmd+K)")
    wx, wy = wf_origin(px, py)

    # Dim overlay background
    els.append(rect(wx, wy, 900, 950, stroke=BORDER, fill=PANEL_BG, fill_style="hachure", rough=1))
    els.append(text(wx + 350, wy + 20, "[faint dashboard background]", size=12, color=MUTED))

    # Center modal
    mx, my = wx + 150, wy + 100
    els.append(rect(mx, my, 600, 550, stroke=TITLE, fill=WHITE, fill_style="solid", rounded=True, stroke_width=2))

    # Search input
    els.append(rect(mx + 20, my + 20, 560, 50, stroke=BORDER, fill=PANEL_BG, fill_style="solid", rounded=True))
    els.append(text(mx + 32, my + 36, "CK  Type a command or search...", size=14, color=MUTED))

    # Sections
    y = my + 90
    # ACTIONS
    els.append(text(mx + 24, y, "ACTIONS", size=11, color=MUTED))
    y += 22
    actions = [
        ("CK  Log time", "Tell me what you did", "CL"),
        (">  Start timer", "Start on a project", "Space"),
        ("[] Stop timer", "Stop the current entry", "Space"),
        ("*  Focus mode", "Full-screen focus", "C^F"),
        ("M  Voice log", "Hold to talk", "C^K"),
    ]
    for a, d, s in actions:
        els.append(text(mx + 30, y, a, size=13, color=TITLE))
        els.append(text(mx + 180, y, d, size=11, color=BODY))
        els.append(rect(mx + 500, y - 2, 60, 18, stroke=BORDER, fill=PANEL_BG, fill_style="solid", rounded=True))
        els.append(text(mx + 510, y, s, size=10, color=LABEL))
        y += 24

    y += 10
    els.append(text(mx + 24, y, "JUMP TO", size=11, color=MUTED))
    y += 22
    jumps = [
        ("->  Today", "G D"),
        ("->  Timesheet", "G T"),
        ("->  Timeline", "G L"),
        ("->  Insights", "G I"),
    ]
    for a, s in jumps:
        els.append(text(mx + 30, y, a, size=13, color=TITLE))
        els.append(rect(mx + 500, y - 2, 60, 18, stroke=BORDER, fill=PANEL_BG, fill_style="solid", rounded=True))
        els.append(text(mx + 515, y, s, size=10, color=LABEL))
        y += 22

    y += 10
    els.append(text(mx + 24, y, "AI", size=11, color=MUTED))
    y += 22
    ai_items = [
        ("*  Daily Rewind", "Reconstruct yesterday", "CR"),
        ("*  Invoice generator", "AI-drafted invoice", "CI"),
        ("Q  Find entries", "Search entries + voice", "CF"),
    ]
    for a, d, s in ai_items:
        els.append(text(mx + 30, y, a, size=13, color=TITLE))
        els.append(text(mx + 200, y, d, size=11, color=BODY))
        els.append(rect(mx + 500, y - 2, 60, 18, stroke=BORDER, fill=PANEL_BG, fill_style="solid", rounded=True))
        els.append(text(mx + 515, y, s, size=10, color=LABEL))
        y += 24

    # Footer bar
    els.append(line(mx + 20, my + 505, [[0, 0], [560, 0]], stroke=BORDER, stroke_width=1))
    els.append(text(mx + 30, my + 515, "^v navigate   select   esc close", size=11, color=MUTED))

    notes = [
        "Built on cmdk React library (Linear/Raycast pattern).",
        "Fuzzy search across action names + descriptions.",
        "Recently-used commands float to top per group.",
        "Shortcuts shown next to every action — users passively learn.",
        "Entry point for EVERY non-trivial action in v2.",
        "Mobile: replaced by + Log button in bottom tab bar.",
    ]
    els += draw_notes(px, py, notes)
    return els


def panel_1_3(px, py):
    els = []
    els += draw_panel_container(px, py, "1.3  Conversational Time Logger (Cmd+K log)")
    wx, wy = wf_origin(px, py)

    # Background dim
    els.append(rect(wx, wy, 900, 950, stroke=BORDER, fill=PANEL_BG, fill_style="solid"))

    # Modal 700x650
    mx, my = wx + 100, wy + 80
    els.append(rect(mx, my, 700, 720, stroke=TITLE, fill=WHITE, fill_style="solid", rounded=True, stroke_width=2))

    # Title bar
    els.append(text(mx + 24, my + 24, "Log time", size=20, color=TITLE))
    els.append(rect(mx + 130, my + 24, 40, 22, stroke=PRIMARY, fill="#e0f2fe", fill_style="solid", rounded=True))
    els.append(text(mx + 140, my + 28, "CL", size=11, color=PRIMARY))

    # Prompt
    els.append(text(mx + 24, my + 70, "What did you work on?", size=14, color=LABEL))

    # Textarea
    els.append(rect(mx + 24, my + 96, 652, 110, stroke=PRIMARY, fill=WHITE, fill_style="solid", rounded=True, stroke_width=2))
    els.append(text(mx + 36, my + 110, '"just spent 90 min on the acme landing hero,', size=16, color=TITLE))
    els.append(text(mx + 36, my + 136, 'billable"', size=16, color=TITLE))
    # Mic icon
    els.append(ellipse(mx + 630, my + 155, 32, 32, stroke=PRIMARY, fill="#e0f2fe", fill_style="solid"))
    els.append(text(mx + 642, my + 165, "M", size=14, color=PRIMARY))

    # Divider
    els.append(text(mx + 24, my + 225, "↓ AI PREVIEW", size=11, color=MUTED))
    els.append(line(mx + 24, my + 245, [[0, 0], [652, 0]], stroke=BORDER, stroke_width=1))

    # Preview card
    pcy = my + 260
    els.append(rect(mx + 24, pcy, 652, 340, stroke=BORDER, fill=PANEL_BG, fill_style="solid", rounded=True))
    # Project field
    els.append(text(mx + 40, pcy + 20, "PROJECT", size=10, color=MUTED))
    els.append(rect(mx + 40, pcy + 38, 280, 36, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(rect(mx + 50, pcy + 48, 14, 14, stroke=C_BLUE, fill=C_BLUE, fill_style="solid"))
    els.append(text(mx + 70, pcy + 48, "Acme", size=13, color=TITLE))
    els.append(text(mx + 300, pcy + 48, "v", size=12, color=MUTED))

    # Duration
    els.append(text(mx + 340, pcy + 20, "DURATION", size=10, color=MUTED))
    els.append(rect(mx + 340, pcy + 38, 200, 36, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(mx + 352, pcy + 48, "1h 30m", size=13, color=TITLE))

    # When
    els.append(text(mx + 40, pcy + 92, "WHEN", size=10, color=MUTED))
    els.append(rect(mx + 40, pcy + 110, 500, 36, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(mx + 52, pcy + 120, "Starting 90m ago -> now", size=13, color=TITLE))

    # Billable
    els.append(text(mx + 40, pcy + 164, "BILLABLE", size=10, color=MUTED))
    els.append(rect(mx + 40, pcy + 182, 40, 22, stroke=SUCCESS, fill=SUCCESS, fill_style="solid", rounded=True))
    els.append(ellipse(mx + 62, pcy + 184, 18, 18, stroke=WHITE, fill=WHITE, fill_style="solid"))
    els.append(text(mx + 90, pcy + 186, "Yes  $150 @ $100/hr", size=13, color=SUCCESS))

    # Notes
    els.append(text(mx + 40, pcy + 222, "NOTES", size=10, color=MUTED))
    els.append(rect(mx + 40, pcy + 240, 596, 60, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(mx + 52, pcy + 256, "hero section", size=13, color=TITLE))

    # Buttons
    by = my + 630
    els.append(rect(mx + 420, by, 110, 44, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(mx + 450, by + 14, "Cancel", size=14, color=LABEL))
    els.append(rect(mx + 540, by, 136, 44, stroke=PRIMARY, fill=PRIMARY, fill_style="solid", rounded=True))
    els.append(text(mx + 588, by + 14, "Save", size=14, color=WHITE))

    notes = [
        "LLM parses project, duration, timing, billable, notes from free text.",
        "500ms debounced live preview as user types.",
        "Every preview field clickable to override.",
        "Enter = Save. Zero mouse needed.",
        "Voice mode: mic or Cmd+Shift+K opens Panel 1.4.",
        "Fallback: low confidence -> 'Which project?' with suggestions.",
        "LLM via Supabase Edge Function -> Anthropic.",
        "Free tier capped; Pro generous.",
        "Flagship feature (N1 in research). No competitor ships this.",
    ]
    els += draw_notes(px, py, notes)
    return els


def panel_1_4(px, py):
    els = []
    els += draw_panel_container(px, py, "1.4  Voice Logger (Cmd+Shift+K)")
    wx, wy = wf_origin(px, py)

    # Modal 600x550 with glowing border
    mx, my = wx + 150, wy + 100
    els.append(rect(mx, my, 600, 650, stroke=PRIMARY, fill=WHITE, fill_style="solid", rounded=True, stroke_width=3))
    els.append(text(mx + 220, my + 24, "Voice Logger", size=18, color=TITLE))

    # Pulse rings
    cx, cy = mx + 300, my + 220
    els.append(ellipse(cx - 110, cy - 110, 220, 220, stroke=PRIMARY, fill="transparent", stroke_width=1))
    els.append(ellipse(cx - 85, cy - 85, 170, 170, stroke=PRIMARY, fill="#e0f2fe", fill_style="solid", stroke_width=1))
    # Mic icon
    els.append(ellipse(cx - 60, cy - 60, 120, 120, stroke=PRIMARY, fill=PRIMARY, fill_style="solid", stroke_width=2))
    els.append(text(cx - 12, cy - 12, "MIC", size=20, color=WHITE))

    # Recording state label
    els.append(ellipse(mx + 40, my + 360, 14, 14, stroke=DANGER, fill=DANGER, fill_style="solid"))
    els.append(text(mx + 62, my + 358, "REC  Listening... 0:18", size=14, color=DANGER))

    # Waveform visualization (bars)
    wy2 = my + 400
    wx2 = mx + 80
    heights = [20, 40, 60, 80, 50, 30, 70, 90, 55, 25, 45, 65, 85, 40, 20, 55, 75, 35, 50, 70]
    for i, h in enumerate(heights):
        bx = wx2 + i * 22
        by = wy2 + (100 - h) / 2
        els.append(rect(bx, by, 12, h, stroke=PRIMARY, fill=PRIMARY, fill_style="solid"))

    els.append(text(mx + 180, my + 520, "Release to transcribe", size=13, color=MUTED))

    # State hints
    els.append(line(mx + 24, my + 560, [[0, 0], [552, 0]], stroke=BORDER, stroke_width=1))
    els.append(text(mx + 24, my + 572, "States: ready / recording (shown) / transcribing / preview", size=11, color=MUTED))

    # Cancel button
    els.append(rect(mx + 240, my + 600, 120, 36, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(mx + 280, my + 612, "Cancel", size=13, color=LABEL))

    notes = [
        "Browser MediaRecorder (Chrome, Edge, Safari, mobile).",
        "Hold Space or click-and-hold to record (Superhuman pattern).",
        "60-second max per recording.",
        "Whisper transcription via Supabase Edge Function.",
        "Voice -> transcript -> same LLM parser as text mode.",
        "Mobile: tap-to-record instead of hold.",
        "Audio stored in Supabase Storage; user can purge anytime.",
    ]
    els += draw_notes(px, py, notes)
    return els


def panel_1_5(px, py):
    els = []
    els += draw_panel_container(px, py, "1.5  Weekly Timesheet Grid")
    wx, wy = wf_origin(px, py)

    # Header bar with week nav
    els.append(rect(wx, wy, 900, 50, stroke=BORDER, fill=PANEL_BG, fill_style="solid", rounded=True))
    els.append(rect(wx + 14, wy + 12, 28, 26, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 22, wy + 17, "<", size=14, color=LABEL))
    els.append(text(wx + 58, wy + 17, "April 6-12, 2026", size=16, color=TITLE))
    els.append(rect(wx + 220, wy + 12, 28, 26, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 228, wy + 17, ">", size=14, color=LABEL))
    els.append(rect(wx + 260, wy + 12, 60, 26, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 276, wy + 17, "Today", size=12, color=LABEL))

    # Export buttons
    els.append(rect(wx + 700, wy + 12, 70, 26, stroke=LABEL, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 718, wy + 17, "CSV", size=11, color=LABEL))
    els.append(rect(wx + 780, wy + 12, 100, 26, stroke=PRIMARY, fill="#e0f2fe", fill_style="solid", rounded=True))
    els.append(text(wx + 792, wy + 17, "PDF  PRO", size=11, color=PRIMARY))

    # Table header
    ty = wy + 70
    cols = ["", "Mon 6", "Tue 7", "Wed 8", "Thu 9", "Fri 10", "Sat 11", "Sun 12", "TOTAL"]
    col_w = [160, 70, 70, 70, 70, 70, 70, 70, 90]
    cx = wx
    for i, c in enumerate(cols):
        if i == 0:
            els.append(rect(cx, ty, col_w[i], 32, stroke=BORDER, fill=PANEL_BG, fill_style="solid"))
        else:
            els.append(rect(cx, ty, col_w[i], 32, stroke=BORDER, fill=PANEL_BG, fill_style="solid"))
            els.append(text(cx + 8, ty + 10, c, size=11, color=LABEL))
        cx += col_w[i]

    # ACME group header
    ty += 32
    els.append(rect(wx, ty, sum(col_w), 28, stroke=BORDER, fill="#eff6ff", fill_style="solid"))
    els.append(ellipse(wx + 10, ty + 8, 12, 12, stroke=C_BLUE, fill=C_BLUE, fill_style="solid"))
    els.append(text(wx + 28, ty + 8, "ACME", size=12, color=C_BLUE))
    ty += 28

    rows = [
        ("Landing hero", ["1h 30m", "2h 15m", "-", "45m", "-", "-", "-"], "4h 30m"),
        ("Stripe webhook", ["2h 15m", "1h 20m", "3h 00m", "-", "-", "-", "-"], "6h 35m"),
    ]
    for name, days, total in rows:
        cx = wx
        els.append(rect(cx, ty, col_w[0], 28, stroke=BORDER, fill=WHITE, fill_style="solid"))
        els.append(text(cx + 10, ty + 8, name, size=11, color=TITLE))
        cx += col_w[0]
        for i, d in enumerate(days):
            els.append(rect(cx, ty, col_w[i + 1], 28, stroke=BORDER, fill=WHITE, fill_style="solid"))
            els.append(text(cx + 6, ty + 8, d, size=10, color=BODY))
            cx += col_w[i + 1]
        els.append(rect(cx, ty, col_w[8], 28, stroke=BORDER, fill=PANEL_BG, fill_style="solid"))
        els.append(text(cx + 6, ty + 8, total, size=11, color=TITLE))
        ty += 28

    # B CO group
    els.append(rect(wx, ty, sum(col_w), 28, stroke=BORDER, fill="#f0fdf4", fill_style="solid"))
    els.append(ellipse(wx + 10, ty + 8, 12, 12, stroke=C_GREEN, fill=C_GREEN, fill_style="solid"))
    els.append(text(wx + 28, ty + 8, "B CO", size=12, color=C_GREEN))
    ty += 28
    cx = wx
    els.append(rect(cx, ty, col_w[0], 28, stroke=BORDER, fill=WHITE, fill_style="solid"))
    els.append(text(cx + 10, ty + 8, "Email discovery", size=11, color=TITLE))
    cx += col_w[0]
    dvals = ["25m", "-", "1h 15m", "-", "-", "-", "-"]
    for i, d in enumerate(dvals):
        els.append(rect(cx, ty, col_w[i + 1], 28, stroke=BORDER, fill=WHITE, fill_style="solid"))
        els.append(text(cx + 6, ty + 8, d, size=10, color=BODY))
        cx += col_w[i + 1]
    els.append(rect(cx, ty, col_w[8], 28, stroke=BORDER, fill=PANEL_BG, fill_style="solid"))
    els.append(text(cx + 6, ty + 8, "1h 40m", size=11, color=TITLE))
    ty += 28

    # PERSONAL
    els.append(rect(wx, ty, sum(col_w), 28, stroke=BORDER, fill=PANEL_BG, fill_style="solid"))
    els.append(ellipse(wx + 10, ty + 8, 12, 12, stroke=C_GRAY, fill=C_GRAY, fill_style="solid"))
    els.append(text(wx + 28, ty + 8, "PERSONAL", size=12, color=C_GRAY))
    ty += 28
    cx = wx
    els.append(rect(cx, ty, col_w[0], 28, stroke=BORDER, fill=WHITE, fill_style="solid"))
    els.append(text(cx + 10, ty + 8, "Reading", size=11, color=TITLE))
    cx += col_w[0]
    dvals = ["18m", "-", "30m", "-", "-", "-", "-"]
    for i, d in enumerate(dvals):
        els.append(rect(cx, ty, col_w[i + 1], 28, stroke=BORDER, fill=WHITE, fill_style="solid"))
        els.append(text(cx + 6, ty + 8, d, size=10, color=BODY))
        cx += col_w[i + 1]
    els.append(rect(cx, ty, col_w[8], 28, stroke=BORDER, fill=PANEL_BG, fill_style="solid"))
    els.append(text(cx + 6, ty + 8, "48m", size=11, color=TITLE))
    ty += 28

    # Total row
    els.append(rect(wx, ty, sum(col_w), 32, stroke=TITLE, fill="#e0f2fe", fill_style="solid", stroke_width=2))
    els.append(text(wx + 10, ty + 10, "TOTAL", size=13, color=TITLE))
    dvals = ["4h 28m", "3h 35m", "4h 45m", "45m", "-", "-", "-"]
    cx = wx + col_w[0]
    for i, d in enumerate(dvals):
        els.append(text(cx + 6, ty + 10, d, size=11, color=TITLE))
        cx += col_w[i + 1]
    els.append(text(cx + 6, ty + 10, "13h 33m", size=12, color=TITLE))
    ty += 50

    # Side summary (below the table since we have 900 width)
    els.append(rect(wx, ty, 900, 120, stroke=BORDER, fill=PANEL_BG, fill_style="solid", rounded=True))
    els.append(text(wx + 20, ty + 14, "SUMMARY", size=12, color=LABEL))
    els.append(text(wx + 20, ty + 40, "Billable hrs:  12h 45m", size=13, color=TITLE))
    els.append(text(wx + 20, ty + 62, "Non-billable: 48m", size=13, color=BODY))
    els.append(text(wx + 300, ty + 40, "$ total:  $1,275", size=13, color=SUCCESS))
    els.append(text(wx + 300, ty + 62, "Top client:  Acme ($1,105)", size=13, color=TITLE))

    notes = [
        "Power-user density view.",
        "Click any cell -> edit dialog for that day/project.",
        "Hover cell -> tooltip with individual entry breakdown.",
        "Grouped by client with color dots.",
        "Grand total with live billable $ computation.",
        "CSV free, PDF Pro tier.",
        "Summoned via Cmd+K 'timesheet' or G T.",
    ]
    els += draw_notes(px, py, notes)
    return els


def panel_1_6(px, py):
    els = []
    els += draw_panel_container(px, py, "1.6  Timeline View (day ribbon)")
    wx, wy = wf_origin(px, py)

    # Header
    els.append(rect(wx, wy, 900, 50, stroke=BORDER, fill=PANEL_BG, fill_style="solid", rounded=True))
    els.append(rect(wx + 14, wy + 12, 28, 26, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 22, wy + 17, "<", size=14, color=LABEL))
    els.append(text(wx + 58, wy + 17, "Monday April 10", size=16, color=TITLE))
    els.append(rect(wx + 220, wy + 12, 28, 26, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 228, wy + 17, ">", size=14, color=LABEL))
    els.append(rect(wx + 260, wy + 12, 60, 26, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 276, wy + 17, "Today", size=12, color=LABEL))

    # Time ruler
    ry = wy + 90
    els.append(line(wx, ry, [[0, 0], [900, 0]], stroke=BORDER, stroke_width=1))
    times = ["6a", "8a", "10a", "12p", "2p", "4p", "6p", "8p", "10p"]
    for i, t in enumerate(times):
        x = wx + int(i * 900 / (len(times) - 1))
        els.append(line(x, ry - 6, [[0, 0], [0, 12]], stroke=MUTED, stroke_width=1))
        els.append(text(x - 8, ry - 24, t, size=10, color=MUTED))

    # Timeline ribbon area
    ribbon_y = ry + 40
    ribbon_h = 100
    els.append(rect(wx, ribbon_y, 900, ribbon_h, stroke=BORDER, fill=PANEL_BG, fill_style="solid", rounded=True))

    # Blocks inside ribbon. 6a = 0, 10p = 900 -> each hour = 56.25 px
    def time_to_x(h):
        return wx + int((h - 6) * 900 / 16)

    # Ghost event 9:00 calendar
    gx = time_to_x(9)
    els.append(rect(gx, ribbon_y + 10, 40, 80, stroke=MUTED, fill="transparent", stroke_style="dashed", rounded=True))
    els.append(text(gx - 10, ribbon_y - 14, "9a Standup", size=9, color=MUTED))

    # 9:32-11:02 Acme
    x1 = time_to_x(9.53)
    x2 = time_to_x(11.03)
    els.append(rect(x1, ribbon_y + 10, x2 - x1, 80, stroke=C_BLUE, fill="#dbeafe", fill_style="solid", rounded=True))
    els.append(text(x1 + 6, ribbon_y + 24, "Landing hero", size=10, color=C_BLUE))
    els.append(text(x1 + 6, ribbon_y + 42, "1h 30m", size=9, color=C_BLUE))

    # 11:15-11:40 B Co
    x1 = time_to_x(11.25)
    x2 = time_to_x(11.67)
    els.append(rect(x1, ribbon_y + 10, x2 - x1, 80, stroke=C_GREEN, fill="#dcfce7", fill_style="solid", rounded=True))
    els.append(text(x1 + 4, ribbon_y + 24, "Email", size=9, color=C_GREEN))
    els.append(text(x1 + 4, ribbon_y + 42, "25m", size=9, color=C_GREEN))

    # Gap 11:40-13:00
    x1 = time_to_x(11.67)
    x2 = time_to_x(13)
    els.append(rect(x1, ribbon_y + 10, x2 - x1, 80, stroke=DANGER, fill="#fee2e2", fill_style="hachure", stroke_style="dashed", rounded=True))
    els.append(text(x1 + 4, ribbon_y + 24, "GAP", size=10, color=DANGER))
    els.append(text(x1 + 4, ribbon_y + 42, "1h 20m", size=9, color=DANGER))

    # 13:00-15:15 Acme
    x1 = time_to_x(13)
    x2 = time_to_x(15.25)
    els.append(rect(x1, ribbon_y + 10, x2 - x1, 80, stroke=C_BLUE, fill="#dbeafe", fill_style="solid", rounded=True))
    els.append(text(x1 + 6, ribbon_y + 24, "Stripe webhook fix", size=10, color=C_BLUE))
    els.append(text(x1 + 6, ribbon_y + 42, "2h 15m", size=9, color=C_BLUE))

    # 15:30-15:48 Personal
    x1 = time_to_x(15.5)
    x2 = time_to_x(15.8)
    els.append(rect(x1, ribbon_y + 10, x2 - x1, 80, stroke=C_GRAY, fill="#f1f5f9", fill_style="solid", rounded=True))
    els.append(text(x1 + 2, ribbon_y + 30, "Read", size=8, color=C_GRAY))

    # Ghost event 16:00
    gx = time_to_x(16)
    els.append(rect(gx, ribbon_y + 10, 50, 80, stroke=MUTED, fill="transparent", stroke_style="dashed", rounded=True))
    els.append(text(gx - 10, ribbon_y - 14, "4p Sync", size=9, color=MUTED))

    # GAPS section
    gaps_y = ribbon_y + 140
    els.append(text(wx, gaps_y, "GAPS", size=14, color=DANGER))
    els.append(rect(wx, gaps_y + 24, 900, 52, stroke=DANGER, fill="#fef2f2", fill_style="solid", rounded=True))
    els.append(text(wx + 16, gaps_y + 40, "11:40 - 13:00  1h 20m unaccounted", size=13, color=DANGER))
    els.append(rect(wx + 680, gaps_y + 32, 80, 30, stroke=DANGER, fill=DANGER, fill_style="solid", rounded=True))
    els.append(text(wx + 702, gaps_y + 42, "Fill", size=13, color=WHITE))
    els.append(rect(wx + 780, gaps_y + 32, 80, 30, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 800, gaps_y + 42, "Ignore", size=13, color=LABEL))

    # Tip
    els.append(text(wx, gaps_y + 110, "Drag block edges to adjust  Click gaps to fill  Ghost events = calendar", size=11, color=MUTED))

    notes = [
        "Scrubbable like video editor timeline.",
        "Calendar events (GCal) appear as ghost outlines, one-click to claim.",
        "Gaps highlighted red for retroactive logging.",
        "Blocks color-coded by client for instant visual parsing.",
        "Drag block edges to adjust start/end.",
        "Powers the Daily Rewind feature visually.",
        "Summoned via Cmd+K 'timeline' or G L.",
    ]
    els += draw_notes(px, py, notes)
    return els


def panel_2_1(px, py):
    els = []
    els += draw_panel_container(px, py, "2.1  Daily Rewind (Cmd+R)")
    wx, wy = wf_origin(px, py)

    els.append(rect(wx, wy, 900, 950, stroke=BORDER, fill=PANEL_BG, fill_style="solid"))

    # Modal 900x750 (we use most of our 900 canvas)
    mx, my = wx + 10, wy + 10
    els.append(rect(mx, my, 880, 900, stroke=TITLE, fill=WHITE, fill_style="solid", rounded=True, stroke_width=2))

    # Header
    els.append(text(mx + 24, my + 24, "Daily Rewind  Friday April 7, 2026", size=18, color=TITLE))
    els.append(rect(mx + 700, my + 22, 160, 30, stroke=BORDER, fill=PANEL_BG, fill_style="solid", rounded=True))
    els.append(text(mx + 720, my + 30, "Apr 7, 2026 v", size=12, color=LABEL))

    # Hero text (AI summary)
    els.append(rect(mx + 24, my + 70, 832, 80, stroke=PRIMARY, fill="#e0f2fe", fill_style="solid", rounded=True))
    els.append(text(mx + 40, my + 86, "I drafted your day based on 3 calendar events, 7 GitHub", size=14, color=PRIMARY))
    els.append(text(mx + 40, my + 108, "commits, and 2 existing sessions. Review and approve below.", size=14, color=PRIMARY))

    # Draft list
    dy = my + 170
    els.append(text(mx + 24, dy, "DRAFTED ENTRIES", size=11, color=LABEL))
    dy += 22
    drafts = [
        (C_BLUE, "Acme", "Morning standup", "30m", "9:00-9:30", "from Google Calendar"),
        (C_BLUE, "Acme", "Backend API refactor", "2h 45m", "9:30-12:15", "from GitHub (8 commits)"),
        (C_GRAY, "Lunch", "", "45m", "12:15-1:00", "gap (not billable)"),
        (C_GREEN, "B Co", "Email batch", "40m", "1:00-1:40", "from existing session"),
        (C_BLUE, "Acme", "Stripe webhook debug", "2h 10m", "1:40-3:50", "from GitHub (5 commits)"),
        (C_BLUE, "Acme", "Weekly sync", "45m", "4:00-4:45", "from Google Calendar"),
    ]
    for col, proj, name, dur, tm, src in drafts:
        els.append(rect(mx + 24, dy, 832, 54, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
        # Checkbox
        els.append(rect(mx + 34, dy + 18, 18, 18, stroke=PRIMARY, fill=PRIMARY, fill_style="solid", rounded=True))
        els.append(text(mx + 38, dy + 18, "v", size=12, color=WHITE))
        # Color dot
        els.append(ellipse(mx + 62, dy + 20, 12, 12, stroke=col, fill=col, fill_style="solid"))
        els.append(text(mx + 80, dy + 16, f"{proj}  {name}", size=13, color=TITLE))
        els.append(text(mx + 80, dy + 34, f"{dur}  {tm}", size=11, color=BODY))
        # Source badge
        els.append(rect(mx + 600, dy + 14, 240, 26, stroke=PRIMARY, fill="#e0f2fe", fill_style="solid", rounded=True))
        els.append(text(mx + 612, dy + 20, src, size=10, color=PRIMARY))
        # Edit icon
        els.append(text(mx + 844, dy + 22, "[e]", size=11, color=MUTED))
        dy += 62

    # Summary strip
    dy += 10
    els.append(rect(mx + 24, dy, 832, 50, stroke=SUCCESS, fill="#ecfdf5", fill_style="solid", rounded=True))
    els.append(text(mx + 40, dy + 16, "Total: 7h 05m  $625 billable (6h 10m)", size=14, color=SUCCESS))

    # Buttons
    dy += 66
    els.append(rect(mx + 500, dy, 160, 42, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(mx + 548, dy + 14, "Edit each", size=13, color=LABEL))
    els.append(rect(mx + 680, dy, 180, 42, stroke=PRIMARY, fill=PRIMARY, fill_style="solid", rounded=True))
    els.append(text(mx + 722, dy + 14, "Approve all", size=13, color=WHITE))

    notes = [
        "Pulls signals: Google Calendar, GitHub commits, sessions, energy.",
        "LLM synthesizes signals into drafts with source badges.",
        "Every entry shows source so user trusts the guess.",
        "Uncheck any entry, inline edit, or detailed 'Edit each' flow.",
        "'Approve all' creates entries atomically.",
        "Auto-shown Monday mornings for prior Friday (toggleable).",
        "Requires GCal OAuth + optional GitHub OAuth.",
        "N3 verified white space. Clockk uses desktop agent; nobody does web-only.",
    ]
    els += draw_notes(px, py, notes)
    return els


def panel_2_2(px, py):
    els = []
    els += draw_panel_container(px, py, "2.2  AI Invoice Narrative (Cmd+I)")
    wx, wy = wf_origin(px, py)

    els.append(rect(wx, wy, 900, 950, stroke=BORDER, fill=PANEL_BG, fill_style="solid"))

    mx, my = wx + 10, wy + 10
    els.append(rect(mx, my, 880, 900, stroke=TITLE, fill=WHITE, fill_style="solid", rounded=True, stroke_width=2))

    # Header
    els.append(text(mx + 24, my + 24, "Invoice  Acme  October 2026", size=18, color=TITLE))

    # Client selector row
    els.append(rect(mx + 24, my + 70, 200, 38, stroke=BORDER, fill=PANEL_BG, fill_style="solid", rounded=True))
    els.append(rect(mx + 38, my + 84, 14, 14, stroke=C_BLUE, fill=C_BLUE, fill_style="solid"))
    els.append(text(mx + 58, my + 82, "Acme v", size=13, color=TITLE))
    els.append(rect(mx + 240, my + 70, 280, 38, stroke=BORDER, fill=PANEL_BG, fill_style="solid", rounded=True))
    els.append(text(mx + 256, my + 82, "Oct 1 - Oct 31, 2026", size=13, color=TITLE))

    # AI-drafted invoice lines
    ly = my + 140
    els.append(text(mx + 24, ly, "LINE ITEMS (AI DRAFTED)", size=11, color=LABEL))
    ly += 22

    lines = [
        ("Backend Development", "18h 42m @ $100/hr", "$1,870",
         "Implemented Stripe subscription flow, fixed webhook retry bug, added admin role checks"),
        ("Landing Page Design", "9h 15m @ $100/hr", "$925",
         "Hero section redesign, pricing tier layout, mobile responsive polish"),
        ("Meetings & Sync", "3h 30m @ $100/hr", "$350",
         "Weekly stakeholder syncs (4), sprint planning, launch retrospective"),
    ]
    for title_, meta, amt, desc in lines:
        els.append(rect(mx + 24, ly, 832, 130, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
        els.append(text(mx + 40, ly + 14, title_, size=15, color=TITLE))
        els.append(text(mx + 40, ly + 38, meta, size=12, color=BODY))
        els.append(text(mx + 760, ly + 14, amt, size=16, color=SUCCESS))
        els.append(text(mx + 40, ly + 62, desc[:65], size=11, color=BODY))
        if len(desc) > 65:
            els.append(text(mx + 40, ly + 78, desc[65:130], size=11, color=BODY))
        els.append(text(mx + 40, ly + 102, "Regenerate", size=11, color=PRIMARY))
        ly += 140

    # Divider
    ly += 10
    els.append(line(mx + 24, ly, [[0, 0], [832, 0]], stroke=BORDER, stroke_width=1))
    ly += 16

    # Subtotal
    els.append(text(mx + 600, ly, "Subtotal:", size=13, color=BODY))
    els.append(text(mx + 780, ly, "$3,145", size=13, color=TITLE))
    ly += 24
    els.append(text(mx + 600, ly, "Tax (0%):", size=13, color=BODY))
    els.append(text(mx + 780, ly, "$0", size=13, color=TITLE))
    ly += 26
    els.append(rect(mx + 580, ly, 280, 40, stroke=TITLE, fill="#f1f5f9", fill_style="solid", rounded=True, stroke_width=2))
    els.append(text(mx + 600, ly + 12, "Total:", size=15, color=TITLE))
    els.append(text(mx + 780, ly + 12, "$3,145", size=16, color=SUCCESS))

    # Buttons
    ly += 60
    els.append(rect(mx + 500, ly, 160, 42, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(mx + 544, ly + 14, "Edit lines", size=13, color=LABEL))
    els.append(rect(mx + 680, ly, 180, 42, stroke=PRIMARY, fill=PRIMARY, fill_style="solid", rounded=True))
    els.append(text(mx + 722, ly + 14, "Export PDF", size=13, color=WHITE))

    notes = [
        "LLM reads ALL entries + notes + transcripts for client/date.",
        "Groups by theme (Backend, Design, Meetings), not raw entries.",
        "Edit any line, regenerate one, or all.",
        "PDF via jsPDF (already installed). Simple pro template.",
        "Light invoicing only: PDF + AI narrative. No payment links.",
        "N6 feature. Harvest uses literal names, Laurel.ai $10k+/yr.",
    ]
    els += draw_notes(px, py, notes)
    return els


def panel_2_3(px, py):
    els = []
    els += draw_panel_container(px, py, "2.3  Post-Session Voice Memo")
    wx, wy = wf_origin(px, py)

    # Faint dashboard background
    els.append(rect(wx, wy, 900, 950, stroke=BORDER, fill=PANEL_BG, fill_style="solid"))
    els.append(text(wx + 300, wy + 30, "[faint dashboard background]", size=12, color=MUTED))

    # Toast modal bottom-right 450x320
    mx, my = wx + 420, wy + 600
    els.append(rect(mx, my, 460, 360, stroke=TITLE, fill=WHITE, fill_style="solid", rounded=True, stroke_width=2))

    # Close X
    els.append(text(mx + 430, my + 14, "X", size=14, color=MUTED))

    # Header
    els.append(text(mx + 20, my + 20, "Session complete: Acme  1h 30m", size=14, color=TITLE))

    # Prompt
    els.append(text(mx + 20, my + 50, "What did you accomplish? (optional, 30 sec)", size=12, color=BODY))

    # Big mic button
    cx, cy = mx + 230, my + 150
    els.append(ellipse(cx - 60, cy - 60, 120, 120, stroke=DANGER, fill=WHITE, fill_style="solid", stroke_width=3))
    els.append(ellipse(cx - 40, cy - 40, 80, 80, stroke=DANGER, fill="#fef2f2", fill_style="solid"))
    els.append(text(cx - 20, cy - 10, "MIC", size=16, color=DANGER))

    # State recording
    els.append(text(mx + 90, my + 232, "[recording] 0:18 / 0:30", size=12, color=DANGER))

    # Waveform mini
    wy2 = my + 260
    for i, h in enumerate([20, 30, 50, 40, 60, 30, 50, 40, 30, 50, 25, 35, 45, 30, 40]):
        els.append(rect(mx + 130 + i * 14, wy2 + (60 - h) / 2, 8, h, stroke=DANGER, fill=DANGER, fill_style="solid"))

    # Transcript preview
    els.append(rect(mx + 20, my + 320, 420, 24, stroke=BORDER, fill=PANEL_BG, fill_style="solid", rounded=True))
    els.append(text(mx + 28, my + 326, "Hold to record  Tap skip to dismiss", size=10, color=MUTED))

    # Second modal state (shown above)
    mx2, my2 = wx + 200, wy + 200
    els.append(rect(mx2, my2, 500, 320, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True, stroke_width=2))
    els.append(text(mx2 + 20, my2 + 20, "STATE 3: TRANSCRIBED PREVIEW", size=11, color=LABEL))
    els.append(rect(mx2 + 20, my2 + 50, 460, 160, stroke=BORDER, fill=PANEL_BG, fill_style="solid", rounded=True))
    els.append(text(mx2 + 32, my2 + 66, '"Explored 3 hero layouts, settled on', size=13, color=TITLE))
    els.append(text(mx2 + 32, my2 + 90, 'split-screen with CTA right, need Ali\'s', size=13, color=TITLE))
    els.append(text(mx2 + 32, my2 + 114, 'feedback"', size=13, color=TITLE))
    # Buttons
    els.append(rect(mx2 + 240, my2 + 240, 110, 36, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(mx2 + 258, my2 + 252, "Re-record", size=12, color=LABEL))
    els.append(rect(mx2 + 360, my2 + 240, 120, 36, stroke=PRIMARY, fill=PRIMARY, fill_style="solid", rounded=True))
    els.append(text(mx2 + 404, my2 + 252, "Save", size=13, color=WHITE))

    notes = [
        "30-second max recording.",
        "Whisper transcribes; saved to voice_transcript (searchable).",
        "Audio also in Supabase Storage for replay.",
        "Auto-dismiss after 10s inactivity (no nagging).",
        "Only for sessions >= 15 min (configurable).",
        "Can be disabled entirely in settings.",
        "GOLD for AI Invoice — memos become line descriptions.",
        "N2 verified white space.",
    ]
    els += draw_notes(px, py, notes)
    return els


def panel_2_4(px, py):
    els = []
    els += draw_panel_container(px, py, "2.4  Energy Check-in (morning)")
    wx, wy = wf_origin(px, py)

    els.append(rect(wx, wy, 900, 950, stroke=BORDER, fill=PANEL_BG, fill_style="solid"))

    # Modal 500x450 with gradient background
    mx, my = wx + 200, wy + 200
    els.append(rect(mx, my, 500, 500, stroke=PRIMARY, fill="#e0f2fe", fill_style="solid", rounded=True, stroke_width=2))

    # Greeting
    els.append(text(mx + 140, my + 50, "Good morning, Ali! [sun]", size=22, color=TITLE))
    els.append(text(mx + 140, my + 96, "How's your energy today?", size=16, color=BODY))

    # Emoji rating row
    labels = [("sleep", "1"), ("meh", "2"), ("ok", "3"), ("good", "4"), ("fire", "5")]
    by = my + 160
    for i, (emoji, num) in enumerate(labels):
        bx = mx + 60 + i * 80
        els.append(ellipse(bx, by, 60, 60, stroke=PRIMARY, fill=WHITE, fill_style="solid", stroke_width=2))
        els.append(text(bx + 14, by + 14, emoji, size=10, color=TITLE))
        els.append(text(bx + 26, by + 30, num, size=16, color=TITLE))

    # Text input
    els.append(text(mx + 30, my + 260, "One word for today? (optional)", size=12, color=BODY))
    els.append(rect(mx + 30, my + 284, 440, 40, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(mx + 44, my + 298, "_", size=14, color=MUTED))

    # Button
    els.append(rect(mx + 30, my + 360, 440, 48, stroke=PRIMARY, fill=PRIMARY, fill_style="solid", rounded=True))
    els.append(text(mx + 210, my + 374, "Start day", size=16, color=WHITE))

    # Skip link
    els.append(text(mx + 230, my + 430, "skip", size=11, color=MUTED))

    notes = [
        "Shows ONCE per day on first visit after 6am.",
        "Toggleable in Settings.",
        "Saved to daily_mood: user_id, date, energy 1-5, note.",
        "After 14 days, Insights surfaces correlations:",
        "  'Your best deep-work days are 4+'",
        "  'Best window: Tue/Wed 9-11am'",
        "  'You bill 40% more on high-energy days'",
        "Simple — 10 seconds max.",
        "N4 verified white space.",
    ]
    els += draw_notes(px, py, notes)
    return els


def panel_2_5(px, py):
    els = []
    els += draw_panel_container(px, py, "2.5  Focus Mode (Cmd+Shift+F)")
    wx, wy = wf_origin(px, py)

    # Full-screen dark bg
    els.append(rect(wx, wy, 900, 900, stroke=TITLE, fill="#0f172a", fill_style="solid"))

    # Project name center
    els.append(text(wx + 280, wy + 220, "Acme  Landing hero", size=24, color="#94a3b8"))

    # Huge timer
    els.append(text(wx + 220, wy + 280, "1:23:45", size=96, color=WHITE))

    # Earnings
    els.append(text(wx + 330, wy + 440, "$138 earned this session", size=16, color=SUCCESS))

    # Hints bottom
    els.append(text(wx + 260, wy + 820, "Space to stop  Esc to exit focus", size=12, color="#475569"))

    # Ambient sound icon
    els.append(ellipse(wx + 820, wy + 800, 32, 32, stroke="#94a3b8", fill="transparent"))
    els.append(text(wx + 828, wy + 808, "Mus", size=10, color="#94a3b8"))

    # Break timer indicator top-right
    els.append(rect(wx + 700, wy + 30, 180, 36, stroke="#334155", fill="#1e293b", fill_style="solid", rounded=True))
    els.append(text(wx + 714, wy + 42, "next break: 26 min", size=11, color="#94a3b8"))

    notes = [
        "Cmd+Shift+F enters focus on running entry.",
        "Esc exits back to dashboard.",
        "Hides ALL UI chrome and suppresses notifications.",
        "Tab title updates with elapsed time.",
        "Ambient sound: rain, cafe, lo-fi, silence.",
        "Break nudges 25/50/90 min, configurable, soft pulse.",
        "Dark only — intentionally no light theme.",
        "T2.5 nice-to-have differentiator.",
    ]
    els += draw_notes(px, py, notes)
    return els


def panel_3_1(px, py):
    els = []
    els += draw_panel_container(px, py, "3.1  Projects & Clients")
    wx, wy = wf_origin(px, py)

    # Title
    els.append(text(wx, wy, "Projects & Clients", size=20, color=TITLE))

    # 3-column layout
    # LEFT: clients list (250)
    lx, ly = wx, wy + 40
    els.append(rect(lx, ly, 250, 700, stroke=BORDER, fill=PANEL_BG, fill_style="solid", rounded=True))
    els.append(rect(lx + 10, ly + 10, 230, 34, stroke=PRIMARY, fill=PRIMARY, fill_style="solid", rounded=True))
    els.append(text(lx + 80, ly + 20, "+ New client", size=13, color=WHITE))

    clients = [
        (C_BLUE, "Acme", "4 projects  active today", True),
        (C_GREEN, "B Co", "2 projects  3 days ago", False),
        (C_PURPLE, "C Corp", "1 project  2 weeks ago", False),
        (C_GRAY, "Personal", "3 projects  no client", False),
    ]
    cy = ly + 60
    for col, nm, meta, sel in clients:
        if sel:
            els.append(rect(lx + 6, cy, 238, 56, stroke=PRIMARY, fill="#e0f2fe", fill_style="solid", rounded=True, stroke_width=2))
        else:
            els.append(rect(lx + 6, cy, 238, 56, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
        els.append(ellipse(lx + 16, cy + 20, 14, 14, stroke=col, fill=col, fill_style="solid"))
        els.append(text(lx + 36, cy + 12, nm, size=14, color=TITLE))
        els.append(text(lx + 36, cy + 32, meta, size=10, color=MUTED))
        cy += 64

    # MIDDLE: projects
    mx, my = lx + 270, ly
    els.append(rect(mx, my, 360, 700, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(mx + 16, my + 14, "Projects for Acme", size=15, color=TITLE))
    els.append(rect(mx + 16, my + 46, 100, 26, stroke=BORDER, fill=PANEL_BG, fill_style="solid", rounded=True))
    els.append(text(mx + 28, my + 52, "Sort v", size=11, color=LABEL))
    els.append(rect(mx + 220, my + 46, 130, 26, stroke=PRIMARY, fill=PRIMARY, fill_style="solid", rounded=True))
    els.append(text(mx + 240, my + 52, "+ New project", size=11, color=WHITE))

    projects = [
        ("Landing hero", "$100/hr", "BILLABLE", "12h logged", "active", True),
        ("Stripe integration", "$100/hr", "BILLABLE", "18h logged", "", False),
        ("Onboarding flow", "$100/hr", "BILLABLE", "6h logged", "", False),
        ("Weekly syncs", "-", "NON-BILL", "3h logged", "", False),
    ]
    py2 = my + 84
    for nm, rate, bill, hrs, st, sel in projects:
        if sel:
            els.append(rect(mx + 10, py2, 340, 70, stroke=PRIMARY, fill="#e0f2fe", fill_style="solid", rounded=True, stroke_width=2))
        else:
            els.append(rect(mx + 10, py2, 340, 70, stroke=BORDER, fill=PANEL_BG, fill_style="solid", rounded=True))
        els.append(text(mx + 20, py2 + 10, nm, size=14, color=TITLE))
        els.append(text(mx + 20, py2 + 34, f"{rate}  {hrs}", size=11, color=BODY))
        bill_col = SUCCESS if bill == "BILLABLE" else MUTED
        els.append(rect(mx + 250, py2 + 8, 80, 18, stroke=bill_col, fill="transparent", rounded=True))
        els.append(text(mx + 260, py2 + 10, bill, size=9, color=bill_col))
        if st:
            els.append(text(mx + 20, py2 + 52, st, size=10, color=SUCCESS))
        py2 += 78

    # RIGHT: project detail
    rx = mx + 380
    els.append(rect(rx, my, 250, 700, stroke=BORDER, fill=PANEL_BG, fill_style="solid", rounded=True))
    els.append(text(rx + 16, my + 14, "Landing hero", size=16, color=TITLE))
    els.append(line(rx + 16, my + 40, [[0, 0], [220, 0]], stroke=BORDER, stroke_width=1))

    fields = [
        ("Rate:", "$100/hr"),
        ("Est. time:", "10h"),
        ("Life area:", "Work v"),
        ("Tags:", "#frontend #design"),
        ("Color:", "[blue]"),
        ("Created:", "Mar 28 2026"),
        ("Last activity:", "2 hours ago"),
        ("Logged:", "12h / 10h (120%)"),
        ("   ", "2h over"),
    ]
    fy = my + 50
    for k, v in fields:
        els.append(text(rx + 16, fy, k, size=11, color=LABEL))
        els.append(text(rx + 100, fy, v, size=11, color=TITLE))
        fy += 22

    els.append(text(rx + 16, fy + 8, "Notes:", size=11, color=LABEL))
    els.append(rect(rx + 16, fy + 30, 220, 80, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))

    # Archive button
    els.append(rect(rx + 16, my + 640, 220, 38, stroke=DANGER, fill="#fef2f2", fill_style="solid", rounded=True))
    els.append(text(rx + 110, my + 650, "Archive", size=13, color=DANGER))

    notes = [
        "CRUD for projects and clients.",
        "Client: name, color, default rate, archived.",
        "Project: name, client_id, rate override, tags, notes, archived.",
        "Archive = soft delete, preserves history.",
        "Search bar fuzzy find across clients + projects.",
        "'View entries' link jumps to filtered Today.",
        "T1.1 feature.",
    ]
    els += draw_notes(px, py, notes)
    return els


def panel_3_2(px, py):
    els = []
    els += draw_panel_container(px, py, "3.2  Tag Management")
    wx, wy = wf_origin(px, py)

    els.append(text(wx, wy, "Tags", size=22, color=TITLE))
    els.append(rect(wx + 700, wy, 180, 38, stroke=PRIMARY, fill=PRIMARY, fill_style="solid", rounded=True))
    els.append(text(wx + 760, wy + 10, "+ New tag", size=13, color=WHITE))

    # Grid of tag chips
    tags = [
        ("#backend", "45 entries", C_BLUE),
        ("#frontend", "32 entries", C_GREEN),
        ("#meetings", "18 entries", C_PURPLE),
        ("#deep-work", "28 entries", "#eab308"),
        ("#research", "12 entries", DANGER),
        ("#design", "15 entries", "#f97316"),
    ]
    gy = wy + 70
    for i, (nm, cnt, col) in enumerate(tags):
        col_i = i % 3
        row_i = i // 3
        cx = wx + col_i * 300
        cy = gy + row_i * 110
        els.append(rect(cx, cy, 280, 90, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
        els.append(rect(cx + 16, cy + 16, 130, 32, stroke=col, fill=col, fill_style="solid", rounded=True))
        els.append(text(cx + 26, cy + 22, nm, size=14, color=WHITE))
        els.append(text(cx + 16, cy + 56, cnt, size=12, color=BODY))
        els.append(text(cx + 200, cy + 56, "[edit]  [del]", size=10, color=MUTED))

    # Merge dialog (secondary modal)
    mdy = wy + 320
    els.append(rect(wx + 120, mdy, 660, 260, stroke=TITLE, fill=WHITE, fill_style="solid", rounded=True, stroke_width=2))
    els.append(text(wx + 144, mdy + 20, "Merge tags", size=18, color=TITLE))
    els.append(text(wx + 144, mdy + 56, "Select tags to combine:", size=12, color=BODY))
    # Checkboxes
    checks = ["#backend", "#back-end", "#backend-dev"]
    for i, c in enumerate(checks):
        els.append(rect(wx + 160, mdy + 84 + i * 30, 18, 18, stroke=PRIMARY, fill=PRIMARY if i < 2 else "transparent", fill_style="solid", rounded=True))
        if i < 2:
            els.append(text(wx + 164, mdy + 86 + i * 30, "v", size=10, color=WHITE))
        els.append(text(wx + 188, mdy + 86 + i * 30, c, size=13, color=TITLE))

    els.append(text(wx + 144, mdy + 182, "Merge into:", size=12, color=BODY))
    els.append(rect(wx + 250, mdy + 178, 280, 30, stroke=BORDER, fill=PANEL_BG, fill_style="solid", rounded=True))
    els.append(text(wx + 264, mdy + 186, "#backend", size=12, color=TITLE))
    els.append(rect(wx + 560, mdy + 206, 100, 36, stroke=PRIMARY, fill=PRIMARY, fill_style="solid", rounded=True))
    els.append(text(wx + 588, mdy + 216, "Merge", size=13, color=WHITE))

    # AI suggested clusters
    asy = wy + 610
    els.append(rect(wx, asy, 880, 170, stroke=PRIMARY, fill="#e0f2fe", fill_style="solid", rounded=True))
    els.append(text(wx + 16, asy + 14, "AI-SUGGESTED CLUSTERS (N7)", size=12, color=PRIMARY))
    els.append(text(wx + 16, asy + 40, "PhynxTimer found 8 entries that look like", size=13, color=TITLE))
    els.append(text(wx + 16, asy + 58, "'Stripe webhook work'", size=13, color=TITLE))
    els.append(rect(wx + 16, asy + 90, 130, 36, stroke=SUCCESS, fill=SUCCESS, fill_style="solid", rounded=True))
    els.append(text(wx + 56, asy + 100, "Accept", size=13, color=WHITE))
    els.append(rect(wx + 160, asy + 90, 130, 36, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 198, asy + 100, "Rename", size=13, color=LABEL))
    els.append(rect(wx + 304, asy + 90, 130, 36, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 346, asy + 100, "Reject", size=13, color=LABEL))
    els.append(text(wx + 16, asy + 140, "Virtual tags: users never have to manually tag", size=11, color=BODY))

    notes = [
        "Replaces dead TEXT[] schema with tags table + entry_tags join.",
        "Each tag: color + name.",
        "Rename propagates atomically.",
        "Merge combines two tags (de-dup typos).",
        "Entries can have multiple tags.",
        "Fast tag input: # autocompletes.",
        "AI clusters = management UI for N7 Task Clustering.",
        "Virtual tags for analytics without manual tagging.",
        "T1.5 feature.",
    ]
    els += draw_notes(px, py, notes)
    return els


def panel_3_3(px, py):
    els = []
    els += draw_panel_container(px, py, "3.3  Search / Find (Cmd+F)")
    wx, wy = wf_origin(px, py)

    els.append(rect(wx, wy, 900, 950, stroke=BORDER, fill=PANEL_BG, fill_style="solid"))

    mx, my = wx + 50, wy + 60
    els.append(rect(mx, my, 800, 820, stroke=TITLE, fill=WHITE, fill_style="solid", rounded=True, stroke_width=2))

    # Search input
    els.append(rect(mx + 20, my + 20, 760, 52, stroke=PRIMARY, fill=WHITE, fill_style="solid", rounded=True, stroke_width=2))
    els.append(text(mx + 34, my + 36, "Q", size=16, color=PRIMARY))
    els.append(text(mx + 60, my + 36, '"stripe webhook"', size=16, color=TITLE))

    # Filter bar
    fy = my + 90
    filters = ["Client v", "Date v", "Billable v", "Tag v"]
    fx = mx + 20
    for f in filters:
        els.append(rect(fx, fy, 110, 32, stroke=BORDER, fill=PANEL_BG, fill_style="solid", rounded=True))
        els.append(text(fx + 14, fy + 10, f, size=11, color=LABEL))
        fx += 120

    # Results
    ry = fy + 60
    els.append(text(mx + 20, ry, "RESULTS (ranked by relevance)", size=11, color=LABEL))
    ry += 22

    results = [
        (C_BLUE, "Acme  Stripe webhook fix", "Mar 28, 2026  2h 15m  $225",
         '"...fixed the retry logic for the webhook', "endpoint and added idempotency keys..."),
        (C_BLUE, "Acme  Stripe subscription setup", "Feb 14, 2026  3h 40m  $370",
         '"Initial Stripe integration, checkout', 'webhook wiring..."'),
        (C_BLUE, "Acme  Stripe webhook debug", "Apr 7, 2026  2h 10m  $217",
         '"debugging the stripe webhook', 'signature validation..."'),
    ]
    for col, title_, meta, excerpt1, excerpt2 in results:
        els.append(rect(mx + 20, ry, 760, 140, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
        els.append(ellipse(mx + 34, ry + 18, 12, 12, stroke=col, fill=col, fill_style="solid"))
        els.append(text(mx + 54, ry + 14, title_, size=14, color=TITLE))
        els.append(text(mx + 54, ry + 38, meta, size=11, color=BODY))
        # Excerpt box
        els.append(rect(mx + 34, ry + 62, 720, 62, stroke=BORDER, fill="#fef9c3", fill_style="solid", rounded=True))
        els.append(text(mx + 46, ry + 74, excerpt1, size=11, color=TITLE))
        els.append(text(mx + 46, ry + 92, excerpt2, size=11, color=TITLE))
        ry += 148

    # Footer
    els.append(line(mx + 20, my + 770, [[0, 0], [760, 0]], stroke=BORDER, stroke_width=1))
    els.append(text(mx + 20, my + 782, "12 results  ^v navigate   jump to entry", size=11, color=MUTED))

    notes = [
        "Full-text search: entries, notes, voice transcripts, projects.",
        "Filters: date range, client, tag, billable status.",
        "Voice match shows highlighted transcript excerpt.",
        "Click result -> jumps to entry (scrolls + flashes).",
        "PAYOFF for voice memos — find things from weeks ago.",
        "Postgres tsvector for performance.",
        "T1.9 feature — search exists but PhynxTimer includes voice.",
    ]
    els += draw_notes(px, py, notes)
    return els


def panel_3_4(px, py):
    els = []
    els += draw_panel_container(px, py, "3.4  Insights (Overview tab)")
    wx, wy = wf_origin(px, py)

    # Header with tabs
    els.append(text(wx, wy, "Insights", size=22, color=TITLE))
    tab_y = wy + 38
    tabs = ["Overview", "Projects", "Patterns", "Life Balance", "Year view"]
    tx = wx
    for i, t in enumerate(tabs):
        w = 120
        if i == 0:
            els.append(rect(tx, tab_y, w, 32, stroke=PRIMARY, fill=PRIMARY, fill_style="solid", rounded=True))
            els.append(text(tx + 30, tab_y + 10, t, size=12, color=WHITE))
        else:
            els.append(text(tx + 10, tab_y + 10, t, size=12, color=MUTED))
        tx += w

    # Sub-header
    sy = tab_y + 50
    els.append(rect(wx, sy, 200, 32, stroke=BORDER, fill=PANEL_BG, fill_style="solid", rounded=True))
    els.append(text(wx + 14, sy + 10, "Last 30 days v", size=11, color=LABEL))
    els.append(rect(wx + 220, sy, 200, 32, stroke=BORDER, fill=PANEL_BG, fill_style="solid", rounded=True))
    els.append(text(wx + 234, sy + 10, "[x] vs previous period", size=11, color=LABEL))
    els.append(rect(wx + 800, sy, 100, 32, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 824, sy + 10, "Export CSV", size=11, color=LABEL))

    # Row 1: 6 KPI cards
    k_y = sy + 50
    kpis = [
        ("Total", "127h 45m", "+12%"),
        ("Billable", "98h 12m", "+$1,620"),
        ("Deep work", "61h 20m", "+6%"),
        ("Avg session", "54m", "+8m"),
        ("Switches/day", "7.2", "-2.1"),
        ("Streak", "14 days", "[fire]"),
    ]
    kw = 140
    for i, (lbl, val, delta) in enumerate(kpis):
        kx = wx + i * (kw + 8)
        els.append(rect(kx, k_y, kw, 70, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
        els.append(text(kx + 10, k_y + 8, lbl, size=10, color=MUTED))
        els.append(text(kx + 10, k_y + 24, val, size=13, color=TITLE))
        els.append(text(kx + 10, k_y + 48, delta, size=10, color=SUCCESS))

    # Row 2: Donut
    dy = k_y + 90
    els.append(rect(wx, dy, 440, 180, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 16, dy + 10, "TIME ALLOCATION", size=11, color=LABEL))
    # Donut
    els.append(ellipse(wx + 40, dy + 36, 130, 130, stroke=TITLE, fill="#f1f5f9", fill_style="solid", stroke_width=2))
    els.append(ellipse(wx + 70, dy + 66, 70, 70, stroke=WHITE, fill=WHITE, fill_style="solid"))
    # Legend
    legend = [
        ("Work", C_BLUE, "51%"),
        ("Personal", C_GRAY, "14%"),
        ("Health", SUCCESS, "9%"),
        ("Learning", C_PURPLE, "11%"),
    ]
    ly = dy + 40
    for lbl, col, pct in legend:
        els.append(rect(wx + 200, ly, 12, 12, stroke=col, fill=col, fill_style="solid"))
        els.append(text(wx + 220, ly, lbl, size=11, color=TITLE))
        els.append(text(wx + 320, ly, pct, size=11, color=BODY))
        ly += 22

    # Row 2 right: Hours by project
    els.append(rect(wx + 460, dy, 440, 180, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 476, dy + 10, "HOURS BY PROJECT", size=11, color=LABEL))
    projects = [("Acme", 120), ("B Co", 80), ("Personal", 50), ("C Corp", 30), ("Learning", 20)]
    by2 = dy + 36
    for nm, w in projects:
        els.append(text(wx + 476, by2, nm, size=11, color=TITLE))
        els.append(rect(wx + 570, by2, w * 2, 16, stroke=PRIMARY, fill=PRIMARY, fill_style="solid", rounded=True))
        by2 += 26

    # Row 3: Sparkline strip
    sy3 = dy + 200
    els.append(rect(wx, sy3, 900, 120, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 16, sy3 + 10, "WEEK-OVER-WEEK (4 weeks, top 5 projects)", size=11, color=LABEL))
    # Sparklines
    for i in range(5):
        pts = [[0, 0], [60, -10 + i * 3], [120, -20 + i * 2], [180, -5 - i], [240, -25 - i * 2]]
        els.append(line(wx + 40, sy3 + 80 - i * 12,
                        [[p[0], p[1]] for p in pts],
                        stroke=[C_BLUE, C_GREEN, C_PURPLE, "#eab308", DANGER][i],
                        stroke_width=2, rough=0))
    els.append(line(wx + 320, sy3 + 40, [[0, 0], [0, 60]], stroke=BORDER, stroke_width=1))
    els.append(text(wx + 340, sy3 + 40, "Acme   ....", size=10, color=C_BLUE))
    els.append(text(wx + 340, sy3 + 56, "B Co   ....", size=10, color=C_GREEN))

    # Row 5: AI Insights card
    ay = sy3 + 140
    els.append(rect(wx, ay, 900, 170, stroke=PRIMARY, fill="#e0f2fe", fill_style="solid", rounded=True, stroke_width=2))
    els.append(text(wx + 16, ay + 14, "AI INSIGHTS", size=12, color=PRIMARY))
    insights = [
        "Your deep-work window is strongest Tue/Wed 9-11am — 2.3x more billable",
        "Backend tasks took avg 2h 15m this month, 18% faster than last",
        "You haven't logged on Acme in 6 days — stalled?",
        "Design work has highest variance — estimate with +50% buffer",
    ]
    iy = ay + 38
    for ins in insights:
        els.append(text(wx + 30, iy, "> " + ins[:70], size=11, color=TITLE))
        iy += 26

    # Row 6: Billable split bar
    by3 = ay + 190
    els.append(text(wx, by3, "BILLABLE VS NON-BILLABLE", size=11, color=LABEL))
    els.append(rect(wx, by3 + 22, 690, 32, stroke=SUCCESS, fill=SUCCESS, fill_style="solid", rounded=True))
    els.append(text(wx + 20, by3 + 30, "Billable 77% (98h)", size=12, color=WHITE))
    els.append(rect(wx + 690, by3 + 22, 210, 32, stroke=MUTED, fill=MUTED, fill_style="solid", rounded=True))
    els.append(text(wx + 710, by3 + 30, "Non 23% (29h)", size=11, color=WHITE))

    notes = [
        "Replaces Analytics page with 5 FOCUSED tabs.",
        "No 3D, radar, network, treemap kitchen sink.",
        "Compare toggle shows delta on every metric.",
        "KPIs for knowledge-worker self-understanding, not billing.",
        "Deep work = sessions >=45m uninterrupted.",
        "Context switches = project changes per day.",
        "Streak counter = consecutive days tracked.",
        "AI insights use LLM + actual data.",
        "Tier 2+3 hybrid. WHY users stay.",
    ]
    els += draw_notes(px, py, notes)
    return els


def panel_3_4b(px, py):
    els = []
    els += draw_panel_container(px, py, "3.4b  Insights - Projects tab")
    wx, wy = wf_origin(px, py)

    # Tab strip
    els.append(text(wx, wy, "Insights", size=22, color=TITLE))
    tab_y = wy + 38
    tabs = ["Overview", "Projects", "Patterns", "Life Balance", "Year view"]
    tx = wx
    for i, t in enumerate(tabs):
        w = 120
        if i == 1:
            els.append(rect(tx, tab_y, w, 32, stroke=PRIMARY, fill=PRIMARY, fill_style="solid", rounded=True))
            els.append(text(tx + 34, tab_y + 10, t, size=12, color=WHITE))
        else:
            els.append(text(tx + 10, tab_y + 10, t, size=12, color=MUTED))
        tx += w

    # Project selector
    sy = tab_y + 50
    els.append(rect(wx, sy, 200, 38, stroke=BORDER, fill=PANEL_BG, fill_style="solid", rounded=True))
    els.append(rect(wx + 12, sy + 12, 14, 14, stroke=C_BLUE, fill=C_BLUE, fill_style="solid"))
    els.append(text(wx + 32, sy + 12, "Acme v", size=13, color=TITLE))

    # Header card
    hy = sy + 56
    els.append(rect(wx, hy, 900, 90, stroke=BORDER, fill=PANEL_BG, fill_style="solid", rounded=True))
    els.append(text(wx + 16, hy + 14, "Acme  /  Landing hero project", size=16, color=TITLE))
    els.append(text(wx + 16, hy + 42, "Total: 127h 45m  Sessions: 48  Avg: 2h 40m", size=12, color=BODY))
    els.append(text(wx + 16, hy + 62, "Billable: $12,775  Effective rate: $100/hr", size=12, color=SUCCESS))

    # Row 1: Trend chart
    ty = hy + 104
    els.append(rect(wx, ty, 900, 140, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 16, ty + 10, "TIME PER WEEK ON ACME (12 weeks)", size=11, color=LABEL))
    # Line chart
    pts = [(0, 90), (70, 60), (140, 80), (210, 40), (280, 50), (350, 30), (420, 70), (490, 45), (560, 35), (630, 55), (700, 25), (780, 40)]
    line_pts = [[p[0], p[1]] for p in pts]
    els.append(line(wx + 40, ty + 36, line_pts, stroke=PRIMARY, stroke_width=2, rough=0))

    # Row 2 (2-col)
    r2y = ty + 160
    els.append(rect(wx, r2y, 440, 180, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 16, r2y + 10, "SESSION DURATION DISTRIBUTION", size=11, color=LABEL))
    bins = [("<30m", 40), ("30-60m", 80), ("1-2h", 140), ("2-4h", 160), ("4h+", 70)]
    bx = wx + 40
    for lbl, h in bins:
        els.append(rect(bx, r2y + 160 - h / 2, 60, h, stroke=PRIMARY, fill="#bae6fd", fill_style="solid"))
        els.append(text(bx + 14, r2y + 164, lbl, size=9, color=MUTED))
        bx += 76

    els.append(rect(wx + 460, r2y, 440, 180, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 476, r2y + 10, "TIME OF DAY (24h radial)", size=11, color=LABEL))
    # Polar/clock visual
    cx, cy = wx + 680, r2y + 100
    els.append(ellipse(cx - 60, cy - 60, 120, 120, stroke=TITLE, fill=PANEL_BG, fill_style="solid"))
    # Hour ticks - just a few
    for h_label, ang in [("9", -80), ("12", -20), ("3", 30), ("6", 80)]:
        els.append(text(cx + ang - 4, cy + ang * 0.3, h_label, size=10, color=BODY))
    # Heat zones
    els.append(ellipse(cx - 20, cy - 50, 30, 30, stroke=DANGER, fill="#fecaca", fill_style="solid"))
    els.append(text(wx + 820, r2y + 36, "Peak:", size=10, color=MUTED))
    els.append(text(wx + 820, r2y + 52, "9-11am", size=11, color=TITLE))
    els.append(text(wx + 820, r2y + 72, "2-4pm", size=11, color=TITLE))

    # Row 3: Task breakdown
    r3y = r2y + 200
    els.append(rect(wx, r3y, 900, 160, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 16, r3y + 10, "TASK BREAKDOWN (by tag)", size=11, color=LABEL))
    tasks = [
        ("#backend", "45h", "avg 2h 15m", "↓18% faster", SUCCESS),
        ("#frontend", "32h", "avg 1h 50m", "-> stable", BODY),
        ("#meetings", "12h", "avg 45m", "↑12% more", DANGER),
        ("#debugging", "18h", "avg 1h 20m", "↓22% faster", SUCCESS),
        ("#planning", "8h", "avg 35m", "-", MUTED),
    ]
    ty3 = r3y + 30
    for tag, hrs, avg, trend, col in tasks:
        els.append(text(wx + 20, ty3, tag, size=12, color=C_BLUE))
        els.append(text(wx + 160, ty3, hrs, size=12, color=TITLE))
        els.append(text(wx + 240, ty3, avg, size=11, color=BODY))
        els.append(text(wx + 400, ty3, trend, size=11, color=col))
        ty3 += 22

    # Row 4: Efficiency
    r4y = r3y + 180
    els.append(rect(wx, r4y, 900, 120, stroke=SUCCESS, fill="#ecfdf5", fill_style="solid", rounded=True))
    els.append(text(wx + 16, r4y + 12, "EFFICIENCY", size=11, color=SUCCESS))
    els.append(text(wx + 16, r4y + 34, "Estimated 120h, logged 127h — 6% over estimate", size=12, color=TITLE))
    els.append(text(wx + 16, r4y + 56, "Longest sessions: 4h 45m, 4h 20m, 3h 50m", size=11, color=BODY))
    els.append(text(wx + 16, r4y + 78, "Backend avg: 2h 45m -> 2h 15m over 3 months", size=11, color=BODY))

    notes = [
        "The 'how long do things take me' panel.",
        "Task-type breakdown via tags — unique to PhynxTimer.",
        "Trend arrows show faster/slower on task types over time.",
        "Distribution reveals deep work vs fragmented.",
        "Efficiency card vs user estimates (T2.2 goals).",
        "Money chart — satisfying for freelancers.",
        "Sticky retention hook. 'Am I improving?'",
        "Tier 2+ differentiator.",
    ]
    els += draw_notes(px, py, notes)
    return els


def panel_3_4c(px, py):
    els = []
    els += draw_panel_container(px, py, "3.4c  Insights - Patterns tab")
    wx, wy = wf_origin(px, py)

    # Tabs
    els.append(text(wx, wy, "Insights", size=22, color=TITLE))
    tab_y = wy + 38
    tabs = ["Overview", "Projects", "Patterns", "Life Balance", "Year view"]
    tx = wx
    for i, t in enumerate(tabs):
        w = 120
        if i == 2:
            els.append(rect(tx, tab_y, w, 32, stroke=PRIMARY, fill=PRIMARY, fill_style="solid", rounded=True))
            els.append(text(tx + 34, tab_y + 10, t, size=12, color=WHITE))
        else:
            els.append(text(tx + 10, tab_y + 10, t, size=12, color=MUTED))
        tx += w

    # Row 1: 4 efficiency KPIs
    ky = tab_y + 60
    kpis = [
        ("Deep work ratio", "48%"),
        ("Focus score", "7.3/10"),
        ("Best day", "Wed Apr 8"),
        ("Interrupt rate", "7.2/day  -22%"),
    ]
    kw = 215
    for i, (lbl, val) in enumerate(kpis):
        kx = wx + i * (kw + 10)
        els.append(rect(kx, ky, kw, 70, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
        els.append(text(kx + 12, ky + 10, lbl, size=10, color=MUTED))
        els.append(text(kx + 12, ky + 32, val, size=14, color=TITLE))

    # Row 2: Heatmap 7 days x 24 hours
    hy = ky + 90
    els.append(rect(wx, hy, 900, 220, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 16, hy + 10, "TIME-OF-DAY HEATMAP (7 days x 24 hours)", size=11, color=LABEL))
    # Toggle
    els.append(rect(wx + 540, hy + 8, 160, 22, stroke=PRIMARY, fill=PRIMARY, fill_style="solid", rounded=True))
    els.append(text(wx + 548, hy + 13, "deep work only", size=10, color=WHITE))
    els.append(rect(wx + 708, hy + 8, 80, 22, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 718, hy + 13, "all", size=10, color=LABEL))
    els.append(rect(wx + 796, hy + 8, 90, 22, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 808, hy + 13, "billable", size=10, color=LABEL))

    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    cell_w = 32
    cell_h = 20
    grid_x = wx + 60
    grid_y = hy + 46
    import hashlib as _h
    for di, d in enumerate(days):
        els.append(text(wx + 20, grid_y + di * (cell_h + 4) + 4, d, size=10, color=BODY))
        for h in range(24):
            # Intensity based on pattern (Tue/Wed 9-11 hottest)
            intensity = 20
            if di in (1, 2) and 9 <= h <= 11:
                intensity = 255
            elif di in (1, 2) and 13 <= h <= 16:
                intensity = 180
            elif 9 <= h <= 17 and di < 5:
                intensity = 80
            # Map to color
            r = 240 - int(intensity * 0.5)
            g = 240 - int(intensity * 0.2)
            b = 255
            col = f"#{r:02x}{g:02x}{b:02x}"
            els.append(rect(grid_x + h * (cell_w - 6), grid_y + di * (cell_h + 4), cell_w - 8, cell_h,
                            stroke=BORDER, fill=col, fill_style="solid", rough=0))

    # Annotation
    els.append(text(wx + 580, hy + 180, "Peak: Tue/Wed 9-11am", size=11, color=DANGER))

    # Row 3: two panels side by side
    r3y = hy + 240
    els.append(rect(wx, r3y, 440, 170, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 16, r3y + 10, "SESSION LENGTH TRENDS (30 days)", size=11, color=LABEL))
    # Line
    pts = [[0, 50], [60, 45], [120, 40], [180, 38], [240, 30], [300, 28], [360, 25]]
    els.append(line(wx + 40, r3y + 90, pts, stroke=SUCCESS, stroke_width=2, rough=0))
    els.append(text(wx + 20, r3y + 140, "Sessions got 12m longer after removing Slack", size=10, color=MUTED))

    els.append(rect(wx + 460, r3y, 440, 170, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 476, r3y + 10, "CONTEXT SWITCHES / DAY", size=11, color=LABEL))
    pts = [[0, 20], [50, 25], [100, 30], [150, 15], [200, 22], [250, 18], [300, 12]]
    els.append(line(wx + 500, r3y + 80, pts, stroke=C_PURPLE, stroke_width=2, rough=0))
    # Goal line
    els.append(line(wx + 500, r3y + 70, [[0, 0], [320, 0]], stroke=DANGER, stroke_width=1, stroke_style="dashed"))
    els.append(text(wx + 820, r3y + 68, "goal", size=10, color=DANGER))

    # Row 4: Focus quality by day of week
    r4y = r3y + 190
    els.append(rect(wx, r4y, 440, 130, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 16, r4y + 10, "FOCUS BY DAY OF WEEK", size=11, color=LABEL))
    dow = [("M", 50), ("T", 85), ("W", 90), ("T", 70), ("F", 55), ("S", 30), ("S", 25)]
    bx = wx + 30
    for lbl, h in dow:
        els.append(rect(bx, r4y + 110 - h, 40, h, stroke=PRIMARY, fill="#7dd3fc", fill_style="solid"))
        els.append(text(bx + 14, r4y + 114, lbl, size=10, color=BODY))
        bx += 56

    # Row 5: Correlation card
    els.append(rect(wx + 460, r4y, 440, 130, stroke=C_PURPLE, fill="#faf5ff", fill_style="solid", rounded=True))
    els.append(text(wx + 476, r4y + 10, "ENERGY x BILLABLE SCATTER", size=11, color=C_PURPLE))
    # Scatter dots
    import random as _r
    _r.seed(42)
    for _ in range(16):
        dx = _r.randint(490, 680)
        dy = _r.randint(r4y + 40, r4y + 100)
        els.append(ellipse(wx + dx - 460, dy, 6, 6, stroke=C_PURPLE, fill=C_PURPLE, fill_style="solid"))
    # Trend line
    els.append(line(wx + 490, r4y + 95, [[0, 0], [210, -45]], stroke=DANGER, stroke_width=2, rough=0))
    els.append(text(wx + 720, r4y + 86, "Each +1 energy", size=9, color=TITLE))
    els.append(text(wx + 720, r4y + 100, "= +1.4h billable", size=9, color=TITLE))

    notes = [
        "Pulls from N4 Energy data (hides if none).",
        "Deep work ratio: Rize.io metric, no desktop agent needed.",
        "Focus score: composite of duration + continuity + low switches.",
        "Toggle 'deep work only' filters >=45m sessions.",
        "Scatter only after 14 days of energy data.",
        "LLM generates contextual caption annotations.",
        "Pure self-improvement territory for QS users.",
    ]
    els += draw_notes(px, py, notes)
    return els


def panel_3_4d(px, py):
    els = []
    els += draw_panel_container(px, py, "3.4d  Insights - Life Balance tab")
    wx, wy = wf_origin(px, py)

    # Tabs
    els.append(text(wx, wy, "Insights", size=22, color=TITLE))
    tab_y = wy + 38
    tabs = ["Overview", "Projects", "Patterns", "Life Balance", "Year view"]
    tx = wx
    for i, t in enumerate(tabs):
        w = 120
        if i == 3:
            els.append(rect(tx, tab_y, w, 32, stroke=PRIMARY, fill=PRIMARY, fill_style="solid", rounded=True))
            els.append(text(tx + 14, tab_y + 10, t, size=12, color=WHITE))
        else:
            els.append(text(tx + 10, tab_y + 10, t, size=12, color=MUTED))
        tx += w

    # Hero
    hy = tab_y + 54
    els.append(text(wx, hy, "This month: 248h tracked across 6 life areas", size=16, color=TITLE))

    # Balance wheel
    wy2 = hy + 36
    els.append(rect(wx, wy2, 440, 260, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 16, wy2 + 10, "BALANCE WHEEL", size=11, color=LABEL))
    cx, cy = wx + 130, wy2 + 140
    els.append(ellipse(cx - 80, cy - 80, 160, 160, stroke=TITLE, fill="#f1f5f9", fill_style="solid", stroke_width=2))
    # Segments shown as little dots/colored wedges (simplified)
    els.append(ellipse(cx - 40, cy - 60, 40, 40, stroke=C_BLUE, fill="#bfdbfe", fill_style="solid"))
    els.append(ellipse(cx + 30, cy - 40, 30, 30, stroke=C_GRAY, fill="#e2e8f0", fill_style="solid"))
    els.append(ellipse(cx + 50, cy + 10, 25, 25, stroke=SUCCESS, fill="#bbf7d0", fill_style="solid"))
    els.append(ellipse(cx + 10, cy + 50, 28, 28, stroke=C_PURPLE, fill="#e9d5ff", fill_style="solid"))
    els.append(ellipse(cx - 40, cy + 40, 26, 26, stroke=DANGER, fill="#fecaca", fill_style="solid"))
    els.append(ellipse(cx - 60, cy - 10, 20, 20, stroke="#eab308", fill="#fef08a", fill_style="solid"))

    # Legend
    legend = [
        ("Work", "127h", "51%", C_BLUE),
        ("Personal", "35h", "14%", C_GRAY),
        ("Health", "22h", "9%", SUCCESS),
        ("Learning", "28h", "11%", C_PURPLE),
        ("Family", "24h", "10%", DANGER),
        ("Leisure", "12h", "5%", "#eab308"),
    ]
    ly = wy2 + 40
    for lbl, hrs, pct, col in legend:
        els.append(rect(wx + 260, ly, 12, 12, stroke=col, fill=col, fill_style="solid"))
        els.append(text(wx + 280, ly, lbl, size=11, color=TITLE))
        els.append(text(wx + 350, ly, hrs, size=11, color=BODY))
        els.append(text(wx + 400, ly, pct, size=11, color=BODY))
        ly += 22

    # Balance goal
    els.append(rect(wx + 460, wy2, 440, 260, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 476, wy2 + 10, "TARGET VS ACTUAL", size=11, color=LABEL))
    targets = [
        ("Work", 40, 51, DANGER, "over 11%"),
        ("Personal", 15, 14, SUCCESS, "on target"),
        ("Health", 15, 9, DANGER, "under 6%"),
        ("Learning", 10, 11, SUCCESS, "on target"),
        ("Family", 15, 10, DANGER, "under 5%"),
        ("Leisure", 5, 5, SUCCESS, "on target"),
    ]
    ty = wy2 + 36
    for lbl, tgt, act, col, note in targets:
        els.append(text(wx + 476, ty, lbl, size=11, color=TITLE))
        els.append(rect(wx + 560, ty, tgt * 3, 12, stroke=MUTED, fill="#e2e8f0", fill_style="solid", rounded=True))
        els.append(rect(wx + 560, ty, act * 3, 12, stroke=col, fill=col, fill_style="solid", rounded=True))
        els.append(text(wx + 740, ty, note, size=10, color=col))
        ty += 32

    # Row 2: Habit streaks
    h2y = wy2 + 280
    els.append(rect(wx, h2y, 900, 120, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 16, h2y + 10, "HABIT STREAKS (from tags)", size=11, color=LABEL))
    habits = [
        ("#reading", "12d [fire]", "4.5h/5h wk"),
        ("#exercise", "4d", "3h/4h wk"),
        ("#meditation", "18d [fire]", "1h/1.5h wk"),
        ("#learning", "8d", "6h/5h OK"),
    ]
    hx = wx + 20
    for tag, streak, meta in habits:
        els.append(rect(hx, h2y + 36, 200, 70, stroke=BORDER, fill=PANEL_BG, fill_style="solid", rounded=True))
        els.append(text(hx + 10, h2y + 46, tag, size=13, color=C_BLUE))
        els.append(text(hx + 10, h2y + 66, streak, size=12, color=SUCCESS))
        els.append(text(hx + 10, h2y + 86, meta, size=10, color=BODY))
        hx += 214

    # Row 3: Weekly rhythm (stacked area)
    r3y = h2y + 140
    els.append(rect(wx, r3y, 900, 120, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 16, r3y + 10, "WEEKLY RHYTHM (8 weeks stacked)", size=11, color=LABEL))
    # Stacked bars for 8 weeks
    bx = wx + 30
    for w in range(8):
        els.append(rect(bx, r3y + 90 - 50, 60, 50, stroke=C_BLUE, fill="#bfdbfe", fill_style="solid"))
        els.append(rect(bx, r3y + 90 - 60, 60, 10, stroke=SUCCESS, fill="#bbf7d0", fill_style="solid"))
        els.append(rect(bx, r3y + 90 - 72, 60, 12, stroke=C_PURPLE, fill="#e9d5ff", fill_style="solid"))
        bx += 70

    notes = [
        "THE quantified-self hook.",
        "Life areas user-configurable (default 6).",
        "Projects/entries tagged with life area.",
        "Balance wheel visualizes 'in balance' question.",
        "Target slider settings: '40% work, 15% health...'",
        "Habit streaks use tags.",
        "Suggested actions: LLM + calendar to propose blocks.",
        "Personal goals = generalized T2.1, not just billable.",
        "Differentiator from Toggl for non-freelancers.",
        "Tier 2 differentiator.",
    ]
    els += draw_notes(px, py, notes)
    return els


def panel_3_4e(px, py):
    els = []
    els += draw_panel_container(px, py, "3.4e  Insights - Year view")
    wx, wy = wf_origin(px, py)

    # Tabs
    els.append(text(wx, wy, "Insights", size=22, color=TITLE))
    tab_y = wy + 38
    tabs = ["Overview", "Projects", "Patterns", "Life Balance", "Year view"]
    tx = wx
    for i, t in enumerate(tabs):
        w = 120
        if i == 4:
            els.append(rect(tx, tab_y, w, 32, stroke=PRIMARY, fill=PRIMARY, fill_style="solid", rounded=True))
            els.append(text(tx + 28, tab_y + 10, t, size=12, color=WHITE))
        else:
            els.append(text(tx + 10, tab_y + 10, t, size=12, color=MUTED))
        tx += w

    # Year header
    yy = tab_y + 50
    els.append(rect(wx, yy, 28, 28, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 8, yy + 8, "<", size=14, color=LABEL))
    els.append(text(wx + 42, yy + 2, "2026", size=22, color=TITLE))
    els.append(rect(wx + 110, yy, 28, 28, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 118, yy + 8, ">", size=14, color=LABEL))

    # Main heatmap 52 x 7
    hy = yy + 50
    els.append(rect(wx, hy, 900, 200, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 16, hy + 10, "ACTIVITY HEATMAP (52 weeks x 7 days)", size=11, color=LABEL))
    # Draw cells
    cell_size = 14
    gx = wx + 30
    gy = hy + 40
    import random as _r
    _r.seed(7)
    for w in range(52):
        for d in range(7):
            lvl = _r.randint(0, 4)
            # Make Mar-Apr hottest (w 8-16)
            if 8 <= w <= 16 and d < 5:
                lvl = min(4, lvl + 2)
            # Nov-Dec (w 44-51) medium
            if 44 <= w <= 51 and d < 5:
                lvl = min(4, lvl + 1)
            colors = ["#f1f5f9", "#bae6fd", "#7dd3fc", "#38bdf8", "#0284c7"]
            els.append(rect(gx + w * (cell_size + 1), gy + d * (cell_size + 1), cell_size, cell_size,
                            stroke=BORDER, fill=colors[lvl], fill_style="solid", rough=0))

    # Legend
    els.append(text(wx + 30, hy + 160, "Less", size=10, color=MUTED))
    lx = wx + 64
    for col in ["#f1f5f9", "#bae6fd", "#7dd3fc", "#38bdf8", "#0284c7"]:
        els.append(rect(lx, hy + 158, 14, 14, stroke=BORDER, fill=col, fill_style="solid", rough=0))
        lx += 18
    els.append(text(wx + 160, hy + 160, "More", size=10, color=MUTED))

    # Filter chips
    els.append(text(wx + 300, hy + 160, "Filter:", size=10, color=MUTED))
    fx = wx + 350
    for f in ["All", "Billable", "Deep work", "#tag"]:
        els.append(rect(fx, hy + 156, 80, 22, stroke=BORDER, fill=PANEL_BG, fill_style="solid", rounded=True))
        els.append(text(fx + 10, hy + 162, f, size=10, color=LABEL))
        fx += 90

    # Year summary strip
    sy = hy + 210
    els.append(rect(wx, sy, 900, 60, stroke=PRIMARY, fill="#e0f2fe", fill_style="solid", rounded=True))
    els.append(text(wx + 16, sy + 10, "YEAR SUMMARY", size=10, color=PRIMARY))
    els.append(text(wx + 16, sy + 30, "Total: 1,847h  $146,800  Best: Mar (217h)  Longest streak: 42d  Current: 14d", size=12, color=TITLE))

    # Row 2: Monthly totals
    my2 = sy + 74
    els.append(rect(wx, my2, 900, 130, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 16, my2 + 10, "MONTHLY TOTALS", size=11, color=LABEL))
    monthly = [110, 140, 217, 180, 165, 150, 135, 125, 155, 170, 145, 155]
    months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"]
    bx = wx + 30
    for h, m in zip(monthly, months):
        bar_h = int(h / 3)
        els.append(rect(bx, my2 + 110 - bar_h, 60, bar_h, stroke=PRIMARY, fill="#7dd3fc", fill_style="solid"))
        els.append(text(bx + 24, my2 + 112, m, size=10, color=BODY))
        bx += 72

    # Row 3: Year in review AI card
    r3y = my2 + 150
    els.append(rect(wx, r3y, 900, 150, stroke=C_PURPLE, fill="#faf5ff", fill_style="solid", rounded=True))
    els.append(text(wx + 16, r3y + 10, "YOUR YEAR IN REVIEW (AI)", size=11, color=C_PURPLE))
    items = [
        "You tracked 1,847h this year — up 23% from last year",
        "Most productive month: March (217h)",
        "Shipped on 14 distinct projects",
        "Deepest focus streak: 42 consecutive days in Feb/Mar",
        "You billed $146,800 — a personal best",
    ]
    iy = r3y + 34
    for it in items:
        els.append(text(wx + 30, iy, "> " + it, size=11, color=TITLE))
        iy += 22

    notes = [
        "GitHub-style contribution graph.",
        "Users come back to 'fill in cells' — gamification.",
        "Filter chips: billable year, reading year, exercise year.",
        "Compare-to-last-year answers 'improving?' visually.",
        "AI year in review can become social share card.",
        "Tier 2 differentiator. Cheap to build.",
        "Pure data, no fluff.",
    ]
    els += draw_notes(px, py, notes)
    return els


def panel_3_5(px, py):
    els = []
    els += draw_panel_container(px, py, "3.5  Reports")
    wx, wy = wf_origin(px, py)

    els.append(text(wx, wy, "Reports", size=22, color=TITLE))

    # Filter bar
    fy = wy + 44
    els.append(rect(wx, fy, 900, 48, stroke=BORDER, fill=PANEL_BG, fill_style="solid", rounded=True))
    filters = ["Date range v", "Client v", "Project v", "Tag v", "Billable [x]"]
    fx = wx + 10
    for f in filters:
        els.append(rect(fx, fy + 10, 150, 28, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
        els.append(text(fx + 14, fy + 18, f, size=11, color=LABEL))
        fx += 158

    # Export buttons
    els.append(rect(wx + 700, fy, 90, 34, stroke=LABEL, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 716, fy + 10, "CSV free", size=10, color=LABEL))
    els.append(rect(wx + 800, fy, 100, 34, stroke=PRIMARY, fill="#e0f2fe", fill_style="solid", rounded=True))
    els.append(text(wx + 816, fy + 10, "PDF Pro", size=10, color=PRIMARY))

    # Data table
    ty = fy + 72
    headers = ["Date", "Project", "Client", "Duration", "Rate", "$", "Notes"]
    col_w = [100, 160, 110, 100, 80, 80, 270]
    cx = wx
    for i, h in enumerate(headers):
        els.append(rect(cx, ty, col_w[i], 36, stroke=BORDER, fill=PANEL_BG, fill_style="solid"))
        els.append(text(cx + 10, ty + 10, h, size=11, color=LABEL))
        cx += col_w[i]
    ty += 36

    rows = [
        ("Apr 10", "Landing hero", "Acme", "1h 30m", "$100", "$150", "hero section"),
        ("Apr 10", "Email discovery", "B Co", "25m", "$100", "$42", "inbox triage"),
        ("Apr 10", "Stripe fix", "Acme", "2h 15m", "$100", "$225", "retry logic"),
        ("Apr 9", "Landing hero", "Acme", "45m", "$100", "$75", "polish"),
        ("Apr 9", "Weekly sync", "Acme", "1h", "$100", "$100", "sprint"),
        ("Apr 8", "API refactor", "Acme", "2h 45m", "$100", "$275", "endpoints"),
    ]
    for r in rows:
        cx = wx
        for i, v in enumerate(r):
            els.append(rect(cx, ty, col_w[i], 32, stroke=BORDER, fill=WHITE, fill_style="solid"))
            els.append(text(cx + 10, ty + 10, v, size=11, color=TITLE))
            cx += col_w[i]
        ty += 32

    # Footer
    ty += 20
    els.append(rect(wx, ty, 900, 48, stroke=TITLE, fill="#f1f5f9", fill_style="solid", rounded=True, stroke_width=2))
    els.append(text(wx + 16, ty + 16, "87 entries", size=12, color=BODY))
    els.append(text(wx + 280, ty + 16, "Total: 127h 45m", size=12, color=TITLE))
    els.append(text(wx + 560, ty + 16, "$9,820", size=14, color=SUCCESS))

    notes = [
        "Simpler than current Reports page.",
        "NO paywall on entire Reports page anymore.",
        "CSV export is now FREE (Reddit feedback).",
        "PDF export stays Pro (basic formatting).",
        "AI Invoice Narrative (2.2) is a separate Pro feature.",
        "Used for raw data dumps and tax-time exports.",
        "T1.11 + T1.13 features.",
    ]
    els += draw_notes(px, py, notes)
    return els


def panel_3_6(px, py):
    els = []
    els += draw_panel_container(px, py, "3.6  Settings")
    wx, wy = wf_origin(px, py)

    els.append(text(wx, wy, "Settings", size=22, color=TITLE))

    # Tabs
    tab_y = wy + 44
    tabs = ["Account", "Subscription", "Integrations"]
    tx = wx
    for i, t in enumerate(tabs):
        w = 150
        if i == 0:
            els.append(rect(tx, tab_y, w, 36, stroke=PRIMARY, fill=PRIMARY, fill_style="solid", rounded=True))
            els.append(text(tx + 46, tab_y + 12, t, size=13, color=WHITE))
        else:
            els.append(text(tx + 20, tab_y + 12, t, size=13, color=MUTED))
        tx += w + 10

    # Section: Profile
    sy = tab_y + 64
    els.append(rect(wx, sy, 900, 180, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 16, sy + 14, "PROFILE", size=12, color=LABEL))
    els.append(text(wx + 16, sy + 40, "Email:", size=12, color=BODY))
    els.append(text(wx + 130, sy + 40, "ali@example.com", size=12, color=TITLE))
    els.append(text(wx + 16, sy + 70, "Display name:", size=12, color=BODY))
    els.append(rect(wx + 180, sy + 66, 280, 30, stroke=BORDER, fill=PANEL_BG, fill_style="solid", rounded=True))
    els.append(text(wx + 192, sy + 74, "Ali Mabsoute", size=12, color=TITLE))
    els.append(text(wx + 16, sy + 110, "Change password  ->", size=12, color=PRIMARY))

    # Section: Preferences
    py2 = sy + 200
    els.append(rect(wx, py2, 900, 340, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 16, py2 + 14, "PREFERENCES", size=12, color=LABEL))
    prefs = [
        ("Morning energy check-in", True),
        ("Post-session voice memo prompts", True),
        ("Auto Daily Rewind on Mondays", True),
        ("Idle detection threshold: 10 min", None),
        ("Theme: System / Light / Dark", None),
        ("Week starts on: Monday", None),
    ]
    ppy = py2 + 40
    for lbl, on in prefs:
        els.append(text(wx + 30, ppy, lbl, size=12, color=TITLE))
        if on is True:
            els.append(rect(wx + 780, ppy - 4, 50, 24, stroke=SUCCESS, fill=SUCCESS, fill_style="solid", rounded=True))
            els.append(ellipse(wx + 808, ppy - 2, 20, 20, stroke=WHITE, fill=WHITE, fill_style="solid"))
        elif on is False:
            els.append(rect(wx + 780, ppy - 4, 50, 24, stroke=MUTED, fill=MUTED, fill_style="solid", rounded=True))
            els.append(ellipse(wx + 782, ppy - 2, 20, 20, stroke=WHITE, fill=WHITE, fill_style="solid"))
        else:
            els.append(rect(wx + 780, ppy - 4, 100, 24, stroke=BORDER, fill=PANEL_BG, fill_style="solid", rounded=True))
            els.append(text(wx + 810, ppy, "[set]", size=10, color=LABEL))
        ppy += 48

    # Danger zone
    dy = py2 + 360
    els.append(rect(wx, dy, 900, 90, stroke=DANGER, fill="#fef2f2", fill_style="solid", rounded=True, stroke_width=2))
    els.append(text(wx + 16, dy + 14, "DANGER ZONE", size=12, color=DANGER))
    els.append(rect(wx + 16, dy + 42, 180, 34, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(wx + 42, dy + 52, "Export all data", size=12, color=LABEL))
    els.append(rect(wx + 210, dy + 42, 180, 34, stroke=DANGER, fill=DANGER, fill_style="solid", rounded=True))
    els.append(text(wx + 248, dy + 52, "Delete account", size=12, color=WHITE))

    notes = [
        "Drops Activity tab (duplicates Dashboard).",
        "Drops Security tab (folds into Account).",
        "NEW Integrations tab:",
        "  Google Calendar (for Daily Rewind + Timeline)",
        "  GitHub (boosts Daily Rewind)",
        "  Webhook API access (Pro only)",
        "  Import from Toggl/Clockify",
        "Subscription tab: plan + upgrade + comparison.",
        "Theme toggle + dark mode audit: Phase 7.",
    ]
    els += draw_notes(px, py, notes)
    return els


def panel_3_7(px, py):
    els = []
    els += draw_panel_container(px, py, "3.7  Idle Detection + Manual Past Entry")
    wx, wy = wf_origin(px, py)

    # LEFT HALF: Idle Detection
    els.append(text(wx, wy, "LEFT: IDLE DETECTION PROMPT", size=11, color=LABEL))
    mx, my = wx + 40, wy + 40
    els.append(rect(mx, my, 400, 320, stroke="#f59e0b", fill="#fef3c7", fill_style="solid", rounded=True, stroke_width=2))
    els.append(ellipse(mx + 20, my + 24, 32, 32, stroke="#f59e0b", fill="#f59e0b", fill_style="solid"))
    els.append(text(mx + 30, my + 30, "!", size=16, color=WHITE))
    els.append(text(mx + 64, my + 32, "You've been idle 10 minutes", size=14, color=TITLE))
    els.append(text(mx + 20, my + 84, "Still working on Acme  Landing hero?", size=13, color=BODY))

    # Buttons stacked
    els.append(rect(mx + 20, my + 140, 360, 40, stroke=PRIMARY, fill=PRIMARY, fill_style="solid", rounded=True))
    els.append(text(mx + 80, my + 152, "Keep the 10m (still working)", size=13, color=WHITE))
    els.append(rect(mx + 20, my + 190, 360, 40, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(mx + 120, my + 202, "Discard last 10m", size=13, color=LABEL))
    els.append(rect(mx + 20, my + 240, 360, 40, stroke=DANGER, fill="#fef2f2", fill_style="solid", rounded=True))
    els.append(text(mx + 80, my + 252, "Discard and stop timer", size=13, color=DANGER))

    # RIGHT HALF: Manual Past Entry
    els.append(text(wx + 480, wy, "RIGHT: ADD PAST TIME ENTRY", size=11, color=LABEL))
    rx, ry = wx + 480, wy + 40
    els.append(rect(rx, ry, 420, 720, stroke=TITLE, fill=WHITE, fill_style="solid", rounded=True, stroke_width=2))
    els.append(text(rx + 20, ry + 20, "Add past time entry", size=16, color=TITLE))
    els.append(line(rx + 20, ry + 56, [[0, 0], [380, 0]], stroke=BORDER, stroke_width=1))

    fields = [
        ("Project", "[Acme v]"),
        ("Client", "Auto (from project)"),
        ("Date", "April 9, 2026 [cal]"),
        ("Start time", "2:00 PM"),
        ("End time", "3:30 PM"),
        ("Duration", "1h 30m"),
    ]
    fy = ry + 74
    for lbl, val in fields:
        els.append(text(rx + 20, fy, lbl.upper(), size=10, color=MUTED))
        els.append(rect(rx + 20, fy + 18, 380, 36, stroke=BORDER, fill=PANEL_BG, fill_style="solid", rounded=True))
        els.append(text(rx + 32, fy + 28, val, size=12, color=TITLE))
        fy += 64

    # Billable toggle
    els.append(text(rx + 20, fy, "BILLABLE", size=10, color=MUTED))
    els.append(rect(rx + 20, fy + 18, 50, 24, stroke=SUCCESS, fill=SUCCESS, fill_style="solid", rounded=True))
    els.append(ellipse(rx + 48, fy + 20, 20, 20, stroke=WHITE, fill=WHITE, fill_style="solid"))
    els.append(text(rx + 80, fy + 24, "Billable  $150", size=12, color=SUCCESS))
    fy += 56

    # Tags
    els.append(text(rx + 20, fy, "TAGS", size=10, color=MUTED))
    els.append(rect(rx + 20, fy + 18, 90, 26, stroke=C_BLUE, fill=C_BLUE, fill_style="solid", rounded=True))
    els.append(text(rx + 30, fy + 24, "#frontend", size=11, color=WHITE))
    els.append(rect(rx + 120, fy + 18, 80, 26, stroke=C_GREEN, fill=C_GREEN, fill_style="solid", rounded=True))
    els.append(text(rx + 132, fy + 24, "#design", size=11, color=WHITE))
    els.append(rect(rx + 210, fy + 18, 30, 26, stroke=BORDER, fill=PANEL_BG, fill_style="solid", rounded=True))
    els.append(text(rx + 222, fy + 24, "+", size=12, color=LABEL))

    # Buttons
    fy += 70
    els.append(rect(rx + 180, fy, 100, 40, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(rx + 208, fy + 12, "Cancel", size=12, color=LABEL))
    els.append(rect(rx + 290, fy, 110, 40, stroke=PRIMARY, fill=PRIMARY, fill_style="solid", rounded=True))
    els.append(text(rx + 314, fy + 12, "Save entry", size=12, color=WHITE))

    notes = [
        "IDLE: triggers after N min no activity (5/10/15/30).",
        "Detected via visibilitychange + mouse/key listeners.",
        "T1.7 universal competitor expectation.",
        "MANUAL: via Cmd+K 'log yesterday 2-3pm on Acme' or + button.",
        "Both are table stakes.",
    ]
    els += draw_notes(px, py, notes)
    return els


def panel_4_1(px, py):
    els = []
    els += draw_panel_container(px, py, "4.1  Today (mobile)")
    wx, wy = wf_origin(px, py)

    # Phone frame 390x844
    fx, fy = wx + 240, wy + 20
    els.append(rect(fx, fy, 390, 844, stroke=TITLE, fill=WHITE, fill_style="solid", rounded=True, stroke_width=3))
    els.append(rect(fx + 140, fy + 10, 110, 8, stroke=TITLE, fill=TITLE, fill_style="solid", rounded=True))

    # Status bar
    els.append(text(fx + 16, fy + 28, "9:41", size=11, color=TITLE))
    els.append(text(fx + 340, fy + 28, "LTE", size=11, color=TITLE))

    # App header
    hy = fy + 60
    els.append(rect(fx + 8, hy, 374, 50, stroke=BORDER, fill=PANEL_BG, fill_style="solid", rounded=True))
    els.append(text(fx + 20, hy + 16, "[=]", size=14, color=TITLE))
    els.append(text(fx + 140, hy + 16, "PhynxTimer", size=16, color=TITLE))
    els.append(ellipse(fx + 340, hy + 10, 30, 30, stroke=LABEL, fill=MUTED, fill_style="solid"))

    # Ticker strip
    ty = hy + 60
    els.append(rect(fx + 8, ty, 374, 36, stroke=PRIMARY, fill="#e0f2fe", fill_style="solid", rounded=True))
    els.append(text(fx + 20, ty + 12, "Wk: $1,420  Today: $180  Acme ->", size=11, color=PRIMARY))

    # AI hero
    hy2 = ty + 46
    els.append(text(fx + 16, hy2, "You've logged 3h 12m today", size=13, color=TITLE))
    els.append(text(fx + 16, hy2 + 22, "$180 billable", size=13, color=TITLE))

    # Running entry card
    ry = hy2 + 56
    els.append(rect(fx + 8, ry, 374, 64, stroke=SUCCESS, fill="#ecfdf5", fill_style="solid", rounded=True, stroke_width=2))
    els.append(ellipse(fx + 20, ry + 22, 14, 14, stroke=SUCCESS, fill=SUCCESS, fill_style="solid"))
    els.append(text(fx + 40, ry + 12, "Acme  Landing hero", size=12, color=TITLE))
    els.append(text(fx + 40, ry + 30, "0:42:15", size=16, color=SUCCESS))
    els.append(rect(fx + 280, ry + 16, 80, 32, stroke=DANGER, fill=DANGER, fill_style="solid", rounded=True))
    els.append(text(fx + 306, ry + 24, "Stop", size=12, color=WHITE))

    # Big + Log button
    by = ry + 80
    els.append(rect(fx + 8, by, 374, 56, stroke=PRIMARY, fill=PRIMARY, fill_style="solid", rounded=True))
    els.append(text(fx + 136, by + 18, "+ Log time", size=16, color=WHITE))

    # Section label
    sy = by + 72
    els.append(text(fx + 16, sy, "TODAY", size=11, color=LABEL))

    # Entry rows (compact)
    entries = [
        (C_BLUE, True, "Acme  Landing hero", "90m  $150  9:32"),
        (C_GREEN, False, "B Co  Email discovery", "25m  $40  8:55"),
        (C_GRAY, False, "Personal  Reading", "18m  8:30"),
    ]
    ey = sy + 26
    for col, run, title_, meta in entries:
        els.append(rect(fx + 8, ey, 374, 60, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
        if run:
            els.append(ellipse(fx + 20, ey + 20, 14, 14, stroke=SUCCESS, fill=SUCCESS, fill_style="solid"))
        else:
            els.append(ellipse(fx + 20, ey + 20, 14, 14, stroke=MUTED, fill="transparent"))
        els.append(rect(fx + 40, ey + 18, 6, 18, stroke=col, fill=col, fill_style="solid"))
        els.append(text(fx + 52, ey + 12, title_, size=12, color=TITLE))
        els.append(text(fx + 52, ey + 32, meta, size=10, color=BODY))
        ey += 68

    # Bottom tab bar (fixed)
    tby = fy + 780
    els.append(rect(fx + 0, tby, 390, 64, stroke=BORDER, fill=WHITE, fill_style="solid"))
    tabs = ["Today", "Sheet", "Time", "Stats", "..."]
    for i, t in enumerate(tabs):
        tx = fx + 20 + i * 72
        els.append(rect(tx + 8, tby + 10, 24, 24, stroke=PRIMARY if i == 0 else MUTED, fill="transparent"))
        els.append(text(tx, tby + 40, t, size=10, color=PRIMARY if i == 0 else MUTED))

    notes = [
        "NO Cmd+K on mobile. Big + Log replaces it.",
        "Tab bar at bottom (mobile convention).",
        "Rows tappable for detail.",
        "Swipe-left reveals quick actions.",
        "Running entry prominent at top.",
        "Responsive breakpoints (md: 768px).",
        "Pull-to-refresh supported.",
    ]
    els += draw_notes(px, py, notes)
    return els


def panel_4_2(px, py):
    els = []
    els += draw_panel_container(px, py, "4.2  Log time (mobile logger)")
    wx, wy = wf_origin(px, py)

    fx, fy = wx + 240, wy + 20
    els.append(rect(fx, fy, 390, 844, stroke=TITLE, fill=WHITE, fill_style="solid", rounded=True, stroke_width=3))
    els.append(rect(fx + 140, fy + 10, 110, 8, stroke=TITLE, fill=TITLE, fill_style="solid", rounded=True))

    # Status bar
    els.append(text(fx + 16, fy + 28, "9:41", size=11, color=TITLE))
    els.append(text(fx + 340, fy + 28, "LTE", size=11, color=TITLE))

    # Header
    hy = fy + 60
    els.append(rect(fx, hy, 390, 56, stroke=BORDER, fill=PANEL_BG, fill_style="solid"))
    els.append(text(fx + 140, hy + 20, "Log time", size=16, color=TITLE))
    els.append(text(fx + 360, hy + 20, "X", size=16, color=MUTED))

    # Text input
    ty = hy + 76
    els.append(text(fx + 16, ty, "What did you work on?", size=12, color=LABEL))
    els.append(rect(fx + 16, ty + 24, 358, 80, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True, stroke_width=2))

    # Big mic button
    my = ty + 124
    els.append(ellipse(fx + 130, my, 130, 130, stroke=PRIMARY, fill="#e0f2fe", fill_style="solid", stroke_width=3))
    els.append(ellipse(fx + 150, my + 20, 90, 90, stroke=PRIMARY, fill=PRIMARY, fill_style="solid"))
    els.append(text(fx + 178, my + 52, "MIC", size=18, color=WHITE))
    els.append(text(fx + 124, my + 146, "Tap to record", size=14, color=TITLE))

    # Preview card (stacked)
    py2 = my + 186
    fields = [
        ("Project:", "Acme v"),
        ("Duration:", "1h 30m"),
        ("When:", "90m ago -> now"),
        ("Billable:", "$150"),
        ("Notes:", "hero section"),
    ]
    for lbl, val in fields:
        els.append(text(fx + 20, py2, lbl, size=11, color=MUTED))
        els.append(text(fx + 120, py2, val, size=12, color=TITLE))
        els.append(line(fx + 16, py2 + 22, [[0, 0], [358, 0]], stroke=BORDER, stroke_width=1))
        py2 += 34

    # Sticky footer button
    els.append(rect(fx + 16, fy + 780, 358, 54, stroke=PRIMARY, fill=PRIMARY, fill_style="solid", rounded=True))
    els.append(text(fx + 140, fy + 796, "Save entry", size=15, color=WHITE))

    notes = [
        "Voice prominent on mobile — biggest wow moment on phone.",
        "Stacked vertical layout, no side preview.",
        "Keyboard auto-appears on open.",
        "MediaRecorder in mobile browsers (iOS/Android Safari, Chrome).",
        "Tap-to-record instead of hold (better ergonomics).",
    ]
    els += draw_notes(px, py, notes)
    return els


def panel_4_3(px, py):
    els = []
    els += draw_panel_container(px, py, "4.3  Timesheet (mobile)")
    wx, wy = wf_origin(px, py)

    fx, fy = wx + 240, wy + 20
    els.append(rect(fx, fy, 390, 844, stroke=TITLE, fill=WHITE, fill_style="solid", rounded=True, stroke_width=3))
    els.append(rect(fx + 140, fy + 10, 110, 8, stroke=TITLE, fill=TITLE, fill_style="solid", rounded=True))

    els.append(text(fx + 16, fy + 28, "9:41", size=11, color=TITLE))
    els.append(text(fx + 340, fy + 28, "LTE", size=11, color=TITLE))

    # Header
    hy = fy + 60
    els.append(rect(fx, hy, 390, 56, stroke=BORDER, fill=PANEL_BG, fill_style="solid"))
    els.append(rect(fx + 20, hy + 16, 26, 26, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(fx + 28, hy + 20, "<", size=12, color=LABEL))
    els.append(text(fx + 100, hy + 20, "Apr 6-12 2026", size=14, color=TITLE))
    els.append(rect(fx + 300, hy + 16, 26, 26, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(fx + 308, hy + 20, ">", size=12, color=LABEL))

    # Table area
    ty = hy + 80
    els.append(text(fx + 16, ty, "Horizontal scroll: Mon | Tue | Wed >>", size=10, color=MUTED))

    # Sticky first column + 3 day columns
    col_w = [110, 68, 68, 68]
    row_h = 40

    # Header row
    cx = fx + 16
    headers = ["", "Mon", "Tue", "Wed"]
    for i, h in enumerate(headers):
        els.append(rect(cx, ty + 20, col_w[i], 32, stroke=BORDER, fill=PANEL_BG, fill_style="solid"))
        if h:
            els.append(text(cx + 18, ty + 30, h, size=11, color=LABEL))
        cx += col_w[i]

    # ACME row
    gy = ty + 52
    els.append(rect(fx + 16, gy, sum(col_w), 28, stroke=BORDER, fill="#eff6ff", fill_style="solid"))
    els.append(ellipse(fx + 24, gy + 8, 12, 12, stroke=C_BLUE, fill=C_BLUE, fill_style="solid"))
    els.append(text(fx + 40, gy + 8, "ACME", size=11, color=C_BLUE))
    gy += 28

    rows = [
        ("Landing hero", ["1h 30", "2h 15", "-"]),
        ("Stripe", ["2h 15", "1h 20", "3h"]),
    ]
    for nm, vals in rows:
        cx = fx + 16
        els.append(rect(cx, gy, col_w[0], row_h, stroke=BORDER, fill=WHITE, fill_style="solid"))
        els.append(text(cx + 6, gy + 14, nm, size=10, color=TITLE))
        cx += col_w[0]
        for i, v in enumerate(vals):
            els.append(rect(cx, gy, col_w[i + 1], row_h, stroke=BORDER, fill=WHITE, fill_style="solid"))
            els.append(text(cx + 6, gy + 14, v, size=10, color=BODY))
            cx += col_w[i + 1]
        gy += row_h

    # B CO
    els.append(rect(fx + 16, gy, sum(col_w), 28, stroke=BORDER, fill="#f0fdf4", fill_style="solid"))
    els.append(ellipse(fx + 24, gy + 8, 12, 12, stroke=C_GREEN, fill=C_GREEN, fill_style="solid"))
    els.append(text(fx + 40, gy + 8, "B CO", size=11, color=C_GREEN))
    gy += 28
    cx = fx + 16
    els.append(rect(cx, gy, col_w[0], row_h, stroke=BORDER, fill=WHITE, fill_style="solid"))
    els.append(text(cx + 6, gy + 14, "Email", size=10, color=TITLE))
    cx += col_w[0]
    dvals = ["25m", "-", "1h 15"]
    for i, v in enumerate(dvals):
        els.append(rect(cx, gy, col_w[i + 1], row_h, stroke=BORDER, fill=WHITE, fill_style="solid"))
        els.append(text(cx + 6, gy + 14, v, size=10, color=BODY))
        cx += col_w[i + 1]
    gy += row_h

    # Bottom strip
    els.append(rect(fx + 8, fy + 700, 374, 56, stroke=TITLE, fill="#f1f5f9", fill_style="solid", rounded=True, stroke_width=2))
    els.append(text(fx + 20, fy + 712, "TOTAL 13h 33m", size=13, color=TITLE))
    els.append(text(fx + 20, fy + 732, "$1,275 billable", size=12, color=SUCCESS))

    # FAB
    els.append(ellipse(fx + 320, fy + 720, 56, 56, stroke=PRIMARY, fill=PRIMARY, fill_style="solid"))
    els.append(text(fx + 340, fy + 738, "+", size=22, color=WHITE))

    notes = [
        "Horizontal scroll for 7 days + total.",
        "Sticky first column for context on scroll.",
        "Tap cell -> full-screen edit.",
        "Mobile Timeline (4.4) often more useful.",
        "Exists for power users who learned pattern on desktop.",
    ]
    els += draw_notes(px, py, notes)
    return els


def panel_4_4(px, py):
    els = []
    els += draw_panel_container(px, py, "4.4  Timeline (mobile)")
    wx, wy = wf_origin(px, py)

    fx, fy = wx + 240, wy + 20
    els.append(rect(fx, fy, 390, 844, stroke=TITLE, fill=WHITE, fill_style="solid", rounded=True, stroke_width=3))
    els.append(rect(fx + 140, fy + 10, 110, 8, stroke=TITLE, fill=TITLE, fill_style="solid", rounded=True))

    els.append(text(fx + 16, fy + 28, "9:41", size=11, color=TITLE))
    els.append(text(fx + 340, fy + 28, "LTE", size=11, color=TITLE))

    # Header
    hy = fy + 60
    els.append(rect(fx, hy, 390, 56, stroke=BORDER, fill=PANEL_BG, fill_style="solid"))
    els.append(rect(fx + 20, hy + 16, 26, 26, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(fx + 28, hy + 20, "<", size=12, color=LABEL))
    els.append(text(fx + 130, hy + 20, "Mon Apr 10", size=14, color=TITLE))
    els.append(rect(fx + 260, hy + 16, 26, 26, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(fx + 268, hy + 20, ">", size=12, color=LABEL))
    els.append(rect(fx + 300, hy + 16, 60, 26, stroke=BORDER, fill=WHITE, fill_style="solid", rounded=True))
    els.append(text(fx + 316, hy + 20, "Today", size=10, color=LABEL))

    # Vertical timeline
    blocks = [
        ("9:00", C_BLUE, True, "Acme  Landing hero", "1h 30m  $150", False),
        ("11:15", C_GREEN, False, "B Co  Email discovery", "25m  $40", False),
        ("11:40", DANGER, False, "GAP  1h 20m unaccounted", "tap to fill", True),
        ("13:00", C_BLUE, True, "Acme  Stripe webhook", "2h 15m  $225", False),
        ("15:30", C_GRAY, False, "Personal  Reading", "18m", False),
    ]
    ty = hy + 80
    for tm, col, run, title_, meta, is_gap in blocks:
        # Time label
        els.append(text(fx + 16, ty + 14, tm, size=12, color=MUTED))
        # Block
        if is_gap:
            els.append(rect(fx + 80, ty, 290, 64, stroke=DANGER, fill="#fef2f2", fill_style="hachure", stroke_style="dashed", rounded=True))
        else:
            els.append(rect(fx + 80, ty, 290, 64, stroke=col, fill=WHITE, fill_style="solid", rounded=True, stroke_width=2))
        if run:
            els.append(ellipse(fx + 92, ty + 24, 14, 14, stroke=SUCCESS, fill=SUCCESS, fill_style="solid"))
        els.append(text(fx + 114 if run else fx + 92, ty + 14, title_, size=11, color=TITLE))
        els.append(text(fx + 92, ty + 36, meta, size=10, color=BODY if not is_gap else DANGER))
        ty += 96

    # FAB
    els.append(ellipse(fx + 320, fy + 720, 56, 56, stroke=PRIMARY, fill=PRIMARY, fill_style="solid"))
    els.append(text(fx + 332, fy + 738, "+ L", size=14, color=WHITE))

    notes = [
        "Vertical timeline natural for mobile scrolling.",
        "Gaps highlighted for retroactive logging.",
        "Tap block to edit.",
        "FAB opens conversational logger bottom sheet.",
        "Calendar events subtle outlined blocks (desaturated).",
        "Colors for visual client distinction.",
    ]
    els += draw_notes(px, py, notes)
    return els


# ---------- Round header ----------
def round_header(x, y, title_str):
    return [text(x, y, title_str, size=48, color=TITLE, width=1800)]


# ---------- Layout engine ----------
def layout_panels():
    """Return list of (builder, panel_x, panel_y) tuples plus round header elements."""
    all_elements = []

    # Round 1 — CORE SCREENS — 6 panels — 2 rows x 3 cols
    r1_builders = [panel_1_1, panel_1_2, panel_1_3, panel_1_4, panel_1_5, panel_1_6]
    r1_y0 = 0
    # Header
    all_elements += round_header(0, r1_y0 - 120, "ROUND 1 - CORE SCREENS")
    for i, builder in enumerate(r1_builders):
        col = i % 3
        row = i // 3
        px = col * (PANEL_W + GAP_X)
        py = r1_y0 + row * (PANEL_H + GAP_Y)
        all_elements += builder(px, py)

    # Round 2 — AI FEATURES — 5 panels
    r2_y0 = r1_y0 + 2 * (PANEL_H + GAP_Y) + 200
    all_elements += round_header(0, r2_y0 - 120, "ROUND 2 - AI FEATURES")
    r2_builders = [panel_2_1, panel_2_2, panel_2_3, panel_2_4, panel_2_5]
    for i, builder in enumerate(r2_builders):
        col = i % 3
        row = i // 3
        px = col * (PANEL_W + GAP_X)
        py = r2_y0 + row * (PANEL_H + GAP_Y)
        all_elements += builder(px, py)

    # Round 3 — SUPPORTING — 11 panels
    r3_y0 = r2_y0 + 2 * (PANEL_H + GAP_Y) + 200
    all_elements += round_header(0, r3_y0 - 120, "ROUND 3 - SUPPORTING SCREENS")
    r3_builders = [panel_3_1, panel_3_2, panel_3_3, panel_3_4, panel_3_4b,
                   panel_3_4c, panel_3_4d, panel_3_4e, panel_3_5, panel_3_6, panel_3_7]
    for i, builder in enumerate(r3_builders):
        col = i % 3
        row = i // 3
        px = col * (PANEL_W + GAP_X)
        py = r3_y0 + row * (PANEL_H + GAP_Y)
        all_elements += builder(px, py)

    # Round 4 — MOBILE — 4 panels
    r4_y0 = r3_y0 + 4 * (PANEL_H + GAP_Y) + 200
    all_elements += round_header(0, r4_y0 - 120, "ROUND 4 - MOBILE RESPONSIVE")
    r4_builders = [panel_4_1, panel_4_2, panel_4_3, panel_4_4]
    for i, builder in enumerate(r4_builders):
        col = i % 3
        row = i // 3
        px = col * (PANEL_W + GAP_X)
        py = r4_y0 + row * (PANEL_H + GAP_Y)
        all_elements += builder(px, py)

    return all_elements


def main():
    random.seed(2026)
    elements = layout_panels()

    excalidraw = {
        "type": "excalidraw",
        "version": 2,
        "source": "https://excalidraw.com",
        "elements": elements,
        "appState": {
            "gridSize": None,
            "viewBackgroundColor": "#ffffff",
        },
        "files": {},
    }

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(excalidraw, f, indent=2)

    size_kb = os.path.getsize(OUTPUT_PATH) / 1024

    # Validate: re-parse
    with open(OUTPUT_PATH, "r", encoding="utf-8") as f:
        reparsed = json.load(f)
    assert reparsed["type"] == "excalidraw"
    assert len(reparsed["elements"]) == len(elements)

    print(f"Wrote {OUTPUT_PATH}")
    print(f"Elements: {len(elements)}")
    print(f"Size: {size_kb:.1f} KB")
    print(f"JSON valid: yes")


if __name__ == "__main__":
    main()
