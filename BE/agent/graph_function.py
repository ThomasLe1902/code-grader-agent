from config.llm import (
    chain_project_description_generator,
    chain_check_relevant_criteria,
    chain_analyze_code_file,
    chain_summarize_code_review,
    CheckRelevantCriteriaOutput,
    AnaLyzeOutput,
)

from utils.helper import read_file, format_comment_across_file, build_tree
from typing import TypedDict, Any
import os


class State(TypedDict):
    selected_files: list[str]
    criterias: str
    project_description: str
    analyze_code_result: list[any]
    grade_criteria: str


def start_flow_fn(state: State):
    print("Start flow")
    return {}


async def project_description_generator_fn(state: State):
    selected_files = state["selected_files"]
    file_tree = build_tree(selected_files)
    response = await chain_project_description_generator.ainvoke(
        {"file_tree": file_tree}
    )
    return {"project_description": response.content}


async def check_relevant_criteria_fn(state: State):
    criterias = state["criterias"]
    selected_files = state["selected_files"]
    project_description = state["project_description"]
    read_files = [read_file(file) for file in selected_files]

    input_data = [
        {
            "criterias": criterias,
            "file_name": file_name,
            "code": file_content,
            "project_description": project_description,
        }
        for file_name, file_content in zip(selected_files, read_files)
    ]

    check_results: list[CheckRelevantCriteriaOutput] = (
        await chain_check_relevant_criteria.abatch(input_data)
    )

    selected_files = [
        file_name
        for file_name, result in zip(selected_files, check_results)
        if result.relevant_criteria == 1
    ]
    if not selected_files:
        return {"selected_files": []}

    return {"selected_files": selected_files}


async def analyze_code_file_fn(state: State):
    criterias = state["criterias"]
    selected_files = state["selected_files"]
    read_files = [read_file(file) for file in selected_files]

    input_data = [
        {"criterias": criterias, "file_name": file_name, "code": file_content}
        for file_name, file_content in zip(selected_files, read_files)
    ]

    analysis_results: list[AnaLyzeOutput] = await chain_analyze_code_file.abatch(
        input_data
    )

    output = [
        {
            "file_name": data["file_name"],
            "comment": result.comment,
            "criteria_eval": result.criteria_eval,
            "status": result.status,
        }
        for data, result in zip(input_data, analysis_results)
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
