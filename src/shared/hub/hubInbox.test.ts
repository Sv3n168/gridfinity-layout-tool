// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { hasPendingHubFiles, installHubInbox, subscribeHubInbox, takeHubFiles } from './hubInbox';

function offer(name: string): boolean {
  const event = new CustomEvent('pf:open-file', { detail: { file: new File(['x'], name) }, cancelable: true });
  return window.dispatchEvent(event);
}

describe('hubInbox', () => {
  afterEach(() => {
    takeHubFiles('stl');
    takeHubFiles('svg');
  });

  it('accepts STL and SVG and leaves other files to the bridge', () => {
    installHubInbox();
    expect(offer('part.STL')).toBe(false);
    expect(offer('outline.svg')).toBe(false);
    expect(offer('layout.json')).toBe(true);
    expect(takeHubFiles('stl').map((f) => f.name)).toEqual(['part.STL']);
    expect(takeHubFiles('svg').map((f) => f.name)).toEqual(['outline.svg']);
    expect(hasPendingHubFiles()).toBe(false);
  });

  it('switches to the designer route and notifies subscribers', () => {
    installHubInbox();
    window.history.replaceState(null, '', '/');
    const listener = vi.fn();
    const unsubscribe = subscribeHubInbox(listener);
    offer('tool.stl');
    expect(window.location.pathname).toBe('/designer');
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });
});
