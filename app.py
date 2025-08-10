from dotenv import load_dotenv

load_dotenv(override=True)
from typing import List, Optional, Any
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
    cleanup_all_repositories,
)
from agent.graph_function import (
    chain_project_description_generator,
    summarize_code_review_controller,
)
import uvicorn
import atexit
import signal
import sys
from contextlib import asynccontextmanager
from agent.graph_flow import grade_code, grade_streaming_fn
from config.constants import SUPPORTED_EXTENSIONS


# Cleanup function for application shutdown
def cleanup_on_shutdown():
    """Clean up repositories when the application shuts down"""
    print("Application shutting down, cleaning up repositories...")
    cleanup_all_repositories()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Handle application startup and shutdown"""
    # Startup
    print("Code Grader Agent API starting up...")

    yield

    # Shutdown
    cleanup_on_shutdown()


app = FastAPI(
    title="Code Grader Agent API",
    description="API for grading code repositories using AI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    """Return a simple favicon response to avoid 404s"""
    return JSONResponse(content={"message": "No favicon available"}, status_code=204)


class ProjectDescription(BaseModel):
    selected_files: List[str]


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
        # Convert iterator to list to avoid calling the function again
        code_files_list = list(code_files)
        print(f"Found {len(code_files_list)} files")
        file_tree = create_file_tree(code_files_list)
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
    folder_structure_criteria: Optional[str] = Field(
        None, description="Folder structure criteria"
    )
    criterias_list: List[str]
    project_description: Optional[str] = Field(None, description="Project description")


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
    finally:
        # Clean up repositories after overall grading is complete
        cleanup_all_repositories()


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


@app.post("/cleanup-repositories/", status_code=200)
async def cleanup_repositories_endpoint():
    """Manual endpoint to clean up all cloned repositories"""
    try:
        cleaned_count = cleanup_all_repositories()
        return JSONResponse(content={
            "status": "success",
            "message": f"Cleaned up {cleaned_count} repositories"
        })
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error cleaning up repositories: {str(e)}"
        )


# Cleanup function for application shutdown
def cleanup_on_shutdown():
    """Clean up repositories when the application shuts down"""
    print("Application shutting down, cleaning up repositories...")
    cleanup_all_repositories()


# Register cleanup handlers
atexit.register(cleanup_on_shutdown)

def signal_handler(signum, _frame):
    """Handle shutdown signals"""
    print(f"Received signal {signum}, cleaning up...")
    cleanup_on_shutdown()
    sys.exit(0)

# Register signal handlers for graceful shutdown
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
