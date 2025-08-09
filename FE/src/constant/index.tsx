import { StatusConfig } from "../types";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
export const DEFAULT_REPO_URL = import.meta.env.VITE_DEFAULT_REPO_URL ||
  "https://github.com/lmhdev/web-dev-tech-assessment";

export const EXTENSION_OPTIONS = [
  { label: "Markdown", value: ".md" },
  { label: "Text", value: ".txt" },
  { label: "Environment", value: ".env" },
  { label: "Gitignore", value: ".gitignore" },
  { label: "Dockerfile", value: ".dockerfile" },

  { label: "JavaScript", value: ".js" },
  { label: "TypeScript", value: ".ts" },
  { label: "TSX", value: ".tsx" },
  { label: "HTML", value: ".html" },
  { label: "CSS", value: ".css" },
  { label: "SCSS", value: ".scss" },

  { label: "Python", value: ".py" },
  { label: "Java", value: ".java" },
  { label: "PHP", value: ".php" },
  { label: "C#", value: ".cs" },
  { label: "Go", value: ".go" },

  { label: "C++", value: ".cpp" },
  { label: "C", value: ".c" },
  { label: "Rust", value: ".rs" },

  { label: "Swift", value: ".swift" },
  { label: "Kotlin", value: ".kt" },

  { label: "JSON", value: ".json" },
  { label: "YAML", value: ".yml" },
];
export const DEFAULT_CRITERIA_FE = [
  `Project Setup & Environment
  * Proper Folder Structure: Organized project structure (e.g., components/, pages/, hooks/, utils/). Separation of concerns (API calls, UI logic, reusable components).
  * Environment Variables Handling: Sensitive keys or configurations are handled via .env (not hardcoded).
  * Package Management: 
    - Should not include node_modules/, .venv/, venv/, env/, dist/, build/ folders
    - Rate 0 or Fail if contains environment-related folders
  * Git Configuration:
    - Should have proper .gitignore
    - Should ignore all environment-related folders`,

  `Code Quality & Best Practices:
* Clean & Readable Code: Proper indentation, formatting, and structure. Meaningful variable and function names.
* Component Structure: Uses functional components and hooks (avoids unnecessary class components).Components are reusable, modular, and follow SRP. Proper use of props and state (minimizes prop drilling, uses context/state management).
* State Management: Uses useState, useEffect, useReducer, or context effectively. Avoids unnecessary re-renders (e.g., useMemo, useCallback).
* Error Handling: Handles API errors properly (try/catch, error boundaries).Prevents app crashes with proper error messages and fallback UI.
* Code Consistency: Follows a consistent coding style (Prettier, ESLint). Uses a defined naming convention (camelCase for variables/functions, PascalCase for components).
* No Unnecessary Code: No console.logs, unused imports, or commented-out code. Cleans up side effects (useEffect cleanup functions).`,

  `UI/UX & Responsiveness:
* Layout & Design: UI follows the given design/mockup. Uses CSS frameworks or maintains structured styles.
* Responsiveness: Provides keyboard navigation and focus states. Ensures good color contrast and readable fonts
* Accessibility (a11y): Provides keyboard navigation and focus states. Ensures good color contrast and readable fonts.
* User Interactivity: Provides feedback for user actions (e.g., loading indicators, success/error messages).Clickable elements (buttons, links) have proper states (hover, active, disabled).`,

  `API Integration & Performance
* Efficient API Calls: Uses fetch, axios, or other methods properly. Avoids unnecessary API calls (debounces search, optimizes re-fetching).
* Loading & Error States: Shows loaders while fetching data. Displays proper error messages if API fails.`,

  `Testing & Debugging:
* Basic Unit/Integration Tests: Has test cases using Jest or React Testing Library. Test coverage > 80%
* No Console Errors or Warnings: Console is free of errors and major warnings. No failed prop type warnings.`,

  `Documentation & Git Usage:
* README.md: Deployment link (Vercel or Netlify). Clear setup and run instructions. Project structure overview. Lists dependencies and tools used. 
  Explains assumptions or key design choices. Includes screenshots of desktop/mobile layouts, error handling screen, and test coverage result.`,
];
export const DEFAULT_CRITERIA_BE = [
  `Project Setup & Environment
* Proper Folder Structure
  - Organized project structure (e.g., controllers/, services/, utils/,...)
  - Separation of concerns:
      +  Aspect: Modularity, maintainability, reusability, clarity, testing.
      +  Example: Pattern, API design.
* Environment Variables Handling: Sensitive keys or configurations are handled via .env (not hardcoded).
* Package Management: 
  - Should not include node_modules/, .venv/, venv/, env/, dist/, build/ folders
  - Rate 0 or Fail if contains environment-related folders
* Git Configuration:
  - Should have proper .gitignore
  - Should ignore all environment-related folders
`,

  `Code Quality & Best Practices:
* Consistent Coding Style: Use a Style Guide: Use a Style Guide: Follow a style guide like Airbnb's or Google's JavaScript Style Guide.
Follows a consistent coding style (Prettier, ESLint)
* No Unnecessary Code: No console.logs, unused imports, or commented-out code.`,

  `API Design:
* API Design: RESTful Principles: Follow RESTful principles for designing APIs, using appropriate HTTP methods (GET, POST, PUT, DELETE).
The request and response must match with requirement from customer.
* Database: For this assessment, the current approach should involve splitting into three tables: teachers, students, and teacher_student. 
          The table for notifications is optional.
          Should implement migrations and seed the database.
          Adopting a code-first approach is advantageous.
* Logic: Must match with requirements. It's essential to address both happy cases and edge cases
* Input Validation: Use any libraries (e.g., Joi, express-validator, class-validator, class-transformer) to validate incoming data to prevent security vulnerabilities (e.g., SQL injection, XSS).
* Error Handling: Handles API errors properly (try/catch, centralized error handling,...).Prevents app crashes with proper error messages. Use Promises or Async/Await: Handle asynchronous code effectively with Promises or async/await syntax to avoid callback hell.
* Use DTOs: Use DTOs to define the structure of the data being sent to and from the API
* Logging: Use a Logging Library: Implement logging using libraries like Winston or Bunyan to capture logs at various levels (info, error, debug).`,

  `Testing & Debugging & Deploy:
*Has test cases using Jest.
*Test coverage > 80%
*Use docker or any publicly accessible hosting environment
`,

  `Documentation & Git Usage:
* API Documentation: Use tools like Swagger or Postman to document your APIs for easier consumption by clients.
* README.md: Clear setup and run instructions. 
  Project structure overview. 
  Lists dependencies and tools used. 
  Explains assumptions or key design choices. 
  Includes screenshots of API result, error handling screen, and test coverage result.
  Can refer some samples from success case`,
];
export const statusConfig: StatusConfig = {
  1: {
    text: "Poor",
    color: "red",
    description: "Major issues, fails multiple criteria",
  },
  2: {
    text: "Below Average",
    color: "volcano",
    description: "Significant improvements needed",
  },
  3: {
    text: "Average",
    color: "orange",
    description: "Meets minimum standards",
  },
  4: {
    text: "Good",
    color: "green",
    description: "Minor issues only",
  },
  5: {
    text: "Excellent",
    color: "cyan",
    description: "Meets or exceeds all criteria",
  },
};
