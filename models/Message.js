import mongoose from "mongoose";
const Schema = mongoose.Schema;

const Message = new Schema({
  msg: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("messages", Message);
