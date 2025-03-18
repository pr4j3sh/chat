const express = require("express");
const { default: mongoose } = require("mongoose");
const { User, Message } = require("./src/schema");
const bcrypt = require("bcryptjs");
const { generateToken } = require("./src/utils");
const { authenticate } = require("./src/middleware");

const server = express();

server.use(express.json());

mongoose
  .connect("mongodb://127.0.0.1:27017/chat")
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.error(err);
  });

server.post("/api/user/register", async (req, res) => {
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

server.post("/api/user/login", async (req, res) => {
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

server.post("/api/chat", authenticate, async (req, res) => {
  const { userId } = req.user;
  const { msg } = req.body;

  if (!msg) {
    throw new Error("message cannot be empty");
  }
  // save to db
  const message = new Message({
    msg,
    sender: userId,
  });

  await message.save();

  // put in queue

  res.json({ message });
});

server.listen(5000, () => {
  console.log("running on 5000");
});
