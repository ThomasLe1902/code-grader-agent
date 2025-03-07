from dotenv import load_dotenv

load_dotenv(override=True)
from typing import List, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from utils.helper import (
    list_code_files_in_repository,
    create_file_tree,
    filter_file_paths,
    build_tree,
    read_file,
)
from agent.graph_function import (
    chain_project_description_generator,
    summarize_code_review_controller,
)
from pydantic import BaseModel, Field, conlist
import uvicorn
from agent.graph_flow import grade_code
from config.constants import SUPPORTED_EXTENSIONS

app = FastAPI(docs_url="/")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ProjectDescription(BaseModel):
    selected_files: List[str] = Field("None")


@app.post("/project_description_generation", status_code=200)
async def project_description_generation(body: ProjectDescription):
    file_paths = filter_file_paths(body.selected_files)
    file_tree = build_tree(file_paths)
    response = await chain_project_description_generator.ainvoke(
        {"file_tree": file_tree}
    )
    return JSONResponse(content=response.content)


@app.get("/get_code_content", status_code=200)
def get_code_content_route(file_path: str):
    content = read_file(file_path)
    return JSONResponse(content=content)


class RepoURL(BaseModel):
    url: str
    extensions: List[str] = SUPPORTED_EXTENSIONS


@app.post("/get-file-tree/", status_code=200)
async def get_file_tree(repo: RepoURL):
    try:
        code_files = list_code_files_in_repository(repo.url, repo.extensions)
        file_tree = create_file_tree(code_files)
        return {"file_tree": file_tree}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class GradeCodeRequest(BaseModel):
    selected_files: List[str]
    criterias_list: List[str]
    project_description: str = Field(None, description="Project description")


@app.post("/grade-code/", status_code=200)
async def grade_code_rt(body: GradeCodeRequest):
    file_paths = filter_file_paths(body.selected_files)

    if not file_paths:
        raise HTTPException(
            status_code=400,
            detail="No valid files selected. Please select at least one file to grade.",
        )
    output = await grade_code(file_paths, body.criterias_list, body.project_description)
    return JSONResponse(content=output)


class GradeOverallInterface(BaseModel):
    data: Any


@app.post("/grade_overall", status_code=200)
async def grade_overall(body: GradeOverallInterface):

    print("body", body.data)

    response = await summarize_code_review_controller(body.data)
    print(response)
    return JSONResponse(content=response)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
