console.clear();

import express from "express";
import mongoose from "mongoose";
import Pusher from "pusher";
import cors from "cors";
import "./config.js";
import Message from "./models/Message.js";
import cli from "@cudy/cli";

// app config
const app = express();
app.use(cors());
app.use(express.json());

// pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APPID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: process.env.PUSHER_USETLS,
});

// mongoDB
mongoose.connect(process.env.DB_HOST, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.once("open", () => {
  cli.succ("DB connected!");
  const msgCollection = db.collection("messages");
  const changeStream = msgCollection.watch();

  changeStream.on("change", (change) => {
    if (change.operationType === "insert") {
      const newMessage = change.fullDocument;
      pusher.trigger("messages", "inserted", newMessage);
    } else {
      cli.err("error triggering pusher");
    }
  });
});

// router
app.get("/", (req, res) => {
  res.send("hello world");
});
app.get("/api/messages/sync", (req, res) => {
  Message.find((err, data) => {
    if (err) res.status(500).send(err);
    else res.status(200).send(data);
  });
});
app.post("/api/messages/new", (req, res) => {
  const msg = req.body;

  Message.create(msg, (err, data) => {
    if (err) res.status(500).send(err);
    else res.status(201).send(data);
  });
});

// listen
const port = process.env.PORT || 9000;
app.listen(port, () => cli.succ(`Server running on port ${port}`));
