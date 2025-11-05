import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "businesses",
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "conversations",
  },
  unread: {
    type: Number,
    default: 0,
  }
});

// compound index to avoid duplicate memberships
membershipSchema.index({ userId: 1, conversationId: 1}, { unique: true});

const Membership =
  mongoose.models.memberships ||
  mongoose.model("memberships", membershipSchema);

export default Membership;
