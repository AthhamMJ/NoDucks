import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import Lesson from "../models/Lesson.js";
import Chat from "../models/Chat.js";
import { recordUsage } from "../services/aiUsageService.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { "User-Agent": "mern-conceptbridge" } },
});

// Helper for fallback and fast latency
async function callGemini(contents, config = {}) {
  const models = [
    "gemini-3.1-flash-lite",
    "gemini-3.8-flash",
    "gemini-flash-latest",
  ];
  for (const model of models) {
    try {
      const modelConfig = {
        ...config,
        ...(model === "gemini-3.8-flash"
          ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
          : {}),
      };
      const response = await ai.models.generateContent({
        model,
        contents,
        config: modelConfig,
      });
      if (response?.text) {
        return {
          text: response.text,
          usage: {
            inputTokens: response.usageMetadata?.promptTokenCount || 0,
            outputTokens: response.usageMetadata?.candidatesTokenCount || 0,
          },
        };
      }
    } catch (err) {
      console.warn(`Model ${model} failed, trying next fallback:`, err.message);
    }
  }
  throw new Error("All AI models failed to respond.");
}

// 1. Generate Structured Lesson
export const generateLesson = async (req, res, next) => {
  try {
    const { topic, interest } = req.body;
    if (!topic || !interest) {
      return res
        .status(400)
        .json({ error: "Topic and interest are required." });
    }

    const systemInstruction = `You are an elite academic tutor engine.
Connect the topic "${topic}" to the student's interest "${interest}".
Maintain strict scientific accuracy, delineate where the analogy ends, and avoid walls of text.`;

    const userPrompt = `Create a structured lesson on "${topic}" using analogies from "${interest}".`;

    const { text: rawJson, usage } = await callGemini(userPrompt, {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING },
          simpleIntro: { type: Type.STRING },
          deepExplanation: { type: Type.STRING },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                heading: { type: Type.STRING },
                body: { type: Type.STRING },
                bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                callout: { type: Type.STRING },
              },
              required: ["heading", "body"],
            },
          },
          analogyBridge: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              analogyExplanation: { type: Type.STRING },
              mappings: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    conceptAspect: { type: Type.STRING },
                    analogyCounterpart: { type: Type.STRING },
                  },
                  required: ["conceptAspect", "analogyCounterpart"],
                },
              },
              scientificBoundary: { type: Type.STRING },
            },
            required: [
              "title",
              "analogyExplanation",
              "mappings",
              "scientificBoundary",
            ],
          },
          corePrinciples: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                formulaOrLaw: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
              required: ["name", "explanation"],
            },
          },
          practicalExample: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              scenario: { type: Type.STRING },
              connectionToTheory: { type: Type.STRING },
            },
            required: ["title", "scenario", "connectionToTheory"],
          },
          keyTerms: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING },
                definition: { type: Type.STRING },
              },
              required: ["term", "definition"],
            },
          },
          summary: { type: Type.STRING },
        },
        required: [
          "headline",
          "simpleIntro",
          "deepExplanation",
          "sections",
          "analogyBridge",
          "corePrinciples",
          "practicalExample",
          "keyTerms",
          "summary",
        ],
      },
    });

    await recordUsage(req.user._id, "lesson", usage);

    const parsedData = JSON.parse(rawJson);

    // Save to Mongo if user is logged in
    const userId = req.user?._id || req.user;
    let savedLesson = null;
    if (userId) {
      savedLesson = await Lesson.create({
        userId,
        topic,
        interest,
        ...parsedData,
      });
    }

    res.status(200).json({
      lesson: savedLesson
        ? savedLesson
        : { id: `temp-${Date.now()}`, topic, interest, ...parsedData },
    });
  } catch (err) {
    if (req.user) await recordError(req.user._id).catch(() => {});
    next(err);
  }
};

// 2. Chat Follow-up
export const chatFollowUp = async (req, res, next) => {
  try {
    const { lessonId, topic, interest, lessonContext, history, message, mode } = req.body;

    if (!lessonId || !message) {
      return res
        .status(400)
        .json({ error: "lessonId and message are required." });
    }
    //Students only can chat on lessons they own
    const owns = await Lesson.exists({ _id: lessonId, userId: req.user._id });
    if (!owns) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    let modeInstruction =
      "Answer directly and concisely in 2-3 short paragraphs.";
    if (mode === "doubt")
      modeInstruction = "Resolve the conceptual confusion with crisp logic.";
    if (mode === "simple")
      modeInstruction =
        "Explain using simple language and everyday physical intuition.";
    if (mode === "example")
      modeInstruction = "Provide another concrete real-world scenario.";

    const systemInstruction = `You are the student's personal academic AI tutor for "${topic}" (analogy: "${interest}").
Lesson Summary: ${lessonContext}
Instruction: ${modeInstruction}`;

    const contents = [];
    if (Array.isArray(history)) {
      history.slice(-6).forEach((h) => {
        contents.push({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content }],
        });
      });
    }
    contents.push({ role: "user", parts: [{ text: message }] });

    const { text: reply, usage } = await callGemini(contents, {
      systemInstruction,
    });

    await recordUsage(req.user._id, "chat", usage);

    // Save both sides of the exchange; upsert creates the Chat the first time
    await Chat.updateOne(
      { userId: req.user._id, lessonId },
      {
        $push: {
          messages: {
            $each: [
              { role: "user", content: message, mode },
              { role: "assistant", content: reply, mode },
            ],
          },
        },
      },
      { upsert: true },
    );

    res.status(200).json({ reply });
  } catch (err) {
    if (req.user) await recordError(req.user._id).catch(() => {});
    next(err);
  }
};

// 3. Quiz Generation
export const generateQuiz = async (req, res, next) => {
  try {
    const { topic, interest, lessonHeadline, lessonSummary, sectionsSummary } =
      req.body;

    const systemInstruction = `Generate 3 to 4 multiple-choice questions testing genuine conceptual understanding of "${topic}".
Exactly 4 options per question.
correctAnswerIndex must be 0, 1, 2, or 3.`;

    const userPrompt = `Topic: "${topic}", Interest: "${interest}", Summary: "${lessonSummary}"`;

    const { text: rawJson, usage } = await callGemini(userPrompt, {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswerIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
                conceptTested: { type: Type.STRING },
              },
              required: [
                "question",
                "options",
                "correctAnswerIndex",
                "explanation",
                "conceptTested",
              ],
            },
          },
        },
        required: ["questions"],
      },
    });

    await recordUsage(req.user._id, "quiz", usage);

    const parsed = JSON.parse(rawJson);
    res.status(200).json({
      quiz: {
        id: `quiz-${Date.now()}`,
        topic,
        questions: parsed.questions,
      },
    });
  } catch (err) {
    if (req.user) await recordError(req.user._id).catch(() => {});
    next(err);
  }
};
