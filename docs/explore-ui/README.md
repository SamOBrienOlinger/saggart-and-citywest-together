# Explore page UI update

The nine topic links now use a consistent grid with distinct variations of the
site's teal, aqua, gold, coral and green palette. The hero is more compact and
adds a short introduction. Existing topic names and destinations are preserved.

Each button enters once with a 45 ms stagger. Hover gives a small lift and a
relevant icon response (pin lift, hourglass tilt, tree sway, heartbeat or telephone
ring). Tap feedback is a small press; keyboard focus has a visible ring.
Animations are finite. Reduced-motion CSS removes the animations/transitions and
smooth page scrolling. The support and quiz CTAs have separate matching colours.

Validation, 12 September 2026:
- Browser-rendered desktop at 1363 px and responsive iframe widths of 390/320 px.
- No horizontal document overflow at either phone width (375/375, 305/305).
- Smallest checked topic target: 130.9 px wide; minimum target height: 76 px.
- All nine background colours are distinct; text contrast ranges from 5.44:1
  to 10.74:1, exceeding the 4.5:1 requirement for normal text.
- All eight in-page destinations exist. Keyboard activation of Health services
  and pointer activation of Place & identity updated the hash and current topic.
- Browser computed styles confirmed staggered entrance animation on all topics.
- No site console warnings/errors in the checked desktop tab.
- Existing automated tests, JavaScript syntax and diff checks passed.
- Reduced-motion behaviour was checked in CSS; an OS preference change was not
  emulated. Physical phones and independent Safari/Firefox were not tested.

`desktop.jpg` is the browser viewport capture. `mobile.jpg` shows the 390 px
iframe at 80% display scale, cropped to its 375 px content area (300 px saved).
Only the Explore page loads `assets/css/explore.css` and `assets/js/explore.js`.
Icons are Bootstrap Icons, using the existing MIT licence in `assets/icons`.
