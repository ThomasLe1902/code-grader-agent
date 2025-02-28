from langchain_core.prompts import PromptTemplate



check_relevant_criteria_prompt = PromptTemplate.from_template("""
Determine if this code file is relevant to the given evaluation criteria.
Code: 
{code}
                                                              
Criteria:
{criterias}

Instructions:
1. Analyze what code features/elements are present
2. Check each criterion against these features
3. Examples: Function files ≠ Testing criteria; Any code = Naming conventions

Output ONLY:
1 - if >50% of criteria apply to this code
0 - if <50% of criteria apply to this code
""")


anaylize_code_files_prompt = PromptTemplate.from_template("""
# Code Analysis Agent
You are an expert code reviewer who provides precise, actionable feedback based on specific criteria. Analyze ONLY the provided code file against the given criteria.

## File Information
- File Name: {file_name}

## Evaluation Criteria
{criterias}
                                                          
Please provide a comprehensive code review with the following sections:

1. Comments: comment on code lines needing improvement or clarification.(if all lines are good, perfect then leave it blank)
Example:
        line 15 : const API_key = '1234' #should be stored in a .env file.
        line 20:  def funtion_name():  #should be more descriptive. 
        ...
2. Criteria-Based Analysis: Evaluate the code against each of the provided criteria concise and enough (return markdown explanation).
3. status: If it 1: bad (fatal error), 2: acceptable, 3: perfect.

                                                                                                               

Code:
```
{code}
```

                                              
""")


grade_code_across_review_prompt = PromptTemplate.from_template("""
You are an expert in grade code based on review comments with the following criteria to analyze the code file.
Your task is grade the code files based on the review comments.
Grade 1-5 for each criteria based on the review comments across all files.
                                                            
My criterias are:
{criterias}

Review Summary acroos all files:
{review_summary}

                                                            
Example output:
                                                               
Criteria 1: 
- Comment: comment for criteria 1
- Criteria Evaluation: grade 1-5
Criteria 2: 
- Comment: comment for criteria 2
- Criteria Evaluation: grade 1-5
Criteria N: 
- Comment: comment for criteria N
- Criteria Evaluation: grade 1-5
                                              




...

""")

final_grade_prompt = PromptTemplate.from_template("""
You are an expert in Total Review With All Criteria with the following criteria to analyze the code file.

{criteria}
                                                  

All Summary:
{all_summary}
                                                  

""")                                        
