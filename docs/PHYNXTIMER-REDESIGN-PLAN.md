# PhynxTimer — Redesign Plan

**Status**: Draft v2 · 2026-04-10 (v2 adds analytics-as-core-hook pillar + task clustering)
**Based on**: `PHYNXTIMER-REDESIGN-RESEARCH.md` (56 pages of codebase audit + competitive research on 15 time trackers + productivity apps)
**Purpose**: The action doc. Research answers "what do we know"; this answers "what are we doing".

---

## TL;DR

1. **PhynxTimer becomes the quantified-self time tracker.** Track work + personal + health + learning. The hook is time; the product is *friction-free capture + deep analytics that show you how you actually spend your hours and help you get faster at what you do*.
2. **Two equal pillars**: (a) LLM-native capture (conversational logger, voice, command-bar-first UI) and (b) deep analytics as the retention hook (project deep dive, patterns, life balance, year heatmap, AI task clustering).
3. **The circular clock grid dies.** So do the animations, the 3D charts, the pomodoro-in-the-circle, the priority picker, the deadline picker-on-timer, the bloated Calendar, and the Advanced Analytics tab.
4. **The data model shifts** from "timers are perpetual counters" → "time entries are atomic log lines, projects are the lookup". Additional fields added for life areas, estimates, and session continuity (for deep-work analytics).
5. **Six novel features** anchor the differentiated product: Conversational Logger, Voice Session Memos, Daily Rewind, Energy × Productivity Engine, AI Invoice Narrative, **AI Task Clustering** (new — makes free-text entries analyzable without rigid taxonomy).
6. **7 phases, ~10 weeks of focused work.** Phase 4 completes the Phase-1-migration debt first (non-negotiable), then the redesign lands in Phases 5-10.

---

## The two pillars

**Pillar 1 — Friction-free capture (the hook)**
> The user shouldn't have to *start a timer* to track their work. They should be able to say what they did and have the AI turn it into a structured time entry. Text or voice. 4 seconds total. Command-bar-first UI absorbs all other interactions.

**Pillar 2 — Deep analytics (the retention)**
> The user should open PhynxTimer daily to see themselves. How long did similar tasks take them last month vs this month? Where does their time actually go across work and life? What's their focus quality trending? Are they improving? No other tracker answers these questions well because they all treat analytics as a reporting afterthought for billing. PhynxTimer treats analytics as the reason you come back.

Every feature and cut serves one or both pillars.

## Core insight from the research

> **"I forgot to start the timer"** is the #1 complaint in every freelancer time-tracking thread surveyed. Every competitor tries to solve it with passive background tracking (desktop apps, screenshots, activity monitoring). All of those solutions trade privacy for convenience — and users resent them for it.
>
> **The LLM-native solution solves the same problem without surveillance.** You don't need to *start* the timer mid-work — you just describe what you did when you pause. Natural language → structured time entry. Voice or text. 4 seconds total.
>
> **No tracker ships this.** Timely, Clockk, Rize, TimeCamp all have "AI-suggested entries" but all are form-based at the end. None treat the input as a chat. This is the biggest wedge in the 2026 time tracker market and it closes by end-of-year as incumbents wake up.

**This is the thesis the whole redesign serves.** Every feature, every UI decision, every cut flows from: *"Does this make logging work effortless, or does it add friction?"*

---

## The new product identity

**What it is**: A command-bar-first time tracker + light productivity tool for freelancers and solo knowledge workers who bill hourly. The primary interface is a Cmd+K text/voice input. The product is organized around *verbs*, not screens.

**What it isn't**:
- Not an employee-monitoring tool (no screenshots, no activity levels, no surveillance-adjacent features — ever)
- Not a project management tool (no kanban, no sprints, no assignees)
- Not a team collaboration tool (solo-first; team features are a post-v2 question)
- Not a calendar replacement (it *reads* your calendar, doesn't own it)
- Not a Toggl clone (if a user wants a spreadsheet grid, they can get it — but it's the secondary view, not the default)

**Who it's for**: Solo freelancers / contractors / consultants who bill hourly to 1-8 clients, live in their browser, and lose money because they forget to log time or write vague invoice descriptions.

**The promise**:
> "Log what you did by saying it. Invoice in one click. See the money."

**Proposed tagline**: *"Log time like you text a friend."*

---

## Part 1 — What dies

Everything below gets cut in the redesign. Deletion is a feature — the current codebase is drowning in cruft. Deleting these directly serves the thesis (less friction, less noise).

### Visual / UX cuts
- **Circular timer cards** (`TimerCard.tsx`, `TimerCircleBorder.tsx`, `TimerRunningIndicator.tsx`) and all 16 supporting components
- **Edit form overlay inside the circle** (awkward)
- **Fireworks / sparkles / balloons / confetti on timer creation** (`CelebrationAnimations.tsx`, `EnhancedAnimationManager`)
- **Drag-to-reorder timer grid** (`react-beautiful-dnd` usage for grid) — order isn't even persisted
- **Priority picker (1-5) embedded in the timer card** — dead feature for hourly billers
- **Deadline picker embedded in the timer card** — belongs in a calendar, not here
- **Pomodoro mode inside the card** — becomes its own Focus Mode later if at all
- **Dashboard PDF export buttons** (html2canvas screenshots) — hideous output
- **Analytics "Advanced" tab** (3D bubble chart, radar, network graph, treemap)
- **Calendar 3D visualizations** (`TimerBubbleChart3D`, `BubbleScene3D`, `Enhanced3DBubble`, etc.)
- **Landing page floating particles + rotating gradients** (dated SaaS aesthetic)

### Code / dependency cuts
- `three`, `@react-three/fiber`, `@react-three/drei` (~400KB gzipped saved)
- `react-circular-progressbar` (no circles left)
- `react-beautiful-dnd` (unmaintained; replace with dnd-kit only if a future feature needs it)
- `html2canvas` usage (keep only if the Reports page needs it; otherwise cut)
- `foodManufacturerData.ts` (Lovable leftover)
- Three mock-data migrations (`20250712144933/145014/145931`)

### Schema cuts / reshapes
- **`goals` / `goal_progress` / `goal_milestones`** tables → drop. If goals come back, rebuild minimally. Zero UI = zero value.
- **`user_roles` / `app_role`** → drop until an admin dashboard actually exists.
- **`tags TEXT[]` column on timers** → either build a real tag system (Phase 6) or drop. No dead schema.
- **`timers.priority SMALLINT`** → drop
- **`timers.deadline TIMESTAMPTZ`** → drop (becomes calendar-event-linked if needed)

### Restriction cuts
- **"3 free timers / 3 free running timers"** hard cap → killed. Replace with: **unlimited free projects + entries, AI features (logger, voice memos, Daily Rewind, AI invoices) and integrations gated behind Pro**. Reddit evidence: hard caps are the top reason freelancers abandon trackers in <2 weeks.

---

## Part 2 — What survives (and what it becomes)

| Today | Tomorrow |
|---|---|
| `timers` table as permanent counters | **`projects`** table (the lookup). Keeps `name`, `category` → `client_id`, `billable`, `hourly_rate`. Drops `elapsed_time`, `priority`, `deadline`. |
| `timer_sessions` as secondary | **`time_entries`** — THE atomic unit. Each has `project_id`, `start_at`, `end_at`, `duration_ms`, `notes`, `voice_transcript`, `billable_rate`, `source` (`manual`, `timer`, `conversational`, `voice`, `calendar_import`, `ai_rewind`). |
| Dashboard = grid of clocks | **Dashboard = Today view**. One hero sentence (AI-generated), today's entries as a dense list, a persistent Cmd+K hint bar, live "$ billable this week" ticker strip, current running entry pinned top-right. |
| Analytics = 3 tabs, 40+ charts | **Insights** — single page, 4 widgets: hours by project bar chart, billable vs non-billable split, productivity pattern cards (when you do best work), invoice-ready-to-send reminder. |
| Calendar = 110 components | **Timeline view** — one horizontal day-ribbon + a simple month-grid toggle. Scrubable. Edit-in-place. ~15 components max. |
| Reports = paywalled PDF/CSV table | **Reports** — kept, de-paywalled for CSV. PDF stays Pro. |
| Settings = 4 tabs | **Settings** — 3 tabs (Account, Subscription, Integrations). Security + Activity folded in. |
| Free = 3 timers | Free = unlimited projects + entries + manual logging. Pro = AI features + integrations + invoice generation. |

---

## Part 3 — The feature set (decided)

### Tier 1 — Expected (must-ship table stakes + core analytics)

These are what every serious tracker has PLUS the deep analytics that make PhynxTimer worth opening daily. No negotiation — they're the price of admission.

| # | Feature | Why |
|---|---|---|
| T1.1 | **Projects + Clients** as first-class entities | The data model shift |
| T1.2 | **Time entries** as discrete log lines | Core concept shift |
| T1.3 | **Manual past entry** (add yesterday 2-3pm for Client X) | Universal expectation |
| T1.4 | **Weekly timesheet grid** view (days × projects) | Top Reddit feature request; secondary view summoned from Cmd+K |
| T1.5 | **Tags + tag management UI** | Complete what the schema started; tags double as habit trackers |
| T1.6 | **Per-project + per-client billable rates** | Multi-client freelancer must-have |
| T1.7 | **Idle detection** (stop timer after N min inactivity, ask to keep/discard) | Universal competitor feature |
| T1.8 | **Keyboard shortcuts** (Cmd+K, Space=start/stop, N=new, J/K=navigate) | Power-user price of admission |
| T1.9 | **Search + filter** across entries | Must exist |
| T1.10 | **Entry notes field** (multiline) | For invoice line-items |
| T1.11 | **CSV export** (free tier) | Lock-in prevention builds trust |
| T1.12 | **Dark mode / light mode** (system-following) | 2026 baseline |
| T1.13 | **Basic invoicing** (date range → PDF with line items) | Harvest-lite; differentiates from Toggl |
| **T1.14** | **Life areas** (Work, Health, Learning, Personal, Family, Leisure) — entries taggable to a life area with user-configurable targets | Enables life balance dashboard; the quantified-self hook |
| **T1.15** | **Project time estimates** (set "this should take 10h" on project creation) | Enables actual-vs-estimate analytics |
| **T1.16** | **Goals** (weekly/monthly targets per project, per life area, per tag) | Required for life balance + habit tracking |
| **T1.17** | **Insights hub (5 tabs)**: Overview, Projects deep dive, Patterns, Life Balance, Year heatmap — see wireframe panels 3.4 through 3.4e | The retention hook. Analytics is the reason users open the app daily. |
| **T1.18** | **Streak tracking** — consecutive days with tracked time (per-area / per-tag / overall) | Habit reinforcement; fuels Year view |
| **T1.19** | **Compare periods** — every metric has "vs previous period" delta | "Am I improving" is the core question the app must answer |

### Tier 2 — Nice-to-have differentiators

Goals moved to Tier 1 (now T1.16). These are the remaining 5 picks.

| # | Feature | Why picked |
|---|---|---|
| T2.1 | **Weekly digest email** (Sunday: last week's hours, top projects, money, habit streaks, one AI insight) | Retention hook, cheap to build |
| T2.2 | **"Today" AI hero sentence** on dashboard ("You've logged 3h 12m · $180 billable · 18% above weekly avg") | Replaces the circle grid opening screen; micro-analytics embedded |
| T2.3 | **CSV import from Toggl/Clockify** | Removes switching cost, trust signal |
| T2.4 | **Focus Mode** (full-screen single-entry view, ambient sounds, Cmd+Shift+F toggle) | Emotional differentiator, costs nothing |
| T2.5 | **Live "$ billable this week" ticker strip** in the header always | Signature motivator; see N9 in research |
| T2.6 | **Shareable "Year in Review" card** (end of year, generates a visual summary for social) | Viral loop + personal closure ritual |

**Explicitly NOT shipping** (deferred past v2 unless strongly requested):
- Team features / workspaces
- Client portal
- Rate cards with historical versioning
- Stopwatch floating window widget
- Mobile native apps

### Tier 3 — Novel (the wedge, 6 picked)

These are what make PhynxTimer worth switching to. Most live inside the Cmd+K command bar as verbs; N7 runs passively in the background. All are Pro-tier features. All are verified white space.

#### **N1. Conversational Time Logger** ⭐ *the flagship*
> Cmd+K → "log" opens a chat input. User says or types: "just spent 90 min on the Acme landing hero, billable." LLM parses (project=Acme landing, duration=90m, billable=true, notes="hero section") → one-line preview → Enter to accept.
>
> **Voice**: Cmd+Shift+K opens voice mode. Hold-to-talk. Whisper transcribes → same LLM → same preview.
>
> **The wedge**: nobody in 15 competitors ships this. This is *the* differentiator.

#### **N2. Session Voice Memos + Searchable Transcripts**
> Stop a session → optional 30-sec voice prompt "what did you accomplish?" → Whisper transcribes → attached searchable to the entry.
>
> Weeks later: Cmd+K → "find Stripe webhook" → all entries with Stripe webhook in voice/text notes return ranked by recency.
>
> **The wedge**: Otter does this for meetings. No time tracker does it per-session.

#### **N3. Daily Rewind** ("AI reconstructs yesterday")
> Monday morning, PhynxTimer opens with an AI-drafted timesheet of Friday based on: calendar events, GitHub commits (if connected), browser extension domain time, existing sessions. User approves/edits in one screen.
>
> **The wedge**: Clockk does this with a desktop agent. Web-only version using calendar + extension + GitHub doesn't exist.

#### **N4. Energy × Productivity Engine**
> Optional 10-second morning check-in: "Energy today?" (1-5 emoji). After 2-3 weeks, PhynxTimer surfaces: "Your best deep-work window this month was Tue/Wed 9-11am — you billed 40% more those mornings than any other slot."
>
> **The wedge**: mood apps track mood, time apps track time, nobody correlates them for billable productivity insights.

#### **N6. AI Invoice Narrative**
> Cmd+K → "invoice Acme October" → LLM reads all Acme time entries + session notes + voice transcripts for October → drafts human-readable invoice lines ("Backend Development — 18h 42m — Implemented Stripe subscription flow, fixed webhook retry bug, added admin role checks — $1,870"). User approves in one click → PDF.
>
> **The wedge**: Harvest uses literal timer names as invoice lines. Laurel.ai does LLM narratives but costs $10k+/year and targets law firms. Freelancer-grade LLM invoicing doesn't exist.

#### **N7. AI Task Clustering & Duration Learning** ⭐ *the analytics engine*
> PhynxTimer's entries are free text ("fix stripe webhook", "debug webhook retry logic", "stripe idempotency keys"). An LLM runs passively in the background, clusters semantically similar entries into canonical task types, and surfaces duration analytics per cluster. Over time you see "Stripe webhook work: 8 sessions, avg 1h 45m, **18% faster this month**" without ever tagging anything.
>
> **User story**: Ali logs entries normally. After 2 weeks, Insights > Projects shows him "Your backend tasks are trending 20% faster. Your design tasks are trending 10% slower." He didn't set up a single tag or category — the AI inferred the patterns.
>
> **Feasibility**: Moderate. Supabase edge function runs periodic clustering on user's entries (embedding-based similarity + LLM for cluster naming). Cached in `task_clusters` table. Fast enough to run nightly per user; real-time inference on new entries via embeddings.
>
> **The wedge**: Every tracker requires rigid taxonomy (tags, projects, categories) for analytics to work. PhynxTimer lets users write free text and does the categorization for them. **This is what makes the deep analytics hook actually work** — otherwise users have to be disciplined about tagging, and the research shows they won't be. Verified: no tracker ships this.

**Cut from research (not shipping in first redesign)**:
- N5 Smart Context-Switch Interrupt (needs browser extension — defer to Phase 10)
- N7 4pm Check-in (nice, not essential)
- N8 Cold-start project alerts (low frequency value)
- N10 Meeting auto-log (calendar sync first, this is a wrapper on it)
- N11 Timeline scrubber (rolled into Tier 1 T1.4 timesheet view)
- N12 Session Debrief summary (overlaps with N2 voice memos)

---

## Part 4 — UI direction: Option C (Command-bar-first)

The research laid out three options. The decision is **Option C** — Command-palette-first. Rationale (short version):

1. Directly attacks the #1 user pain (friction-interrupts-flow) in a way Options A and B don't.
2. Naturally absorbs Options A and B as secondary views summoned via Cmd+K.
3. Maps 1:1 onto the Tier 3 novel features (logger, voice, rewind, invoice, focus — all become command-bar verbs).
4. Forces the circular-clock grid to die by construction.
5. PhynxTimer is a solo-dev project; it can't win the "more fields in the edit dialog" game. It can win the "fastest, least-friction, most-delightful logging in the market" game.

### What the main surface actually looks like

```
┌────────────────────────────────────────────────────────────────┐
│ PhynxTimer       [This week: $1,420 billable · ●● Acme 0:42:15]│  ← persistent header strip
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ "You've logged 3h 12m today · $180 billable · last 40m ago"   │  ← AI hero sentence
│                                                                │
│  Cmd+K   What did you do?  (or press / to start typing)        │  ← command bar hint
│                                                                │
│ ─── TODAY ─────────────────────────────────────────────────    │
│                                                                │
│  ● Acme · Hero section           90m   $150   9:32-11:02  ⋯    │
│  ○ B Co · Email discovery        25m   $40    8:55-9:20   ⋯    │
│  ○ Personal · Reading            18m   —      8:30-8:48   ⋯    │
│                                                                │
│ ─── YESTERDAY ─────────────────────────────────────────────    │
│                                                                │
│  (3 entries, tap to expand)                                    │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

- No circles. No animation. No 3D. No priority pickers.
- Dense, scannable, professional.
- Cmd+K is the entry point for *everything* that isn't "click that entry to edit it."

### Command palette verbs (v1)

```
Cmd+K  "log"      → Conversational Time Logger (N1)
Cmd+K  "start"    → quick-start on a project by fuzzy name
Cmd+K  "stop"     → stop the running entry
Cmd+K  "go"       → jump to any project/client by fuzzy name
Cmd+K  "find"     → search entries by text/voice content
Cmd+K  "rewind"   → Daily Rewind (N3)
Cmd+K  "invoice"  → AI Invoice Narrative (N6)
Cmd+K  "focus"    → enter Focus Mode (T2.5)
Cmd+K  "new"      → new project / new client / new tag
Cmd+K  "timesheet"→ open weekly timesheet grid (T1.4)
Cmd+K  "timeline" → open day timeline view
Cmd+K  "reports"  → open reports
Cmd+K  "settings" → open settings
```

Every verb shows its keyboard shortcut next to it, so users passively learn to skip the palette (Superhuman's pattern).

---

## Part 5 — Roadmap (phased, realistic)

**Assumption**: solo-dev time, 5-10 focused hours per phase unless noted. Each phase is a shippable milestone. No phase depends on a later phase. User can ship after any phase and have a better product than the current state.

### Phase 4 — Clean up Phase 1's debt (UNBLOCK EVERYTHING) · ~6 hours
Phase 1 left the old `src/components/` tree (266 files) intact while adding the new `src/features/` tree. Grep shows 59 files still import `@/components/*` and 22 still import `@/hooks/*`. You cannot cleanly redesign on two parallel trees.

**Scope**:
- Complete the migration: move all live files from `src/components/` → their correct `src/features/` or `src/shared/` homes
- Delete the legacy `src/components/` tree, `src/hooks/` tree, `src/utils/mock*.ts`, `src/utils/foodManufacturerData.ts`
- Consolidate the three duplicate mock-data migrations into one seed script (or just delete them)
- Fix the latent multi-running-timer bug: reconcile the DB `ensure_single_running_timer` trigger with the frontend's multi-concurrent behavior. Recommendation: enforce single-running in the frontend too.
- Build still passes, routes still work.

**Deliverable**: clean single-tree codebase, all tests pass, zero legacy imports.

### Phase 5 — Data model shift · ~10 hours
This is the structural redesign. Everything after this phase is UI.

**Scope**:
- Migration: rename `timers` → `projects`. Drop `elapsed_time`, `is_running`, `start_time`, `priority`, `deadline`, `tags`. Keep `name`, `billable`, `hourly_rate`. Add `client_id` FK, `life_area_id` FK, `estimated_minutes INT`, `color`, `archived_at`.
- Migration: rename `timer_sessions` → `time_entries`. Add `project_id`, `life_area_id`, `notes TEXT`, `voice_transcript TEXT`, `voice_audio_url TEXT`, `source TEXT`, `is_deep_work BOOLEAN` (computed), `created_at`.
- Drop `goals`, `goal_progress`, `goal_milestones`, `user_roles`, `app_role` (all replaced with simpler versions below).
- New `clients` table: `id`, `user_id`, `name`, `color`, `default_rate`, `archived_at`, `created_at`.
- New `tags` table + `entry_tags` join table (color + name).
- **New `life_areas` table**: `id`, `user_id`, `name`, `color`, `icon`, `target_percent`, `sort_order`. Seeded with 6 defaults: Work, Health, Learning, Personal, Family, Leisure.
- **New `goals` table** (simple, replacing the dead schema): `id`, `user_id`, `scope` (enum: `project`, `client`, `tag`, `life_area`), `scope_id`, `target_minutes`, `period` (enum: `week`, `month`), `start_date`, `archived_at`.
- **New `daily_mood` table**: `id`, `user_id`, `date`, `energy INT 1-5`, `note TEXT`.
- **New `task_clusters` table**: `id`, `user_id`, `canonical_name`, `member_entry_ids UUID[]`, `embedding VECTOR`, `avg_duration_ms`, `last_updated_at`. Populated by the Phase 8 AI task clustering job.
- Backfill script: convert existing `timers` rows → `projects` rows; convert `timer_sessions` → `time_entries`; preserve data. Default-assign all existing projects to the "Work" life area.
- Update all frontend code to use the new model. `useDeadSimpleTimers` → `useTimeEntries`. Same hook shape, new table behind it.

**Deliverable**: new schema live, all existing data preserved, app works on new model, old UI still (temporarily) functional.

### Phase 6 — New Dashboard + Command Bar v1 · ~10 hours
The big UI swap. The circle grid dies.

**Scope**:
- New `DashboardPage.tsx`: persistent header strip (live billable counter + running entry pill), AI hero sentence, Cmd+K hint bar, today's entries list, yesterday collapse
- Build the command palette component (`cmdk` library, already React-compatible)
- Wire verbs: `log`, `start`, `stop`, `go`, `new`, `find`, `settings`, `timesheet`, `timeline`, `reports`
- Entry row component: name, project, duration, money, time range, inline edit
- Delete old TimerCard + all 16 supporting components + animation components
- Remove `three`, `@react-three/fiber`, `@react-three/drei`, `react-circular-progressbar`, `react-beautiful-dnd` from package.json
- Add global Space = start/stop, J/K = navigate entries, N = new entry

**Deliverable**: entirely new dashboard experience. The app no longer looks or feels like the current PhynxTimer.

### Phase 7 — Tier 1 essentials + Insights foundation · ~18 hours
Ship the table stakes PhynxTimer is missing PLUS the core analytics hub. Analytics is Tier 1 now, not a deferred Tier 2.

**Scope — basics**:
- Projects & Clients management page (create/rename/archive/set rates, **set estimates**, **assign life area**)
- Life Areas settings page (rename/reorder/set target %)
- Goals UI (create weekly/monthly targets per project/client/tag/life area)
- Manual past entry dialog
- Tags UI (create, color, assign to entries, merge)
- Weekly timesheet grid view
- Timeline view (day ribbon, basic version)
- Idle detection
- Entry notes field
- Search + filter across entries
- CSV export (de-paywalled)
- Dark/light mode audit + fixes
- Update paywall: remove "3 timer cap," gate AI + clustering behind Pro

**Scope — Insights hub (5 tabs, see wireframe panels 3.4 to 3.4e)**:
- Tab 1 — Overview: 6 KPIs with compare-period deltas, time allocation donut, hours-by-project bar, hours-by-tag bar, week-over-week sparkline, billable split
- Tab 2 — Projects deep dive: per-project trend chart, session duration distribution histogram, time-of-day polar chart, task breakdown by tag with trend arrows, efficiency card, cumulative $ chart
- Tab 3 — Patterns: deep work ratio gauge, focus score, time-of-day heatmap, session length trend, context switch patterns, day-of-week focus quality, energy × billable scatter (if N4 data exists)
- Tab 4 — Life Balance: balance wheel radial, target-vs-actual bars, habit streaks by tag, weekly rhythm stacked area, goal progress rings, under-target suggestions
- Tab 5 — Year view: GitHub-style contribution heatmap (52 weeks × 7 days), filter chips, monthly totals, year-in-review AI card, compare-to-last-year toggle
- Compare-period toggle on every tab
- Streak counter on dashboard + Year view
- Export CSV per tab

**Deliverable**: feature-complete against Toggl/Clockify baseline PLUS a deeper analytics hub than any competitor. At this point PhynxTimer is already a better tool than today, even before the Tier 3 AI features ship.

### Phase 8 — Novel AI features: N1 + N2 (Logger + Voice) · ~14 hours
The wedge goes in.

**Scope**:
- Supabase Edge Function `conversational-log`: takes user text/audio → Whisper (audio) → Claude/GPT (parse) → returns `{ project_id, duration_ms, start_at, end_at, billable, notes }` preview
- Cmd+K "log" wires to the edge function; preview modal; enter-to-accept
- Voice mode: Cmd+Shift+K, hold-to-talk, MediaRecorder → edge function
- End-of-session voice memo flow: optional "what did you accomplish?" 30-sec prompt on stop
- Storage bucket for voice audio (Supabase Storage); transcript stored in `time_entries.voice_transcript`
- Voice transcript search (Postgres full-text or ILIKE for v1)
- LLM cost capping per user per day (free tier = 0, Pro = generous)

**Deliverable**: the flagship features are live. The product now has a genuinely unique wedge.

### Phase 9 — Novel AI features: N6 + N3 (Invoice + Rewind) · ~14 hours
Extract money from the AI.

**Scope**:
- Google Calendar OAuth integration (read-only scope)
- GitHub OAuth integration (optional, read-only commits)
- Edge Function `daily-rewind`: takes date, returns AI-drafted entries based on calendar events + commits + existing sessions
- Cmd+K "rewind" UI: shows drafts for a day, user approves each or all
- Edge Function `ai-invoice-narrative`: takes client_id + date range → reads all entries + notes + transcripts → returns structured invoice lines
- Cmd+K "invoice" UI: draft preview → edit → PDF export
- PDF generation (jsPDF already installed)

**Deliverable**: two more novel features live. Pro tier now has 4 clear AI value props.

### Phase 10 — N4 Energy × Productivity + N7 AI Task Clustering + polish · ~12 hours
Close out v2 with the remaining Tier 3 features that plug directly into the analytics hub.

**Scope**:
- **N4 Energy × Productivity**:
  - Morning check-in modal (first visit after 6am, dismissible)
  - Data writes to `daily_mood` table
  - After 14 days: Patterns tab unlocks the energy × billable scatter plot correlation
  - LLM-generated natural-language insights ("Strong correlation: each +1 energy = +1.4h billable")
- **N7 AI Task Clustering**:
  - Supabase Edge Function `cluster-entries`: pulls user's entries, generates embeddings (OpenAI text-embedding-3-small), clusters via cosine similarity, LLM names clusters
  - Writes to `task_clusters` table
  - Nightly job per user (free tier: disabled; Pro: nightly)
  - Projects tab deep dive surfaces cluster-level analytics: "Stripe webhook work: 8 sessions, avg 1h 45m, 18% faster this month"
  - User can rename/merge/split clusters in Tags UI
- **Polish**:
  - Weekly digest email job (Supabase cron + Resend)
  - Shareable "Year in Review" card export (PNG/social)
  - Focus Mode (T2.4)
  - Design polish across all shipped screens
  - Performance pass (Lighthouse + bundle audit)

**Deliverable**: complete v2 PhynxTimer. Two pillars (capture + analytics) fully shipped.

---

## Part 6 — Open questions you (Ali) need to decide

The research surfaced 11 open questions. I've answered 6 of them with strong opinions above (UI direction, free tier strategy, invoicing depth, cut the circles, LLM provider → Anthropic via Edge Functions, phased vs big-bang → phased). Five remain that I can't decide for you:

### Q1 — Solo-only, or eventually team?
**Why it matters**: affects schema (workspaces/roles tables) in Phase 5. Cheap to add later but cheaper to decide now.
**My recommendation**: solo-only forever. PhynxTimer's wedge is freelancer-friction-killing. Team time tracking is a saturated, lower-margin segment.
**Your call**: ___

### Q2 — Desktop companion app on the roadmap, or web-only definitive?
**Why it matters**: desktop would unlock Memtime/Timing-tier passive tracking. Electron/Tauri adds ~2 weeks.
**My recommendation**: web-only for v2. Ship Chrome extension in Phase 11 as the "passive signal" compromise — 90% of the value at 10% of the scope.
**Your call**: ___

### Q3 — Invoicing depth: light (PDF export) or heavy (Harvest-killer with payment links, follow-ups, reminders)?
**Why it matters**: Phase 9 scope balloons from ~14 hours → ~40 hours if we go heavy. Heavy path competes directly with Harvest/FreshBooks.
**My recommendation**: **light** for v2 (PDF + AI narrative is already a wedge). Revisit heavy path if a paying customer asks. Don't build a billing platform on spec.
**Your call**: ___

### Q4 — Name and brand: keep "PhynxTimer" or rename?
**Why it matters**: if the product is verb-first and conversational, "timer" is the *hook* but not the *primary action*. Names like "Phynx", "Phynx Work", "Phynx Log" might fit the new identity better.
**My recommendation**: **keep "PhynxTimer" for v2 launch** (domain + any existing SEO + GitHub repo). Renaming is a post-launch decision if the product-market fit is there. Don't let branding block shipping.
**Your call**: ___

### Q5 — Voice input in Tier 1 or Tier 2 of Phase 8?
**Why it matters**: voice adds WebRTC + MediaRecorder + Whisper integration complexity. Text-only is 40% of the scope of text+voice.
**My recommendation**: **Tier 1 of Phase 8**. Voice is the biggest "wow" moment and the strongest mobile story. Do it right or don't do it.
**Your call**: ___

---

## Part 7 — What to do next (this session or next)

**Decision point**: answer Q1-Q5 above. Once answered, the plan is final and we enter Phase 4.

**Then**:
1. I execute Phase 4 (clean up Phase 1 debt) — this is pure housekeeping, low-decision, ~6 hours
2. You review the cleaned codebase, approve or adjust
3. We enter Phase 5 (data model shift) — the first irreversible move

**Safety net**: every phase is a branch, every phase ends in a commit you can revert. No big-bang.

**Time estimate**: Phases 4-10 = ~72 hours of focused work = realistically 4-6 calendar weeks at a healthy pace with other projects in the mix. Phase 11 (Chrome extension) adds ~2 more weeks if desired.

---

## Appendix — Files this plan will touch

**Delete entirely**:
- `src/features/timer/components/TimerCard.tsx` + 16 sibling components
- `src/shared/components/animations/*` (celebration, confetti, three.js scenes)
- `src/features/analytics/components/visualization/*` (3D charts)
- `src/features/calendar/components/` 3D files
- `src/components/` entire legacy tree (Phase 4)
- `src/hooks/` legacy tree (Phase 4)
- `src/utils/mock*.ts` + `foodManufacturerData.ts`
- Three `20250712*` mock-data migrations
- Migration: drop `goals`, `goal_progress`, `goal_milestones`, `user_roles` tables

**Rewrite**:
- `src/features/timer/pages/DashboardPage.tsx` (becomes TodayPage or similar)
- `src/features/timer/hooks/useDeadSimpleTimers.tsx` → `useTimeEntries.tsx`
- `src/features/analytics/pages/AnalyticsPage.tsx` → `InsightsPage.tsx`
- `src/features/calendar/pages/CalendarPage.tsx` → `TimelinePage.tsx`
- `src/app/routes.tsx` (route reshuffle)
- `supabase/migrations/*` (data model shift)

**Create new**:
- `src/shared/components/CommandPalette.tsx` (built on `cmdk`)
- `src/shared/hooks/useCommandPalette.tsx`
- `src/features/time-entries/` new folder
- `src/features/projects/` new folder
- `src/features/clients/` new folder
- `src/features/invoicing/` new folder
- `src/features/ai/` new folder (conversational logger, voice memo, rewind, invoice narrative edge function clients)
- `supabase/functions/conversational-log/`
- `supabase/functions/transcribe-memo/`
- `supabase/functions/daily-rewind/`
- `supabase/functions/ai-invoice-narrative/`

**Keep mostly as-is**:
- `src/features/auth/*` (works, no changes needed)
- `src/features/billing/*` (works, just update paywall copy + what's gated)
- `src/features/settings/*` (drop Activity/Security tabs, keep Account/Subscription/Integrations)
- `src/features/reports/*` (light touch: de-paywall CSV, keep PDF Pro)

---

*End of plan. Respond with answers to Q1-Q5 to finalize; or with objections/alternatives to any section above.*
