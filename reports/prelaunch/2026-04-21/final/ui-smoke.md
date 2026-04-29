# UI Smoke

## Completed

- `app` web bundle smoke passed via `cd app && npx expo export --platform web`
- output shows successful bundle/export to `app/dist`
- evidence: `final/ui-web-build-smoke.txt`

## Blocked

DB-backed tab smoke for `Listen / Speak / Conversation / Review` was not executable from this environment.

Blocking evidence:

- `scripts/seed.ts` failed before first DB write
- `curl -I https://ioosxzbdkscllgesmeqw.supabase.co` returned `Could not resolve host`
- direct Supabase client count query also returned `TypeError: fetch failed`

Impact:

- source/content remediation is complete and locally verified
- actual app rendering against live Supabase content remains blocked by current environment DNS/network resolution to Supabase

