export async function readGeminiApiKeyFromClipboard(): Promise<string | null> {
  try {
    const text = await navigator.clipboard.readText();
    if (!text) return null;
    // Typical Google API keys start with AIza and are 39 chars total
    const m = text.match(/AIza[0-9A-Za-z_\-]{35}/);
    return m ? m[0] : null;
  } catch {
    return null;
  }
}
