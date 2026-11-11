# NNC Deck Builder — development context

Read the relevant source before editing. This file describes the current implementation and product constraints; keep it current when those change.

## Working rules

- Work locally unless the user explicitly requests a commit, push or deployment. Preserve unrelated local edits, especially hand-edited CSS. Check `git status` and the diff first.
- Keep code identifiers and comments in English. Put user-facing strings in the language catalogs and update all six languages: English, Italian, French, Portuguese, Spanish and German.
- Prefer small, focused changes. Remove code made obsolete by a change; avoid unrelated rewrites and new frameworks.
- Keep the project folder limited to functional source, assets, build files and this context file. Put temporary research, screenshots and verification scripts outside the repository.
- Never embed credentials or the Discord webhook URL in frontend code, documentation or commits. Mock outgoing submissions during verification.

## Application and deployment

- Static HTML/CSS/JavaScript application, plus one Vercel serverless endpoint for proposals. No frontend framework or browser-side package bundler is required for local source execution.
- Repository: `https://github.com/MahloCardinal/naruto-deck-builder`, branch `main`.
- Production: `https://naruto-deck-builder.vercel.app/`. Vercel builds the repository and serves `dist/`.
- New sessions start in English. Existing tabs restore their language and state.

## Source map

| File or directory | Responsibility |
| --- | --- |
| `index.html` | Page structure, templates, dialogs and ordered classic-script loading. |
| `styles.css` | Shared design tokens, layouts, card proportions and responsive behavior. |
| `app.js` | UI state, filters, rendering, deck editing, dialogs, storage and collection/proposal integration. |
| `cards.js` | Language-independent card data, stable identifiers, default assumptions, artwork dimensions and calculation rules. Exports `CARDS` for Node tooling too. |
| `calculator.js` | Numeric estimates and explanatory breakdowns from the same calculation rules. |
| `translations.js` | Authoritative source for all six language catalogs, including card text, preset titles/descriptions and keyword patterns. |
| `scripts/generate-data.cjs` | Generates browser catalogs and the small server-side card/language projection. |
| `locales/*.js` | Generated catalogs and language manifest. Do not edit these directly. |
| `localization.js`, `bootstrap.js` | Load the initial locale before the application; load additional locales asynchronously. |
| `assets.js` | Source/production asset URLs, responsive card images, script loading and decoded popup artwork cache. |
| `synergies.js` | Curated directional mechanical rules (`SYNERGY_RULES`) and the derived symmetric browsing graph (`SYNERGIES`). |
| `prebuilt-decks.js` | Preset identifiers, fallback names, author credits, saved tags, card lists and strategy cores. Localized titles/descriptions live in catalogs. |
| `deck-autobuilder.js` | Lazy-loaded completion engine combining interactions, preset affinities and deck balance. |
| `collection.js` | Ownership-only JSON import, local persistence and bookmark synchronization with the official app. |
| `search-index.js`, `control-layout.js` | Cached multilingual search and sizing/positioning of controls. |
| `virtual-list.js` | Viewport-based rendering of synergy rows. |
| `card_images/` | Original WebP artwork plus `160/` and `320/` responsive versions. All three sizes are used. |
| `misc_images/` | Site icon, WebP language flags and their SVG sources. |
| `scripts/build.cjs` | Generates `dist/`, minifies scripts, combines startup scripts and fingerprints assets. |
| `scripts/generate-thumbnails.py` | Regenerates responsive artwork after adding images; requires Pillow. |
| `api/proposals.js`, `server-data/proposals.json` | Validated proposal submission to Discord and its generated data projection. |
| `vercel.json`, `package*.json` | Deployment configuration, pinned build dependencies and package commands. |

Scripts share classic-script globals. Preserve loading order and lazy-loading dependencies. Production asset paths must go through `assetPath`; do not hardcode fingerprinted filenames. The bookmark serializes its function as JavaScript, so preserve the build's special treatment of `collection.js`.

## Build and verification

```sh
npm ci --include=dev --ignore-scripts --no-audit --no-fund
npm run locales
npm run build
```

- After changing `translations.js`, regenerate and include the matching locale files. The generator also updates `server-data/proposals.json`; the build runs it automatically.
- Do not edit or commit `dist/` or `node_modules/`. A static server can serve the source project for local UI checks. The proposal endpoint requires the Vercel runtime.
- Vercel uses `DISCORD_WEBHOOK_URL` on the server. Preserve its same-origin checks, validation and request limits. A plain local static server cannot deliver proposals by itself.
- There is no committed automated test suite. Use checks appropriate to the change: syntax and diff checks, a production build, and targeted browser verification. Check desktop and a 375px mobile viewport for layout changes; check affected languages for text changes.
- For synchronization verification, simulate the official app/API rather than using a real account. For proposal verification, mock `/api/proposals` rather than sending real Discord messages.

## UI and persistence constraints

- Keep the white background and existing orange palette. Reuse `--accent`, `--accent-text` and other shared tokens; darker text and lighter fills serve different purposes.
- Do not introduce rounded corners except on components already using them, such as level pills and the mobile back-to-top button.
- Desktop tools use the collapsible left sidebar. Mobile uses compact navigation and tool dialogs. Preserve the three-card catalog at 375px, bounded effect areas, and the floating builder and back-to-top controls. Draw the top and bottom borders above the scroll content in the card database and deck builder.
- Card names render in uppercase. Ability titles must not receive keyword coloring. Cost and base Chakra circles show printed values; level pills belong at the image's bottom right where enabled.
- Database cards are read-only. Level changes in synergy/preset popups are informational. Missing-card decoration belongs to builder listings and preset previews, not database cards or card popups.
- Prebuilt decks render in one column on mobile, with descriptions collapsed behind a toggle. Desktop uses an equal-height grid of two or three columns and shows descriptions inline. Each deck preview has two rows of five cards. Deck names sort alphabetically independently of the card order inside each deck.
- All single-card popups show matching prebuilt decks in a bounded list, with each name and navigation button flanking read-only thumbnails rendered by `deckSlotsHTML`. The button resets library filters and stores the exact preset ID until the search is edited or reset. Editable builder popups open a separate Details dialog for the calculation breakdown and per-card assumptions.
- The prebuilt required-card filter follows Tags and uses a five-slot deck preview. Suggestions overlay the page in a popover aligned to the search input. It matches every selected identity. Its selected cards count as one active filter and persist with the library filters.
- Synergy rows are virtualized and sources are grouped only when their complete partner lists are identical. Every source remains searchable. Partner lists scroll vertically, use fixed gaps and start from the left.
- Search matches a contiguous phrase within a field, not separate words scattered across content. Numeric/season references have dedicated handling in `CardSearchIndex`.
- Card multi-select filters use OR within a group and AND across groups. Preset tag filters require all selected tags. Checkbox menus stay open after selection. Default card ordering is index ascending. Sorting and database level changes enable reset but do not increase the active-filter badge.
- Collection filtering offers all/owned, plus missing only in the database. Use `catalogScrollRoot` when dealing with scroll position; mobile and desktop roots differ by section.
- `sessionStorage` preserves the current tab's deck, language, section, filters, panel state, assumptions and scroll positions. Collection ownership is persisted separately in `localStorage`.
- Temporary feedback uses the common `setFeedback` system: automatic dismissal after 5 seconds; page clicks dismiss after at least 2 seconds. A new notice replaces the old one, and navigation clears notices. Errors are red, confirmations use standard dark text, with no final period. Persistent operation states are distinct from timed notices.
- Successful collection import uses a real confirmation dialog, not a timed notice.

## Card data and calculations

- `card_key` values such as `S3_053` and `ES_001` identify cards across datasets. Public references restart per set (`S3 #053`, `ES #001`). Internal numeric `index` values remain stable and must not be renumbered.
- `skill_types_original` drives filters and popup tags. It includes mechanics a card reacts to, not just actions it performs. Do not assume every card tagged Teleport performs a teleport itself, for example.
- Follow current card rules and user-confirmed in-game behavior. External translations/guides can be outdated; resolve discrepancies before overwriting established effects.
- A deck has exactly 10 unique cards, maximum one of each. Levels are selected manually or through the builder's level control. Explicit per-card levels take precedence; ownership never determines level.
- Keep one deck import/export format without version labels or legacy variants. Exports include selected levels and individual calculation assumptions. Deck names are limited to 15 characters; clearing resets the localized default name. Filename spaces become underscores.
- Assumptions are integers from 0 to 99. `DEFAULT_SCENARIO` in `cards.js` is the source of default values. Applying defaults updates per-card assumptions; individual changes affect only that card.
- Card activations mean total activations, not extra activations after the first. Only applicable repeated effects scale; initial/one-shot effects do not. Enemy/ally target counts remain separate variables. Do not add automatic usage caps or warning systems; healing counts in full.
- Chakra gains and healing are different mechanics. Include summoned/copied Chakra in power and subtract friendly damage as defined by the rules. Avoid deriving calculation behavior from translated prose.
- Quality is estimated power divided by effective cost. Cost modifiers affect quality, but the cost chart and average cost always use printed `energy_cost`. Average quality is the mean of individual qualities. Deck averages display at most one decimal place.

## Synergies and presets

- Keep conditional targeting, lane, timing and trigger requirements in `SYNERGY_RULES`; the browsing graph and recommender derive different views from these rules. Avoid broad affinities or tradeoffs in the mechanical browsing graph.
- A preset represents its card identities, not levels or assumptions. Do not show level badges in preset previews. Detect duplicates by the unordered set of card keys before adding another preset.
- Put creator handles in the optional `author` field. Rounded author badges appear beside titles in the preset library and stay separate from the card popup, search and tag filters.
- Preset descriptions should explain concrete sequencing and interactions of cards actually in that list. Use full card names, rendered in bold by `formatPresetDescription`, without season/index prefixes or embedded source links. Distinguish ability variants when needed.
- Player names are attribution, not tactics: use titles such as `Deck by ALX` and omit bracketed clan tags.
- Add the `video` tag and a verified direct `video` URL together when a preset has an attached video. The filter uses `tag_video` and the first badge in the tag row uses `presetVideoLink`.
- Preset tags are multi-valued and optional. Store `boss` when appropriate. Assign `beginner` when saving a new deck with at most one Legendary and four Epic cards; do not calculate this tag during rendering.
- Auto-completion preserves already chosen cards, levels and assumptions. Ownership can restrict candidates but cannot change their levels. Keep the toad requirement for Gamatatsu; generic Focus affinity alone is insufficient.
- Deck proposals use the current builder deck/name and require all 10 cards. Their description may be empty; the server supplies a localized fallback. Synergy proposals require a description. Both description fields have a 2000-character limit.

## Collection synchronization

- The input is the official `/v1/collection/me` response: `seasons[].cards[]` with `id`, `count` and optional metadata. Import only possession (`count > 0`), collapse duplicates/variants to one marker and ignore levels. Do not infer Lv.2 from copies or artwork metadata.
- Despite the existing name `collectionCounts`, stored values are ownership markers equal to 1. Importing, clearing or filtering ownership must leave all existing card levels and level controls intact, including overrides on cards outside the deck.
- The bookmark method depends on opening the official app through the builder's button so `window.opener` is retained. Preserve origin/source checks, per-request random tokens and acknowledgement handling.
- Ordinary synchronization errors are displayed only by the builder. The bookmark retains a native manually dismissed alert for wrong-site use or an unavailable connection. It contains no timed-feedback UI or duration settings.
- The manual method opens the official site independently and lets the user copy the collection JSON. Both import methods use the same validation/import path.
- The localized `collectionImportWarning` panel sits above the collection instructions and directs users to the official collection to check whether their cards load.
