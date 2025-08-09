from dotenv import load_dotenv

load_dotenv(override=True)
from typing import List, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
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
import uvicorn
from agent.graph_flow import grade_code, grade_streaming_fn
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
    try:
        print(f"Project description request: {body.selected_files}")
        file_paths = filter_file_paths(body.selected_files)
        print(f"Filtered file paths: {file_paths}")
        if not file_paths:
            raise HTTPException(
                status_code=400,
                detail="No valid files selected. Please select at least one file.",
            )
        file_tree = build_tree(file_paths)
        print(f"Built file tree: {file_tree[:200]}...")  # First 200 chars

        print("Calling LLM chain...")
        response = await chain_project_description_generator.ainvoke(
            {"file_tree": file_tree}
        )
        print(f"LLM response received: {response.content[:100]}...")
        return JSONResponse(content=response.content)
    except Exception as e:
        print(f"Error in project_description_generation: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error generating project description: {str(e)}"
        )


@app.get("/get_code_content", status_code=200)
def get_code_content_route(file_path: str):
    try:
        content = read_file(file_path)
        return JSONResponse(content=content)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"File not found: {file_path}")
    except IOError as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")


class RepoURL(BaseModel):
    url: str
    extensions: List[str] = SUPPORTED_EXTENSIONS


@app.post("/get-file-tree/", status_code=200)
async def get_file_tree(repo: RepoURL):
    try:
        print(f"Fetching file tree for: {repo.url}")
        print(f"Extensions: {repo.extensions}")
        code_files = list_code_files_in_repository(repo.url, repo.extensions)
        print(f"Found {len(list(code_files))} files")
        code_files = list_code_files_in_repository(repo.url, repo.extensions)  # Call again since it's an iterator
        file_tree = create_file_tree(code_files)
        print(f"Created file tree with {len(file_tree)} top-level items")
        return {"file_tree": file_tree}
    except Exception as e:
        print(f"Error in get_file_tree: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching file tree: {str(e)}")


class GradeCodeRequest(BaseModel):
    selected_files: List[str]
    folder_structure_criteria: str = Field(
        None, description="Folder structure criteria"
    )
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
    output = await grade_code(
        file_paths,
        body.folder_structure_criteria or "",
        body.criterias_list,
        body.project_description
    )
    print(file_paths)
    print("criterias_list", body.criterias_list)
    print("project_description", body.project_description)
    return JSONResponse(content=output)


@app.post("/grade-code-stream/", status_code=200)
async def grade_code_stream_rt(body: GradeCodeRequest):
    file_paths = filter_file_paths(body.selected_files)

    if not file_paths:
        raise HTTPException(
            status_code=400,
            detail="No valid files selected. Please select at least one file to grade.",
        )

    return StreamingResponse(
        grade_streaming_fn(
            file_paths,
            body.folder_structure_criteria,
            body.criterias_list,
            body.project_description,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


class GradeOverallInterface(BaseModel):
    data: Any


@app.post("/grade_overall", status_code=200)
async def grade_overall(body: GradeOverallInterface):
    try:
        if not body.data:
            raise HTTPException(
                status_code=400,
                detail="No data provided for overall grading.",
            )
        response = await summarize_code_review_controller(body.data)
        return JSONResponse(content=response)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating overall grade: {str(e)}"
        )


@app.get("/test-api", status_code=200)
async def test_api():
    """Test endpoint to verify OpenRouter API is working"""
    try:
        from config.llm import llm
        response = await llm.ainvoke("Say hello")
        return JSONResponse(content={"status": "success", "response": response.content})
    except Exception as e:
        return JSONResponse(
            content={"status": "error", "error": str(e)},
            status_code=500
        )

@app.post("/grade-code-simple/", status_code=200)
async def grade_code_simple_rt(body: GradeCodeRequest):
    """Simple non-streaming version for testing"""
    try:
        file_paths = filter_file_paths(body.selected_files)

        if not file_paths:
            raise HTTPException(
                status_code=400,
                detail="No valid files selected. Please select at least one file to grade.",
            )

        # Use the simple grade_code function instead of streaming
        output = await grade_code(
            file_paths,
            body.folder_structure_criteria or "",
            body.criterias_list,
            body.project_description
        )

        return JSONResponse(content={"results": output, "status": "completed"})
    except Exception as e:
        print(f"Error in simple grading: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error grading code: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
