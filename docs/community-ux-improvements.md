# Community usability improvements

Branch: `feat/community-ux-improvements`. Base: `bdad1bf9bbe54a9c779d49590cd37a46e01ec1e4`.

## Changes

- Shorter contact and Citywest supports headings, retaining the full description of the centre in the introduction.
- Local services first in the shortcut row and before the quiz. The local Citywest guide and official IPAS website have separate, accurate labels and destinations.
- Copy email control with a polite status announcement. Denied or unavailable clipboard access produces a manual fallback, never a success message. Email and webmail routes remain available without JavaScript.
- All 16 Facts resources now start with the task they support, followed by explanation and the original source. Publisher, date, geographic scope and cautions remain visible. Existing optional background disclosures remain in place.
- Ten task-led support areas, explanations of acronyms where used, and an optional category filter with a reset and result count. Saved section links reveal their destination, even after filtering. No site-wide search or new dependency.
- Eighteen original photographs in the image-only carousel, with three posters in a separate, clearly labelled native disclosure. Full portraits are contained rather than cropped. Archive posters are explicitly not upcoming invitations.
- A quieter type scale and tighter spacing for information pages; consistent pill controls retained. A compact shared footer preserves all existing links and the QR code, giving quick links a wrapping grid rather than one long mobile column.

## Image provenance

Original image files, alternative text, the supplied Pride logo and the homepage illustration are retained. Cleaner originals of photographs containing captured social-media controls were not available in the inspected assets. Those photographs have not been retouched, replaced or cropped in a way that might remove people. Better originals can be substituted later without changing the layout. No AI-generated photographs have been introduced.

## Regression investigation

The previous Firefox failure concerned a pressed transform after releasing a drag outside a link. The CTA's pressed movement now also requires hover, so moving the pointer off the link removes that movement. Keyboard focus retains its separate visible ring; reduced-motion mode disables the movement.

The previous WebKit failures assumed that Tab followed by Shift+Tab always returned to an anchor. Native macOS tab preferences can differ. The focus-style test now establishes keyboard modality and explicitly focuses the actual anchor, while retaining all assertions for real focus, `:focus-visible`, circular feedback and pressed styling. Existing navigation, touch and keyboard interaction tests remain enabled.

## Checks

Run `npm test` for unit/content integrity checks and `npm run test:browser` for the complete Playwright matrix. `npm run test:safari` exercises native desktop Safari on macOS. New tests cover clipboard success and refusal, filtering and reset, deep links, the photo/archive split, enlarged text, RTL, and no-JavaScript fallbacks. Screenshots are attached to each browser report.

The existing GitHub Pages deployment remains on `main`. Review and merge are separate from work on this branch.
