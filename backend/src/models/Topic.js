import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

topicSchema.index({ createdAt: 1 });

export const Topic = mongoose.model('Topic', topicSchema);
