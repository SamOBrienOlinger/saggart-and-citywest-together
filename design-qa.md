
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

