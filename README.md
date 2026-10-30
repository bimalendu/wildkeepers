# Wildkeepers

A turn-based ecosystem-activism strategy game. You lead campaigns to restore ecosystems region by region, from the most urgent problem down to the individual sites and species at stake.

Phaser 3 + Vite + TypeScript, mobile-first offline PWA (same stack as `../iron-bastion`).

```
npm install
npm run dev          # http://localhost:5173/wildkeepers/
npm test             # vitest: rules, save, data integrity, every mission (bot wins, do-nothing loses)
npm run build && npm run test:e2e   # Playwright: desktop, Pixel 7, iPhone 14
npm run bot          # balance table: greedy bot vs every mission
npx tsx scripts/trace.ts la-amazon  # bot's turn-by-turn play of one mission
npx tsx scripts/gen-missions.ts     # regenerate missions + region trees from scripts/specs/
```

## Status (against the plan's 9 milestones)

| # | Milestone | State |
|---|---|---|
| 1 | Scaffold (build, PWA, CI, icons) | done |
| 2 | Simulation core (Rules v2): hex grid, 4 threat behaviours, 5 actions, one Energy resource, announced threat plan, 8-line rulebook | done, rule tests + bot balance |
| 3 | Playable mission UI + 3 Prologue missions | done (touch/mouse/keyboard; gamepad not yet) |
| 4 | Content pipeline: 95-item catalogue, priority formula, validators, archetype generator, bot solver | done |
| 5 | Campaign meta: World Map, Issue Tree, Briefing, Results, save and unlocks | done, including the Movement HQ (4 perks bought with Impact) |
| 6 | Content A (4 regions) | **done**: Latin America & Caribbean, Africa, Middle East & Central Asia, South Asia (28 missions, 23 Tier 2 nodes) |
| 7 | Content B (all regions) | **done**: all nine regions (63 missions, 21 Tier 2 nodes), every one of the 95 catalogue issues placed |
| 8 | Global Fronts + Hope cards | **done**: Global Fronts (6 missions along trade routes plus the Ozone hope mission, 2 Tier 2 nodes); 6 source-checked Hope cards shown on Results |
| 9 | Polish: Field Guide, art, audio, gamepad, Lighthouse | tile art done (Kenney Hexagon Pack, CC0); Field Guide done; sound effects (synthesised with Web Audio, no files); controller support (D-pad/stick, A, B, LB/RB, Y, Start); text sizes checked up to Largest; Lighthouse run (accessibility, best practices, SEO 100; performance 0.69 on throttled mobile, held back by script start-up). **Still to do: a check on a real phone** |

Catalogue coverage (every one of the 95 issues placed) is enforced by `npm test`.

## How content works

`scripts/specs/<region>.ts` holds names, labels, priority ratings, causes, sites and a sourced fact per issue. `scripts/archetypes.ts` turns each into a mission (map, threats, species, goals). `gen-missions.ts` then tunes difficulty with the greedy bot until it wins 4 of 5 seeds, and writes `src/levels/missions/<region>/*.json` and `src/data/regions/<region>.json`.

Every Tier 1 fact stores its source URL and the date it was checked. Hope cards carry a source, link and check date too, and a test requires every one to be marked `"verified": true`.

### How facts are checked

Everything the game states as real-world fact (fact cards, Hope cards, blurbs, species and their habitats, "things you can do" advice, and the driver, site and title labels) is recorded in `scripts/facts/ledger.json` and kept only if it clears a 95% bar:

- **Claim by claim.** Each text is split into single checkable claims (a number, date, name, ranking, cause or status). The text passes only if every claim passes, and the wording may not be stronger than the source says.
- **Source bar.** A claim needs a primary source (the study, agency or official page), or two independent secondary sources on different sites. Species habitat claims may rest on one reference; GBIF counts as primary for names and range.
- **Opened, not remembered.** Each source was opened during the check, and the ledger stores a short quote from it.
- **Verdicts.** `pass` (kept as written), `fix` (reworded or re-sourced to match the evidence) or `drop` (nothing reliable supports it, so it is not shown). A fact backed by two secondary sources shows both on its Sources line (`also` in the data).
- **Tier C labels** (drivers, sites, titles, catalogue names) are checked where they make a specific claim. Plain topic names are recorded as "no specific claim" in the ledger, with a note.

`tests/facts.test.ts` fails if a displayed text differs from the text that was checked, if a dropped text is still shown, if a claim misses the source bar, or if a displayed item has no ledger entry. So editing a fact means checking it again and updating the ledger. `npx tsx scripts/facts/report.ts` writes the readable record to `docs/fact-check.md`.
