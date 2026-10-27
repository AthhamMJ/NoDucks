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

  getLessons: async () => {
    const res = await api.get("/api/lessons");
    return res.data.lessons;
  },

  getLesson: async (id) => {
    const res = await api.get(`/api/lessons/${id}`);
    return res.data.lesson;
  },

  getLessonChat: async (id) => {
    const res = await api.get(`/api/lessons/${id}/chat`);
    return res.data.messages;
  },

  deleteLesson: async (id) => {
    await api.delete(`/api/lessons/${id}`);
  },

  getUsage: async () => {
    const res = await api.get("/api/tutor/usage");
    return res.data;
  },
};
