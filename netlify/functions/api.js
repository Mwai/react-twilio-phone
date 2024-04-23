const config = require("./config");
const express = require("express");
const serverless = require("serverless-http");
const bodyParser = require("body-parser");
const router = express.Router();
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

router.get("/api/greeting", (req, res) => {
  const name = req.query.name || "World";
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({ greeting: `Hello ${name}!` }));
});

router.get("/chat/token", (req, res) => {
  const identity = req.query.identity;
  const token = chatToken(identity, config);
  sendTokenResponse(token, res);
});

router.post("/chat/token", (req, res) => {
  const identity = req.body.identity;
  const token = chatToken(identity, config);
  sendTokenResponse(token, res);
});

router.get("/video/token", (req, res) => {
  const identity = req.query.identity;
  const room = req.query.room;
  const token = videoToken(identity, room, config);
  sendTokenResponse(token, res);
});

router.post("/video/token", (req, res) => {
  const identity = req.body.identity;
  const room = req.body.room;
  const token = videoToken(identity, room, config);
  sendTokenResponse(token, res);
});

router.get("/voice/token", (req, res) => {
  const identity = req.query.identity;
  const token = voiceToken(identity, config);
  sendTokenResponse(token, res);
});

router.post("/voice/token", (req, res) => {
  const identity = req.body.identity;
  const token = voiceToken(identity, config);
  sendTokenResponse(token, res);
});

router.post("/voice", (req, res) => {
  const To = req.body.To;
  const response = new VoiceResponse();
  const callerIDArray = callerIDString.split(",");
  const currentId = currentCallerID || callerIDArray[0];
  const dial = response.dial({ callerId: currentId});
  dial.number(To);
  res.set("Content-Type", "text/xml");
  res.send(response.toString());
});

router.post("/voice/incoming", (req, res) => {
  const response = new VoiceResponse();
  const dial = response.dial({ callerId: req.body.From, answerOnBridge: true });
  dial.client("phil");
  res.set("Content-Type", "text/xml");
  res.send(response.toString());
});
router.get('/caller-ids', (req, res) => {
  const callerIDArray = callerIDString.split(",");
  res.json({ callerIDs: callerIDArray });
});

// POST route to set the current caller ID
router.post('/set-current-caller-id', (req, res) => {
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
router.get('/current-caller-id', (req, res) => {
  res.json({ currentCallerID });
});

app.use(`/.netlify/functions/api`, router);

module.exports.handler = serverless(app);
// app.listen(3001, () =>
//   console.log("Express server is running on localhost:3001")
// );
