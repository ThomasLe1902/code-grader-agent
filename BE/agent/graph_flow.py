from langgraph.graph import StateGraph, END, START
from langgraph.graph.state import CompiledStateGraph
from .graph_function import State
from .graph_function import analyze_code_file_fn, summarize_code_review_fn



flow = StateGraph(State)


class AgentCodeGrader:
    def __init__(self):
        self.flow = StateGraph(State)

    def node(self):
        self.flow.add_node("analyze_code_file", analyze_code_file_fn)
        self.flow.add_node("summarize_code_review", summarize_code_review_fn)

    def edge(self):
        self.flow.add_edge(START, "analyze_code_file")
        self.flow.add_edge("analyze_code_file", "summarize_code_review")
        self.flow.add_edge("summarize_code_review", END)

    def __call__(self) -> CompiledStateGraph:
        self.node()
        self.edge()
        return self.flow.compile()


async def grade_code(selected_files: list[str], criterias_list: list[str]):
    """Process criteria evaluation using batch for multiple criteria or invoke for single criterion."""
    agent = AgentCodeGrader()()

    if len(criterias_list) > 1:
        output = await agent.abatch(
            [
                {"selected_files": selected_files, "criterias": criterias}
                for criterias in criterias_list
            ]
        )
    else:
        output = [
            await agent.ainvoke(
                {
                    "selected_files": selected_files,
                    "criterias": criterias_list[0],
                }
            )
        ]
    
    return output
