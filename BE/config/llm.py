from langchain_openai import AzureChatOpenAI
from config.prompt import (
    project_description_generator_prompt,
    check_relevant_criteria_prompt,
    anaylize_code_files_prompt,
    grade_code_across_review_prompt,
    final_grade_prompt,
)
from pydantic import BaseModel, Field
from typing import Optional
import os


llm_4o_mini = AzureChatOpenAI(
    azure_deployment=os.getenv("AZURE_OPENAI_DEPLOYMENT"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version=os.getenv("API_VERSION"),
)


class CheckRelevantCriteriaOutput(BaseModel):
    relevant_criteria: int = Field(
        ..., description="1 if the criteria is relevant, 0 if not relevant"
    )


class AnaLyzeOutput(BaseModel):
    comment: str = Field(
        ..., description="Comment for the code line need to be improved. Return in Markdown text"
    )
    criteria_eval: str = Field(
        ..., description="Criteria evaluation for the code file. Return in Markdown text"
    )
    rating: int = Field(
        ...,
        description="Status of the code file: 1=Poor, 2=Below Average, 3=Average, 4=Good, 5=Excellent",
    )


chain_project_description_generator = project_description_generator_prompt | llm_4o_mini
chain_check_relevant_criteria = (
    check_relevant_criteria_prompt
    | llm_4o_mini.with_structured_output(CheckRelevantCriteriaOutput)
)
chain_analyze_code_file = (
    anaylize_code_files_prompt | llm_4o_mini.with_structured_output(AnaLyzeOutput)
)
chain_summarize_code_review = grade_code_across_review_prompt | llm_4o_mini
chain_final_grade = final_grade_prompt | llm_4o_mini
