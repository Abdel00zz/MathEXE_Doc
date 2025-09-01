import { Document, AppSettings, ExportOptions, Exercise } from '../types';
import { buildMathJaxCdnScripts } from './mathjaxConfig';

// Enable auto typeset inside exported iframe/document
const MATHJAX_SCRIPT = buildMathJaxCdnScripts(true);




const getStyles = (options: ExportOptions) => {
  let themeStyles = '';
  if (options.theme === 'ink-saver') {
    themeStyles = `
      .page { color: #404040; }
      .doc-title { color: #000000; }
      .doc-meta { color: #6b7280; }
      .exercise-main-title { color: #111827; }
      .exercise-subtitle { color: #404040; }
      .star-rating span { color: #a1a1aa; }
      .keyword-tag { background-color: transparent; color: #525252; border: 1px solid #d4d4d8; }
      .exercise-content ol > li::before { color: #404040; }
      .exercise-content ol ol > li::before, .exercise-content ol ol ol > li::before { color: #525252; }
      .exercise:not(:first-child)::before { color: #d1d5db; }
      .content { ${options.columns > 1 ? 'column-rule-color: #e5e7eb;' : ''} }
    `;
  } else if (options.theme === 'high-contrast') {
    themeStyles = `
      .page { color: #000000; font-weight: 600; }
      .doc-title { color: #000000; }
      .doc-meta { color: #000000; }
      .exercise-main-title, .exercise-subtitle { color: #000000; }
      .star-rating span { color: #000000; }
      .keyword-tag { background-color: transparent; color: #000000; border: 1px solid #000000; font-weight: 600;}
      .exercise-content ol li::before { color: #000000; font-weight: 600; }
      .exercise:not(:first-child)::before { color: #000000; font-weight: 600; }
      .content { ${options.columns > 1 ? 'column-rule: 1px solid #000000;' : ''} }
    `;
  }

  return `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap');
      
      body {
        margin: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      @media screen {
        body {
            padding: 2rem; /* Padding for preview */
            background-color: #e2e8f0; /* Light desk color */
        }
        .dark body {
            background-color: #0f172a; /* Dark desk color */
        }
      }

      .page {
        font-family: 'Inter', sans-serif;
        line-height: 1.5;
        font-size: ${options.fontSize}pt;
        color: #1f2937;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
        
        /* A4 paper simulation */
        background: white;
        width: 21cm;
        min-height: 29.7cm;
        padding: 1.5cm;
        margin: 0 auto;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }

      header { text-align: center; margin-bottom: 2.5rem; column-span: all; break-after: column; }
      .doc-title { font-family: 'Manrope', sans-serif; font-size: 2.0em; font-weight: 800; margin: 0; color: #111827; }
      .doc-meta { display: flex; justify-content: space-between; width: 100%; max-width: 400px; margin: 0.5rem auto 0; font-size: 0.9em; color: #4b5563; }
      
      .content { 
        column-count: ${options.columns}; 
        column-gap: 1.5cm;
        ${options.columns > 1 ? 'column-rule: 1px dotted #cbd5e1;' : ''}
      }
      
      .exercise {
        margin-bottom: 1.2rem;
        padding-top: 1.2rem;
      }
      .exercise:first-child { padding-top: 0; }
      
      .exercise:not(:first-child) {
        margin-top: 1.5rem;
        padding-top: 1.5rem;
      }
      
      .exercise-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.6rem;
      }
      .exercise-title-block { display: flex; align-items: baseline; gap: 0.75rem; flex-wrap: wrap; line-height: 1.3; }
      
      .exercise-main-title {
        font-family: 'Manrope', sans-serif;
        font-size: 1.15em;
        font-weight: 700;
        color: #111827;
        margin: 0;
      }
      .exercise-subtitle {
        font-family: 'Inter', sans-serif;
        font-size: 1em;
        margin: 0;
        font-weight: 600;
        font-style: italic;
        color: #4b5563;
      }
      
      .star-rating { font-size: 1em; letter-spacing: 2px; white-space: nowrap; }
      .star-rating span { display: inline-block; color: #f59e0b; }
      
      .keywords {
        margin-top: 0.25rem;
        margin-bottom: 0.75rem;
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .keyword-tag { font-size: 0.75em; background-color: #f3f4f6; color: #4b5563; padding: 0.15rem 0.5rem; border-radius: 4px; }
      
      .exercise-content p, .exercise-content ul { margin-top: 0.4rem; margin-bottom: 0.4rem; }
      .exercise-content ul { list-style-position: outside; padding-left: 1.5em; }
      
      .exercise-content ol { list-style-type: none; counter-reset: item; padding-left: 0; margin-top: 0.4rem; margin-bottom: 0.4rem; }
      .exercise-content ol > li {
        display: block;
        position: relative;
        padding-left: 2.5em;
        margin-bottom: 0.6em;
      }
      .exercise-content ol > li > p:first-child { display: inline; }

      /* Level 1: 1, 2, etc. in a dark circle */
      .exercise-content ol > li::before {
        content: counter(item);
        counter-increment: item;
        position: absolute;
        left: 0;
        top: 0;
        width: 1.8em;
        height: 1.8em;
        line-height: 1.8em;
        text-align: center;
        border-radius: 50%;
        background-color: #2d3748; /* Dark gray-blue */
        color: white;
        font-weight: 600;
        font-size: 0.85em;
      }

      /* Level 2: a, b, etc. in a light circle */
      .exercise-content ol ol {
        counter-reset: subitem;
        margin-top: 0.6em;
        padding-left: 0;
      }
      .exercise-content ol ol > li {
        padding-left: 2.5em;
        margin-bottom: 0.5em;
      }
      .exercise-content ol ol > li::before {
        content: counter(subitem, lower-alpha);
        counter-increment: subitem;
        background-color: #e2e8f0; /* Light gray */
        color: #2d3748; /* Dark gray-blue */
        font-weight: 600;
      }

      /* Level 3: i, ii, etc. with a simple marker */
      .exercise-content ol ol ol {
        counter-reset: subsubitem;
        padding-left: 0;
      }
      .exercise-content ol ol ol > li {
        padding-left: 3em;
        margin-bottom: 0.4em;
      }
      .exercise-content ol ol ol > li::before {
        content: counter(subsubitem, lower-roman) ".";
        counter-increment: subsubitem;
        background-color: transparent;
        color: #4a5568;
        font-weight: normal;
        width: auto;
        height: auto;
        line-height: inherit;
        text-align: left;
        left: 0.5em;
      }


      @media print {
        body { padding: 0; background-color: #ffffff !important; font-weight: normal !important; }
        .page {
          margin: 0;
          box-shadow: none;
          border: none;
          width: auto;
          min-height: auto;
          padding: 1.5cm;
          background: #ffffff !important;
          color: #000000 !important;
        }
      }

      ${themeStyles}
    </style>
  `;
};

const renderStar = (isFilled: boolean) => `<span class="star">${isFilled ? '★' : '☆'}</span>`;

const renderExercise = (exercise: Exercise, index: number, options: ExportOptions) => {
  const starsHtml = Array.from({length: 5}, (_, i) => renderStar(i < exercise.difficulty)).join('');

  return `
    <div class="exercise">
      <div class="exercise-header">
        <div class="exercise-title-block">
          <h3 class="exercise-main-title">Exercice ${index + 1}</h3>
          ${options.showTitles && exercise.title ? `<p class="exercise-subtitle">${exercise.title}</p>` : ''}
        </div>
        ${options.showDifficulty ? `<div class="star-rating">${starsHtml}</div>` : ''}
      </div>
      ${options.showKeywords && exercise.keywords && exercise.keywords.length > 0 ? `
        <div class="keywords">
          ${exercise.keywords.map(kw => `<span class="keyword-tag">${kw}</span>`).join('')}
        </div>` : ''}
      <div class="exercise-content tex2jax_process">
        ${exercise.content}
      </div>
    </div>
  `;
};

export const generateHtmlForExport = (
  doc: Document,
  settings: AppSettings,
  options: ExportOptions
): string => {
  const formattedDate = new Date(doc.date).toLocaleDateString(settings.language, { year: 'numeric', month: 'long', day: 'numeric' });
  const isDarkMode = settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  return `
    <!DOCTYPE html>
    <html lang="${settings.language}" class="${isDarkMode ? 'dark' : ''}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${doc.title}</title>
      ${getStyles(options)}
  ${MATHJAX_SCRIPT}
    </head>
    <body oncontextmenu="return false;">
      <div class="page">
        <main class="content">
          <header>
            <h1 class="doc-title">${doc.title}</h1>
            <div class="doc-meta">
              <span>${settings.teacherName || doc.className}</span>
              <span>${doc.schoolYear}</span>
              <span>${formattedDate}</span>
            </div>
          </header>
          ${doc.exercises.map((ex, i) => renderExercise(ex, i, options)).join('')}
        </main>
      </div>
    </body>
    </html>
  `;
};


export const generateHtmlForPrint = (
  doc: Document,
  settings: AppSettings,
  options: ExportOptions
): string => {
    const content = generateHtmlForExport(doc, settings, options);
    const printScript = `
      <script>
        (function(){
          function doPrint(){
            try { window.print(); } catch(e) { console.error(e); }
          }
          if (window.MathJax && window.MathJax.startup) {
            window.MathJax.startup.promise.then(() => {
              // Ensure any late content gets a pass
              if (window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise().then(doPrint).catch(doPrint);
              } else { doPrint(); }
            });
          } else {
            // Fallback if MathJax failed
            setTimeout(doPrint, 800);
          }
        })();
      </script>
    `;
    // Inject print script at the end of the body
    return content.replace('</body>', `${printScript}</body>`);
}