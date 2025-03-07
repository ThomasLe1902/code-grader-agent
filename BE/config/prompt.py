from langchain_core.prompts import PromptTemplate


# Project Analysis Prompts
project_description_generator_prompt = PromptTemplate.from_template(
    """
Generate a concise project description by analyzing this file tree.

File Tree: {file_tree}

Instructions:
1. Identify project type (Frontend/Backend/AI/Full-stack)
2. Specify frameworks and technologies
3. Determine project architecture
4. Note distinctive patterns

Output: 3-5 sentence description of project nature, tech stack, and purpose
"""
)

# Code Relevance Assessment
check_relevant_criteria_prompt = PromptTemplate.from_template(
    """
Assess code relevance to criteria scope

Inputs:
- File tree: {file_tree}
- Current file: {file_name}
- Project description: {project_description}
- Criteria: {criterias}

Rules:
1. Check which part criteria relate to (library, testing, documentation, UI, FE, BE)
2. Return 1 if relevant, 0 if not
3. Consider file extensions (.css, .py, .ts, .java)

Examples:
1. Criteria: Unit test for core logic
   - Styling/docs: 0
   - Unit tests: 1
2. Criteria: Clear README instructions
   - CSS/HTML: 0
   - .md files: 1
"""
)

# Code Review Prompts
analyze_code_files_prompt = PromptTemplate.from_template(
    """
Analyze code against specific criteria

File: {file_name}
Criteria: 
{criterias}
Code: 
{code}

Review Format:
1. Comments:
   - line X: [code] #[issue, suggestion]
   - line Y: [code] #[issue, suggestion]
    Note: Always give briefly suggest improvements to increase rating score (in case score < 5).
    Return in Markdown text

2. Criteria Analysis: Concise assessment with examples (Return in Markdown text)

3. Rating (1-5):
   - 1: Poor
   - 2: Below Average
   - 3: Average
   - 4: Good
   - 5: Excellent

                                           
##Code:
```
{code}
```

                                              
"""
)

# Grading Prompts
grade_code_across_review_prompt = PromptTemplate.from_template(
    """
# Code Quality Assessment
Grade each criterion on a 1-5 scale based on the comprehensive review comments across all files.

#Criteria: 
{criterias}

Review Summary: {review_summary}

Format: Return in Markdown format
Criterion X: **[Title]**
- Summary: [Concise assessment based on cross-file patterns]
- Grade: **[1-5]**

Note: Evaluate each criterion based on the rating and evaluation of all files. Do not evaluate each file.

Rating Scale:
1 = Poor
2 = Below Average
3 = Average
4 = Good
5 = Excellent
"""
)


