import { tool } from "langchain";
import { z } from "zod";
import dotenv from "dotenv";
import { google } from "googleapis";
dotenv.config();
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIEND_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT,
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const client = google.calendar({
  version: "v3",
  auth: oauth2Client,
});
export const getEvents = tool(
  async ({ q, timeMax, timeMin }) => {
    const res = await client.events.list({
      calendarId: "primary",
      orderBy: "startTime",
      timeMax,
      timeMin,
      singleEvents: true,
    });
    const lists = res.data.items;
    const results = lists.map((event) => {
      return {
        summary: event.summary,
        updated: event.updated,
        location: event.location,
        created: event.created,
        creator: event.creator,
        attendees: event.attendees,
        start: event.start,
        end: event.end,
      };
    });
    return JSON.stringify(results);
  },
  {
    name: "get_events",
    description: "get the event",
    schema: z.object({
      q: z.string().describe("Query for searching events "),
      timeMin: z.string().describe("the start time for the event in utc"),
      timeMax: z.string().describe("the end time for event in utc"),
    }),
  },
);

export const createEvents = tool(
  (name) => {
    return `event is created with ${name}`;
  },
  {
    name: "create_events",
    description: "create the events ",
    schema: z.object({
      name: z.string().describe("Name of the guest"),
    }),
  },
);
