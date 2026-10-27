import api from "./api";

export const tutorService = {
  generateLesson: async (topic, interest) => {
    const res = await api.post("/api/tutor/generate-lesson", {
      topic,
      interest,
    });
    return res.data.lesson;
  },

  sendChatMessage: async (payload) => {
    const res = await api.post("/api/tutor/chat", payload);
    return res.data.reply;
  },

  generateQuiz: async (payload) => {
    const res = await api.post("/api/tutor/generate-quiz", payload);
    return res.data.quiz;
  },
};
