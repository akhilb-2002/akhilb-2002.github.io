(() => {
  "use strict";

  const LAND_COARSE_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-110m.json";
  const LAND_FINE_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-50m.json";
  const LAT_TOP = 80;      // crop the Mercator map to these latitudes
  const LAT_BOTTOM = -58;  // (drops Antarctica and the far north)
  // Tiles across the map at zoom 1. Every time the zoom doubles, each tile
  // splits into 4, so regions get smaller and photo tiles more precise.
  const COLUMNS = { desktop: 150, tablet: 110, mobile: 72 };
  const TILE = 0.75;       // tile size as a fraction of grid spacing (rest is the gap)
  const MAX_ZOOM = 128;
  const FINE_FROM_LEVEL = 2; // use detailed coastlines from 4x zoom
  const SUPERSAMPLE = 3;   // samples per tile side when deciding land vs. sea
  const LAND_COLOR = "#cbbfa9";

  const wrap = document.getElementById("mapWrap");
  const mapView = document.getElementById("mapView");
  const canvas = document.getElementById("map");
  const ctx = canvas.getContext("2d");
  const spotsEl = document.getElementById("spots");
  const zoomResetBtn = document.getElementById("zoomReset");

  const win = document.getElementById("win");
  const winImg = document.getElementById("winImg");
  const winName = document.getElementById("winName");
  const winMeta = document.getElementById("winMeta");
  const winNav = document.getElementById("winNav");
  const winCount = document.getElementById("winCount");
  const winMaps = document.getElementById("winMaps");

  // Flatten TRIPS (from data.js) into one list of photos.
  const photos = [];
  for (const [code, trip] of Object.entries(TRIPS)) {
    for (const p of trip.photos) photos.push({ ...p, code, country: trip.name });
  }

  const land = { coarse: null, fine: null };
  let base = null;      // layout at zoom 1: world size W x H, screen VW x VH, ...
  let level = -1;       // current detail level (tile size = S0 / 2^level)
  let cache = null;     // land mask for the area around the current view
  let spots = [];
  let label = null;
  let transform = d3.zoomIdentity;
  const view = { items: [], idx: 0, spot: null };
  const off = document.createElement("canvas");
  const offCtx = off.getContext("2d", { willReadFrequently: true });

  // ---------- Layout ----------

  // Height / width of the cropped Mercator world.
  const unit = d3.geoMercator().scale(1 / (2 * Math.PI)).translate([0, 0]);
  const WORLD_ASPECT = unit([0, LAT_BOTTOM])[1] - unit([0, LAT_TOP])[1];

  // Lay the world out to fit the screen ("contain"). Zoom 1 shows the whole world.
  function build() {
    const VW = mapView.clientWidth;
    const VH = mapView.clientHeight;
    if (!VW || !VH || !land.coarse) return;

    // keep the same view across resizes (rotation, window resize, etc.)
    const prev = base && {
      k: transform.k,
      cx: (base.VW / 2 - transform.x) / (transform.k * base.W),
      cy: (base.VH / 2 - transform.y) / (transform.k * base.H),
    };

    const W = Math.min(VW, VH / WORLD_ASPECT);
    const cols0 = W > 900 ? COLUMNS.desktop : W > 600 ? COLUMNS.tablet : COLUMNS.mobile;
    const S0 = W / cols0;
    const proj = d3.geoMercator().scale(W / (2 * Math.PI)).translate([W / 2, 0]);
    proj.translate([W / 2, -proj([0, LAT_TOP])[1]]);
    const rows0 = Math.floor(proj([0, LAT_BOTTOM])[1] / S0);
    const H = rows0 * S0;
    base = { W, H, VW, VH, S0, cols0, rows0, proj };

    for (const p of photos) p.xy = proj([p.lng, p.lat]);

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(VW * dpr);
    canvas.height = Math.round(VH * dpr);

    cache = null;
    level = -1;
    zoom.extent([[0, 0], [VW, VH]]).translateExtent([[0, 0], [W, H]]);

    let k, cx, cy;
    if (prev) {
      ({ k, cx, cy } = prev);
    } else {
      // On tall (portrait) screens the whole world is a thin strip, so start
      // zoomed in enough to fill most of the height, centred on the photos.
      k = Math.max(1, Math.min(3, (VH * 0.75) / H));
      cx = k > 1 ? d3.mean(photos, (p) => p.xy[0]) / W : 0.5;
      cy = 0.5;
    }
    d3.select(mapView).call(zoom.transform, centered(k, cx, cy));
    draw();
  }

  // Transform at zoom k with world point (cx, cy) (as 0..1 fractions) at screen centre,
  // kept inside the map edges.
  function centered(k, cx, cy) {
    const { W, H, VW, VH } = base;
    const fit = (view, size, c) =>
      view >= size * k ? (view - size * k) / 2 : Math.min(0, Math.max(view - size * k, view / 2 - c * size * k));
    return d3.zoomIdentity.translate(fit(VW, W, cx), fit(VH, H, cy)).scale(k);
  }

  // Which cells in [i0..i1] x [j0..j1] at this level are land?
  // Draws the coastline into a small offscreen canvas (SUPERSAMPLE px per tile)
  // and counts covered samples per tile.
  function landMask(lvl, s, i0, i1, j0, j1) {
    const geo = lvl >= FINE_FROM_LEVEL && land.fine ? land.fine : land.coarse;
    if (
      cache && cache.level === lvl && cache.geo === geo &&
      i0 >= cache.i0 && i1 <= cache.i1 && j0 >= cache.j0 && j1 <= cache.j1
    ) return cache;

    // rasterize a margin around the view so small pans reuse it
    const M = 12;
    const cols = base.cols0 * 2 ** lvl;
    const rows = base.rows0 * 2 ** lvl;
    const ci0 = Math.max(0, i0 - M), ci1 = Math.min(cols - 1, i1 + M);
    const cj0 = Math.max(0, j0 - M), cj1 = Math.min(rows - 1, j1 + M);
    const ni = ci1 - ci0 + 1, nj = cj1 - cj0 + 1;
    const w = ni * SUPERSAMPLE, h = nj * SUPERSAMPLE;

    off.width = w;
    off.height = h;
    const f = SUPERSAMPLE / s;
    const [bx, by] = base.proj.translate();
    const p = d3.geoMercator()
      .scale(base.proj.scale() * f)
      .translate([(bx - ci0 * s) * f, (by - cj0 * s) * f])
      .clipExtent([[-2, -2], [w + 2, h + 2]]);
    offCtx.clearRect(0, 0, w, h);
    offCtx.fillStyle = "#000";
    offCtx.beginPath();
    d3.geoPath(p, offCtx)(geo);
    offCtx.fill();

    const alpha = offCtx.getImageData(0, 0, w, h).data;
    const mask = new Uint8Array(ni * nj);
    for (let j = 0; j < nj; j++) {
      for (let i = 0; i < ni; i++) {
        let hits = 0;
        for (let y = 0; y < SUPERSAMPLE; y++) {
          const row = (j * SUPERSAMPLE + y) * w + i * SUPERSAMPLE;
          for (let x = 0; x < SUPERSAMPLE; x++) {
            if (alpha[(row + x) * 4 + 3] > 127) hits++;
          }
        }
        mask[j * ni + i] = hits >= 2 ? 1 : 0;
      }
    }
    cache = { level: lvl, geo, i0: ci0, i1: ci1, j0: cj0, j1: cj1, ni, mask };
    return cache;
  }

  function draw() {
    if (!base) return;
    const { VW, VH, S0, cols0, rows0 } = base;
    const { k, x: tx, y: ty } = transform;
    const dpr = window.devicePixelRatio || 1;

    const lvl = Math.max(0, Math.floor(Math.log2(k) + 1e-6));
    const s = S0 / 2 ** lvl;           // tile spacing in zoom-1 px
    const step = s * k;                // tile spacing on screen
    const t = step * TILE;
    if (lvl !== level) {
      level = lvl;
      buildSpots(s);
    }

    const cols = cols0 * 2 ** lvl;
    const rows = rows0 * 2 ** lvl;
    const clampI = (v) => Math.max(0, Math.min(cols - 1, v));
    const clampJ = (v) => Math.max(0, Math.min(rows - 1, v));
    const i0 = clampI(Math.floor(-tx / step)), i1 = clampI(Math.floor((VW - tx) / step));
    const j0 = clampJ(Math.floor(-ty / step)), j1 = clampJ(Math.floor((VH - ty) / step));
    const m = landMask(lvl, s, i0, i1, j0, j1);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, VW, VH);
    ctx.fillStyle = LAND_COLOR;
    ctx.beginPath();
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        if (!m.mask[(j - m.j0) * m.ni + (i - m.i0)]) continue;
        ctx.rect(tx + (i + 0.5) * step - t / 2, ty + (j + 0.5) * step - t / 2, t, t);
      }
    }
    ctx.fill();

    for (const spot of spots) {
      const [sx, sy] = toScreen(spot);
      spot.el.style.left = sx + "px";
      spot.el.style.top = sy + "px";
      spot.el.style.setProperty("--s", t + "px");
    }
    if (label && !label.hidden && label.spot) placeLabel(label.spot);

    mapView.classList.toggle("zoomed", k > 1.01);
    zoomResetBtn.hidden = k <= 1.01;
    positionWindow();
  }

  function toScreen(spot) {
    return [transform.x + spot.x * transform.k, transform.y + spot.y * transform.k];
  }

  // ---------- Zoom ----------

  const zoom = d3.zoom()
    .scaleExtent([1, MAX_ZOOM])
    .clickDistance(4)
    // scroll wheel / trackpad / pinch all zoom (the page itself doesn't scroll)
    .filter((e) => e.type === "wheel" || !e.button)
    .on("zoom", (e) => {
      transform = e.transform;
      requestDraw();
    });

  let drawPending = 0;
  function requestDraw() {
    if (!drawPending) drawPending = requestAnimationFrame(() => { drawPending = 0; draw(); });
  }

  d3.select(mapView).call(zoom);
  const zoomBy = (f) => d3.select(mapView).transition().duration(350).call(zoom.scaleBy, f);
  document.getElementById("zoomIn").addEventListener("click", () => zoomBy(2));
  document.getElementById("zoomOut").addEventListener("click", () => zoomBy(0.5));
  zoomResetBtn.addEventListener("click", () =>
    d3.select(mapView).transition().duration(500).call(zoom.transform, centered(1, 0.5, 0.5)));

  // ---------- Photo tiles ----------

  function regionName(list) {
    const zones = [...new Set(list.map((p) => p.zone))];
    const shown = zones.slice(0, 2).join(" / ") + (zones.length > 2 ? ` +${zones.length - 2}` : "");
    return `${shown}, ${list[0].country}`;
  }

  function placeLabel(spot) {
    const [sx, sy] = toScreen(spot);
    label.style.left = sx + "px";
    label.style.top = sy + "px";
  }

  // One clickable tile per grid cell that contains photos, at tile size s.
  function buildSpots(s) {
    const byCell = new Map();
    for (const p of photos) {
      const i = Math.floor(p.xy[0] / s);
      const j = Math.floor(p.xy[1] / s);
      const key = i + "," + j;
      if (!byCell.has(key)) byCell.set(key, { x: (i + 0.5) * s, y: (j + 0.5) * s, photos: [] });
      byCell.get(key).photos.push(p);
    }
    spots = [...byCell.values()];

    spotsEl.innerHTML = "";
    label = document.createElement("div");
    label.className = "spot-label";
    label.hidden = true;
    spotsEl.appendChild(label);

    for (const spot of spots) {
      const n = spot.photos.length;
      const text = n === 1
        ? `${spot.photos[0].title}, ${spot.photos[0].zone}`
        : `${regionName(spot.photos)} · ${n} photos`;
      const btn = document.createElement("button");
      btn.className = "spot";
      btn.setAttribute("aria-label", text);
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        openWindow(spot, 0);
      });
      btn.addEventListener("dblclick", (e) => e.stopPropagation());
      const show = () => {
        label.textContent = text;
        label.spot = spot;
        placeLabel(spot);
        label.hidden = false;
      };
      const hide = () => (label.hidden = true);
      btn.addEventListener("mouseenter", show);
      btn.addEventListener("focus", show);
      btn.addEventListener("mouseleave", hide);
      btn.addEventListener("blur", hide);
      spot.el = btn;
      spotsEl.appendChild(btn);
    }

    // keep an open window attached to the tile now holding its photo
    if (view.spot) anchorToCurrentPhoto();
  }

  function anchorToCurrentPhoto() {
    const current = view.items[view.idx];
    const spot = spots.find((sp) => sp.photos.includes(current));
    if (!spot) return closeWindow();
    if (view.spot && view.spot.el) view.spot.el.classList.remove("active");
    view.spot = spot;
    spot.el.classList.add("active");
  }

  // ---------- Photo window ----------

  function openWindow(spot, idx) {
    if (view.spot && view.spot.el) view.spot.el.classList.remove("active");
    view.spot = spot;
    view.items = spot.photos;
    spot.el.classList.add("active");
    if (label) label.hidden = true;

    win.hidden = false;
    // restart the pop-in animation
    win.style.animation = "none";
    void win.offsetWidth;
    win.style.animation = "";

    showPhoto(idx);
    positionWindow();
  }

  function positionWindow() {
    const spot = view.spot;
    if (!spot || win.hidden || !base) return;
    const wrapW = wrap.clientWidth;
    const wrapH = wrap.clientHeight;
    const ww = Math.min(320, wrapW - 24);
    win.style.width = ww + "px";
    const wh = win.offsetHeight;
    const [x, y] = toScreen(spot);
    const tileHalf = (base.S0 / 2 ** Math.max(level, 0)) * transform.k * TILE / 2;
    const gap = 14 + tileHalf;

    let left, top;
    if (wrapW < 560) {
      // narrow screens: open below the tile, or above it if there's no room
      left = x - ww / 2;
      top = y + gap + wh <= wrapH - 12 ? y + gap : y - gap - wh;
    } else {
      left = x + gap + ww <= wrapW - 12 ? x + gap : x - gap - ww;
      top = y - wh / 2;
    }
    left = Math.max(12, Math.min(left, wrapW - ww - 12));
    const headerH = document.querySelector(".site-header")?.offsetHeight || 0;
    top = Math.max(headerH + 12, Math.min(top, wrapH - wh - 12));

    win.style.left = left + "px";
    win.style.top = top + "px";
    win.style.setProperty("--ox", x - left + "px");
    win.style.setProperty("--oy", y - top + "px");
  }

  function mapsUrl(p) {
    return p.link || `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`;
  }

  function showPhoto(i) {
    const n = view.items.length;
    view.idx = (i + n) % n;
    const p = view.items[view.idx];

    winImg.classList.remove("loaded");
    winImg.onload = () => winImg.classList.add("loaded");
    winImg.src = p.src;
    winImg.alt = p.title;
    if (winImg.complete && winImg.naturalWidth) winImg.classList.add("loaded");

    winName.textContent = p.title;
    winMeta.textContent = `${p.zone}, ${p.country}`;
    winMaps.href = mapsUrl(p);
    winNav.hidden = n < 2;
    winCount.textContent = `${view.idx + 1} / ${n}`;

    // follow the photo if it sits in a different tile at this zoom level
    if (view.spot && !view.spot.photos.includes(p)) {
      anchorToCurrentPhoto();
      positionWindow();
    }

    // preload the next photo
    if (n > 1) new Image().src = view.items[(view.idx + 1) % n].src;
  }

  function closeWindow() {
    win.hidden = true;
    if (view.spot && view.spot.el) view.spot.el.classList.remove("active");
    view.spot = null;
  }

  document.getElementById("winClose").addEventListener("click", closeWindow);
  document.getElementById("winPrev").addEventListener("click", () => showPhoto(view.idx - 1));
  document.getElementById("winNext").addEventListener("click", () => showPhoto(view.idx + 1));

  document.addEventListener("click", (e) => {
    if (!win.hidden && !win.contains(e.target) && !e.target.closest(".spot, .zoom-ctrl")) closeWindow();
  });

  document.addEventListener("keydown", (e) => {
    if (win.hidden) return;
    if (e.key === "Escape") closeWindow();
    else if (e.key === "ArrowLeft") showPhoto(view.idx - 1);
    else if (e.key === "ArrowRight") showPhoto(view.idx + 1);
  });

  // ---------- Resize ----------

  let lastSize = "";
  let pending = 0;
  new ResizeObserver(() => {
    const size = mapView.clientWidth + "x" + mapView.clientHeight;
    if (size === lastSize) return;
    lastSize = size;
    cancelAnimationFrame(pending);
    pending = requestAnimationFrame(build);
  }).observe(mapView);

  // ---------- Load ----------

  const toLand = (topo) => topojson.feature(topo, topo.objects.land);

  d3.json(LAND_COARSE_URL)
    .then((topo) => {
      land.coarse = toLand(topo);
      build();
      // detailed coastlines for zoomed-in views, loaded in the background
      return d3.json(LAND_FINE_URL).then((fine) => {
        land.fine = toLand(fine);
        requestDraw();
      }).catch(() => {});
    })
    .catch(() => {
      document.querySelector(".masthead p").textContent =
        "Couldn't load the world map. Please check your connection and refresh.";
    });
})();
