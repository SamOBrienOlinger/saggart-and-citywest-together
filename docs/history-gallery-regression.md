# iPhone history-gallery regression

## Evidence

The failure quoted in review belongs to PR #21 at `9070e61e8c765aa184a78701958ec892dbefb16c`, workflow run `38627621205`, artifact `11925651602`.

In the retained WebKit iPhone trace, `call@2545` attempts a mouse click on `See the mill photograph` after the native `Read the local stories` anchor scroll. The recorded target is approximately 172.76 x 18.84 CSS pixels. The final click point is (124.97, 654.44) in a 390 x 664 viewport. At the action snapshot (monotonic time 276482.270), document scrollTop is 5803; at the after snapshot (276531.705), it is 5859; at the next assertion it is 5908. The URL stays at `#history-stories`, not `#photo-mill`.

The page therefore moved 56 CSS pixels across the recorded action/after snapshots, more than the link's height. Earlier attempts also report instability and intercepted pointer events. This supports a scrolling/input race in the test, not a demonstrated failure of the gallery's hash-selection handler. The old journey also used mouse clicks for its final two links even in touch profiles.

## Correction

`e2e/history-link-actions.mjs` centres the actual link with an immediate scroll, polls its bounds, document/visual viewport positions and hit target until stationary, then performs one normal Playwright tap for touch profiles or click for desktop. It does not set the hash, change the selected image, call application handlers, dispatch synthetic clicks, force an action or retry a failed activation. The site's own smooth-scroll CSS and JavaScript are unchanged.

The original integration journey is retained, with both links using this helper. It now asserts the URL after each activation and checks the mill thumbnail state and loaded image as well as the existing visibility/count checks. Four additional journeys check trusted native input and single activation, repeated same-hash selection, Enter plus Back/Forward and reload, and the no-JavaScript fallback.

## Verification

The normal cross-browser workflow includes all new tests. A separate read-only workflow runs the original history journey and the four new journeys 15 times each in WebKit iPhone emulation, with retries disabled. Results, traces and native-input evidence are retained in GitHub Actions artifacts. Consult the checks on PR #21 for completed results; this document does not predeclare a pass.

No production HTML, CSS, JavaScript or image files are changed by this correction. Neither main nor the live site is deployed by these test workflows. Emulation is not physical-device or screen-reader certification.
