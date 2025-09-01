import React, { useEffect, useRef } from 'react';
import { typesetElement } from '../../services/mathjaxLoader';

interface MathRendererProps {
  content: string;
  className?: string;
}

/**
 * Renders a string containing HTML + LaTeX using the global MathJax loader (CDN).
 * No React wrapper; we manually trigger typeset on content changes.
 */
const MathRenderer: React.FC<MathRendererProps> = ({ content, className }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastContentRef = useRef<string>('');

  useEffect(() => {
    if (!containerRef.current) return;
    // Only re-inject HTML if content actually changed (prevent overwriting SVG output)
    if (content !== lastContentRef.current) {
      // reset container for fresh parse
      containerRef.current.innerHTML = content;
      containerRef.current.removeAttribute('data-mj-done');
      lastContentRef.current = content;
    }
    if (content && content.trim()) {
      typesetElement(containerRef.current).then(() => {
        if (containerRef.current) {
          containerRef.current.setAttribute('data-mj-done', 'true');
        }
      });
    }
  }, [content]);

  if (!content || content.trim() === '') return null;

  return (
    <div className={`${className || ''} math-renderer-container`}>
      <div
        ref={containerRef}
        // initial injection happens in effect to allow change detection / skip reflow
        className="modern-lists math-content tex2jax_process"
        data-mj-done="false"
      />
  <style>{`
        .math-content {
          font-size: calc(1em - 1.5px);
        }
        .math-content mjx-container[jax="SVG"] {
          font-size: inherit !important;
        }
        .math-content mjx-container[jax="SVG"][display="true"] {
          font-size: inherit !important;
        }
        .modern-lists ol { list-style:none; padding-left:0; counter-reset: level1; }
        .modern-lists > ol > li { counter-increment: level1; }
        .modern-lists li { list-style:none; position:relative; padding-left:2.2em; margin-bottom:0.75em; }
        .modern-lists > ol > li::before { content: counter(level1); }
        .modern-lists > ol > li::before,
        .modern-lists ol ol > li::before,
        .modern-lists ol ol ol > li::before {
          position:absolute; left:0; top:0.1em; width:1.8em; height:1.8em; line-height:1.8em; text-align:center; font-weight:600; font-size:0.70rem;
        }
        /* Level 1 badge */
        .modern-lists > ol > li::before { border-radius:50%; background:#e0e7ff; color:#4338ca; }
        /* Level 2 (a, b, c) */
        .modern-lists ol ol { counter-reset: level2; margin-top:0.5em; padding-left:0; }
        .modern-lists ol ol > li { counter-increment: level2; }
        .modern-lists ol ol > li::before { content: counter(level2, lower-alpha); background:#f0f9ff; color:#0369a1; border-radius:50%; }
        /* Level 3 (i, ii, iii) */
        .modern-lists ol ol ol { counter-reset: level3; margin-top:0.4em; }
        .modern-lists ol ol ol > li { counter-increment: level3; }
        .modern-lists ol ol ol > li::before { content: counter(level3, lower-roman); background:#f1f5f9; color:#334155; border-radius:4px; }
        /* Dark mode overrides */
        :global(.dark) .modern-lists > ol > li::before { background:#3730a3; color:#e0e7ff; }
        :global(.dark) .modern-lists ol ol > li::before { background:#075985; color:#f0f9ff; }
        :global(.dark) .modern-lists ol ol ol > li::before { background:#1e293b; color:#cbd5e1; }
  `}</style>
    </div>
  );
};

export default MathRenderer;