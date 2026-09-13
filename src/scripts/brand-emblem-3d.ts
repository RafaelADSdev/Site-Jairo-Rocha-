type Disposable = {dispose: () => void};

/** The red emblem is decorative; the complete brand remains in the header. */
export function initBrandEmblems() {
  document.querySelectorAll<HTMLElement>('[data-brand-emblem]').forEach(initEmblem);
}

function initEmblem(root: HTMLElement) {
  if (root.dataset.brandBound) return;
  root.dataset.brandBound = 'true';
  const stage = root.querySelector<HTMLElement>('[data-brand-stage]')!;
  const button = root.querySelector<HTMLButtonElement>('[data-brand-toggle]')!;
  const label = root.querySelector<HTMLElement>('[data-brand-label]')!;
  const status = root.querySelector<HTMLElement>('[data-brand-status]')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 780px)');
  let requested = false;
  let userPaused = false;
  let visible = false;
  let loading = false;
  let disposed = false;
  let frame = 0;
  let idle = 0;
  let previousTime = 0;
  let angle = -.25;
  let render: (() => void) | undefined;
  let resize: (() => void) | undefined;
  const resources: Disposable[] = [];
  let resizeObserver: ResizeObserver | undefined;

  const setState = (state: string, text: string, announcement = '') => {
    root.dataset.brandState = state;
    label.textContent = text;
    button.setAttribute('aria-label', text);
    button.disabled = state === 'loading' || (state === 'paused' && reduced.matches);
    if (announcement) status.textContent = announcement;
  };
  const canMove = () => !!render && visible && !document.hidden && !userPaused && !reduced.matches && !disposed;
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
  };
  const animate = (time: number) => {
    frame = 0;
    if (!canMove()) {
      // A media-query change can be observed by RAF before its change event.
      if (reduced.matches) userPaused = true;
      sync();
      return;
    }
    const elapsed = previousTime ? Math.min((time - previousTime) / 1000, .05) : 0;
    previousTime = time;
    angle += elapsed * Math.PI * 2 / 16;
    render!();
    frame = requestAnimationFrame(animate);
  };
  const sync = () => {
    stop();
    if (!render || disposed) return;
    render();
    if (canMove()) {
      setState('ready', 'Pausar giro 3D');
      frame = requestAnimationFrame(animate);
    } else {
      setState('paused', reduced.matches ? 'Símbolo 3D estático' : userPaused ? 'Retomar giro 3D' : 'Pausar giro 3D');
    }
  };

  const initialize = async () => {
    if (loading || render || disposed) return;
    loading = true;
    setState('loading', 'Carregando símbolo 3D');
    try {
      // No renderer or Three.js download until desktop idle/visibility, or explicit opt-in.
      const THREE = await import('three');
      if (disposed) return;
      const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true, powerPreference: 'low-power'});
      resources.push(renderer);
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      // Preserve the brand red instead of filmic tone mapping shifting it coral.
      renderer.toneMapping = THREE.NoToneMapping;
      renderer.domElement.dataset.brandCanvas = '';
      renderer.domElement.setAttribute('aria-hidden', 'true');
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, .1, 30);
      camera.position.set(0, 0, 4.6);
      const emblem = new THREE.Group();
      emblem.rotation.x = -.13;
      emblem.rotation.z = -.1;
      scene.add(emblem);
      const shape = new THREE.Shape();
      shape.absarc(0, 0, 1, 0, Math.PI * 2, false);
      const hole = new THREE.Path();
      hole.absarc(0, 0, .70, 0, Math.PI * 2, true);
      shape.holes.push(hole);
      const disc = new THREE.Shape();
      disc.absarc(0, 0, .37, 0, Math.PI * 2, false);
      const material = new THREE.MeshStandardMaterial({color: 0xe90012, metalness: .25, roughness: .30});
      resources.push(material);
      for (const outline of [shape, disc]) {
        const geometry = new THREE.ExtrudeGeometry(outline, {depth: .17, bevelEnabled: true, bevelThickness: .018, bevelSize: .018, bevelSegments: 3, curveSegments: 64, steps: 1});
        geometry.translate(0, 0, -.085);
        resources.push(geometry);
        emblem.add(new THREE.Mesh(geometry, material));
      }
      scene.add(new THREE.HemisphereLight(0xffffff, 0x873c4a, 1.5));
      const key = new THREE.DirectionalLight(0xfff1e5, 3);
      key.position.set(-3, 4, 6);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xffffff, 2);
      rim.position.set(3, 1, -4);
      scene.add(rim);
      render = () => {emblem.rotation.y = angle; renderer.render(scene, camera);};
      resize = () => {const size = Math.max(1, stage.clientWidth); renderer.setSize(size, size, false); render?.();};
      stage.append(renderer.domElement);
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(stage);
      resize();
      renderer.domElement.addEventListener('webglcontextlost', (event) => {
        event.preventDefault();
        fail('A visualização 3D foi interrompida. O símbolo original continua visível.');
      }, {once: true});
      sync();
    } catch {
      fail('Não foi possível abrir o 3D neste dispositivo. O símbolo original continua visível.');
    } finally {
      loading = false;
    }
  };
  const fail = (message: string) => {
    stop();
    render = undefined;
    resizeObserver?.disconnect();
    resources.splice(0).forEach(resource => resource.dispose());
    stage.querySelector('canvas')?.remove();
    setState('error', 'Tentar símbolo 3D novamente', message);
  };
  const autoStart = () => {
    if (requested || render || loading || disposed || !visible || document.hidden || reduced.matches || mobile.matches) return;
    requested = true;
    void initialize();
  };
  const scheduleStart = () => {
    if (idle || requested || disposed) return;
    if ('requestIdleCallback' in window) {
      idle = window.requestIdleCallback(() => {idle = 0; autoStart();}, {timeout: 1800});
    } else {
      idle = window.setTimeout(() => {idle = 0; autoStart();}, 600);
    }
  };
  const toggle = () => {
    requested = true;
    if (!render) {userPaused = reduced.matches; void initialize();}
    else {userPaused = !userPaused; sync();}
  };
  const onPreference = () => {
    if (reduced.matches && render) userPaused = true;
    sync();
    if (!render) scheduleStart();
  };
  const onVisibility = () => {sync(); if (!document.hidden) scheduleStart();};
  const observer = new IntersectionObserver(entries => {
    visible = entries[0]?.isIntersecting ?? false;
    sync();
    if (visible) scheduleStart();
  }, {threshold: .05});
  observer.observe(root);
  button.addEventListener('click', toggle);
  reduced.addEventListener('change', onPreference);
  document.addEventListener('visibilitychange', onVisibility);
  button.disabled = false;
  window.addEventListener('pagehide', () => {
    disposed = true;
    stop();
    if ('cancelIdleCallback' in window) window.cancelIdleCallback(idle);
    else clearTimeout(idle);
    observer.disconnect();
    resizeObserver?.disconnect();
    button.removeEventListener('click', toggle);
    reduced.removeEventListener('change', onPreference);
    document.removeEventListener('visibilitychange', onVisibility);
    resources.splice(0).forEach(resource => resource.dispose());
    stage.querySelector('canvas')?.remove();
    setState('fallback', 'Ativar símbolo 3D');
    button.disabled = true;
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        delete root.dataset.brandBound;
        initEmblem(root);
      }
    }, {once: true});
  }, {once: true});
}
