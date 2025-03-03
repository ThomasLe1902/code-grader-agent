from dotenv import load_dotenv

load_dotenv(override=True)
from typing import List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from utils.helper import (
    list_code_files_in_repository,
    create_file_tree,
    filter_file_paths,
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

# List of file extensions to search for


class RepoURL(BaseModel):
    url: str
    extensions: List[str] = SUPPORTED_EXTENSIONS


@app.post("/get-file-tree/")
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


@app.post("/grade-code/")
async def grade_code_rt(body: GradeCodeRequest):
    file_paths = filter_file_paths(body.selected_files)

    if not file_paths:
        raise HTTPException(
            status_code=400,
            detail="No valid files selected. Please select at least one file to grade.",
        )
    output = await grade_code(file_paths, body.criterias_list, body.project_description)
    return JSONResponse(content=output)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
