import { google } from "googleapis";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT,
);

const scopes = ["https://www.googleapis.com/auth/calendar"];

const app = express();

app.get("/auth", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
  });

  res.redirect(url);
});

app.get("/call_back", async (req, res) => {
  try {
    const code = req.query.code;

    const { tokens } = await oauth2Client.getToken(code);

    console.log("TOKENS:", tokens);

    oauth2Client.setCredentials(tokens);

    res.json({
      message: "Authorization successful",
    });
  } catch (error) {
    console.error(error);
  }
});

app.listen(500, () => {
  console.log("Server running on port 500");
});
