import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
  },
  lastReadAt: {
    type: Date,
    default: null,
  }
});

// compound index to avoid duplicate memberships
membershipSchema.index({ userId: 1, conversationId: 1}, { unique: true});

// static method to calculate unread messages
membershipSchema.statics.getUnreadCount = async function (userId, conversationId) {
    const membership = await this.findOne({ userId, conversationId });
    if(!membership) return 0;

    const unread = await mongoose.model("messages").countDocuments({
        conversationId,
        createdAt: { $gt: membership.lastReadAt || new Date(0) }
    });
    return unread;
}

const Membership =
  mongoose.models.memberships ||
  mongoose.model("memberships", membershipSchema);

export default Membership;
