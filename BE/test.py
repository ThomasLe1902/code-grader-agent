from dotenv import load_dotenv

load_dotenv()

from agent.graph_flow import agent_graph

path_files = [
    "web-dev-tech-assessment/src/pages/Home.tsx",
    "web-dev-tech-assessment/src/types/index.ts",
    "web-dev-tech-assessment/src/components/search/SearchBar.tsx",
    "web-dev-tech-assessment/src/components/search/SearchContainer.tsx",
]
criterias_list = [
    "Code Quality & Best Practices:\n* Clean & Readable Code: Proper indentation, formatting, and structure. Meaningful variable and function names.\n* Component Structure: Uses functional components and hooks (avoids unnecessary class components).Components are reusable, modular, and follow SRP. Proper use of props and state (minimizes prop drilling, uses context/state management).\n* State Management: Uses useState, useEffect, useReducer, or context effectively. Avoids unnecessary re-renders (e.g., useMemo, useCallback).\n* Error Handling: Handles API errors properly (try/catch, error boundaries).Prevents app crashes with proper error messages and fallback UI.\n* Code Consistency: Follows a consistent coding style (Prettier, ESLint). Uses a defined naming convention (camelCase for variables/functions, PascalCase for components).\n* No Unnecessary Code: No console.logs, unused imports, or commented-out code. Cleans up side effects (useEffect cleanup functions).",
    "API Integration & Performance\n * Efficient API Calls: Uses fetch, axios, or other methods properly. Avoids unnecessary API calls (debounces search, optimizes re-fetching).\n* Loading & Error States: Shows loaders while fetching data. Displays proper error messages if API fails.",
]
initial_input = {
    "selected_files": path_files,
    "criterias_list": criterias_list,
    "project_description": "",
}


async def main():

    async for event in agent_graph.astream(
        input=initial_input,
        subgraphs=True,
    ):
        _, sub_event = event
        main_key: str = list(sub_event.keys())[0]
        print(main_key)
        sub_event: dict = sub_event[main_key]
        criteria = sub_event.get("criteria_index", None)
        if not criteria:

            continue
        main_key_processed = main_key.replace("_", " ")
        print(f"Processing step '{main_key_processed}' of criteria index {criteria}")


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
