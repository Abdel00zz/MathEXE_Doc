# Mathify - AI-Powered Math Document Editor

Mathify is an innovative, responsive, and highly optimized web application designed for mathematics teachers and students. It streamlines the creation, organization, and sharing of structured mathematical documents by leveraging the power of Google's Gemini AI. The AI analyzes images of math exercises, intelligently detects their language, and automatically extracts content, hierarchical structure, and LaTeX-formatted formulas, preserving the original context without translation.

## ✨ Key Features

- **Modern UI/UX**: A clean, modern, and professional user interface featuring refined typography, a sophisticated **slate** color palette, and a distinct brand identity. The UI is designed for a delightful user experience with fine-tuned details like adjusted list number font sizes for perfect readability.
- **Intelligent Document Management**: Create, edit, duplicate, and delete documents with ease. The app provides clear visual indicators for **saved vs. unsaved** changes, giving users confidence in their workflow. All data is persisted in the browser's local storage.
- **AI-Powered Exercise Creation**:
  - **Multimodal Analysis**: Upload images of math exercises, and let Gemini automatically extract the title, difficulty, keywords, and structured content in HTML with perfect LaTeX.
  - **Faithful Transcription**: The AI is instructed to transcribe content from images faithfully, preserving the original spelling and grammar without making corrections. It is also instructed to omit any exercise headers like 'Exercise 1', as the application handles numbering automatically.
  - **Intelligent Language Detection**: The AI automatically detects the language in the image and generates all content in that same language, preventing unwanted translations.
  - **AI-Assisted Formatting**: Opt-in to have the AI automatically bold key terms in the extracted content for professional-quality results.
- **Advanced Exercise Editor**: Fine-tune extracted exercises or create new ones from scratch. Edit content with a live preview, set difficulty on a 5-star scale, and manage keywords.
- **Intuitive Exercise Reordering**: Effortlessly arrange exercises within a document using dedicated **arrow buttons**. Each exercise card has 'up' and 'down' buttons for precise control over its position.
- **Optimized Performance**:
    - **Stable Image Handling**: The application remains responsive and stable, even when removing images from the upload queue while an AI analysis is in progress.
    - **Efficient Rendering**: MathJax rendering has been optimized to prevent unnecessary re-renders, ensuring a smooth editing experience without freezes.
- **Streamlined Export & Print**:
    - **Automatic Print Dialog**: Exporting a document now opens a full-screen preview and **automatically triggers the browser's print dialog**, simplifying the process of saving as a PDF or printing.
    - **Margin-Free Layout**: The print output is designed **without margins**, maximizing the usable space on the page for a clean, professional look.
    - **Advanced Customization**: A side panel provides easy access to customize layout (single or dual-column), font size, print theme (Default, Ink Saver, High Contrast), and content visibility, with changes reflected instantly in the live preview.
- **Dynamic & Flexible Uploads**: The 'Add from Images' modal features a persistent dropzone, allowing users to add more images to the queue at any time. Images can be safely removed from the queue even while an analysis is in progress.
- **Internationalization (i18n)**: Full support for English and French, with a modular structure that makes adding new languages simple.
- **Fully Responsive Design**: A seamless experience across desktops, tablets, and smartphones, optimized with custom hooks like `useMobile` and responsive layouts.
- **Accessible UI**: Includes features like focus trapping in modals, keyboard support for buttons, and proper ARIA attributes for improved navigation and screen reader support.

## 🛠️ Technology Stack

- **Frontend**: [React 19](https://react.dev/) (with Hooks), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for a utility-first CSS workflow.
- **Math Rendering**: MathJax (CDN v3) dynamically loaded via a custom loader (`services/mathjaxLoader.ts`) and rendered by a lightweight `MathRenderer` component.
- **AI**: [Google Gemini API](https://ai.google.dev/) (`@google/genai`) for multimodal content analysis.
- **Routing**: [React Router](https://reactrouter.com/) for client-side navigation.
- **Icons**: [Lucide React](https://lucide.dev/) for a clean and modern icon set.
- **File Uploads**: [React Dropzone](https://react-dropzone.js.org/) for powerful drag-and-drop functionality.

## 🏗️ Project Architecture

The project is structured to be modular, scalable, and maintainable.

- **/src/components**: Contains all React components, organized by feature (`document`, `exercise`, `modals`) and reusability (`ui`, `layout`).
  - **/ui**: Generic, reusable components like `Button`, `Modal`, `Input`, and `Checkbox`.
  - **/layout**: Structural components like `Header`.
- **/src/contexts**: `AppContext` and `ToastContext` provide global state management, avoiding prop drilling.
- **/src/hooks**: Custom hooks encapsulate reusable logic.
  - `useDocuments`: Manages all CRUD operations for documents and exercises.
  - `useSettings`: Manages user settings and preferences.
  - `useI18n`: Handles language loading and provides the translation function.
  - `useMobile`: Detects if the user is on a mobile device for responsive UI adjustments.
  - `useFocusTrap`: Ensures keyboard focus is contained within modals for accessibility.
- **/src/services**: Isolates external communications and complex logic.
  - `geminiService.ts`: Handles all interactions with the Google Gemini API, including dynamic prompt construction.
  - `htmlGenerator.ts`: Creates the self-contained HTML for document exports, complete with themes, column support, and an **automatic print script**.
- **/src/types**: Defines all core TypeScript types and interfaces (`Document`, `Exercise`, etc.).
- **/src/locales**: Stores JSON files for internationalization.
- **/src/constants.ts**: Shared constants, such as `localStorage` keys.

### Core Logic Explained

- **State Management**: The application uses React Context (`AppContext`) for centralized state management. Changes to documents are tracked automatically. All documents and settings are loaded from `localStorage` on startup and are persisted back when changes are made, ensuring data integrity between sessions.
- **AI Integration**: When a user uploads an image, it is converted to a base64 string and sent to the `geminiService`. A sophisticated system instruction is dynamically built based on user-selected options (e.g., "bold keywords"). This prompt, along with a strict JSON schema, instructs the Gemini model to analyze the image, detect its language, and return structured data (title, difficulty, keywords, and HTML/LaTeX content) in the *source language*, which is then used to create a new exercise.
- **Math Rendering**: MathJax is loaded once from the CDN (`tex-svg` build) using `ensureMathJax()`. `MathRenderer` injects HTML (already sanitized upstream) and triggers `typesetElement()` ensuring formulas are reprocessed only when content changes. No React provider layer is required, reducing overhead.

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge).
- A **Google Gemini API Key**.

### Configuration

The application requires a Google Gemini API key to use AI-powered features like image analysis.

1.  Obtain an API key from [Google AI Studio](https://makersuite.google.com/app/apikey).
2.  Open the application and click on the **Settings** icon (cog wheel) in the header.
3.  In the Settings modal, paste your API key into the "Google Gemini API Key" field.
4.  Click "Verify" to ensure the key is working correctly.
5.  Click "Save Settings". The key will be securely stored in your browser's local storage for future sessions.

### Running the Application

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Run in Development Mode**:
    ```bash
    npm run dev
    ```
    This will start the development server with hot-reloading.

3.  **Build for Production**:
    ```bash
    npm run build
    ```
    This will create an optimized `dist` folder ready for deployment.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.