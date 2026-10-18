'use strict';

// mindmush.com: the wordmark and the game icons are jelly.
// Every letter and icon is a soft mesh (a grid of points on springs, coupled to their neighbours) drawn with WebGL.
// Hover smears it, drag pulls it like taffy, tap pokes it, and it wobbles back. The HTML underneath sets the layout
// and is the fallback when WebGL or JS is missing.

(() => {
    const stage = document.getElementById('stage');
    const canvas = document.getElementById('jelly');
    const word = document.getElementById('word');
    const games = [...document.querySelectorAll('[data-game]')];
    const flavorBtn = document.getElementById('flavor');
    const flavorName = document.getElementById('flavor-name');
    const soundBtn = document.getElementById('sound');
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    const calm = matchMedia('(prefers-reduced-motion: reduce)');

    const store = {
        get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
        set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
    };
    const rand = (a, b) => a + Math.random() * (b - a);
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    // ===== FLAVORS =====
    // jelly: light, body, deep. shade: the hard drop shadow under the jelly.
    const FLAVORS = [
        { name: 'strawberry', bg: '#D4F53C', ink: '#17200A', jelly: ['#FF9BCB', '#FF2F86', '#C80B5C'], shade: '#AECB1E' },
        { name: 'grape', bg: '#FF9B45', ink: '#2B1200', jelly: ['#CDB0FF', '#8A4DFF', '#5216D8'], shade: '#E0762A' },
        { name: 'blue raspberry', bg: '#FFC9E3', ink: '#2B0A1C', jelly: ['#9EDBFF', '#2D86FF', '#0A4FCF'], shade: '#F0A3C8' },
        { name: 'lemon', bg: '#1C1640', ink: '#FFF3D6', jelly: ['#FFF8B8', '#FFD83A', '#E99A00'], shade: '#0D0A22' },
        { name: 'mint', bg: '#3B36F5', ink: '#F2F0FF', jelly: ['#C8FFEA', '#3DF0B0', '#0AA673'], shade: '#2620B8' },
    ];
    let flavor = Math.max(0, FLAVORS.findIndex((f) => f.name === store.get('mm-flavor')));

    function applyFlavor() {
        const f = FLAVORS[flavor];
        const s = document.documentElement.style;
        s.setProperty('--bg', f.bg);
        s.setProperty('--ink', f.ink);
        s.setProperty('--j1', f.jelly[1]);
        s.setProperty('--shade', f.shade);
        s.setProperty('--next', FLAVORS[(flavor + 1) % FLAVORS.length].jelly[1]);
        flavorName.textContent = f.name;
        themeMeta.content = f.bg;
    }
    applyFlavor();

    // ===== SOUND: tiny synth squishes, only after the first touch =====
    const sfx = (() => {
        let ac = null;
        let out = null;
        let on = store.get('mm-sound') !== 'off';
        const last = {};
        function unlock() {
            if (!ac) {
                const AC = window.AudioContext || window.webkitAudioContext;
                if (!AC) return;
                ac = new AC();
                out = ac.createGain();
                out.gain.value = 0.5;
                out.connect(ac.destination);
            }
            if (ac.state === 'suspended') ac.resume();
        }
        function tone(type, f0, f1, dur, vol, wobble = 0, at = 0) {
            if (!on || !ac || ac.state !== 'running') return;
            const t = ac.currentTime + at;
            const o = ac.createOscillator();
            const g = ac.createGain();
            o.type = type;
            o.frequency.setValueAtTime(f0, t);
            o.frequency.exponentialRampToValueAtTime(f1, t + dur);
            if (wobble) {
                const lfo = ac.createOscillator();
                const lg = ac.createGain();
                lfo.frequency.value = 17;
                lg.gain.setValueAtTime(wobble, t);
                lg.gain.exponentialRampToValueAtTime(0.01, t + dur);
                lfo.connect(lg).connect(o.frequency);
                lfo.start(t);
                lfo.stop(t + dur);
            }
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
            g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
            o.connect(g).connect(out);
            o.start(t);
            o.stop(t + dur + 0.03);
        }
        const gate = (k, ms) => {
            const now = performance.now();
            if (now - (last[k] || 0) < ms) return false;
            last[k] = now;
            return true;
        };
        return {
            unlock,
            get on() { return on; },
            toggle() { on = !on; store.set('mm-sound', on ? 'on' : 'off'); return on; },
            squish() { tone('triangle', rand(210, 260), rand(95, 120), 0.11, 0.2); },
            boing(k) {
                const f = 380 - 170 * k;
                tone('sine', f * 0.7, f * 1.5, 0.07, 0.22);
                tone('sine', f * 1.4, f * 0.75, 0.38, 0.18, f * 0.16, 0.05);
            },
            plop() { if (gate('plop', 45)) tone('sine', rand(520, 820), rand(150, 210), 0.1, 0.16); },
            blub() { if (gate('blub', 60)) tone('sine', rand(300, 420), rand(120, 160), 0.16, 0.1, 30); },
            flavor() { [1, 1.26, 1.5, 2].forEach((m, i) => tone('triangle', 520 * m, 530 * m, 0.12, 0.1, 0, i * 0.055)); },
        };
    })();

    soundBtn.setAttribute('aria-pressed', String(sfx.on));
    soundBtn.addEventListener('click', () => {
        sfx.unlock();
        soundBtn.setAttribute('aria-pressed', String(sfx.toggle()));
        sfx.plop();
    });

    let jelly = null;
    flavorBtn.addEventListener('click', () => {
        sfx.unlock();
        flavor = (flavor + 1) % FLAVORS.length;
        store.set('mm-flavor', FLAVORS[flavor].name);
        applyFlavor();
        sfx.flavor();
        if (jelly) jelly.reflavor();
    });

    // ===== WEBGL =====
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: true });
    if (!gl) return;

    const VS = `
attribute vec3 a_p;
attribute vec2 a_uv;
uniform vec2 u_res;
uniform vec2 u_off;
varying vec2 v_uv;
varying float v_sh;
void main() {
    vec2 p = (a_p.xy + u_off) / u_res * 2.0 - 1.0;
    gl_Position = vec4(p.x, -p.y, 0.0, 1.0);
    v_uv = a_uv;
    v_sh = a_p.z;
}`;
    // Squashed jelly catches more light, stretched jelly goes a little deeper.
    const FS = `
precision mediump float;
uniform sampler2D u_tex;
uniform vec4 u_tint;
uniform float u_shadow;
varying vec2 v_uv;
varying float v_sh;
void main() {
    vec4 c = texture2D(u_tex, v_uv);
    if (u_shadow > 0.5) { gl_FragColor = u_tint * c.a; return; }
    vec3 lift = v_sh > 0.0 ? vec3(v_sh * 0.24) : vec3(v_sh * 0.14);
    gl_FragColor = vec4(clamp(c.rgb + lift * c.a, 0.0, c.a), c.a);
}`;

    function shader(type, src) {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
    }
    const prog = gl.createProgram();
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const loc = {
        p: gl.getAttribLocation(prog, 'a_p'),
        uv: gl.getAttribLocation(prog, 'a_uv'),
        res: gl.getUniformLocation(prog, 'u_res'),
        off: gl.getUniformLocation(prog, 'u_off'),
        tint: gl.getUniformLocation(prog, 'u_tint'),
        shadow: gl.getUniformLocation(prog, 'u_shadow'),
    };
    gl.enableVertexAttribArray(loc.p);
    gl.enableVertexAttribArray(loc.uv);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

    // ===== PHYSICS =====
    const P = {
        K: 110,   // spring home (at the top; the base is glued down much harder)
        C: 1100,  // neighbour coupling (makes waves travel through the jelly)
        D: 5.2,   // damping
        G: 2600,  // grab pull
        dt: 1 / 120,
    };

    let objs = [];
    let W = 0, H = 0, dpr = 1, em = 200;
    let grab = null;
    let lastInput = 0;
    let suppressClick = false;

    const scratch = document.createElement('canvas').getContext('2d');
    const FONT = (px) => `800 ${px}px Sniglet, "Arial Rounded MT Bold", ui-rounded, system-ui, sans-serif`;

    function hexRGB(hex) {
        const n = parseInt(hex.slice(1), 16);
        return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
    }

    // Gummy shading without canvas blur (too slow on phones): draw the glyph small, scale it back up (that is the
    // blur), shift it, and keep the colour only where the shifted glyph is not, inside the real glyph (source-atop).
    // Shift down lights the top edges; shift up darkens the bottom edges.
    const work = document.createElement('canvas');
    const soft = document.createElement('canvas');
    function innerEdge(g, o, ox, oy, blur, color) {
        const c = o.tex.canvas;
        const k = Math.max(1, blur * dpr);
        soft.width = Math.max(1, Math.ceil(c.width / k));
        soft.height = Math.max(1, Math.ceil(c.height / k));
        const sg = soft.getContext('2d');
        sg.setTransform(dpr / k, 0, 0, dpr / k, (o.ox + ox) * dpr / k, (o.oy + oy) * dpr / k);
        sg.font = FONT(em);
        sg.fillStyle = '#000';
        sg.fillText(o.ch, 0, 0);
        if (work.width !== c.width || work.height !== c.height) {
            work.width = c.width;
            work.height = c.height;
        }
        const wg = work.getContext('2d');
        wg.globalCompositeOperation = 'source-over';
        wg.clearRect(0, 0, c.width, c.height);
        wg.fillStyle = color;
        wg.fillRect(0, 0, c.width, c.height);
        wg.globalCompositeOperation = 'destination-out';
        wg.imageSmoothingEnabled = true;
        wg.imageSmoothingQuality = 'high';
        wg.drawImage(soft, 0, 0, soft.width * k, soft.height * k);
        g.save();
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.globalCompositeOperation = 'source-atop';
        g.drawImage(work, 0, 0);
        g.restore();
    }

    function paintLetter(o) {
        const f = FLAVORS[flavor];
        const c = o.tex.canvas;
        const g = c.getContext('2d');
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.clearRect(0, 0, c.width, c.height);
        g.setTransform(dpr, 0, 0, dpr, o.ox * dpr, o.oy * dpr);
        g.font = FONT(em);
        const grad = g.createLinearGradient(0, -o.asc, 0, o.desc);
        grad.addColorStop(0, f.jelly[0]);
        grad.addColorStop(0.5, f.jelly[1]);
        grad.addColorStop(1, f.jelly[2]);
        g.fillStyle = grad;
        g.fillText(o.ch, 0, 0);
        innerEdge(g, o, 0, -em * 0.075, em * 0.06, f.jelly[2]);
        innerEdge(g, o, 0, em * 0.06, em * 0.05, 'rgba(255,255,255,0.2)');
        innerEdge(g, o, em * 0.01, em * 0.024, em * 0.012, 'rgba(255,255,255,0.9)');
    }

    function paintTile(o) {
        const c = o.tex.canvas;
        const g = c.getContext('2d');
        const s = o.size;
        const r = s * 0.23;
        g.setTransform(dpr, 0, 0, dpr, o.ox * dpr, o.oy * dpr);
        g.clearRect(-o.ox, -o.oy, c.width, c.height);
        g.save();
        g.beginPath();
        g.roundRect(0, 0, s, s, r);
        g.clip();
        g.drawImage(o.img, 0, 0, s, s);
        const gloss = g.createLinearGradient(0, 0, 0, s);
        gloss.addColorStop(0, 'rgba(255,255,255,0.34)');
        gloss.addColorStop(0.42, 'rgba(255,255,255,0.06)');
        gloss.addColorStop(0.43, 'rgba(255,255,255,0)');
        gloss.addColorStop(1, 'rgba(0,0,0,0.12)');
        g.fillStyle = gloss;
        g.fillRect(0, 0, s, s);
        g.lineWidth = s * 0.04;
        g.strokeStyle = 'rgba(255,255,255,0.4)';
        g.beginPath();
        g.roundRect(s * 0.02, s * 0.02, s * 0.96, s * 0.96, r * 0.92);
        g.stroke();
        g.restore();
    }

    function makeObj(kind, x, y, w, h, cell) {
        const tc = document.createElement('canvas');
        tc.width = Math.ceil(w * dpr);
        tc.height = Math.ceil(h * dpr);
        const nx = Math.max(2, Math.round(w / cell));
        const ny = Math.max(2, Math.round(h / cell));
        const cols = nx + 1;
        const n = cols * (ny + 1);
        const px = new Float32Array(n), py = new Float32Array(n), uv = new Float32Array(n * 2), kk = new Float32Array(n);
        for (let j = 0; j <= ny; j++) {
            for (let i = 0; i <= nx; i++) {
                const k = j * cols + i;
                px[k] = x + (i / nx) * w;
                py[k] = y + (j / ny) * h;
                uv[k * 2] = i / nx;
                uv[k * 2 + 1] = j / ny;
                // Feet stuck to the floor: pull stretches it from the base, squash happens up top.
                const b = j / ny;
                kk[k] = kind === 'letter' ? P.K * (0.4 + 20 * b ** 4) : P.K * (0.8 + 2.5 * b * b);
            }
        }
        const idx = new Uint16Array(nx * ny * 6);
        let t = 0;
        for (let j = 0; j < ny; j++) {
            for (let i = 0; i < nx; i++) {
                const a = j * cols + i, b = a + 1, c = a + cols, d = c + 1;
                idx[t++] = a; idx[t++] = b; idx[t++] = c;
                idx[t++] = b; idx[t++] = d; idx[t++] = c;
            }
        }
        const o = {
            kind, x, y, w, h, nx, ny, cols, n, px, py, kk,
            cw: w / nx, ch_: h / ny,
            dx: new Float32Array(n), dy: new Float32Array(n),
            vx: new Float32Array(n), vy: new Float32Array(n),
            wt: new Float32Array(n),
            buf: new Float32Array(n * 3),
            off: 0, voff: 0, delay: 0, falling: false, hops: 0,
            tex: { canvas: tc, gl: gl.createTexture() },
            pos: gl.createBuffer(), uvb: gl.createBuffer(), ib: gl.createBuffer(), count: idx.length,
            mask: null, mw: 0, mh: 0,
        };
        gl.bindBuffer(gl.ARRAY_BUFFER, o.uvb);
        gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.ib);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, o.pos);
        gl.bufferData(gl.ARRAY_BUFFER, o.buf, gl.DYNAMIC_DRAW);
        return o;
    }

    function upload(o) {
        gl.bindTexture(gl.TEXTURE_2D, o.tex.gl);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, o.tex.canvas);
        // A coarse alpha mask (about 1 per 3 CSS px) for hit testing, drawn straight at that size: reading the
        // texture canvas back would stall on the GPU.
        const mw = Math.max(1, Math.round(o.w / 3)), mh = Math.max(1, Math.round(o.h / 3));
        const m = document.createElement('canvas');
        m.width = mw;
        m.height = mh;
        const mg = m.getContext('2d', { willReadFrequently: true });
        mg.setTransform(mw / o.w, 0, 0, mh / o.h, (o.ox * mw) / o.w, (o.oy * mh) / o.h);
        mg.fillStyle = '#000';
        if (o.kind === 'letter') {
            mg.font = FONT(em);
            mg.fillText(o.ch, 0, 0);
        } else {
            mg.beginPath();
            mg.roundRect(0, 0, o.size, o.size, o.size * 0.23);
            mg.fill();
        }
        try {
            const d = mg.getImageData(0, 0, mw, mh).data;
            o.mask = new Uint8Array(mw * mh);
            for (let i = 0; i < mw * mh; i++) o.mask[i] = d[i * 4 + 3];
        } catch { o.mask = null; }
        o.mw = mw;
        o.mh = mh;
    }

    function dispose(o) {
        gl.deleteTexture(o.tex.gl);
        gl.deleteBuffer(o.pos);
        gl.deleteBuffer(o.uvb);
        gl.deleteBuffer(o.ib);
    }

    // ===== LAYOUT: read the HTML, build a mesh over every letter and icon =====
    // Measures synchronously, then paints one body per task so the page never stalls; swaps in when all are ready.
    let buildGen = 0;
    const tick = () => (window.scheduler && scheduler.yield ? scheduler.yield() : new Promise((r) => setTimeout(r, 0)));
    async function build(entrance) {
        const gen = ++buildGen;
        const sr = stage.getBoundingClientRect();
        const nextW = sr.width, nextH = sr.height;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        const jobs = [];

        em = parseFloat(getComputedStyle(word).fontSize);
        scratch.font = FONT(em);
        const fm = scratch.measureText('m');
        const fontAsc = fm.fontBoundingBoxAscent ?? em * 0.95;
        const pad = em * 0.1;
        const cell = Math.max(7, em / 12);
        const range = document.createRange();
        const walker = document.createTreeWalker(word, NodeFilter.SHOW_TEXT);
        let order = 0;
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            for (let i = 0; i < node.length; i++) {
                const ch = node.data[i];
                if (!ch.trim()) continue;
                range.setStart(node, i);
                range.setEnd(node, i + 1);
                const r = range.getBoundingClientRect();
                const penX = r.left - sr.left;
                const base = r.top - sr.top + fontAsc;
                const m = scratch.measureText(ch);
                const L = m.actualBoundingBoxLeft, R = m.actualBoundingBoxRight;
                const A = m.actualBoundingBoxAscent, D = m.actualBoundingBoxDescent;
                const x = penX - L - pad, y = base - A - pad;
                const ord = order++;
                jobs.push(() => {
                    const o = makeObj('letter', x, y, L + R + pad * 2, A + D + pad * 2, cell);
                    Object.assign(o, { ch, asc: A, desc: D, ox: L + pad, oy: A + pad, order: ord, sx: em * 0.055 });
                    paintLetter(o);
                    return o;
                });
            }
        }

        games.forEach((el) => {
            const img = el.querySelector('img');
            const r = img.getBoundingClientRect();
            const s = r.width;
            const p = s * 0.04;
            const x = r.left - sr.left - p, y = r.top - sr.top - p;
            const ord = order++;
            jobs.push(() => {
                const o = makeObj('tile', x, y, s + p * 2, s + p * 2, Math.max(7, s / 9));
                Object.assign(o, { img, el, size: s, ox: p, oy: p, order: ord, sx: s * 0.06 });
                paintTile(o);
                return o;
            });
        });

        const next = [];
        for (const job of jobs) {
            await tick();
            if (gen !== buildGen) { next.forEach(dispose); return; }
            const o = job();
            upload(o);
            next.push(o);
        }
        await tick();
        if (gen !== buildGen) { next.forEach(dispose); return; }

        objs.forEach(dispose);
        objs = next;
        grab = null;
        W = nextW;
        H = nextH;
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        gl.viewport(0, 0, canvas.width, canvas.height);

        if (entrance && !calm.matches) {
            const letters = objs.filter((o) => o.kind === 'letter');
            objs.forEach((o) => {
                o.falling = true;
                o.off = -(o.y + o.h + rand(40, 220));
                o.voff = 0;
                o.hops = 0;
                o.delay = o.kind === 'letter' ? 0.12 + o.order * 0.075 : 0.12 + letters.length * 0.075 + 0.18 + (o.order - letters.length) * 0.11;
            });
        }
        objs.forEach((o) => { o.awake = true; o.moved = true; });
        stage.classList.add('live');
        wake();
    }

    // ===== FORCES =====
    // Splat: the top of the body keeps going, the bottom stops and spreads.
    function splat(o, v) {
        const bottom = o.y + o.h, cx = o.x + o.w / 2;
        o.awake = true;
        for (let k = 0; k < o.n; k++) {
            const hf = (bottom - o.py[k]) / o.h;
            o.vy[k] += v * 0.24 * hf;
            o.vx[k] += ((o.px[k] - cx) / o.w) * v * 0.5 * (1 - hf);
        }
    }

    function poke(x, y, strength) {
        const R = em * 0.95;
        const A = em * 3.4 * strength;
        objs.forEach((o) => {
            if (x < o.x - R || x > o.x + o.w + R || y < o.y + o.off - R || y > o.y + o.off + o.h + R) return;
            o.awake = true;
            for (let k = 0; k < o.n; k++) {
                const ex = o.px[k] + o.dx[k] - x, ey = o.py[k] + o.dy[k] + o.off - y;
                const d = Math.hypot(ex, ey);
                if (d > R || d < 0.001) continue;
                const f = (1 - d / R) ** 2 * A;
                o.vx[k] += (ex / d) * f;
                o.vy[k] += (ey / d) * f;
            }
        });
        wake();
    }

    let smearLast = null;
    function smear(x, y, t) {
        if (smearLast && t - smearLast.t < 200) {
            const dt = Math.max(0.008, (t - smearLast.t) / 1000);
            let vx = (x - smearLast.x) / dt, vy = (y - smearLast.y) / dt;
            const sp = Math.hypot(vx, vy);
            if (sp > 3500) { vx *= 3500 / sp; vy *= 3500 / sp; }
            const R = em * 0.6;
            let touched = false;
            objs.forEach((o) => {
                if (x < o.x - R || x > o.x + o.w + R || y < o.y + o.off - R || y > o.y + o.off + o.h + R) return;
                for (let k = 0; k < o.n; k++) {
                    const d = Math.hypot(o.px[k] + o.dx[k] - x, o.py[k] + o.dy[k] + o.off - y);
                    if (d > R) continue;
                    const f = (1 - d / R) ** 2 * 0.3;
                    o.vx[k] += vx * f;
                    o.vy[k] += vy * f;
                    o.awake = true;
                    touched = true;
                }
            });
            if (touched) wake();
        }
        smearLast = { x, y, t };
    }

    // Undo the local displacement to find which rest point is under (x, y).
    function toRest(o, x, y) {
        let rx = x, ry = y - o.off;
        for (let it = 0; it < 3; it++) {
            const i = clamp(Math.round((rx - o.x) / o.cw), 0, o.nx);
            const j = clamp(Math.round((ry - o.y) / o.ch_), 0, o.ny);
            const k = j * o.cols + i;
            rx = x - o.dx[k];
            ry = y - o.off - o.dy[k];
        }
        return { x: rx, y: ry };
    }

    function hit(x, y) {
        for (let n = objs.length - 1; n >= 0; n--) {
            const o = objs[n];
            const m = em * 1.4;
            if (x < o.x - m || x > o.x + o.w + m || y < o.y + o.off - m || y > o.y + o.off + o.h + m) continue;
            const r = toRest(o, x, y);
            const u = (r.x - o.x) / o.w, v = (r.y - o.y) / o.h;
            if (u < 0 || u > 1 || v < 0 || v > 1) continue;
            if (!o.mask) return { o, r };
            const a = o.mask[Math.min(o.mh - 1, Math.floor(v * o.mh)) * o.mw + Math.min(o.mw - 1, Math.floor(u * o.mw))];
            if (a > 90) return { o, r };
        }
        return null;
    }

    function blub(o, strength) {
        splat(o, (o.kind === 'tile' ? o.size * 4 : em * 2.4) * strength);
        sfx.blub();
        wake();
    }

    function wave(strength = 1, gap = 0.06) {
        objs.forEach((o, i) => setTimeout(() => blub(o, strength * rand(0.8, 1.1)), i * gap * 1000));
    }

    // ===== STEP + DRAW =====
    function step(o, dt) {
        const { cols, nx, ny, dx, dy, vx, vy, wt, kk } = o;
        const C = P.C, D = calm.matches ? 26 : P.D;
        const g = grab && grab.o === o ? grab : null;
        for (let j = 0; j <= ny; j++) {
            for (let i = 0; i <= nx; i++) {
                const k = j * cols + i;
                const x = dx[k], y = dy[k];
                let lx = 0, ly = 0, c = 0;
                if (i > 0) { lx += dx[k - 1]; ly += dy[k - 1]; c++; }
                if (i < nx) { lx += dx[k + 1]; ly += dy[k + 1]; c++; }
                if (j > 0) { lx += dx[k - cols]; ly += dy[k - cols]; c++; }
                if (j < ny) { lx += dx[k + cols]; ly += dy[k + cols]; c++; }
                const K = kk[k];
                let ax = -K * x + C * (lx - c * x) - D * vx[k];
                let ay = -K * y + C * (ly - c * y) - D * vy[k];
                if (g) {
                    const w = wt[k];
                    if (w > 0.002) {
                        ax += P.G * w * (g.tx - x) - 14 * w * vx[k];
                        ay += P.G * w * (g.ty - y) - 14 * w * vy[k];
                    }
                }
                vx[k] += ax * dt;
                vy[k] += ay * dt;
            }
        }
        let e = 0;
        for (let k = 0; k < o.n; k++) {
            dx[k] += vx[k] * dt;
            dy[k] += vy[k] * dt;
            e = Math.max(e, Math.abs(vx[k]) + Math.abs(vy[k]), Math.abs(dx[k]) + Math.abs(dy[k]));
        }
        return e;
    }

    function fall(o, dt) {
        if (!o.falling) return true;
        if (o.delay > 0) { o.delay -= dt; return false; }
        o.voff += em * 44 * dt;
        o.off += o.voff * dt;
        if (o.off >= 0) {
            const v = o.voff;
            o.off = 0;
            splat(o, Math.min(v, em * 16) * (o.kind === 'tile' ? 0.8 : 1));
            sfx.plop();
            if (o.hops < 1 && v > em * 6) {
                o.hops++;
                o.voff = -v * 0.2;
                o.off = -0.01;
            } else {
                o.falling = false;
                o.voff = 0;
            }
        }
        return false;
    }

    function draw() {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(loc.res, W, H);
        const shade = hexRGB(FLAVORS[flavor].shade);
        const list = grab ? objs.filter((o) => o !== grab.o).concat(grab.o) : objs;

        for (const o of list) {
            if (!o.moved) continue;
            o.moved = false;
            const { cols, nx, ny, buf, px, py, dx, dy } = o;
            const span = 2 * o.cw;
            for (let j = 0; j <= ny; j++) {
                for (let i = 0; i <= nx; i++) {
                    const k = j * cols + i;
                    buf[k * 3] = px[k] + dx[k];
                    buf[k * 3 + 1] = py[k] + dy[k] + o.off;
                    let div = 0;
                    if (i > 0 && i < nx) div += (dx[k + 1] - dx[k - 1]) / span;
                    if (j > 0 && j < ny) div += (dy[k + cols] - dy[k - cols]) / span;
                    buf[k * 3 + 2] = clamp(-div * 1.4, -1, 1);
                }
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, o.pos);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, buf);
        }

        const pass = (shadow) => {
            gl.uniform1f(loc.shadow, shadow ? 1 : 0);
            if (shadow) gl.uniform4f(loc.tint, shade[0], shade[1], shade[2], 1);
            for (const o of list) {
                gl.uniform2f(loc.off, 0, shadow ? o.sx : 0);
                gl.bindTexture(gl.TEXTURE_2D, o.tex.gl);
                gl.bindBuffer(gl.ARRAY_BUFFER, o.pos);
                gl.vertexAttribPointer(loc.p, 3, gl.FLOAT, false, 0, 0);
                gl.bindBuffer(gl.ARRAY_BUFFER, o.uvb);
                gl.vertexAttribPointer(loc.uv, 2, gl.FLOAT, false, 0, 0);
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.ib);
                gl.drawElements(gl.TRIANGLES, o.count, gl.UNSIGNED_SHORT, 0);
            }
        };
        pass(true);
        pass(false);
    }

    let lastT = 0;
    let acc = 0;
    let raf = 0;
    function frame(t) {
        raf = 0;
        const dt = Math.min(1 / 30, lastT ? (t - lastT) / 1000 : 1 / 60);
        lastT = t;
        acc += dt;
        // Only bodies that are moving get stepped; a still one goes to sleep until something touches it.
        let n = 0;
        while (acc >= P.dt && n < 4) {
            for (const o of objs) {
                if (o.falling) { o.awake = true; fall(o, P.dt); }
                if (!o.awake) continue;
                const e = step(o, P.dt);
                o.moved = true;
                if (e < 0.04 && !o.falling && !(grab && grab.o === o)) o.awake = false;
            }
            acc -= P.dt;
            n++;
        }
        if (n === 4) acc = 0;
        draw();
        if (!objs.some((o) => o.awake || o.falling) && !grab) {
            lastT = 0;
            acc = 0;
            return;
        }
        raf = requestAnimationFrame(frame);
    }
    function wake() {
        if (!raf) raf = requestAnimationFrame(frame);
    }

    // ===== INPUT =====
    const local = (e) => {
        const r = stage.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    stage.addEventListener('pointerdown', (e) => {
        sfx.unlock();
        lastInput = performance.now();
        suppressClick = false;
        if (e.button > 0 || !objs.length) return;
        const p = local(e);
        const h = hit(p.x, p.y);
        if (h) {
            if (e.pointerType === 'mouse') e.preventDefault();
            const o = h.o;
            const sig = o.kind === 'tile' ? o.size * 0.4 : em * 0.22;
            for (let k = 0; k < o.n; k++) {
                const ddx = o.px[k] - h.r.x, ddy = o.py[k] - h.r.y;
                const base = o.kind === 'letter' ? 1 - 0.9 * ((o.py[k] - o.y) / o.h) ** 3 : 1;
                o.wt[k] = Math.exp(-(ddx * ddx + ddy * ddy) / (2 * sig * sig)) * base;
            }
            const k0 = clamp(Math.round((h.r.y - o.y) / o.ch_), 0, o.ny) * o.cols + clamp(Math.round((h.r.x - o.x) / o.cw), 0, o.nx);
            o.awake = true;
            grab = { o, id: e.pointerId, sx: p.x, sy: p.y, bx: o.dx[k0], by: o.dy[k0], tx: o.dx[k0], ty: o.dy[k0], moved: false, k: 0, p };
            stage.classList.add('grabbing');
            sfx.squish();
            wake();
        } else if (!e.target.closest('a, button')) {
            poke(p.x, p.y, 1);
            sfx.plop();
        }
    });

    window.addEventListener('pointermove', (e) => {
        const p = local(e);
        if (grab && e.pointerId === grab.id) {
            const ddx = p.x - grab.sx, ddy = p.y - grab.sy;
            const len = Math.hypot(ddx, ddy);
            if (!grab.moved && len > 7) {
                grab.moved = true;
                suppressClick = true;
            }
            const max = grab.o.kind === 'tile' ? grab.o.size * 1.3 : em * 0.85;
            const s = len > 0.001 ? (max * Math.tanh(len / max)) / len : 0;
            grab.tx = grab.bx + ddx * s;
            grab.ty = grab.by + ddy * s;
            grab.k = Math.tanh(len / max);
            grab.p = p;
            lastInput = performance.now();
            wake();
            return;
        }
        if (e.pointerType === 'mouse' && objs.length) {
            smear(p.x, p.y, e.timeStamp);
            const h = hit(p.x, p.y);
            stage.classList.toggle('over', !!h && h.o.kind === 'letter');
            lastInput = performance.now();
        }
    });

    function release(e) {
        if (!grab || e.pointerId !== grab.id) return;
        const g = grab;
        grab = null;
        stage.classList.remove('grabbing');
        if (g.moved) sfx.boing(g.k);
        else {
            poke(g.p.x, g.p.y, 0.8);
            sfx.plop();
        }
        wake();
    }
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);

    // A drag on an icon is not a tap on its link.
    games.forEach((el) => el.addEventListener('click', (e) => {
        if (suppressClick) {
            e.preventDefault();
            suppressClick = false;
        }
    }));

    // Type a letter of the name and that letter jumps; any other key ripples the lot.
    window.addEventListener('keydown', (e) => {
        if (e.metaKey || e.ctrlKey || e.altKey || e.repeat || !objs.length) return;
        if (e.key.length !== 1 || e.target.closest('a, button, input, textarea')) return;
        sfx.unlock();
        const k = e.key.toLowerCase();
        const match = objs.filter((o) => o.ch === k);
        if (match.length) match.forEach((o) => blub(o, -1.3));
        else wave(0.7, 0.035);
        lastInput = performance.now();
    });

    // Left alone, it wiggles now and then.
    let idleCount = 0;
    function idle() {
        setTimeout(idle, rand(2200, 4200));
        if (calm.matches || document.hidden || grab || !objs.length) return;
        if (performance.now() - lastInput < 2500) return;
        if (objs.some((o) => o.falling)) return;
        idleCount++;
        if (idleCount % 4 === 0) wave(0.55, 0.06);
        else blub(objs[Math.floor(Math.random() * objs.length)], rand(0.5, 0.9) * (Math.random() < 0.3 ? -1 : 1));
    }

    let jellyReflavor = () => {
        objs.forEach((o) => { if (o.kind === 'letter') { paintLetter(o); upload(o); } });
        if (!calm.matches) wave(0.8, 0.04);
        wake();
    };
    jelly = { reflavor: () => jellyReflavor() };

    // ===== BOOT =====
    const fontReady = document.fonts && document.fonts.load
        ? Promise.race([document.fonts.load(`800 100px Sniglet`), new Promise((r) => setTimeout(r, 2500))])
        : Promise.resolve();
    const imagesReady = Promise.all(games.map((el) => {
        const img = el.querySelector('img');
        return img.decode ? img.decode().catch(() => {}) : Promise.resolve();
    }));

    // The HTML wordmark paints first; the jelly takes over once the page has loaded and the main thread is free.
    const pageLoaded = new Promise((r) => (document.readyState === 'complete' ? r() : window.addEventListener('load', r, { once: true })));
    const idleNow = () => new Promise((r) => (window.requestIdleCallback ? requestIdleCallback(r, { timeout: 1200 }) : setTimeout(r, 200)));
    Promise.all([fontReady, imagesReady, pageLoaded]).then(idleNow).then(() => {
        const r0 = stage.getBoundingClientRect();
        let size = [r0.width, r0.height];
        build(true);
        setTimeout(idle, 4000);
        let rt = 0;
        new ResizeObserver(() => {
            clearTimeout(rt);
            rt = setTimeout(() => {
                const r = stage.getBoundingClientRect();
                if (Math.abs(r.width - size[0]) < 1 && Math.abs(r.height - size[1]) < 1) return;
                size = [r.width, r.height];
                build(false);
            }, 120);
        }).observe(stage);
    });

    canvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        stage.classList.remove('live');
        objs = [];
    });
})();
