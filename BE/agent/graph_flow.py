from langgraph.graph import StateGraph, END, START
from langgraph.graph.state import CompiledStateGraph
from .graph_function import State, ParentGraphState
from .graph_function import (
    check_relevant_criteria_fn,
    analyze_code_file_fn,
    organized_project_structure_grade_fn,
)
import json
from loguru import logger

flow = StateGraph(State)


class AgentCodeGrader:
    def __init__(self):
        self.flow = StateGraph(State)

    @staticmethod
    def routing_after_check_relevant_criteria(state: State):
        if not state["selected_files"]:
            return END
        else:
            return "analyze_code_file"

    def node(self):

        self.flow.add_node("check_relevant_criteria", check_relevant_criteria_fn)
        self.flow.add_node("analyze_code_file", analyze_code_file_fn)

    def edge(self):
        self.flow.add_edge(START, "check_relevant_criteria")
        self.flow.add_conditional_edges(
            "check_relevant_criteria",
            self.routing_after_check_relevant_criteria,
            {
                END: END,
                "analyze_code_file": "analyze_code_file",
            },
        )
        self.flow.add_edge("analyze_code_file", END)

    def __call__(self) -> CompiledStateGraph:
        self.node()
        self.edge()
        return self.flow.compile()


async def agent_processing_fn(state: ParentGraphState):
    selected_files = state["selected_files"]
    criterias_list = state["criterias_list"]
    project_description = state["project_description"]
    agent_single_criteria = AgentCodeGrader()()
    output = await agent_single_criteria.abatch(
        [
            {
                "selected_files": selected_files,
                "criterias": criterias,
                "project_description": project_description,
                "criteria_index": index,
            }
            for index, criterias in enumerate(criterias_list, 1)
        ]
    )

    return {"output": output}


class AgentCodeGraderMultiCriterias:
    def __init__(self):
        self.flow = StateGraph(ParentGraphState)

    @staticmethod
    def routing_before_start(state: ParentGraphState):

        if not state["folder_structure_criteria"]:
            return "agent_processing"
        else:
            return "grade_folder_structure"

    def node(self):
        self.flow.add_node(
            "grade_folder_structure", organized_project_structure_grade_fn
        )
        self.flow.add_node("agent_processing", agent_processing_fn)

    def edge(self):
        # self.flow.add_conditional_edges(
        #     START,
        #     self.routing_before_start,
        #     {
        #         "grade_folder_structure": "grade_folder_structure",
        #         "agent_processing": "agent_processing",
        #     },
        # )
        self.flow.add_edge(START, "grade_folder_structure")
        self.flow.add_edge(START, "agent_processing")
        self.flow.add_edge("grade_folder_structure", END)
        self.flow.add_edge("agent_processing", END)

    def __call__(self) -> CompiledStateGraph:
        self.node()
        self.edge()
        return self.flow.compile()


agent_graph = AgentCodeGraderMultiCriterias()()


async def grade_code(
    selected_files: list[str],
    folder_structure_criteria: str,
    criterias_list: list[str],
    project_description: str = None,
):
    """Process criteria evaluation using batch for multiple criteria or invoke for single criterion."""
    agent = AgentCodeGrader()()
    output = await agent.abatch(
        [
            {
                "selected_files": selected_files,
                "criterias": criterias,
                "project_description": project_description,
                "criteria_index": index,
            }
            for index, criterias in enumerate(criterias_list, 1)
        ]
    )
    return output


async def grade_streaming_fn(
    file_paths: list[str],
    folder_structure_criteria: str,
    criterias_list: list[str],
    project_description: str = None,
):
    try:
        number_of_criteria = len(criterias_list) * 2 + 1
        initial_input = {
            "selected_files": file_paths,
            "criterias_list": criterias_list,
            "folder_structure_criteria": folder_structure_criteria,
            "project_description": project_description,
        }
        processing_criteria = 0

        async for event in agent_graph.astream(
            input=initial_input,
            subgraphs=True,
        ):
            try:
                _, sub_event = event
                main_key: str = list(sub_event.keys())[0]
                logger.info(f"Processing step '{main_key}'")

                sub_event: dict = sub_event[main_key]
                if not sub_event:
                    continue

                criteria = sub_event.get("criteria_index", None)
                if processing_criteria < number_of_criteria:
                    processing_criteria += 1

                if not criteria:
                    try:
                        if main_key == "grade_folder_structure":
                            project_structure_response = json.dumps(
                                {
                                    "type": "folder_structure",
                                    "output": sub_event.get(
                                        "output_folder_structure", ""
                                    ),
                                    "percentage": int(
                                        (processing_criteria / number_of_criteria) * 100
                                    ),
                                },
                                ensure_ascii=False,
                            )
                            yield project_structure_response + "\n\n"
                            continue

                        final_response = json.dumps(
                            {
                                "type": "final",
                                "output": sub_event.get("output", ""),
                                "percentage": 100,
                            },
                            ensure_ascii=False,
                        )
                        yield final_response + "\n\n"
                        continue
                    except json.JSONEncodeError as je:
                        logger.error(f"JSON encoding error: {str(je)}")
                        yield json.dumps(
                            {
                                "type": "error",
                                "output": "Error encoding response",
                                "percentage": 0,
                            }
                        ) + "\n\n"
                        continue

                main_key_processed = main_key.replace("_", " ")
                try:
                    noti_response = json.dumps(
                        {
                            "type": "noti",
                            "output": f"Processing step '{main_key_processed}' of criteria index {criteria}",
                            "percentage": int(
                                (processing_criteria / number_of_criteria) * 100
                            ),
                        },
                        ensure_ascii=False,
                    )
                    logger.info(
                        f"Processing step '{main_key_processed}' of criteria index {criteria}*"
                    )
                    yield noti_response + "\n\n"
                except json.JSONEncodeError as je:
                    logger.error(f"JSON encoding error in notification: {str(je)}")
                    yield json.dumps(
                        {
                            "type": "error",
                            "output": "Error creating notification",
                            "percentage": 0,
                        }
                    ) + "\n\n"

            except Exception as e:
                logger.error(f"Error processing event: {str(e)}")
                yield json.dumps(
                    {
                        "type": "error",
                        "output": f"Error processing step: {str(e)}",
                        "percentage": 0,
                    }
                ) + "\n\n"

    except Exception as e:
        logger.error(f"Fatal error in grade_streaming_fn: {str(e)}")
        yield json.dumps(
            {
                "type": "error",
                "output": "Fatal error occurred during grading",
                "percentage": 0,
            }
        ) + "\n\n"
