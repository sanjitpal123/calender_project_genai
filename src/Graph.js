import {
  MessagesAnnotation,
  StateGraph,
  MemorySaver,
} from "@langchain/langgraph";
import CallTheLLm from "./CallLlm.js";
import { toolNode } from "./llm.js";
async function whereshouldgo(state) {
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  return "__end__";
}
const checkpointer = new MemorySaver();
const config = { configurable: { thread_id: "1" } };

const graph = new StateGraph(MessagesAnnotation)
  .addNode("llm", CallTheLLm)
  .addNode("tools", toolNode)
  .addEdge("__start__", "llm")
  .addEdge("tools", "llm")
  .addConditionalEdges("llm", whereshouldgo)
  .compile({ checkpointer });

async function Ask(question) {
  const res = await graph.invoke(
    {
      messages: [
        {
          role: "user",
          content: question,
        },
      ],
    },
    config,
  );
  console.log("final answer", res.messages[res.messages.length - 1].content);
}
await Ask("how many events i have tommorrow with whom  ?");
console.log("========");
await Ask("how many events i have tommorrow with whom  ?");
