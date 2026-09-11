// Registro do service worker, aviso de atualização e fluxo de instalação (A2HS).
type InstallEvent = Event & {prompt: () => Promise<void>; userChoice: Promise<{outcome: string}>};

const DISMISS_KEY = 'jr-install-dismissed';
const isStandalone = () =>
  matchMedia('(display-mode: standalone)').matches || (navigator as {standalone?: boolean}).standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

let deferred: InstallEvent | null = null;

const toast = (text: string) => {
  const el = document.querySelector('#toast');
  if (!el) return;
  el.textContent = text;
  el.classList.add('visible');
  setTimeout(() => el.classList.remove('visible'), 3200);
};

const openInfo = (title: string, text: string) => {
  const dialog = document.querySelector<HTMLDialogElement>('#info-dialog');
  if (!dialog) return;
  dialog.querySelector('#info-title')!.textContent = title;
  dialog.querySelector('#info-text')!.textContent = text;
  dialog.showModal();
};

const banner = () => document.querySelector<HTMLElement>('#install-banner');

const showBanner = () => {
  if (isStandalone() || localStorage.getItem(DISMISS_KEY) === '1') return;
  banner()?.classList.add('visible');
};
const hideBanner = () => banner()?.classList.remove('visible');

async function install() {
  if (isStandalone()) {
    toast('Você já está com o portal instalado neste aparelho.');
    return;
  }
  if (deferred) {
    hideBanner();
    await deferred.prompt();
    const {outcome} = await deferred.userChoice;
    deferred = null;
    if (outcome === 'accepted') toast('Instalando o portal no seu aparelho…');
    return;
  }
  if (isIOS()) {
    openInfo(
      'Adicione à tela de início.',
      'No Safari, toque no botão Compartilhar na barra inferior e escolha “Adicionar à Tela de Início”. O portal abre em tela cheia, como um aplicativo.'
    );
    return;
  }
  openInfo(
    'Instale o portal.',
    'No menu do seu navegador, escolha “Instalar aplicativo” ou “Adicionar à tela inicial”. O portal passa a abrir em tela cheia e funciona mesmo com conexão instável.'
  );
}

addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferred = event as InstallEvent;
  setTimeout(showBanner, 8000);
});

addEventListener('appinstalled', () => {
  deferred = null;
  hideBanner();
  localStorage.setItem(DISMISS_KEY, '1');
  toast('Portal instalado. Ele já está na sua tela de início.');
});

document.querySelectorAll('[data-pwa-install]').forEach((el) => el.addEventListener('click', install));
document.querySelector('[data-install-dismiss]')?.addEventListener('click', () => {
  localStorage.setItem(DISMISS_KEY, '1');
  hideBanner();
});

if (isStandalone()) document.documentElement.classList.add('standalone');
addEventListener('offline', () => toast('Você está offline. Mostrando o que já foi carregado.'));

// Em dev o service worker fica fora do caminho para não servir assets antigos sobre o HMR.
if ('serviceWorker' in navigator && window.isSecureContext && !import.meta.env.DEV) {
  addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', {scope: '/'});
      // Só avisa quando há uma versão nova substituindo uma já instalada.
      reg.addEventListener('updatefound', () => {
        const next = reg.installing;
        next?.addEventListener('statechange', () => {
          if (next.state === 'installed' && navigator.serviceWorker.controller) {
            toast('Nova versão disponível. Recarregue para atualizar.');
          }
        });
      });
    } catch {
      /* sem service worker o portal segue funcionando normalmente */
    }
  });
}
