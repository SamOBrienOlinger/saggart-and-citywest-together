
# Design QA â€” Civic Hub Refresh

**Source visual truth:** `C:\Users\samto\.codex\generated_images\01a00126-6375-7f03-9f81-269f0145bd68\exec-b7ddb108-f346-4086-a200-cd0a3061f3fd.png`

**Implementation:** https://samobrienolinger.github.io/saggart-and-citywest-together/?v=fbae8df

**Comparison state:** Homepage, default state. Desktop at 1024 Ã— 720 CSS px and mobile at 390 Ã— 844 CSS px, device scale factor 1. Source image is 1024 Ã— 1536 px. Implementation evidence was captured in the Codex in-app browser at both viewports.

## Findings

- No actionable P0, P1 or P2 differences remain.
- Fonts and typography: The implementation preserves the reference's bold civic headline, strong sans-serif body hierarchy and coral emphasis. Georgia is used selectively for editorial section headings using reliable local fallbacks.
- Spacing and layout rhythm: The dark-teal hero, asymmetric image treatment, three coloured pathways, generous section spacing and rounded components match the selected direction. Mobile collapses cleanly without horizontal overflow.
- Colours and visual tokens: Deep teal, medium teal, aqua, coral, cream and gold remain within the supplied SaCT identity. Contrast is strong across the hero, cards, navigation and calls to action.
- Image quality and asset fidelity: The fictional concept logo and imagery were intentionally replaced by verified supplied assets. Browser checks confirmed the real SaCT logo at 493 Ã— 492 px, the real Saggart photograph at 1810 Ã— 1800 px and the Facebook QR at 1147 Ã— 1147 px, all complete and rendered at native source dimensions.
- Copy and content: Existing approved community language, INAR-aligned terminology, homepage introduction and prototype attribution are preserved.
- Interactions: Primary navigation, homepage calls to action and mobile menu were checked. The mobile menu correctly changes to `aria-expanded="true"` and reveals its links.
- Console: No warnings or errors were reported on the deployed homepage.

## Comparison history

- Initial implementation: Local browser bridging was unavailable in this desktop session, so browser-rendered comparison was deferred until deployment. Automated tests and reference integrity checks passed locally.
- Deployed verification: The public page was compared against the selected civic-hub concept. The deliberate use of the real supplied logo and Saggart photograph resolved the concept's fictional-asset mismatch. Desktop and mobile evidence showed no remaining P0/P1/P2 issues.

## Focused region evidence

Focused checks covered the logo/header, hero image crop, headline hierarchy, mobile header and mobile hero. The three-pathway region was also verified in the DOM as one section containing three cards. Full-page screenshot stitching repeated the sticky hero in the browser capture, so layout assessment used normal-viewport captures plus DOM dimensions (`scrollHeight: 3933`, three cards, one pathways section).

## Follow-up polish

- P3: A future content phase could add additional verified local photographs if SaCT supplies captions and usage permission.

**final result: passed**


# Gallery photo viewer — 11 September 2026

Source visual truth: `docs/gallery-ui/reference.jpg` (the user's annotated
1125 × 837 mockup). Implementation: `gallery.html`, first photograph selected.

Evidence:
- `docs/gallery-ui/desktop.jpg`: browser rendering in a 1200 × 1300 CSS px
  iframe, scaled to 70% for a complete view in the cloud browser. The saved crop
  is 840 × 830 px, at device pixel ratio 1 before the CSS scale.
- `docs/gallery-ui/mobile.jpg`: browser rendering in a 390 × 1100 CSS px iframe,
  with a 375 px content area after the desktop browser scrollbar. Saved content
  crop is 375 × 900 px, without CSS scaling.
- `docs/gallery-ui/desktop-comparison.jpg`: reference and implementation together.
- `docs/gallery-ui/mobile-comparison.jpg`: reference mobile region normalized to
  375 px wide beside the final 375 px implementation. The design board does not
  specify an original CSS viewport; comparison uses equal content widths.

## Findings and fidelity surfaces

- No remaining actionable P0/P1/P2 findings in the gallery implementation.
- Typography: Georgia display headings, sans-serif captions and controls; the
  mobile title now breaks before “& Citywest”, matching the reference.
- Layout: centered single image, previous/next controls and count, caption and
  source link, then a horizontal three-thumbnail viewport. Mobile adds the swipe
  instruction. The main photo preserves a stable frame as slides change.
- Colors: existing cream and deep-teal site tokens, pale circular arrows and a
  gold selected-thumbnail border match the chosen visual direction.
- Assets: actual existing photos and logo are reused. Bootstrap Icons supplies
  the small arrow/source icons. The historic originals are only 400/476 px wide;
  desktop softness is a source limitation (P3), not a fabricated replacement.
- Copy: the thumbnail labels marked in red are absent. All six photographs,
  their original source destinations and existing attribution text remain.
- Intentional existing-product differences: the shared navigation retains its
  Translate control, readable Menu button, responsive breakpoint and footer.
  Photos other than the opening image use contain rather than destructive crops.
  Touch targets are at least 44 × 44 CSS px, including on the 320 px review.

The combined comparisons were opened and reviewed at full size. Captions,
controls, image crop and thumbnail selection are legible there; separate zoomed
comparison files were unnecessary.

## Comparison history

1. Initial browser review found the mobile title wrapping with an ampersand on
   the first line (P2). Added a mobile-only block span before “& Citywest”.
2. Browser CSS inspection found an older cached stylesheet. Versioned the new
   stylesheet URL, reloaded and verified computed display:block on the span.
3. Final capture (`mobile.jpg` and `mobile-comparison.jpg`) shows the corrected
   line break, clean image-only thumbnails and the intended gallery hierarchy.

## Interaction checks

- Next/previous and wrapping 1 → 6 → 1 passed.
- Thumbnail Home/End selection and focus navigation passed.
- Horizontal pointer swipe changed photograph 1 to photograph 2.
- Only one photograph is visible after enhancement; all thumbnail buttons have
  accessible names and no visible caption text.
- 390 px and 320 px iframe reviews had equal document client/scroll widths:
  375/375 and 305/305, respectively; no horizontal page overflow.
- Existing menu Enter activation and Escape dismissal passed. Pointer activation
  of the shared menu was inconclusive in the iframe automation and is not
  claimed as verified. No shared menu logic was changed.
- No application console warnings/errors in the checked desktop tab. The mobile
  harness logged browser-extension metadata errors, outside the site code.
- All 32 existing node tests passed; JavaScript syntax and git diff checks passed.

Limits: cloud Chromium with responsive iframes, not physical iOS/Android hardware
or independent Safari/Firefox sessions. Swipe was exercised using a browser
pointer drag; physical touch and full screen-reader sessions remain untested.
The six-photo non-JavaScript fallback is present in the static HTML.

final result: passed
