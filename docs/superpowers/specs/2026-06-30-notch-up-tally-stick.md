# Notch Up — Per-Week Wooden Tally Stick

**Date:** 2026-06-30
**Status:** Build-ready design spec.
**Supersedes:** the **per-day marker** half of `2026-06-29-notch-up-schedule-final.md` (the "Tally Rail" `NotchMarker`). It does **not** touch the header — see §0.
**Scope:** Replace the per-day SVG rail marker with **one real wooden tally stick per expanded week**, into which each completed day is **carved** as a knife-stroke (real gouge imagery). Week/phase list structure, dark theme, navigation, and data flow are untouched.

Mockup: `/private/tmp/claude-501/-Users-suh-Desktop-study-anywhere-voyage-study-anywhere-voyage-daily-english/f60567bf-3e86-4963-b090-a295d02fb865/scratchpad/tallystick-mockup.png`

---

## 0. What is KEPT vs. CHANGED (read first)

**KEPT — do not redesign:**
- The header **`TallyRecord`** ("THE RECORD", gate-five 卌 strokes, NOTCHED / STREAK / PROGRESS, progress bar). The user approved the header counting marks. `app/src/components/schedule/TallyRecord.tsx` stays exactly as-is.
- The whole `SectionList` / week-row / phase-header structure of `ScheduleScreen.tsx`.

**CHANGED:**
- The **per-day marker** changes from the v2 "Tally Rail" (a thin SVG rail with a gold notch per day, repeated on every day row) to **ONE wooden stick per expanded week**, with one carved stroke per completed day. The scattered per-row rail becomes a single intentional object.

**Why this reverses the v2 "no wood" decision (important context):** the v2 spec rejected wood because every prior wood attempt was a brown **panel / texture slab / scattered chips** behind a dark+gold UI — those always read as 很醜/不協調/很硬要 (pasted-on). This spec is **not** that. It is **one** contained, lit, shadow-grounded wooden object per week — a real tally stick, the literal meaning of "notch up." Consolidating all the wood into a single deliberate stick (with tonal restraint + real lighting so it sits *on* the dark surface like an object, not a rectangle) is what makes it harmonious. The mockup proves the read. The motion-carve soul from v2 is preserved — it now strikes into real wood instead of an SVG seat.

---

## 1. Core decision & why it's harmonious

**Concept: one vertical wooden tally stick per expanded week.**

When a week expands, a single wooden stick runs vertically down the **left gutter** of that week's day list. Each day row has a fixed-height mark slot centered on the stick at that row's height, so marks line up with their days:

- **done** → a real **carved knife-stroke** struck into the stick (the gouge image, engraved with a multiply trough + lit splinter lip).
- **today / available** → an un-struck **gold-lit seat** on the bare wood, with a breathing dashed ghost-blade (ready to be struck).
- **locked / future** → a faint empty groove on the bare wood (an un-notched spot).

Accumulating carved strokes down the stick = **the week's record**, mirroring the header's accumulating 卌 strokes. One stick, one carve per day — a real tally stick.

**Four things keep it harmonious (not 硬要):**
1. **One object, not a field.** Exactly one stick per *expanded* week, in the left gutter only. No texture behind text, no chips, no full panel. Collapsed weeks show no wood at all.
2. **Tonal restraint.** The raw wood crop is dark/warm to begin with; a dark veil gradient (`rgba(8,8,8,…)` top/bottom + a right-edge shade) quiets it so it reads as one calm object beside the gold/cream UI rather than a bright slab. Brightness is lifted only enough that the carves read (see §4 bake values).
3. **It's lit like a real object.** A crisp dark contact edge (1px), a top-lit warm rim, a left specular highlight down the round face, and a drop shadow cast onto `#080808` — so it sits ON the surface, not pasted as a flat rectangle.
4. **The carve is the payoff.** Resting state is quiet; the emotional moment is the knife-strike micro-interaction (§5), same soul as v2 but now biting real wood.

---

## 2. Placement, orientation, sizing

**Orientation: vertical, left gutter, spanning the expanded week.** Justification: a per-week-header *horizontal* stick can't show per-day state and forces a second marker system; a vertical stick spanning the day list lets each notch align to its own day row, keeps the day's date+content fully readable to the right, and reads literally as one tally stick accumulating strokes top→bottom.

Layout (phone width ~360pt; values in pt unless noted):

```
expanded-week container ("daysList")  position: relative
├── ONE <TallyStick> ............ absolute, left:34, top:14, bottom:16, width:30
│                                  (spans full day-list height, z above row bg)
└── day rows (existing), each:
    ├── <DayMark> ............... absolute, left:34, width:30, top:9, height:44
    │                             (mark slot over the stick at this row's center)
    └── day text content ........ paddingLeft:80  (clears the stick gutter)
```

- Stick width **30**, sitting in a **34pt** left gutter (matches the existing `dayRow` left inset of `spacing.lg + 36 + spacing.sm` region — the stick replaces what was the per-row `mark` column, consolidated to one).
- Stick `borderRadius: 7`, `overflow:'hidden'`.
- Each day row keeps a **fixed minimum height (62)** so marks line up; existing 3-line content (Listen/Conversation/Speak) already ≈ this height, Review days (1 line) get the same min-height so the stick spacing stays even.
- **z-order:** the stick sits **above** day-row backgrounds (so the `today` row's `surface2` highlight does not visually cut the stick — it stays one continuous object). Marks sit **above** the stick. In RN: render `<TallyStick>` and the absolute `<DayMark>`s with a higher `zIndex`/`elevation` than the day-row `View`s, or render the day-row backgrounds as a separate lower layer. Simplest: give `<TallyStick>` `zIndex:5` and each `<DayMark>` `zIndex:6`; keep day text at default.

---

## 3. Components to create

All under `app/src/components/schedule/`:

| File | Export | Purpose |
|---|---|---|
| `TallyStick.tsx` | `TallyStick` | The one wooden stick for an expanded week. Renders the wood image + lighting/shadow + veil. Pure presentational, sized by props (`top/height` or just fills its absolute parent). |
| `DayMark.tsx` | `DayMark` | Per-day mark over the stick: `locked` empty groove / `today` lit seat + ghost blade / `done` carved gouge. Owns the carve animation. Replaces `NotchMarker`. |

`NotchMarker.tsx` is retired (its carve-animation logic is the seed for `DayMark`). `TallyRecord.tsx` is untouched.

Theme tokens from `../../constants/theme`. Wood is the only non-token surface, and it lives **only** inside `TallyStick`/`DayMark` (intentional, contained).

---

## 4. `TallyStick` — the wooden object

### 4.1 Wood asset (real imagery, contained)

- **New asset:** `app/assets/tally-stick.png` — a clean **vertical** wood-grain strip cropped from the rough-plank reference `img/f2518b4e-1c43-4624-9f3d-0b4442afff28.png`. Crop a straight-grain region avoiding the heavy right-side split. Produced for the mockup via:
  `sips --cropToHeightWidth 1254 400 --cropOffset 0 120 img/f2518b4e…png` → a 400×1254 vertical strip (`scratchpad/woodstrip-raw.png`). Re-export to `app/assets/tally-stick.png` (keep it ~300–400px wide × tall; it tiles/cover-fills vertically).
- Rendered as an `<ImageBackground source={require('../../../assets/tally-stick.png')} resizeMode="cover">` filling the stick frame. Because it `cover`s a tall strip, the grain runs vertically down the stick — correct.
- **No new gouge asset needed.** Carves reuse the existing `app/assets/gouge-diagonal.png` (already cropped/masked from the knife-cut reference `img/96ab…png`).

### 4.2 Wood "bake" (so carves read + stays restrained)

Applied to the wood layer:
- Lift the dark crop so the carve trough + lit lip have contrast: **brightness ≈ 1.42, contrast ≈ 1.06, saturate ≈ 1.12** (mockup values). RN `Image` has no CSS `filter`; bake this into the PNG at export time (e.g. open the strip, raise exposure/contrast/saturation to roughly these, re-save as `tally-stick.png`). The asset ships already-lit; the component does **not** filter at runtime.
- **Veil overlays** (RN, on top of the wood image, inside the clipped frame) to quiet it and add form:
  - top+bottom dark fade: an absolutely-positioned `<LinearGradient>` (already available via `expo-linear-gradient`? — if not, fake with two stacked `View`s using `rgba(8,8,8,0.42)` fading to transparent over ~14pt at top and bottom). Top fade `rgba(8,8,8,0.30)→0`, bottom `0→rgba(8,8,8,0.42)`.
  - right-edge shade: a `View` on the right ~40% with `rgba(0,0,0,0.0)→rgba(0,0,0,0.28)` to round the form. (Two-`View` gradient fake is fine; **no new dep**. If `expo-linear-gradient` is already in the project, use it.)
  - left specular: a 5pt-wide `View` at `left:2` with a faint warm highlight `rgba(255,240,210,0.16)→transparent`.

### 4.3 Lighting / shadow (sits ON the dark surface)

On the stick frame `View` (outside the clipped wood):
- contact edge: `borderWidth:1, borderColor:'rgba(0,0,0,0.55)'` (or an inset shadow View).
- top-lit rim: a 1pt top highlight line `rgba(255,236,200,0.10)`.
- drop shadow onto `#080808` (iOS `shadowColor:'#000', shadowOpacity:0.85, shadowRadius:7, shadowOffset:{w:4,h:6}`; Android `elevation:6`). This is what makes it read as a real object rather than a rectangle.

`TallyStick` is **purely presentational** — no state, no animation. It fills its absolute parent (`top:14, bottom:16`). Reduced-motion does not affect it.

---

## 5. `DayMark` — per-day state + carve

`DayMark` props: `state: 'locked' | 'today' | 'done'`, `onToggle: () => void`, `animateOnChange?: boolean`. It is absolutely positioned over the stick (§2). Mark art is centered in a 30×44 slot.

### 5.1 Resting states

**LOCKED** — faint empty groove on bare wood:
- a 16×20, `borderRadius:3` `View` with an inset dark shadow (`inset 0 1px 3px rgba(0,0,0,0.6)`) + a hairline bottom lit edge (`rgba(255,236,200,0.06)`). RN: fake the inset with a small dark overlay + a 0.5pt light line; or use two stacked Views. Not pressable beyond a gentle shake (optional, §5.4).

**TODAY / available** — gold-lit un-struck seat (ready to be carved):
- a 26×30, `borderRadius:4` recess: background `rgba(201,168,76,0.07)`; ring `borderWidth:1, borderColor:'rgba(201,168,76,0.40)'`; inner+outer gold glow (`shadowColor: colors.gold, shadowOpacity:0.2, shadowRadius:6` and an inner-glow View).
- **ghost blade:** a dashed diagonal line across the seat at **-46°**, `colors.gold2 #e8c97a`, width ~22, dash `2 on / 3 off`, that **breathes** (opacity 0.4↔0.75) — the cut hovering, inviting the strike. Build the dash as a tiny `react-native-svg <Line strokeDasharray="2 3">` rotated, or a `repeating-linear-gradient`-style row of Views; svg is cleaner. Breathe with `Animated` opacity loop (native driver), as in current `NotchMarker` `pulse`.

**DONE** — real carved gouge struck into the stick:
- the `gouge-diagonal.png` rendered as a **3-layer stack**, all the same image, 30×~28, centered, `background-size` ≈128% (slight zoom so the cut fills the slot):
  1. `trough` — the gouge image at reduced brightness/contrast, **`mix-blend-mode` not available in RN**, so instead tint via a dark `Image` with `tintColor` is wrong (kills detail). **RN approach:** layer the gouge image at low opacity over a hand-darkened **`done-gouge.png`** baked dark, OR (preferred, no new asset) render the gouge image once with `opacity:0.96` *plus* a darkening overlay `View` clipped to roughly the gouge shape. The mockup achieves depth via `multiply`+`screen` which RN lacks; the buildable equivalent is **two baked variants** of the gouge OR a single gouge image with a dark drop-shadow offset behind it and a light copy offset above:
     - **trough copy:** gouge image, darkened (bake a `gouge-diagonal-dark.png`, ~brightness 0.3), `opacity:1`.
     - **lip copy:** gouge image, lightened (bake `gouge-diagonal-lip.png`, ~brightness 2.0, desaturated), `opacity:0.28`, offset `translate(-0.6, -0.8)` so the lit splinter edge sits on the upper lip.
   If baking two variants is undesirable, ship a single pre-composited **`carve-done.png`** (the engraved stroke baked exactly as in the mockup) and animate that one image in — simplest and fewest moving parts. **Recommendation: ship one pre-composited `carve-done.png`** (trough+core+lip already baked) and skip runtime layering; the carve animation then just reveals that one image.

### 5.2 The carve animation (the hero, ~420ms)

Reuse the v2 carve choreography from `NotchMarker` (it already exists and is good), now revealing the real `carve-done.png` into the wood. Five `Animated.Value`s, **all native driver (transform + opacity only)**:

| driver | role | timing |
|---|---|---|
| `slash` 0→1 | bright blade light streak sweeps across the seat + exits | `260ms`, `Easing.out(quad)` |
| `cut` 0→1 | the carved image drives in **mouth→point** (scale from its lower-left origin) + opacity 0→1 | start `+70ms`, `300ms`, `Easing.out(cubic)` |
| `kick` 0→1→0 | recoil "thunk": mark presses in (`translateX -1.8`, `scale 0.94`) then springs back | start `+60ms`, in `90ms` `out(quad)`, out `170ms` `out(back(1.4))` |
| `chips` 0→1 | 1–2 debris shards flick from the cut point, gravity-drooped arc, fade by ~300ms | start `+90ms`, `300ms`, `out(quad)` |
| `settle` 0→1 | final brighten/lock of the gouge to its resting value | start `+260ms`, `160ms`, `inOut(quad)` |

- **Reveal geometry:** `cut` scales the `carve-done.png` from its **mouth (lower-left)** origin to full — exactly the current `NotchMarker` `gougeScale`/transform-origin trick (translate to mouth, scale, translate back) — so the cut visibly drives in like a blade biting. `gougeScale = cut[0→1: 0.0001→0.96] + settle[0→0.04]`; `gougeOpacity = cut[0,0.35,1 → 0,0.7,1]`.
- **slash / chips** stay **procedural** `react-native-svg` `<Line>` in `colors.gold2` (a bright blade streak steeper/longer than the gouge, plus 2 short chip lines), layered above the gouge image — copy verbatim from current `NotchMarker` §SLASH/CHIPS.
- On complete: reset `slash`/`chips` to 0; `cut`+`settle` hold at 1 (engraved). Same `start(() => …)` cleanup as today.

### 5.3 Un-carve (toggle off)

Quiet, no flourish: `cut`→0 and `settle`→0 over `200ms` `Easing.in(cubic)` — the gouge retracts mouth←point and the bare wood returns. (Current `NotchMarker.uncarve`, reused.)

### 5.4 Reduced motion + a11y

- `AccessibilityInfo.isReduceMotionEnabled()` + `reduceMotionChanged` listener (already in `NotchMarker`). When reduced: **no** slash/chips/kick; `cut`/`settle` snap to 1 (done) or 0 (locked/today) **instantly**.
- Already-done on mount (`prev===null && !animateOnChange`) → snap engraved, no animation.
- `Pressable` with `hitSlop {8,8,8,8}`, `accessibilityRole:'button'`, `accessibilityState:{checked: state==='done'}`, label like `"Day complete — carved"` / `"Mark today complete"` / `"Locked"`.
- Touch target ≥44pt (the slot is 44 tall; widen Pressable hitSlop to meet 44 wide).

---

## 6. Slot-in: exact `ScheduleScreen.tsx` edits

In `renderWeekHeader`, the `isExpanded` block currently is:

```tsx
<View style={styles.daysList}>
  {weekDays.map((day) => { … <View style={styles.mark}><NotchMarker …/></View> … })}
</View>
```

Change to (one stick for the week + per-day absolute marks):

```tsx
<View style={styles.daysList}>            {/* position:'relative' */}
  <TallyStick />                           {/* absolute, left:34, top:14, bottom:16, width:30, zIndex:5 */}
  {weekDays.map((day) => {
    const isDone = !!completedDays[day.id]
    const isToday = day.calendarDate === today
    const markState = isDone ? 'done' : isToday ? 'today' : 'locked'
    return (
      <View key={day.id} style={[styles.dayRow, isToday && styles.dayRowToday]}>
        <DayMark                            {/* absolute, left:34, width:30, top:9, height:44, zIndex:6 */}
          state={markState}
          onToggle={() => handleToggleDay(day.id)}
        />
        <View style={styles.dayInfo}>{/* unchanged date + content rows */}</View>
      </View>
    )
  })}
</View>
```

Style changes in `ScheduleScreen.tsx` `StyleSheet`:
- `daysList`: add `position: 'relative'` (keep existing bg/border).
- `dayRow`: keep `paddingLeft` clearing the gutter (already `spacing.lg + 36 + spacing.sm` ≈ 68; bump to **80** so 3-line content clears the 30pt stick at `left:34` comfortably); add `minHeight: 62`.
- Remove the old `mark` column style usage (the stick + absolute `DayMark` replace it). `DayMark` positions itself absolutely; `dayInfo` keeps `flex:1`.
- `dayRowToday` background stays, but the stick's higher `zIndex` keeps it continuous across the today row.

No change to data, navigation, `handleToggleDay`, or the header/`TallyRecord`.

---

## 7. Assets summary

| Asset | Source | How produced | New? |
|---|---|---|---|
| `app/assets/tally-stick.png` | `img/f2518b4e…png` (plank) | vertical straight-grain crop, baked brighter (≈+exposure/contrast/sat per §4.2) | **new** |
| `app/assets/carve-done.png` | `app/assets/gouge-diagonal.png` (from `img/96ab…png`) | pre-composite trough+core+lit-lip as in mockup (recommended), OR reuse `gouge-diagonal.png` + 2 baked variants | **new (recommended)** |
| `app/assets/gouge-diagonal.png` | existing | reused as fallback / slash reference | existing |

No new npm deps. Stack used: `react-native` `Image`/`ImageBackground` + `Animated` (native driver, transform+opacity only) + `react-native-svg` `<Line>` for slash/chips/ghost-blade. **No SVG filters, no `mix-blend-mode`** (RN lacks both — depth is baked into the PNGs, not computed at runtime).

---

## 8. Acceptance

- Expanding a week shows exactly **one** wooden stick in the left gutter, lit + shadowed so it sits on `#080808` as an object (not a flat rectangle), spanning the day list as one continuous piece (the today-row highlight does not cut it).
- Completed days show a real carved knife-stroke (dark trough + lit splinter lip) at their row; today shows a gold-lit seat + breathing ghost blade; future days show a faint empty groove.
- Tapping today carves its stroke with the ~420ms blade-strike + recoil + chips; tapping a done day un-carves quietly. Reduced-motion → instant snap.
- Day date + Listen/Conversation/Speak rows remain fully readable to the right of the stick.
- Collapsed weeks show **no** wood. The header `TallyRecord` is unchanged.
- Verify against mockup: `scratchpad/tallystick-mockup.png`.
