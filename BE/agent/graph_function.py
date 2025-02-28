from config.llm import (
    chain_analyze_code_file,
    chain_summarize_code_review,
    chain_final_grade,
    AnaLyzeOutput,
)

from utils.helper import read_file, format_comment_across_file
from typing import TypedDict, Any
import os
class State(TypedDict):
    selected_files: list[str]
    criterias: str
    analyze_code_result: list[any]
    grade_criteria: str


async def analyze_code_file_fn(state: State):
    criterias = state["criterias"]
    selected_files = state["selected_files"]
    read_files = [read_file(file) for file in state["selected_files"]]
    input_for_analyze = [
        {"criterias": criterias, "file_name": file_name, "code": file_content}
        for file_name, file_content in zip(selected_files, read_files)
    ]
    results: list[AnaLyzeOutput] = await chain_analyze_code_file.abatch(
        input_for_analyze
    )
    output = [
        {
            "file_name": selected_files[index],
            "comment": result.comment,
            "criteria_eval": result.criteria_eval,
            "status": result.status,
        }
        for index, result in enumerate(results)
    ]
    return {"analyze_code_result": output}


async def summarize_code_review_fn(state: State):
    criterias = state["criterias"]
    selected_files = state["selected_files"]
    analyze_code_result = state["analyze_code_result"]

    review_across_files = format_comment_across_file(
        selected_files, analyze_code_result
    )

    review_response = await chain_summarize_code_review.ainvoke(
        {"criterias": criterias, "review_summary": review_across_files}
    )
    return {"grade_criteria": review_response.content}
