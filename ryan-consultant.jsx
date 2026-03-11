import { useState, useEffect, useRef } from "react";

const API_URL = "https://api.anthropic.com/v1/messages";

// ── Styles ──────────────────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --ink: #0a0a0f;
      --deep: #0f0f1a;
      --panel: #13131f;
      --card: #1a1a2e;
      --border: rgba(196,160,78,0.18);
      --gold: #c4a04e;
      --gold-light: #e8c97a;
      --gold-dim: rgba(196,160,78,0.35);
      --text: #e8e4da;
      --muted: #8a8577;
      --white: #f5f2ec;
      --accent: #c4a04e;
    }

    html { scroll-behavior: smooth; }

    body {
      font-family: 'Montserrat', sans-serif;
      background: var(--ink);
      color: var(--text);
      overflow-x: hidden;
    }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--deep); }
    ::-webkit-scrollbar-thumb { background: var(--gold-dim); border-radius: 2px; }

    .serif { font-family: 'Cormorant Garamond', Georgia, serif; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes pulse-ring {
      0%   { transform: scale(1);   opacity: 0.6; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
    @keyframes slideIn {
      from { opacity:0; transform:translateX(-12px); }
      to   { opacity:1; transform:translateX(0); }
    }

    .fade-up { animation: fadeUp 0.7s ease forwards; }
    .fade-up-1 { animation: fadeUp 0.7s 0.1s ease both; }
    .fade-up-2 { animation: fadeUp 0.7s 0.25s ease both; }
    .fade-up-3 { animation: fadeUp 0.7s 0.4s ease both; }
    .fade-up-4 { animation: fadeUp 0.7s 0.55s ease both; }

    .gold-text {
      background: linear-gradient(120deg, var(--gold) 0%, var(--gold-light) 50%, var(--gold) 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 4s linear infinite;
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 32px;
      background: linear-gradient(135deg, var(--gold) 0%, #a8872e 100%);
      color: var(--ink);
      font-family: 'Montserrat', sans-serif;
      font-weight: 600;
      font-size: 13px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    .btn-primary::before {
      content:'';
      position:absolute;
      inset:0;
      background: linear-gradient(135deg, var(--gold-light), var(--gold));
      opacity:0;
      transition: opacity 0.3s;
    }
    .btn-primary:hover::before { opacity:1; }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(196,160,78,0.4); }

    .btn-ghost {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 13px 32px;
      background: transparent;
      color: var(--gold);
      font-family: 'Montserrat', sans-serif;
      font-weight: 500;
      font-size: 13px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      border: 1px solid var(--gold-dim);
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .btn-ghost:hover {
      background: var(--gold-dim);
      border-color: var(--gold);
      transform: translateY(-2px);
    }

    input, textarea, select {
      font-family: 'Montserrat', sans-serif;
      font-size: 14px;
    }
    textarea { resize: none; }

    .divider {
      width: 60px;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--gold), transparent);
    }
    .divider-full {
      width: 100%;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--border), transparent);
    }
  `}</style>
);

// ── Navigation ───────────────────────────────────────────────────────────────
const Nav = ({ activeSection, setPage }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      padding: "20px 60px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: scrolled ? "rgba(10,10,15,0.96)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? "1px solid var(--border)" : "none",
      transition: "all 0.4s ease",
    }}>
      <div className="serif" style={{ fontSize: 22, letterSpacing: 2, color: "var(--white)" }}>
        RC<span style={{ color: "var(--gold)", margin: "0 4px" }}>·</span>Advisory
      </div>
      <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
        {["Home", "Services", "AI Advisor"].map(l => (
          <a key={l} href={l === "Home" ? "#hero" : l === "Services" ? "#services" : "#ai"}
            style={{
              color: "var(--muted)", fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase",
              textDecoration: "none", transition: "color 0.2s",
              fontWeight: 500,
            }}
            onMouseEnter={e => e.target.style.color = "var(--gold)"}
            onMouseLeave={e => e.target.style.color = "var(--muted)"}
          >{l}</a>
        ))}
        <button className="btn-primary" style={{ padding: "10px 24px", fontSize: 11 }}
          onClick={() => setPage("book")}>
          Book a Call
        </button>
      </div>
    </nav>
  );
};

// ── Hero Section ─────────────────────────────────────────────────────────────
const Hero = ({ setPage }) => (
  <section id="hero" style={{
    minHeight: "100vh",
    display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
    padding: "120px 60px 80px",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
  }}>
    {/* Background grid */}
    <div style={{
      position: "absolute", inset: 0, zIndex: 0,
      backgroundImage: `
        linear-gradient(rgba(196,160,78,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(196,160,78,0.03) 1px, transparent 1px)
      `,
      backgroundSize: "80px 80px",
    }} />
    {/* Glow */}
    <div style={{
      position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
      width: 600, height: 600,
      background: "radial-gradient(ellipse, rgba(196,160,78,0.06) 0%, transparent 70%)",
      zIndex: 0,
    }} />

    <div style={{ position: "relative", zIndex: 1, maxWidth: 860 }}>
      <div className="fade-up-1" style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        padding: "8px 20px", border: "1px solid var(--border)",
        marginBottom: 36, fontSize: 11, letterSpacing: 2, color: "var(--gold)",
        textTransform: "uppercase",
        background: "rgba(196,160,78,0.04)",
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "var(--gold)", display: "inline-block",
          boxShadow: "0 0 8px var(--gold)",
          animation: "pulse-ring 1.5s infinite ease-out",
        }} />
        Available for New Engagements
      </div>

      <h1 className="serif fade-up-2" style={{
        fontSize: "clamp(44px, 7vw, 88px)",
        fontWeight: 300,
        lineHeight: 1.08,
        letterSpacing: "-0.5px",
        marginBottom: 28,
        color: "var(--white)",
      }}>
        Transform Your Business<br />
        <em className="gold-text" style={{ fontStyle: "italic", fontWeight: 300 }}>With Strategic Clarity</em>
      </h1>

      <p className="fade-up-3" style={{
        fontSize: 16, lineHeight: 1.8, color: "var(--muted)",
        maxWidth: 560, margin: "0 auto 48px",
        fontWeight: 300,
      }}>
        Senior-level consulting across operations, revenue growth, and market positioning.
        Start with an AI-powered analysis — then speak directly with Ryan.
      </p>

      <div className="fade-up-4" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
        <button className="btn-primary" onClick={() => {
          document.getElementById("ai")?.scrollIntoView({ behavior: "smooth" });
        }}>
          Diagnose My Business →
        </button>
        <button className="btn-ghost" onClick={() => setPage("book")}>
          Schedule a Call
        </button>
      </div>

      {/* Stats */}
      <div style={{
        display: "flex", gap: 60, justifyContent: "center", marginTop: 80,
        flexWrap: "wrap",
      }} className="fade-up-4">
        {[["15+", "Years Experience"], ["$2.4B+", "Client Revenue Unlocked"], ["200+", "Engagements Closed"]].map(([n, l]) => (
          <div key={l} style={{ textAlign: "center" }}>
            <div className="serif" style={{ fontSize: 36, color: "var(--gold)", fontWeight: 300 }}>{n}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ── Services ──────────────────────────────────────────────────────────────────
const Services = () => {
  const items = [
    { icon: "◈", title: "Revenue Architecture", desc: "Diagnose broken funnels, restructure pricing, and unlock growth channels you didn't know existed." },
    { icon: "◇", title: "Operational Excellence", desc: "Eliminate costly inefficiencies, streamline workflows, and build systems that scale without you." },
    { icon: "△", title: "Market Positioning", desc: "Define your competitive moat, refine your messaging, and command premium pricing in any market." },
    { icon: "○", title: "Leadership & Culture", desc: "Align your executive team, reduce churn, and build an organization that attracts top talent." },
    { icon: "▽", title: "Fundraising & Capital", desc: "Prepare investor-ready materials, model projections, and navigate term sheets with confidence." },
    { icon: "□", title: "Exit Strategy", desc: "Maximize enterprise value, identify acquirers, and structure deals that protect your legacy." },
  ];
  return (
    <section id="services" style={{ padding: "120px 60px", background: "var(--deep)", position: "relative" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <p style={{ fontSize: 11, letterSpacing: 3, color: "var(--gold)", textTransform: "uppercase", marginBottom: 20 }}>Areas of Expertise</p>
          <h2 className="serif" style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 300, color: "var(--white)" }}>
            Precision Consulting<br /><em style={{ fontStyle: "italic" }}>Across Every Vertical</em>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 1 }}>
          {items.map(({ icon, title, desc }) => (
            <div key={title} style={{
              padding: "48px 40px",
              background: "var(--panel)",
              border: "1px solid var(--border)",
              transition: "all 0.3s ease",
              cursor: "default",
            }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "var(--card)";
                e.currentTarget.style.borderColor = "var(--gold-dim)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "var(--panel)";
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              <div style={{ fontSize: 24, color: "var(--gold)", marginBottom: 20, opacity: 0.7 }}>{icon}</div>
              <h3 className="serif" style={{ fontSize: 22, fontWeight: 400, color: "var(--white)", marginBottom: 14 }}>{title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--muted)", fontWeight: 300 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── AI Advisor ────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Ryan C.'s AI business advisor — an elite, no-nonsense consultant with 15+ years across technology, retail, finance, healthcare, and professional services.

Your role is to:
1. Ask sharp, incisive questions to understand the user's business problem
2. Provide a high-level but genuinely valuable strategic analysis (2-4 paragraphs)
3. Identify 2-3 specific, actionable recommendations
4. After giving real value, naturally transition to capturing their contact info for a follow-up call with Ryan

IMPORTANT: After your first substantive response, ask for their name and the best way to reach them (phone + email) so Ryan can follow up personally. Frame it as: "To give you Ryan's direct strategic recommendations, I'll need a few details to have him reach out."

Keep responses focused, authoritative, and specific. Never be generic. Sound like you've solved this exact problem before. Keep responses under 200 words unless the problem genuinely requires more depth.`;

const AIAdvisor = ({ onLeadCaptured }) => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "I'm Ryan's AI strategy advisor. Tell me what's holding your business back right now — revenue plateau, operational chaos, fundraising, competitive pressure — and I'll give you a frank assessment and initial direction.\n\nWhat's the most pressing problem on your plate?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [leadForm, setLeadForm] = useState({ show: false, name: "", phone: "", email: "", problem: "" });
  const [leadSaved, setLeadSaved] = useState(false);
  const bottomRef = useRef(null);
  const msgCount = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    msgCount.current += 1;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: next.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "I'm having a moment — please try again.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);

      // Show lead form after 2 AI responses
      if (msgCount.current >= 2 && !leadSaved) {
        setLeadForm(f => ({ ...f, show: true, problem: next[1]?.content || "" }));
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection issue — please try again in a moment." }]);
    }
    setLoading(false);
  };

  const submitLead = async () => {
    if (!leadForm.email && !leadForm.phone) return;
    const lead = {
      name: leadForm.name,
      email: leadForm.email,
      phone: leadForm.phone,
      problem: leadForm.problem,
      timestamp: new Date().toISOString(),
      source: "AI Advisor",
    };
    try {
      await window.storage.set(`lead:${Date.now()}`, JSON.stringify(lead));
    } catch {}
    onLeadCaptured(lead);
    setLeadSaved(true);
    setLeadForm(f => ({ ...f, show: false }));
    setMessages(prev => [...prev, {
      role: "assistant",
      content: `Perfect, ${leadForm.name || "thanks"}. Ryan will be in touch at ${leadForm.email || leadForm.phone} within 24 hours to discuss this personally. In the meantime — what other questions can I help you think through?`,
    }]);
  };

  return (
    <section id="ai" style={{ padding: "120px 60px", background: "var(--ink)", position: "relative" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: 11, letterSpacing: 3, color: "var(--gold)", textTransform: "uppercase", marginBottom: 20 }}>Instant Strategic Intelligence</p>
          <h2 className="serif" style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 300, color: "var(--white)" }}>
            Describe Your Problem.<br /><em style={{ fontStyle: "italic" }}>Get Answers Now.</em>
          </h2>
          <p style={{ color: "var(--muted)", marginTop: 16, fontSize: 14, fontWeight: 300 }}>
            Powered by Ryan's methodology. Real analysis, no fluff.
          </p>
        </div>

        {/* Chat Window */}
        <div style={{
          background: "var(--panel)",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding: "20px 28px",
            borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 14,
            background: "var(--deep)",
          }}>
            <div style={{ position: "relative" }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--gold), #a8872e)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, color: "var(--ink)", fontWeight: 700,
                fontFamily: "'Cormorant Garamond', serif",
              }}>RC</div>
              <div style={{
                position: "absolute", bottom: 1, right: 1,
                width: 10, height: 10, borderRadius: "50%",
                background: "#3ddc84", border: "2px solid var(--deep)",
              }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--white)" }}>Ryan's AI Advisor</div>
              <div style={{ fontSize: 11, color: "var(--gold)", letterSpacing: 1 }}>● Live · Responds Instantly</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ height: 420, overflowY: "auto", padding: "28px", display: "flex", flexDirection: "column", gap: 20 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                animation: "slideIn 0.3s ease",
              }}>
                <div style={{
                  maxWidth: "80%",
                  padding: "14px 18px",
                  background: m.role === "user"
                    ? "linear-gradient(135deg, var(--gold), #a8872e)"
                    : "var(--card)",
                  color: m.role === "user" ? "var(--ink)" : "var(--text)",
                  fontSize: 14,
                  lineHeight: 1.7,
                  fontWeight: m.role === "user" ? 500 : 300,
                  border: m.role === "user" ? "none" : "1px solid var(--border)",
                  whiteSpace: "pre-wrap",
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: 6, padding: "14px 18px", width: "fit-content", background: "var(--card)", border: "1px solid var(--border)" }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: "50%", background: "var(--gold)",
                    animation: `blink 1.2s ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Lead Capture Form (appears inline) */}
          {leadForm.show && !leadSaved && (
            <div style={{
              margin: "0 28px 20px",
              padding: "24px",
              background: "var(--deep)",
              border: "1px solid var(--gold-dim)",
              animation: "fadeUp 0.4s ease",
            }}>
              <p style={{ fontSize: 13, color: "var(--gold)", marginBottom: 16, letterSpacing: 0.5 }}>
                Have Ryan reach out personally — leave your details:
              </p>
              <div style={{ display: "grid", gap: 12 }}>
                {[
                  { key: "name", placeholder: "Your name", type: "text" },
                  { key: "email", placeholder: "Email address *", type: "email" },
                  { key: "phone", placeholder: "Phone number *", type: "tel" },
                ].map(({ key, placeholder, type }) => (
                  <input key={key} type={type} placeholder={placeholder}
                    value={leadForm[key]}
                    onChange={e => setLeadForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{
                      background: "var(--panel)", border: "1px solid var(--border)",
                      padding: "12px 16px", color: "var(--text)", fontSize: 14,
                      outline: "none", width: "100%",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={e => e.target.style.borderColor = "var(--gold)"}
                    onBlur={e => e.target.style.borderColor = "var(--border)"}
                  />
                ))}
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={submitLead}>
                    Send to Ryan →
                  </button>
                  <button onClick={() => setLeadForm(f => ({ ...f, show: false }))}
                    style={{
                      padding: "12px 20px", background: "transparent",
                      border: "1px solid var(--border)", color: "var(--muted)",
                      cursor: "pointer", fontSize: 12, letterSpacing: 1,
                    }}>
                    Skip
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: "16px 20px",
            borderTop: "1px solid var(--border)",
            display: "flex", gap: 12, alignItems: "flex-end",
            background: "var(--deep)",
          }}>
            <textarea
              rows={2}
              placeholder="Describe your business challenge..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              style={{
                flex: 1, background: "var(--panel)", border: "1px solid var(--border)",
                padding: "12px 16px", color: "var(--text)", fontSize: 14,
                outline: "none", lineHeight: 1.6,
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "var(--gold)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
            <button className="btn-primary"
              onClick={send}
              style={{ padding: "14px 24px", whiteSpace: "nowrap" }}
              disabled={loading || !input.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// ── Booking Page ──────────────────────────────────────────────────────────────
const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "2:00 PM", "2:30 PM", "3:00 PM",
  "3:30 PM", "4:00 PM", "4:30 PM",
];

const BookingPage = ({ onBook, onBack }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", concern: "" });
  const [submitted, setSubmitted] = useState(false);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dayNames = ["Su","Mo","Tu","We","Th","Fr","Sa"];

  const isDisabled = (day) => {
    const d = new Date(currentYear, currentMonth, day);
    return d < new Date(today.setHours(0,0,0,0)) || d.getDay() === 0 || d.getDay() === 6;
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !form.name || !form.email) return;
    const booking = {
      ...form,
      date: `${monthNames[currentMonth]} ${selectedDate}, ${currentYear}`,
      time: selectedTime,
      timestamp: new Date().toISOString(),
    };
    try {
      await window.storage.set(`booking:${Date.now()}`, JSON.stringify(booking));
    } catch {}
    onBook(booking);
    setSubmitted(true);
  };

  if (submitted) return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--ink)", padding: 40, textAlign: "center",
    }}>
      <div style={{ maxWidth: 500 }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "linear-gradient(135deg, var(--gold), #a8872e)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, margin: "0 auto 32px",
        }}>✓</div>
        <h2 className="serif" style={{ fontSize: 44, fontWeight: 300, color: "var(--white)", marginBottom: 16 }}>
          You're <em style={{ fontStyle: "italic" }}>Confirmed</em>
        </h2>
        <p style={{ color: "var(--muted)", lineHeight: 1.8, marginBottom: 8 }}>
          Your consultation with Ryan C. is scheduled for:
        </p>
        <p style={{ color: "var(--gold)", fontWeight: 600, fontSize: 18, marginBottom: 32 }}>
          {monthNames[currentMonth]} {selectedDate} at {selectedTime}
        </p>
        <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 40 }}>
          A confirmation has been noted. Ryan will reach out to {form.email} to confirm the call details.
        </p>
        <button className="btn-ghost" onClick={onBack}>← Return to Site</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--ink)", padding: "100px 40px 60px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <button onClick={onBack} style={{
          background: "none", border: "none", color: "var(--muted)",
          cursor: "pointer", fontSize: 13, letterSpacing: 1, marginBottom: 48,
          display: "flex", alignItems: "center", gap: 8,
        }}>← Back</button>

        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h2 className="serif" style={{ fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 300, color: "var(--white)" }}>
            Schedule Your<br /><em className="gold-text" style={{ fontStyle: "italic" }}>Strategy Call</em>
          </h2>
          <p style={{ color: "var(--muted)", marginTop: 16, fontSize: 14 }}>
            30-minute consultation · No charge · Ryan attends personally
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>
          {/* Calendar */}
          <div>
            <div style={{ background: "var(--panel)", border: "1px solid var(--border)", padding: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <button onClick={() => {
                  if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
                  else setCurrentMonth(m => m - 1);
                }} style={{ background: "none", border: "none", color: "var(--gold)", cursor: "pointer", fontSize: 20 }}>‹</button>
                <span className="serif" style={{ fontSize: 20, color: "var(--white)", fontWeight: 400 }}>
                  {monthNames[currentMonth]} {currentYear}
                </span>
                <button onClick={() => {
                  if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
                  else setCurrentMonth(m => m + 1);
                }} style={{ background: "none", border: "none", color: "var(--gold)", cursor: "pointer", fontSize: 20 }}>›</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
                {dayNames.map(d => (
                  <div key={d} style={{ textAlign: "center", fontSize: 11, color: "var(--muted)", letterSpacing: 1, padding: "6px 0" }}>{d}</div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
                {Array(daysInMonth).fill(null).map((_, i) => {
                  const day = i + 1;
                  const disabled = isDisabled(day);
                  const selected = selectedDate === day;
                  return (
                    <button key={day} onClick={() => !disabled && setSelectedDate(day)}
                      style={{
                        padding: "10px 4px",
                        background: selected ? "linear-gradient(135deg, var(--gold), #a8872e)" : "transparent",
                        border: selected ? "none" : "1px solid transparent",
                        color: disabled ? "#333" : selected ? "var(--ink)" : "var(--text)",
                        fontSize: 13,
                        cursor: disabled ? "not-allowed" : "pointer",
                        transition: "all 0.2s",
                        fontWeight: selected ? 600 : 400,
                      }}
                      onMouseEnter={e => { if (!disabled && !selected) { e.target.style.borderColor = "var(--gold-dim)"; e.target.style.color = "var(--gold)"; } }}
                      onMouseLeave={e => { if (!disabled && !selected) { e.target.style.borderColor = "transparent"; e.target.style.color = "var(--text)"; } }}
                    >{day}</button>
                  );
                })}
              </div>
            </div>

            {selectedDate && (
              <div style={{ marginTop: 20, background: "var(--panel)", border: "1px solid var(--border)", padding: 24 }}>
                <p style={{ fontSize: 12, color: "var(--gold)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16 }}>
                  Available Times — {monthNames[currentMonth]} {selectedDate}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {timeSlots.map(t => (
                    <button key={t} onClick={() => setSelectedTime(t)} style={{
                      padding: "10px 6px",
                      background: selectedTime === t ? "linear-gradient(135deg, var(--gold), #a8872e)" : "var(--deep)",
                      border: "1px solid",
                      borderColor: selectedTime === t ? "transparent" : "var(--border)",
                      color: selectedTime === t ? "var(--ink)" : "var(--text)",
                      fontSize: 12, cursor: "pointer", fontWeight: selectedTime === t ? 600 : 400,
                      transition: "all 0.2s",
                      letterSpacing: 0.5,
                    }}>{t}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact Form */}
          <div style={{ background: "var(--panel)", border: "1px solid var(--border)", padding: 32 }}>
            <p style={{ fontSize: 12, color: "var(--gold)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 24 }}>Your Details</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { key: "name", placeholder: "Full name *", type: "text" },
                { key: "email", placeholder: "Email address *", type: "email" },
                { key: "phone", placeholder: "Phone number *", type: "tel" },
              ].map(({ key, placeholder, type }) => (
                <input key={key} type={type} placeholder={placeholder}
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{
                    background: "var(--deep)", border: "1px solid var(--border)",
                    padding: "14px 16px", color: "var(--text)", fontSize: 14,
                    outline: "none", width: "100%", transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = "var(--gold)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"}
                />
              ))}
              <textarea rows={5} placeholder="Briefly describe your main challenge or goal..."
                value={form.concern}
                onChange={e => setForm(f => ({ ...f, concern: e.target.value }))}
                style={{
                  background: "var(--deep)", border: "1px solid var(--border)",
                  padding: "14px 16px", color: "var(--text)", fontSize: 14,
                  outline: "none", width: "100%", lineHeight: 1.7, transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = "var(--gold)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />

              {selectedDate && selectedTime && (
                <div style={{ padding: "14px 16px", background: "rgba(196,160,78,0.06)", border: "1px solid var(--gold-dim)" }}>
                  <p style={{ fontSize: 12, color: "var(--gold)", letterSpacing: 0.5 }}>
                    📅 {monthNames[currentMonth]} {selectedDate}, {currentYear} at {selectedTime}
                  </p>
                </div>
              )}

              <button className="btn-primary"
                style={{ width: "100%", justifyContent: "center", padding: "16px" }}
                onClick={handleSubmit}
                disabled={!selectedDate || !selectedTime || !form.name || !form.email || !form.phone}
              >
                Confirm Consultation →
              </button>
              <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", letterSpacing: 0.5 }}>
                No spam, ever. Your details go directly to Ryan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Lead Dashboard ────────────────────────────────────────────────────────────
const LeadDashboard = ({ leads, bookings, onClose }) => {
  const [tab, setTab] = useState("leads");
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}>
      <div style={{ background: "var(--panel)", border: "1px solid var(--border)", width: "100%", maxWidth: 780, maxHeight: "85vh", overflow: "auto" }}>
        <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="serif" style={{ fontSize: 26, color: "var(--white)" }}>Lead Dashboard</div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {["leads", "bookings"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: "8px 20px", fontSize: 12, letterSpacing: 1, textTransform: "uppercase",
                background: tab === t ? "var(--gold)" : "transparent",
                color: tab === t ? "var(--ink)" : "var(--muted)",
                border: "1px solid", borderColor: tab === t ? "var(--gold)" : "var(--border)",
                cursor: "pointer", fontWeight: tab === t ? 600 : 400,
              }}>{t} ({t === "leads" ? leads.length : bookings.length})</button>
            ))}
            <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 22 }}>×</button>
          </div>
        </div>
        <div style={{ padding: 32 }}>
          {tab === "leads" ? (
            leads.length === 0 ? (
              <p style={{ color: "var(--muted)", textAlign: "center", padding: 40 }}>No leads yet. Leads captured via AI Advisor appear here.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {leads.map((l, i) => (
                  <div key={i} style={{ padding: "20px 24px", background: "var(--deep)", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ color: "var(--white)", fontWeight: 600 }}>{l.name || "Unknown"}</span>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>{new Date(l.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--gold)", marginBottom: 4 }}>{l.email} · {l.phone}</div>
                    <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{l.problem?.slice(0, 120)}{l.problem?.length > 120 ? "…" : ""}</div>
                  </div>
                ))}
              </div>
            )
          ) : (
            bookings.length === 0 ? (
              <p style={{ color: "var(--muted)", textAlign: "center", padding: 40 }}>No bookings yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {bookings.map((b, i) => (
                  <div key={i} style={{ padding: "20px 24px", background: "var(--deep)", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ color: "var(--white)", fontWeight: 600 }}>{b.name}</span>
                      <span style={{ color: "var(--gold)", fontWeight: 500 }}>{b.date} · {b.time}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--gold)", marginBottom: 4 }}>{b.email} · {b.phone}</div>
                    {b.concern && <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{b.concern}</div>}
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

// ── Testimonial ───────────────────────────────────────────────────────────────
const SocialProof = ({ setPage }) => {
  const quotes = [
    { text: "Ryan identified a $400K revenue leak in our pricing model within the first session. The ROI on his fees is not even a conversation.", name: "David M.", title: "CEO, SaaS Platform" },
    { text: "We were burning cash on the wrong channels. Three weeks after our engagement, we'd restructured completely and hit our first profitable month in 18 months.", name: "Sarah K.", title: "Founder, eCommerce Brand" },
    { text: "His ability to see across industries and bring analogous solutions is unlike any consultant I've worked with in 20 years.", name: "Marcus T.", title: "Managing Director, PE Fund" },
  ];
  return (
    <section style={{ padding: "120px 60px", background: "var(--deep)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <p style={{ fontSize: 11, letterSpacing: 3, color: "var(--gold)", textTransform: "uppercase", marginBottom: 20 }}>Client Results</p>
          <h2 className="serif" style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 300, color: "var(--white)" }}>
            The Work <em style={{ fontStyle: "italic" }}>Speaks</em>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 72 }}>
          {quotes.map(({ text, name, title }) => (
            <div key={name} style={{ padding: "40px 36px", background: "var(--panel)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 40, color: "var(--gold)", fontFamily: "serif", lineHeight: 1, marginBottom: 20, opacity: 0.4 }}>"</div>
              <p style={{ fontSize: 14, lineHeight: 1.9, color: "var(--text)", fontWeight: 300, marginBottom: 28, fontStyle: "italic" }}>{text}</p>
              <div className="divider" style={{ marginBottom: 20 }} />
              <div style={{ fontSize: 14, color: "var(--white)", fontWeight: 600 }}>{name}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{title}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center" }}>
          <button className="btn-primary" onClick={() => setPage("book")}>Start Your Engagement →</button>
        </div>
      </div>
    </section>
  );
};

// ── Footer ────────────────────────────────────────────────────────────────────
const Footer = ({ setPage }) => (
  <footer style={{ background: "var(--ink)", borderTop: "1px solid var(--border)", padding: "60px 60px 40px" }}>
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 40, marginBottom: 48 }}>
        <div>
          <div className="serif" style={{ fontSize: 24, letterSpacing: 2, color: "var(--white)", marginBottom: 12 }}>
            RC<span style={{ color: "var(--gold)" }}>·</span>Advisory
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 280, lineHeight: 1.7, fontWeight: 300 }}>
            Strategic consulting for leaders who refuse to accept "good enough."
          </p>
        </div>
        <div style={{ display: "flex", gap: 60, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: 2, color: "var(--gold)", textTransform: "uppercase", marginBottom: 16 }}>Navigate</p>
            {["Services", "AI Advisor", "Book a Call"].map(l => (
              <div key={l} style={{ marginBottom: 10 }}>
                <button onClick={() => l === "Book a Call" ? setPage("book") : document.getElementById(l === "Services" ? "services" : "ai")?.scrollIntoView({ behavior: "smooth" })}
                  style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 13, padding: 0, letterSpacing: 0.3 }}
                  onMouseEnter={e => e.target.style.color = "var(--gold)"}
                  onMouseLeave={e => e.target.style.color = "var(--muted)"}
                >{l}</button>
              </div>
            ))}
          </div>
          <div>
            <p style={{ fontSize: 11, letterSpacing: 2, color: "var(--gold)", textTransform: "uppercase", marginBottom: 16 }}>Contact</p>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 2 }}>
              Direct inquiries via<br />the booking system<br />or AI Advisor above.
            </p>
          </div>
        </div>
      </div>
      <div className="divider-full" style={{ marginBottom: 28 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <p style={{ fontSize: 12, color: "var(--muted)" }}>© {new Date().getFullYear()} RC Advisory · Ryan C. · All Rights Reserved</p>
        <p style={{ fontSize: 12, color: "var(--muted)", opacity: 0.5 }}>Confidential · By appointment only</p>
      </div>
    </div>
  </footer>
);

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [leads, setLeads] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showDash, setShowDash] = useState(false);
  const [dashClickCount, setDashClickCount] = useState(0);

  // Load persisted data
  useEffect(() => {
    (async () => {
      try {
        const keys = await window.storage.list();
        if (!keys?.keys) return;
        const ls = [], bs = [];
        for (const k of keys.keys) {
          const r = await window.storage.get(k);
          if (!r?.value) continue;
          const v = JSON.parse(r.value);
          if (k.startsWith("lead:")) ls.push(v);
          if (k.startsWith("booking:")) bs.push(v);
        }
        setLeads(ls.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        setBookings(bs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      } catch {}
    })();
  }, []);

  const handleLeadCaptured = (lead) => {
    setLeads(prev => [lead, ...prev]);
  };
  const handleBooking = (booking) => {
    setBookings(prev => [booking, ...prev]);
  };

  // Secret dashboard access: click logo 5 times
  const handleLogoClick = () => {
    const n = dashClickCount + 1;
    setDashClickCount(n);
    if (n >= 5) { setShowDash(true); setDashClickCount(0); }
  };

  if (page === "book") return (
    <>
      <GlobalStyle />
      <BookingPage onBook={handleBooking} onBack={() => setPage("home")} />
    </>
  );

  return (
    <>
      <GlobalStyle />
      <Nav activeSection="hero" setPage={setPage} />

      {/* Secret logo click area */}
      <div onClick={handleLogoClick} style={{ position: "fixed", top: 16, left: 60, width: 120, height: 44, zIndex: 200, cursor: "default" }} />

      <Hero setPage={setPage} />
      <Services />
      <AIAdvisor onLeadCaptured={handleLeadCaptured} />
      <SocialProof setPage={setPage} />
      <Footer setPage={setPage} />

      {/* Lead Dashboard (secret access) */}
      {showDash && (
        <LeadDashboard leads={leads} bookings={bookings} onClose={() => setShowDash(false)} />
      )}
    </>
  );
}
