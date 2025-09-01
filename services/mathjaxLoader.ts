// services/mathjaxLoader.ts
// Dynamic loader for MathJax (CDN) without react wrapper.
// Provides a singleton ensureMathJax() that returns a promise once MathJax is ready.

import { baseMathJaxConfig } from './mathjaxConfig';

export interface MathJaxWindow extends Window {
  MathJax?: any;
}

declare const window: MathJaxWindow;

let loadingPromise: Promise<any> | null = null;
let scheduleTimer: number | null = null; // debounce timer

export function ensureMathJax(): Promise<any> {
  if (window.MathJax) {
    return Promise.resolve(window.MathJax);
  }
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise((resolve, reject) => {
  (window as any).MathJax = baseMathJaxConfig;
    const script = document.createElement('script');
    // Using official v3 CDN (MathJax 4 not final yet). If migrating to v4, update URL.
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
    script.async = true;
    script.onload = () => {
      // After script loads, MathJax global replaced with enriched object.
      if (window.MathJax && window.MathJax.startup) {
        window.MathJax.startup.promise.then(() => resolve(window.MathJax));
      } else {
        resolve(window.MathJax);
      }
    };
    script.onerror = () => reject(new Error('Failed to load MathJax CDN script'));
    document.head.appendChild(script);
  });

  return loadingPromise;
}

export async function typesetElement(element: HTMLElement) {
  const mj = await ensureMathJax();
  if (!mj || !mj.typesetPromise) return;
  await mj.typesetPromise([element]);
}

export async function typesetAll() {
  const mj = await ensureMathJax();
  if (!mj || !mj.typesetPromise) return;
  await mj.typesetPromise();
}

// Debounced global typeset to coalesce rapid edits (e.g., typing in editor)
export function scheduleTypesetAll(delay = 150) {
  if (scheduleTimer !== null) {
    clearTimeout(scheduleTimer);
  }
  scheduleTimer = window.setTimeout(() => {
    typesetAll();
    scheduleTimer = null;
  }, delay);
}
