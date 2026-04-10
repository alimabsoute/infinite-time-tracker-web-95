# PhynxTimer Wireframe Spec — Source of Truth

This is the spec for the PhynxTimer redesign wireframes. A subagent will read this and generate `phynxtimer-wireframes.excalidraw` based on it.

## Layout rules
- One Excalidraw file with all panels
- Layout: 3-column grid
- Each panel: ~1500px wide × 1100px tall (including notes column)
- 200px horizontal gap, 300px vertical gap between panels
- Panels grouped in 4 rounds with big header text between rounds
- Round headers: "ROUND 1 — CORE SCREENS", "ROUND 2 — AI FEATURES", etc., size 48px bold

## Design system (use for all panels)
- Fill: white `#ffffff`
- Panel border: `#e5e7eb` 2px
- Title text: 32px bold, black `#0f172a`
- Section labels: 16px bold, `#334155`
- Body text: 14px, `#475569`
- Primary accent (CTAs, active): `#0ea5e9` (sky blue)
- Success / billable: `#10b981` (emerald)
- Muted / secondary: `#94a3b8`
- Danger / gap: `#ef4444`
- Running indicator dot: filled `#10b981`; stopped: outline `#94a3b8`
- Use rough style (fillStyle: "solid" or "hachure"), roundness where it makes visual sense

## Each panel structure
- Panel number + title at the top (e.g., "1.1 — Today (Dashboard)")
- Wireframe canvas on the left (~900px wide)
- Notes column on the right (~500px wide) with bullet points in smaller text

## Total panels: 26 (6 core + 5 AI + 11 supporting incl. 5-tab Insights + 4 mobile)

## Product pillars (informs every panel)
1. **Friction-free capture** — command bar, voice, conversational logging
2. **Deep analytics as the hook** — people want to know how long things take, are they getting faster, where does their time *really* go. Analytics is the reason users keep opening the app, not an afterthought for billing reports.
3. **All of your time, not just billable** — work + personal + learning + health + leisure. The app is a quantified-self tool for time across every domain.
4. **AI as the differentiator** — logger, voice memos, rewind, invoice, insights

---

# ROUND 1 — CORE SCREENS (6 panels)

## Panel 1.1 — Today (Dashboard)
**Main landing screen after auth. Replaces the circular clock grid.**

Wireframe:
- Header bar (full-width, ~60px tall)
  - Left: "PhynxTimer" logo text
  - Center: ticker strip pill: "THIS WEEK: $1,420 BILLABLE"
  - Right: running entry pill: "● Acme · 0:42:15"
  - Far right: avatar circle
- Hero AI sentence (large, 24px): "You've logged 3h 12m today · $180 billable · 18% above weekly avg · last entry 40m ago"
- Micro-analytics chip row below hero (4 small chips):
  - `🔥 14 day streak`
  - `⚡ Focus score 7.3/10`
  - `📈 Backend tasks ↓18% faster`
  - `🎯 Weekly goal 32/40h (80%)`
- Command bar placeholder row: big rounded rectangle, left-icon ⌘K, placeholder text "What did you do? (press / to start typing)"
- Tiny hint below: "Press Space to resume Acme"
- Section label: "TODAY · MON APRIL 10"
- Entry rows (list of 4):
  1. `● Acme · Landing hero section · 90m · $150 · 9:32-11:02  ⋯`
  2. `○ B Co · Email discovery · 25m · $40 · 8:55-9:20  ⋯`
  3. `○ Personal · Reading · 18m · — · 8:30-8:48  ⋯`
  4. `○ Acme · Stripe webhook fix · 2h 15m · $225 · 6:10-8:25  ⋯`
- Section label collapsed: "YESTERDAY  (4 entries, tap to expand)"
- Footer tiny links row: `↑ Daily Rewind · Insights · Timesheet · Timeline · Reports`

Notes column:
- Dense list-first layout. NO circles, NO animations, NO 3D.
- Persistent header always shows running entry so user sees status from anywhere.
- Ticker strip shows live weekly billable (motivational flywheel).
- Running entries: filled green dot ●. Stopped: outline circle ○.
- Every row clickable → inline edit or full dialog.
- Keyboard shortcuts: Space=start/stop running, J/K=navigate rows, N=new entry, E=edit selected, Cmd+K=palette.
- AI hero sentence regenerates every ~30s based on current state.
- Yesterday collapses by default; tap to expand (shows entries for prior day).

## Panel 1.2 — Command Palette (⌘K open)
**The universal command bar summoned with Cmd+K.**

Wireframe:
- Dim overlay over a faint dashboard background
- Center modal: 600×550, white bg, rounded corners, drop shadow
- Search input at top: `⌘ Type a command or search...` (placeholder)
- Command list grouped by section:
  - **ACTIONS**
    - `⌘ Log time`  —  "Tell me what you did"  —  shortcut: `⌘L`
    - `▶ Start timer`  —  "Start on a project"  —  shortcut: `Space`
    - `■ Stop timer`  —  "Stop the current entry"  —  shortcut: `Space`
    - `◉ Focus mode`  —  "Full-screen focus"  —  shortcut: `⌘⇧F`
    - `🎙 Voice log`  —  "Hold to talk"  —  shortcut: `⌘⇧K`
  - **JUMP TO**
    - `→ Today`  —  `G D`
    - `→ Timesheet`  —  `G T`
    - `→ Timeline`  —  `G L`
    - `→ Insights`  —  `G I`
  - **AI**
    - `✨ Daily Rewind`  —  "Reconstruct yesterday"  —  `⌘R`
    - `✨ Invoice generator`  —  "AI-drafted invoice"  —  `⌘I`
    - `🔍 Find entries`  —  "Search entries + voice memos"  —  `⌘F`
- Footer bar: `↑↓ navigate · ↵ select · esc close`

Notes column:
- Built on `cmdk` React library (same as Linear, Raycast).
- Fuzzy search matches action names and descriptions.
- Recently-used commands float to top of their groups.
- Shortcuts displayed next to every action so users passively learn to skip the palette (Superhuman pattern).
- The command bar is the ENTRY POINT FOR EVERYTHING in PhynxTimer v2. Every non-trivial action lives here.
- On mobile, Cmd+K is replaced by a "+ Log" button in the bottom tab bar.

## Panel 1.3 — Conversational Time Logger (⌘K "log")
**The flagship feature. User describes what they did in natural language → AI creates a time entry.**

Wireframe:
- Modal dialog 700×650
- Title bar: "Log time" with `⌘L` badge
- Chat-style input area (large):
  - Prompt above: "What did you work on?"
  - Textarea (3 rows, large font): `"just spent 90 min on the acme landing hero, billable"`
  - Mic icon button on right (for voice mode switch)
- Divider "↓ AI preview" label
- Preview card (filled in by AI after user types):
  - **Project**: `Acme` with dropdown arrow (editable)
  - **Duration**: `1h 30m` (editable)
  - **When**: `Starting 90m ago → now` (editable)
  - **Billable**: `Yes · $150 @ $100/hr` (toggle)
  - **Notes**: `hero section` (editable)
- Buttons row: "Cancel" (secondary) | "Save" (primary, large blue)

Notes column:
- LLM parses project, duration, timing, billable flag, notes from free text.
- Debounced 500ms live preview as user types.
- Every preview field is clickable to override.
- Enter key = Save. Zero mouse needed.
- Voice mode: click mic (or Cmd+Shift+K globally) → opens Panel 1.4 voice logger.
- Fallback: if AI can't parse confidently, preview shows "❓ Which project?" with suggested matches.
- LLM call via Supabase Edge Function → Anthropic API. Free tier capped; Pro tier generous.
- This is the flagship Tier 3 feature — N1 Conversational Logger in the research doc.
- Verified white space: no competitor ships this.

## Panel 1.4 — Voice Logger (⌘⇧K)
**Hold-to-talk voice mode for conversational logging.**

Wireframe:
- Modal dialog 600×550 with glowing blue border (pulsing)
- Large mic icon in center (~120px)
- Animated pulse ring around mic (multiple states)
- State 1 (ready): Text "Hold Space or click to record"
- State 2 (recording, shown): 
  - Red record indicator
  - "Listening... 0:18"
  - Waveform visualization (oscillating bars)
  - "Release to transcribe"
- State 3 (processing): Spinner + "Transcribing..."
- State 4 (preview): Same fields as Panel 1.3 preview but compact
- Cancel button bottom

Notes column:
- Browser MediaRecorder API (works in Chrome, Edge, Safari, mobile browsers).
- Hold spacebar or click-and-hold to record (Superhuman audio message pattern).
- 60-second max per recording.
- Transcription via Whisper (OpenAI API through Supabase Edge Function, server-side key).
- Voice → transcript → same LLM parser as text mode → same preview card.
- Mobile: tap-to-record instead of hold.
- Privacy: audio stored in Supabase Storage, user can purge anytime, never shared.

## Panel 1.5 — Weekly Timesheet Grid
**Summoned via ⌘K "timesheet". Dense power-user grid view.**

Wireframe:
- Header bar: "April 6-12, 2026" with `<` `>` week arrows, "Today" button, date picker icon
- Export buttons top-right: `CSV` (free badge), `PDF` (Pro badge)
- Table:
  - Columns: blank · `Mon 6` · `Tue 7` · `Wed 8` · `Thu 9` · `Fri 10` · `Sat 11` · `Sun 12` · `TOTAL`
  - Client group header: `● ACME`
    - Row: `Landing hero` · `1h 30m` · `2h 15m` · `—` · `45m` · `—` · `—` · `—` · `4h 30m`
    - Row: `Stripe webhook` · `2h 15m` · `1h 20m` · `3h 00m` · `—` · `—` · `—` · `—` · `6h 35m`
  - Client group: `● B CO`
    - Row: `Email discovery` · `25m` · `—` · `1h 15m` · `—` · `—` · `—` · `—` · `1h 40m`
  - Group: `PERSONAL`
    - Row: `Reading` · `18m` · `—` · `30m` · `—` · `—` · `—` · `—` · `48m`
  - Total row: `TOTAL` · daily totals in each column · grand total `13h 33m`
- Side summary panel right:
  - Billable hrs: `12h 45m`
  - Non-billable: `48m`
  - $ total: `$1,275`
  - Top client: Acme ($1,105)

Notes column:
- Power-user density view.
- Click any cell → edit dialog (add/edit entries for that day/project).
- Hover cell → tooltip showing individual entry breakdown.
- Grouped by client with color dots.
- Grand total includes live billable $ computation.
- CSV export free tier, PDF Pro tier.
- Summoned via Cmd+K "timesheet" or G T jump.

## Panel 1.6 — Timeline View (day ribbon)
**Summoned via ⌘K "timeline". Visual chronological day view.**

Wireframe:
- Header: "Monday April 10" with `<` `>` nav, "Today" button
- Horizontal time ruler: `6a · 8a · 10a · 12p · 2p · 4p · 6p · 8p · 10p`
- Timeline ribbon (horizontal swim lane):
  - Ghost outline at 9:00 "Acme Standup" (calendar event not yet logged)
  - Filled block 9:32-11:02 (blue Acme) "Landing hero · 1h 30m"
  - Filled block 11:15-11:40 (green B Co) "Email discovery · 25m"
  - Empty gap 11:40-13:00 (red dashed) "GAP — what did you do?"
  - Filled block 13:00-15:15 (blue Acme) "Stripe webhook fix · 2h 15m"
  - Filled block 15:30-15:48 (gray Personal) "Reading · 18m"
  - Ghost outline 16:00 "Weekly Sync — Acme" (calendar event)
- Below ribbon: "GAPS" header
  - `11:40 - 13:00 · 1h 20m unaccounted · [Fill] [Ignore]`
- Tip text at bottom: "Drag block edges to adjust · Click gaps to fill · Ghost events = calendar, click to claim"

Notes column:
- Scrubbable like a video editor timeline.
- Calendar events (if GCal connected) appear as ghost outlines; one-click to convert to time entry.
- Gaps highlighted red for retroactive logging.
- Blocks color-coded by client for instant visual parsing.
- Drag block edges to adjust start/end.
- Powers the Daily Rewind feature (Panel 2.1) visually.
- Accessible via Cmd+K "timeline" or G L jump.

---

# ROUND 2 — AI FEATURES (5 panels)

## Panel 2.1 — Daily Rewind (⌘R)
**AI reconstructs yesterday (or any past day) from available signals.**

Wireframe:
- Modal 900×750
- Header: "Daily Rewind · Friday April 7, 2026" with date picker
- Hero text (AI summary): "I drafted your day based on **3 calendar events**, **7 GitHub commits**, and **2 existing sessions**. Review and approve below."
- Entry draft list (each row has checkbox + edit icon):
  - ✓ `● Acme · Morning standup · 30m · 9:00-9:30` — badge: `📅 from Google Calendar`
  - ✓ `● Acme · Backend API refactor · 2h 45m · 9:30-12:15` — badge: `🔧 from GitHub (8 commits to api/)`
  - ✓ `○ Lunch · — · 45m · 12:15-1:00` — badge: `⊘ gap (not billable)`
  - ✓ `● B Co · Email batch · 40m · 1:00-1:40` — badge: `⏱ from existing session`
  - ✓ `● Acme · Stripe webhook debug · 2h 10m · 1:40-3:50` — badge: `🔧 from GitHub (5 commits)`
  - ✓ `● Acme · Weekly sync · 45m · 4:00-4:45` — badge: `📅 from Google Calendar`
- Summary strip: "**Total: 7h 05m · $625 billable (6h 10m)**"
- Buttons: "Edit each" (secondary) | "Approve all" (primary large)

Notes column:
- Pulls signals from: Google Calendar events, GitHub commit timestamps + repo paths, existing time_entries, energy data (from N4).
- LLM synthesizes the signals into draft entries with confidence-labeled sources.
- Every entry shows its source badge so user trusts the guess.
- User can uncheck any entry, edit inline, or "Edit each" for a detailed flow.
- "Approve all" creates all entries atomically with single-click acceptance.
- Shown automatically on Monday mornings for prior Friday (settings toggle to disable).
- Requires GCal OAuth (Phase 9 integration) + GitHub OAuth (optional).
- Without integrations: works with calendar events + existing sessions only.
- This is N3 Daily Rewind in research — verified white space. Clockk does this with desktop agent; nobody does web-only.

## Panel 2.2 — AI Invoice Narrative (⌘I)
**Generate an invoice with AI-written line items from session data.**

Wireframe:
- Modal 900×750
- Header: "Invoice · Acme · October 2026" 
- Client selector row: `Acme ▼` · date range: `Oct 1 - Oct 31 2026`
- AI-drafted invoice lines (editable card format):
  - **Line 1: Backend Development**
    - `18h 42m @ $100/hr — $1,870`
    - Description: "Implemented Stripe subscription flow, fixed webhook retry bug, added admin role checks"
    - Small "Regenerate" link
  - **Line 2: Landing Page Design**
    - `9h 15m @ $100/hr — $925`
    - Description: "Hero section redesign, pricing tier layout, mobile responsive polish"
  - **Line 3: Meetings & Sync**
    - `3h 30m @ $100/hr — $350`
    - Description: "Weekly stakeholder syncs (4), sprint planning, launch retrospective"
- Divider
- Subtotal: `$3,145`
- Optional tax line: `Tax (0%) — $0`
- **Total: `$3,145`**
- Buttons: "Edit lines" (secondary) | "Export PDF" (primary)

Notes column:
- LLM reads ALL time entries + notes + voice transcripts for this client in this date range.
- Groups entries by theme (Backend, Design, Meetings) not by raw entry name.
- User can edit any line, regenerate one line, or regenerate all.
- PDF export uses jsPDF (already installed). Simple professional template.
- Light invoicing only per Ali's Q3 decision: PDF + AI narrative. No payment links, no follow-ups, no invoice numbering system beyond basics.
- This is N6 AI Invoice Narrative in research. Harvest closest, but uses literal entry names. Laurel.ai does LLM narratives but costs $10k+/yr for law firms.

## Panel 2.3 — Post-Session Voice Memo
**After stopping a session ≥15 min, optional 30-sec voice memo prompt.**

Wireframe:
- Small toast modal bottom-right 450×320
- Header: "Session complete: Acme · 1h 30m"
- Prompt text: "What did you accomplish? (optional, 30 sec)"
- Big mic button (circle, ~80px) with waveform ring
- Label: "Hold to record · Tap skip to dismiss"
- State 2 (recording): waveform animation + "0:18 / 0:30"
- State 3 (transcribed preview): 
  - Text box showing transcript: "Explored 3 hero layouts, settled on split-screen with CTA right, need Ali's feedback"
  - Buttons: `[Re-record]` `[Save]`
- Skip link (top-right X)

Notes column:
- 30-second max.
- Whisper transcribes; transcript saved to `time_entries.voice_transcript` (searchable).
- Audio file also stored in Supabase Storage (for replay).
- Auto-dismisses after 10s of inactivity (no nagging).
- Triggered only for sessions ≥15 min (configurable in settings).
- Can be completely disabled in settings.
- These memos are GOLD for AI Invoice (Panel 2.2) — they become the invoice line descriptions.
- This is N2 Session Voice Memos in research — verified white space.

## Panel 2.4 — Energy Check-in (morning)
**10-second morning energy rating for Energy × Productivity feature.**

Wireframe:
- Modal 500×450 with soft gradient background
- Greeting: "Good morning, Ali! ☀️"
- Subtext: "How's your energy today?"
- Emoji rating row (5 big emojis, tappable):
  - `😴 1` · `😐 2` · `🙂 3` · `😊 4` · `🔥 5`
- Optional text input below: "One word for today? (optional)"
- Button: "Start day" (primary full-width)
- Skip link small

Notes column:
- Shows ONCE per day on first visit after 6am (configurable hour).
- Disabled toggle in Settings.
- Data saved to `daily_mood` table: `user_id`, `date`, `energy INT 1-5`, `note TEXT`.
- After 14 days of data, Insights page (Panel 3.4) surfaces correlations:
  - "You do your best deep work on days you rate 4+"
  - "Your best window this month is Tue/Wed 9-11am"
  - "You bill 40% more on high-energy days"
- Simple by design — 10 seconds max.
- This is N4 Energy × Productivity Engine in research — verified white space (mood trackers + time trackers exist separately, nobody correlates them for billable productivity).

## Panel 2.5 — Focus Mode (⌘⇧F)
**Full-screen distraction-free single-entry view.**

Wireframe:
- Completely full-screen, dark background `#0f172a`
- Center: project name in large soft text: "Acme · Landing hero"
- Below (huge): elapsed timer "1:23:45" in 120px font
- Below timer (small): "$138 earned this session"
- Very subtle hint bottom: "Space to stop · Esc to exit focus"
- Bottom-right tiny icon: ambient sound toggle (🎵)
- Top-right small icon: break timer indicator (next break in 26 min)

Notes column:
- Cmd+Shift+F enters focus mode on the currently running entry.
- Esc exits back to dashboard.
- Hides ALL UI chrome: nav, sidebar, notifications suppressed.
- Browser tab title updates to show current elapsed time (for users with many tabs).
- Ambient sound options: rain, café, lo-fi, silence (stored in localStorage).
- Break nudges: 25/50/90 minute cycles, configurable, soft pulse not a modal.
- Dark only (no light theme — focus mode is intentionally dark).
- T2.5 nice-to-have differentiator; cheap to build.

---

# ROUND 3 — SUPPORTING SCREENS (7 panels)

## Panel 3.1 — Projects & Clients page
**Master list of clients and their projects.**

Wireframe:
- Page title: "Projects & Clients"
- Layout: 3-column
- LEFT COLUMN (clients list, ~250px):
  - `+ New client` button (primary)
  - Client rows:
    - `● Acme` · `4 projects · active today`
    - `● B Co` · `2 projects · 3 days ago`
    - `● C Corp` · `1 project · 2 weeks ago`
    - `● Personal` · `no client · 3 projects`
  - Selected client highlighted
- MIDDLE COLUMN (projects, ~500px):
  - Header: "Projects for Acme"
  - Sort dropdown + `+ New project` button
  - Project cards (list):
    - `Landing hero` · `$100/hr` · `BILLABLE` · `12h logged` · `active`
    - `Stripe integration` · `$100/hr` · `BILLABLE` · `18h logged`
    - `Onboarding flow` · `$100/hr` · `BILLABLE` · `6h logged`
    - `Weekly syncs` · `NON-BILLABLE` · `3h logged`
- RIGHT COLUMN (project detail, ~350px):
  - "Landing hero" header
  - Fields:
    - Rate: `$100/hr`
    - Estimated time: `10h`  (for actual-vs-estimate analytics)
    - Life area: `Work ▼` (Work/Health/Learning/Personal/Family/Leisure)
    - Tags: `#frontend, #design`
    - Color: `● (picker)`
    - Notes: textarea
    - Created: `Mar 28, 2026`
    - Last activity: `2 hours ago`
    - Logged: `12h / 10h estimate (120% · 2h over)`
  - `Archive` button (soft delete)

Notes column:
- CRUD for projects and clients.
- Client has: name, color, default rate, archived flag.
- Project has: name, client_id (optional), rate override, tags, notes, archived flag.
- Archive = soft delete, preserves historical data.
- Search bar top for fuzzy find across clients + projects.
- Clicking a project's "view entries" link jumps to filtered Today/Timesheet.
- Tier 1 T1.1 feature.

## Panel 3.2 — Tag Management
**Manage tags across all entries.**

Wireframe:
- Page title: "Tags"
- `+ New tag` button primary
- Grid of tag chips:
  - `[#backend 🔵]` · `45 entries`
  - `[#frontend 🟢]` · `32 entries`
  - `[#meetings 🟣]` · `18 entries`
  - `[#deep-work 🟡]` · `28 entries`
  - `[#research 🔴]` · `12 entries`
  - `[#design 🟠]` · `15 entries`
- Each chip: hover reveals edit/delete icons
- Merge dialog (shown as secondary modal):
  - "Merge tags"
  - Select tags to combine
  - "Merge into: [new name]"
  - Confirm button

Notes column:
- Replaces the dead `tags TEXT[]` schema with a real tags table + entry_tags join.
- Each tag: color + name.
- Rename propagates to all entries atomically.
- Merge combines two tags into one (for de-duping typos/variants).
- Entries can have multiple tags.
- Fast tag input on entries: `#` autocompletes.
- Tier 1 T1.5 feature.
- **AI-suggested clusters section** (below manual tags): shows task clusters the AI discovered in free-text entries — "PhynxTimer noticed 8 entries that look like 'Stripe webhook work'". User can accept, rename, or reject. This is the management UI for N7 Task Clustering.
- Accepted clusters become "virtual tags" for analytics — users never have to manually tag if they don't want to.

## Panel 3.3 — Search / Find (⌘F)
**Full-text search across entries and voice transcripts.**

Wireframe:
- Modal 800×650
- Search input with live results: `"stripe webhook"`
- Filter bar: `Client ▼` · `Date ▼` · `Billable ▼` · `Tag ▼`
- Results (ranked by relevance):
  - **Result 1** (entry match)
    - `● Acme · Stripe webhook fix`
    - `Mar 28, 2026 · 2h 15m · $225`
    - Highlighted voice transcript excerpt: `"...fixed the retry logic for the webhook endpoint and added idempotency keys..."`
  - **Result 2**
    - `● Acme · Stripe subscription setup`
    - `Feb 14, 2026 · 3h 40m · $370`
    - Notes excerpt: `"Initial Stripe integration, checkout webhook wiring..."`
  - **Result 3**
    - `● Acme · Stripe webhook debug`
    - `Apr 7, 2026 · 2h 10m · $217`
    - Transcript excerpt: `"debugging the stripe webhook signature validation..."`
- Footer: `12 results · ↑↓ navigate · ↵ jump to entry`

Notes column:
- Full-text search across: entry names, notes, voice transcripts, project names.
- Filters narrow by date range, client, tag, billable status.
- Voice transcript match shows relevant excerpt with the matched phrase highlighted.
- Click result → jumps to that entry in dashboard (scrolls + flashes).
- THIS IS THE PAYOFF for voice memos — finding that thing you worked on weeks ago.
- Postgres full-text search (`tsvector`) for performance.
- Tier 1 T1.9 feature — "every tracker has search" but PhynxTimer's includes voice transcripts.

## Panel 3.4 — Insights (Overview tab)
**The rich multi-section analytics hub. This is the core retention hook — users open PhynxTimer to see themselves.**

Wireframe:
- Header: "Insights" with tab strip: `Overview · Projects · Patterns · Life Balance · Year view`
- Sub-header: date range picker `[Last 30 days ▼]` · compare toggle `vs. previous period`
- Row 1: 6 KPI stat cards (compact grid)
  - `Total tracked: 127h 45m` · small delta `↑ 12% vs prev`
  - `Billable: 98h 12m (77%)` · `↑ $1,620`
  - `Deep work: 61h 20m (48%)` · `↑ 6%` (tooltip: "sessions ≥45 min uninterrupted")
  - `Avg session: 54m` · `↑ 8m` 
  - `Context switches/day: 7.2` · `↓ 2.1`
  - `Streak: 14 days` · flame icon
- Row 2: Time allocation donut (work/personal/health/learning colors) + legend
- Row 3 (2-col): 
  - Left: Bar chart "Hours by project" top 10 (sortable by hours / $ / entries)
  - Right: Bar chart "Hours by tag" (#backend 22h, #design 18h, #meetings 12h, #reading 8h…)
- Row 4: Week-over-week sparkline strip (4 weeks, one line per top-5 project)
- Row 5: AI Insights card (highlighted gradient box)
  - Header: "✨ AI insights"
  - Insight 1: "Your deep-work window is strongest Tue/Wed 9-11am — you log 2.3x more billable hours in that slot"
  - Insight 2: "Backend tasks took you avg 2h 15m this month, **18% faster** than last month"
  - Insight 3: "You haven't logged on Acme in 6 days — stalled?"
  - Insight 4: "Design work has the highest variance (30m to 4h per session) — estimate with +50% buffer"
- Row 6: Billable vs non-billable horizontal split bar (clean, labeled)

Notes column:
- Replaces the current Analytics page's 3 tabs + 40 charts with 5 FOCUSED tabs.
- NO 3D, NO radar, NO network graph, NO treemap kitchen sink.
- Compare toggle shows delta arrows on every metric (core hook — "am I improving?").
- KPIs tuned for the knowledge-worker-who-wants-to-understand-themselves persona, not just billing.
- Deep work metric = sessions ≥45 min with no stop/start. Core efficiency indicator.
- Context switches/day metric = number of project changes per day (lower = better focus).
- Streak counter = consecutive days with any tracked time (gamification + habit reinforcement).
- AI insights use LLM + actual data: duration trends, time-of-day correlations, session patterns, energy overlays.
- Tier 2 + Tier 3 hybrid feature. This is WHY users stay.
- Export CSV top-right.

## Panel 3.4b — Insights (Projects tab) · Project Analytics Deep Dive
**Per-project/task analytics — "how long do X-type tasks take me".**

Wireframe:
- Tab strip active: `Projects`
- Project selector at top: `[Acme ▼]` or `All projects`
- Top section: Project header card
  - Project name + client badge
  - `Total time: 127h 45m · Sessions: 48 · Avg session: 2h 40m`
  - `Billable: $12,775 · Effective rate: $100/hr`
- Row 1: Trend chart "Time per week on Acme" (line chart, 12 weeks)
- Row 2 (2-col):
  - Left: "Session duration distribution" histogram
    - Bins: <30m / 30-60m / 1-2h / 2-4h / 4h+
    - Bars showing count per bin
    - Label: "Most sessions fall in 2-4h band"
  - Right: "Time of day" polar/clock visual
    - 24-hour radial showing when user works on this project
    - Hottest: 9-11am, 2-4pm
- Row 3: Task breakdown list (grouped by tag or entry name pattern)
  - `#backend — 45h · avg task 2h 15m · trend ↓ 18% faster`
  - `#frontend — 32h · avg task 1h 50m · trend → stable`
  - `#meetings — 12h · avg session 45m · trend ↑ 12% more`
  - `#debugging — 18h · avg task 1h 20m · trend ↓ 22% faster`
  - `#planning — 8h · avg 35m`
  - Each row shows: hours, avg duration, trend arrow with %
- Row 4: Efficiency card
  - "Estimated 120h, logged 127h — **6% over estimate**"
  - "Your 3 longest sessions on this project: 4h 45m, 4h 20m, 3h 50m"
  - "Your fastest similar task type: #backend avg improved from 2h 45m → 2h 15m over 3 months"
- Row 5: Money chart "Cumulative $ earned on Acme" (area chart over time)

Notes column:
- This is the **"how long do things take me"** panel — the core analytics hook.
- Task-type breakdown via tags: "how long do my backend tasks usually take?" is a question no current tracker answers well.
- Trend arrows show if the user is getting faster or slower at a task type over time.
- Session duration distribution reveals whether user does deep work or fragmented work on a project.
- Efficiency card compares logged time against user estimates if set (T2.2 goals feature).
- Money chart shows cumulative revenue from a project — satisfying for freelancers to watch grow.
- This panel is the sticky retention hook — users will navigate here to answer "am I improving?"
- Tier 2+ differentiator. No competitor ships per-project analytics this deep.

## Panel 3.4c — Insights (Patterns tab) · Work Patterns & Efficiency
**Behavioral analytics — focus quality, interruptions, best times.**

Wireframe:
- Tab strip active: `Patterns`
- Top row: 4 efficiency KPIs
  - `Deep work ratio: 48%` (gauge: sessions ≥45m as % of total)
  - `Focus score: 7.3/10` (composite: duration + continuity + low switches)
  - `Best day this month: Wed Apr 8 · 6h 40m deep work`
  - `Interruption rate: 7.2/day · ↓ 22% vs last month`
- Row 2: Big time-of-day heatmap (7 days × 24 hours)
  - Darker cells = more tracked time
  - Annotations: "Peak: Tue/Wed 9-11am" arrow pointing to darkest cells
  - Option toggle: "show deep work only" / "show all" / "show billable only"
- Row 3: Two panels side-by-side
  - Left: "Session length trends" 
    - Line chart over 30 days: avg session duration
    - Annotations: "Sessions got 12m longer after removing Slack from browser"
  - Right: "Context switch patterns"
    - Line chart: switches per day over 30 days
    - Goal line overlay
- Row 4: "Focus quality by day of week" bar chart
  - Mon/Tue/Wed/Thu/Fri/Sat/Sun
  - Each bar = avg focus score
- Row 5: Correlation card (if energy data exists, N4)
  - Scatter plot: energy rating (x) vs billable hours that day (y)
  - Trend line + R² value
  - Text: "Strong correlation: each point of energy = +1.4h billable work"

Notes column:
- Pulls from N4 Energy data when available (otherwise hides energy correlation).
- Deep work ratio is the Rize.io metric but self-computed from session continuity (no desktop agent needed).
- Focus score is a composite: `0.4 * deep_work_ratio + 0.3 * (1 - switches/target) + 0.3 * avg_session_norm`.
- Toggle to view "deep work only" filters to ≥45m sessions.
- Correlation scatter only appears after 14 days of energy data.
- Annotations use LLM to generate contextual captions from the data.
- This is pure self-improvement territory — quantified-self users live on this tab.

## Panel 3.4d — Insights (Life Balance tab) · Personal & Free Time
**Track ALL your time, not just billable. Life balance dashboard.**

Wireframe:
- Tab strip active: `Life Balance`
- Top hero: "This month you tracked 248h across 6 life areas"
- Balance wheel (radial chart, 6 segments):
  - Work · 127h (51%)
  - Personal · 35h (14%)
  - Health & Fitness · 22h (9%)
  - Learning · 28h (11%)
  - Family · 24h (10%)
  - Rest & Leisure · 12h (5%)
- Below: "Your balance goal" (user-configurable target split)
  - Target vs actual for each area
  - `Work: 40% target / 51% actual · over by 11%`
  - `Health: 15% target / 9% actual · under by 6%`
- Row 2: Habit streaks (from tags)
  - `#reading — 12 day streak 🔥 · 4.5h this week · goal 5h/wk`
  - `#exercise — 4 day streak · 3h this week · goal 4h/wk`
  - `#meditation — 18 day streak 🔥 · 1h this week · goal 1.5h/wk`
  - `#learning — 8 day streak · 6h this week · goal 5h/wk ✓`
- Row 3: Weekly rhythm (stacked area chart over 8 weeks)
  - Y axis: hours
  - Stacked colors for each life area
  - Shows how balance shifts week to week
- Row 4: Personal goals progress rings
  - `Reading: 18/20h this month` (90% ring)
  - `Learn Spanish: 12/15h` (80% ring)
  - `Workout: 15/20h` (75% ring)
  - `Family time: 24/30h` (80% ring)
- Row 5: "Time you wish you had more of" prompt
  - Shows under-target categories with suggested actions
  - "You're 6h under your health target this month — block 30m/day tomorrow?"

Notes column:
- THIS IS THE QUANTIFIED-SELF HOOK. No time tracker does this well.
- Life areas are user-configurable (default 6: Work, Personal, Health, Learning, Family, Rest).
- Projects/entries are tagged with a life area (can be auto-suggested from project category).
- Balance wheel visualizes the "is my life in balance" question at a glance.
- Target balance is a slider-based settings screen where user says "I want 40% work, 15% health…"
- Habit streaks use tags — `#reading`, `#exercise`, `#meditation` become tracked habits.
- Suggested actions use LLM + calendar integration to propose time blocks.
- Personal goals are a generalized version of Tier 2 goals (T2.1) — work on any life area, not just billable.
- This is the feature that makes PhynxTimer different from Toggl for non-freelancers — **even W2 employees and students want this**.
- Tier 2 differentiator.

## Panel 3.4e — Insights (Year view tab) · GitHub-style Activity Heatmap
**At-a-glance year overview — the retention hook on steroids.**

Wireframe:
- Tab strip active: `Year view`
- Header: `2026` with year nav arrows
- Main visual: GitHub-contribution-style heatmap
  - 52 columns × 7 rows (weeks × days)
  - Each cell colored by hours tracked that day (5 intensity levels)
  - Hover a cell → tooltip: "Wed Apr 8: 7h 40m across 4 projects"
  - Click a cell → jumps to that day's timeline
- Legend: `Less [  ][▪][▫][■][██] More`
- Filter chips: `All · Billable only · Deep work only · #specific-tag`
- Below heatmap: Year summary strip
  - `Total: 1,847 hours · Billable: $146,800 · Best month: March (217h) · Longest streak: 42 days · Current streak: 14 days`
- Row 2: Monthly totals bar chart (12 bars)
- Row 3: "Your year in review" AI card
  - "You tracked 1,847h this year — up 23% from last year"
  - "Your most productive month was March (217h)"
  - "You shipped on 14 distinct projects"
  - "Your deepest focus streak was 42 consecutive days in Feb/Mar"
  - "You billed $146,800 — a personal best"
- Row 4: "Compare to last year" toggle shows two heatmaps stacked

Notes column:
- Visual hook: looks like GitHub contributions graph — instantly understood.
- Users will come back to "fill in the cells" — gamification without being manipulative.
- Filter chips let you see different slices: billable year, reading year, exercise year.
- Compare-to-last-year is the "am I improving" question answered visually.
- AI "year in review" generates end-of-year summary (can become a social share card).
- Tier 2 differentiator. Cheap to build. Huge retention payoff.
- Pure data, no fluff.

## Panel 3.5 — Reports page (slimmed)
**Table view with export, minimal styling.**

Wireframe:
- Header: "Reports"
- Filter bar: Date range · Client · Project · Tag · Billable toggle
- Export buttons: `CSV` (free), `PDF` (Pro badge)
- Data table:
  - Columns: `Date · Project · Client · Duration · Rate · $ · Notes`
  - Rows (example data, 6 rows)
- Footer: `87 entries · Total: 127h 45m · $9,820`

Notes column:
- Simpler than current reports page.
- Removes the current paywall on entire Reports page.
- CSV export is now FREE (Reddit feedback: hard-gating CSV kills retention).
- PDF export (basic formatting) stays Pro.
- AI Invoice Narrative (Panel 2.2) is a separate Pro feature with different UX.
- Used for raw data dumps and tax-time exports.
- Tier 1 T1.11 + T1.13 features.

## Panel 3.6 — Settings (3 tabs)
**Account, Subscription, Integrations.**

Wireframe:
- Title: "Settings"
- Tab strip: `Account · Subscription · Integrations`
- ACCOUNT tab selected (shown):
  - Section: Profile
    - `Email: ali@example.com`
    - `Display name: [Ali Mabsoute]`
    - `Change password →`
  - Section: Preferences (toggles)
    - `Morning energy check-in` [on/off]
    - `Post-session voice memo prompts` [on/off, min-session threshold slider]
    - `Auto Daily Rewind on Mondays` [on/off]
    - `Idle detection threshold: 10 min` [slider 5-30]
    - `Theme: System · Light · Dark` [radio]
    - `Week starts on: Monday · Sunday` [radio]
  - Section: Danger zone
    - `Export all data` button
    - `Delete account` red button

Notes column:
- Drops Activity tab (duplicates Dashboard).
- Drops Security tab (folds into Account).
- NEW Integrations tab:
  - `Google Calendar` — connect button (required for Daily Rewind + Timeline)
  - `GitHub` — connect button (optional, boosts Daily Rewind)
  - `Webhook API access` — Pro only, shows API key
  - `Import from Toggl/Clockify` — file upload
- Subscription tab: plan status + upgrade button + feature comparison.
- Theme toggle + dark mode audit happens in Phase 7.

## Panel 3.7 — Idle Detection + Manual Past Entry (combined)
**Two related dialogs shown on one panel.**

Wireframe (split into two mini-wireframes):

LEFT HALF: Idle Detection prompt
- Toast modal top-right 420×280
- Warning icon
- Title: "You've been idle 10 minutes"
- Body: "Still working on **Acme · Landing hero**?"
- Buttons (stacked):
  - `Keep the 10m (still working)` (primary)
  - `Discard last 10m`
  - `Discard and stop timer`

RIGHT HALF: Manual Past Entry dialog
- Modal 550×600
- Title: "Add past time entry"
- Fields:
  - Project: `[Acme ▼]`
  - Client: `Auto (from project)`
  - Date: `[April 9, 2026 📅]`
  - Start time: `[2:00 PM]`
  - End time: `[3:30 PM]`
  - Duration (computed): `1h 30m`
  - Billable toggle: `● Billable · $150`
  - Tags: `[#frontend] [#design] [+]`
  - Notes: `textarea`
- Buttons: `Cancel` · `Save entry`

Notes column:
- **Idle detection**: triggers after N minutes (5/10/15/30, configurable) with no keyboard/mouse while a timer is running.
- Detected via `visibilitychange` + mouse/key listeners in browser.
- Tier 1 T1.7 feature — universal competitor expectation.
- **Manual past entry**: accessible via Cmd+K "log yesterday 2-3pm on Acme" (AI parses) OR via a `+ Add` button in the timesheet grid.
- Both are table stakes — cannot ship without them.

---

# ROUND 4 — MOBILE RESPONSIVE (4 panels)

## Panel 4.1 — Today (mobile portrait)
**Responsive single-column version.**

Wireframe (phone frame ~390×844):
- Status bar
- App header: hamburger icon · `PhynxTimer` · avatar
- Ticker strip (horizontal scroll): `This week: $1,420 · Today: $180 · Acme: $150 →`
- AI hero sentence (wraps to 2-3 lines): "You've logged 3h 12m today · $180 billable"
- Running entry card (if any): `● Acme · Landing hero · 0:42:15 · [Stop]`
- Big primary button full-width: `+ Log time`
- Section label: `TODAY`
- Entry rows (compact, 2 lines each):
  - `● Acme · Landing hero`
    `90m · $150 · 9:32`
  - `○ B Co · Email discovery`
    `25m · $40 · 8:55`
  - `○ Personal · Reading`
    `18m · 8:30`
- Scroll indicator
- Bottom tab bar (fixed): `Today · Timesheet · Timeline · Insights · ⋯`

Notes column:
- NO Cmd+K on mobile (no keyboard). Big `+ Log time` button replaces it.
- Tab bar at bottom = mobile app convention.
- Rows tappable for detail.
- Swipe-left on row reveals quick actions (start, edit, delete).
- Running entry always visible at top as a prominent card.
- Uses responsive breakpoints (md: 768px as boundary).
- Pull-to-refresh gesture supported.

## Panel 4.2 — Log time (mobile, conversational logger)
**Mobile version of Cmd+K "log" — bottom sheet modal.**

Wireframe (phone frame):
- Full-screen modal, slides up from bottom
- Header: `Log time` · close X
- Large text input: "What did you work on?"
- Big mic button (prominent, centered): 🎙 `Tap to record`
- Preview card (stacked vertically):
  - Project: `Acme ▼`
  - Duration: `1h 30m`
  - When: `90m ago → now`
  - Billable: `● $150`
  - Notes: `hero section`
- Sticky footer button: `Save entry` (full-width, primary)

Notes column:
- Voice input prominent on mobile — biggest "wow" moment on phone.
- Stacked layout (no side-by-side preview).
- Keyboard appears automatically on open.
- Mic button uses MediaRecorder in mobile browsers (supported in modern Safari/Chrome iOS/Android).
- Tap-to-record instead of hold-to-record for better mobile ergonomics.

## Panel 4.3 — Timesheet (mobile)
**Week grid adapted for small screen.**

Wireframe (phone frame):
- Header: `Apr 6-12 2026` with `<` `>` nav
- Horizontal scrollable table:
  - Sticky left column: project names (narrow)
  - Scrollable day columns
  - Shown: Mon · Tue · Wed (scroll right for Thu-Sun)
- Rows:
  - `ACME` header
  - `Landing hero · 1h 30m · 2h 15m · —`
  - `Stripe · 2h 15m · 1h 20m · 3h`
  - `B CO` header
  - `Email · 25m · — · 1h 15m`
- Bottom strip: `TOTAL 13h 33m · $1,275 billable`
- FAB bottom-right: `+` (add entry)

Notes column:
- Horizontal scroll handles 7 days + total column.
- Sticky first column for context on scroll.
- Tap a cell → full-screen edit for that day/project combo.
- For mobile, the Timeline view (4.4) is often more useful; this exists for power users who learned the pattern on desktop.

## Panel 4.4 — Timeline (mobile)
**Vertical day timeline — rotated from desktop horizontal ribbon.**

Wireframe (phone frame):
- Header: `Mon Apr 10` with `<` `>` nav, `Today` button
- Vertical timeline list (scrollable):
  - Time label left: `9:00`
    - Block: `● Acme · Landing hero · 1h 30m · $150`
  - `11:15`
    - Block: `○ B Co · Email discovery · 25m · $40`
  - `11:40` (gap start)
    - Dashed block: `GAP · 1h 20m unaccounted · tap to fill`
  - `13:00`
    - Block: `● Acme · Stripe webhook · 2h 15m · $225`
  - `15:30`
    - Block: `○ Personal · Reading · 18m`
- FAB bottom-right: `+ Log`

Notes column:
- Vertical timeline is natural for mobile (scrolling feels right).
- Gaps highlighted for retroactive logging.
- Tap any block to edit.
- FAB for quick new entry (opens conversational logger bottom sheet).
- Calendar events appear as subtle outlined blocks if GCal connected (desaturated).
- Colors still used for visual client distinction.

---

# END OF SPEC

22 total panels: 6 core + 5 AI + 7 supporting + 4 mobile.
