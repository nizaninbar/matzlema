# Code review

Review of the project as of commit `36615a9`. Findings are ordered by impact, not by
effort. Nothing here has been changed yet — this is the input for the refactor.

## Bugs

### 1. Saved reports lose their images — `blob:` URLs are persisted

[SectionList.vue:351-359](../src/components/SectionList.vue#L351-L359) stores
`URL.createObjectURL(file)` in `images`, and `downloadJSON` writes those `blob:…` strings
into the JSON. Object URLs are valid only for the document that created them, so
"save report" → reload → "load report" yields broken `<img>`s every time. The images are
also never revoked, so they leak for the life of the tab.

**Fix:** read the file with `FileReader.readAsDataURL` and store the base64 data URI, so
the report JSON is self-contained. (Watch the size — consider downscaling to ~1600px and
re-encoding as JPEG before storing.)

### 2. Loaded reports render collapsed text areas

`autoGrow` ([SectionList.vue:272](../src/components/SectionList.vue#L272)) resizes the
auto-growing textareas on `@input` only. After `handleUpload` fills `location`,
`customerName` and `additionalInfo`, nothing triggers it, so multi-line values are clipped
to the 33px initial height — on screen *and* in print.

**Fix:** a small `v-autogrow` directive (or a watcher + `nextTick`) that also runs on mount
and whenever the bound value changes.

### 3. `filename` numbering desynchronizes after a load

`SectionForm` keeps its own `sequence` counter. Load a report with 12 sections and the next
added section is `filename: '01'`, colliding with an existing one. The counter also never
recovers after sections are deleted.

**Fix:** derive the next filename from the existing sections (in `App` or a store) instead
of holding a counter in the form.

### 4. The unsaved-changes guard is hardcoded

```js
const hasUnsavedChanges = ref(true) // set to true if something changes
```
[App.vue:27](../src/App.vue#L27) — the `beforeunload` prompt fires on a completely
untouched page, and would fire even right after the user saved. It trains the user to
dismiss the dialog, which defeats its purpose.

**Fix:** set it on the first mutation and clear it in `downloadJSON`; better, add
localStorage autosave and drop the dialog.

### 5. `:key="i"` on a reorderable, deletable list

[SectionList.vue:150](../src/components/SectionList.vue#L150). With an index key, Vue
patches existing DOM in place on reorder/delete instead of moving it, which can strand
uncommitted input state (IME composition, caret, an in-progress number) on the wrong row.

**Fix:** give each section a stable `id` (`crypto.randomUUID()`) at creation and key on it.

### 6. `document.title` is never restored

`ExportButton` overwrites the page title with `"דוח: … לקוח: … אתר: …"` so the browser
suggests it as the PDF filename, then leaves it there. Restore it after `print()`
(`window.onafterprint`, or just a `setTimeout`).

### 7. Total length is string-fragile

`sections.reduce((sum, s) => sum + (s.length || 0), 0)`
([SectionList.vue:235](../src/components/SectionList.vue#L235)) relies on Vue's implicit
`.number` cast for `<input type="number">`. Any section whose `length` arrives as a string
(hand-edited JSON, a future import) turns the sum into concatenated text. Wrap in
`Number(...) || 0`. The result should also be rounded — floating-point metre values
currently print as e.g. `142.10000000000002`.

### 8. Print pagination is pixel-tuned

`.report-header { margin-bottom: 620px }` and `.onepage { min-height: 1020px }`
([style.css:76-87](../src/style.css#L76-L87)) hard-code A4 at one zoom level. Editing the
header, adding a metadata row, or printing to Letter breaks the layout.

**Fix:** use real page mechanics — `@page { size: A4; margin: … }` plus
`break-after: page` on the header/images/summary wrappers — and delete the spacers.

### 9. No form validation

`submitSection` emits whatever is there. An empty submit adds a blank row with
`diameter: ''` (the diameter `<select>` has no default selected option), and that row
prints. Require at least `from`, `to`, `diameter`, `length`.

## Dead code and repo hygiene

- **`src/components/HelloWorld.vue`** — Vite scaffold, imported nowhere. Delete.
- **`src/assets/vue.svg`, `public/vite.svg`** — scaffold assets. Delete.
- **`html2pdf.js` dependency** — the only import is commented out in `ExportButton`.
  Remove it from `package.json` (it is a heavy dep to carry for nothing).
- **`dist.zip` (372 KB) is committed** while `dist/` is gitignored. Remove it from the repo.
- **`table { … }` rules in `SectionList`** (~30 lines) — no `<table>` exists any more.
- **`.show-on-print` / `.hide-on-print`** — defined in both `style.css` and
  `SectionList`'s scoped block, with *opposite* rules, and applied to no element.
- **The empty `.form-group` with `visibility: hidden`**
  ([SectionForm.vue:7](../src/components/SectionForm.vue#L7)) — a grid-alignment spacer.
  Express it with `grid-column` instead.
- **Leftover `const imageUrl = ref(null)` inside `handleFileChange`** — a reactive ref
  created and discarded per call; it should be a plain local.
- **Commented-out code** in `App.vue`, `SectionList.vue` (lines 224-226, 349),
  `SectionForm.vue:100`, `style.css`. Delete or act on it.
- **Textareas with both `v-model` and inner text** (`SectionForm.vue:66`,
  `SectionList.vue:237`) — the inner content is ignored by Vue and is misleading to read.

## Structural issues

### `SectionList.vue` is a god component (760 lines)

It is simultaneously: the report metadata form, the company letterhead, the section
table editor, the image gallery, the summary editor, the persistence layer (save/load JSON),
and ~400 lines of CSS. It should be decomposed:

```
ReportDocument.vue        the printable document shell
├── ReportHeader.vue      logo + report metadata form
├── CompanyDetails.vue    letterhead, fed from config (see below)
├── SectionsTable.vue
│   └── SectionRow.vue
├── ImageGallery.vue
└── ReportSummary.vue     totals + closing text + signature
ReportActions.vue         export / save / load toolbar
```

### State should be lifted out of the view

`sections` is provided by `App` but mutated by `SectionList`, and all other report fields
are local to `SectionList`. Move the whole report into one place — a `useReport()`
composable is enough at this size, no Pinia needed — exposing `report`, `addSection`,
`removeSection`, `moveSection`, `addImage`, `removeImage`, `toJSON`, `fromJSON`. That also
makes autosave and undo tractable.

### Duplicated domain constants

The pipe-material list (8 options) and direction list are written out twice — once in
`SectionForm`, once in `SectionList`; the diameter list exists in `SectionForm` only, and
the list view degrades it to a free-text input, so the two panes disagree about what a
valid diameter is. Extract to `src/constants/pipe.js` (`PIPE_TYPES`, `DIAMETERS`,
`DIRECTIONS`, `PIPE_PURPOSES`) and render with `v-for`.

### Hard-coded company and personnel data

Photographer name, certificate number, address, postcode, phone, fax, email, VAT number
and the signature image are in the template
([SectionList.vue:75-140](../src/components/SectionList.vue#L75-L140)). Move to
`src/config/company.js` so a staffing or phone-number change is a one-line edit — and so a
second certified operator can be supported at all.

### No design tokens

`#007bff` / `#0056b3` (blue buttons), `#28a745` / `#218838` (green buttons), `#ddd`,
`#f9f9f9`, and the same `border-radius` / `box-shadow` / `transition` triplet are repeated
across all three components. Two nearly identical button styles (`.submit-button`,
`.action-button`, `.export-button`, `.custom-file-upload`) exist. Consolidate into CSS
custom properties plus one `.btn` / `.btn--primary` pattern.

## Correctness and quality gaps

- **No persistence.** A refresh or a crash loses the entire report; the only safety net is
  the manual JSON download and the (broken) unload dialog. localStorage autosave with a
  "restore draft?" prompt would be the single highest-value addition.
- **No tests, no linter, no formatter.** At minimum: ESLint + `eslint-plugin-vue`,
  Prettier, and Vitest around the JSON round-trip and the totals calculation.
- **`index.html` declares `lang="en"`** for an all-Hebrew RTL document, sets `dir` nowhere
  (it is applied in CSS instead), and serves a PNG favicon as `type="image/x-icon"`.
- **Accessibility:** no `<label for>` / `id` pairing anywhere; the icon-only controls
  (`🔼 🔽 ✖`) carry `title` but no `aria-label`; the print-only text swap is done with
  `display: none` duplicates rather than semantic markup.
- **`new Date().toISOString().substr(0, 10)`** uses the deprecated `substr` and is UTC —
  in Israel (UTC+2/+3) a report opened before 02:00/03:00 local time is dated yesterday.
  Use a local-date formatter.
- **Single-file image upload.** The input lacks `multiple`, so stills are attached one at a
  time — tedious for a real inspection with a dozen images. Drag-and-drop would fit here.
- **Images are not linked to sections.** They land in one flat gallery, so the report
  cannot show "this defect at 14 m in section 03". Given `filename` already ties a section
  to a video file, per-section images are the natural model.
- **`sequence` is stored on every section** but is form bookkeeping, not report data.

## Suggested refactor order

1. **Hygiene** — delete dead files/CSS/deps, remove `dist.zip`, add ESLint + Prettier.
   No behavior change, shrinks the surface for everything below.
2. **Extract constants and company config** — kills the form/list disagreement.
3. **Introduce `useReport()`** and move all report state into it; `SectionList` becomes a
   pure view. Fixes findings #3 and #4 as a side effect.
4. **Fix the image pipeline** (#1) — data URIs, with downscaling.
5. **Split `SectionList`** into the components above; extract shared styles/tokens.
6. **Add localStorage autosave** on top of the store.
7. **Rework printing** (#8) — real `@page` rules, delete the pixel spacers. Do this last;
   it needs visual verification against actual printed output.
8. **Then** the feature work: validation, multi-image upload, per-section images.
