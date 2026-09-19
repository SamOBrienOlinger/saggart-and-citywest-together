# Approved community homepage implementation

The homepage follows the selected September 2026 mockup, with the community carousel, a single quiz strip and Local services beneath it.

## Images

All ten supplied JPEGs are used without generative edits to people or event artwork. `community-image-manifest.json` maps descriptive filenames to the original uploads. The source screenshots may include Instagram overlays; those are preserved rather than inventing missing image content. Replace them with clean originals when available. Posters are historical/community media, not a current event listing.

The source HTML in `index.html` defines the ten slides and thumbnails. The carousel uses native horizontal scrolling and enhances it with previous/next controls, keyboard navigation, a live count, thumbnails and a full-image dialog. It does not autoplay. Portrait photos and posters use `object-fit: contain` in the main viewer. Most media is lazy-loaded; the first four thumbnails are eager so the visible rail is ready.

## Layout and accessibility

The base layout is one column; service links become two columns from 36rem and hero/community sections become two columns from 56rem. Navigation collapses through 70rem. Native image dimensions reserve space, containers can shrink, controls are at least 44px, and display cutout insets are respected. Reduced motion disables smooth programmatic scrolling. Off-screen slides are inert and excluded from keyboard focus. The full-image dialog supports Escape and restores focus.

Gold and coral are shared across the hero and community heading. They are slightly deeper than the image mockup so the same colours meet 3:1 contrast for large text on both backgrounds. The original logo, landscape and quiz artwork are reused. Bootstrap Icons 1.13.1 supplies standard interface/service icons under the existing MIT licence in assets/icons.

## Verification

See project-root `design-qa.md`, `reflow.json` and the browser screenshots in this folder. Reflow checks use Chrome frames, not a physical device farm. Safari, Firefox, native touch gestures and assistive technology have not been independently tested in this environment.
