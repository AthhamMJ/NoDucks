import mongoose from 'mongoose';

const LessonSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Set to true if login is required
    },
    topic: { type: String, required: true },
    interest: { type: String, required: true },
    headline: { type: String, required: true },
    simpleIntro: { type: String, required: true },
    deepExplanation: { type: String, required: true },
    sections: [
      {
        heading: String,
        body: String,
        bullets: [String],
        callout: String,
      },
    ],
    analogyBridge: {
      title: String,
      analogyExplanation: String,
      mappings: [
        {
          conceptAspect: String,
          analogyCounterpart: String,
        },
      ],
      scientificBoundary: String,
    },
    corePrinciples: [
      {
        name: String,
        formulaOrLaw: String,
        explanation: String,
      },
    ],
    practicalExample: {
      title: String,
      scenario: String,
      connectionToTheory: String,
    },
    keyTerms: [
      {
        term: String,
        definition: String,
      },
    ],
    summary: String,
    quizHistory: [
      {
        score: Number,
        totalQuestions: Number,
        masteredConcepts: [String],
        completedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Lesson', LessonSchema);