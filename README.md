# AI Engineering Amsterdam — landing page

Static site, no build step.

```
index.html        page markup (semantic sections, no inline styles)
css/styles.css    all styles: base & components first, then one block per section
js/main.js        fleet interaction, tickets slider, hero video autoplay
assets/           hero video + poster, photos
```

Fonts load from Google Fonts (Archivo, Inter, JetBrains Mono).
Open `index.html` directly or serve the folder with any static server.

Placeholders still in copy: `[placeholder]` prices, `[N]` speakers count, `[handle]` social links,
tours date, speaker names.

Landing diagram variants:

- `index-sdlc.html`: animated mechanical SDLC scene.
- `index-sdlc-boat.html`: animated sailing boat SDLC scene.

Both preserve the original `index.html`. Rebuild them after editing the landing or
illustrations with `node scripts/build-landing-variants.mjs`. The builder generates
isolated SVG embed pages at `sdlc/landing.html` and `sdlc-boat/landing.html`;
`css/landing-variants.css` handles the surrounding responsive layout. Stage labels
remain interactive; focus the scene and use arrow keys to select a stage or Space
to pause. Reduced motion displays a still scene.
