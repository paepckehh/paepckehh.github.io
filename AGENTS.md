# AGENTS.md

Guide for agents working in the `paepckehh.github.io` repository.

> ## FIXED REQUIREMENT — EVERY CHANGE, NO EXCEPTIONS
>
> Before a task or change is considered done, all five steps below MUST be completed
> in this exact order. Skipping or reordering any step is a failure.
> 1. **Commit** — `git add . && git commit -m '<message>'`.
> 2. **Tag** — bump the patch segment only: the result is `v0.0.<N+1>`. Never move, delete, or reuse an existing tag.


## What this repository is

This is the static GitHub Pages site for the https://paepcke -  **paepcke.de**  - vanity Go module domain (see `CNAME` → `paepcke.de`). It is **not** the source code of the Go projects it lists — those live in separate repos under `github.com/paepckehh/<project>` (and occasionally `git.sr.ht/~paepcke/<project>`). This repo only hosts:

- A landing page (`index.html`) linking to each project's subpage.
- One `index.html` per project subdirectory that serves as the `go get` / `pkg.go.dev` landing page, providing the crucial `<meta name="go-import" ...>` tag that makes `paepcke.de/<project>` resolve to the real GitHub repo.
- Personal contact/key/signing material at the repo root.

There is **no build, no test suite, no CI, no Makefile, no package manager**. Editing is hand-authored HTML. Verification is "open the page in a browser / `curl` it".

## Critical: the go-import meta tag

Almost every project subdir's `index.html` contains a line like:

```html
<meta name="go-import" content="paepcke.de/<project> git https://github.com/paepckehh/<project>">
```

This is the **only** mechanism wiring the vanity domain to GitHub. Do **not** remove or alter this tag when editing a project page — breaking it breaks `go install paepcke.de/<project>@...` for users. If renaming/adding a project, keep the format exactly: `paepcke.de/<project> git https://github.com/paepckehh/<project>`.

The handful of subdirs **without** a `go-import` tag are non-Go or special pages: `contact/`, `img/`, `nixos/` (just a link page), `repo.signatures/`, `repo.sigs/`, `res/`, `squidr-examples/`.

## Directory layout

```
/                       root landing page + personal material
index.html              A–Z directory of projects (buttons → subdirs)
contact.html            contact page (modernized, uses /imp.css, same content as imp.html)
imp.html                impressum / contact (German legal page)
paepcke.png             portrait used on imp.html
CNAME                   "paepcke.de" — required by GitHub Pages, do not delete
.nojekyll               empty marker — makes Pages serve dot-dirs (needed for .well-known/); do not delete
.well-known/security.txt RFC 9116 security contact info (copy of root security.txt)
LICENSE                 license text
allowed_signers         SSH allowed_signers file (git@paepcke.de identities)
allowed_signers.hqs     HQS-signed version of allowed_signers
paepcke.keys            raw SSH public key (ed25519)
paepcke.keys.hqs        HQS-signed version of paepcke.keys
IE6RYZ-S3-DLPR3X-RH-QNPPWOXXCB          HQ signature/key blob
IE6RYZ-S3-DLPR3X-RH-QNPPWOXXCB.signify.pub  signify public key
<project>/index.html    one landing page per Go project (51 of them)
keys/                   has both index.html (project page) and the raw `keys` file
squidr-examples/        example squidr reports (dns.html, tls.html, url.html)
img/                    source images (JPG / Krita .kra)
res/                    static images referenced by reports (ext/hot/int/lab/scr/uni.png)
```

## Conventions for project pages

Every project subpage follows the same hand-written template. Match it exactly when adding a new project:

- `<meta charset="utf-8">` + viewport meta.
- **go-import** meta (for Go projects) pointing to `github.com/paepckehh/<project>`.
- External stylesheet `<link rel="stylesheet" href="/page.css">` — one shared minified CSS for all 51 project pages: Helvetica, white text, `#3367d5` blue background, button hover inverts colors. Do not inline per-page CSS and **do not deviate** from this style; consistency across the site is the whole point. (`/style.css` = landing page, `/imp.css` = impressum page, `app.js` = landing-page interactivity; all minified, no external/CDN/webfont deps.)
- Strict CSP meta on every page: `default-src 'none'; style-src 'self'; img-src 'self'` (landing page adds `script-src 'self'`). No inline styles/scripts on **any** page — the former legacy pages `contact.html`, `contact/`, `repo.sigs/`, `repo.signatures/` were migrated to shared CSS + strict CSP; do not reintroduce `style-src 'unsafe-inline'`.
- The landing page shows the current release in `<span id="ver">` — update that text (e.g. `v0.1.137`) whenever tagging a new release.
- `<title>` = project name; `<h1>` = project name.
- A `<table>` with rows `INSTALL` / `DOCS` / `REPO` / `DOWNLOAD` as applicable:
  - `INSTALL`: `go install paepcke.de/<project>/cmd/<project>@latest` (only when a CLI binary exists).
  - `DOCS`: `https://pkg.go.dev/paepcke.de/<project>` (only for importable Go libraries).
  - `REPO`: GitHub URL (and a second `REPO`/`MIRROR` row if also on sr.ht).
  - `DOWNLOAD`: GitHub releases URL (only if releases are published).
  - Non-Go projects (e.g. `nixos`) only have a `REPO` row.
- Footer link `<a href="https://paepcke.de"><span class="btn">[ home ]</span></a>`.

Note: the old stray markup in `repo.sigs`/`repo.signatures` (malformed `<tr><td>REPO</td>`, leftover `</svg>`) was cleaned up when those pages were migrated to the standard template — keep edited pages clean.

## Adding a new project

1. Create `<project>/index.html` from the template above (copy a similar existing page, e.g. `aiagent/index.html` for a CLI, `nixos/index.html` for a non-Go repo; keep the `/page.css` link and strict CSP meta).
2. Add a `<a href="<project>"><span class="btn"><project></span></a>` entry to `index.html` in the correct alphabetical section (`[ A ]`, `[ C ]`, ...). Sections are letter-ranged; place the button in the right group.
3. No other wiring is needed — GitHub Pages serves the subdir automatically.

## Root index.html gotchas

- Sections are grouped by letter ranges (`[ A ]`, `[ C ]`, `[ D ]`, `[ F - G ]`, `[ H - L ]`, `[ M - N ]`, `[ O - R ]`, `[ S ]`, `[ T - Z ]`). Match the existing grouping when inserting a new entry; ranges are not strict single letters.
- `signify` is listed **twice** in `[ S ]` (duplicate button). This appears intentional/legacy — leave it unless asked.

## Personal / key material at root

The root hosts cryptographic identity material (SSH keys, signify pubkeys, HQ signatures, `allowed_signers`). These files are **content**, not config:

- `*.hqs` files are HQS-signed blobs (start with `#!/usr/bin/hq` / `##HQS#...`). They are generated by the `hq` tool (one of the listed projects) — do not hand-edit; regenerate via `hq` if a key changes.
- `allowed_signers` uses OpenSSH's `allowed_signers` format with time validity ranges (`valid-after=`, `notvalid-after=`).

Only modify these when the user explicitly asks to rotate/publish a key.

## .gitignore notes

`.gitignore` ignores many dotfile-style artifacts that look like build/dev droppings from the upstream tooling (`.build.hqx`, `.dev`, `.export`, `.tag`, `.todo`, `.version`, `Makefile`, `vendor`, `cmd/paepckehh.github.io/paepckehh.github.io`, etc.). Notably **`Makefile` is gitignored** — if you add one it will be ignored silently. There is no Makefile in the tree; do not assume `make` works.

## Commit message style

Recent history uses terse messages — almost every commit is just `update` (occasionally `add: <thing>, reorg`). There is no conventional-commits / scoped format enforced. When committing, a short descriptive message is fine; match the existing minimalism unless the change is significant.

## How to verify changes

No tooling — verify manually:

```sh
# check a project page renders and the go-import tag is present
curl -s https://paepcke.de/<project>/ | grep go-import
# or locally
grep go-import <project>/index.html
```

For the landing page, open `index.html` in a browser or `curl` it and confirm new buttons resolve to existing subdirs.
