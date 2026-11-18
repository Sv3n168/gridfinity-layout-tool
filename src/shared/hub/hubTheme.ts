/**
 * Follows the PrintForge hub's light/dark switch while embedded: the bridge
 * dispatches `pf:theme` ({ detail: { theme } }) and the setting changes the
 * way the settings dialog would change it, so the 3D scenes follow too.
 */

import { useSettingsStore } from '@/core/store';

let installed = false;

export function installHubTheme(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  window.addEventListener('pf:theme', (event) => {
    const theme = (event as CustomEvent<{ theme?: unknown }>).detail.theme;
    if (theme !== 'light' && theme !== 'dark') return;
    const store = useSettingsStore.getState();
    if (store.settings.theme !== theme) store.updateSetting('theme', theme);
  });
}
