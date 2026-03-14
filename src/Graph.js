import {
  MessagesAnnotation,
  StateGraph,
  MemorySaver,
} from "@langchain/langgraph";
import CallTheLLm from "./CallLlm.js";
import { toolNode } from "./llm.js";
import { content } from "googleapis/build/src/apis/content/index.js";
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

const currentTime = new Date().toLocaleDateString("sv-SE").replace(" ", "T");
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
async function Ask(question) {
  const res = await graph.invoke(
    {
      messages: [
        {
          role: "system",
          content: `
          you are a smart ai assistant who helps user to get their event or create their events
          currentTime:${currentTime},
          TimeZone:${timezone}
          `,
        },
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
await Ask("how many events i have with moatter");
