# Homepage implementation QA

final result: passed

## Comparison target and evidence

- Source visual truth: `/workspace/scratch/a469a6709e88/generated_images/exec-9215645e-afda-439e-bc58-87c57de5b956.png` (1036 × 1518 raster mockup).
- Implementation: existing static site, homepage, Chrome browser, first carousel slide, menus closed.
- Desktop screenshot: `docs/homepage-preview/desktop.jpg` (1348 × 2123 full-page capture; browser viewport approximately 1363 × 936 CSS px including its scrollbar).
- Mobile evidence: `docs/homepage-preview/phone-carousel.jpg`, 390 × 760 test frame; 375 CSS px of usable content because Chrome reserves 15px for a scrollbar. Screenshot canvas includes the surrounding test harness (1363 × 936).
- Tablet evidence: `docs/homepage-preview/tablet-carousel.jpg`, 768 × 760 frame with 753px usable content, inside the same screenshot canvas.
- Reflow measurements: `docs/homepage-preview/reflow.json`.
- Full-view comparison: source mockup and browser-rendered full page were opened together in a single comparison input. Compared relative content widths and region proportions; no pixel-perfect claim is made across the different canvas widths. The 1036px source is a raster representation of a desktop design, not a literal navigation breakpoint specification. No raster stretching or image editing was used to manufacture a match.
- Focused comparison: the community text, main photograph, thumbnails, carousel controls and service icons were inspected in the full-resolution desktop image alongside the source, plus the phone and tablet captures where these controls are readable.

## Findings and fixes

No actionable P0/P1/P2 findings remain in the implemented scope.

1. [P2, resolved] Initial desktop copy was vertically centred far below the photograph's top edge, and its heading wrapped into three lines. The community grid is now top-aligned with a larger heading and a 12ch text measure. The subsequent capture shows the intended four-line heading alongside the photograph.
2. [P2, resolved] English classes and Work and training initially lacked matching destination anchors. Explicit row IDs were added to the existing support directory. Every homepage local fragment was checked against source/generated section IDs; the English classes link was opened in the browser and reached its education row.
3. [P2, resolved] Shared runtime navigation would reinsert the old Gallery item and overwrite revised labels. Removed that insertion, updated shared labels and made the four primary links consistent in existing page markup. Gallery remains available from the footer.
4. [P2, resolved] The source's light gold/coral did not support readable large text on the light community surface. Shared deeper gold #bd892b and coral #d1765f against teal #004b50 and paper #fffdf8 give approximately 3.05–3.19:1. Both headlines use the same colour variables as requested. High-contrast preference has an additional monochrome text override.

## Required fidelity surfaces

- **Fonts and typography:** Arial/sans-serif UI and hero, Georgia/serif section headlines; font hierarchy and four-line desktop community heading reproduce the source's intent. Fluid sizing and wrapping adapt to phones. No clipping observed.
- **Spacing and layout rhythm:** approved section order retained: hero, community/carousel, quiz, Local services, footer. One-column phone and tablet layouts become split desktop layouts. Container spacing, rounded image corners and restrained dividers match the source. Keeping the real photograph's full 4:3 proportions makes the gallery taller than the generated mockup's cropped photo; this is intentional.
- **Colours and tokens:** teal/cream/gold/coral palette preserved; gold/coral deepened together for text contrast. Focus states are visible. Small body text remains dark on light surfaces.
- **Image quality and asset fidelity:** original repository logo, landscape and quiz artwork; original uploaded community media; genuine Bootstrap Icons. No generated faces, invented photo content or handcrafted replacement artwork. The first image and all ten thumbnail destinations were checked. Some lower thumbnails appear undecoded in initial full-page screenshots; they load when approached and were confirmed loaded during interaction and in the phone capture.
- **Copy and content:** approved wording retained, including Local services below the quiz. One quiz promotion. Event posters have descriptive historical captions/alt text rather than new event claims. The existing prototype status is retained in the footer.

## Interactions and checks

- All ten thumbnail selections: correct image, count and exactly one active thumbnail.
- Previous/next controls, first/last wrap-around, Arrow keys and Home/End.
- Full-image poster dialog opens; Escape closes it and focus returns to its trigger.
- Mobile navigation and language panel; first Escape closes translation, second closes navigation.
- All six existing translation choices are available; no third-party translation request was submitted.
- Homepage English classes link and Find support navigation; static validation of all local section links.
- Existing quiz opens and starts its first question successfully.
- Reflow at 320, 360, 390, 430, 576, 768, 896, 1024, 1120, 1280, 1440 and 1920px frame widths: document width equals available content width at every size, including 305px of content at the narrowest frame. No page-level horizontal overflow.
- Mobile controls and carousel reviewed visually at 390px; tablet community layout reviewed at 768px.
- Console checked: no application warnings/errors for terminal.local. Browser-extension metadata errors were observed and are unrelated to site code.
- Existing automated tests: 32/32 passed. JavaScript syntax and git whitespace checks passed.

## Test limits and follow-up polish

- Chrome layout frames verify responsive rendering; physical phones, Safari, Firefox, touch gestures, screen readers, RTL translation output and OS text-size settings were not independently exercised.
- Original uploads include Instagram overlays and screenshot compression. Clean original photographs/posters would improve source quality; no AI replacement was used.
- The follow-up release replaces the contact demonstration with direct email contact; other interior-page content is retained.
- Occasional cloud-browser screenshot/scroll timeouts were resolved by using a fresh preview tab. The working homepage remains open for review.

## Implementation checklist

- [x] Approved homepage sections and colours implemented.
- [x] Original media and functional ten-image carousel integrated.
- [x] Mobile-first layouts, touch-sized controls, keyboard and reduced-motion support.
- [x] Shared navigation and section links updated.
- [x] Desktop/mobile/tablet visual evidence and reflow checks recorded.
- [x] Existing tests and syntax checks pass.

## Release follow-up — 19 September 2026

- Replaced the non-sending contact form with an explicit email-app link and a copyable organisation address; privacy text and README now describe the real behaviour. No message was sent during testing. This is an email contact route, not a hosted form-delivery service.
- Shuffled quiz answer options per attempt and remapped each correct index. Exhaustive tests cover all 24 option orders for every possible correct source index; source data is not mutated.
- 34/34 tests pass. A complete browser attempt with three deliberate wrong answers produced 7/10, saved that best score and restarted at question 1 with shuffled answers.
- Follow-up reflow checks cover all nine primary pages at 320 and 1440px. Home, contact and quiz additionally cover 390, 768 and 1920px. Home/contact/quiz were checked with 200% root text at 320 and 768px.
- [P2, resolved] At 200% text on the narrowest homepage, the participation button's minimum width and the quiz strip's fixed artwork column caused overflow. Constrained the button to its container and allowed quiz artwork/copy to wrap. Recheck: 305px available / 305px document width.
- A 768×390 landscape frame has no horizontal overflow. The menu opens, and the carousel responds correctly to Home, End and reversed arrow-key direction when the document is RTL. This verifies layout/control direction, not translated Arabic content.
- Evidence: `docs/homepage-preview/followup-reflow.json` and `docs/homepage-preview/contact-phone.jpg`.
- At this stage only Chrome was exposed by the interactive browser runtime. The subsequent GitHub Actions testing below extends that coverage. No external email delivery was claimed or tested.

## Cross-browser follow-up — 19 September 2026

- [Run 35462661155](https://github.com/SamOBrienOlinger/saggart-and-citywest-together/actions/runs/35462661155) passed all 56 Playwright cases, all actual desktop Safari smoke checks and the 34 existing Node tests. Detailed environments and limits are recorded in [browser-testing/README.md](docs/browser-testing/README.md).
- [P1, resolved] Mobile WebKit could close compact navigation before a link activated after Languages held focus. Guarding null focus destinations fixes the main menu and translation panel; all desktop, tablet, narrow-phone and landscape profiles passed the regression.
- Actual Safari 26.6.1 was exercised on macOS. iPhone/iPad/Android profiles are emulations, not physical devices or actual iOS Safari. Screen readers, native swipe gestures and OS accessibility settings remain untested.

final result: passed
