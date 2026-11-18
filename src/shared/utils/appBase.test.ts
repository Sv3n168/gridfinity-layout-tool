import { describe, expect, it } from 'vitest';
import { APP_BASE, stripAppBase, withAppBase } from './appBase';

describe('appBase at the default base', () => {
  it('has an empty base', () => {
    expect(APP_BASE).toBe('');
  });

  it('leaves paths unchanged', () => {
    expect(stripAppBase('/designer')).toBe('/designer');
    expect(withAppBase('/designer?id=1')).toBe('/designer?id=1');
    expect(withAppBase('relative')).toBe('relative');
  });
});
