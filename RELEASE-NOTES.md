# Servixa v1.1.0 — release notes

**Product:** Servixa Auto Workshop Management POS
**Version:** 1.1.0
**Release date:** 22 October 2026
**Architecture:** static React + TypeScript + Vite PWA, IndexedDB, no backend, no database server, no sync

---

## 1. What this release is

A complete, working workshop POS: 21 modules, real transactions, integer-paisa money, offline-first
storage in the browser, exact thermal/A4 print output, versioned backup and restore.

It is a **single-device application by design**. Records live in the browser's IndexedDB on the machine that
created them. Moving a workshop to another machine is done with the backup file, not with a server.

## 2. Interrupted-work recovery

The previous implementation pass ended mid-verification of an optional PostgreSQL sync service. That work was
removed in this release, deliberately:

| Removed | Reason |
| --- | --- |
| `src/lib/sync.ts`, `src/hooks/useSync.ts`, `SyncBadge`, `SyncSettings` | Synchronization is out of scope for this release |
| Change-capture hooks in `src/lib/db.ts` | Only existed to feed the sync queue |
| `api/workshops.ts`, `api/sync/push.ts`, `api/sync/pull.ts`, `api/_lib/*` | New backend surface, explicitly not wanted |
| `db/migrations`, `scripts/migrate.mjs`, `scripts/sync-dev-server.mjs`, `scripts/test-sync-api.mjs` | Server tooling |
| `pg`, `@types/pg`, `@types/node` dependencies | No server to run them |
| Sync tab in Settings, sync badge in the top bar, auto-sync effect | No engine to drive them |

What replaced them is the honest boundary that existed before: `GET /api/sync` answers `200 {available:false}`,
`POST /api/sync` answers `501 SYNC_NOT_AVAILABLE` with `accepted: 0`, and `GET /api/health` reports
`mode: "local-only"`. Nothing ever claims a record left the browser.

Everything else from the v1.1.0 line is intact; the full acceptance suite was re-run after the removal (see
`docs/TEST-REPORT.md`).

## 3. Printing

Receipts and documents print through the browser dialog, but the sheet is fully controlled by CSS:

- `@page` sizes: A4 with 12 mm margins; thermal-80 (80 mm, 3 mm margins); thermal-58 (58 mm, 2 mm margins).
- Print media hides the app shell, sidebar, dialogs and toasts, so only the document reaches the sheet.
- `html, body, #root` are reset to `height:auto` in print, which removes the blank first page that a
  full-height app shell produces.
- Refunds print signed and labelled ("Cash refund · INV-000024 · −Rs. 11,500.00"); a receipt can no longer
  appear to have been paid twice its value.
- 58 mm receipts use a compact table (rate folded under the item name) so money columns never collide.
- Long orders paginate; line rows avoid page breaks.

Verified by generating real PDFs in Chromium: 80 mm → **1 page, 80.1 × 279.4 mm**; 58 mm → **1 page,
58.3 × 279.4 mm**; A4 → **1 page, 210.2 × 297.3 mm**. Physical printer output is not verified — see
`docs/PRINTER-SETUP.md`.

## 4. Modules

Dashboard · POS Billing · Job Cards · Invoices · Cash Shifts · Customers · Vehicles · Inventory · Parts ·
Services · Labor · Purchases · Suppliers · Returns · Warranty · Expenses · Mechanics & Staff · Reports ·
Analytics · Users & Roles · Settings, plus the administrator profile drawer.

Every screen reads and writes the same IndexedDB stores through the same transaction layer; there is no mock
data in the shipped app (the optional sample workshop is clearly labelled and only loadable into an empty
workspace).

## 5. Changes since the 1.1.0 baseline in this repository

- Removed the entire backend/sync layer described above; restored the documented 501 boundary.
- Print: refund amounts signed on receipts and A4 invoices; app shell suppressed in print media; page height
  reset (blank-page fix); 58 mm compact item table; refund references shortened.
- Keyboard: `Ctrl/Cmd+N` now creates a record in the current module (sale, job card, purchase, user) and
  restarts a sale on POS even when POS is already open.
- Job cards: converting a job to an invoice now names the invoice in the confirmation and opens it.
- Branding: the workspace is white-labelled. The sidebar, login panel, setup artwork, Help/Privacy header and
  their footers show the workshop's own name; business documents carry the owner's name, address and phone only.
  The product name appears exactly once inside the app, in Settings → Data management
  ("Servixa — Auto Workshop POS · Version 1.1.0").
- IndexedDB schema v2: the unused `syncQueue` object store is gone. It was written by an earlier build but
  never read; it is dropped during the upgrade, and every business store is carried over untouched.
- Removed the top-bar Online/Offline pill and the sidebar connection dot. In a local-only build they implied a
  service that does not exist; the sidebar now says only "Saved in this browser" beside the version.
- Setup: the two password fields share one "Show passwords" / "Hide passwords" control (aria-pressed), instead
  of two independent eye buttons. Login keeps its single toggle.
- Policy and help copy now says "this application" rather than repeating the vendor name in body text.
- Removed a leftover `console.error('DEMO_FAIL', …)` debug statement.
- Docs: README sync/deployment sections rewritten for the local-only architecture.

## 6. Known limitations

- **Single device.** No sync, no server, no shared data between browsers or machines.
- **Browser storage is the database.** Clearing site data deletes the workshop; browsers may evict IndexedDB
  under storage pressure. Export backups regularly (Settings → Data management).
- **Local authentication is not server-grade.** PBKDF2-derived hashes with per-user salts in IndexedDB; anyone
  with access to the OS profile and devtools can read the database. Backups exclude password hashes.
- **No physical printer verification.** Output was verified as PDF geometry in Chromium, not on hardware.
- **No 24-hour soak test.** See `docs/TEST-REPORT.md` for exactly what was run and for how long.

## 7. Installing

```bash
npm ci
npm run build        # production bundle in dist/
npm run preview      # serve dist/
```

Deploy `dist/` to any static host, or use the included `vercel.json`. No environment variables are required.
