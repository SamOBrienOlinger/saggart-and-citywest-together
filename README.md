# Saggart & Citywest Together

A community information website supporting connection, inclusion and local knowledge across Saggart and Citywest, County Dublin.

**HTML · CSS · JavaScript**

[Visit the website](https://samobrienolinger.github.io/saggart-and-citywest-together/) · [Getting started](#getting-started) · [Repository guide](#repository-guide) · [Checks](#checks-and-review) · [Credits](#credits-and-reuse)

<img src="assets/images/hero-saggart-citywest-v10.webp" alt="Illustrated view of Saggart and Citywest" width="880">

## What you can explore

- Local learning resources and an interactive quiz.
- A Citywest supports directory and practical signposting.
- A gallery of local history and community imagery.
- About, accessibility, contact and privacy pages.

## Using the project

1. Start with the local learning pages or the Citywest supports directory.
2. Follow source links for information from the relevant organisation.
3. Explore the gallery and community work, or take the local-knowledge quiz.

> **Project notes:** Information is independently compiled from linked public sources. Check the relevant service provider for current eligibility and availability. The contact form’s local validation does not itself deliver a message.

## Getting started

Requires Git, a browser and a local HTTP server. Python 3 provides one without installing application packages.

```bash
git clone https://github.com/SamOBrienOlinger/saggart-and-citywest-together.git
cd saggart-and-citywest-together
python3 -m http.server 8000 --bind 127.0.0.1
```

Open [localhost:8000](http://localhost:8000). Serve the repository over HTTP so module imports, relative assets and page links resolve correctly.

For a development preview with automatic updates, use Node.js 20.19+ (20.x), or 22.12+ and npm:

```bash
npm ci
npm run dev -- --port 4173
```

Open [localhost:4173](http://localhost:4173). Vite is a development dependency only; publishing still serves the original static HTML, CSS, JavaScript and images without a build step.

Alternatively, `npm run serve` starts a simple server on port 4173. This command uses `npx` to obtain `http-server`, so its first run needs an internet connection. The Python option above does not need Node.js or npm.

## Repository guide

| Path | Purpose |
| --- | --- |
| [index.html](index.html) | Primary browser entry point |
| [assets/](assets/) | Project styles, scripts, data and imagery |
| [tests/](tests/) | Automated test source |
| [.github/workflows/](.github/workflows/) | Build, test or deployment workflows |
| [package.json](package.json) | Package dependencies and available commands |

## Checks and review

Use a supported Node.js version and npm for the command below. The tests use Node's built-in test runner and need no dependency installation.

| Command | Purpose |
| --- | --- |
| `npm test` | Run the existing test suite |

For a manual review, follow the main user journey, check keyboard navigation and narrow-screen layouts, and inspect the browser console for missing assets or failed requests.

Supporting notes: [TESTING.md](TESTING.md) · [design-qa.md](design-qa.md).

Generate fresh results from the revision you are working on; historical test reports describe earlier runs.

The shared responsive stylesheet loads directly on all ten pages. Compact navigation remains available when JavaScript is disabled; when enabled, the menu and translation panel support keyboard dismissal and available-height scrolling. The supports directory reflows into labelled entries on smaller screens. Browser coverage and remaining device checks are recorded in [TESTING.md](TESTING.md).

## Deployment

A GitHub Pages site is configured for this repository. Its published URL is linked at the top of this README.

Review [.github/workflows/pages.yml](.github/workflows/pages.yml) before changing the publishing workflow or source directory.

## Credits and reuse

Website development by Sam O'Brien-Olinger / Sam Tim Solutions for Saggart & Citywest Together.

Local and civic content draws on South Dublin County Council, the Placenames Database of Ireland, CSO Census 2022 and other named public sources. The [About page source register](about.html#sources) records the exact references.

Media acknowledgements already recorded on the site include:

- **The Echo** — the community-potluck article screenshot and coverage linked from [Community in action](about.html#our-work).
- **Citywest Business Campus** — the campus history imagery, linked to its source in the [Gallery](gallery.html).
- **P L Chadwick / Geograph Ireland** — the Luas-at-Saggart photograph, credited on the Gallery page under CC BY-SA 2.0.

Other gallery items retain their individual source links. These acknowledgements do not grant additional rights to the photographs, article screenshot, illustrations or third-party content.

Design decisions, original feature notes, historical testing evidence and detailed acknowledgements remain available in the preserved project record:

- [README.md · original project record](https://github.com/SamOBrienOlinger/saggart-and-citywest-together/blob/75a78455c6315b4a32c274f5c1f48c5341d8c6d9/README.md)

No repository-level licence file is present in this snapshot. This README does not grant additional reuse permissions. Check with the relevant rights holders before reusing code, written content or assets.

## Support

Repository maintained in [Sam O’Brien-Olinger’s GitHub account](https://github.com/SamOBrienOlinger). For a problem or suggested improvement, [open an issue](https://github.com/SamOBrienOlinger/saggart-and-citywest-together/issues) with the affected page or command, steps to reproduce, and expected behaviour.

[Back to top](#saggart--citywest-together)
