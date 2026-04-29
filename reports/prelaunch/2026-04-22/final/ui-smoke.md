# UI Smoke

## Completed

- strict content verification passed before UI checks
- `app` web bundle smoke passed via `cd app && npx expo export --platform web`
- output successfully exported to `app/dist`
- evidence: `final/ui-web-build-smoke.txt`

## Blocked

DB-backed tab smoke for `Listen / Speak / Conversation / Review` remains blocked from this environment.

Blocking evidence:

- `scripts/seed.ts` failed before the first DB write
- `curl -I https://ioosxzbdkscllgesmeqw.supabase.co` returned `Could not resolve host`

## Interpretation

- content source files are now in strict `PASS`
- web bundle health is confirmed
- final launch sign-off still requires DNS / network recovery and one successful DB-backed smoke run
