// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { clearPostHogStorage, installPostHogStub } from '../src/lib/analytics';

type Stub = { init: (key: string, config: Record<string, unknown>) => void; _i: unknown[][]; capture: (...args: unknown[]) => void };

beforeEach(() => {
  delete (window as unknown as { posthog?: unknown }).posthog;
  document.head.innerHTML = '';
  localStorage.clear();
  sessionStorage.clear();
});

describe('PostHog loader stub', () => {
  it('queues init and injects array.js from the EU asset host', () => {
    installPostHogStub();
    const posthog = (window as unknown as { posthog: Stub }).posthog;
    posthog.init('phc_test', { api_host: 'https://eu.i.posthog.com' });
    const script = document.head.querySelector('script');
    expect(script?.src).toBe('https://eu-assets.i.posthog.com/static/array.js');
    expect(posthog._i).toHaveLength(1);
    expect(posthog._i[0][0]).toBe('phc_test');
  });

  it('queues calls made before the library loads', () => {
    installPostHogStub();
    const posthog = (window as unknown as { posthog: Stub }).posthog;
    posthog.init('phc_test', { api_host: 'https://eu.i.posthog.com' });
    posthog.capture('early');
    expect(posthog.capture).toBeTypeOf('function');
  });
});

describe('clearPostHogStorage', () => {
  it('removes PostHog entries and leaves the consent choice and other keys', () => {
    localStorage.setItem('ph_phc_test_posthog', '{}');
    localStorage.setItem('__ph_opt_in_out_phc_test', '1');
    localStorage.setItem('pa-consent', 'simple');
    localStorage.setItem('theme', 'dark');
    sessionStorage.setItem('ph_session', 'x');
    document.cookie = 'ph_phc_test_posthog=abc; path=/';
    document.cookie = 'other=keep; path=/';
    clearPostHogStorage();
    expect(Object.keys(localStorage).sort()).toEqual(['pa-consent', 'theme']);
    expect(sessionStorage.length).toBe(0);
    expect(document.cookie).toBe('other=keep');
  });
});
