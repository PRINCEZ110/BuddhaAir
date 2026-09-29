# Buddha Air — Cinematic 3D Digital Experience

A premium airline web experience built around a single continuous cinematic
journey through Nepal: **airport → aircraft → takeoff → clouds → Himalaya →
Nepal → destinations → fleet → mountain flight → booking**.

Scroll is the timeline. One normalised value (`0 → 1`) drives the camera, the
aircraft, the lighting and the sky, so every scroll gesture is reversible and
lands on the same frame.

> **Concept project.** Not affiliated with Buddha Air. Content is drawn from
> publicly available information on the official site; figures are labelled as
> historical reference, and sample flight data is marked as demo data.

---

## Stack

| Concern | Choice |
| --- | --- |
| Framework | React 18 + Vite 5 |
| 3D | Three.js via React Three Fiber + Drei |
| Scroll / timeline | GSAP + ScrollTrigger |
| UI | HTML / CSS (no 3D for interface) |
| Assets | Procedural — generated at runtime, zero binary models |

There is no `.glb` in this project. The aircraft, runway, terrain, clouds and
sky are all generated procedurally, which keeps the payload small and every
material fully art-directable.

---

## Commands

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production bundle -> dist/
npm run preview    # serve the production build
```

### Verification scripts

These drive headless Chrome (puppeteer-core) against the dev server.

```bash
npm run verify:responsive    # 360 / 390 / 430 / 768 / 1024 / 1280 / 1920
                             # + reduced-motion. Fails on horizontal overflow
                             # or any console error.
npm run verify:interactions  # booking modal, form labelling, flight status,
                             # keyboard operability, mobile menu
npm run verify:scroll        # screenshots every beat of the cinematic sequence
npm run verify:layout        # prints real section offsets vs scroll progress
```

`verify:layout` is the one to re-run if sections are added or resized — the
3D keyframes are mapped to those numbers.

---

## Architecture

```
src/
  App.jsx                     orchestration, single scroll trigger, canvas gate
  three/
    Experience.jsx             scene composition + per-beat visibility
    CameraController.jsx      keyframe camera/lighting/sky/fog interpolation
    Aircraft.jsx              procedural ATR-style turboprop + canvas livery
    Runway.jsx                runway, markings, edge lights, gantries
    Mountains.jsx             three LOD ridged-noise ranges, vertex-coloured
    NepalTerrain.jsx          stylised terrain, destination nodes, routes
    Clouds.jsx                fbm shader planes (layer climb / cloud sea)
    SkyDome.jsx               gradient sky driven by the same timeline
  components/
    navigation/  booking/  destinations/  flight-status/
    royal-club/  assistance/  holidays/  stories/  footer/  loader/
  data/                       destinations, fleet, navigation
  hooks/                      useScrollProgress, useReducedMotion,
                              useResponsive3D, useReveal
  utils/                      noise, performance (WebGL detect, DPR cap)
```

### DOM vs WebGL

The 3D canvas is a fixed `z-index: 0` backdrop. Every piece of interface —
navigation, booking, cards, forms, footer — is real HTML. Nothing important
lives inside the canvas, and the whole site stays usable with WebGL disabled
(the 2D gradient fallback renders instead).

Content sections use translucent gradient scrims rather than solid fills, so
the 3D world reads continuously behind the content instead of being cut to
hard black rectangles at each section boundary.

---

## The cinematic timeline

Scroll progress is owned by one GSAP tween on a shared ref, with `scrub` for
smoothing. `CameraController` samples keyframes with smoothstep easing in
`useFrame`; nothing else subscribes to scroll.

| Progress | Beat |
| --- | --- |
| 0.00 – 0.05 | Airport, low at runway level, sunrise |
| 0.05 – 0.20 | Roll and takeoff, camera rising as ground falls away |
| 0.23 – 0.29 | Above the cloud layer, Himalaya reveal |
| 0.36 | Descend to the Nepal map, destination nodes live |
| 0.44 – 0.50 | Aircraft showcase, slow orbit |
| 0.56 | Mountain flight, cabin-window perspective |
| 0.62 – 1.00 | Dark premium environment, CTA, footer |

Lighting, fog, sky gradient and aircraft pose are sampled from the same value,
so they always agree with the camera.

---

## Performance

- **Code splitting** — the 3D world is a separate chunk, fetched only after the
  loading screen. First paint is not blocked by WebGL.
- **Quality tiers** — `useResponsive3D` returns `low | medium | high`, driving
  DPR cap, shadow maps, terrain segments, cloud count and aircraft detail.
- **Beat-scoped scenes** — runway, terrain, showcase aircraft and both cloud
  systems mount only while the camera is near them.
- **No per-scroll listeners** — one trigger, one ref, one interpolation.
- Budget: ~300 kB gzipped total (three 176, r3f 88, gsap 28, app 32, css 7).

---

## Accessibility

- Every control is a real `<button>` / `<label>`ed form control.
- Visible focus rings, keyboard-reachable cards and dialogs, `Esc` closes the
  booking modal.
- `prefers-reduced-motion` freezes the camera, disables transitions, parallax
  and the membership-card shine, and forces reveals visible.
- Flight status and all figures are explicitly labelled as demo/reference data.

---

## Verified

- Production build clean; no runtime or console errors.
- No horizontal overflow at 360 / 390 / 430 / 768 / 1024 / 1280 / 1920.
- Reduced-motion path renders the hero correctly.
- Booking modal (open / Escape / nav CTA), all 10 form fields labelled, flight
  status found + not-found states, destination cards keyboard-operable, mobile
  hamburger open/close.

Screenshots from the last run are in `.screenshots/`.
