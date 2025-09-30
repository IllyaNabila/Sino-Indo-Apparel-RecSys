import mongoose from "mongoose";
import Conversation from "./conversationModel";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    content: { type: String, required: true },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ conversationId: 1, sentAt: -1});

messageSchema.post("save", async function (doc, next){
    try {
        await Conversation.findByIdAndUpdate(doc.conversationId,{
            lastMessageId: doc._id,
            lastMessageAt: doc.sentAt,
        });
        next();
    } catch (error) {
        next(error)
    }
});

const Message =
  mongoose.models.messages || mongoose.model("messages", messageSchema);

export default Message;
