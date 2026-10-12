# Browser and responsive testing

## Repeatable checks

Run `npm ci` and `npm test` for the 37 Node checks. They cover the quiz data and scoring, page/asset integrity, source links, footers and translation URLs.

The GitHub Actions [browser workflow](.github/workflows/browser-tests.yml) runs with zero retries:

- Google Chrome stable on Linux and Microsoft Edge stable on Windows.
- Playwright Chromium and Firefox on Linux.
- Playwright WebKit on macOS, including iPhone, iPad, 320px and landscape emulation.
- Actual desktop Safari on macOS through Apple's safaridriver.

The browser jobs record their versions and preserve reports, screenshots and failure traces for 14 days. A configured check is not evidence of a pass: use the workflow result for the relevant commit.

## Responsive coverage

`e2e/responsive.spec.js` runs in the five desktop browser projects. It checks all nine primary pages at 17 viewport sizes, from 320×640 to 1920×1080, including both sides of the 760px, 900px and 1120px layout boundaries. It checks document overflow and content bounds, allowing intentional carousel scrolling and hidden accessibility text.

Additional checks cover:

- 200% root text size on all primary pages at 320px and 1280px;
- all nine language choices, scrolling, Escape dismissal and menu state after resizing;
- phone landscape navigation;
- narrow quiz questions and feedback with enlarged text;
- primary-page layout and navigation without JavaScript.

`e2e/site.spec.js` runs in all ten Playwright profiles. It covers primary-page loading and script errors, all 21 community images, carousel controls and full-image view, all six history images, saved gallery redirects, Facts sections, translated-page handoff, contact email links, keyboard focus, complete quiz scoring/restart, RTL and reduced motion. Carousel captions remain absent; accessible image descriptions remain present.

The separate Safari smoke test checks the primary pages, history viewer, all community images, carousel wraparound, email route, a complete quiz and enlarged desktop text.

## Run locally

```sh
npm ci
npm test
npx playwright install --with-deps chromium firefox webkit
npm run test:browser -- --project=chromium-desktop --project=firefox-desktop --project=webkit-desktop
```

For branded-browser tests, install Chrome/Edge on a disposable test machine with `npx playwright install chrome msedge`, then select `--project=chrome-desktop --project=edge-desktop`. Safari needs macOS with Safari automation enabled. The CI job enables this only on its disposable runner.

## Checks that still need real users or devices

- Physical iOS Safari and Android browsers, native touch gestures, browser toolbars and on-screen keyboards.
- True 200%/400% browser zoom, OS text scaling, VoiceOver and NVDA. Root text enlargement and small viewports are useful checks, but are not identical to these settings.
- Translation accuracy with fluent speakers. Automated tests check language links and site behaviour, not Google's translation output.
- Service-provider links and email delivery outside this site's control.

Current mainstream browsers are the supported target. This does not certify every historical browser version or embedded webview.

Earlier evidence and browser-engine distinctions are retained in [docs/browser-testing/README.md](docs/browser-testing/README.md).
