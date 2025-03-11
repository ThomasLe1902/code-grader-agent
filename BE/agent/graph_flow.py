from langgraph.graph import StateGraph, END, START
from langgraph.graph.state import CompiledStateGraph
from .graph_function import State, ParentGraphState
from .graph_function import (
    project_description_generator_fn,
    check_relevant_criteria_fn,
    analyze_code_file_fn,
    summarize_code_review_fn,
)
import json

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
        # self.flow.add_node("summarize_code_review", summarize_code_review_fn)

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
        # self.flow.add_edge("analyze_code_file", "summarize_code_review")
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

    def node(self):
        self.flow.add_node("agent_processing", agent_processing_fn)

    def edge(self):
        self.flow.add_edge(START, "agent_processing")
        self.flow.add_edge("agent_processing", END)

    def __call__(self) -> CompiledStateGraph:
        self.node()
        self.edge()
        return self.flow.compile()


agent_graph = AgentCodeGraderMultiCriterias()()


async def grade_code(
    selected_files: list[str],
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


async def grade_streaming_fn(file_paths, criterias_list, project_description):
    initial_input = {
        "selected_files": file_paths,
        "criterias_list": criterias_list,
        "project_description": project_description,
    }
    async for event in agent_graph.astream(
        input=initial_input,
        subgraphs=True,
    ):
        _, sub_event = event
        main_key: str = list(sub_event.keys())[0]
        print(main_key)
        sub_event: dict = sub_event[main_key]
        criteria = sub_event.get("criteria_index", None)
        if not criteria:
            print(sub_event["output"])
            final_response = json.dumps(
                {"type": "final", "output": sub_event["output"]}, ensure_ascii=False
            )
            yield final_response
            continue
        main_key_processed = main_key.replace("_", " ")
        print(f"Processing step '{main_key_processed}' of criteria index {criteria}")
        noti_response = json.dumps(
            (
                {
                    "type": "noti",
                    "output": f"Processing step '{main_key_processed}' of criteria index {criteria}",
                }
            ),
            ensure_ascii=False,
        )
        yield noti_response + "\n\n"
