import { describe, expect, it } from 'vitest';
import { isConsentLevel, isTrackingHost, posthogOptions, uiHost } from '../src/lib/analytics';

describe('analytics gating', () => {
  it('tracks only the production hostname', () => {
    expect(isTrackingHost('protocols.davidgarciab.com')).toBe(true);
    expect(isTrackingHost('localhost')).toBe(false);
    expect(isTrackingHost('127.0.0.1')).toBe(false);
    expect(isTrackingHost('protocol-anatomy.pages.dev')).toBe(false);
    expect(isTrackingHost('abc123.protocol-anatomy.pages.dev')).toBe(false);
  });

  it('accepts only the two consent levels', () => {
    expect(isConsentLevel('simple')).toBe(true);
    expect(isConsentLevel('enhanced')).toBe(true);
    expect(isConsentLevel('all')).toBe(false);
    expect(isConsentLevel(null)).toBe(false);
  });
});

describe('posthog options', () => {
  const host = 'https://eu.i.posthog.com';

  it('keeps the simple level free of cookies, storage, and autocapture', () => {
    const options = posthogOptions('simple', host);
    expect(options.persistence).toBe('memory');
    expect(options.autocapture).toBe(false);
    expect(options.capture_pageleave).toBe(false);
  });

  it('stores identity and autocaptures at the enhanced level', () => {
    const options = posthogOptions('enhanced', host);
    expect(options.persistence).toBe('localStorage+cookie');
    expect(options.autocapture).toBe(true);
    expect(options.cross_subdomain_cookie).toBe(false);
  });

  it('never records sessions or runs surveys, and honours Do Not Track', () => {
    for (const level of ['simple', 'enhanced'] as const) {
      const options = posthogOptions(level, host);
      expect(options.disable_session_recording).toBe(true);
      expect(options.disable_surveys).toBe(true);
      expect(options.respect_dnt).toBe(true);
    }
  });

  it('derives the UI host from the API host', () => {
    expect(uiHost('https://eu.i.posthog.com')).toBe('https://eu.posthog.com');
    expect(uiHost('https://us.i.posthog.com')).toBe('https://us.posthog.com');
  });
});
