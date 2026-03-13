import { tool } from "langchain";
import { z } from "zod";
import dotenv from "dotenv";
import { google } from "googleapis";
dotenv.config();
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
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
  async ({ calendarId, summary, location, start, end, attendees }) => {
    const res = await client.events.insert({
      calendarId: calendarId,
      conferenceDataVersion: 1,
      requestBody: {
        summary: summary,
        location: location,
        description: "Initial meeting to discuss project goals and timelines.",

        start: start,
        end: end,

        attendees: attendees,

        conferenceData: {
          createRequest: {
            requestId: "meet-" + Date.now(),
            conferenceSolutionKey: {
              type: "hangoutsMeet",
            },
          },
        },

        reminders: {
          useDefault: true,
        },
      },
    });

    return res.data;
  },
  {
    name: "create_events",
    description: "Create a Google Calendar event",
    schema: z.object({
      calendarId: z.string().describe("Google calendar ID"),
      summary: z.string().describe("Event title"),
      location: z.string().describe("Event location"),
      start: z.object({
        dateTime: z.string(),
        timeZone: z.string(),
      }),
      end: z.object({
        dateTime: z.string(),
        timeZone: z.string(),
      }),
      attendees: z.array(
        z.object({
          email: z.string(),
        }),
      ),
    }),
  },
);

export const updateEvent = tool(({}) => {}, {
  name: "updateEvent",
  description: "update an existing event ",
});
