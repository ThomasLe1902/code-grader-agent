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
from agent.graph_flow import grade_code, AgentCodeGrader
from config.constants import SUPPORTED_EXTENSIONS


agent = AgentCodeGrader()()
print("full",agent.get_graph().draw_mermaid())
