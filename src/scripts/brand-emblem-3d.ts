type Disposable = {dispose: () => void};

/** Only the target rotates. The original name has a fixed, raster-traced 3D silhouette. */
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
  const wordmark = root.querySelector<HTMLElement>('[data-brand-wordmark]')!;
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
  let angle = -.10;
  let render: (() => void) | undefined;
  let resize: (() => void) | undefined;
  let resizeName: (() => void) | undefined;
  const resources: Disposable[] = [];
  let resizeObserver: ResizeObserver | undefined;

  const setState = (state: string, text: string, announcement = '') => {
    root.dataset.brandState = state;
    label.textContent = text;
    button.setAttribute('aria-label', text);
    button.title = text;
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
    if (previousTime && time - previousTime < 1000 / 24) {
      frame = requestAnimationFrame(animate);
      return;
    }
    const elapsed = previousTime ? Math.min((time - previousTime) / 1000, .1) : 0;
    previousTime = time;
    angle += elapsed * Math.PI * 2 / 20;
    render!();
    frame = requestAnimationFrame(animate);
  };
  const sync = () => {
    stop();
    if (!render || disposed) return;
    render();
    if (canMove()) {
      setState('ready', 'Pausar giro do símbolo 3D');
      frame = requestAnimationFrame(animate);
    } else {
      setState('paused', reduced.matches ? 'Símbolo estático — movimento reduzido' : userPaused ? 'Retomar giro do símbolo 3D' : 'Pausar giro do símbolo 3D');
    }
  };

  const initialize = async () => {
    if (loading || render || disposed) return;
    loading = true;
    setState('loading', 'Carregando símbolo 3D');
    try {
      // Load after idle/visibility; reduced-motion visitors retain the complete static logo.
      const THREE = await import('three');
      const logo = new Image();
      logo.src = '/images/logo.webp';
      await logo.decode();
      if (disposed) return;
      const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true, powerPreference: 'low-power'});
      resources.push(renderer);
      renderer.setPixelRatio(Math.min(devicePixelRatio, mobile.matches ? 1.25 : 1.5));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      // Preserve the brand red instead of filmic tone mapping shifting it coral.
      renderer.toneMapping = THREE.NoToneMapping;
      renderer.domElement.dataset.brandCanvas = '';
      renderer.domElement.setAttribute('aria-hidden', 'true');
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1.10, 1.10, 1.10, -1.10, .1, 30);
      camera.position.set(0, 0, 5);
      const emblem = new THREE.Group();
      emblem.rotation.x = -.055;
      scene.add(emblem);
      const shape = new THREE.Shape();
      shape.absarc(0, 0, 1, 0, Math.PI * 2, false);
      const hole = new THREE.Path();
      hole.absarc(0, 0, .70, 0, Math.PI * 2, true);
      shape.holes.push(hole);
      const disc = new THREE.Shape();
      disc.absarc(0, 0, .37, 0, Math.PI * 2, false);
      const redMaterial = new THREE.MeshStandardMaterial({color: 0xe90012, metalness: .25, roughness: .30});
      resources.push(redMaterial);
      for (const outline of [shape, disc]) {
        const geometry = new THREE.ExtrudeGeometry(outline, {depth: .17, bevelEnabled: true, bevelThickness: .018, bevelSize: .018, bevelSegments: 3, curveSegments: 48, steps: 1});
        geometry.translate(0, 0, -.085);
        resources.push(geometry);
        emblem.add(new THREE.Mesh(geometry, redMaterial));
      }

      // Build a stationary shallow extrusion from the exact black pixels of the original name.
      // The original transparent artwork remains on its front, preserving all small captions.
      const artwork = document.createElement('canvas');
      artwork.width = 132;
      artwork.height = 67;
      const context = artwork.getContext('2d', {willReadFrequently: true});
      if (!context) throw new Error('Canvas 2D is unavailable');
      context.drawImage(logo, 54, 0, 132, 67, 0, 0, 132, 67);
      const pixels = context.getImageData(0, 0, 132, 67).data;
      const vertices: number[] = [];
      const quad = (...points: number[][]) => {
        for (const index of [0, 1, 2, 0, 2, 3]) vertices.push(...points[index]);
      };
      const darkPixel = (x: number, y: number) => {
        const index = (y * 132 + x) * 4;
        return pixels[index + 3] > 96 && pixels[index] + pixels[index + 1] + pixels[index + 2] < 330;
      };
      let runCount = 0;
      for (let row = 0; row < 67; row++) {
        let x = 0;
        while (x < 132) {
          if (!darkPixel(x, row)) {x++; continue;}
          const from = x;
          while (x < 132 && darkPixel(x, row)) x++;
          const l = from - 66;
          const r = x - 66;
          const t = 33.5 - row;
          const b = t - 1;
          const d = 1.8;
          quad([l,b,d],[r,b,d],[r,t,d],[l,t,d]);
          quad([r,b,0],[l,b,0],[l,t,0],[r,t,0]);
          quad([r,b,d],[r,b,0],[r,t,0],[r,t,d]);
          quad([l,b,0],[l,b,d],[l,t,d],[l,t,0]);
          quad([l,t,d],[r,t,d],[r,t,0],[l,t,0]);
          quad([l,b,0],[r,b,0],[r,b,d],[l,b,d]);
          runCount++;
        }
      }
      if (!runCount) throw new Error('The original wordmark silhouette is unavailable');
      const nameGeometry = new THREE.BufferGeometry();
      nameGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      nameGeometry.computeVertexNormals();
      const nameMaterial = new THREE.MeshStandardMaterial({color: 0x171717, metalness: .12, roughness: .35});
      const nameTexture = new THREE.CanvasTexture(artwork);
      nameTexture.colorSpace = THREE.SRGBColorSpace;
      const nameFaceGeometry = new THREE.PlaneGeometry(132, 67);
      const nameFaceMaterial = new THREE.MeshBasicMaterial({map: nameTexture, transparent: true, alphaTest: .015, toneMapped: false});
      resources.push(nameGeometry, nameMaterial, nameTexture, nameFaceGeometry, nameFaceMaterial);
      const nameScene = new THREE.Scene();
      const nameGroup = new THREE.Group();
      nameGroup.rotation.y = -.09;
      nameGroup.rotation.x = -.055;
      nameGroup.add(new THREE.Mesh(nameGeometry, nameMaterial));
      const nameFront = new THREE.Mesh(nameFaceGeometry, nameFaceMaterial);
      nameFront.position.z = 1.82;
      nameGroup.add(nameFront);
      nameScene.add(nameGroup, new THREE.HemisphereLight(0xffffff, 0x5c5360, 2.0));
      const nameLight = new THREE.DirectionalLight(0xffffff, 3);
      nameLight.position.set(-40, 60, 150);
      nameScene.add(nameLight);
      const nameCamera = new THREE.OrthographicCamera(-68, 68, 34.5, -34.5, .1, 500);
      nameCamera.position.z = 180;
      const nameRenderer = new THREE.WebGLRenderer({alpha: true, antialias: true, powerPreference: 'low-power'});
      resources.push(nameRenderer);
      nameRenderer.setPixelRatio(Math.min(devicePixelRatio, mobile.matches ? 1.5 : 2));
      nameRenderer.setClearColor(0x000000, 0);
      nameRenderer.outputColorSpace = THREE.SRGBColorSpace;
      nameRenderer.domElement.dataset.brandNameCanvas = '';
      nameRenderer.domElement.dataset.brandNameGeometry = 'raster-silhouette-extrusion';
      nameRenderer.domElement.setAttribute('aria-hidden', 'true');
      nameRenderer.domElement.dataset.brandNameRuns = String(runCount);
      resizeName = () => {
        nameRenderer.setSize(Math.max(1, wordmark.clientWidth), Math.max(1, wordmark.clientHeight), false);
        nameRenderer.render(nameScene, nameCamera);
      };
      wordmark.append(nameRenderer.domElement);
      resizeName();
      root.dataset.brandNameReady = 'true';
      nameRenderer.domElement.addEventListener('webglcontextlost', (event) => {
        event.preventDefault();
        fail('A visualização 3D foi interrompida. A marca original continua visível.');
      }, {once: true});
      scene.add(new THREE.HemisphereLight(0xffffff, 0x873c4a, 1.5));
      const key = new THREE.DirectionalLight(0xfff1e5, 3);
      key.position.set(-3, 4, 6);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xffffff, 2);
      rim.position.set(3, 1, -4);
      scene.add(rim);
      render = () => {emblem.rotation.y = angle; renderer.render(scene, camera);};
      resize = () => {
        const stageWidth = Math.max(1, stage.clientWidth);
        const stageHeight = Math.max(44, stage.clientHeight);
        const aspect = stageWidth / stageHeight;
        camera.left = -1.10 * aspect;
        camera.right = 1.10 * aspect;
        camera.updateProjectionMatrix();
        renderer.setSize(stageWidth, stageHeight, false);
        render?.();
      };
      stage.append(renderer.domElement);
      resizeObserver = new ResizeObserver(() => {resize?.(); resizeName?.();});
      resizeObserver.observe(stage);
      resizeObserver.observe(wordmark);
      resize();
      renderer.domElement.addEventListener('webglcontextlost', (event) => {
        event.preventDefault();
        fail('A visualização 3D foi interrompida. A logo completa continua visível.');
      }, {once: true});
      sync();
    } catch {
      fail('Não foi possível abrir o 3D neste dispositivo. A logo completa continua visível.');
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
    wordmark.querySelector('canvas')?.remove();
    delete root.dataset.brandNameReady;
    setState('error', 'Tentar símbolo 3D novamente', message);
  };
  const autoStart = () => {
    if (requested || render || loading || disposed || !visible || document.hidden || reduced.matches) return;
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
    wordmark.querySelector('canvas')?.remove();
    delete root.dataset.brandNameReady;
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
