const config = require("./config");
const express = require("express");
const bodyParser = require("body-parser");
const pino = require("express-pino-logger")();
const { chatToken, videoToken, voiceToken } = require("./tokens");
const { VoiceResponse } = require("twilio").twiml;
const callerIDString = config.twilio.callerId;

let currentCallerID;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(pino);

const sendTokenResponse = (token, res) => {
  res.set("Content-Type", "application/json");
  res.send(
    JSON.stringify({
      token: token.toJwt()
    })
  );
};

const getAllCallerIds = async () => {
  const twilio = require("twilio")(config.twilio.accountSid, config.twilio.authToken);
  try {
    const callerIds = await twilio.outgoingCallerIds.list();
    return callerIds.map(callerId => callerId.phoneNumber);
  } catch (error) {
    console.error("Error fetching caller IDs:", error);
    return [];
  }
};

app.get("/api/greeting", (req, res) => {
  const name = req.query.name || "World";
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({ greeting: `Hello ${name}!` }));
});

app.get("/chat/token", (req, res) => {
  const identity = req.query.identity;
  const token = chatToken(identity, config);
  sendTokenResponse(token, res);
});

app.post("/chat/token", (req, res) => {
  const identity = req.body.identity;
  const token = chatToken(identity, config);
  sendTokenResponse(token, res);
});

app.get("/video/token", (req, res) => {
  const identity = req.query.identity;
  const room = req.query.room;
  const token = videoToken(identity, room, config);
  sendTokenResponse(token, res);
});

app.post("/video/token", (req, res) => {
  const identity = req.body.identity;
  const room = req.body.room;
  const token = videoToken(identity, room, config);
  sendTokenResponse(token, res);
});

app.get("/voice/token", (req, res) => {
  const identity = req.query.identity;
  const token = voiceToken(identity, config);
  sendTokenResponse(token, res);
});

app.post("/voice/token", (req, res) => {
  const identity = req.body.identity;
  const token = voiceToken(identity, config);
  sendTokenResponse(token, res);
});

app.post("/voice", (req, res) => {
  const To = req.body.To;
  const response = new VoiceResponse();
  const callerIDArray = callerIDString.split(",");
  const currentId = currentCallerID || callerIDArray[0];
  const dial = response.dial({ callerId: currentId});
  dial.number(To);
  res.set("Content-Type", "text/xml");
  res.send(response.toString());
});

app.post("/voice/incoming", (req, res) => {
  const response = new VoiceResponse();
  const dial = response.dial({ callerId: req.body.From, answerOnBridge: true });
  dial.client("phil");
  res.set("Content-Type", "text/xml");
  res.send(response.toString());
});
app.get('/caller-ids', (req, res) => {
  const callerIDArray = callerIDString.split(",");
  res.json({ callerIDs: callerIDArray });
});

// POST route to set the current caller ID
app.post('/set-current-caller-id', (req, res) => {
  const { callerID } = req.body;
  const callerIDArray = callerIDString.split(",");
  if (callerID && callerIDArray.includes(callerID)) {
    currentCallerID = callerID;
    res.json({ message: 'Current caller ID set successfully' });
  } else {
    res.status(400).json({ error: 'Invalid caller ID' });
  }
});

// GET route to fetch the current caller ID
app.get('/current-caller-id', (req, res) => {
  res.json({ currentCallerID });
});

app.listen(3001, () =>
  console.log("Express server is running on localhost:3001")
);
