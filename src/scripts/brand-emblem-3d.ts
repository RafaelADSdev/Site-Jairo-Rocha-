type Disposable = {dispose: () => void};

/** Original complete wordmark and anniversary artwork on a real beveled 3D sign. */
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
  let angle = -.10;
  let render: (() => void) | undefined;
  let resize: (() => void) | undefined;
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
      setState('ready', 'Pausar giro da logo 3D');
      frame = requestAnimationFrame(animate);
    } else {
      setState('paused', reduced.matches ? 'Logo 3D estática — movimento reduzido' : userPaused ? 'Retomar giro da logo 3D' : 'Pausar giro da logo 3D');
    }
  };

  const initialize = async () => {
    if (loading || render || disposed) return;
    loading = true;
    setState('loading', 'Carregando logo completa em 3D');
    try {
      // Load after idle/visibility; reduced-motion visitors retain the complete static logo.
      const THREE = await import('three');
      const logo = new Image();
      logo.src = '/images/logo.webp';
      await Promise.all([logo.decode(), document.fonts.load('700 230px Manrope'), document.fonts.load('400 82px Manrope')]);
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
      const camera = new THREE.OrthographicCamera(-2, 2, .625, -.625, .1, 30);
      camera.position.set(0, 0, 5);
      const emblem = new THREE.Group();
      emblem.rotation.x = -.035;
      scene.add(emblem);
      // The original raster wordmark is preserved, not approximated with a substitute font.
      const artwork = document.createElement('canvas');
      artwork.width = 1536;
      artwork.height = 440;
      const context = artwork.getContext('2d');
      if (!context) throw new Error('Canvas 2D is unavailable');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, artwork.width, artwork.height);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(logo, 70, 54, 925, 333);
      context.fillStyle = '#d0ceca';
      context.fillRect(1060, 65, 3, 308);
      context.fillStyle = '#856a24';
      context.textAlign = 'center';
      context.font = '700 230px Manrope';
      context.fillText('40', 1273, 266);
      context.font = 'italic 400 82px Manrope';
      context.fillText('anos', 1278, 365);
      const texture = new THREE.CanvasTexture(artwork);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
      resources.push(texture);

      const width = 3.6;
      const height = width * artwork.height / artwork.width;
      const radius = .07;
      const left = -width / 2;
      const bottom = -height / 2;
      const shape = new THREE.Shape();
      shape.moveTo(left + radius, bottom);
      shape.lineTo(left + width - radius, bottom);
      shape.quadraticCurveTo(left + width, bottom, left + width, bottom + radius);
      shape.lineTo(left + width, bottom + height - radius);
      shape.quadraticCurveTo(left + width, bottom + height, left + width - radius, bottom + height);
      shape.lineTo(left + radius, bottom + height);
      shape.quadraticCurveTo(left, bottom + height, left, bottom + height - radius);
      shape.lineTo(left, bottom + radius);
      shape.quadraticCurveTo(left, bottom, left + radius, bottom);
      const volume = new THREE.ExtrudeGeometry(shape, {depth: .12, bevelEnabled: true, bevelThickness: .016, bevelSize: .016, bevelSegments: 3, curveSegments: 12, steps: 1});
      volume.translate(0, 0, -.06);
      const edgeMaterial = new THREE.MeshStandardMaterial({color: 0xf4f1eb, metalness: .22, roughness: .3});
      resources.push(volume, edgeMaterial);
      emblem.add(new THREE.Mesh(volume, edgeMaterial));
      const faceGeometry = new THREE.ShapeGeometry(shape, 12);
      const positions = faceGeometry.attributes.position;
      const uv = faceGeometry.attributes.uv;
      for (let index = 0; index < positions.count; index++) {
        uv.setXY(index, (positions.getX(index) + width / 2) / width, (positions.getY(index) + height / 2) / height);
      }
      uv.needsUpdate = true;
      // Printed front/back artwork stays readable; the plaque, not the letters, is extruded.
      const faceMaterial = new THREE.MeshBasicMaterial({map: texture, toneMapped: false});
      resources.push(faceGeometry, faceMaterial);
      const front = new THREE.Mesh(faceGeometry, faceMaterial);
      front.position.z = .078;
      emblem.add(front);
      const back = new THREE.Mesh(faceGeometry, faceMaterial);
      back.rotation.y = Math.PI;
      back.position.z = -.078;
      emblem.add(back);
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
        camera.left = -.625 * aspect;
        camera.right = .625 * aspect;
        camera.updateProjectionMatrix();
        renderer.setSize(stageWidth, stageHeight, false);
        render?.();
      };
      stage.append(renderer.domElement);
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(stage);
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
    setState('error', 'Tentar logo completa em 3D novamente', message);
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
    setState('fallback', 'Ativar logo completa em 3D');
    button.disabled = true;
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        delete root.dataset.brandBound;
        initEmblem(root);
      }
    }, {once: true});
  }, {once: true});
}
