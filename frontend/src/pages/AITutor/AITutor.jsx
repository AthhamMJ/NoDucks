import React from "react";
import { useTutor } from "../../hooks/useTutor";
import { StartingScreen } from "./StartingScreen/StartingScreen";
import { LessonView } from "./LessonView/LessonView";
import { ConversationArea } from "./ConversationArea/ConversationArea";
import { QuizModal } from "./QuizModal/QuizModal";
import { HistoryPanel } from "./HistoryPanel/HistoryPanel";
import styles from "./AITutor.module.css";

export default function AITutor() {
  const {
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
    closeQuiz,
    resetLesson,
  } = useTutor();

  const handleAskTutorDoubt = (doubtPrompt) => {
    sendMessage(doubtPrompt, "doubt");
  };

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        <HistoryPanel
          lessons={lessons}
          usage={usage}
          activeLessonId={lesson?._id}
          onOpen={openLesson}
          onDelete={removeLesson}
          onNew={resetLesson}
        />

        <main className={styles.main}>
          {!lesson ? (
            <StartingScreen
              onStartLearning={startLearning}
              isLoading={isLoadingLesson}
              error={lessonError}
            />
          ) : (
            <>
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
            </>
          )}

          {quiz && (
            <QuizModal
              quiz={quiz}
              isOpen={isQuizModalOpen}
              onClose={closeQuiz}
              onAskTutorDoubt={handleAskTutorDoubt}
            />
          )}
        </main>
      </div>
    </div>
  );
}