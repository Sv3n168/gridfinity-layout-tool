// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { useSettingsStore } from '@/core/store';
import { installHubTheme } from './hubTheme';

describe('hubTheme', () => {
  it('applies the hub theme and ignores anything else', () => {
    installHubTheme();
    window.dispatchEvent(new CustomEvent('pf:theme', { detail: { theme: 'light' } }));
    expect(useSettingsStore.getState().settings.theme).toBe('light');
    window.dispatchEvent(new CustomEvent('pf:theme', { detail: { theme: 'neon' } }));
    expect(useSettingsStore.getState().settings.theme).toBe('light');
    window.dispatchEvent(new CustomEvent('pf:theme', { detail: { theme: 'dark' } }));
    expect(useSettingsStore.getState().settings.theme).toBe('dark');
  });
});
