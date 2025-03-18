const express = require("express");
const { default: mongoose } = require("mongoose");
const { User, Message } = require("./src/schema");
const bcrypt = require("bcryptjs");
const { generateToken } = require("./src/utils");
const { authenticate } = require("./src/middleware");
const amqp = require("amqplib/callback_api");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const cors = require("cors");

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
});

app.post("/api/user/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new Error("username and password are required");
    }

    const userExists = await User.findOne({ username });
    if (userExists) {
      throw new Error("user already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      password: hashedPassword,
    });

    await user.save();

    const token = await generateToken(user._id);

    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/user/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new Error("username and password are required");
    }

    const user = await User.findOne({ username });
    if (!user) {
      throw new Error("user does not exist");
    }

    const passMatch = await bcrypt.compare(password, user.password);
    if (!passMatch) {
      throw new Error("wrong credentials");
    }

    const token = await generateToken(user._id);

    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/chat", authenticate, async (req, res) => {
  try {
    const messages = await Message.find();
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/chat", authenticate, async (req, res) => {
  try {
    const { userId } = req.user;
    const { msg } = req.body;

    if (!channel) throw new Error("channel not established");

    if (!msg) {
      throw new Error("message cannot be empty");
    }
    const message = new Message({
      msg,
      sender: userId,
    });

    await message.save();

    channel.sendToQueue(q, Buffer.from(JSON.stringify(message)));

    res.json({ message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(5000, () => {
  console.log("running on 5000");
});
