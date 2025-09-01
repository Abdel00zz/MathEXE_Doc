
import { useState, useEffect, useCallback, useMemo } from 'react';

// By embedding the translations directly, we avoid issues with JSON module imports (import assertions)
// which are not universally supported, and also eliminate any runtime fetching.
const enTranslations = {
  "appName": "Mathify",
  "dashboard": {
    "title": "My Documents",
    "newDocument": "New Document",
    "import": "Import Documents",
    "noDocuments": "No documents yet.",
    "createFirst": "Create your first document to get started!",
    "documentCard": {
      "exercises": "exercises",
      "class": "Class",
      "year": "Year",
      "lastModified": "Modified"
    }
  },
  "documentEditor": {
    "backToDashboard": "Back to documents",
    "addExercise": "Add exercise",
    "addFromImage": "Add from image",
    "export": "Print",
    "noExercises": "This document is empty.",
    "addFirstExercise": "Add your first exercise manually or from an image."
  },
  "modals": {
    "newDocument": {
      "createTitle": "Create New Document",
      "editTitle": "Edit Document",
      "titleLabel": "Title",
      "titlePlaceholder": "e.g., Algebra Test",
      "classLabel": "Class",
      "classPlaceholder": "e.g., Grade 11",
      "yearLabel": "School Year",
      "yearPlaceholder": "e.g., 2023-2024",
      "create": "Create",
      "update": "Update"
    },
    "editExercise": {
      "createTitle": "New Exercise",
      "editTitle": "Edit Exercise",
      "titleLabel": "Title",
      "difficultyLabel": "Difficulty",
      "keywordsLabel": "Keywords (comma-separated)",
      "contentLabel": "Content (HTML + LaTeX)",
      "preview": "Preview",
      "save": "Save Changes"
    },
    "export": {
      "title": "Print Preview",
      "columns": "Layout",
      "one_column": "Single Column",
      "two_columns": "Two Columns",
      "fontSize": "Text size",
      "small": "Small",
      "medium": "Medium",
      "large": "Large",
      "theme": "Print mode",
      "color": "Color",
      "default": "Default",
      "inkSaver": "Ink saver",
      "highContrast": "High Contrast",
      "display": "Display",
      "showDifficulty": "Show difficulty",
      "showKeywords": "Show keywords",
      "showTitles": "Show titles",
      "print": "Print",
      "print_preview": "Print Preview",
      "download": "Download",
      "download_started": "Download started...",
      "generation_error": "Error generating file."
    },
    "settings": {
      "title": "Settings",
      "geminiApiKey": "Google Gemini API Key",
      "geminiApiKeyPlaceholder": "Enter your Google Gemini API Key",
      "verifyConnection": "Verify",
      "verification": {
        "verifying": "Verifying...",
        "valid": "Connection successful!",
        "invalid": "Invalid API Key or connection failed."
      },
      "language": "Language",
      "teacherName": "Teacher's Name",
      "schoolId": "School ID/Number",
      "save": "Save Settings"
    },
  "autoAnalyzeImages": "Auto analyze images",
  "autoAnalyzeImagesHint": "If enabled, analysis starts automatically when images are added.",
    "help": {
      "title": "Help & About",
      "editingTitle": "Editing Content",
      "editingText": "You can edit document titles by clicking on them. Exercises can be modified using the 'Edit' button. To reorder exercises, use the up and down arrow buttons on each exercise card.",
      "syntaxTitle": "Content Syntax",
      "syntaxText": "The exercise content field accepts a mix of HTML for formatting and LaTeX for mathematical notation.",
      "inlineMath": "For inline formulas, wrap your LaTeX with \\(...\\). Example:",
      "displayMath": "For larger, centered formulas, wrap your LaTeX with \\[...\\]. Example:",
      "aiTitle": "AI Features",
      "aiText": "Use the 'Add from Image' button to let our AI analyze and transcribe your exercises automatically. In the upload window, you can choose to have the AI bold key terms for you.",
      "about": "About Mathify",
      "aboutText": "Mathify is an innovative educational platform for math teachers and students. It uses AI to analyze images of math exercises, automatically extracting content, structure, and LaTeX formulas to streamline the creation of structured mathematical documents.",
      "contact": "Contact & Support",
      "creditsTitle": "Credits",
      "creditsText": "Crafted with ❤️ and ☕ by Boudouh Abdelmalek in Morocco 🇲🇦. You can reach me at bdh.malek@gmail.com."
    },
    "confirm": {
      "title": "Are you sure?",
      "text": "This action cannot be undone.",
      "confirm": "Confirm",
      "cancel": "Cancel"
    },
    "imageUpload": {
      "title": "Add from Images",
      "uploadArea": "Click to browse or drag images here",
      "processing": "Analyzing images...",
      "error": "An error occurred during analysis.",
      "addExercises": "Add {count} Exercises",
      "analysisResult": "Analysis Result",
      "analyze_count": "Analyze {count} Images",
      "clear_all": "Clear All",
      "queue_status_waiting": "Waiting",
      "queue_status_analyzing": "Analyzing...",
      "queue_status_success": "Success",
      "queue_status_error": "Error",
      "optionsTitle": "Analysis Options",
      "boldKeywords": "Bold keywords in content",
      "reviseText": "Correct spelling & grammar",
      "suggestHints": "Suggest hints for questions",
      "apiKeyMissing": "API Key is missing or invalid. Please configure it in settings.",
      "apiKeyNeededTitle": "API Key Required",
      "apiKeyNeededDescription": "Please add your Google Gemini API key in the settings to enable image analysis."
    }
  },
  "actions": {
    "edit": "Edit",
    "duplicate": "Duplicate",
    "delete": "Delete",
    "close": "Close",
    "cancel": "Cancel",
    "open": "Open",
    "export": "Export",
  "exportJson": "Export JSON",
  "actions": "Actions",
  "enabled": "Enabled",
  "disabled": "Disabled"
  },
  "tooltips": {
    "settings": "Settings",
    "help": "Help",
    "actions": "Actions",
    "moveUp": "Move Up",
    "moveDown": "Move Down"
  }
};

const frTranslations = {
  "appName": "Mathify",
  "dashboard": {
    "title": "Mes Documents",
    "newDocument": "Nouveau Document",
    "import": "Importer des documents",
    "noDocuments": "Aucun document pour l'instant.",
    "createFirst": "Créez votre premier document pour commencer !",
    "documentCard": {
      "exercises": "exercices",
      "class": "Classe",
      "year": "Année",
      "lastModified": "Modifié"
    }
  },
  "documentEditor": {
    "backToDashboard": "Retour aux documents",
    "addExercise": "Ajouter un exercice",
    "addFromImage": "Ajouter depuis une image",
    "export": "Imprimer",
    "noExercises": "Ce document est vide.",
    "addFirstExercise": "Ajoutez votre premier exercice manuellement ou depuis une image."
  },
  "modals": {
    "newDocument": {
      "createTitle": "Créer un nouveau document",
      "editTitle": "Modifier le document",
      "titleLabel": "Titre",
      "titlePlaceholder": "ex: Contrôle d'algèbre",
      "classLabel": "Classe",
      "classPlaceholder": "ex: Terminale S",
      "yearLabel": "Année Scolaire",
      "yearPlaceholder": "ex: 2023-2024",
      "create": "Créer",
      "update": "Mettre à jour"
    },
    "editExercise": {
      "createTitle": "Nouvel Exercice",
      "editTitle": "Modifier l'exercice",
      "titleLabel": "Titre",
      "difficultyLabel": "Difficulté",
      "keywordsLabel": "Mots-clés (séparés par une virgule)",
      "contentLabel": "Contenu (HTML + LaTeX)",
      "preview": "Aperçu",
      "save": "Enregistrer"
    },
  "autoAnalyzeImages": "Analyse auto des images",
  "autoAnalyzeImagesHint": "Si activé, l'analyse démarre automatiquement après l'ajout d'images.",
    "export": {
      "title": "Aperçu avant impression",
      "columns": "Mise en page",
      "one_column": "Une colonne",
      "two_columns": "Deux colonnes",
      "fontSize": "Taille du texte",
      "small": "Petite",
      "medium": "Moyenne",
      "large": "Grande",
      "theme": "Mode d'impression",
      "color": "Couleur",
      "default": "Défaut",
      "inkSaver": "Économie d'encre",
      "highContrast": "Contraste élevé",
      "display": "Affichage",
      "showDifficulty": "Afficher la difficulté",
      "showKeywords": "Afficher les mots-clés",
      "showTitles": "Afficher les titres",
      "print": "Imprimer",
      "print_preview": "Aperçu avant impression",
      "download": "Télécharger",
      "download_started": "Téléchargement commencé...",
      "generation_error": "Erreur lors de la génération du fichier."
    },
    "settings": {
      "title": "Paramètres",
      "geminiApiKey": "Clé API Google Gemini",
      "geminiApiKeyPlaceholder": "Entrez votre clé API Google Gemini",
      "verifyConnection": "Vérifier",
      "verification": {
        "verifying": "Vérification...",
        "valid": "Connexion réussie !",
        "invalid": "Clé API invalide ou échec de la connexion."
      },
      "language": "Langue",
      "teacherName": "Nom de l'enseignant",
      "schoolId": "Numéro d'établissement",
      "save": "Enregistrer"
    },
    "help": {
      "title": "Aide & À propos",
      "editingTitle": "Modifier le Contenu",
      "editingText": "Vous pouvez modifier les titres des documents en cliquant dessus. Les exercices peuvent être modifiés via le bouton 'Modifier'. Pour réorganiser les exercices, utilisez les boutons fléchés haut et bas sur chaque carte d'exercice.",
      "syntaxTitle": "Syntaxe du Contenu",
      "syntaxText": "Le champ de contenu des exercices accepte un mélange de HTML pour la mise en forme et de LaTeX pour les notations mathématiques.",
      "inlineMath": "Pour les formules en ligne, entourez votre code LaTeX avec \\(...\\). Exemple :",
      "displayMath": "Pour les formules plus grandes et centrées, entourez votre code LaTeX avec \\[...\\]. Exemple :",
      "aiTitle": "Fonctionnalités IA",
      "aiText": "Utilisez le bouton 'Ajouter depuis une image' pour que notre IA analyse et transcrive automatiquement vos exercices. Dans la fenêtre d'import, vous pouvez choisir que l'IA mette les mots-clés en gras pour vous.",
      "about": "À propos de Mathify",
      "aboutText": "Mathify est une plateforme éducative innovante pour les enseignants et étudiants en mathématiques. Elle utilise l'IA pour analyser des images d'exercices, extrayant automatiquement le contenu, la structure et les formules LaTeX pour faciliter la création de documents mathématiques.",
      "contact": "Contact & Support",
      "creditsTitle": "Crédits",
      "creditsText": "Créé avec ❤️ et ☕ par Boudouh Abdelmalek au Maroc 🇲🇦. Vous pouvez me contacter à bdh.malek@gmail.com."
    },
    "confirm": {
      "title": "Êtes-vous sûr ?",
      "text": "Cette action est irréversible.",
      "confirm": "Confirmer",
      "cancel": "Annuler"
    },
    "imageUpload": {
      "title": "Ajouter depuis des Images",
      "uploadArea": "Cliquez pour parcourir ou glissez des images ici",
      "processing": "Analyse des images...",
      "error": "Une erreur est survenue lors de l'analyse.",
      "addExercises": "Ajouter {count} exercices",
      "analysisResult": "Résultat de l'analyse",
      "analyze_count": "Analyser {count} images",
      "clear_all": "Tout effacer",
      "queue_status_waiting": "En attente",
      "queue_status_analyzing": "Analyse...",
      "queue_status_success": "Succès",
      "queue_status_error": "Erreur",
      "optionsTitle": "Options d'analyse",
      "boldKeywords": "Mettre les mots-clés en gras",
      "reviseText": "Rectifier l'orthographe et le lexique",
      "suggestHints": "Suggérer des indications pour les questions",
      "apiKeyMissing": "Clé API manquante ou invalide. Veuillez la configurer dans les paramètres.",
      "apiKeyNeededTitle": "Clé API requise",
      "apiKeyNeededDescription": "Veuillez ajouter votre clé API Google Gemini dans les paramètres pour activer l'analyse d'images."
    }
  },
  "actions": {
    "edit": "Modifier",
    "duplicate": "Dupliquer",
    "delete": "Supprimer",
    "close": "Fermer",
    "cancel": "Annuler",
    "open": "Ouvrir",
    "export": "Exporter",
  "exportJson": "Exporter JSON",
  "actions": "Actions",
  "enabled": "Activé",
  "disabled": "Désactivé"
  },
  "tooltips": {
    "settings": "Paramètres",
    "help": "Aide",
    "actions": "Actions",
    "moveUp": "Déplacer vers le haut",
    "moveDown": "Déplacer vers le bas"
  }
};

const translations = {
  en: enTranslations,
  fr: frTranslations,
};

const flatTranslationCache: { [key: string]: Record<string, string> } = {};

const flattenObject = (obj: any, prefix: string = ''): Record<string, string> => {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + '.' : '';
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {} as Record<string, string>);
};

export function useI18n(language: 'en' | 'fr') {
  const flatLocale = useMemo(() => {
    if (flatTranslationCache[language]) {
      return flatTranslationCache[language];
    }
    const rawLocale = translations[language] || translations['en'];
    const flattened = flattenObject(rawLocale);
    flatTranslationCache[language] = flattened;
    return flattened;
  }, [language]);

  const t = useCallback((path: string, replacements?: Record<string, string | number>): string => {
    if (!flatLocale) {
      return path;
    }
    
    let str = flatLocale[path] || path;

    if (replacements && typeof str === 'string') {
        for (const key in replacements) {
            str = str.replace(`{${key}}`, String(replacements[key]));
        }
    }
    
    return str;
  }, [flatLocale]);

  return { t, isLoading: false, error: null };
}
