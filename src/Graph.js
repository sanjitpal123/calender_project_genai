import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import CallTheLLm from "./CallLlm.js";
import { toolNode } from "./llm.js";
async function whereshouldgo(state) {
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  return "__end__";
}
const graph = new StateGraph(MessagesAnnotation)
  .addNode("llm", CallTheLLm)
  .addNode("tools", toolNode)
  .addEdge("__start__", "llm")
  .addEdge("tools", "llm")
  .addConditionalEdges("llm", whereshouldgo)
  .compile();

async function Ask(question) {
  const res = await graph.invoke({
    messages: [
      {
        role: "user",
        content: question,
      },
    ],
  });
  console.log("final answer", res.messages[res.messages.length - 1].content);
}
Ask("can you show me what events i have totally");
