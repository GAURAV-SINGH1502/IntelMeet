import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    meetingCode: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

const Meeting = mongoose.model(
  "Meeting",
  meetingSchema
);

export default Meeting;