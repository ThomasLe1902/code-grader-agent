from langchain_core.prompts import PromptTemplate


project_description_generator_prompt = PromptTemplate.from_template(
    """
Generate a concise project description by analyzing this file tree.

File Tree:
{file_tree}

Instructions:
1. Identify the project type (Frontend/Backend/AI/Full-stack)
2. Specify frameworks and technologies (e.g., Vite, FastAPI, Node.js, React)
3. Determine project architecture/structure
4. Note any distinctive patterns or features

Create a 3-5 sentence description that clearly identifies the project's nature, tech stack, and purpose to help determine code evaluation relevance.
"""
)

# check_relevant_criteria_prompt = PromptTemplate.from_template(
#     """
# Evaluate Code Relevance to Criteria Scope

# Folder tree: {file_tree}

# # Criteria: {criterias}



# Code content in file name: {file_name}

# <CODE_CONTENT>
# {code}
# <CODE_CONTENT/>

# Strict Relevance Assessment:
# 1. Direct Scope Check:
#    - Does the code EXPLICITLY address ANY of the specified criteria?
#    - Is the code type/technology mentioned in criteria?

# 2. Immediate Disqualification Conditions:
#    - Code unrelated to ANY criteria
#    - No matching technology or evaluation domain

# Output Rules:
# - 1 = Code DIRECTLY in evaluation scope
# - 0 = Code OUTSIDE evaluation scope

# Key Decision Factors:
# - Precise criteria match
# - Technology alignment
# - Direct relevance

# """
# )
check_relevant_criteria_prompt = PromptTemplate.from_template(
    """Are you an expert in assessing the relevance of the code scoring criteria to the code content in the field that the criteria refer to?
#Guide.
Read the requirements carefully
Check which part the scoring criteria relate to. Example (library, testing, documention, UI, FE, BE).
If the scope of the evaluation criteria and the code are related to the criteria, return 1, otherwise return 0
Example:
1. Criteria: Unit test for core logic
    If Code content related to styling or documentation, return 0. Code content related unit test for core logic, return 1
2. Criteria:  Clear instructions in (README.md) file
    If Code content is about css, html, testing files, return 0. If .md file return 1
3. Criteria: Consistent naming conventions
    If Code content is about HTML, CSS files, return 0. If Files related to logic processing or test files can be matched because they have variable naming methods inside.

Note: Pay attention to the file extension (.css, .py, .ts, .java,...) to easily identify whether relevant or not.

File tree: {file_tree}

Current file need to check: {file_name}

project description: {project_description}

My criterias{criterias}

"""
)


anaylize_code_files_prompt = PromptTemplate.from_template(
    """# Code Review
Analyze this code against specific criteria as an expert reviewer.

## File: {file_name}

## Criteria
{criterias}
                                                          
## Review Format

1. Comments:
    line X(number): [code snippet]  #[specific issue, comment on issue]
    line Y(number): [code snippet]  #[specific issue, comment on issue]
    Note: Always give briefly suggest improvements to increase rating score (in case score < 5). Return in Markdown text

2. Criteria Analysis:
    For each criterion, provide concise assessment with specific examples. Return in Markdown text

3. Rating:
- 1: Poor (major issues, fails multiple criteria)
- 2: Below Average (significant improvements needed)
- 3: Average (meets minimum standards)
- 4: Good (minor issues only)
- 5: Excellent (meets or exceeds all criteria)
                                           
##Code:
```
{code}
```

                                              
"""
)


grade_code_across_review_prompt = PromptTemplate.from_template(
    """
# Code Quality Assessment
Grade each criterion on a 1-5 scale based on the comprehensive review comments across all files.

## Criteria:
{criterias}

## Review Summary:
{review_summary}

## Output Format (Return in Markdown text): 
For each criterion:

Criterion X: [Title]
- Summary: [Concise assessment based on cross-file patterns]
- Grade: [1-5]

Rating Scale:
1 = Poor (major issues)
2 = Below Average (significant concerns)
3 = Average (meets minimum standards)
4 = Good (exceeds standards)
5 = Excellent (exemplary)
"""
)

final_grade_prompt = PromptTemplate.from_template(
    """
You are an expert in Total Review With All Criteria with the following criteria to analyze the code file.

{criteria}
                                                  

All Summary:
{all_summary}
                                                  

"""
)
