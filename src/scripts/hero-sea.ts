const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
uniform sampler2D u_image;
uniform float u_time;
uniform float u_awake;
varying vec2 v_uv;

void main() {
  vec2 uv = vec2(v_uv.x, 1.0 - v_uv.y);
  vec4 src = texture2D(u_image, uv);
  vec3 c = src.rgb;

  float teal = (c.b * 1.08 + c.g * 0.32) - c.r;
  float water = smoothstep(0.04, 0.15, teal);
  float foliage = smoothstep(0.018, 0.07, c.g - c.b) * smoothstep(0.012, 0.055, c.g - c.r);
  water *= 1.0 - foliage;
  float foam = smoothstep(0.58, 0.8, (c.r + c.g + c.b) / 3.0) * water;
  water *= u_awake;

  float t = u_time;
  float swell =
      sin(uv.x * 16.0 + uv.y * 10.0 + t * 0.95) * 0.0078
    + sin(uv.x * 7.2 - uv.y * 14.0 + t * 0.62) * 0.0056
    + sin(uv.y * 26.0 + uv.x * 5.0 + t * 1.35) * 0.0028;
  vec2 along = vec2(0.82, 0.26);
  vec2 ashore = vec2(-0.42, 0.14);
  vec2 offset = (along * swell + ashore * sin(uv.x * 13.0 + t * 0.8) * 0.0032) * water;
  offset += vec2(0.08, -0.62) * sin(uv.x * 36.0 + uv.y * 20.0 + t * 1.7) * 0.004 * foam * u_awake;

  vec2 sampleUv = clamp(uv + offset, 0.001, 0.999);
  vec4 moved = texture2D(u_image, sampleUv);
  vec4 color = mix(src, moved, clamp(water, 0.0, 1.0));
  float light = sin(uv.x * 11.0 + uv.y * 8.0 + t * 0.88) * 0.022
              + sin(uv.x * 24.0 - uv.y * 6.0 + t * 1.15) * 0.012;
  color.rgb += water * light * vec3(0.42, 0.68, 0.82);
  gl_FragColor = color;
}`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function parsePos(value: string, fallback: number) {
  if (value === 'center') return 0.5;
  if (value === 'left' || value === 'top') return 0;
  if (value === 'right' || value === 'bottom') return 1;
  if (value.endsWith('%')) return parseFloat(value) / 100;
  return fallback;
}

function objectPosition(img: HTMLImageElement) {
  const parts = getComputedStyle(img).objectPosition.trim().split(/\s+/);
  return {
    x: parsePos(parts[0] ?? 'center', 0.5),
    y: parsePos(parts[1] ?? 'center', 0.55)
  };
}

function paintCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number
) {
  const pos = objectPosition(img);
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(img, (w - dw) * pos.x, (h - dh) * pos.y, dw, dh);
}

function prefersReducedMotion() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function animateHeroSea(hero: HTMLElement) {
  if (prefersReducedMotion()) return;

  const coast = hero.querySelector<HTMLElement>('.hero-slide--coast') ?? hero;
  const img = coast.querySelector<HTMLImageElement>('.hero-image');
  const canvas = coast.querySelector<HTMLCanvasElement>('.hero-sea');
  if (!img || !canvas) return;

  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    powerPreference: 'low-power'
  });
  if (!gl) return;

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;

  const program = gl.createProgram();
  if (!program) return;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.bindAttribLocation(program, 0, 'a_pos');
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  const uTime = gl.getUniformLocation(program, 'u_time');
  const uAwake = gl.getUniformLocation(program, 'u_awake');
  const scratch = document.createElement('canvas');
  const scratchCtx = scratch.getContext('2d', {alpha: false});
  if (!scratchCtx) return;

  let running = false;
  let visible = true;
  let frame = 0;
  let start = 0;
  let awake = 0;

  const upload = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = Math.max(2, Math.round(hero.clientWidth * dpr));
    let h = Math.max(2, Math.round(hero.clientHeight * dpr));
    const cap = 1600;
    if (w > cap) {
      h = Math.round(h * cap / w);
      w = cap;
    }
    if (scratch.width !== w || scratch.height !== h) {
      scratch.width = w;
      scratch.height = h;
    }
    paintCover(scratchCtx, img, w, h);
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, scratch);
  };

  const draw = (now: number) => {
    if (!running) return;
    if (!start) start = now;
    const elapsed = (now - start) / 1000;
    awake = Math.min(1, elapsed / 2.4);
    gl.uniform1f(uTime, elapsed);
    gl.uniform1f(uAwake, awake);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    frame = requestAnimationFrame(draw);
  };

  const coastActive = () => !coast.classList.contains('hero-slide') || coast.classList.contains('is-active');

  const play = () => {
    if (running || !visible || document.hidden || !hero.classList.contains('is-sea') || !coastActive()) return;
    running = true;
    frame = requestAnimationFrame(draw);
  };

  const pause = () => {
    running = false;
    cancelAnimationFrame(frame);
  };

  const reveal = () => {
    gl.uniform1f(uTime, 0);
    gl.uniform1f(uAwake, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    hero.classList.add('is-sea');
    play();
  };

  const startSea = () => {
    try {
      upload();
    } catch {
      return;
    }
    const opening = img.getAnimations?.().find((animation) => animation.animationName === 'hero-open');
    const settle = opening && opening.playState !== 'finished'
      ? Promise.race([
          opening.finished.catch(() => undefined),
          new Promise((resolve) => window.setTimeout(resolve, 1800))
        ])
      : Promise.resolve();
    settle.then(reveal);
  };

  if (img.complete && img.naturalWidth) startSea();
  else img.addEventListener('load', startSea, {once: true});

  const io = new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting);
    if (visible) play();
    else pause();
  }, {threshold: 0.12});
  io.observe(hero);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
    else play();
  });

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const onMotion = () => {
    if (!motion.matches) return;
    pause();
    hero.classList.remove('is-sea');
  };
  motion.addEventListener('change', onMotion);
  const ro = new ResizeObserver(() => {
    cancelAnimationFrame(resizeTick);
    resizeTick = requestAnimationFrame(() => {
      if (!hero.classList.contains('is-sea')) return;
      upload();
    });
  });
  ro.observe(hero);

  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    pause();
    hero.classList.remove('is-sea');
  });

  hero.addEventListener('hero:slide', () => {
    if (coastActive()) play();
    else pause();
  });
}

const hero = document.querySelector<HTMLElement>('.hero');
if (hero) animateHeroSea(hero);
