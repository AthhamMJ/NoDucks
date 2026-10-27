export const PLAN_QUOTAS = {
    free : { lesson: 3, chat: 20, quiz: 3 },
    student: { lesson: 30, chat: 300, quiz: 30 },
}

//Maps the action to the counter field in AiUsage
export const COUNTER_FIELD = {
    lesson: "lessons",
    chat: "chats",
    quiz:"quizzes",
}

export const currentPeriod = () => new Date().toISOString().slice(0, 7)