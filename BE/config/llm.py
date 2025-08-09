from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
from config.prompt import (
    organized_project_structure_grade_prompt,
    project_description_generator_prompt,
    check_relevant_criteria_prompt,
    analyze_code_files_prompt,
    grade_code_across_review_prompt,
)
from pydantic import BaseModel, Field
import os
from loguru import logger

# Load .env file from the BE directory
import pathlib
current_dir = pathlib.Path(__file__).parent.parent  # Go up to BE directory
env_path = current_dir / '.env'
load_dotenv(env_path, override=True)

# Validate required environment variables
required_env_vars = ["OPENROUTER_API_KEY"]
api_key = os.getenv("OPENROUTER_API_KEY")

# Validation will be handled by the API call itself

# Use the hardcoded API key for now to ensure it works
OPENROUTER_API_KEY = "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"

print(f"Using API key: {OPENROUTER_API_KEY[:20]}...")
print(f"Using model: google/gemini-flash-1.5")

llm = ChatOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
    model="google/gemini-flash-1.5",  # Gemini Flash 1.5 (available on OpenRouter)
    temperature=0.1,
    default_headers={
        "HTTP-Referer": "http://localhost:8000",
        "X-Title": "Code Grader Agent",
    }
)


class CheckRelevantCriteriaOutput(BaseModel):
    relevant_criteria: bool = Field(
        ...,
        description="True if the criteria is designed to evaluate the file content Else return False",
    )


class AnaLyzeOutput(BaseModel):
    comment: str = Field(
        ...,
        description="Comment for the code line need to be improved. Return in Markdown text",
    )
    criteria_eval: str = Field(
        ...,
        description="Criteria evaluation for the code file. Return in Markdown text",
    )
    rating: int = Field(
        ...,
        description="Status of the code file: 1=Poor, 2=Below Average, 3=Average, 4=Good, 5=Excellent",
    )


chain_organized_project_structure_grade = (
    organized_project_structure_grade_prompt | llm
)
chain_project_description_generator = project_description_generator_prompt | llm
chain_check_relevant_criteria = (
    check_relevant_criteria_prompt | llm
)
chain_analyze_code_file = (
    analyze_code_files_prompt | llm
)
chain_summarize_code_review = grade_code_across_review_prompt | llm


# chain_final_grade = final_grade_prompt | llm_4o_mini
