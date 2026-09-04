# Matzlema — Pipeline CCTV Inspection Report Generator

A single-page Vue 3 app for producing professional pipeline (sewer / water / drainage)
CCTV inspection reports. An operator enters the inspected sections one by one, attaches
stills pulled from the robot's video, and exports the whole thing as a printable /
PDF report in Hebrew (RTL).

Deployed as a static site to GitHub Pages under the `/matzlema/` base path.

## Quick start

```bash
npm install
npm run dev        # Vite dev server
npm run build      # production build into dist/
npm run preview    # serve the production build locally
npm run deploy     # publish dist/ to GitHub Pages via gh-pages
```

Requires Node 18+ (Vite 6).

## What the app does

| Step | Where |
|------|-------|
| Fill in report metadata (report no., site, purpose, customer, date, notes) | report header, [SectionList.vue](src/components/SectionList.vue) |
| Add inspected sections (manhole→manhole, diameter, pipe material, length, direction, findings) | [SectionForm.vue](src/components/SectionForm.vue) |
| Review / edit / reorder / delete sections | section cards in [SectionList.vue](src/components/SectionList.vue) |
| Attach still images | file input in [SectionList.vue](src/components/SectionList.vue) |
| Write the closing summary, auto-totals, signature block | summary block in [SectionList.vue](src/components/SectionList.vue) |
| Export to PDF | [ExportButton.vue](src/components/ExportButton.vue) — triggers `window.print()` |
| Save / load work in progress | `downloadJSON` / `handleUpload` in [SectionList.vue](src/components/SectionList.vue) |

There is **no backend**. All state lives in memory; the only persistence is the
manual JSON download/upload.

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — how it is put together, data model, the print pipeline
- [docs/REVIEW.md](docs/REVIEW.md) — code review findings and a prioritized refactoring plan
