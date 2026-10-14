import { SITE } from './site';

export type ConsentLevel = 'simple' | 'enhanced';

export const CONSENT_KEY = 'pa-consent';
export const DEFAULT_POSTHOG_HOST = 'https://eu.i.posthog.com';

export function isConsentLevel(value: unknown): value is ConsentLevel {
  return value === 'simple' || value === 'enhanced';
}

/** Events are sent only from the production hostname: not localhost, `astro preview`, or Pages previews. */
export function isTrackingHost(hostname: string): boolean {
  return hostname === new URL(SITE.url).hostname;
}

export function uiHost(apiHost: string): string {
  return apiHost.replace('.i.posthog.com', '.posthog.com');
}

/**
 * simple: anonymous page views only. In-memory identity, so nothing is written to cookies
 * or storage and each page load is a new anonymous visitor.
 * enhanced: cookie and localStorage identity, autocapture, and page-leave events.
 * Session recording and surveys stay off at both levels.
 */
export function posthogOptions(level: ConsentLevel, apiHost: string): Record<string, unknown> {
  const shared = {
    api_host: apiHost,
    ui_host: uiHost(apiHost),
    person_profiles: 'identified_only',
    disable_session_recording: true,
    disable_surveys: true,
    cross_subdomain_cookie: false,
    respect_dnt: true,
    capture_pageview: true,
  };
  if (level === 'enhanced') {
    return { ...shared, persistence: 'localStorage+cookie', autocapture: true, capture_pageleave: true };
  }
  return { ...shared, persistence: 'memory', autocapture: false, capture_pageleave: false };
}

/** Removes what PostHog wrote at the enhanced level, so a switch to simple leaves nothing behind. */
export function clearPostHogStorage(): void {
  const isPostHogKey = (name: string) => name.startsWith('ph_') || name.startsWith('__ph_');
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0].trim();
    if (isPostHogKey(name)) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
  for (const store of [window.localStorage, window.sessionStorage]) {
    try {
      for (const name of Object.keys(store)) if (isPostHogKey(name)) store.removeItem(name);
    } catch {
      // Storage can be blocked; there is nothing to clear then.
    }
  }
}

/**
 * The official PostHog loader snippet. It queues calls on a stub and injects array.js from
 * PostHog's asset host, so the library stays out of this site's own JavaScript bundle.
 */
export function installPostHogStub(): void {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const w = window as any;
  if (w.posthog && w.posthog.__SV) return;
  const ph: any = (w.posthog = w.posthog || []);
  ph._i = [];
  ph.init = function (key: string, config: any, name?: string) {
    const stub = (target: any, method: string) => {
      const parts = method.split('.');
      if (parts.length === 2) {
        target = target[parts[0]];
        method = parts[1];
      }
      target[method] = function (...args: unknown[]) {
        target.push([method, ...args]);
      };
    };
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.crossOrigin = 'anonymous';
    script.async = true;
    script.src = `${config.api_host.replace('.i.posthog.com', '-assets.i.posthog.com')}/static/array.js`;
    document.head.appendChild(script);
    let target: any = ph;
    if (name !== undefined) target = ph[name] = [];
    else name = 'posthog';
    target.people = target.people || [];
    target.toString = (short?: boolean) => `posthog${name !== 'posthog' ? `.${name}` : ''}${short ? '' : ' (stub)'}`;
    target.people.toString = () => `${target.toString(true)}.people (stub)`;
    const methods =
      'init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug'.split(
        ' ',
      );
    for (const method of methods) stub(target, method);
    ph._i.push([key, config, name]);
  };
  ph.__SV = 1;
}
