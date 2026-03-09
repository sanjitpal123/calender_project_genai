import llm from "./llm.js";
async function CallTheLLm(state) {
  console.log("calling llm...");
  console.log(state);
  const res = await llm.invoke(state.messages);
  return { messages: [res] };
}

export default CallTheLLm;
