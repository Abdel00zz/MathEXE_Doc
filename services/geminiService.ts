
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiExerciseResponse, GeminiAnalysisOptions } from "../types";

/**
 * Cleans up common formatting issues from the AI's response content.
 * @param htmlContent The raw HTML content from the Gemini API.
 * @returns Sanitized HTML content.
 */
const cleanGeminiContent = (htmlContent: string): string => {
  if (!htmlContent) return "";
  let cleaned = htmlContent;

  // Rule 1: Collapse duplicated LaTeX delimiters.
  // This handles cases like \\( \\( ... \\) \\) which can be mistakenly generated.
  cleaned = cleaned.replace(/\\\\\(\s*\\\\\(/g, '\\(');
  cleaned = cleaned.replace(/\\\\\)\s*\\\\\)/g, '\\)');
  cleaned = cleaned.replace(/\\\\\\\[\s*\\\\\\\[/g, '\\\\[');
  cleaned = cleaned.replace(/\\\\\\]\s*\\\\\\]/g, '\\]');

  // Rule 2: Remove potential markdown fences if the AI accidentally adds them.
  cleaned = cleaned.replace(/^```(?:html|json)?\s*\n?/im, '').replace(/\n?```\s*$/im, '');

  return cleaned.trim();
};


const exerciseSchema = {
    type: Type.OBJECT,
    properties: {
        title: { 
            type: Type.STRING, 
            description: "A pedagogical title that summarizes the exercise's core concept. It must be concise (under 6 words) and give a clear idea of the exercise's topic."
        },
        difficulty: { 
            type: Type.INTEGER, 
            description: "An estimated difficulty from 1 (very easy) to 5 (very hard)." 
        },
        keywords: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING }, 
            description: "A list of 3-5 relevant mathematical keywords." 
        },
        content: { 
            type: Type.STRING, 
            description: "The full content of the exercise, formatted in clean, semantic HTML with LaTeX for math. Use \\( ... \\) for inline math and \\[ ... \\] for display math. Structure content using paragraphs <p>, and lists like <ol> and <ul> for questions and sub-questions. Do not nest block elements inside <p> tags." 
        },
    },
    required: ["title", "difficulty", "keywords", "content"],
};

export const analyzeImageWithGemini = async (
  apiKey: string,
  base64Image: string,
  mimeType: string,
  options: GeminiAnalysisOptions
): Promise<GeminiExerciseResponse> => {
  if (!apiKey) {
      throw new Error("API Key is missing.");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstructions = [
    "You are an expert in mathematics education. Your task is to analyze the content of a math exercise image and extract it into a structured JSON format, strictly adhering to the provided schema.",
    "The 'content' field must contain ONLY the body of the exercise. Omit any headers like 'Exercise 1', 'Problem A', etc., as the application will handle numbering automatically.",
    "Pay special attention to the 'title'. It MUST be a short, pedagogical summary of the exercise's main objective (e.g., 'Solving Quadratic Equations', 'Vector Dot Product'). The title MUST be under 6 words and accurately reflect the exercise content.",
    "IMPORTANT: Detect the language of the text in the image. Your entire response (title, keywords, content) MUST be in that same language. DO NOT TRANSLATE.",
    "The 'content' field must be valid, semantic HTML. Use <p> for paragraphs, and nested <ol> or <ul> for lists. All math must be LaTeX, using \\( ... \\) for inline and \\[ ... \\] for display math. Strictly conform to the schema.",
    "To improve readability, for any inline math `\\(...\\)` that contains complex structures like fractions (`\\frac`), summations (`\\sum`), or integrals (`\\int`), you MUST add `\\displaystyle` at the beginning of the formula's content. Example: `\\(\\displaystyle \\frac{a}{b}\\)`. Apply this only to complex formulas, not to simple variables or expressions.",
    "For vectors, consistently use `\\vec{u}` for single-letter vectors and `\\overrightarrow{AB}` for vectors over multiple letters. Do not use plain text arrows.",
    "For complex mathematical structures like systems of equations, use appropriate LaTeX environments such as `cases` or `aligned`. For matrices, use `pmatrix` for parentheses or `bmatrix` for square brackets.",
    "Ensure correct use of `\\left` and `\\right` for delimiters like parentheses, brackets, and braces that enclose multi-line or large expressions (e.g., tall fractions, integrals) to ensure they scale correctly."
  ];

  if (options.reviseText) {
    systemInstructions.push("Analyze the text for spelling and grammar errors. In the 'content' field, provide a corrected version of the text. The corrections should be subtle and preserve the original meaning.");
  } else {
    systemInstructions.push("Your transcription must be exact. DO NOT correct or alter the original text, spelling, or grammar. Preserve the original phrasing and vocabulary.");
  }

  if (options.boldKeywords) {
    systemInstructions.push("In the HTML 'content' field, bold the keywords you've identified (from the 'keywords' array) by wrapping them in `<strong>` tags.");
  }

  if (options.suggestHints) {
    systemInstructions.push("For each question or sub-question in the exercise that requires a solution, add a brief, helpful hint in parentheses at the end of the question's text. For example: `<p>1. Solve the equation x^2 - 5x + 6 = 0. (Hint: Consider factoring the quadratic.)</p>`. The hint should guide the student without giving away the answer. Do not add hints to simple instructions or statements.");
  }


  const systemInstruction = systemInstructions.join(' ');
  const promptText = "Extract the exercise from this image, conforming to the JSON schema.";

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType,
    },
  };
  
  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [imagePart, { text: promptText }] },
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: exerciseSchema,
        },
    });

    const jsonString = response.text;
    const result = JSON.parse(jsonString);
    
    if (result && typeof result.title === 'string' && typeof result.content === 'string') {
        // Clean the content to fix common AI formatting errors.
        result.content = cleanGeminiContent(result.content);
        return result as GeminiExerciseResponse;
    } else {
        throw new Error("Invalid JSON structure received from API.");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while calling the Gemini API.");
  }
};


export const verifyGeminiApiKey = async (apiKey: string): Promise<boolean> => {
    if (!apiKey) return false;
    try {
        const ai = new GoogleGenAI({ apiKey });
        // Make a lightweight, non-generative call to verify the key.
        // A simple prompt with minimal output is a good way to test connectivity and authentication.
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'ping',
            config: {
                maxOutputTokens: 1,
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        // Check if we got a valid response structure
        return !!response.text;
    } catch(e) {
        console.error("API Key verification failed:", e);
        return false;
    }
}
