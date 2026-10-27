import React, { useState } from "react";
import { tutorService } from "../../services/tutorService";
import { StartingScreen } from "./StartingScreen/StartingScreen";
import { LessonView } from "./LessonView/LessonView";
import { ConversationArea } from "./ConversationArea/ConversationArea";
import { QuizModal } from "./QuizModal/QuizModal";
import styles from "./AITutor.module.css";

const useTutor = () => {
  const [lesson, setLesson] = useState(null);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
  const [lessonError, setLessonError] = useState(null);

  const [chatMessages, setChatMessages] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const [quiz, setQuiz] = useState(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isQuizLoading, setIsQuizLoading] = useState(false);

  const startLearning = async (topic, interest) => {
    setIsLoadingLesson(true);
    setLessonError(null);
    setQuiz(null);
    setChatMessages([]);

    try {
      const data = await tutorService.generateLesson(topic, interest);
      setLesson(data);
      setChatMessages([
        {
          id: `welcome-${Date.now()}`,
          role: "assistant",
          content: `Hello! I've personalized this lesson on **${data.topic}** using analogies from **${data.interest}**.\n\nRead through the theory, check where the analogy ends, and test your understanding when ready!`,
          timestamp: Date.now(),
        },
      ]);
    } catch (err) {
      setLessonError(err.message);
    } finally {
      setIsLoadingLesson(false);
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
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I had trouble answering that. Please try again.",
          timestamp: Date.now(),
        },
      ]);
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
    } catch (err) {
      alert("Could not build the quiz. Please try again.");
    } finally {
      setIsQuizLoading(false);
    }
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
    startLearning,
    sendMessage,
    openQuiz,
    closeQuiz: () => setIsQuizModalOpen(false),
    resetLesson: () => {
      setLesson(null);
      setQuiz(null);
      setChatMessages([]);
    },
  };
};

export default function AICoaching() {
  const {
    lesson,
    isLoadingLesson,
    lessonError,
    chatMessages,
    isChatLoading,
    quiz,
    isQuizModalOpen,
    isQuizLoading,
    startLearning,
    sendMessage,
    openQuiz,
    closeQuiz,
    resetLesson,
  } = useTutor();

  const handleAskTutorDoubt = (doubtPrompt) => {
    sendMessage(doubtPrompt, "doubt");
  };

  return (
    <div className={styles.page}>
      {!lesson ? (
        <StartingScreen
          onStartLearning={startLearning}
          isLoading={isLoadingLesson}
          error={lessonError}
        />
      ) : (
        <div className={styles.container}>
          <LessonView
            lesson={lesson}
            onOpenQuiz={openQuiz}
            onChangeTopic={resetLesson}
            isQuizLoading={isQuizLoading}
          />
          <ConversationArea
            messages={chatMessages}
            onSendMessage={sendMessage}
            isLoading={isChatLoading}
            topic={lesson.topic}
            interest={lesson.interest}
          />
          {quiz && (
            <QuizModal
              quiz={quiz}
              isOpen={isQuizModalOpen}
              onClose={closeQuiz}
              onAskTutorDoubt={handleAskTutorDoubt}
            />
          )}
        </div>
      )}
    </div>
  );
}
