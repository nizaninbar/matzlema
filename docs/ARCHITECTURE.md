# Architecture

## Stack

| Piece       | Version | Notes                                                     |
| ----------- | ------- | --------------------------------------------------------- |
| Vue         | 3.5     | Composition API (`<script setup>`), except `ExportButton` |
| Vite        | 6.3     | `base: '/matzlema/'` for GitHub Pages                     |
| gh-pages    | 6.3     | deploy script                                             |
| html2pdf.js | 0.10    | **declared but unused** — the import is commented out     |

No TypeScript, no router, no state library, no linter, no tests.

## File map

```
index.html                        app shell, Hebrew <title>, favicon
vite.config.js                    base path + vue plugin
src/main.js                       createApp(App).mount('#app')
src/style.css                     global styles + the entire @media print stylesheet
src/App.vue                       layout (form | report), owns `sections`, beforeunload guard
src/components/SectionForm.vue    left pane: "add a section" form
src/components/SectionList.vue    right pane: the whole report document (760 lines)
src/components/ExportButton.vue   sets document.title, calls window.print()
src/components/HelloWorld.vue     dead Vite scaffold, not imported anywhere
src/assets/mazlema.png            company logo (in the report header)
src/assets/sig.jpg                scanned signature (in the summary block)
src/assets/vue.svg, public/vite.svg   dead scaffold assets
dist.zip                          committed build artifact (372 KB) — should not be in git
```

## Component graph and data flow

```
App.vue
 ├── sections = ref([])            ← the only shared state
 ├── provide('sections', sections)
 ├── SectionForm    --@add-section--> App.addSection()  (push)
 └── SectionList    --inject('sections')--> reads AND mutates the array directly
```

The data flow is deliberately asymmetric and this is the main structural smell:

- **Adding** a section goes _up_ through an event to `App`.
- **Editing, reordering, deleting** a section is done _inside_ `SectionList` by
  mutating the injected ref.
- Every other piece of report state (`reportNumber`, `location`, `customerName`,
  `reportDate`, `pipePurpose`, `additionalInfo`, `summaryText`, `images`) is a local
  `ref` inside `SectionList` — even though `SectionList` is conceptually just the
  rendered document. That is why save/load also lives there.

## Data model

A **section** (created in [SectionForm.vue:80](../src/components/SectionForm.vue#L80)):

```js
{
  filename:    '00',        // which video file this section corresponds to
  from:        '',          // "מתא" — from manhole
  to:          '',          // "לתא" — to manhole
  diameter:    '',          // mm; select in the form, free text in the list
  pipeType:    'PVC',       // PVC / פוליאתילן / פיברגלס / פלדה / אסבסט / פלדקס / בטון / אחר
  length:      '',          // metres (number)
  direction:   'מורד הקו',   // downstream / upstream
  description: 'תקין',      // findings; defaults to "OK"
  sequence:    0            // form-local counter, copied into every section
}
```

`sequence` is an artifact of how the form auto-increments `filename` (`00`, `01`, `02` …)
after each submit — it is not meaningful per-section data.

The **saved report** JSON (`downloadJSON`, filename `<reportNumber>-<customerName>.json`):

```json
{
  "reportNumber": 0,
  "customerName": "",
  "reportDate": "YYYY-MM-DD",
  "location": "",
  "pipePurpose": "ביוב",
  "additionalInfo": "",
  "sections": [/* … */],
  "images": [/* … */],
  "summaryText": "…"
}
```

`images` holds `blob:` object URLs, which is why saved reports lose their images
(see [REVIEW.md](REVIEW.md), finding #1).

## The print / PDF pipeline

There is no PDF library in play. "Export to PDF" is browser print:

1. `ExportButton` sets `document.title = message` (the browser uses the title as the
   suggested PDF filename) and calls `window.print()`.
2. The `@media print` block at the top of [style.css](../src/style.css#L1-L97) reshapes
   the on-screen editor into a document:
   - hides all `button`s, the whole `form`, and the file-upload labels
   - strips borders/appearance from `input`/`select`/`textarea` so fields print as plain text
   - swaps the findings `<textarea class="description">` for a static
     `<div class="description-print">` (so multi-line findings aren't clipped)
   - releases the app's `overflow: hidden` viewport lock so the document can flow
   - `.page-break-avoid` keeps section cards and the summary from splitting across pages

3. Pagination is forced with **hard-coded pixel spacers**, tuned by eye for A4:
   - `.report-header { margin-bottom: 620px }` — pushes the section list onto page 2
   - `.onepage { min-height: 1020px }` — gives images and the summary a page each

That last point is the most fragile thing in the codebase: the layout is correct only
at one zoom level, paper size, and browser. Anything that changes header height silently
breaks pagination.

## Styling conventions

- Global: `direction: rtl`, `Segoe UI / Heebo`, `html, body { height: 100vh; overflow: hidden }`.
- The editor is a two-pane flex layout (`App.vue`): form `flex: 1`, report `flex: 2`,
  and `.report` scrolls internally at `max-height: 75vh`.
- Everything else is `<style scoped>` per component. There are no design tokens —
  colors (`#007bff`, `#28a745`, `#218838`, `#ddd`, `#f9f9f9`) and spacings are repeated
  literally across the three components.
- `.section-grid` is a 7-column CSS grid faking a table; there is also a leftover
  `table { … }` rule block in `SectionList` that nothing uses.

## Hard-coded business data

The photographer / company block and the signature are baked into the
`SectionList` template ([SectionList.vue:75-140](../src/components/SectionList.vue#L75-L140)):
certified photographer name, certificate number, address, postcode, phone, fax, email,
and VAT number, plus `assets/sig.jpg`. Any personnel or contact change requires a code
edit and redeploy.
