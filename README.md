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

Requires a browser and a local HTTP server. Python 3 provides one without installing application packages.

```bash
git clone https://github.com/SamOBrienOlinger/saggart-and-citywest-together.git
cd saggart-and-citywest-together
python3 -m http.server 8000 --bind 127.0.0.1
```

Open [localhost:8000](http://localhost:8000). Serve the repository over HTTP so module imports, relative assets and page links resolve correctly.

The existing `npm run serve` command is another development-server option. See [package.json](package.json) for its port and Node.js requirement.

## Repository guide

| Path | Purpose |
| --- | --- |
| [index.html](index.html) | Primary browser entry point |
| [assets/](assets/) | Project styles, scripts, data and imagery |
| [tests/](tests/) | Automated test source |
| [.github/workflows/](.github/workflows/) | Build, test or deployment workflows |
| [package.json](package.json) | Package dependencies and available commands |

## Checks and review

Use Node.js `>=20` and npm for the package commands below. Install the package dependencies first when the command uses a local build or test tool.

| Command | Purpose |
| --- | --- |
| `npm test` | Run the existing test suite |

For a manual review, follow the main user journey, check keyboard navigation and narrow-screen layouts, and inspect the browser console for missing assets or failed requests.

Supporting notes: [TESTING.md](TESTING.md) · [design-qa.md](design-qa.md).

Generate fresh results from the revision you are working on; historical test reports describe earlier runs.

## Deployment

A GitHub Pages site is configured for this repository. Its published URL is linked at the top of this README.

Review [.github/workflows/pages.yml](.github/workflows/pages.yml) before changing the publishing workflow or source directory.

## Credits and reuse

Design decisions, original feature notes, historical testing evidence and detailed acknowledgements remain available in the preserved project record:

- [README.md · original project record](https://github.com/SamOBrienOlinger/saggart-and-citywest-together/blob/75a78455c6315b4a32c274f5c1f48c5341d8c6d9/README.md)

No repository-level licence file is present in this snapshot. This README does not grant additional reuse permissions. Check with the relevant rights holders before reusing code, written content or assets.

## Support

Repository maintained in [Sam O’Brien-Olinger’s GitHub account](https://github.com/SamOBrienOlinger). For a problem or suggested improvement, [open an issue](https://github.com/SamOBrienOlinger/saggart-and-citywest-together/issues) with the affected page or command, steps to reproduce, and expected behaviour.

[Back to top](#saggart--citywest-together)
