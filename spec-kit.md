/speckit.specify
Title: Badminton Matchmaker — Admin Open-Play Management (v0.1)

High-level description:
An admin-facing web app to create and manage badminton open-plays across multiple halls, define courts per session, admit registered players (with skills), and generate/adjust doubles matchmaking per round. Admins see schedules (date, time, price, booked courts) and can review/override match distribution. Players can later see their assigned court/time. Source context: existing functional spec with rounds, courts, level-aware pairings, rest rules, and admin live controls. (See attached product notes.)

Primary user:

- Admin (organizer) who creates and manages open-plays.

Problems to solve (ordered):

1. Halls: admins have multiple halls to manage on different days.
2. Courts: define how many courts per hall/session and the capacity that controls accepted players.
3. Players: select who registered; track skill level; track their frequently played location / hall preferences.
4. Schedules: date, time window, price, and booked courts per open-play.

Skill model:

- Six possible states: Unrated, Beginner, Novice, Intermediate, Advanced, Professional.
- Unrated is the default when a player’s skill has not been set; Admins can update anytime.

Match types (doubles):

- Supported categories: MD (Men’s Doubles), WD (Women’s Doubles), XD (Mixed Doubles), and OPEN Doubles.
- OPEN Doubles: can freely mix any genders and can include MD/WD/XD compositions.
- Players with unknown gender are still allowed in MD/WD unless explicitly filtered out by Admin.

Outcomes (v0.1):

- Admin can create a schedule (session), pick a hall, set courts & rules, and admit players.
- Generate a first round of level-aware doubles (OPEN/MD/WD/XD), then subsequent rounds with variety.
- Show schedule detail page: rounds, courts, partners/opponents, and planned timeslots.
- Admin tab UI with “Halls” and “Schedules” as primary navigation.

Non-goals (v0.1):

- Payments, leaderboards, ELO, mobile apps, multi-hall player browsing.
- Singles matches. Advanced rating updates.

User stories (selected):

- As Admin, I can add my halls and enable/disable courts per schedule.
- As Admin, I can create a schedule with date/time, price, max players.
- As Admin, I can view the roster, assign skills (6-level scale including Unrated), lock a roster, and generate rounds.
- As Admin, I can override court assignments pre-start.
- As User, I can view my court/time for a schedule (read-only).

Acceptance criteria:

- Tab nav with “Halls” and “Schedules”.
- Halls tab lists all available halls; Admin can select which halls they manage.
- Schedules tab lists schedules; clicking one shows the detail page (roster + rounds).
- From a schedule, Admin can: enable courts, lock roster, generate Round.
- Round generator:
  - Prioritizes same-level pairs first, then adjacent levels using the 5-level scale (Beginner → Professional), treating Unrated as mid-level placeholder.
  - Supports MD/WD/XD and OPEN Doubles; OPEN may mix genders freely.
  - Avoids repeat partners/opponents when possible and respects no back-to-back play if pool allows.
- Persist to Postgres; latency target: generate ≤ 2s for ≤ 32 players; all admin overrides logged.

Quality constraints:

- Next.js App Router, Server Actions for data ops, Postgres via Drizzle ORM, shadcn/ui + Tailwind + TanStack Query/Form for UI.
- Basic auth for Admin area (simple session with middleware). Accessibility first; responsive to mobile.

Notes (resolved):

- Players with unknown gender → allowed in MD/WD by default.
- Default skill when unset → Unrated.

/speckit.plan
Architecture & stack:

- Repo: GitHub, monorepo with Turborepo.
- Framework: Next.js 16 (App Router), TypeScript.
- Data: Postgres 18 (Supabase/Local), Drizzle ORM (SQL migration + schema).
- Auth: NextAuth (email/password for Admin) or minimal custom session for v0.1.
- UI: shadcn/ui, Tailwind CSS, Radix primitives, TanStack Query + TanStack Form for mutations/forms.
- Data access: Server Actions + Drizzle (no separate API layer).
- State: server-first; cache with React cache + Query for client refresh.
- Matching: deterministic greedy + light local-swap heuristic; pure TS module with unit tests.
- Deployment: Docker (Fly/Render). Env via .env.

Data model (reference v0.1):

- Enum `level`: unrated, beginner, novice, intermediate, advanced, pro
- Enum `gender`: man, woman
- tenants(id, name, contact_info, timestamps)
- halls(id, tenant_id, layout JSONB, amenities)
- courts(id, hall_id, number, is_enabled)
- tenant_players(id, tenant_id, name, gender?, skill_level level)
- hall_tenant_registered_players(hall_id, tenant_id, tenant_player_id)
- schedules(id, tenant_id, hall_id, price_per_person, start/end, player_level_min/max, tags[])
- schedule_courts(schedule_id, hall_id, court_id)
- court_sessions(id, schedule_id, hall_id, court_id, start/end, player_level_min/max)

Key screens:

- App shell: Admin nav with Tabs {Halls, Schedules}.
- Halls: list all halls; detail button; new Hall button.
- Hall detail: court table that can be selected as which booked; price; amenities; upcoming schedules; listed players who have registered to this hall.
- Schedules: list all schedules without past history; “Create Schedule” new page (date/time, price, hall, courts).
- Schedule detail: roster (assign levels, lock), courts, “Generate Round”, rounds table.

Matching algorithm (phase 1):

- Pool: prefer those who rested last round if possible.
- Bucket by level; pair same-level; then nearest levels both up and down for upskilling or fun match for below level; build teams minimizing repeats; assign to courts to balance average skill.
- Config: levelTolerance=1, restMinRounds=1, avoidRepeatWindow=2.

Testing:

- Unit tests for pairing & court assignment.
- Integration tests for Server Actions (CRUD) using a test DB.
- Minimal e2e smoke (Playwright) for Halls/Schedules flows.

Migrations & DX:

- Drizzle kit for schema + seed.
- pnpm + turbo task scripts (optional).
- Linting: eslint, @typescript-eslint, prettier, markdownlint.

Rollout plan:

- Milestone A: CRUD Halls/Courts/Schedules + Admin auth + UI tabs.
- Milestone B: Roster + Levels + Lock + Generate Round 1.
- Milestone C: Rounds UI + conflict badges + override pre-start.
- Milestone D: Results entry (basic) and Round N generation.

/speckit.tasks

# Milestone A — App shell & data foundation

- [P] Init Next.js 16 TS app, Tailwind, shadcn/ui; set up project scripts.
- Create Drizzle schema & migrations for hall, court, schedule, player, player_level, schedule_player, round, game, game_player, game_set.
- Wire Postgres connection + Drizzle config; add seed script with 2 halls and 8 courts each.
- Build App shell with Tabs: Halls | Schedules.
- Halls page: list all halls; Detail button; New Hall Button; optimistic updates.
- Hall detail: court table that can be selected as which booked; price; amenities; upcoming schedules; listed players who have registered to this hall.
- Admin auth (simple): protect /admin routes; login form; session cookie; middleware gate.

# Milestone B — Schedules CRUD & roster

- Schedules list: table with filters (hall, date range, status).
- Create Schedule page: date/time window, price, join open/close, allowed game types, rules_json editor w/ defaults.
- Schedule detail layout: summary card (hall, window, courts enabled), roster section, rules section.
- Roster: add/remove player; assign level with inline controls; lock roster action.

# Milestone C — Round generation & UI

- Implement matching engine (deterministic greedy + local swap).
- Server Action: generateRound(scheduleId) -> rounds+games entries.
- UI: “Generate Round” button; round list with per-court games; conflict badges (repeat partner/opponent, rest violation).
- Override pre-start: drag-drop swap players between planned courts; persist.

# Milestone D — Live & results (basic)

- Start round, end game, enter single-set scores (21 win-by-2 cap 30).
- Update roster priorities (players who rested get preference next round).
- Round N generation with variety objective (minimize repeats across window).

# Non-functional & polish

- Logging of admin overrides (DB trail).
- Basic accessibility audit; responsive checks.
- Seed demo data & reset script.
- CI: typecheck, lint, unit tests on PR.

# Nice-to-have (later)

- Player self-view of assigned court/time.
- AI chat assistant for admin controls & “explain schedule”.
- MCP to expose schedule/matchmaking functions.
