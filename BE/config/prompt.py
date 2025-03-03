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

check_relevant_criteria_prompt = PromptTemplate.from_template(
    """
Assess if this code file is relevant to the given evaluation criteria.

Project Description:
{project_description}
                                                              
File: {file_name}
                                                              
Code:
```
{code}
```


Criteria:
{criterias}

Instructions:
1. Identify key code elements present (functions, classes, tests, etc.)
2. Determine which criteria directly apply to these elements
3. Note: All code files can be evaluated for standards like naming conventions, but specialized criteria (testing, security) only apply to relevant files

Output ONLY:
1 - if file can be meaningfully evaluated against ≥50% of criteria
0 - if file can be meaningfully evaluated against <50% of criteria
"""
)


anaylize_code_files_prompt = PromptTemplate.from_template(
"""# Code Review
Analyze this code against specific criteria as an expert reviewer.

## File: {file_name}

## Criteria
{criterias}
                                                          
## Review Format

1. Issues (leave blank if none):
    line X: [code snippet] - [specific issue]
    line Y: [code snippet] - [specific issue]
2. Criteria Analysis:
For each criterion, provide concise assessment with specific examples. And briefly suggest improvements to increase rating score.
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

## Output Format:
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
