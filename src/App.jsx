import React, { useState, useEffect } from "react";
import {
  Sun,
  Moon,
  ArrowRight,
  Flame,
  Sparkles,
  Send,
  ChevronRight,
  Atom,
  Sigma,
  FlaskConical,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  NoDucks — a calm, Apple-inspired personal learning environment.    */
/*  Signature element: the "Focus Ring" — a hand-drawn-feeling arc     */
/*  that traces the day's single learning goal, echoing the brand's    */
/*  Plan → Understand → Practice → Apply → Improve cycle.              */
/* ------------------------------------------------------------------ */

const THEME_VARS = `
  .noducks-root[data-theme='light']{
    --bg: #FAF8F4;
    --bg-elevated: #FFFFFF;
    --fg: #1C1C1E;
    --fg-muted: #6E6E73;
    --surface: rgba(255,255,255,0.6);
    --surface-strong: rgba(255,255,255,0.78);
    --border: rgba(28,28,30,0.08);
    --border-strong: rgba(28,28,30,0.14);
    --shadow: 0 1px 2px rgba(28,28,30,0.04), 0 8px 24px rgba(28,28,30,0.06);
    --accent: #B8863B;
    --accent-soft: rgba(184,134,59,0.12);
    --accent-fg: #7A5726;
    --green: #4C7A5E;
    --green-soft: rgba(76,122,94,0.12);
  }
  .noducks-root[data-theme='dark']{
    --bg: #0A0A0B;
    --bg-elevated: #131315;
    --fg: #F5F5F7;
    --fg-muted: #9A9AA1;
    --surface: rgba(255,255,255,0.055);

    --surface-strong: rgba(255,255,255,0.09);
    --border: rgba(255,255,255,0.09);
    --border-strong: rgba(255,255,255,0.16);
    --shadow: 0 1px 2px rgba(0,0,0,0.3), 0 12px 32px rgba(0,0,0,0.45);
    --accent: #D3A25C;
    --accent-soft: rgba(211,162,92,0.14);
    --accent-fg: #E8C58C;
    --green: #7FB396;
    --green-soft: rgba(127,179,150,0.14);
  }
  .noducks-root{
    background: var(--bg);
    color: var(--fg);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    transition: background-color 0.5s ease, color 0.5s ease;
    min-height: 100vh;
  }
  .nd-glass{
    background: var(--surface);
    backdrop-filter: blur(20px) saturate(160%);
    -webkit-backdrop-filter: blur(20px) saturate(160%);
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
  }
  .nd-glass-strong{
    background: var(--surface-strong);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid var(--border-strong);
    box-shadow: var(--shadow);
  }
  .nd-fade-up{
    animation: ndFadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes ndFadeUp{
    from{ opacity:0; transform: translateY(14px); }
    to{ opacity:1; transform: translateY(0); }
  }
  .nd-ring-draw{
    animation: ndRingDraw 1.4s cubic-bezier(0.65,0,0.35,1) 0.3s both;
  }
  @keyframes ndRingDraw{
    from{ stroke-dashoffset: var(--ring-len); }
    to{ stroke-dashoffset: var(--ring-offset); }
  }
  @media (prefers-reduced-motion: reduce){
    .nd-fade-up, .nd-ring-draw{ animation: none !important; }
  }
`;

/* ------------------------------- data ------------------------------ */

const TODAYS_LEARNING = [
  {
    subject: "Physics",
    topic: "Newton's Laws",
    minutes: 35,
    progress: 0.6,
    action: "Continue",
    Icon: Atom,
  },
  {
    subject: "Mathematics",
    topic: "Quadratic Equations",
    minutes: 20,
    progress: 0,
    action: "Start practice",
    Icon: Sigma,
  },
  {
    subject: "Chemistry",
    topic: "Chemical Bonding",
    minutes: 45,
    progress: 1,
    action: "Review",
    Icon: FlaskConical,
  },
];

const CYCLE_STAGES = ["Plan", "Understand", "Practice", "Apply", "Improve"];

/* ----------------------------- Theme toggle -------------------------- */

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle color theme"
      className="relative flex h-9 w-16 items-center rounded-full nd-glass px-1 transition-colors duration-300"
      style={{ borderColor: "var(--border-strong)" }}
    >
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-500 ease-out"
        style={{
          background: "var(--bg-elevated)",
          transform: isDark ? "translateX(28px)" : "translateX(0px)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      >
        {isDark ? (
          <Moon size={14} strokeWidth={1.75} color="var(--accent-fg)" />
        ) : (
          <Sun size={14} strokeWidth={1.75} color="var(--accent-fg)" />
        )}
      </span>
    </button>
  );
}

/* -------------------------------- Navbar ------------------------------ */

function Navbar({ theme, onToggleTheme }) {
  const [active, setActive] = useState("Home");
  const links = ["Home", "Learn", "Practice", "Progress"];
  return (
    <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl nd-glass px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[13px] font-semibold"
            style={{ background: "var(--accent-soft)", color: "var(--accent-fg)" }}
          >
            N
          </span>
          <span className="text-[15px] font-semibold tracking-tight">NoDucks</span>
        </div>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l}>
              <button
                onClick={() => setActive(l)}
                className="rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-200"
                style={{
                  color: active === l ? "var(--fg)" : "var(--fg-muted)",
                  background: active === l ? "var(--surface-strong)" : "transparent",
                }}
              >
                {l}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold"
            style={{ background: "var(--accent)", color: "#fff" }}
            aria-label="Student profile"
          >
            A
          </div>
        </div>
      </nav>
    </header>
  );
}

/* ---------------------------- Focus ring (signature) ------------------- */

function FocusRing({ percent = 42 }) {
  const size = 108;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const len = 2 * Math.PI * r;
  const offset = len - (percent / 100) * len;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ ["--ring-len"]: len, ["--ring-offset"]: offset }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--border)"
        strokeWidth={stroke}
      />
      <circle
        className="nd-ring-draw"
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={len}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="47%"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fill: "var(--fg)", fontSize: 20, fontWeight: 700, fontFamily: "Inter" }}
      >
        {percent}%
      </text>
      <text
        x="50%"
        y="63%"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fill: "var(--fg-muted)", fontSize: 9, fontWeight: 500, letterSpacing: 0.3 }}
      >
        today
      </text>
    </svg>
  );
}

/* -------------------------------- Welcome ------------------------------ */

function WelcomeSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
      <div className="nd-fade-up flex flex-col items-start justify-between gap-8 rounded-3xl nd-glass p-6 sm:flex-row sm:items-center sm:p-9">
        <div className="max-w-lg">
          <p
            className="mb-2 text-[13px] font-medium"
            style={{ color: "var(--fg-muted)" }}
          >
            Thursday, August 27
          </p>
          <h1 className="text-[32px] font-bold leading-tight tracking-tight sm:text-[38px]">
            Good morning, Adam.
          </h1>
          <p className="mt-2 text-[16px]" style={{ color: "var(--fg-muted)" }}>
            Let's make today's learning count.
          </p>

          <div
            className="mt-7 inline-flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{ background: "var(--accent-soft)" }}
          >
            <Sparkles size={16} color="var(--accent-fg)" strokeWidth={2} />
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--accent-fg)" }}>
                Today's focus
              </p>
              <p className="text-[14px] font-semibold">Physics — Newton's Laws</p>
            </div>
          </div>

          <button
            className="mt-7 flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-semibold text-white transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "var(--accent)" }}
          >
            Continue Learning
            <ArrowRight size={15} strokeWidth={2.25} />
          </button>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-2">
          <FocusRing percent={42} />
          <p className="text-[12px]" style={{ color: "var(--fg-muted)" }}>
            of today's goal
          </p>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Today's Learning ------------------------ */

function LearningCard({ subject, topic, minutes, progress, action, Icon, delay }) {
  return (
    <div
      className="nd-fade-up group flex flex-col justify-between rounded-2xl nd-glass p-5 transition-transform duration-300 hover:-translate-y-1"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div>
        <div className="mb-4 flex items-center justify-between">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: "var(--accent-soft)" }}
          >
            <Icon size={16} color="var(--accent-fg)" strokeWidth={2} />
          </span>
          <span className="text-[12px] font-medium" style={{ color: "var(--fg-muted)" }}>
            {minutes} min
          </span>
        </div>
        <p className="text-[12px] font-medium uppercase tracking-wide" style={{ color: "var(--fg-muted)" }}>
          {subject}
        </p>
        <p className="mt-0.5 text-[17px] font-semibold leading-snug">{topic}</p>
      </div>

      <div className="mt-6">
        <div className="mb-3 h-1 w-full overflow-hidden rounded-full" style={{ background: "var(--border)" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progress * 100}%`, background: "var(--accent)" }}
          />
        </div>
        <button
          className="flex items-center gap-1 text-[13px] font-semibold transition-opacity duration-200 group-hover:opacity-70"
          style={{ color: "var(--accent-fg)" }}
        >
          {action}
          <ChevronRight size={14} strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
}

function TodaysLearning() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-[20px] font-semibold tracking-tight">Today's learning</h2>
        <span className="text-[13px] font-medium" style={{ color: "var(--fg-muted)" }}>
          3 subjects
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TODAYS_LEARNING.map((c, i) => (
          <LearningCard key={c.topic} {...c} delay={i * 90} />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ Progress -------------------------------- */

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-t py-3 first:border-t-0 first:pt-0" style={{ borderColor: "var(--border)" }}>
      <span className="text-[13px]" style={{ color: "var(--fg-muted)" }}>
        {label}
      </span>
      <span className="text-[14px] font-semibold">{value}</span>
    </div>
  );
}

function WeeklyBars() {
  const days = [
    { d: "M", v: 0.4 },
    { d: "T", v: 0.65 },
    { d: "W", v: 0.3 },
    { d: "T", v: 0.85 },
    { d: "F", v: 0.55 },
    { d: "S", v: 0.2 },
    { d: "S", v: 0.72 },
  ];
  return (
    <div className="flex h-28 items-end gap-2.5 sm:gap-3">
      {days.map((day, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-20 w-full items-end overflow-hidden rounded-lg" style={{ background: "var(--border)" }}>
            <div
              className="nd-fade-up w-full rounded-lg"
              style={{
                height: `${day.v * 100}%`,
                background: i === 6 ? "var(--accent)" : "var(--green)",
                opacity: i === 6 ? 1 : 0.65,
                animationDelay: `${i * 60}ms`,
              }}
            />
          </div>
          <span className="text-[11px] font-medium" style={{ color: "var(--fg-muted)" }}>
            {day.d}
          </span>
        </div>
      ))}
    </div>
  );
}

function ProgressSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
      <h2 className="mb-4 text-[20px] font-semibold tracking-tight">This week</h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="nd-fade-up rounded-2xl nd-glass p-6 lg:col-span-2">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-[13px]" style={{ color: "var(--fg-muted)" }}>
                Learning progress
              </p>
              <p className="text-[30px] font-bold leading-none">72%</p>
            </div>
            <span
              className="flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-semibold"
              style={{ background: "var(--green-soft)", color: "var(--green)" }}
            >
              +8% vs last week
            </span>
          </div>
          <WeeklyBars />
        </div>

        <div className="nd-fade-up rounded-2xl nd-glass p-6">
          <StatRow label="Topics completed" value="14" />
          <StatRow label="Practice accuracy" value="86%" />
          <StatRow
            label="Learning streak"
            value={
              <span className="flex items-center gap-1">
                <Flame size={13} color="var(--accent)" strokeWidth={2.25} />
                6 days
              </span>
            }
          />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Next Action --------------------------- */

function NextAction() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
      <div className="nd-fade-up flex flex-col items-start justify-between gap-6 rounded-3xl nd-glass-strong p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="max-w-xl">
          <p className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-fg)" }}>
            What should I do next?
          </p>
          <p className="mt-2 text-[19px] font-semibold leading-snug">
            Practice Newton's Second Law
          </p>
          <p className="mt-2 text-[14px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
            Your recent answers show you understand the formula but need more
            practice applying it to unfamiliar situations.
          </p>
        </div>
        <button
          className="shrink-0 rounded-full px-6 py-3 text-[14px] font-semibold text-white transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: "var(--accent)" }}
        >
          Start Practice
        </button>
      </div>
    </section>
  );
}

/* ----------------------------- Chatbot placeholder ----------------------- */

function ChatbotPlaceholder() {
  const prompts = ["Explain this concept", "Give me an example", "Practice me"];
  return (
    <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
      <div className="nd-fade-up mx-auto max-w-2xl rounded-3xl nd-glass p-6 sm:p-7">
        <div className="mb-1 flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{ background: "var(--accent-soft)" }}
          >
            <Sparkles size={14} color="var(--accent-fg)" strokeWidth={2.25} />
          </span>
          <div>
            <p className="text-[14px] font-semibold leading-none">NoDucks AI</p>
            <p className="mt-1 text-[12px]" style={{ color: "var(--fg-muted)" }}>
              Understand it, don't just memorize it.
            </p>
          </div>
        </div>

        <p className="mt-4 text-[13px]" style={{ color: "var(--fg-muted)" }}>
          Ask me about what you're learning.
        </p>

        <div
          className="mt-3 flex items-center gap-2 rounded-full px-4 py-2.5"
          style={{ background: "var(--surface-strong)", border: "1px solid var(--border)" }}
        >
          <input
            disabled
            placeholder="Ask a question..."
            className="w-full bg-transparent text-[13px] outline-none placeholder:opacity-60"
            style={{ color: "var(--fg)" }}
          />
          <Send size={15} color="var(--fg-muted)" strokeWidth={2} />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {prompts.map((p) => (
            <button
              key={p}
              className="rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors duration-200 hover:opacity-80"
              style={{ background: "var(--accent-soft)", color: "var(--accent-fg)" }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Learning cycle --------------------------- */

function LearningCycle() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <p className="mb-6 text-center text-[12px] font-medium uppercase tracking-widest" style={{ color: "var(--fg-muted)" }}>
        The NoDucks way
      </p>
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-2">
        {CYCLE_STAGES.map((stage, i) => (
          <React.Fragment key={stage}>
            <span className="text-[14px] font-semibold tracking-tight" style={{ color: i === 2 ? "var(--accent-fg)" : "var(--fg)" }}>
              {stage}
            </span>
            {i < CYCLE_STAGES.length - 1 && (
              <ArrowRight
                size={14}
                strokeWidth={2}
                className="rotate-90 sm:rotate-0"
                color="var(--fg-muted)"
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

/* ------------------------- Zapier chatbot embed -------------------------- */
/* Loads Zapier's web component script once and mounts the floating popup   */
/* launcher it provides. The styled ChatbotPlaceholder card above stays as  */
/* the on-page teaser; this is the actual working chat, opened from its own */
/* floating launcher button (that's what is-popup="true" renders).          */

const ZAPIER_SCRIPT_SRC =
  "https://interfaces.zapier.com/assets/web-components/zapier-interfaces/zapier-interfaces.esm.js";

function ZapierChatbotEmbed({ chatbotId }) {
  useEffect(() => {
    if (document.querySelector(`script[src="${ZAPIER_SCRIPT_SRC}"]`)) return;
    const script = document.createElement("script");
    script.type = "module";
    script.async = true;
    script.src = ZAPIER_SCRIPT_SRC;
    document.body.appendChild(script);
    // Intentionally not removed on unmount: Zapier's web component
    // registers a custom element globally, so re-injecting it on
    // remount/hot-reload would throw a "already defined" error.
  }, []);

  return React.createElement("zapier-interfaces-chatbot-embed", {
    "is-popup": "true",
    "chatbot-id": chatbotId,
  });
}

/* ---------------------------------- App ---------------------------------- */

export default function App() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  return (
    <div className="noducks-root" data-theme={theme}>
      <style>{THEME_VARS}</style>
      <Navbar theme={theme} onToggleTheme={() => setTheme((t) => (t === "light" ? "dark" : "light"))} />
      <main className="pb-16">
        <WelcomeSection />
        <TodaysLearning />
        <ProgressSection />
        <NextAction />
        <ChatbotPlaceholder />
        <LearningCycle />
      </main>
      <ZapierChatbotEmbed chatbotId="cmtbb1izn0019x903vxttz088" />
    </div>
  );
}