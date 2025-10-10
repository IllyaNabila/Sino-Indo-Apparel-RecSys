import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "businesses",
    },
    lastMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "messages",
    },
    lastMessageAt: Date,
  },
  {
    timestamps: true,
  }
);

// query conversations by participants or sort by last message.
conversationSchema.index({ participants: 1});
conversationSchema.index({ lastMessageAt: -1});

const Conversation =
  mongoose.models.conversations ||
  mongoose.model("conversations", conversationSchema);

export default Conversation;
