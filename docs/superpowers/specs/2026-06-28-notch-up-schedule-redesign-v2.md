# Notch Up — Schedule Screen Redesign Spec (v2)

**Date:** 2026-06-28
**Supersedes:** `2026-06-28-notch-up-schedule-redesign.md` (v1)
**Target file:** `app/src/screens/tabs/ScheduleScreen.tsx`
**New components:** `app/src/components/schedule/TallyCount.tsx`, `app/src/components/schedule/NotchMarker.tsx`
**Dependencies:** TypeScript + `react-native-svg` (15.15.3, already installed) + react-native `Animated`. **No new dependencies. No SVG filters, no images, no textures.**
**Status:** Design only — do not implement yet.

**Approved mockup:** `…/scratchpad/notch-v2-mockup.png` — the spec below matches that render exactly.

---

## 0. Why v2 (what changed from v1, and why)

v1's *intent* was right (gold tally header, carved per-day wedge, streak groove, notch-ruler progress) but the first build leaned on a **literal wood texture** (brown wood-grain beam + brown wood marker chips) which clashed badly with the app's refined dark + gold/cream minimalism — rejected as "很醜、不和諧". v2 keeps every good idea from v1 but expresses "carved notch / accumulating tally" **entirely in the app's own gold-on-dark visual language**:

- **No brown, no wood, no image textures, no SVG filters.** "Engraving" is faked only with a thin dark **shadow line** behind each gold cut + a thin bright **highlight line** on the lit facet — the same trick `TutorFab.tsx` already uses for refined gold detailing.
- The per-day marker is upgraded from a thin floating wedge to a **carved-notch tablet** (a small rounded engraving surface with a V-notch cut into it) so the tap target is clearly present, tactile, and obviously "tap to carve a notch" — not a strikethrough afterthought.
- The header shows **real five-bar tally marks** in gold (four verticals + a diagonal strike), with large-N summarization, so accumulation reads as a carved running count.

Everything below uses **theme tokens only** (no literal hex inside components).

---

## 1. Theme tokens used (single source of truth)

| Role | Token | Hex |
|---|---|---|
| Tally verticals, done-notch fill, tablet edge, streak groove, ruler fill | `colors.gold` | `#c9a84c` |
| Tally diagonal strike, today notch outline, facet highlight, `+m` token, ruler fill top | `colors.gold2` | `#e8c97a` |
| Engraving shadow lines behind every cut | `colors.bg` | `#080808` |
| Locked tablet + locked notch outline | `colors.muted2` | `#3a3633` |
| Tally sub-label `已刻 N 道`, `NOTCHES CARVED` label | `colors.uiDim` / `colors.muted` | `#8a7d6e` / `#5a5650` |
| Stat values (STREAK / PROGRESS) | `colors.ui` | `#C4B49A` |
| Ruler track | `colors.surface3` | `#202020` |
| Ruler ticks | `colors.border2` | `#333333` |
| Plate background fill | `colors.surface2` / near-`#141414` | use `colors.surface2` (#181818) or a `#141414` literal in StyleSheet — acceptable as a plate bg only |
| Fonts | `fonts.mono` (DMMono) for all counts/labels | — |

Marker/tally **tablet fills** (`#16130c` done, `#141414` today, `#101010` locked) are dark plate backings, not brand colors; define them as local consts in `NotchMarker.tsx` (e.g. `const TABLET_DONE = '#16130c'`) so the component stays self-documenting. They read as "the dark surface being carved," all within the bg family.

---

## 2. Header tally component (`TallyCount`)

Replaces the left-most stat (`COMPLETED {n}`). STREAK and PROGRESS stay. The header's three-cell `space-around` row becomes a bordered **"plate"**: a left tally block + a right two-stat cluster (see §2.4 + §5).

### 2.1 What it shows
- Mono label `NOTCHES CARVED` (`colors.uiDim`, `letterSpacing ~2.4`, `fontSize 9`).
- A row of **five-bar gate** tally marks for `n = stats.completed`: each complete group = **four verticals + one diagonal strike**; a trailing partial group of 1–4 verticals (no diagonal) for `n % 5`.
- Sub-label `已刻 {n} 道` (`colors.muted`, mono, `fontSize 9`).

### 2.2 Large-N summarization (from v1, kept)
`n` can reach 365; never draw 73 groups. Rules:
```
const fullGroups = Math.floor(n / 5)
const remainder  = n % 5
const MAX_LITERAL_GROUPS = 4   // groups drawn before summarizing
const TAIL_GROUPS = 2          // complete groups kept literal when summarizing
```
- If `fullGroups <= MAX_LITERAL_GROUPS`: render every complete group + the partial group literally.
- Else: render a compact `＋{m}` token (`m = (fullGroups - TAIL_GROUPS) * 5`) in `colors.gold2` mono, then the **last `TAIL_GROUPS` complete groups + the partial group** literally — the "live edge" of the carving. (Mockup shows `n=23` → `＋10` + two full groups + a partial-3.)
- Empty state `n === 0`: render one **ghost** partial group (4 verticals, no diagonal) at `opacity 0.25` in `colors.muted`, plus `已刻 0 道`.

### 2.3 Group geometry — one `<Svg>` per group
Per-group **viewBox `0 0 26 24`**, rendered **22 × 20**. Stroke width `2`, `strokeLinecap="round"`.
Each vertical = two lines: a **shadow** first (offset `+1,+1`, `colors.bg`, `opacity 0.65`) then the **gold** line on top (`colors.gold`) → inset/carved look.

Verticals at x = 4, 9, 14, 19, from `y=3` to `y=21`:
```
shadow:  <Line x1={x+1} y1={4} x2={x+1} y2={22} stroke={colors.bg}   strokeWidth={2} strokeLinecap="round" opacity={0.65} />
gold:    <Line x1={x}   y1={3} x2={x}   y2={21} stroke={colors.gold} strokeWidth={2} strokeLinecap="round" />
```
Diagonal strike (complete groups only), brighter, with its own shadow:
```
shadow:  <Line x1={3} y1={21} x2={23} y2={5} stroke={colors.bg}    strokeWidth={2} strokeLinecap="round" opacity={0.65} />
gold2:   <Line x1={2} y1={20} x2={22} y2={4} stroke={colors.gold2} strokeWidth={2} strokeLinecap="round" />
```
(May be collapsed into two `Path`s — verticals `"M4 3V21 M9 3V21 M14 3V21 M19 3V21"` + strike `"M2 20 L22 4"` — but `Line` matches the mockup and is clearest. The strike is `gold2` so the completing cut reads slightly hotter.)

### 2.4 Tally row layout
- `flexDirection: 'row'`, `alignItems: 'center'`, `gap: 9`, fixed `height: 22`.
- `＋{m}` token: `fontFamily: fonts.mono`, `fontSize: 11`, `color: colors.gold2`, `letterSpacing: 0.5`, `marginRight: 2`.
- `TallyCount` is **pure/stateless** — it only reflects `n`. (The carving *animation* lives on the per-day marker, §4; tapping a day re-renders the header tally with one more mark, which is enough.)

---

## 3. Per-day carved-notch marker (`NotchMarker`)

Replaces the `checkbox` / `checkboxDone` / `checkmark` block in each day row (`ScheduleScreen.tsx` lines 169–175). Same column position (left of `dayInfo`).

### 3.1 Anatomy
A **carved-notch tablet**: a rounded-square engraving surface (the dark wood/stone-neutral plate, but in the bg family) with a downward **V-notch** cut into its upper face. The tablet makes the tap target obvious and substantial; the notch is the focal "cut." Reads as "a surface you carve a notch into."

- **SVG size:** `28 × 28`, `viewBox="0 0 28 28"`, rendered 28×28.
- **Tablet:** `<Rect x=4 y=4 width=20 height=20 rx=6 …>` (a 20px rounded square, r=6).
- **V-notch path (shared by all states):** mouth `(9,10)→(19,10)` (10px wide), point `(14,19)`:
  ```
  const NOTCH = "M9 10 L19 10 L14 19 Z"
  ```
- **Hit target:** wrap in `TouchableOpacity` with `hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}` → 28 + 16 = **44px** tappable (meets accessibility minimum).

### 3.2 The three states (all share the same tablet + notch geometry)

**A — Locked** (`day.calendarDate > today`): faint, un-started.
```
Rect:  fill={TABLET_LOCKED #101010}  stroke={colors.muted2}  strokeWidth={1.2}
Notch: fill="none"  stroke={colors.muted2}  strokeWidth={1.2}  strokeLinejoin="round"  opacity={0.9}
```
Non-interactive (`disabled`), reads as a closed/empty slot.

**B — Today / available** (`calendarDate <= today && !isDone`): an open notch inviting the cut.
```
Rect:  fill={TABLET_TODAY #141414}  stroke={colors.gold}   strokeWidth={1.3}  strokeOpacity={0.55}
Notch fill:  fill={colors.gold} fillOpacity={0.10}              // faint recessed slot
Notch line:  fill="none" stroke={colors.gold2} strokeWidth={1.6} strokeDasharray="2.2 2.3" strokeLinejoin="round"
```
For **today specifically**, add a soft gold emphasis (mockup uses a subtle outer glow; in RN do it with a low-opacity `colors.gold` `shadowColor`/`elevation` on the wrapper, OR the idle pulse in §4.3 — both are fine, prefer the pulse since it's motion not a blur filter).

**C — Done** (`isDone`): the notch carved/struck in gold.
```
Rect:  fill={TABLET_DONE #16130c}  stroke={colors.gold}  strokeWidth={1.3}  strokeOpacity={0.7}
Shadow copy: <Path d={NOTCH} fill={colors.bg} opacity={0.7} transform="translate(0.9,0.9)" />   // carved depth, behind
Gold fill:   <Path d={NOTCH} fill={colors.gold} />
Facet hi:    <Path d="M9 10 L14 19" stroke={colors.gold2} strokeWidth={1.1} opacity={0.65} strokeLinecap="round" />  // lit left bevel
```

State resolution:
```
const state: 'locked' | 'today' | 'done' =
  isDone ? 'done' : (day.calendarDate > today ? 'locked' : 'today')
```
(`'today'` here = "available to carve"; rename to `'open'` if a non-today available day should look identical — they do in this design, with the glow/pulse gated to the literal `isToday` day.)

### 3.3 Accessibility
- `accessibilityRole="button"`, `accessibilityState={{ checked: isDone, disabled: state==='locked' }}`.
- `accessibilityLabel`: e.g. `"06/28 週六，已刻一道"` (done) / `"06/28 週六，待刻一道"` (open) / `"06/29 週日，尚未解鎖"` (locked).
- States differ by **shape/fill/dash**, not hue alone (locked = empty muted outline, today = dashed gold open, done = solid gold) → distinguishable for low-color-vision users. Gold/cream on `#080808` clears WCAG AA non-text contrast (≥3:1).

---

## 4. Carving micro-interaction (react-native `Animated` only)

No reanimated, no filters. The marker owns two `Animated.Value`s (+ one optional pulse). `useNativeDriver: true` everywhere (animates transform/opacity only — never `fill`).

### 4.1 Values
```
const pressScale = useRef(new Animated.Value(1)).current               // 1 → 0.86 → 1
const cut        = useRef(new Animated.Value(isDone ? 1 : 0)).current   // 0 empty ↔ 1 carved
const todayPulse = useRef(new Animated.Value(0)).current                // optional, today only
```
Wrap the whole `<Svg>` in an `Animated.View` with `transform: [{ scale: pressScale }]`.

### 4.2 Tap = carve
`onPressIn` — the knife meets the surface:
```
Animated.timing(pressScale, { toValue: 0.86, duration: 80, easing: Easing.out(Easing.quad), useNativeDriver: true }).start()
```
`onPress` — commit the toggle (`toggleDay(day.id)`), then cut-in + spring-back together:
```
Animated.parallel([
  Animated.spring(pressScale, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true }),
  Animated.timing(cut, {
    toValue: isDone ? 0 : 1,                 // toggle on → 1 ; toggle off → 0
    duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true,
  }),
]).start()
```
Felt duration ≈ 80ms press + ~200ms cut ≈ a crisp "press and the notch bites in."

**Driving the visual with `cut` (since `fill` can't be native-animated):** stack the **open-notch group (state B)** and the **done-notch group (state C)** in the same SVG box, each in its own `Animated.View`:
- Done group: `opacity: cut`, and `transform: [{ scaleY: cut.interpolate({ inputRange:[0,1], outputRange:[0.45,1] }) }]` anchored at the notch **mouth** (top) so the gold appears to **drive downward from mouth to point** — the cut deepening. (If top-anchoring is fiddly with react-native-svg, fall back to centered `scale` 0.6→1; still reads as "cut appearing.")
- Open group: `opacity: cut.interpolate({ inputRange:[0,1], outputRange:[1,0] })` (fades out as the cut fills).
The tablet `<Rect>` stays static beneath both. Toggle-off plays in reverse — the notch lifts back out.

### 4.3 "Today" idle pulse (recommended, not required)
Today's available marker breathes to invite the cut:
```
Animated.loop(Animated.sequence([
  Animated.timing(todayPulse, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
  Animated.timing(todayPulse, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
]))
```
Drive the dashed-notch `Animated.View` opacity between `0.6` and `1.0`. Stop the loop once the day becomes done.

### 4.4 Reduced motion
Gate the pulse and the cut-in behind `AccessibilityInfo.isReduceMotionEnabled()`: skip the pulse, and collapse the cut animation to an instant state swap (`cut.setValue(target)`).

---

## 5. Header plate + coexistence with STREAK / PROGRESS

Wrap the tally block + stat cluster in a bordered **plate** (mockup) so the carved record reads as a discrete "tally card":
```
<View style={styles.plate}>                      // row, space-between, align center
  <View style={styles.tallyBlock}>               // column, gap 8
    <Text style={styles.plateLabel}>NOTCHES CARVED</Text>
    <TallyCount n={stats.completed} />
    <Text style={styles.tallySub}>已刻 {stats.completed} 道</Text>
  </View>
  <View style={styles.statCluster}>              // row, gap 22, align flex-end
    <View style={styles.statItem}><Text style={styles.statValue}>{stats.streak}</Text><Text style={styles.statLabel}>STREAK</Text></View>
    <View style={styles.statItem}><Text style={styles.statValue}>{stats.pct}%</Text><Text style={styles.statLabel}>PROGRESS</Text></View>
  </View>
</View>
```
New styles (keep existing `statItem`/`statValue`/`statLabel`):
```
plate:      { flexDirection:'row', alignItems:'center', justifyContent:'space-between',
              paddingVertical:12, paddingHorizontal:16, borderRadius:radius.lg,
              backgroundColor:'#141414', borderWidth:1, borderColor:colors.border2 },
tallyBlock: { gap:8 },
plateLabel: { fontFamily:fonts.mono, fontSize:9, letterSpacing:2.4, color:colors.uiDim },
tallySub:   { fontFamily:fonts.mono, fontSize:9, letterSpacing:0.5, color:colors.muted },
statCluster:{ flexDirection:'row', gap:22, alignItems:'flex-end' },
```
The tally is the only gold in the header → the carved record is the clear focal point; STREAK/PROGRESS stay `colors.ui`.

---

## 6. Progress bar → notch-ruler (kept from v1, refined)
Turn the existing 2px bar into a **carved measuring ruler**:
- Track: `height 5`, `backgroundColor: colors.surface3`, `borderRadius 2`, inner top shadow (`inset 0 1px 1px rgba(0,0,0,0.6)` → in RN approximate with a 1px dark top inset View or just the surface3 fill).
- Fill: gold gradient top→bottom `colors.gold2 → colors.gold`, `borderRadius 2`, width `${pct}%`.
- **Ticks:** a thin `colors.border2` divider at each phase boundary. Simplest: an absolutely-filled row of `flex:1` segments with `borderRightWidth:1, borderRightColor: colors.border2` (last has none) — mockup uses 6 segments (one per phase). Reads as a notched ruler/belt without any texture.
RESET stays to the right (`colors.muted2`).

---

## 7. Streak treatment — continuous carved run

Consecutive `done` days within an expanded week read as **one connected groove** threading their notch points, not separate marks.

- For each rendered day compute `linkUp = isDone && prevDayDone`, `linkDown = isDone && nextDayDone` from `weekDays` + `completedDays`.
- Draw a **2px vertical groove** in the marker column centered on the notch (tablet center x). It spans from this day's notch **point** down to the next day's notch **mouth** when `linkDown` (mockup spans the run as a single segment). Simplest impl: one absolutely-positioned `View` per run, OR per-row top/bottom segments:
  ```
  groove: { position:'absolute', width:2, backgroundColor:colors.gold, opacity:0.5, borderRadius:1 }
  // + a 1px colors.bg shadow line beside it (x+1) for the inset look (pseudo or sibling View)
  ```
  Center x = marker left + tablet center. In the day row, the marker sits in the left gutter (`paddingLeft` ≈ 66, marker left ≈ 22, tablet center ≈ 22 + 14 = 36 → groove at x ≈ 35).
- Optional warmth: brighten done-notch fill from `colors.gold` to `colors.gold2` when the day is part of a live run (`linkUp || linkDown`), tying the groove to the header STREAK number.

---

## 8. Where it slots into `ScheduleScreen.tsx`

### 8.1 New file `app/src/components/schedule/NotchMarker.tsx`
- Props: `{ state:'locked'|'today'|'done'; isToday:boolean; isStreak:boolean; onToggle:()=>void; accessibilityLabel:string }`.
- Imports: `Svg, { Rect, Path }` from `react-native-svg`; `Animated, Easing, TouchableOpacity, AccessibilityInfo` from `react-native`; `colors` from `../../constants/theme`.
- Owns `pressScale`, `cut`, `todayPulse`. Tablet `<Rect>` static; stacked open+done notch groups in `Animated.View`s (§4). `TouchableOpacity` with `hitSlop 8` + a11y props (§3.3).

### 8.2 New file `app/src/components/schedule/TallyCount.tsx`
- Props: `{ n:number }`. Imports `Svg, { Line }`; `View, Text, StyleSheet`; `colors, fonts`. Internal `TallyGroup` (§2.3) + summarization (§2.2). Pure.

### 8.3 Edits in `ScheduleScreen.tsx`
- Replace the `statsRow` header block (lines 242–255) with the **plate** (§5), rendering `<TallyCount n={stats.completed} />`.
- In `renderWeekHeader`'s day loop (lines 161–218): just above each day's `return`, compute
  ```
  const state = completedDays[day.id] ? 'done' : (day.calendarDate > today ? 'locked' : 'today')
  const prevDayDone = idx>0 && !!completedDays[weekDays[idx-1].id]
  const nextDayDone = idx<weekDays.length-1 && !!completedDays[weekDays[idx+1].id]
  ```
  (add `idx` from `weekDays.map((day, idx) => …)`), then replace the `checkbox` `TouchableOpacity` (lines 169–175) with
  ```
  <NotchMarker state={state} isToday={day.calendarDate === today}
    isStreak={(state==='done') && (prevDayDone || nextDayDone)}
    onToggle={() => handleToggleDay(day.id)} accessibilityLabel={…} />
  ```
- Add the streak groove `View` in the marker gutter (§7).
- Update `progressBar`/`progressFill` styles + add the tick segments (§6).
- Remove now-unused styles: `checkbox`, `checkboxDone`, `checkmark`. Keep `dayRow`, `dayRowToday`, `dayInfo`, etc.

### 8.4 Performance
Only the **expanded** week's markers mount → few animated values. Header tally is ≤ ~4 small SVGs (capped, §2.2). `useNativeDriver: true` keeps carve animations off the JS thread.

---

## 9. Acceptance checklist
- [ ] Header shows real five-bar gold tally marks + `＋m` summary for large `n`, with `已刻 N 道`; 0-state shows a ghost group.
- [ ] Per-day marker is a clearly tappable carved-notch tablet with three distinct states (locked / today-open / done) in gold-on-dark; done is crisp and satisfying with highlight+shadow engraving (no texture).
- [ ] Tapping plays the press + cut-in Animated sequence; reduced-motion collapses it.
- [ ] Consecutive done days thread a single gold streak groove.
- [ ] Progress bar reads as a gold notch-ruler with phase ticks; STREAK/PROGRESS unchanged.
- [ ] Zero brown / wood / image textures / SVG filters; all colors are theme tokens; visually harmonious with the existing dark + gold/cream app (matches `notch-v2-mockup.png`).
