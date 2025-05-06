const express = require("express");
const { default: mongoose } = require("mongoose");
const { Message } = require("./src/schema");
const amqp = require("amqplib/callback_api");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const cors = require("cors");
const ai = require("@pr4j3sh/ai");
const { authHandler } = require("@pr4j3sh/auth");

let channel = null;
let socket = null;
const q = "chat";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors({ origin: "*" }));
app.use(express.json());

io.on("connection", (sock) => {
  socket = sock;
});

mongoose
  .connect("mongodb://127.0.0.1:27017/chat")
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.error(err);
  });

amqp.connect("amqp://localhost", (err, conn) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  conn.createChannel((err, ch) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    channel = ch;
    channel.assertQueue(q, { durable: false });
    channel.consume(
      q,
      (msg) => {
        if (msg) {
          io.emit("msg", JSON.parse(msg.content.toString()));
        }
      },
      { noAck: true },
    );
  });
  console.log("connected to amqp");
});

app.get("/api/chat", authHandler, async (req, res) => {
  try {
    const messages = await Message.find();
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/chat", authHandler, async (req, res) => {
  try {
    const { id, username } = req.user;
    const { msg } = req.body;

    if (!channel) throw new Error("channel not established");

    if (!msg) {
      throw new Error("message cannot be empty");
    }
    const message = new Message({
      msg,
      sender: { _id: id, username },
    });

    await message.save();

    channel.sendToQueue(q, Buffer.from(JSON.stringify(message)));

    res.json({ message: "message sent" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/chat/ai", authHandler, async (req, res) => {
  try {
    const { id, username } = req.user;
    const { msg } = req.body;

    if (!channel) throw new Error("channel not established");

    if (!msg) {
      throw new Error("message cannot be empty");
    }
    const message = new Message({
      msg,
      sender: {
        _id: id,
        username,
      },
    });

    await message.save();

    channel.sendToQueue(q, Buffer.from(JSON.stringify(message)));

    const aiRes = await ai(`${msg}, answer very briefly`);
    const aiMessage = {
      msg: aiRes.toString(),
      sender: {
        _id: "ai-123456",
        username: "ai",
      },
    };

    channel.sendToQueue(q, Buffer.from(JSON.stringify(aiMessage)));

    res.json({ message: "message sent" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(5000, () => {
  console.log("running on 5000");
});
