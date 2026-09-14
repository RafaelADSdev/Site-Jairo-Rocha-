import {soproExplorerScenes, soproExplorerImage, type ExplorerPoint, type ExplorerScene} from '../data/sopro-explorer';

const shell = document.querySelector<HTMLElement>('#sopro-viewer');
if (shell) {
  const section = shell.closest<HTMLElement>('#modelo')!;
  const find = <T extends Element = HTMLElement>(selector: string) => section.querySelector<T>(selector)!;
  const mount = find('#sopro-model-host');
  const cover = find('[data-explorer-cover]');
  const loading = find('.sx-loading');
  const error = find('.sx-error');
  const sceneButtons = [...section.querySelectorAll<HTMLButtonElement>('[data-explorer-scene]')];
  let scene: ExplorerScene = soproExplorerScenes[0];
  let request = 0;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let model: HTMLElement | undefined;
  let pointIndex = 0;
  let visible = false;
  const sourceUrls = new Map<string, string>();
  const updateImage = (img: HTMLImageElement, src: string) => {
    const responsive = soproExplorerImage(src, img.sizes);
    img.srcset = responsive.srcset;
    img.src = responsive.src;
  };

  const state = (value: 'idle' | 'loading' | 'ready' | 'error') => {
    shell.dataset.modelState = value;
    shell.setAttribute('aria-busy', String(value === 'loading'));
    cover.hidden = value !== 'idle';
    loading.hidden = value !== 'loading';
    error.hidden = value !== 'error';
    mount.hidden = value === 'idle' || value === 'error';
    find<HTMLButtonElement>('[data-explorer-reset]').disabled = value !== 'ready';
    find<HTMLButtonElement>('[data-explorer-top]').disabled = value !== 'ready';
    find<HTMLButtonElement>('[data-explorer-focus]').disabled = value !== 'ready';
    document.body.classList.toggle('sopro-model-active', visible && value === 'ready');
  };
  const selectPoint = (index: number) => {
    pointIndex = index;
    const point = scene.points[index];
    find('[data-point-number]').textContent = `${String(index + 1).padStart(2, '0')} · Em destaque`;
    find('[data-point-title]').textContent = point.title;
    find('[data-point-body]').textContent = point.body;
    find('[data-point-details]').replaceChildren(...point.details.map((text) => { const li = document.createElement('li'); li.textContent = text; return li; }));
    const img = find<HTMLImageElement>('[data-point-image]');
    updateImage(img, point.image);
    img.alt = `${point.imageLabel}: ${point.title}`;
    find<HTMLAnchorElement>('[data-point-image-link]').href = point.image;
    find('[data-point-image-caption]').textContent = `${point.imageLabel} ↗`;
    section.querySelectorAll<HTMLButtonElement>('[data-point-index]').forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.pointIndex) === index)));
  };
  const pointButton = (point: ExplorerPoint, index: number, hotspot = false) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.pointIndex = String(index);
    button.setAttribute('aria-pressed', String(index === pointIndex));
    if (hotspot) {
      button.className = 'sx-hotspot';
      button.slot = `hotspot-${point.id}`;
      button.dataset.position = point.position;
      button.dataset.normal = '0 1 0';
      button.dataset.visibilityAttribute = 'visible';
      button.textContent = String(index + 1).padStart(2, '0');
      button.setAttribute('aria-label', `${index + 1}. ${point.title}. Ver detalhes`);
      button.title = point.title;
    } else {
      const number = document.createElement('span');
      number.textContent = String(index + 1).padStart(2, '0');
      button.append(number, document.createTextNode(point.title));
    }
    button.addEventListener('click', () => selectPoint(index));
    return button;
  };
  const selectScene = (id: string, focus = false) => {
    request++;
    clearTimeout(timeout);
    model?.remove();
    model = undefined;
    mount.replaceChildren();
    scene = soproExplorerScenes.find((entry) => entry.id === id) ?? soproExplorerScenes[0];
    shell.dataset.scene = scene.id;
    sceneButtons.forEach((button) => {
      const active = button.dataset.explorerScene === scene.id;
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
      if (active && focus) button.focus();
    });
    find('[data-scene-eyebrow]').textContent = scene.eyebrow;
    find('[data-scene-title]').textContent = scene.title;
    find('[data-scene-description]').textContent = scene.description;
    find('[data-cover-title]').textContent = scene.title;
    updateImage(find<HTMLImageElement>('[data-cover-image]'), scene.image);
    find<HTMLImageElement>('[data-cover-image]').alt = `Referência oficial para ${scene.title}`;
    find<HTMLAnchorElement>('[data-scene-plan]').href = scene.plan;
    find<HTMLAnchorElement>('[data-scene-book]').href = `/books/sopro.pdf#page=${scene.bookPage}`;
    find('[data-scene-book]').textContent = `Book oficial · página ${scene.bookPage} ↗`;
    find('[data-explorer-points]').replaceChildren(...scene.points.map((point, index) => pointButton(point, index)));
    selectPoint(0);
    find('[data-explorer-top]').setAttribute('aria-pressed', 'false');
    state('idle');
  };
  const camera = (top = false) => {
    if (!model) return;
    const orbit = (top ? scene.topOrbit : scene.orbit).split(' ');
    // Long single-unit plans need extra distance in portrait canvases.
    if (scene.id !== 'bloco' && window.matchMedia('(max-width: 780px)').matches) {
      orbit[2] = `${parseFloat(orbit[2]) * 1.45}m`;
    }
    model.setAttribute('camera-target', scene.target);
    model.setAttribute('camera-orbit', orbit.join(' '));
    model.setAttribute('field-of-view', scene.id === 'bloco' ? '32deg' : '35deg');
    find('[data-explorer-top]').setAttribute('aria-pressed', String(top));
  };
  const open = async () => {
    if (shell.dataset.modelState === 'loading') return;
    const token = ++request;
    const selected = scene;
    clearTimeout(timeout);
    model?.remove();
    mount.replaceChildren();
    state('loading');
    find<HTMLProgressElement>('progress').value = 0;
    find('[data-progress-copy]').textContent = 'Carregando o visualizador…';
    const valid = () => token === request && selected.id === scene.id;
    const fail = () => {
      if (!valid()) return;
      clearTimeout(timeout);
      request++;
      sourceUrls.set(selected.id, `${selected.src}${selected.src.includes('?') ? '&' : '?'}retry=${Date.now()}`);
      model?.remove();
      model = undefined;
      state('error');
    };
    timeout = setTimeout(fail, 45_000);
    try {
      await import('@google/model-viewer');
      if (!valid() || shell.dataset.modelState !== 'loading') return;
      const ModelViewer = customElements.get('model-viewer') as CustomElementConstructor & {dracoDecoderLocation: string};
      ModelViewer.dracoDecoderLocation = '/vendor/draco/';
      const element = document.createElement('model-viewer');
      model = element;
      element.id = 'sopro-model';
      element.setAttribute('alt', `${selected.title}. Modelo comercial em 3D. Use os pontos numerados ou a lista para conhecer cada ambiente.`);
      element.setAttribute('camera-controls', '');
      element.setAttribute('touch-action', 'pan-y');
      element.setAttribute('loading', 'eager');
      element.setAttribute('reveal', 'auto');
      element.setAttribute('shadow-intensity', '1');
      element.setAttribute('shadow-softness', '.8');
      element.setAttribute('exposure', '1.05');
      element.setAttribute('min-camera-orbit', 'auto 0deg 4m');
      element.setAttribute('max-camera-orbit', 'auto 88deg 42m');
      element.setAttribute('interaction-prompt', 'none');
      camera();
      element.append(...selected.points.map((point, index) => pointButton(point, index, true)));
      element.addEventListener('load', () => { if (!valid()) return; clearTimeout(timeout); state('ready'); }, {once: true});
      element.addEventListener('error', fail, {once: true});
      element.addEventListener('progress', (event) => {
        if (!valid()) return;
        const value = Math.round(((event as CustomEvent).detail.totalProgress ?? 0) * 100);
        find<HTMLProgressElement>('progress').value = value;
        find('[data-progress-copy]').textContent = `${value}% · ${selected.title}`;
      });
      // Reuse the recovered URL across scene switches; the original failure remains in the renderer cache.
      element.setAttribute('src', sourceUrls.get(selected.id) ?? selected.src);
      mount.append(element);
    } catch { fail(); }
  };
  sceneButtons.forEach((button, index) => {
    button.addEventListener('click', () => { if (scene.id !== button.dataset.explorerScene) selectScene(button.dataset.explorerScene!); });
    button.addEventListener('keydown', (event) => {
      const offsets: Record<string, number> = {ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1};
      let next: number;
      if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = sceneButtons.length - 1;
      else if (event.key in offsets) next = (index + offsets[event.key] + sceneButtons.length) % sceneButtons.length;
      else return;
      event.preventDefault();
      selectScene(sceneButtons[next].dataset.explorerScene!, true);
    });
  });
  find('#sopro-model-load').addEventListener('click', open);
  window.matchMedia('(max-width: 780px)').addEventListener('change', () => {
    if (shell.dataset.modelState === 'ready') camera();
  });
  find('#sopro-model-retry').addEventListener('click', open);
  find('[data-explorer-reset]').addEventListener('click', () => camera());
  find('[data-explorer-focus]').addEventListener('click', () => {
    if (!model) return;
    model.setAttribute('camera-target', scene.points[pointIndex].position);
    model.setAttribute('camera-orbit', scene.id === 'bloco' ? '90deg 65deg 14m' : '155deg 40deg 8m');
    find('[data-explorer-top]').setAttribute('aria-pressed', 'false');
  });
  find('[data-explorer-top]').addEventListener('click', () => camera(find('[data-explorer-top]').getAttribute('aria-pressed') !== 'true'));
  const fullscreen = find<HTMLButtonElement>('[data-explorer-fullscreen]');
  fullscreen.hidden = !document.fullscreenEnabled || !shell.requestFullscreen;
  fullscreen.addEventListener('click', async () => {
    try { if (document.fullscreenElement === shell) await document.exitFullscreen(); else await shell.requestFullscreen(); }
    catch { fullscreen.hidden = true; }
  });
  document.addEventListener('fullscreenchange', () => {
    const active = document.fullscreenElement === shell;
    fullscreen.setAttribute('aria-pressed', String(active));
    fullscreen.textContent = active ? 'Sair da tela cheia' : 'Tela cheia';
  });
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; document.body.classList.toggle('sopro-model-active', visible && shell.dataset.modelState === 'ready'); }, {threshold: .15}).observe(shell);
  selectScene(scene.id);
}
