# Saggart & Citywest Together MVP testing

## Automated checks

Run `npm test`. The suite validates:

- a minimum of 20 approved quiz questions;
- unique IDs, valid answers, unique choices and source URLs;
- ten-question selection without repetition or source mutation;
- high-score rules;
- every required page;
- every internal page, stylesheet and script reference;
- removal of legacy subject text from production pages.

## Manual acceptance checklist

- [ ] Use keyboard only to reach the skip link, all navigation, every quiz answer, feedback source and next/retry actions.
- [ ] Confirm visible focus is never hidden by the sticky header.
- [ ] Verify the mobile menu at 320 px and 375 px.
- [ ] Verify page reflow at 200% and 400% browser zoom.
- [ ] Run a complete quiz: exactly ten questions, no repeats, score only increases for correct answers.
- [ ] Refresh and confirm the best score persists; block local storage and confirm the quiz still completes.
- [ ] Confirm feedback is announced by NVDA or VoiceOver.
- [ ] Confirm reduced-motion mode removes non-essential transitions.
- [ ] Submit the empty contact form and confirm native validation; complete it and confirm the page explicitly says nothing was sent.
- [ ] Check external source links and the source register.
- [ ] Run Lighthouse and axe against every page and the quiz intro/question/feedback/results states.
- [ ] Test current Chrome, Firefox, Edge and Safari plus representative iOS/Android viewports.

No Lighthouse score or accessibility claim from AllyIndex is carried forward; this MVP must be tested independently before public release.

## Responsive changes verified on 11 September 2026

The implementation was checked in the available Chrome browser using the actual site rendered in same-origin frames with controlled viewport dimensions. These are layout checks, not physical-device or other-browser certification.

| Check | Result |
| --- | --- |
| Existing `npm test` suite | 32 tests passed |
| All ten HTML pages at 320×640, 390×844, 768×1024, 844×390, 1024×768, 1120×800, 1280×900 and 1920×1080 | 80 checks passed without horizontal page overflow or unintended content extending outside the viewport |
| All ten pages with root text enlarged to 200%, at 320×640 and 1280×900 | 20 checks passed after fixing the hero illustration's intrinsic sizing |
| All ten pages with scripts disabled, at 320×640 | 10 layout checks passed; the compact navigation uses visible HTML links rather than an inactive menu button |
| Mobile navigation and translation | Open/close verified; first Escape closes translation while leaving navigation open, second Escape closes navigation |
| Mobile quiz | Start, answer layout, answer feedback and next-question control verified at 390×844 |
| Visual inspection | Desktop homepage and 320px homepage checked in Chrome |

The layout measurements allow deliberate gallery scrolling and visually hidden accessibility content. They also inspect child element bounds, so a clipped hero image cannot pass merely because its parent hides overflow. The desktop hero was checked again with enlarged text after the sizing correction. Root text enlargement is distinct from browser zoom.

### Remaining manual checks

- Run the checklist above in actual Safari/iOS, Chrome/Android, Firefox and Edge. These browsers and physical devices were not available in this session.
- Check true 200%/400% browser zoom, OS text scaling, mobile browser chrome and the on-screen keyboard.
- Verify the stacked support table's row/column associations with VoiceOver and NVDA; explicit table roles and headings are retained for this purpose.
- Complete the full quiz and contact-form journeys in each target browser. The shared layout changes do not alter their quiz engine or form-delivery behaviour.

### Reproducing the responsive review

Start the local development server from the README. Visit every HTML page at the dimensions above, including immediately before and after the 760px, 900px and 70rem navigation breakpoints. Check the header, open menu, translation choices, long email addresses, directory entries, footer and quiz feedback. Repeat narrow layouts with enlarged text and scripts disabled. Resize with the menu open and use Tab, Shift+Tab and Escape to confirm focus remains usable.
