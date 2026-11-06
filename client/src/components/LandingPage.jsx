import { useState } from "react";
import { Register } from "./Register";
import { Login } from "./Login";

const FEATURES = [
  {
    tag: "WebSockets",
    title: "Instant Bidirectional Delivery",
    description:
      "Messages travel over a persistent Socket.IO connection and are stored in MongoDB so conversations stay synced in real time.",
    icon: (
      <svg
        width='20'
        height='20'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        aria-hidden='true'
      >
        <polygon points='13 2 3 14 12 14 11 22 21 10 12 10 13 2' />
      </svg>
    ),
  },
  {
    tag: "Live Presence",
    title: "Real-Time Typing Indicator",
    description:
      "Debounced typing events show when your contact is actively composing a message and clear automatically when they pause.",
    icon: (
      <svg
        width='20'
        height='20'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        aria-hidden='true'
      >
        <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
      </svg>
    ),
  },
  {
    tag: "Delivery Status",
    title: "Read Receipts (✔ to ✔✔)",
    description:
      "Every sent message starts with a single check (✔) and updates to a double check (✔✔) the moment your contact reads it.",
    icon: (
      <svg
        width='20'
        height='20'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        aria-hidden='true'
      >
        <polyline points='20 6 9 17 4 12' />
      </svg>
    ),
  },
  {
    tag: "Chronology",
    title: "Timestamps & Date Grouping",
    description:
      "Messages display localized time stamps and are organized under Today, Yesterday, and calendar date headers.",
    icon: (
      <svg
        width='20'
        height='20'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        aria-hidden='true'
      >
        <circle cx='12' cy='12' r='10' />
        <polyline points='12 6 12 12 16 14' />
      </svg>
    ),
  },
  {
    tag: "Expressive",
    title: "Integrated Emoji Picker",
    description:
      "Insert emojis into any message using the built-in searchable emoji picker with keyboard and click-outside support.",
    icon: (
      <svg
        width='20'
        height='20'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        aria-hidden='true'
      >
        <circle cx='12' cy='12' r='10' />
        <path d='M8 14s1.5 2 4 2 4-2 4-2' />
        <line x1='9' y1='9' x2='9.01' y2='9' />
        <line x1='15' y1='9' x2='15.01' y2='9' />
      </svg>
    ),
  },
  {
    tag: "Security",
    title: "JWT & Bcrypt Authentication",
    description:
      "Credentials are hashed with bcrypt, verified with JWT tokens, and persisted cleanly across browser reloads.",
    icon: (
      <svg
        width='20'
        height='20'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        aria-hidden='true'
      >
        <rect x='3' y='11' width='18' height='11' rx='2' ry='2' />
        <path d='M7 11V7a5 5 0 0 1 10 0v4' />
      </svg>
    ),
  },
];

const LandingPage = ({ setUser, currentUser, onContinueToChat }) => {
  const [previewMode, setPreviewMode] = useState("all");

  const focusAuthInput = (inputId) => {
    const authSection = document.getElementById("auth-section");
    if (authSection) {
      authSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setTimeout(() => {
      const el = document.getElementById(inputId);
      if (el) el.focus();
    }, 250);
  };

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleBrandClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className='landing-shell'>
      {/* ── Sticky Top Navigation ── */}
      <nav className='landing-navbar' aria-label='Main navigation'>
        <div className='landing-nav-inner'>
          <div
            className='app-brand nav-brand'
            onClick={handleBrandClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleBrandClick();
              }
            }}
            role='button'
            tabIndex={0}
            title='ChatFlow — Real-time messaging'
          >
            <span className='nav-brand-logo'>
              💬 Chat<em>Flow</em>
            </span>
            <span className='nav-brand-tag'>
              Real-time messaging, built simple.
            </span>
          </div>

          <div className='landing-nav-links'>
            <button
              type='button'
              className='nav-link-btn'
              onClick={() => scrollToSection("auth-section")}
            >
              Account
            </button>
            <button
              type='button'
              className='nav-link-btn'
              onClick={() => scrollToSection("features-section")}
            >
              Features
            </button>
            <button
              type='button'
              className='nav-link-btn'
              onClick={() => scrollToSection("workflow-section")}
            >
              How It Works
            </button>
          </div>

          <div className='landing-nav-actions'>
            {currentUser && onContinueToChat ? (
              <button
                type='button'
                className='nav-btn-primary'
                onClick={onContinueToChat}
              >
                Back to Chat ({currentUser.username}) →
              </button>
            ) : (
              <>
                <button
                  type='button'
                  className='nav-btn-secondary'
                  onClick={() => focusAuthInput("login-username")}
                >
                  Sign In
                </button>
                <button
                  type='button'
                  className='nav-btn-primary'
                  onClick={() => focusAuthInput("reg-username")}
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className='auth-page-wrapper'>
        <div className='container landing-container'>
          {/* ── Hero + Live Chat Preview Split ── */}
          <section className='landing-hero-grid'>
            <div className='landing-hero-copy'>
              <div className='brand-pill'>
                <span className='brand-pill-dot' />
                <span>Real-Time WebSocket Messaging • MERN</span>
              </div>

              <div
                className='app-brand hero-brand-block'
                onClick={() => focusAuthInput("reg-username")}
                title='ChatFlow'
              >
                <h1 className='brand-title'>
                  💬 Chat<em>Flow</em>
                </h1>
                <p className='brand-tagline'>
                  Real-time messaging, built simple.
                </p>
              </div>

              <p className='landing-hero-description'>
                Communicate instantly with your contacts over persistent
                Socket.IO channels. Experience live typing indicators,
                single-to-double tick read receipts, localized timestamps, and
                rich emoji messaging in a distraction-free workspace.
              </p>

              <div className='landing-hero-ctas'>
                {currentUser && onContinueToChat ? (
                  <>
                    <button
                      type='button'
                      className='hero-cta-primary'
                      onClick={onContinueToChat}
                    >
                      Continue to Chat as {currentUser.username} →
                    </button>
                    <button
                      type='button'
                      className='hero-cta-secondary'
                      onClick={() => focusAuthInput("login-username")}
                    >
                      Switch Account
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type='button'
                      className='hero-cta-primary'
                      onClick={() => focusAuthInput("reg-username")}
                    >
                      Get Started Free →
                    </button>
                    <button
                      type='button'
                      className='hero-cta-secondary'
                      onClick={() => focusAuthInput("login-username")}
                    >
                      Sign In to Chat
                    </button>
                  </>
                )}
              </div>

              <div className='landing-feature-chips'>
                <span>⚡ Instant Socket.IO</span>
                <span>✍️ Live Typing Status</span>
                <span>✔✔ Read Receipts</span>
                <span>🕒 Message Timestamps</span>
                <span>😊 Emoji Picker</span>
              </div>
            </div>

            {/* ── Interactive Live Interface Mockup ── */}
            <div
              className='landing-preview-card'
              aria-label='ChatFlow interface preview'
            >
              <div className='preview-window-bar'>
                <div className='preview-window-dots'>
                  <span className='dot-warm' />
                  <span className='dot-amber' />
                  <span className='dot-teal' />
                </div>
                <span className='preview-window-title'>
                  ChatFlow — Live Preview
                </span>
                <span className='preview-live-pill'>● Connected</span>
              </div>

              <div
                className='preview-filter-tabs'
                role='tablist'
                aria-label='Preview highlights'
              >
                <button
                  type='button'
                  role='tab'
                  aria-selected={previewMode === "all"}
                  className={`preview-tab ${previewMode === "all" ? "active" : ""}`}
                  onClick={() => setPreviewMode("all")}
                >
                  All Features
                </button>
                <button
                  type='button'
                  role='tab'
                  aria-selected={previewMode === "receipts"}
                  className={`preview-tab ${
                    previewMode === "receipts" ? "active" : ""
                  }`}
                  onClick={() => setPreviewMode("receipts")}
                >
                  Read Receipts ✔✔
                </button>
                <button
                  type='button'
                  role='tab'
                  aria-selected={previewMode === "typing"}
                  className={`preview-tab ${
                    previewMode === "typing" ? "active" : ""
                  }`}
                  onClick={() => setPreviewMode("typing")}
                >
                  Typing & Emoji 😊
                </button>
              </div>

              <div className='preview-chat-body'>
                <div className='preview-contact-bar'>
                  <div className='preview-avatar'>A</div>
                  <div className='preview-contact-meta'>
                    <strong>alex_dev</strong>
                    <span>● Online • Instant WebSocket</span>
                  </div>
                  <span className='preview-date-tag'>Today</span>
                </div>

                <div className='preview-messages-stream'>
                  <div className='preview-bubble received'>
                    <span className='preview-sender'>alex_dev</span>
                    <p>Hey! Did the real-time Socket.IO update go live?</p>
                    <div className='preview-meta'>
                      <span>10:41 AM</span>
                    </div>
                  </div>

                  <div
                    className={`preview-bubble sent ${
                      previewMode === "receipts" ? "highlight-ring" : ""
                    }`}
                  >
                    <span className='preview-sender'>sourabh</span>
                    <p>
                      Yes! Messages, timestamps, and double-tick read receipts
                      update immediately 🚀
                    </p>
                    <div className='preview-meta'>
                      <span>10:42 AM</span>
                      <span
                        className='preview-ticks'
                        title='Read by recipient'
                      >
                        ✔✔
                      </span>
                    </div>
                  </div>

                  <div
                    className={`preview-typing-row ${
                      previewMode === "typing" ? "highlight-ring" : ""
                    }`}
                  >
                    <span className='preview-typing-dots'>
                      <i />
                      <i />
                      <i />
                    </span>
                    <span>alex_dev is typing…</span>
                  </div>
                </div>

                <div className='preview-composer-bar'>
                  <span className='preview-emoji-btn' aria-hidden='true'>
                    😊
                  </span>
                  <span className='preview-input-placeholder'>
                    Type a message with emojis…
                  </span>
                  <span className='preview-send-icon' aria-hidden='true'>
                    ➤
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ── Authentication Section (Register & Login) ── */}
          <section id='auth-section' className='landing-auth-section'>
            <div className='section-header-block'>
              <span className='section-eyebrow'>Start Messaging</span>
              <h2>Sign in or create your ChatFlow account</h2>
              <p>
                Pick a username to start a new account in seconds, or sign in to
                resume your conversations.
              </p>
            </div>

            <div className='auth-cards-grid'>
              <div className='auth-card-col'>
                <Register setUser={setUser} />
              </div>
              <div className='auth-card-col'>
                <Login setUser={setUser} />
              </div>
            </div>
          </section>

          {/* ── Feature Bento Grid ── */}
          <section id='features-section' className='landing-features-section'>
            <div className='section-header-block'>
              <span className='section-eyebrow'>Built for Real-Time Clarity</span>
              <h2>Everything needed for responsive messaging</h2>
              <p>
                Designed around low-latency WebSocket events and persistent
                MongoDB storage.
              </p>
            </div>

            <div className='features-bento-grid'>
              {FEATURES.map((item) => (
                <article key={item.title} className='feature-bento-card'>
                  <div className='feature-card-top'>
                    <div className='feature-icon-box'>{item.icon}</div>
                    <span className='feature-tag-pill'>{item.tag}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </section>

          {/* ── How It Works / Architecture Strip ── */}
          <section id='workflow-section' className='landing-workflow-section'>
            <div className='section-header-block'>
              <span className='section-eyebrow'>Architecture Flow</span>
              <h2>How ChatFlow connects conversations</h2>
            </div>

            <div className='workflow-steps-grid'>
              <div className='workflow-step-card'>
                <span className='workflow-step-num'>01</span>
                <h4>Register or Sign In</h4>
                <p>
                  Create an account with bcrypt password hashing and JWT
                  authentication. Your session stays active across reloads.
                </p>
              </div>
              <div className='workflow-step-card'>
                <span className='workflow-step-num'>02</span>
                <h4>Select Any Contact</h4>
                <p>
                  Browse or search registered contacts in the sidebar and load
                  chronological conversation history from MongoDB.
                </p>
              </div>
              <div className='workflow-step-card'>
                <span className='workflow-step-num'>03</span>
                <h4>Chat in Real Time</h4>
                <p>
                  Exchange messages with instant delivery, live typing status,
                  emoji support, and real-time read receipts (✔✔).
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* ── Clean Product Footer ── */}
      <footer className='landing-footer'>
        <div className='landing-footer-inner'>
          <div className='footer-brand-col'>
            <span className='footer-brand-name'>
              💬 Chat<em>Flow</em>
            </span>
            <p>Real-time messaging, built simple.</p>
          </div>

          <div className='footer-tech-badges'>
            <span>React</span>
            <span>Express</span>
            <span>MongoDB</span>
            <span>Socket.IO</span>
            <span>JWT Auth</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export { LandingPage };
export default LandingPage;
