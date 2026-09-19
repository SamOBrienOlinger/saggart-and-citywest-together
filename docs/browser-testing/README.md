# Cross-browser regression coverage

The interactive cloud browser available during implementation exposes Chrome only. GitHub Actions supplies separate, disposable browser environments for repeatable project tests.

## Verified result — 19 September 2026

[Run 35462661155](https://github.com/SamOBrienOlinger/saggart-and-citywest-together/actions/runs/35462661155) passed on implementation commit `1e1547fbcc56fb076918a030217d4010aa5fa795`, with zero retries:

| Environment | Result |
| --- | --- |
| Chromium 153.0.8010.12, desktop and Android emulation | 14 / 14 passed |
| Firefox 155.0, desktop | 7 / 7 passed |
| WebKit 26.6 on macOS, desktop and four mobile profiles | 35 / 35 passed |
| Actual desktop Safari 26.6.1 on macOS | All separate smoke checks passed |
| Existing Node suite | 34 / 34 passed |

The initial run exposed a mobile WebKit navigation defect: a null focus destination could hide the menu before a link's click completed. The fix keeps links available until activation and preserves dismissal when focus moves to another element or the user clicks outside. The same correction protects translation links. Regression coverage includes navigating after dismissing Languages and opening the requested translation destination. The external translation response is intercepted during this test; translation quality and Google's live service are not verified.

The first run also exposed a test-only whitespace mismatch in the hero heading. The assertion now checks rendered text, including line breaks. No headline copy changed.

This extends the earlier Chrome-only QA. Physical handsets, actual iOS Safari, screen readers, native swipe gestures, OS accessibility settings and external email delivery remain outside the verified coverage. Touch taps, reduced-motion settings, RTL carousel controls and 200% root text were exercised in the browser profiles.

## Environments

- Chromium desktop and Pixel 7 Android emulation on Linux.
- Firefox desktop on Linux.
- WebKit on macOS: desktop, iPhone 13, iPad, 320px phone and landscape profiles.
- Actual desktop Safari supplied with the macOS runner, using Apple's safaridriver and Selenium.

Mobile profiles emulate viewport, device scale, user agent and touch input; they are **not physical phones**. Playwright WebKit is not the branded Safari browser, which is why the additional Safari job is separate. The device-testing plugin is designed around available simulators/devices and native applications. This project is a static website, and the local workspace has no Xcode, Android device bridge, device runner or connected handset.

## Checks

The Playwright suite runs seven scenarios across eight profiles (56 cases): all primary pages/reflow/script errors; approved homepage order and links; ten carousel media items, keyboard controls and dialog; navigation/languages/email route; complete scored quiz and retry; enlarged text/reduced motion/RTL; and essential functionality without JavaScript.

The Safari smoke job separately checks all nine primary pages, all ten media items, carousel wrap-around/dialog, direct email route, a complete 10/10 quiz attempt and 200% desktop text. It logs the actual Safari browser version. It does not claim iOS Safari or phone hardware coverage.

Test reports, screenshots and failure traces are attached to each GitHub Actions run for 14 days. Zero retries are configured so failures remain visible. Existing Node tests remain separate and run before the Playwright checks.

## Running

```sh
npm ci
npm test
npx playwright install --with-deps
npm run test:browser
```

Desktop Safari requires macOS and Safari automation enabled. The CI job enables it only on its disposable runner, starts the local HTTP server, runs `npm run test:safari`, and preserves the results.

## Sources

- [Playwright browser support](https://playwright.dev/docs/browsers): patched Firefox/WebKit builds and the distinction from branded Safari.
- [Playwright emulation](https://playwright.dev/docs/emulation): device profiles, viewport and touch capabilities.
- [Playwright on GitHub Actions](https://playwright.dev/docs/ci-intro): dependency installation, test execution and artifacts.
- [Selenium Safari support](https://www.selenium.dev/documentation/webdriver/browsers/safari/): Apple's built-in safaridriver and enabling automation.

A configured test is not evidence of a pass. Run outcomes must be read from the workflow logs and artifacts.
