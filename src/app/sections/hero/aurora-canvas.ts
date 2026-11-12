/**
 * Hero background (ported from the reference): three slow aurora blobs that drift and lean
 * toward the mouse, plus a dot grid whose dots are pushed away from the cursor.
 *
 * Touch devices (pointer: coarse) get a lighter, self-moving variant:
 * - every dot drifts slowly on its own,
 * - touching / dragging pushes the dots like the mouse does, then the push fades out,
 * - a light parallax follows the page scroll,
 * - fewer dots (wider grid).
 * Desktop behaviour is unchanged.
 *
 * - `animate = false` (reduced motion): one static frame, redrawn only on resize / palette change.
 * - The loop pauses while the hero is off screen (IntersectionObserver) or the tab is hidden.
 * - Colours come from the CSS tokens; call `readColors()` after the palette changes.
 */
export class AuroraCanvas {
  private readonly c2d: CanvasRenderingContext2D;
  private W = 0;
  private H = 0;
  private cols: string[] = [];
  private fg = '#fff';
  private readonly mouse = { x: 0.5, y: 0.4 }; // normalised, for the blobs
  private readonly mp = { x: -999, y: -999 }; // px inside the canvas, for the dots
  private raf = 0;
  private onScreen = true;
  private io?: IntersectionObserver;

  /** Touch device: drift + touch + scroll parallax, fewer dots. */
  private readonly touch = matchMedia('(pointer: coarse)').matches;
  /** Strength of the push around the finger (1 while touching, then fades to 0). Always 1 for the mouse. */
  private influence = 1;
  private touching = false;
  private scrollY = 0;

  private static readonly BLOBS = [
    { x: 0.25, y: 0.3, r: 0.45, s: 0.00021, p: 0 },
    { x: 0.75, y: 0.55, r: 0.4, s: 0.00017, p: 2 },
    { x: 0.5, y: 0.8, r: 0.35, s: 0.00026, p: 4 },
  ];

  constructor(
    private readonly cv: HTMLCanvasElement,
    private readonly animate: boolean,
  ) {
    this.c2d = cv.getContext('2d')!;
    if (this.touch) this.influence = 0; // nothing pushed until the first touch
  }

  start(): void {
    this.readColors(false);
    this.size();
    addEventListener('resize', this.onResize);
    if (!this.animate) {
      this.draw(0);
      return;
    }
    if (this.touch) {
      // Passive: never blocks scrolling.
      addEventListener('touchstart', this.onTouch, { passive: true });
      addEventListener('touchmove', this.onTouch, { passive: true });
      addEventListener('touchend', this.onTouchEnd, { passive: true });
      addEventListener('touchcancel', this.onTouchEnd, { passive: true });
      addEventListener('scroll', this.onScroll, { passive: true });
      this.scrollY = scrollY;
    } else {
      addEventListener('pointermove', this.onPointer);
    }
    document.addEventListener('visibilitychange', this.onVisibility);
    this.io = new IntersectionObserver(([e]) => {
      this.onScreen = e.isIntersecting;
      this.resume();
    });
    this.io.observe(this.cv);
    this.resume();
  }

  /** Re-read --accent / --accent2 / --fg (call after a palette switch). */
  readColors(redraw = true): void {
    const cs = getComputedStyle(document.documentElement);
    const a = cs.getPropertyValue('--accent').trim();
    const a2 = cs.getPropertyValue('--accent2').trim();
    this.cols = [a, a2, a];
    this.fg = cs.getPropertyValue('--fg').trim();
    // Static frame always uses t = 0, so redraws (palette, resize) never shift it.
    if (redraw && !this.animate) this.draw(0);
  }

  destroy(): void {
    cancelAnimationFrame(this.raf);
    this.io?.disconnect();
    removeEventListener('resize', this.onResize);
    removeEventListener('pointermove', this.onPointer);
    removeEventListener('touchstart', this.onTouch);
    removeEventListener('touchmove', this.onTouch);
    removeEventListener('touchend', this.onTouchEnd);
    removeEventListener('touchcancel', this.onTouchEnd);
    removeEventListener('scroll', this.onScroll);
    document.removeEventListener('visibilitychange', this.onVisibility);
  }

  /** Run the loop only while the hero is on screen and the tab is visible. */
  private resume(): void {
    cancelAnimationFrame(this.raf);
    if (this.onScreen && !document.hidden) this.raf = requestAnimationFrame(this.loop);
  }

  private readonly onVisibility = () => this.resume();

  private readonly onResize = () => {
    // Mobile browsers fire resize when the URL bar shows/hides: only resize if the canvas really changed.
    const r = this.cv.getBoundingClientRect();
    const d = Math.min(devicePixelRatio, 1.5);
    if (Math.round(r.width * d) === this.W && Math.round(r.height * d) === this.H) return;
    this.size();
    if (!this.animate) this.draw(0);
  };

  private readonly onPointer = (e: PointerEvent) => {
    this.mouse.x = e.clientX / innerWidth;
    this.mouse.y = e.clientY / innerHeight;
    const r = this.cv.getBoundingClientRect();
    this.mp.x = e.clientX - r.left;
    this.mp.y = e.clientY - r.top;
  };

  private readonly onTouch = (e: TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    this.touching = true;
    this.influence = 1;
    this.mouse.x = t.clientX / innerWidth;
    this.mouse.y = t.clientY / innerHeight;
    const r = this.cv.getBoundingClientRect();
    this.mp.x = t.clientX - r.left;
    this.mp.y = t.clientY - r.top;
  };

  private readonly onTouchEnd = (e: TouchEvent) => {
    if (e.touches.length === 0) this.touching = false; // push fades out in the loop
  };

  private readonly onScroll = () => {
    this.scrollY = scrollY;
  };

  private readonly loop = (t: number) => {
    if (this.touch && !this.touching && this.influence > 0) {
      this.influence = this.influence < 0.01 ? 0 : this.influence * 0.94;
    }
    this.draw(t);
    if (this.onScreen && !document.hidden) this.raf = requestAnimationFrame(this.loop);
  };

  private size(): void {
    const r = this.cv.getBoundingClientRect();
    const d = Math.min(devicePixelRatio, 1.5);
    this.W = this.cv.width = Math.round(r.width * d);
    this.H = this.cv.height = Math.round(r.height * d);
  }

  private draw(t: number): void {
    const { c2d: cx, W, H, mouse, mp, touch } = this;
    const moving = touch && this.animate;
    cx.clearRect(0, 0, W, H);

    // Touch: light scroll parallax (blobs rise a little, dots lag behind the content).
    const scrollN = moving ? this.scrollY / Math.max(innerHeight, 1) : 0;

    // Aurora blobs (additive), each drifting on its own slow sine and leaning toward the pointer.
    cx.globalCompositeOperation = 'lighter';
    AuroraCanvas.BLOBS.forEach((b, i) => {
      const x = (b.x + Math.sin(t * b.s + b.p) * 0.12 + (mouse.x - 0.5) * 0.08 * (i + 1)) * W;
      const y = (b.y + Math.cos(t * b.s * 1.3 + b.p) * 0.1 + (mouse.y - 0.5) * 0.06 * (i + 1) - scrollN * 0.08 * (i + 1)) * H;
      const r = b.r * Math.max(W, H);
      const g = cx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, this.cols[i] + '55');
      g.addColorStop(1, this.cols[i] + '00');
      cx.fillStyle = g;
      cx.fillRect(0, 0, W, H);
    });
    cx.globalCompositeOperation = 'source-over';

    // Dot grid: dots near the pointer are pushed outward, grow and brighten.
    const d = Math.min(devicePixelRatio, 1.5);
    const gap = (touch ? 48 : 36) * d; // fewer dots on touch devices
    const R = 150 * d;
    const mx = mp.x * d;
    const my = mp.y * d;
    const push = this.influence;
    const drift = moving ? 3.5 * d : 0;
    // Parallax: grid slides down by a fraction of the scroll, wrapped to one cell.
    const shift = moving ? (this.scrollY * 0.12 * d) % gap : 0;
    cx.fillStyle = this.fg;
    for (let gy = gap / 2 - (moving ? gap : 0); gy < H + gap; gy += gap) {
      const y0 = gy + shift;
      if (y0 < -gap || y0 > H + gap) continue;
      for (let x0 = gap / 2; x0 < W; x0 += gap) {
        // Slow individual drift (touch only): each dot sways on its own phase.
        const x = drift ? x0 + Math.sin(t * 0.0006 + y0 * 0.013 + x0 * 0.007) * drift : x0;
        const y = drift ? y0 + Math.cos(t * 0.0005 + x0 * 0.011) * drift : y0;
        const dx = x - mx;
        const dy = y - my;
        const dist = Math.hypot(dx, dy);
        let ox = 0;
        let oy = 0;
        let sz = 1.1 * d;
        const near = dist < R && push > 0;
        if (near) {
          const f = (1 - dist / R) * push;
          ox = (dx / dist) * f * 28 * d || 0;
          oy = (dy / dist) * f * 28 * d || 0;
          sz += f * 2.4 * d;
        }
        cx.globalAlpha = near ? 0.16 + 0.39 * push : 0.16;
        cx.beginPath();
        cx.arc(x + ox, y + oy, sz, 0, 6.283);
        cx.fill();
      }
    }
    cx.globalAlpha = 1;
  }
}
