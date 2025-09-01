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
        .modern-lists ol {
          list-style: none;
          padding-left: 0;
          counter-reset: level1;
        }
        .modern-lists li {
          list-style: none;
          position: relative;
          padding-left: 2.2em;
          margin-bottom: 0.75em;
          counter-increment: level1;
        }
        .modern-lists li::before {
          content: counter(level1);
          position: absolute;
          left: 0;
          top: 0.1em;
          width: 1.8em;
          height: 1.8em;
          line-height: 1.8em;
          text-align: center;
          border-radius: 50%;
          background-color: #e0e7ff;
          color: #4338ca;
          font-weight: 600;
          font-size: 0.75rem;
        }
        
        /* Sub-level for a., b., c... */
        .modern-lists ol ol {
          counter-reset: level2;
          margin-top: 0.5em;
          padding-left: 0;
        }
        .modern-lists ol ol > li {
          counter-increment: level2;
          padding-left: 2.2em;
          margin-left: 0;
        }
        .modern-lists ol ol > li::before {
          /* Use 'lower-alpha' for a, b, c... and append a dot */
          content: counter(level2, lower-alpha);
          background-color: #f0f9ff;
          color: #0284c7;
          width: 1.8em;
          height: 1.8em;
          line-height: 1.8em;
          font-size: 0.75rem;
          top: 0.1em;
        }
        
        /* Dark mode styles */
        :global(.dark) .modern-lists li::before {
            background-color: #3730a3;
            color: #e0e7ff;
        }
        :global(.dark) .modern-lists ol ol > li::before {
            background-color: #075985;
            color: #f0f9ff;
        }
  `}</style>
    </div>
  );
};

export default MathRenderer;