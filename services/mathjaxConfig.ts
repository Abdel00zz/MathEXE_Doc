// services/mathjaxConfig.ts
// Central MathJax configuration shared between runtime (dynamic loader) and export HTML.

export const baseMathJaxConfig = {
  tex: {
    inlineMath: [ ['$', '$'], ['\\(', '\\)'] ],
    displayMath: [ ['$$','$$'], ['\\[','\\]'] ],
    processEscapes: true,
    packages: { '[+]': ['ams', 'noerrors', 'noundefined'] },
    tags: 'none'
  },
  options: {
    skipHtmlTags: ['script','noscript','style','textarea','pre','code'],
    processHtmlClass: 'tex2jax_process',
    ignoreHtmlClass: 'tex2jax_ignore'
  },
  svg: { fontCache: 'global' },
  startup: { typeset: false }
} as const;

// Build script tags string for export documents.
export function buildMathJaxCdnScripts(autoTypeset = true): string {
  const cfg = { ...baseMathJaxConfig, startup: { ...baseMathJaxConfig.startup, typeset: autoTypeset } };
  const configJson = JSON.stringify(cfg);
  return `\n<script>window.MathJax=${configJson};</script>\n<script async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>\n`;
}