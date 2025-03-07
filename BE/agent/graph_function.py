from config.llm import (
    chain_project_description_generator,
    chain_check_relevant_criteria,
    chain_analyze_code_file,
    chain_summarize_code_review,
    CheckRelevantCriteriaOutput,
    AnaLyzeOutput,
)
from utils.helper import (
    format_comment_across_file,
    build_tree,
    input_preparation,
)
from typing import TypedDict, Any, Optional
from loguru import logger


class State(TypedDict):
    selected_files: list[str]
    criterias: str
    project_description: str
    analyze_code_result: list[any]
    grade_criteria: str


class ParentGraphState(TypedDict):
    project_description: Optional[str]
    selected_files: list[str]
    criterias_list: list[str]
    output: Any


async def project_description_generator_fn(state: State):
    logger.info("Generating project description...")
    selected_files = state["selected_files"]
    file_tree = build_tree(selected_files)
    # response = await chain_project_description_generator.ainvoke(
    #     {"file_tree": file_tree}
    # )
    return {"project_description": ""}


async def check_relevant_criteria_fn(state: State):
    logger.info("Checking relevant criteria...")
    criterias = state["criterias"]
    selected_files = state["selected_files"]
    project_description = state["project_description"]

    filter_datas, filter_files = input_preparation(
        selected_files, project_description, criterias, 5000
    )

    check_results: list[CheckRelevantCriteriaOutput] = (
        await chain_check_relevant_criteria.abatch(filter_datas)
    )

    selected_files = [
        file_name
        for file_name, result in zip(selected_files, check_results)
        if result.relevant_criteria == 1
    ]
    if not selected_files:
        return {"selected_files": filter_files}

    return {"selected_files": filter_files}


async def analyze_code_file_fn(state: State):
    logger.info("Analyzing code files...")
    criterias = state["criterias"]
    selected_files = state["selected_files"]
    project_description = state["project_description"]
    filter_datas, _ = input_preparation(
        selected_files, project_description, criterias, 5000
    )
    analysis_results: list[AnaLyzeOutput] = await chain_analyze_code_file.abatch(
        filter_datas
    )

    output = [
        {
            "file_name": data["file_name"],
            "comment": result.comment,
            "criteria_eval": result.criteria_eval,
            "rating": result.rating,
        }
        for data, result in zip(filter_datas, analysis_results)
    ]

    return {"analyze_code_result": output}


async def summarize_code_review_fn(state: State):
    logger.info("Summarizing code review...")
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


async def summarize_code_review_controller(data):
    
    files_name = [item["file_name"] for item in data["analyze_code_result"]]
    analyze_results = data["analyze_code_result"]
    criterias = data["criterias"]
    review_across_files = format_comment_across_file(
        files_name=files_name, analyze_results=analyze_results
    )
    review_response = await chain_summarize_code_review.ainvoke(
        {"criterias": criterias, "review_summary": review_across_files}
    )
    return review_response.content
