import { registerSW } from 'virtual:pwa-register';
import { toast } from './util/toast';

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
}

/** Registers the service worker (offline play), update toast and the install button. */
export function initPwa(): void {
  const updateSW = registerSW({
    onNeedRefresh: () => toast('Update ready - tap to reload', () => void updateSW(true), 30000),
    onOfflineReady: () => toast('Ready to play offline'),
  });

  const installBtn = document.getElementById('install-btn')!;
  const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;
  if (standalone) return;

  let deferred: InstallPromptEvent | null = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as InstallPromptEvent;
    installBtn.hidden = false;
  });
  window.addEventListener('appinstalled', () => (installBtn.hidden = true));

  // iOS Safari has no install prompt; point people at the share sheet instead.
  if (/iphone|ipad|ipod/i.test(navigator.userAgent)) installBtn.hidden = false;
  installBtn.addEventListener('click', () => {
    if (deferred) void deferred.prompt();
    else toast('Tap Share, then "Add to Home Screen"', undefined, 8000);
  });
}
