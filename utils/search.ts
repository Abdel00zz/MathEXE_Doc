import { Document } from '../types';

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ');
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(q: string): string[] {
  return normalize(q)
    .split(' ')
    .filter(w => w.length > 1);
}

export type SearchHit = {
  doc: Document;
  score: number;
  matches: number;
};

export function searchDocuments(docs: Document[], query: string): SearchHit[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  return docs
    .map(doc => {
      let score = 0;
      let matches = 0;
      const title = normalize(doc.title || '');
      const klass = normalize(doc.className || '');
      const year = normalize(doc.schoolYear || '');

      const exTitles = doc.exercises.map(e => normalize(e.title || ''));
      const exKeywords = doc.exercises.flatMap(e => (e.keywords || []).map(k => normalize(k)));
      const exContents = doc.exercises.map(e => normalize(stripHtml(e.content || '')));

      for (const t of tokens) {
        let matchedToken = false;
        if (title.includes(t)) { score += 5; matchedToken = true; }
        if (klass.includes(t)) { score += 2; matchedToken = true; }
        if (year.includes(t)) { score += 1; matchedToken = true; }
        for (const s of exTitles) { if (s.includes(t)) { score += 3; matchedToken = true; break; } }
        for (const s of exKeywords) { if (s.includes(t)) { score += 3; matchedToken = true; break; } }
        for (const s of exContents) { if (s.includes(t)) { score += 2; matchedToken = true; break; } }
        if (matchedToken) matches += 1;
      }

      return { doc, score, matches };
    })
    .filter(h => h.score > 0)
    .sort((a, b) => b.score - a.score || b.matches - a.matches);
}
