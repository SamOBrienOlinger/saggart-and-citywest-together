# Cross-browser regression coverage

The interactive cloud browser available during implementation exposes Chrome only. GitHub Actions supplies separate, disposable browser environments for repeatable project tests.

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
