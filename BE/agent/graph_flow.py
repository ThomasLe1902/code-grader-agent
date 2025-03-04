from langgraph.graph import StateGraph, END, START
from langgraph.graph.state import CompiledStateGraph
from .graph_function import State
from .graph_function import (
    project_description_generator_fn,
    check_relevant_criteria_fn,
    analyze_code_file_fn,
    summarize_code_review_fn,
)


flow = StateGraph(State)


class AgentCodeGrader:
    def __init__(self):
        self.flow = StateGraph(State)

    @staticmethod
    def routing_before_check_relevant_criteria(state: State):
        if not state["project_description"]:
            return "project_description_generator"
        else:
            return "check_relevant_criteria"

    @staticmethod
    def routing_after_check_relevant_criteria(state: State):
        if not state["selected_files"]:
            return END
        else:
            return "analyze_code_file"

    def node(self):
        self.flow.add_node(
            "project_description_generator", project_description_generator_fn
        )
        self.flow.add_node("check_relevant_criteria", check_relevant_criteria_fn)
        self.flow.add_node("analyze_code_file", analyze_code_file_fn)
        self.flow.add_node("summarize_code_review", summarize_code_review_fn)

    def edge(self):
        self.flow.add_conditional_edges(
            START,
            self.routing_before_check_relevant_criteria,
            {
                "project_description_generator": "project_description_generator",
                "check_relevant_criteria": "check_relevant_criteria",
            },
        )
        self.flow.add_edge("project_description_generator", "check_relevant_criteria")
        self.flow.add_conditional_edges(
            "check_relevant_criteria",
            self.routing_after_check_relevant_criteria,
            {
                END: END,
                "analyze_code_file": "analyze_code_file",
            },
        )
        self.flow.add_edge("analyze_code_file", "summarize_code_review")
        self.flow.add_edge("summarize_code_review", END)

    def __call__(self) -> CompiledStateGraph:
        self.node()
        self.edge()
        return self.flow.compile()


async def grade_code(
    selected_files: list[str],
    criterias_list: list[str],
    project_description: str = None,
):
    """Process criteria evaluation using batch for multiple criteria or invoke for single criterion."""
    agent = AgentCodeGrader()()

    if len(criterias_list) > 1:
        output = await agent.abatch(
            [
                {
                    "selected_files": selected_files,
                    "criterias": criterias,
                    "project_description": project_description,
                }
                for criterias in criterias_list
            ]
        )
    else:
        output = [
            await agent.ainvoke(
                {
                    "selected_files": selected_files,
                    "criterias": criterias_list[0],
                    "project_description": project_description,
                }
            )
        ]

    return output
