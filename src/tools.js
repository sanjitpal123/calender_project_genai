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
  async ({ q, timeMin, timeMax }) => {
    try {
      const res = await client.events.list({
        calendarId: "primary",
        q,
        orderBy: "startTime",
        timeMin,
        timeMax,
        singleEvents: true,
      });

      const events = res.data.items || [];

      const results = events.map((event) => ({
        id: event.id,
        summary: event.summary,
        location: event.location,
        created: event.created,
        updated: event.updated,
        attendees: event.attendees,
        start: event.start,
        end: event.end,
      }));
      return JSON.stringify(results);
    } catch (error) {
      return error.message;
    }
  },
  {
    name: "get_events",
    description: "Search events in Google Calendar",
    schema: z.object({
      q: z.string().describe("Search query for event title"),
      timeMin: z.string().describe("Start time in ISO format"),
      timeMax: z.string().describe("End time in ISO format"),
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

export const updateEvent = tool(
  async ({ calendarId, eventId, summary, location, start, end, attendees }) => {
    try {
      const res = await client.events.update({
        calendarId,
        eventId,
        requestBody: {
          summary,
          location,
          start,
          end,
          attendees,
        },
      });

      return res.data;
    } catch (error) {
      return error.message;
    }
  },
  {
    name: "update_event",
    description: "Update an existing Google Calendar event",
    schema: z.object({
      calendarId: z.string().describe("Google calendar ID"),
      eventId: z.string().describe("Event ID to update"),
      summary: z.string().describe("New event title"),
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

export const deleteEvent = tool(
  async ({ eventId, calendarId }) => {
    try {
      await client.events.delete({
        calendarId,
        eventId,
      });

      return `Event ${eventId} deleted successfully`;
    } catch (error) {
      return error.message;
    }
  },
  {
    name: "deleteEvent",
    description: "Delete an event from Google Calendar",
    schema: z.object({
      eventId: z.string(),
      calendarId: z.string(),
    }),
  },
);
