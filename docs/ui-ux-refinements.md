# UI and UX refinements

Branch: `feat/ui-ux-refinements-20261014`, based on `bdad1bf9bbe54a9c779d49590cd37a46e01ec1e4`.

## Scope

- Shorter Citywest supports and contact headings retain the explanatory text underneath. Information pages share a quieter type scale and tighter section spacing; the homepage illustration, headline, colours and circular logo remain unchanged.
- The existing four service categories now appear before community photographs and the quiz. “Citywest IPAS supports” opens the local guide; a separately named “Official IPAS website” link remains available.
- Contact retains the native email link and visible address. A progressively enhanced copy button announces success through a polite status region. Denied or missing Clipboard API support selects the address and explains manual copying; it never reports a false success. Message text is read from translatable HTML. No form, account, analytics, third-party script or additional stored personal data is introduced.
- All 16 Facts resources have a task-first DOM reading order: purpose, explanation, publisher/date, source. Source URLs, IDs and contextual warnings are retained. Existing optional background disclosures remain. Citywest supports adds four task shortcuts, ten task-led row headings, and acronym expansions beside relevant organisations. Search and topic filtering remain deferred, as recommended.
- The image-only carousel contains 18 photographs; the three posters are retained separately in a native, collapsed archive with an explicit warning that it is not an upcoming-events list. Thumbnails and full views preserve image proportions. Existing image files are unchanged: cleaner original versions of the social-media screenshots were not available in the repository, so no people or source imagery have been cropped away, regenerated or substituted.
- Existing pill styling and interaction colours remain shared. Hierarchy is improved through placement, grouping, reading order and spacing rather than extra animations or a second button design.
- The common footer uses wrapping link groups, less spacing and smaller mobile logo/QR frames. Email/social, privacy and accessibility links remain visible, with the QR link still available.

## Regression fixes

Firefox's baseline failure involved `:active` remaining set after releasing a dragged press outside Get involved. The existing, small CTA movement now has explicit primary-pointer/keyboard state with resets on pointer exit, cancellation, release, blur, page restoration and document hiding. Reduced-motion users receive no movement. Native link activation is not intercepted.

WebKit's five baseline failures were in the logo-focus test. A Tab/Shift+Tab round trip was assumed to return to a programmatically focused logo even when focus changes closed responsive navigation. The visual-focus test now establishes keyboard modality before explicitly focusing the intended logo; its focus-visible and circular-ring assertions remain intact. Existing navigation tests continue to cover menu interaction and Escape.

## Checks

`npm test` includes five additional structural regression checks. `npm run test:browser` includes clipboard success/denial/unavailability, translated status text, task links, source reading order, the expanded archive at enlarged text/RTL, pointer cancellation, and no-JavaScript fallbacks. Existing carousel expectations are updated to 18 photos without dropping image loading, wrapping, keyboard or dialog tests. The native Safari suite determines the image count from the rendered page.

Automation does not certify accessibility or universal browser support. Actual screen-reader testing, real-device checks and linguistic review remain separate activities.
