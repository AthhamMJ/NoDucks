export const plans = [
  {
    id: "free",
    name: "Free",
    monthly: 0,
    yearly: 0,
    description: "Get started with the basics.",
    features: ["Up to 5 subjects", "Tasks and notes", "Basic streak tracking"],
  },
  {
    id: "student",
    name: "Student",
    monthly: 4.99,
    yearly: 39.99,
    description: "Built for students, with discounted pricing.",
    features: [
      "Unlimited subjects",
      "AI coaching sessions",
      "Quizzes from your notes",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    id: "premium",
    name: "Premium",
    monthly: 9.99,
    yearly: 79.99,
    description: "Everything, plus early access to new features.",
    features: [
      "Everything in Student",
      "Experiment Lab access",
      "Advanced progress insights",
      "Early access to new features",
    ],
  },
];