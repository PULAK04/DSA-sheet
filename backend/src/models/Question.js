import mongoose from 'mongoose';

const codeSchema = new mongoose.Schema(
  {
    language: { type: String, default: 'cpp' },
    code: { type: String, default: '' }
  },
  { _id: false }
);

// One write-up + its own solution code, in the order they were added.
// The frontend renders these as repeatable blocks: approach text immediately
// followed by that approach's code, so a question can document multiple
// approaches (brute force, optimized, ...) each with the right code attached.
const approachSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'Approach' },
    content: { type: mongoose.Schema.Types.Mixed, default: [] },
    solutions: {
      cpp: { type: codeSchema, default: () => ({ language: 'cpp', code: '' }) },
      python: { type: codeSchema, default: () => ({ language: 'python', code: '' }) },
      java: { type: codeSchema, default: () => ({ language: 'java', code: '' }) },
      javascript: { type: codeSchema, default: () => ({ language: 'javascript', code: '' }) }
    }
  },
  { timestamps: true }
);

const questionSchema = new mongoose.Schema(
  {
    subtopicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subtopic', required: true, index: true },
    name: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: null },
    externalUrl: { type: String, default: '' },
    platform: { type: String, default: '' },
    youtubeUrl: { type: String, default: '' },
    tags: { type: [String], default: [] },
    companies: { type: [String], default: [] },
    priority: { type: Number, default: 0, min: 0 },
    revisions: { type: Number, default: 0, min: 0 },
    notes: { type: mongoose.Schema.Types.Mixed, default: null },
    approaches: { type: [approachSchema], default: [] }
  },
  { timestamps: true }
);

questionSchema.index({ subtopicId: 1, createdAt: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ companies: 1 });

export const Question = mongoose.model('Question', questionSchema);
