import api from "./api";

export const tutorService = {
  generateLesson: async (topic, interest, subject, age) => {
    const res = await api.post("/api/tutor/generate-lesson", {
      topic,
      interest,
      subject,
      age,
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

  getLessonVisuals: async (id) => {
    const res = await api.get(`/api/lessons/${id}/visuals`);
    return res.data.visuals;
  },

  searchVideos: async (query) => {
    const res = await api.get("/api/search/videos", {
      params: { q: query },
    });
    return res.data.videos || [];
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
