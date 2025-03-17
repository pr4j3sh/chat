const { Schema, default: mongoose, model } = require("mongoose");

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
    },
    password: String,
  },
  { timestamps: true },
);

const User = model("User", userSchema);

const messageSchema = new Schema(
  {
    msg: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

const Message = model("Message", messageSchema);

module.exports = { User, Message };
