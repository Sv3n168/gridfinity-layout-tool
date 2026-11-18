/**
 * Files handed over by the PrintForge hub (the bridge dispatches a cancelable
 * `pf:open-file` window event). Accepted files wait here until the view that
 * imports them is mounted, because the hub may hand a file to the planner
 * while the designer that consumes it has not been opened yet.
 */

import { useEffect, useRef } from 'react';
import { appPathname } from '@/shared/utils/appBase';
import { dispatchSyntheticPopstate } from '@/shared/hooks/useDesignerRouting';

export type HubFileKind = 'stl' | 'svg';

interface Pending {
  readonly kind: HubFileKind;
  readonly file: File;
}

const queue: Pending[] = [];
const listeners = new Set<() => void>();

function kindOf(name: string): HubFileKind | null {
  const ext = /\.([a-z0-9]+)$/i.exec(name)?.[1]?.toLowerCase();
  return ext === 'stl' || ext === 'svg' ? ext : null;
}

export function hasPendingHubFiles(): boolean {
  return queue.length > 0;
}

export function subscribeHubInbox(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Removes and returns the waiting files of one kind. */
export function takeHubFiles(kind: HubFileKind): File[] {
  const taken: File[] = [];
  const kept: Pending[] = [];
  for (const item of queue) {
    if (item.kind === kind) taken.push(item.file);
    else kept.push(item);
  }
  queue.splice(0, queue.length, ...kept);
  return taken;
}

interface OpenFileDetail {
  file?: unknown;
}

let installed = false;

export function installHubInbox(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  window.addEventListener('pf:open-file', (event) => {
    const detail = (event as CustomEvent<OpenFileDetail>).detail as OpenFileDetail | null;
    const file = detail?.file;
    if (!(file instanceof File)) return;
    const kind = kindOf(file.name);
    if (kind === null) return;
    event.preventDefault();
    queue.push({ kind, file });
    const path = appPathname();
    if (path !== '/designer' && path !== '/designer/') {
      window.history.pushState({ designId: null }, '', '/designer');
      dispatchSyntheticPopstate();
    }
    for (const l of listeners) l();
  });
}

/** Feeds waiting hub files of `kind` to `onFile`, now and whenever more arrive. */
export function useHubFiles(kind: HubFileKind, onFile: (file: File) => void): void {
  const handler = useRef(onFile);
  useEffect(() => {
    handler.current = onFile;
  }, [onFile]);
  useEffect(() => {
    const drain = (): void => {
      for (const f of takeHubFiles(kind)) handler.current(f);
    };
    drain();
    return subscribeHubInbox(drain);
  }, [kind]);
}
