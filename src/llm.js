import { ChatGroq } from "@langchain/groq";
import dotenv from "dotenv";
import { getEvents, createEvents, updateEvent, deleteEvent } from "./tools.js";
import { ToolNode } from "@langchain/langgraph/prebuilt";
dotenv.config();
console.log("api key", process.env.GROQ_API_KEY);
const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
}).bindTools([getEvents, createEvents, updateEvent, deleteEvent]);

const tools = [getEvents, createEvents, updateEvent, deleteEvent];
export const toolNode = new ToolNode(tools);
export default llm;
