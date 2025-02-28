from langchain_openai import AzureChatOpenAI
from config.prompt import (
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


class AnaLyzeOutput(BaseModel):
    comment: Optional[str] = Field(
        ..., description="Comment for the code line need to be improved"
    )
    criteria_eval: Optional[str] = Field(..., description="Criteria evaluation for the code file")
    status: int = Field(
        ...,
        description="Status of the code file in range 1-4 (bad - not related - acceptable - perfect)",
    )


chain_analyze_code_file = (
    anaylize_code_files_prompt | llm_4o_mini.with_structured_output(AnaLyzeOutput)
)
chain_summarize_code_review = grade_code_across_review_prompt | llm_4o_mini
chain_final_grade = final_grade_prompt | llm_4o_mini
