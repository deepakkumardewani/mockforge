# E2E scenario review (independent)

## Issues found

### False positives
- None removed. Labels checked against `apps/web` (hero, live demo, builder, playground presets, docs copy, protocol rail).

### Inconsistencies (fixed unless noted)
- **builder.feature.md / custom-data.feature.md**: `# Feature` + As a / So that / `---` did not match other files.
- **playground-rest.feature.md / playground-graphql.feature.md**: Used "click" while landing/docs use "choose"/"follow".
- **playground-websocket.feature.md / playground-socketio.feature.md**: User story formatting; first deep-link scenario retitled to first person.
- **App copy**: Landing protocol tabs show **"Socket.io"**; playground rail shows **"Socket.IO"** (code, not scenario error).

### Gaps (addressed)
- **landing.feature.md**: No coverage for `WhyMockForge` or `UseCasesTrust` on `page.tsx` — added 2 scenarios.
- **builder.feature.md**: Save API failure alert (`role="alert"`) — added 1 scenario.

### Gaps (intentional omissions)
- **Capabilities / DX** marketing sections: not mounted in `apps/web/src/app/page.tsx` (inventory was stale).
- **LiveCounter.tsx**: not on homepage; live demo embeds stats only.
- **Builder**: no `/builder?slug=` deep link; no in-app "try endpoint" after save; custom data GET-only.
- **MfIdPrompt**: not auto-shown; identity via header + manual "Recovery key" dialog only.
- **WebSocket/Socket.IO**: many steps still say "press" for Connect/Disconnect (matches button copy).
- **Save success**: sr-only "Schema saved." — not user-visible enough for Gherkin.

## Changes made
See git diff on `agent_docs/e2e/scenarios/*.feature.md`.

## Scenario counts

| File | Scenarios |
|------|-----------|
| agent_docs/e2e/scenarios/builder.feature.md | 24 |
| agent_docs/e2e/scenarios/custom-data.feature.md | 7 |
| agent_docs/e2e/scenarios/docs.feature.md | 12 |
| agent_docs/e2e/scenarios/landing.feature.md | 21 |
| agent_docs/e2e/scenarios/playground-graphql.feature.md | 12 |
| agent_docs/e2e/scenarios/playground-rest.feature.md | 12 |
| agent_docs/e2e/scenarios/playground-socketio.feature.md | 15 |
| agent_docs/e2e/scenarios/playground-websocket.feature.md | 15 |
| agent_docs/e2e/scenarios/shell.feature.md | 14 |

**Total: 132**

## KB sources (context-mode)
- `feature_files`, `inventory_head`, `mockforge-e2e-scenario-count`
