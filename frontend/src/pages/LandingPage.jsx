import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const ICONS = {
  chat: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
  summary:
    "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  image:
    "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  lock: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  moon: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z",
};

const FEATURES = [
  {
    icon: "chat",
    title: "Real-time messaging",
    body: "Messages arrive instantly over WebSockets, with live typing indicators and online status.",
  },
  {
    icon: "summary",
    title: "AI summaries",
    body: "Catch up on a long chat in a sentence or two, generated from your recent messages.",
  },
  {
    icon: "search",
    title: "Conversation search",
    body: "Remember the topic, not the date. Search a chat and jump to the message.",
  },
  {
    icon: "image",
    title: "Image sharing",
    body: "Drop in photos and screenshots. They're uploaded and delivered in the thread.",
  },
  {
    icon: "lock",
    title: "Secure sign-in",
    body: "Email and password with hashed credentials, or continue with Google.",
  },
  {
    icon: "moon",
    title: "Light and dark",
    body: "A calm, minimal interface that works on desktop and mobile, day or night.",
  },
];

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* Fades and lifts children into view once, when they scroll on screen. */
function Reveal({
  children,
  delay = 0,
  y = 20,
  className = "",
  as: Tag = "div",
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(prefersReducedMotion());

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate3d(0,0,0)" : `translate3d(0,${y}px,0)`,
        transition: `opacity 700ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 700ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}

function Icon({ name, className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[name]} />
    </svg>
  );
}

function Screenshot({ src, alt, priority = false }) {
  return (
    <div className="group rounded-2xl border border-border dark:border-border-dark bg-panel dark:bg-panel-dark shadow-card overflow-hidden transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.18)]">
      <div className="flex items-center gap-1.5 px-4 h-9 border-b border-border dark:border-border-dark bg-surface dark:bg-surface-dark/60">
        <span className="w-2.5 h-2.5 rounded-full bg-border dark:bg-border-dark transition-colors duration-300 group-hover:bg-rose-300" />
        <span className="w-2.5 h-2.5 rounded-full bg-border dark:bg-border-dark transition-colors duration-300 group-hover:bg-amber-300" />
        <span className="w-2.5 h-2.5 rounded-full bg-border dark:bg-border-dark transition-colors duration-300 group-hover:bg-emerald-300" />
      </div>
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        className="w-full h-auto block"
      />
    </div>
  );
}

function Showcase({ eyebrow, title, body, src, alt, reverse = false }) {
  return (
    <section className="w-full max-w-[1800px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-16 sm:py-20">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <Reveal className={reverse ? "lg:order-2" : ""}>
          <p className="text-xs font-medium uppercase tracking-widest text-accent mb-3">
            {eyebrow}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl text-charcoal dark:text-[#f0f0ee] leading-tight mb-4">
            {title}
          </h2>
          <p className="text-base text-muted dark:text-muted-dark leading-relaxed max-w-md">
            {body}
          </p>
        </Reveal>
        <Reveal delay={120} y={28} className={reverse ? "lg:order-1" : ""}>
          <Screenshot src={src} alt={alt} />
        </Reveal>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  // Nav gets a soft shadow once you scroll; anchor links scroll smoothly.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const html = document.documentElement;
    const previous = html.style.scrollBehavior;
    if (!prefersReducedMotion()) html.style.scrollBehavior = "smooth";

    return () => {
      window.removeEventListener("scroll", onScroll);
      html.style.scrollBehavior = previous;
    };
  }, []);

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark text-charcoal dark:text-[#f0f0ee]">
      {/* Nav */}
      <header
        className={`sticky top-0 z-30 backdrop-blur bg-surface/80 dark:bg-surface-dark/80 border-b border-border dark:border-border-dark transition-shadow duration-300 ${
          scrolled ? "shadow-soft" : ""
        }`}
      >
        <div className="w-full max-w-[1800px] mx-auto h-14 px-5 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-display text-lg tracking-tight select-none"
          >
            <img
              src="/SynQ-Logo.png"
              alt="SynQ logo"
              className="w-10 h-10 object-contain"
              draggable="false"
            />
            <span>SynQ</span>
          </Link>
          <nav className="flex items-center gap-2">
            <a
              href="#features"
              className="hidden sm:block text-sm text-muted dark:text-muted-dark hover:text-charcoal dark:hover:text-[#f0f0ee] px-3 transition-colors duration-200"
            >
              Features
            </a>
            <Link
              to="/login"
              className="text-sm px-3 py-1.5 text-muted dark:text-muted-dark hover:text-charcoal dark:hover:text-[#f0f0ee] transition-colors duration-200"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="text-sm px-4 py-1.5 rounded-xl bg-charcoal dark:bg-[#f0f0ee] text-panel dark:text-charcoal font-medium hover:opacity-90 active:scale-[0.98] transition-opacity duration-200"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#2c2c2a 1px, transparent 1px), linear-gradient(90deg, #2c2c2a 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative w-full max-w-[1800px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 pt-16 sm:pt-24 pb-12 text-center">
          <Reveal>
            <h1 className="font-display text-4xl sm:text-6xl leading-[1.1] max-w-3xl mx-auto mb-5">
              Conversations you can actually keep up with.
            </h1>
          </Reveal>
          <Reveal delay={80}>
            <p className="text-base sm:text-lg text-muted dark:text-muted-dark max-w-xl mx-auto leading-relaxed mb-8">
              SynQ is a calm, fast messenger that summarizes long chats and
              helps you find that one message without scrolling.
            </p>
          </Reveal>
          <Reveal delay={160}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/signup"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-charcoal dark:bg-[#f0f0ee] text-panel dark:text-charcoal text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-opacity duration-200"
              >
                Create free account
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-border dark:border-border-dark bg-panel dark:bg-panel-dark text-sm font-medium hover:bg-surface dark:hover:bg-surface-dark/50 active:scale-[0.98] transition-colors duration-200"
              >
                Sign in
              </Link>
            </div>
            <p className="text-xs text-muted dark:text-muted-dark mt-4">
              Sign up with email or continue with Google.
            </p>
          </Reveal>
        </div>

        <Reveal
          delay={240}
          y={36}
          className="relative w-full max-w-[1600px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 xl:px-16 pb-16"
        >
          <Screenshot
            src="/screenshots/chat-page.png"
            alt="SynQ chat interface"
            priority
          />
        </Reveal>
      </section>

      {/* Features */}
      <section
        id="features"
        className="w-full max-w-[1800px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-16 sm:py-20 scroll-mt-16"
      >
        <Reveal className="max-w-xl mb-12">
          <p className="text-xs font-medium uppercase tracking-widest text-accent mb-3">
            What's inside
          </p>
          <h2 className="font-display text-3xl sm:text-4xl leading-tight">
            The basics done well, plus two things that save you time.
          </h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 80}>
              <div className="group h-full rounded-2xl border border-border dark:border-border-dark bg-panel dark:bg-panel-dark p-6 shadow-soft transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-card hover:border-accent/30">
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-accent group-hover:text-white group-hover:scale-105">
                  <Icon name={f.icon} />
                </div>
                <h3 className="text-sm font-medium mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted dark:text-muted-dark leading-relaxed">
                  {f.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <Showcase
        eyebrow="AI summaries"
        title="Skip the scroll. Get the gist."
        body="One click turns your recent messages into a short summary, so you can rejoin a long thread without reading all of it. Powered by Llama 3.3 through Groq."
        src="/screenshots/ai-summary.png"
        alt="AI conversation summary in SynQ"
      />

      <Showcase
        reverse
        eyebrow="Search"
        title="Remember the topic, not the date."
        body="Type 'meeting' and jump straight to the messages about it, instead of scrolling back through weeks of chat."
        src="/screenshots/semantic-search.png"
        alt="Searching messages in SynQ"
      />

      {/* Final CTA */}
      <section className="w-full max-w-[1400px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 py-16 sm:py-24">
        <Reveal>
          <div className="rounded-3xl border border-border dark:border-border-dark bg-panel dark:bg-panel-dark shadow-card px-6 sm:px-12 py-12 text-center">
            <h2 className="font-display text-3xl sm:text-4xl mb-3">
              Try it in under a minute.
            </h2>
            <p className="text-muted dark:text-muted-dark mb-7 max-w-md mx-auto">
              Create an account, start a conversation, and see the summary in
              action.
            </p>
            <Link
              to="/signup"
              className="inline-block px-6 py-3 rounded-xl bg-charcoal dark:bg-[#f0f0ee] text-panel dark:text-charcoal text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-opacity duration-200"
            >
              Get started
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-border dark:border-border-dark">
        <div className="w-full max-w-[1800px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted dark:text-muted-dark">
          <p>© 2026 Sahil Vishwakarma</p>
          <p>Built with React, Node.js, MongoDB and Socket.io</p>
          <a
            href="https://github.com/sahil78tt/synq-app"
            target="_blank"
            rel="noreferrer"
            className="hover:text-charcoal dark:hover:text-[#f0f0ee] transition-colors duration-200"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
