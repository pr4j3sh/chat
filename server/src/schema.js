const { Schema, default: mongoose, model } = require("mongoose");

const messageSchema = new Schema(
  {
    msg: String,
    sender: {
      _id: String,
      username: String,
    },
  },
  { timestamps: true },
);

const Message = model("Message", messageSchema);

module.exports = { Message };
