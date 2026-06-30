# Notch Up — Schedule "Tally Rail" Final Spec

**Date:** 2026-06-29
**Status:** Build-ready (final). Supersedes `2026-06-28-notch-up-schedule-redesign.md` and `…-v2.md`.
**Scope:** Re-skin of (a) the per-day completion marker and (b) the header "record", plus streak. The week/phase list structure, dark theme, navigation, and data flow are untouched. No teardown.

---

## 1. Core decision & why it's harmonious

**Concept: The Tally Rail.**

The "notch up" soul is not a wooden board — every literal-wood attempt was rejected as 很醜/不協調/很硬要 because a brown material can never belong in a #080808 / gold app; it always reads as pasted-on. The soul is the **act of the tally**: a vertical hairline "stick" (the spine of an expanded week) into which each completed day is **struck as one diagonal tally stroke** — the universal "one more" gesture — rendered as a crisp gold blade-cut.

- The **per-day marker** is a single gold diagonal notch cut into a recessed seat on the rail. Not a checkbox, not a chevron (the v2 ▽ read as "expand/play"), not a wood chip.
- The **header record** is the *same* gold strokes the days produce, grouped in fives using the gate-five tally form (卌). The small mark you strike each day is the same mark that composes the record above — that identity is what makes it inevitable instead of decorative.
- It is built entirely from the app's own language: gold `#c9a84c` / gold2 `#e8c97a` strokes, `#202020` recesses, `#252525` hairlines, mono labels. Pure `react-native-svg` `<Line>` + `Animated`. No images, no textures, no filters, no new deps.

**Where the "wood carving" lives — the MOTION, not the surface.** Per the user (用動畫呈現出刻畫木頭的樣子，而不是硬要塞圖片): every *resting* surface stays fully harmonious in the app's elegant dark + gold/cream language — no wood, no texture, refined and integrated. The carving soul is delivered **entirely through the carve micro-interaction** (§3.3): for ~420ms on tap, a blade slashes in, bites the seat with a recoil, drives a notch in (deepening mouth→point), flicks a chip or two, then everything calms into a clean gold engraved notch. The **moment** is the carve; the **result** is a refined mark in the record. This is the emotional payoff of the whole screen — §3.3 is the hero, not a detail.

Older tally groups render in `uiDim #8a7d6e`; the live (most recent, partial) group renders in `gold2 #e8c97a` — so the record visibly **fades back in time** and the leading edge glows. That gradient of age is what makes the header feel like an accumulating carved record rather than a static number.

Mockup: `/private/tmp/claude-501/-Users-suh-Desktop-study-anywhere-voyage-study-anywhere-voyage-daily-english/f60567bf-3e86-4963-b090-a295d02fb865/scratchpad/notch-final-mockup.png`

---

## 2. Components to create

All under `app/src/components/schedule/`:

| File | Export | Purpose |
|---|---|---|
| `NotchMarker.tsx` | `NotchMarker` | Per-day marker on the rail. 3 states + carve animation. Replaces the checkbox. |
| `TallyRecord.tsx` | `TallyRecord` | Header master tally (gate-five groups) rendered from the completed count. |

Theme tokens are imported from `../../constants/theme` (`colors`, `fonts`). No hardcoded hex in components — every value below maps to an existing token.

---

## 3. `NotchMarker` — the per-day marker

Replaces the `<TouchableOpacity style={[styles.checkbox …]}>` block at **ScheduleScreen.tsx ~169-175**.

### 3.1 Geometry (SVG)

- Container: `<Svg width={30} height={40} viewBox="0 0 30 40">`. The marker column (`styles.mark`) is `width:34, alignItems:'center'`. Rail centered at `x=15`.
- **Rail** (always drawn, all states): `<Line x1=15 y1=0 x2=15 y2=40 stroke={colors.border} strokeWidth={1.5} />` (`#252525`). Drawing it full-height on every row makes the rail continuous down the expanded week.
- **Seat** (recess, always drawn): `<Line x1=15 y1=14 x2=15 y2=26 stroke={colors.surface3} strokeWidth={5} strokeLinecap="round" />` (`#202020`).

### 3.2 States

**LOCKED (future day — `day.calendarDate > today`, not done):**
- Seat as above, plus a faint inner groove:
  `<Line x1=15 y1=15 x2=15 y2=25 stroke={colors.muted2} strokeWidth={1.2} strokeLinecap="round" />` (`#3a3633`).
- Not pressable (or press is a no-op / gentle shake — see §3.5). Empty seat waiting on the stick.

**TODAY-AVAILABLE (`day.calendarDate === today`, not done):**
- Widened lit seat: draw the seat at `strokeWidth={6}` in `colors.surface3`, then overlay
  `<Line x1=15 y1=13 x2=15 y2=27 stroke={colors.gold} strokeWidth={6} strokeLinecap="round" opacity={0.16} />`.
- **Ghost blade** (the cut hovering, not yet struck): dashed diagonal
  `<Line x1=8 y1=26 x2=22 y2=14 stroke={colors.gold} strokeWidth={1.6} strokeLinecap="round" strokeDasharray="1.5 3" opacity={pulse} />`.
- `pulse` is an `Animated.Value` breathing `0.4 ↔ 0.75` (see §3.4 breathing). Pressable → carve.

**DONE (`completedDays[day.id]` true):**
- Seat drawn at `strokeWidth={5}` `colors.surface3`.
- **Struck notch**: `<Line x1=7 y1=27 x2=23 y2=13 stroke={colors.gold2} strokeWidth={2.4} strokeLinecap="round" />` (`#e8c97a`), lower-left → upper-right (the natural tally stroke direction).
- Pressable → un-carve (toggle off), reversing the animation.

> Static state (already-done on mount, no animation): render the struck notch at full length/opacity directly. Animation only runs on the tap that changes the state.

### 3.3 Carve micro-interaction (tap on TODAY → DONE) — THE STAR

This is the emotional payoff. The "wood carving" soul lives **entirely here, in the motion** — never in any static material or texture. For ~**420ms** it must feel like a knife was driven into the rail and a notch was cut; then it settles into the clean, elegant gold engraved done-notch. Resting surfaces stay refined dark+gold throughout; only the *act* is carving.

> Design intent: a blade sweeps in fast (slash) → bites at the seat (impact + recoil) → drives the cut in, deepening from mouth to point → a chip or two flicks out and settles → everything calms to the still engraved notch. Knife, not checkmark.

**Why it reads as "carving" without wood:** (1) the **slash** is a fast off-axis light streak — the blade catching light as it travels; (2) the cut **deepens mouth→point** rather than appearing whole — that progressive bite is the core carve cue; (3) the **recoil** gives the marker the physical "thunk" of a tool meeting resistance; (4) **chips** are the debris of removed material. None of these require a texture — they're pure motion semantics.

#### Animated values (5 drivers)
```ts
const slash  = useRef(new Animated.Value(0)).current  // blade streak sweep 0→1
const cut    = useRef(new Animated.Value(0)).current  // notch drives in, mouth→point 0→1
const kick   = useRef(new Animated.Value(0)).current  // press-in then recoil 0→1→0 (via sequence)
const chips  = useRef(new Animated.Value(0)).current  // particle flick + settle 0→1
const settle = useRef(new Animated.Value(0)).current  // final calm/brighten of done-notch 0→1
```
All transforms/opacity → `useNativeDriver: true`. (Geometry-only props — `strokeDashoffset`, `x/y`, `strokeWidth` — are NOT native-drivable; the design below deliberately uses **transform + opacity** for every animated element so the whole interaction is native-driven. See "Driving the cut" note.)

#### Geometry of the cut
Notch axis: lower-left **(7,27)** → upper-right **(23,13)**. Length L = √(16²+14²) ≈ **21.3**, angle ≈ **−41°** from horizontal. The notch is the "done" struck stroke from §3.2.

**Driving the cut (mouth→point), all-native:** wrap the notch `<Line>` in an `Animated.View`/SVG `<G>` and scale it along its own axis from the **mouth** (7,27) as origin:
- Rotate the group container so the stroke axis is local-horizontal, scale X 0→1, rotate back — OR simpler, since react-native-svg `<G>` supports an animated `transform` with `origin`: animate `scale` with `origin="7,27"`. The stroke visibly grows from the mouth toward the point — the blade driving in.
- Layer a subtle **depth cue** without filters: render the notch as **two stacked strokes** — a darker "trough" underlay (`colors.gold` at `strokeWidth 3`, `opacity 0.5`) and the bright "edge" overlay (`colors.gold2` at `strokeWidth 2.4`). During `cut`, the bright edge's `scaleX` slightly lags the trough (drive the overlay off `cut` and the underlay off `cut` delayed ~40ms) so the cut reads as having a lit lip and a recessed body — engraved, not painted-on.

#### The slash (blade light streak)
A separate thin bright stroke that travels across and past the marker, brighter and longer than the notch, fading as it exits — the blade catching light.
- `<AnimatedLine x1=2 y1=32 x2=28 y2=8 stroke={colors.gold2} strokeWidth={1.3} strokeLinecap="round" />` (steeper/longer than the notch).
- It does not "draw on"; it **translates** along its own axis and fades:
  - `translate` = `slash.interpolate([0,1] → [-10, 14])` applied along the blade axis (use an `Animated.View` rotated to the axis, translateX in local space), so it sweeps lower-left → upper-right and overshoots.
  - `opacity` = `slash.interpolate([0, 0.25, 0.7, 1] → [0, 0.95, 0.6, 0])` — appears fast, lingers, gone before settle.
  - optional `scaleX` (length) `slash.interpolate([0,0.5,1] → [0.7,1.1,0.9])` for a whip feel.

#### The recoil (impact)
The whole `<Svg>` marker gets a press-in + recoil so the cut lands with weight:
- `kick` runs as a **sequence**: 0 → 1 (press in, 90ms) → 0 (recoil out + settle, 160ms, spring-like easing).
- Mapping on the marker container `transform`:
  - `translateX` = `kick.interpolate([0,1] → [0, -1.8])` (nudges toward the cut origin / into the rail)
  - `scale` = `kick.interpolate([0, 1] → [1, 0.94])` (compress on impact)
- After the sequence the marker is back to rest; the recoil-out half uses `Easing.elastic(0.9)` or `Easing.out(Easing.back(1.4))` for a crisp settle, not a bounce.

#### Chips (optional flourish — 2 particles)
Tasteful debris flicking out from the cut point and settling fast. Two tiny `<Circle r=1>`/short `<Line>` shards (`colors.gold2`, then fading to `colors.uiDim`) emitted from near the point (~(21,15)).
- Each chip = an `Animated.View` driven by `chips` 0→1:
  - chip A: `translateX` `[0,1]→[0, 7]`, `translateY` `[0,1]→[0, -6]`, then gravity droop via `translateY` `[0,0.4,1]→[0,-6,-2]`.
  - chip B: `translateX` `[0,1]→[0, 5]`, `translateY` `[0,0.4,1]→[0,-3,1]` (shorter arc).
  - both: `opacity` `[0,0.15,0.7,1]→[0,1,0.8,0]`, `scale` `[0,1]→[1,0.6]`.
- Keep them ≤2, small, gold→dim, gone by ~300ms. They are a flourish — gate behind a `showChips` const (default true) so they're trivially removable if they ever feel busy.

#### Choreography & timing (total ≈ 420ms felt)
```ts
const carve = () => {
  // optional haptic (only if expo-haptics already a dep — do NOT add it)
  // Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle.Medium)

  Animated.parallel([
    // 1. slash sweeps in first and exits fast
    Animated.timing(slash, { toValue: 1, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true }),

    // 2. the cut drives in, slightly delayed so the blade "arrives" then bites; mouth→point
    Animated.sequence([
      Animated.delay(70),
      Animated.timing(cut, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]),

    // 3. recoil: press-in on contact, then settle out
    Animated.sequence([
      Animated.delay(60),
      Animated.timing(kick, { toValue: 1, duration: 90,  easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(kick, { toValue: 0, duration: 170, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }),
    ]),

    // 4. chips flick out at the moment of bite
    Animated.sequence([
      Animated.delay(90),
      Animated.timing(chips, { toValue: 1, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]),

    // 5. final calm: notch brightens/locks to its still done value
    Animated.sequence([
      Animated.delay(260),
      Animated.timing(settle, { toValue: 1, duration: 160, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]),
  ]).start(() => { slash.setValue(0); chips.setValue(0) }) // reset one-shot drivers; cut & settle stay at 1 (done)
}
```
- `settle` can drive a final tiny `opacity` lift on the bright edge (e.g. `0.85 → 1`) and a hairline `scale` relax of the trough, so the very end "calms" into the still engraved mark rather than stopping abruptly.
- **Felt arc:** 0ms blade appears → ~90ms blade meets seat, marker presses in, cut begins driving from the mouth, chips flick → ~260ms cut reaches the point, blade exits → ~420ms chips gone, marker settled, notch resolves to the clean elegant gold done-state. Snappy and blade-like, never floaty.

#### Reduce-motion
Respect `AccessibilityInfo.isReduceMotionEnabled()` (subscribe to `reduceMotionChanged`). When enabled: **instant swap** — set `cut`/`settle` to 1 immediately, skip slash/kick/chips entirely (no streak, no recoil, no particles). The done-notch simply appears. Same for un-carve (instant clear).

#### Un-carve (DONE → toggle off)
Reverse, quiet, no flourish: `Animated.timing(cut, { toValue: 0, duration: 200, easing: Easing.in(Easing.cubic) })` (notch retracts mouth←point), `settle` → 0. No slash, no chips, a faint `kick` (single 120ms press, no recoil) is optional. Carving is celebratory; un-carving is plain.

### 3.4 Breathing (today seat idle)
```ts
useEffect(() => {
  const loop = Animated.loop(Animated.sequence([
    Animated.timing(pulse, { toValue: 0.75, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    Animated.timing(pulse, { toValue: 0.40, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
  ]))
  loop.start(); return () => loop.stop()
}, [])
```
Only mount the loop when state === today-available.

### 3.5 Locked press feedback (optional, nice-to-have)
On press of a locked day, a 1-cycle horizontal shake of the seat (`Animated.sequence` ±2px, 3 cycles, 60ms each) signals "not yet". Keep `toggleDay` behavior as-is if the product currently allows toggling any day — do **not** change the data contract; this is visual only. If the existing checkbox allowed toggling future days, the NotchMarker keeps that (locked is then purely a visual "uncut seat" with the empty groove, still pressable → carve).

### 3.6 Props
```ts
type NotchState = 'locked' | 'today' | 'done'
interface NotchMarkerProps {
  state: NotchState
  onToggle: () => void          // wire to handleToggleDay(day.id)
  animateOnChange?: boolean      // default true; false suppresses initial animation
}
```
Pressable wrapper: `<Pressable hitSlop={{top:8,bottom:8,left:8,right:8}}>` (matches current checkbox hitSlop).

---

## 4. `TallyRecord` — the header master tally

Replaces the contents of `styles.statsRow` at **ScheduleScreen.tsx ~242-255** (the three plain stat columns). The new header block:

```
THE RECORD · Phase 1
[ 卌 卌 卌 卌 ||| ]          ← tally SVG, full width
  23            5           6%
  NOTCHED     STREAK      PROGRESS
```

### 4.1 Container
Reuse the existing `styles.header` wrapper. Inside, add a `record` surface card to match app craft:
- `backgroundColor: colors.surface2` (`#181818`), `borderWidth:1, borderColor: colors.border`, `borderRadius:12`, `padding: 16/18`.
- Label row: `THE RECORD` in `fonts.mono`, `fontSize:9, letterSpacing:2.5, color: colors.uiDim, textTransform:'uppercase'`; followed by `· {phaseLabel}` in `colors.muted`.

### 4.2 Tally SVG generation
Input: `completed` (number, = `stats.completed`). Render `completed` strokes grouped in fives.

Per-group layout (viewBox height 32, strokes y 6→26):
- 4 verticals at local x = 0, 7, 14, 21 (`strokeWidth:2`), then the diagonal binding stroke `(−3,26)→(25,6)` for the 5th. Group advance = **38px** (group width ~29 + 9 gap).
- Partial trailing group: just N verticals (no diagonal).
- **Color by age:** the **last (live) group** → `colors.gold2` `#e8c97a`, `strokeWidth 2.2`. All earlier groups → `colors.uiDim` `#8a7d6e`, `strokeWidth 2`. (Optional richer gradient: most-recent gold2, second-most-recent `colors.gold`, rest uiDim — implement only if it reads well at runtime; the two-tier version is the baseline.)
- `<Svg width="100%" height={32} viewBox="0 0 {totalW} 32" preserveAspectRatio="xMinYMid meet">` so it left-aligns and scales to card width. For large counts (the record grows to 365), cap the rendered viewBox to the **most recent ~7 groups** (35 notches) and prefix with a mono `…` so the header never overflows — the leading edge is what matters.

```ts
function buildTally(count: number) {
  const fullGroups = Math.floor(count / 5)
  const rem = count % 5
  // render last 7 groups max
  const groups: { strokes: number; live: boolean }[] = []
  for (let i = 0; i < fullGroups; i++) groups.push({ strokes: 5, live: false })
  if (rem > 0) groups.push({ strokes: rem, live: false })
  if (groups.length) groups[groups.length - 1].live = true
  const shown = groups.slice(-7)
  const truncated = groups.length > 7
  return { shown, truncated }
}
```
`live` group uses gold2; render diagonal only when `strokes === 5`.

### 4.3 Stats row (kept, restyled)
Below the tally, a flex row, `justifyContent:'space-between'`:
- **NOTCHED** = `stats.completed` (new — this is the count the tally encodes)
- **STREAK** = `stats.streak`
- **PROGRESS** = `stats.pct%`
- `statVal`: `fonts.mono`, `fontSize:20, color: colors.ui`. `statLab`: `fonts.mono`, `fontSize:8, letterSpacing:1.5, color: colors.muted, uppercase`.

### 4.4 Progress bar + RESET
Keep the existing `progressBarRow` (the 2px `colors.ui` fill + RESET button) exactly as-is, inside the record card, `marginTop:16`.

### 4.5 Tally grow animation (optional)
When `completed` increments while the screen is mounted, the newly added stroke can fade+draw in (reuse the NotchMarker draw-on, 220ms, gold2). Not required for v1; the per-day carve is the hero interaction.

---

## 5. Exact slot-in points in `ScheduleScreen.tsx`

### 5.1 Per-day marker (~161-175)
Replace:
```tsx
const isDone = !!completedDays[day.id]
const isToday = day.calendarDate === today
return (
  <View key={day.id} style={[styles.dayRow, isToday && styles.dayRowToday]}>
    <TouchableOpacity style={[styles.checkbox, isDone && styles.checkboxDone]} … >
      {isDone && <Text style={styles.checkmark}>✓</Text>}
    </TouchableOpacity>
    <View style={styles.dayInfo}> … </View>
  </View>
)
```
With:
```tsx
const isDone = !!completedDays[day.id]
const isToday = day.calendarDate === today
const markerState: NotchState = isDone ? 'done' : isToday ? 'today' : 'locked'
return (
  <View key={day.id} style={[styles.dayRow, isToday && styles.dayRowToday]}>
    <View style={styles.mark}>
      <NotchMarker state={markerState} onToggle={() => handleToggleDay(day.id)} />
    </View>
    <View style={styles.dayInfo}> … unchanged … </View>
  </View>
)
```
- Add style `mark: { width: 34, alignItems: 'center', paddingTop: 1 }`.
- Remove now-unused `checkbox`, `checkboxDone`, `checkmark` styles (or leave; dead but harmless). `dayRow` keeps its existing `paddingLeft` so the rail aligns under the week number — verify the rail's `x=15` lands roughly under the `W01` column; nudge `styles.mark` width / `dayRow.paddingLeft` if needed at runtime.

### 5.2 Header record (~241-255)
Replace the `<View style={styles.statsRow}>…three statItem…</View>` with:
```tsx
<TallyRecord
  completed={stats.completed}
  streak={stats.streak}
  pct={stats.pct}
  phaseLabel={currentPhaseLabel}   // derive from currentEntry / PHASE_LABELS
/>
```
Move the existing `progressBarRow` inside `TallyRecord` (or pass RESET handler down). Wrap header content in the `record` card surface (§4.1). Keep `styles.header` border-bottom.

`stats` already computes `completed`, `streak`, `pct` (lines 98-112) — no store changes. `phaseLabel`: `PHASE_LABELS[currentEntry?.phase] ?? ''`.

---

## 6. Token map (every value used → existing token)

| Use | Token | Hex |
|---|---|---|
| Rail hairline | `colors.border` | #252525 |
| Seat recess | `colors.surface3` | #202020 |
| Locked inner groove | `colors.muted2` | #3a3633 |
| Struck notch / live tally / blade-flash | `colors.gold2` | #e8c97a |
| Today seat glow / older accents | `colors.gold` | #c9a84c |
| Aged tally groups | `colors.uiDim` | #8a7d6e |
| Stat values | `colors.ui` | #C4B49A |
| Labels | `colors.muted` / `colors.uiDim` | #5a5650 / #8a7d6e |
| Record card bg / border | `colors.surface2` / `colors.border` | #181818 / #252525 |
| Mono text | `fonts.mono` (DMMono) | — |

---

## 7. Constraints honored
- `react-native-svg` `Line`/`G`/`Circle` + `Animated` only. No `feTurbulence`/`feDisplacement`/`blur`. No images, no textures, no brown, no new deps.
- All color/spacing from `constants/theme`.
- Week/phase list, navigation, data stores untouched. `toggleDay` contract unchanged.
- **The carve animation (§3.3) is built with transform + opacity only, so the entire interaction runs on `useNativeDriver: true`.** No geometry props (`strokeDashoffset`, `x/y`, `strokeWidth`) are animated. The "cut driving in" is achieved by scaling the notch group from its mouth origin, not by animating dash/geometry.
- Reduce-motion respected: instant swap, no slash/recoil/chips.

## 8. Build order
1. `NotchMarker.tsx` — static 3 states (no animation) → slot into 5.1 → verify rail alignment & all states render at rest (these are the elegant resting states the mockup shows).
2. **The carve animation (§3.3) — the hero.** Build the full choreography: slash streak → mouth→point cut (two-stroke trough+edge depth) → press-in/recoil → chips → settle. Tune on device until ~420ms genuinely *feels* like a knife carved a notch, then calms to the clean gold mark. Add reduce-motion instant-swap. Add today breathing (§3.4). Do not consider the screen done until this moment lands — it is the emotional payoff.
3. `TallyRecord.tsx` — static tally from count → slot into 5.2 → verify grouping/aging/truncation.
4. Wrap header in record card; relocate progress bar + RESET.
5. (Optional) tally grow-in animation (newest header stroke draws in on increment, reusing the carve language), locked-shake, haptics-if-present.
