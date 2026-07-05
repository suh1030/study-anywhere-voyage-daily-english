# Notch Up — Schedule Screen Redesign Spec

**Date:** 2026-06-28
**Target file:** `app/src/screens/tabs/ScheduleScreen.tsx`
**New components:** `app/src/components/schedule/TallyCount.tsx`, `app/src/components/schedule/NotchMarker.tsx`
**Dependencies:** TypeScript + `react-native-svg` (15.15.3, already installed) + react-native `Animated`. **No new dependencies.**
**Status:** Design only — do not implement yet.

---

## 1. Design rationale

The name **Notch Up** comes from the old habit of carving a notch (刻一道) into wood or a belt to mark each thing achieved — every completed day is one more notch cut, and the run of notches *is* the record of progress. The current screen reduces that to a generic checkbox, which loses the soul of the brand. This redesign restores it on three levels: (1) the header turns the abstract "COMPLETED N" number into **literal tally marks** — gold strokes grouped in fives, the way a person actually keeps a running count carved into a surface; (2) each day's completion marker becomes a **carved wedge notch** — an empty engraved slot that, when tapped, gets a solid gold wedge "cut into" it with a quick press-and-cut animation; (3) a streak of consecutive done days is joined by a **carved groove line**, so an unbroken run reads as a single continuous cut rather than separate marks. Everything stays inside the existing dark-and-gold palette and conveys "carved into the dark surface" through inset highlight/shadow, never through literal wood photography.

---

## 2. Header tally component (`TallyCount`)

Replaces the existing left-most stat (`COMPLETED {n}`) in `styles.statsRow`. `STREAK` and `PROGRESS%` stay exactly as they are. Because tally marks need horizontal room, the header layout changes from `justify-content: space-around` (3 equal cells) to a **left tally block + right two-stat cluster** (see §2.4).

### 2.1 What it shows

- Label line: `NOTCHES CARVED` (mono, uppercase) with `已刻 {n} 道` beneath it.
- A row of tally marks representing `n = stats.completed`, grouped in fives.
- Each complete group of five = four vertical strokes + one diagonal strike across them (the classic 正-style five-bar gate, Western variant).
- A trailing **partial group** of 1–4 vertical strokes for the remainder (`n % 5`), with no diagonal.

`n` can be large (up to 365). Rendering 73 tally groups is neither legible nor performant, so the tally row is **capped and summarized**:

- If `n <= 30` (≤ 6 groups): render every group literally.
- If `n > 30`: render the **last 5 complete groups + current partial group** literally (the "live edge" of the carving), and prefix them with a compact `+{m}×▌▌▌▌▍` count token, e.g. `+45` in `colors.gold2` mono, meaning 45 earlier notches not drawn. This keeps the row to a fixed max width while preserving the carved feeling at the active edge.

Define:
```
const MAX_LITERAL_GROUPS = 6        // groups drawn before summarizing
const TAIL_GROUPS = 5               // groups kept literal when summarizing
const fullGroups = Math.floor(n / 5)
const remainder  = n % 5
```

### 2.2 Geometry — one group of five (SVG)

Each tally group is one `<Svg>` of fixed size. Use a per-group viewBox so groups tile cleanly with a fixed gap.

- **Group viewBox:** `0 0 26 24` (width 26, height 24).
- **Stroke color:** `colors.gold` (`#c9a84c`) for the four verticals; `colors.gold2` (`#e8c97a`) for the diagonal strike (slightly brighter so the "fifth/closing" cut reads as the completing stroke).
- **Stroke width:** `2`. **strokeLinecap:** `round`.
- **Engraved feel:** under each gold stroke, draw the *same* path offset by `+1px` in x and y in `colors.bg` (`#080808`) at `strokeWidth 2`, `opacity 0.6`, rendered *first* (behind), so each gold cut sits above a dark shadow line — reads as inset/carved. (This shadow-behind technique is the only "engraving" trick used; keep it subtle.)

Four verticals at x = 4, 9, 14, 19, each from `y=3` to `y=21`:
```
<Line x1={4}  y1={3} x2={4}  y2={21} />
<Line x1={9}  y1={3} x2={9}  y2={21} />
<Line x1={14} y1={3} x2={14} y2={21} />
<Line x1={19} y1={3} x2={19} y2={21} />
```
Diagonal strike (only when the group is complete), crossing all four, slightly overhanging:
```
<Line x1={2} y1={20} x2={22} y2={4} stroke={colors.gold2} />
```
(Use `react-native-svg` `Line`, or a single `Path` `"M4 3V21 M9 3V21 M14 3V21 M19 3V21"` for the verticals plus a separate `Path "M2 20 L22 4"` for the strike — `Path` is preferred for fewer nodes.)

**Partial group (1–4 strokes):** same viewBox and stroke spec, render only the first `remainder` verticals (x = 4, then 9, 14, 19), **no diagonal**.

### 2.3 Sizes & layout of the tally row

- Rendered group size: **width 22, height 20** (scale the 26×24 viewBox down to fit the header without crowding).
- Gap between groups: `6px` (`flexDirection: 'row'`, `gap: 6`, `alignItems: 'center'`).
- `+{m}` summary token: `fontFamily: fonts.mono`, `fontSize: 11`, `color: colors.gold2`, `letterSpacing: 0.5`, `marginRight: 6`, vertically centered with the groups.
- Empty state (`n === 0`): show one **ghost** group at `opacity 0.25` using `colors.muted` strokes (no diagonal, all four verticals) as an affordance hint, plus `已刻 0 道`.

### 2.4 Coexistence with STREAK / PROGRESS

New header structure (replaces current `statsRow`):

```
<View style={styles.statsRow}>            // flexDirection row, alignItems flex-end, justifyContent space-between
  <View style={styles.tallyBlock}>        // flex: 1, left aligned
    <TallyCount n={stats.completed} />     // the tally marks row (§2.1–2.3)
    <View style={styles.tallyLabelRow}>
      <Text style={styles.statLabel}>NOTCHES CARVED</Text>
    </View>
    <Text style={styles.tallySubLabel}>已刻 {stats.completed} 道</Text>
  </View>
  <View style={styles.statCluster}>        // flexDirection row, gap 20
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{stats.streak}</Text>
      <Text style={styles.statLabel}>STREAK</Text>
    </View>
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{stats.pct}%</Text>
      <Text style={styles.statLabel}>PROGRESS</Text>
    </View>
  </View>
</View>
```

New styles:
```
tallyBlock:    { flex: 1 },
tallyLabelRow: { marginTop: 6 },
tallySubLabel: { fontFamily: fonts.mono, fontSize: 10, color: colors.uiDim, marginTop: 1, letterSpacing: 0.5 },
statCluster:   { flexDirection: 'row', gap: 20, alignItems: 'flex-end' },
```
Keep existing `statLabel`, `statValue`, `statItem`. `statValue` stays `colors.ui`; the tally marks are the only gold in the header, which makes the carved record the clear focal point.

---

## 3. Per-day wedge marker (`NotchMarker`)

Replaces the `styles.checkbox` / `checkboxDone` / `checkmark` block in each day row (`ScheduleScreen.tsx` lines 169–175). Same position (left of `dayInfo`, `marginTop: 2`).

### 3.1 Sizes & hit area

- Visual size: **22 × 22** SVG (`viewBox="0 0 22 22"`), rendered at 22×22.
- The `TouchableOpacity` wrapper keeps a **≥44px tappable target**: `width: 22, height: 22` visual but `hitSlop={{ top: 11, bottom: 11, left: 11, right: 11 }}` (current screen uses 8; bump to 11 so 22 + 11×2 = 44). This satisfies the 40px-minimum accessibility rule with margin.
- `accessibilityRole="button"`, `accessibilityState={{ checked: isDone }}`, `accessibilityLabel` = `已刻 / 待刻` + the day label (e.g. `"06/28 週日，已刻一道"` / `"06/28 週日，待刻一道"`).

### 3.2 The wedge geometry (the carved cut)

The wedge is a downward-pointing triangular knife-cut centered in the box — wide at the top (the open mouth of the cut), narrowing to a point at the bottom, like a chip carved out of an edge.

Wedge triangle path (viewBox `0 0 22 22`):
```
M 5 6  L 17 6  L 11 17 Z
```
- Top edge from `(5,6)` to `(17,6)` = the cut's mouth (12px wide).
- Down to the point at `(11,17)`.
- A subtle inner highlight line along the upper-left facet to sell the bevel:
  `M 5 6 L 11 17` stroked `colors.gold2` width `1` opacity `0.5` (only in the DONE state).

### 3.3 The three states

All three share the same wedge outline position so the shape feels "the same slot, progressively cut."

**State A — Not yet available** (`day.calendarDate > today`, locked future day):
- Wedge as **outline only**, `stroke={colors.muted2}` (`#3a3633`), `strokeWidth={1.25}`, `fill="none"`.
- Overall `opacity: 0.5`. Reads as a faint, un-started slot.
- Not interactive (no `onPress`, or `disabled`), no hitSlop expansion needed but keep it for layout consistency.

**State B — Today / available, not done** (`calendarDate <= today && !isDone`) — the "empty notch slot inviting a cut":
- Wedge outline `stroke={colors.gold}` (`#c9a84c`), `strokeWidth={1.5}`, `strokeDasharray="2 2.5"`, `fill="none"`.
- Add a faint inset fill `fill={colors.gold + '14'}` (≈8% alpha) behind the dashed outline so the slot looks slightly recessed.
- For **today specifically**, brighten outline to `colors.gold2` and pulse opacity (see §4.3) to say "carve me today."

**State C — Done** (`isDone`) — the wedge cut in:
- Wedge **filled** `fill={colors.gold}` (`#c9a84c`), no stroke.
- Plus the upper-left facet highlight from §3.2 (`colors.gold2`, width 1, opacity 0.5).
- Plus a 1px dark shadow copy of the triangle offset `(+0.75, +0.75)` in `colors.bg` rendered *behind* the gold fill → carved-in depth (mirrors the tally engraving trick).

State resolution in render:
```
const state: 'locked' | 'open' | 'done' =
  isDone ? 'done' : (day.calendarDate > today ? 'locked' : 'open')
```

---

## 4. Carving micro-interaction (react-native `Animated`)

Only `Animated` from `react-native` is available (no reanimated). The marker owns one `Animated.Value` for press scale and one for the cut-in progress.

### 4.1 Values

```
const pressScale = useRef(new Animated.Value(1)).current   // 1 → 0.86 → 1
const cut        = useRef(new Animated.Value(isDone ? 1 : 0)).current  // 0 (empty) → 1 (filled)
```

The wedge `<Svg>` is wrapped in an `Animated.View` with `transform: [{ scale: pressScale }]`.

### 4.2 Tap = carve sequence

On `onPressIn`: quick press-down (the knife meeting the wood).
```
Animated.timing(pressScale, { toValue: 0.86, duration: 80, easing: Easing.out(Easing.quad), useNativeDriver: true }).start()
```
On `onPress` (commit the toggle): fire `toggleDay`, then run the **cut-in + spring-back** together:
```
Animated.parallel([
  Animated.spring(pressScale, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true }),
  Animated.timing(cut, {
    toValue: isDone ? 0 : 1,            // toggling on → 1 ; toggling off → 0
    duration: 200,
    easing: Easing.out(Easing.cubic),   // fast bite then settle
    useNativeDriver: true,
  }),
]).start()
```
Total felt duration ≈ 80ms press + ~200ms cut ≈ a crisp ~220–280ms "press and the wedge bites in."

**How `cut` drives the visual** (since `useNativeDriver: true` only animates transform/opacity, not `fill`):
- Render **both** the empty-slot wedge (State B) and the done wedge (State C) stacked.
- The done wedge sits in an `Animated.View` with:
  - `opacity: cut` (0 → 1), and
  - `transform: [{ scaleY: cut.interpolate({ inputRange: [0,1], outputRange: [0.4, 1] }) }]` with `transformOrigin` top — so the wedge appears to **drive downward from the mouth to the point**, like a cut deepening. (react-native-svg honors a top-anchored scaleY if the Animated.View wraps the Svg and the Svg is top-aligned; if origin control is fiddly, fall back to `scale` from 0.6→1 centered — still reads as "cut appearing.")
- The empty-slot wedge fades opposite: `opacity: cut.interpolate({ inputRange:[0,1], outputRange:[1,0] })`.

Reverse (un-carving) plays the same in reverse for the RESET / toggle-off case, so undo feels like the wedge lifting back out.

### 4.3 "Today" idle pulse (optional but recommended)

For the available *today* marker only, a slow breathing pulse invites the cut:
```
Animated.loop(Animated.sequence([
  Animated.timing(todayPulse, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
  Animated.timing(todayPulse, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
]))
```
Drive the dashed wedge's `opacity` between `0.55` and `1.0`. Stop the loop once the day becomes done. Respect reduced-motion: gate the loop behind `AccessibilityInfo.isReduceMotionEnabled()` (skip pulse if true; the cut-in animation can also be shortened to a 1-frame state swap when reduce-motion is on).

---

## 5. Streak treatment — the continuous carved run

Goal: consecutive done days within an expanded week read as **one connected groove** rather than separate notches.

Approach (per expanded week's day list): each day row's marker column reserves a **2px vertical groove channel** centered under the wedge point (x ≈ marker center). For a day that is `done` AND whose adjacent day (above/below, in calendar order within the rendered list) is also `done`, draw a **connector groove segment** in that channel:

- Color: `colors.gold` at `opacity 0.45`, width `2`, with a `colors.bg` 1px shadow line beside it (`x+1`) for the inset look — same engraving language.
- The segment spans from this row's wedge point down to the next row's wedge mouth, so a run of done days shows an unbroken gold groove threading through their wedges. Isolated done days get no connector (just the wedge).
- Implementation: compute, for each rendered day, `linkUp = isDone && prevDayDone` and `linkDown = isDone && nextDayDone` from the already-available `weekDays` + `completedDays`. Render the connector as a thin absolutely-positioned `View` (gold, opacity 0.45) in the marker column, OR as extra `Line`s if the markers share one column SVG. A plain `View` is simpler and sufficient: `position: 'absolute'`, `width: 2`, `backgroundColor: colors.gold`, `opacity: 0.45`, positioned in the left gutter aligned to the wedge centerline; `top`/`bottom` set by `linkUp`/`linkDown`.

Additionally, brighten the wedge fill of done days that are part of an active run (link up or down) from `colors.gold` to `colors.gold2` so a live streak glows slightly warmer than a lone notch. This ties directly to the header STREAK number.

---

## 6. Optional — progress bar as a notched ruler/beam

Optional enhancement to the existing 2px progress bar (`styles.progressBar` / `progressFill`). Keep it optional; ship §2–5 first.

Turn the thin bar into a **carved measuring beam** by overlaying faint tick notches:
- Keep the bar height at 2px? No — bump to **4px** to read as a beam: `backgroundColor: colors.surface3`, `borderRadius: 1`.
- `progressFill`: `colors.gold` (instead of `colors.ui`) so progress is "carved" in gold, height 4.
- Overlay **week ticks**: short 1px vertical `colors.border2` lines every `1/52` of the bar width (one per curriculum week), drawn via a row of absolutely-positioned 1px `View`s or a single SVG `Path` of vertical ticks. Completed-portion ticks switch to `colors.bg` (notches cut *into* the gold fill); upcoming ticks stay `colors.border2`. The result reads as a ruler/belt with notches, reinforcing "notch up" without any texture.
- This is purely additive geometry over the existing bar; if it looks busy at 52 ticks, reduce to one tick per phase boundary (4–6 ticks) instead.

---

## 7. Implementation notes (where it slots in)

### 7.1 New file: `app/src/components/schedule/NotchMarker.tsx`
- Props: `{ state: 'locked' | 'open' | 'done'; isToday: boolean; isStreak: boolean; onToggle: () => void; accessibilityLabel: string }`.
- Imports: `Svg, { Path }` from `react-native-svg` (matches existing idiom in `ListenScreen.tsx` / `TutorFab.tsx`); `Animated, Easing, TouchableOpacity, AccessibilityInfo` from `react-native`; `colors, fonts` from `../../constants/theme`.
- Owns `pressScale`, `cut`, `todayPulse` Animated values (§4). Wraps the stacked empty+done wedges in `Animated.View`s.
- Renders inside a `TouchableOpacity` with `hitSlop` 11 and the accessibility props from §3.1.

### 7.2 New file: `app/src/components/schedule/TallyCount.tsx`
- Props: `{ n: number }`.
- Imports `Svg, { Path }` from `react-native-svg`; `View, Text, StyleSheet` from `react-native`; `colors, fonts` from `../../constants/theme`.
- Internal `TallyGroup` (renders 4 verticals + optional diagonal per §2.2) and the summary logic from §2.1. Pure/stateless — no animation needed (the carving animation lives on the per-day marker; the header just reflects the count).

### 7.3 Edits in `ScheduleScreen.tsx`
- Replace the header `statsRow` block (lines 242–255) with the structure in §2.4, importing and rendering `<TallyCount n={stats.completed} />`.
- In `renderWeekHeader`'s day loop (lines 161–218), replace the `checkbox` `TouchableOpacity` (lines 169–175) with `<NotchMarker state={...} isToday={isToday} isStreak={linkUp || linkDown} onToggle={() => handleToggleDay(day.id)} accessibilityLabel={...} />`. Compute `state`, `prevDayDone`, `nextDayDone` from `weekDays`/`completedDays` just above the `return`.
- Add the streak connector `View` in the marker gutter (§5) — absolutely positioned within `styles.dayRow` (which is already `flexDirection: 'row'`; give the marker its own relative column or place the connector in the existing `paddingLeft` gutter at the wedge centerline x).
- Remove now-unused styles: `checkbox`, `checkboxDone`, `checkmark`. Keep `dayRow`, `dayRowToday` etc.
- (Optional §6) update `progressBar` / `progressFill` styles and add ticks.

### 7.4 Theme tokens used (no literal hex in components)
| Use | Token |
|---|---|
| Tally verticals, open-wedge outline, done-wedge fill, streak connector | `colors.gold` `#c9a84c` |
| Tally diagonal strike, today wedge, facet highlight, live-streak wedge, `+m` token | `colors.gold2` `#e8c97a` |
| Engraving shadow lines behind cuts | `colors.bg` `#080808` |
| Locked-state wedge outline | `colors.muted2` `#3a3633` |
| Empty-state ghost tally | `colors.muted` `#5a5650` |
| Tally sub-label `已刻 N 道` | `colors.uiDim` `#8a7d6e` |
| Stat values (STREAK/PROGRESS) | `colors.ui` `#C4B49A` (unchanged) |
| Labels (`NOTCHES CARVED` etc.) | `colors.muted` via existing `statLabel` |
| Optional ruler beam track / fill / ticks | `colors.surface3` / `colors.gold` / `colors.border2` + `colors.bg` |
| Fonts | `fonts.mono` (DMMono) for tally counts & labels |

### 7.5 Performance
- Only the **expanded** week's markers mount, so animated values are few. The tally header is a handful of small SVGs (capped at ~6 groups, §2.1). No `react-native-svg` re-render storms; `useNativeDriver: true` keeps the carve animation off the JS thread.

---

## 8. Accessibility summary
- Marker tappable target = 22px visual + hitSlop 11 = **44px** (exceeds the 40px minimum; current screen used hitSlop 8).
- `accessibilityRole="button"`, `accessibilityState={{ checked }}`, Chinese `accessibilityLabel` with day + 已刻/待刻.
- Locked future markers are non-interactive and labelled as such.
- Idle "today" pulse and the cut-in animation both honor `AccessibilityInfo.isReduceMotionEnabled()` (pulse skipped, cut collapsed to an instant state swap).
- Color is never the *only* signal: locked vs open vs done differ in fill/outline/dash *shape*, not just hue, so the states remain distinguishable for low-color-vision users. Gold-on-dark (`#c9a84c` / `#e8c97a` on `#080808`) clears WCAG AA non-text contrast (≥3:1) for the marker graphics.
