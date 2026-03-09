import { ChatGroq } from "@langchain/groq";
import dotenv from "dotenv";
import { getEvents, createEvents } from "./tools.js";
import { ToolNode } from "@langchain/langgraph/prebuilt";
dotenv.config();
const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
}).bindTools([getEvents, createEvents]);

const tools = [getEvents, createEvents];
export const toolNode = new ToolNode(tools);
export default llm;
