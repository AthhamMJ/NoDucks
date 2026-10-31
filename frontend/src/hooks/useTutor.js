import { useState, useEffect, useCallback } from "react";
import { tutorService } from "../services/tutorService";

const welcomeMessage = (lesson) => ({
  id: `welcome-${lesson._id}`,
  role: "assistant",
  content: `Hello! I've personalized this lesson on **${lesson.topic}** using analogies from **${lesson.interest}**.\n\nRead through the theory, check where the analogy ends, and test your understanding when ready!`,
  timestamp: Date.now(),
});

const toUiMessage = (m) => ({
  id: m._id,
  role: m.role,
  content: m.content,
  mode: m.mode,
  timestamp: m.createdAt ? new Date(m.createdAt).getTime() : Date.now(),
});

export const useTutor = () => {
  const [lesson, setLesson] = useState(null);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
  const [lessonError, setLessonError] = useState(null);

  const [chatMessages, setChatMessages] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const [quiz, setQuiz] = useState(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isQuizLoading, setIsQuizLoading] = useState(false);

  const [lessons, setLessons] = useState([]);
  const [usage, setUsage] = useState(null);

  const refreshLessons = useCallback(async () => {
    try {
      setLessons(await tutorService.getLessons());
    } catch {
      // The panel keeps its last list if this fails
    }
  }, []);

  const refreshUsage = useCallback(async () => {
    try {
      setUsage(await tutorService.getUsage());
    } catch {
      // The meter stays hidden if this fails
    }
  }, []);

  useEffect(() => {
    refreshLessons();
    refreshUsage();
  }, [refreshLessons, refreshUsage]);

  const startLearning = async (topic, interest) => {
    setIsLoadingLesson(true);
    setLessonError(null);
    setQuiz(null);

    try {
      const data = await tutorService.generateLesson(topic, interest);
      setLesson(data);
      setChatMessages([welcomeMessage(data)]);
      refreshLessons();
      refreshUsage();
    } catch (err) {
      setLessonError(err.message);
      refreshUsage();
    } finally {
      setIsLoadingLesson(false);
    }
  };

  const openLesson = async (id) => {
    if (lesson?._id === id) return;

    setIsLoadingLesson(true);
    setLessonError(null);
    setQuiz(null);

    try {
      const [data, messages] = await Promise.all([
        tutorService.getLesson(id),
        tutorService.getLessonChat(id),
      ]);
      setLesson(data);
      setChatMessages(
        messages.length ? messages.map(toUiMessage) : [welcomeMessage(data)]
      );
    } catch (err) {
      setLessonError(err.message);
    } finally {
      setIsLoadingLesson(false);
    }
  };

  const removeLesson = async (id) => {
    if (!window.confirm("Delete this lesson and its chat history?")) return;

    try {
      await tutorService.deleteLesson(id);
      setLessons((prev) => prev.filter((l) => l._id !== id));
      if (lesson?._id === id) {
        setLesson(null);
        setQuiz(null);
        setChatMessages([]);
      }
    } catch (err) {
      alert(err.message || "Could not delete this lesson.");
    }
  };

  const sendMessage = async (text, mode = "question") => {
    if (!lesson) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: Date.now(),
      mode,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const reply = await tutorService.sendChatMessage({
        lessonId: lesson._id,
        topic: lesson.topic,
        interest: lesson.interest,
        lessonContext: `${lesson.headline}. ${lesson.simpleIntro} ${lesson.summary}`,
        history: chatMessages
          .slice(-6)
          .map((m) => ({ role: m.role, content: m.content })),
        message: text,
        mode,
      });

      setChatMessages((prev) => [
        ...prev,
        {
          id: `tutor-${Date.now()}`,
          role: "assistant",
          content: reply,
          timestamp: Date.now(),
        },
      ]);
      refreshUsage();
    } catch (err) {
      // Quota errors come back as readable messages, so show them directly
      setChatMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            err.message || "Sorry, I had trouble answering that. Please try again.",
          timestamp: Date.now(),
        },
      ]);
      refreshUsage();
    } finally {
      setIsChatLoading(false);
    }
  };

  const openQuiz = async () => {
    if (!lesson) return;
    if (quiz) {
      setIsQuizModalOpen(true);
      return;
    }

    setIsQuizLoading(true);
    try {
      const data = await tutorService.generateQuiz({
        topic: lesson.topic,
        interest: lesson.interest,
        lessonHeadline: lesson.headline,
        lessonSummary: lesson.summary,
        sectionsSummary: (lesson.sections || [])
          .map((s) => `${s.heading}: ${s.body}`)
          .join("\n"),
      });
      setQuiz(data);
      setIsQuizModalOpen(true);
      refreshUsage();
    } catch (err) {
      alert(err.message || "Could not build the quiz. Please try again.");
      refreshUsage();
    } finally {
      setIsQuizLoading(false);
    }
  };

  const resetLesson = () => {
    setLesson(null);
    setQuiz(null);
    setChatMessages([]);
    setLessonError(null);
  };

  return {
    lesson,
    isLoadingLesson,
    lessonError,
    chatMessages,
    isChatLoading,
    quiz,
    isQuizModalOpen,
    isQuizLoading,
    lessons,
    usage,
    startLearning,
    openLesson,
    removeLesson,
    sendMessage,
    openQuiz,
    closeQuiz: () => setIsQuizModalOpen(false),
    resetLesson,
  };
};