# Servixa v1.1.0 — verification report

Everything below was executed in this environment on 22 October 2026 against the build produced from this
source tree. Nothing is reported as passed unless it actually ran.

Environment: Debian, Node 20.20.2, Chromium via Playwright (headless), 1500 × 1000 viewport,
`vite preview` serving `dist/` on port 4173.

---

## 0. Artifact verification (clean extraction)

The delivered archive was extracted into an empty directory and verified from scratch — not from the workspace:

| Step | Command | Result |
| --- | --- | --- |
| Install | `npm ci` | 390 packages, no errors |
| TypeScript | `npx tsc --noEmit` | clean |
| Unit/integration | `npx vitest run` | 6 files, 60 tests passed |
| Build | `npm run build` | success — 80 precache entries |
| Serve | `npx vite preview` | `index.html` 200, manifest 200 |
| Full E2E | `/tmp/final_accept.py` (same 14 checks, port 4182) | 14/14, 0 console errors |
| Print | `/tmp/zip_print.py` | 80 mm 1 p 80.1 × 279.4 mm · 58 mm 1 p 58.3 × 279.4 mm · A4 1 p 210.2 × 297.3 mm, shell hidden |
| Setup, clean profile | `/tmp/zip_smoke2.py` | setup renders, shared toggle flips both password fields, dashboard shows the workshop name |
| IndexedDB v1 → v2 upgrade | `/tmp/upgrade_check.py` on a profile created by the previous build | `syncQueue` dropped, 22 stores retained, 25 invoices and 6 customers intact, dashboard loads |

The archive contains 107 files and no `node_modules`, `dist`, test output or environment files.

## 1. Static checks

| Check | Command | Result |
| --- | --- | --- |
| TypeScript (app) | `npx tsc --noEmit` | clean, 0 errors |
| Production build | `npm run build` | success — 80 precache entries, 1548.95 KiB |
| Unit/integration tests | `npx vitest run` | **6 files, 60 tests passed** |
| Full E2E re-run after branding/print changes | `/tmp/full_accept.py` | 14/14 checks, 0 console errors |
| Backup → clear → restore re-run | `/tmp/accept3.py` | store counts match manifest |
| Print geometry re-run | `/tmp/print_verify.py` | 80 mm / 58 mm / A4 each 1 page, sizes unchanged |

Test files: `money`, `sales`, `jobs`, `returns-shifts`, `backup-auth`, `auth`.

## 2. End-to-end workflow (`/tmp/full_accept.py`, fresh profile)

14 steps, no console or page errors:

1. First-run setup creates the workshop and owner account
2. Part created with opening stock
3. Customer + vehicle created
4. Cash shift opened
5. POS sale with split payment
6. Stock deducted exactly once (8 × 3,000 = 24,000)
7. Job card created from the vehicle
8. Job progressed and converted to invoice `INV-000002`
9. Returns page loads with the new invoice available
10. Shift closed and reconciled
11. Keyboard shortcuts respond (`Ctrl+K`, `Alt+1/2/3`)
12. Backup export produces a 23,073-byte JSON file
13. Print is invoked for the open invoice
14. Offline reload still boots the app (PWA shell cached)

`CONSOLE ERRORS: []` · `FAILURES: []`

## 3. Second pass — returns, purchases, warranty, expenses, users, settings, backup (`/tmp/accept3.py`)

- Sample workshop loaded (counts: 6 customers, 6 vehicles, 14 parts, 6 services, 3 labor, 3 suppliers,
  2 purchases, 25 invoices, 26 payments, 6 job cards, 2 returns, 3 warranty, 4 expenses, 54 stock moves)
- Return processed against a real invoice
- Purchase received (stock increases only on receipt)
- Warranty registered, expense recorded, user `bilal` created
- Role-permission matrix renders and is editable
- Settings save shows the saved confirmation
- Backup exported, business data cleared (**0 customer rows** afterwards), backup restored

Restore verification compares **IndexedDB store counts against the backup manifest**, not page text:
every business store matches exactly. `audit` and `notifications` are append-only and are expected to grow by
the restore's own entries plus boot checks (newest after restore: "Warranties expiring soon",
"Low stock alert", "Backup restored", "Purchase received").

`CONSOLE: []` · `FAILURES: []`

## 4. Print geometry (`/tmp/print_verify.py`)

The receipt/print surface is measured in the browser under `@media print`, and a real PDF is generated for
each paper size:

| Target | On-screen print width | PDF pages | PDF page size |
| --- | --- | --- | --- |
| 80 mm thermal | 302 px (80 mm @ 96 dpi) | 1 | 80.1 × 279.4 mm |
| 58 mm thermal | 219 px (58 mm @ 96 dpi) | 1 | 58.3 × 279.4 mm |
| A4 invoice | `.doc-paper` with `paper=a4` | 1 | 210.2 × 297.3 mm |

The app shell is `display: none` under print media, so the list view behind the document cannot bleed onto
the sheet. Content check: each PDF's extracted text begins with the workshop name and the invoice number.

## 5. `/api` boundary

Handlers bundled and executed under Node:

| Request | Response |
| --- | --- |
| `GET /api/health` | `200 {"ok":true,"mode":"local-only","syncConfigured":false}` |
| `GET /api/sync` | `200 {"ok":false,"available":false,"mode":"local-only",…}` |
| `POST /api/sync` | `501 {"code":"SYNC_NOT_AVAILABLE","accepted":0,…}` |
| `PUT /api/sync` | `405` |

## 6. Reports and exports

- Reports page renders P&L, sales register, expenses, purchases and returns registers for Today / 7 days /
  30 days / This month / Last month / This year / custom range.
- Formulas are printed on the page ("Net sales = gross sales − invoice discounts…"), so revenue is never
  labelled as profit.
- CSV export downloaded a real file (`servixa-profit-loss.csv`, 320 bytes) from the filtered period.
- Analytics renders 39 SVG chart nodes from stored data; no console errors.

## 6b. Branding, setup controls and connection indicators (final pass, `/tmp/brand_audit.py`)

A fresh browser profile was driven through first-run setup → dashboard → Help → Privacy → Settings →
sign-out, reading `inner_text('body')` after each step:

| Check | Result |
| --- | --- |
| Business name shown in sidebar, login panel, Help/Privacy bar | pass — "Al-Madina Motors" in all four |
| Product name absent from setup, dashboard, login, Help, Privacy body text | pass — 0 occurrences |
| Product name present once, in Settings → Data management | pass — "Servixa — Auto Workshop POS", "Version 1.1.0" |
| Setup password/confirm share one control | pass — single button, labels "Show passwords" / "Hide passwords", `aria-pressed` |
| Login password has one toggle | pass |
| Online/Offline pill and sidebar connection dot | removed — no `online-pill`/`offline-pill` markup or CSS remains |
| Console errors during the walk-through | none |

Static confirmation: `grep -rn "Servixa" src --include=*.tsx` returns one line (the Settings software block).
The browser tab title and PWA manifest still carry the product name, which is the software's own identity.

## 7. What was NOT tested

| Area | Status |
| --- | --- |
| Physical thermal printer output | **Not tested.** Only PDF/page geometry in Chromium. Printer driver settings can still change output — see `docs/PRINTER-SETUP.md`. |
| 24-hour continuous soak | **Not run.** No long-duration test was performed; this report does not claim one. |
| Other browsers (Firefox, Safari) | **Not tested.** Chromium only. |
| Multi-device / multi-user concurrency | **Not applicable.** Local-only storage, one browser profile. |
| Vercel deployment | Config is included and static hosting is standard, but no deployment was executed here. |

## 8. Reproducing

```bash
npm ci
npx tsc --noEmit
npx vitest run
npm run build
npm run preview   # then open http://localhost:4173
```

The Playwright acceptance scripts used above live outside this repository (they drive a real browser against
the preview server). They are described step-by-step in §2–§4 so they can be re-created or replaced.
