export const API_BASE_URL = "http://127.0.0.1:8000";
export const DEFAULT_REPO_URL =
  "https://github.com/lmhdev/web-dev-tech-assessment";

// Group extensions by type
export const EXTENSION_OPTIONS = [
  // Documentation
  { label: "Markdown", value: ".md" },
  { label: "Text", value: ".txt" },
  { label: "Environment", value: ".env" },

  // Web Development
  { label: "JavaScript", value: ".js" },
  { label: "TypeScript", value: ".ts" },
  { label: "TSX", value: ".tsx" },
  { label: "HTML", value: ".html" },
  { label: "CSS", value: ".css" },
  { label: "SCSS", value: ".scss" },

  // Backend Languages
  { label: "Python", value: ".py" },
  { label: "Java", value: ".java" },
  { label: "PHP", value: ".php" },
  { label: "C#", value: ".cs" },
  { label: "Go", value: ".go" },

  // Systems Programming
  { label: "C++", value: ".cpp" },
  { label: "C", value: ".c" },
  { label: "Rust", value: ".rs" },

  // Mobile Development
  { label: "Swift", value: ".swift" },
  { label: "Kotlin", value: ".kt" },

  // Configuration
  { label: "JSON", value: ".json" },
  { label: "YAML", value: ".yml" },
  { label: "ENV", value: ".env" },
];
