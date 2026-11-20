import React, { useState, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";
import {
  Search,
  Volume2,
  Languages,
  Landmark,
  HeartPulse,
  WalletCards,
  Wheat,
  GraduationCap,
  BriefcaseBusiness,
  Home,
  Users,
  FileText,
  ChevronRight,
  CheckCircle2,
  X,
  Menu,
  ShieldCheck,
  ArrowRight,
  BookOpen,
  AlertCircle,
  User,
  LogIn,
  LogOut,
  Plus,
  Trash2,
  ExternalLink,
  ShieldAlert,
  CheckSquare,
  Square,
  Lock,
  RefreshCw
} from "lucide-react";
import "./styles.css";
import {
  translations,
  schemesData,
  investData,
  lessonsData,
  questionnaire,
  recommendationMap
} from "./translations.js";
import {
  api,
  getStoredToken,
  getStoredUser,
  setStoredAuth,
  clearStoredAuth
} from "./services/api.js";

// Tone Mapping for category cards
const categoryToneMap = {
  Farmer: "green",
  Agriculture: "green",
  Housing: "orange",
  Health: "red",
  Pension: "purple",
  Education: "blue",
  Employment: "teal",
  "Social Welfare": "purple"
};

// Icon Mapping
const iconMap = {
  kisan: Wheat,
  pmay: Home,
  ayushman: HeartPulse,
  pension: Users,
  education: GraduationCap,
  employment: BriefcaseBusiness,
  Farmer: Wheat,
  Agriculture: Wheat,
  Housing: Home,
  Health: HeartPulse,
  Pension: Users,
  Education: GraduationCap,
  Employment: BriefcaseBusiness
};

function App() {
  const [lang, setLang] = useState(() => localStorage.getItem("InvestMate_lang") || "en");
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [selected, setSelected] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [completedDocs, setCompletedDocs] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [menu, setMenu] = useState(false);
  const [screen, setScreen] = useState("home");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [toast, setToast] = useState("");

  // Backend Schemes State
  const [dbSchemes, setDbSchemes] = useState([]);
  const [loadingSchemes, setLoadingSchemes] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState("login"); // 'login' | 'register'
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authFullName, setAuthFullName] = useState("");
  const [authRole, setAuthRole] = useState("user");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Admin Dashboard State
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminStats, setAdminStats] = useState(null);
  const [isSubmittingScheme, setIsSubmittingScheme] = useState(false);
  const [newScheme, setNewScheme] = useState({
    name: "",
    categoryName: "Farmer",
    shortDescription: "",
    detailedExplanation: "",
    benefits: "",
    officialPortalUrl: "https://"
  });

  const t = translations[lang] || translations.en;
  const currentSchemes = schemesData[lang] || schemesData.en;
  const currentInvest = investData[lang] || investData.en;
  const currentLessons = lessonsData[lang] || lessonsData.en;
  const currentQs = questionnaire[lang] || questionnaire.en;

  // Sync html lang attribute
  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem("InvestMate_lang", lang);
  }, [lang]);

  // Load and refresh schemes from MongoDB backend
  const fetchBackendSchemes = useCallback(async () => {
    setLoadingSchemes(true);
    try {
      const res = await api.schemes.getAll({
        category: cat !== "All" ? cat : undefined,
        search: query.trim() || undefined,
        limit: 50
      });
      if (res && res.success && Array.isArray(res.data)) {
        setDbSchemes(res.data);
      }
    } catch {
      // Backend gracefully falls back to local curated data if unavailable
    } finally {
      setLoadingSchemes(false);
    }
  }, [cat, query]);

  useEffect(() => {
    fetchBackendSchemes();
  }, [fetchBackendSchemes]);

  // Load user profile on startup if token exists
  useEffect(() => {
    if (getStoredToken()) {
      api.auth
        .getProfile()
        .then((res) => {
          if (res?.success && res.data) {
            setCurrentUser(res.data);
            setStoredAuth(res.data, getStoredToken());
          }
        })
        .catch(() => {
          clearStoredAuth();
          setCurrentUser(null);
        });
    }
  }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  }

  function toggleLang() {
    const nextLang = lang === "en" ? "hi" : "en";
    setLang(nextLang);
    showToast(nextLang === "hi" ? "भाषा बदलकर हिन्दी कर दी गई है" : "Language switched to English");
  }

  function speak(x) {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(x);
      u.lang = lang === "hi" ? "hi-IN" : "en-IN";
      speechSynthesis.speak(u);
    } else {
      showToast(t.nav.voiceUnavailable);
    }
  }

  const categoryKeys = ["All", "Farmer", "Health", "Housing", "Pension", "Education", "Employment"];

  // Merge backend MongoDB schemes with the original curated frontend schemes
  const displaySchemes = React.useMemo(() => {
    if (dbSchemes.length > 0) {
      return dbSchemes.map((s) => ({
        _id: s._id,
        id: s.slug || s._id,
        t: s.name,
        c: s.categoryName || "General",
        cLabel: s.categoryName,
        d: s.shortDescription,
        tone: categoryToneMap[s.categoryName] || "green",
        info: s.benefits && s.benefits.length > 0 ? s.benefits : (s.eligibilityCriteria?.rules || []),
        finePrint: s.finePrint || {},
        requiredDocuments: s.requiredDocuments || [],
        officialPortalUrl: s.officialPortalUrl,
        isVerified: s.isVerified !== false,
        raw: s
      }));
    }

    // Curated local fallback
    return currentSchemes.filter((s) => {
      const matchCat = cat === "All" || s.c === cat;
      const searchTerms = `${s.t} ${s.c} ${s.cLabel || ""} ${s.d}`.toLowerCase();
      const matchQuery = searchTerms.includes(query.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [dbSchemes, currentSchemes, cat, query]);

  // Select a scheme and load Fine-Print + Document Checklist from backend
  async function handleSelectScheme(scheme) {
    setSelected(scheme);
    setSelectedDetails(null);
    setChecklist([]);
    setLoadingDetails(true);

    const schemeId = scheme._id || scheme.id;

    // Load locally saved checkbox completions for this scheme
    const saved = localStorage.getItem(`investmate_checklist_${schemeId}`);
    if (saved) {
      try {
        setCompletedDocs(JSON.parse(saved));
      } catch {
        setCompletedDocs({});
      }
    } else {
      setCompletedDocs({});
    }

    try {
      if (scheme._id) {
        // Fetch detailed verified scheme record
        const res = await api.schemes.getById(scheme._id);
        if (res?.success && res.data) {
          setSelectedDetails(res.data);
        }

        // Fetch document checklist
        const docRes = await api.documents.getChecklist(scheme._id);
        if (docRes?.success && docRes.data?.documents) {
          setChecklist(docRes.data.documents);
        }
      }
    } catch {
      // Keep selected state with initial scheme values
    } finally {
      setLoadingDetails(false);
    }
  }

  // Toggle document checklist completion (saved client-side in localStorage)
  function toggleDocumentCheck(docId) {
    if (!selected) return;
    const schemeId = selected._id || selected.id;
    const updated = {
      ...completedDocs,
      [docId]: !completedDocs[docId]
    };
    setCompletedDocs(updated);
    localStorage.setItem(`investmate_checklist_${schemeId}`, JSON.stringify(updated));
  }

  // Handle User Login
  async function handleLogin(e) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await api.auth.login(authEmail, authPassword);
      if (res?.success && res.data?.user) {
        setStoredAuth(res.data.user, res.data.token);
        setCurrentUser(res.data.user);
        setAuthModalOpen(false);
        showToast(`${t.auth.loginSuccess} (${res.data.user.fullName})`);
        setAuthEmail("");
        setAuthPassword("");
      }
    } catch (err) {
      setAuthError(err.message || "Login failed. Please check credentials.");
    } finally {
      setAuthLoading(false);
    }
  }

  // Handle User Registration
  async function handleRegister(e) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      const payload = {
        fullName: authFullName,
        email: authEmail,
        password: authPassword,
        preferredLanguage: lang,
        role: authRole
      };
      const res = await api.auth.register(payload);
      if (res?.success && res.data?.user) {
        setStoredAuth(res.data.user, res.data.token);
        setCurrentUser(res.data.user);
        setAuthModalOpen(false);
        showToast(`${t.auth.registerSuccess} (${res.data.user.fullName})`);
        setAuthEmail("");
        setAuthPassword("");
        setAuthFullName("");
      }
    } catch (err) {
      setAuthError(err.message || "Registration failed. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  }

  // Handle Sign Out
  function handleLogout() {
    api.auth.logout();
    setCurrentUser(null);
    clearStoredAuth();
    setAdminModalOpen(false);
    showToast(t.auth.logoutSuccess);
  }

  // Fill Demo Credentials for Quick Testing
  function fillDemoCitizen() {
    setAuthEmail("citizen@investmate.gov.in");
    setAuthPassword("Citizen@Secure123");
    setAuthError("");
  }

  function fillDemoAdmin() {
    setAuthEmail("admin@investmate.gov.in");
    setAuthPassword("Admin@Secure123");
    setAuthError("");
  }

  // Open Admin Dashboard & Fetch Stats
  async function handleOpenAdmin() {
    setAdminModalOpen(true);
    try {
      const statsRes = await api.admin.getStats();
      if (statsRes?.success) {
        setAdminStats(statsRes.data);
      }
    } catch (err) {
      console.error("Admin stats error:", err);
    }
  }

  // Admin: Create Scheme
  async function handleCreateScheme(e) {
    e.preventDefault();
    setIsSubmittingScheme(true);
    try {
      const benefitsArr = newScheme.benefits
        .split("\n")
        .map((b) => b.trim())
        .filter(Boolean);

      const payload = {
        name: newScheme.name,
        categoryName: newScheme.categoryName,
        shortDescription: newScheme.shortDescription,
        detailedExplanation: newScheme.detailedExplanation || newScheme.shortDescription,
        benefits: benefitsArr.length > 0 ? benefitsArr : ["Financial assistance under official guidelines"],
        requiredDocuments: ["Aadhaar Card", "Bank Passbook"],
        officialPortalUrl: newScheme.officialPortalUrl || "https://india.gov.in",
        eligibilityCriteria: {
          rules: ["Resident Indian citizen meeting scheme criteria"]
        },
        applicationProcedure: {
          mode: "Both",
          steps: ["Visit official portal or CSC", "Submit required documents"]
        },
        finePrint: {
          lockInPeriod: "No lock-in period",
          exitPenalties: "No exit penalties",
          hiddenCharges: "₹0 hidden charges - Free government welfare scheme",
          withdrawalConditions: "Direct Benefit Transfer (DBT) directly into bank account",
          expectedReturns: "Welfare grant / Subsidy",
          importantWarnings: [
            "Never pay money to unauthorized agents or middlemen. Application is free at official CSCs."
          ]
        }
      };

      const res = await api.schemes.create(payload);
      if (res?.success) {
        showToast(t.admin.addSuccess);
        setNewScheme({
          name: "",
          categoryName: "Farmer",
          shortDescription: "",
          detailedExplanation: "",
          benefits: "",
          officialPortalUrl: "https://"
        });
        fetchBackendSchemes();
        const updatedStats = await api.admin.getStats();
        if (updatedStats?.success) setAdminStats(updatedStats.data);
      }
    } catch (err) {
      showToast(err.message || "Failed to create scheme");
    } finally {
      setIsSubmittingScheme(false);
    }
  }

  // Admin: Delete Scheme
  async function handleDeleteScheme(schemeId, e) {
    if (e) e.stopPropagation();
    if (!window.confirm(t.admin.confirmDelete)) return;
    try {
      await api.schemes.delete(schemeId);
      showToast(t.admin.deleteSuccess);
      if (selected && selected._id === schemeId) {
        setSelected(null);
      }
      fetchBackendSchemes();
      const updatedStats = await api.admin.getStats();
      if (updatedStats?.success) setAdminStats(updatedStats.data);
    } catch (err) {
      showToast(err.message || "Failed to delete scheme");
    }
  }

  function startFinder() {
    setScreen("finder");
    setStep(0);
    setAnswers({});
    window.scrollTo(0, 0);
  }

  function handleAnswer(val) {
    const nextAnswers = { ...answers, [currentQs[step].id]: val };
    setAnswers(nextAnswers);
    if (step < currentQs.length - 1) {
      setStep(step + 1);
    } else {
      setScreen("result");
    }
  }

  function getRecommendations() {
    const a = answers;
    const rMap = recommendationMap[lang];
    if (a.need === "health") {
      return [rMap.ayushman, rMap.health_insurance, rMap.emergency_fund];
    }
    if (a.need === "scheme" && a.profile === "farmer") {
      return [rMap.pm_kisan, rMap.farmer_schemes, rMap.savings_account];
    }
    if (a.need === "edu_emp") {
      return [rMap.education_support, rMap.employment_support, rMap.savings_account];
    }
    if (a.money === "invest_long") {
      return [rMap.ppf, rMap.index_funds, rMap.sip];
    }
    return [rMap.emergency_fund, rMap.fd, rMap.govt_schemes];
  }

  // Determine Fine-Print disclosures for the active scheme
  const finePrint = selectedDetails?.finePrint || selected?.finePrint || {};
  const lockIn = finePrint.lockInPeriod || "No lock-in period";
  const exitPenalties = finePrint.exitPenalties || "No exit penalties";
  const hiddenCharges = finePrint.hiddenCharges || "₹0 hidden charges - 100% free government welfare scheme";
  const withdrawal = finePrint.withdrawalConditions || "Direct Benefit Transfer (DBT) directly into bank account";
  const expectedReturns = finePrint.expectedReturns || "Information not verified";
  const warnings =
    finePrint.importantWarnings && finePrint.importantWarnings.length > 0
      ? finePrint.importantWarnings[0]
      : "Never pay money to unauthorized agents or middlemen. Application is free at official CSCs / government portals.";

  // Combine checklist documents
  const activeChecklistDocs =
    checklist.length > 0
      ? checklist
      : (selected?.requiredDocuments || [
          "Aadhaar Card",
          "Bank Passbook (Aadhaar linked)",
          "Passport Size Photograph",
          "Income / Eligibility Certificate"
        ]).map((name, i) => ({
          docId: `doc_${i}`,
          name,
          purpose: "Identity and direct benefit transfer verification",
          preparationInstructions: "Carry original and 2 self-attested photocopies",
          isMandatory: true,
          whereToObtain: "Nearest Panchayat / Tehsil / Bank / CSC Seva Kendra"
        }));

  return (
    <div>
      {/* Navigation Bar */}
      <header className="nav">
        <a className="brand" href="#home" onClick={() => setScreen("home")}>
          <span className="mark">IM</span>
          <b>
            {t.nav.brand}
            <small>{t.nav.tagline}</small>
          </b>
        </a>

        <nav className={menu ? "links open" : "links"}>
          {[
            ["home", t.nav.home],
            ["schemes", t.nav.schemes],
            ["health", t.nav.health],
            ["invest", t.nav.invest],
            ["learn", t.nav.learn]
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={() => setMenu(false)}>
              {label}
            </a>
          ))}
        </nav>

        <div className="actions">
          {/* Text to Speech Button */}
          <button
            onClick={() => speak(t.nav.speechWelcome)}
            title={lang === "hi" ? "बोलकर सुनें" : "Listen to introduction"}
            aria-label="Listen"
          >
            <Volume2 size={17} />
          </button>

          {/* Bilingual English / Hindi Toggle */}
          <button
            className="lang-toggle"
            onClick={toggleLang}
            title={lang === "en" ? "हिन्दी में बदलें (Switch to Hindi)" : "Switch to English"}
          >
            <Languages size={17} />
            <span>{t.nav.langSwitchLabel}</span>
            <span className="lang-badge">{t.nav.currentLangTag}</span>
          </button>

          {/* User Account / Auth Button */}
          {currentUser ? (
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              {currentUser.role === "admin" && (
                <button
                  className="lang-toggle"
                  style={{ background: "#eee7f7", color: "#735496", borderColor: "#cfbfe6" }}
                  onClick={handleOpenAdmin}
                  title="Open Admin Dashboard"
                >
                  <Lock size={15} />
                  <span>Admin</span>
                </button>
              )}
              <button
                onClick={() => setAuthModalOpen(true)}
                title={`${t.auth.signedInAs} ${currentUser.fullName}`}
                style={{ fontWeight: 600 }}
              >
                <User size={16} />
                <span style={{ maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {currentUser.fullName.split(" ")[0]}
                </span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthTab("login");
                setAuthModalOpen(true);
              }}
              title={t.auth.signIn}
            >
              <LogIn size={16} />
              <span>{t.auth.signIn}</span>
            </button>
          )}

          {/* Mobile Menu Hamburger */}
          <button className="mobile" onClick={() => setMenu(!menu)} aria-label="Toggle Menu">
            <Menu />
          </button>
        </div>
      </header>

      {/* Main Home Screen */}
      {screen === "home" && (
        <>
          {/* Hero Section */}
          <section className="hero" id="home">
            <div>
              <span className="eyebrow">
                <ShieldCheck /> {t.hero.eyebrow}
              </span>
              <h1>
                {t.hero.title}
                <em>{t.hero.titleHighlight}</em>
              </h1>
              <p>{t.hero.desc}</p>
              <div className="buttons">
                <button className="primary" onClick={startFinder}>
                  {t.hero.btnFind} <ArrowRight />
                </button>
                <a className="secondary" href="#schemes">
                  {t.hero.btnSchemes}
                </a>
              </div>
              <div className="trust">
                {t.hero.trust.map((item, i) => (
                  <span key={i}>✓ {item}</span>
                ))}
              </div>
            </div>

            <div className="visual">
              <div className="circle"></div>
              <div className="guide">
                <small>{t.hero.guideReady}</small>
                <h3>{t.hero.guidePrompt}</h3>
                {[
                  [Landmark, t.hero.guideGovt, "schemes"],
                  [HeartPulse, t.hero.guideHealth, "health"],
                  [WalletCards, t.hero.guideSaving, "invest"]
                ].map(([Icon, title, targetId]) => (
                  <button
                    key={targetId}
                    onClick={() =>
                      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    <Icon />
                    {title}
                    <ChevronRight />
                  </button>
                ))}
                <button onClick={startFinder}>
                  <Search />
                  {t.hero.guideHelp}
                  <ChevronRight />
                </button>
              </div>
            </div>
          </section>

          {/* Quick Info Bar */}
          <section className="quick">
            {t.quick.map((item, idx) => {
              const icons = [Landmark, HeartPulse, WalletCards];
              const Icon = icons[idx];
              return (
                <div key={idx}>
                  <Icon />
                  <b>{item.title}</b>
                  <span>{item.desc}</span>
                </div>
              );
            })}
          </section>

          {/* Schemes Section */}
          <section className="section" id="schemes">
            <div className="head">
              <div>
                <span className="eyebrow-text">{t.schemesSection.eyebrow}</span>
                <h2>{t.schemesSection.title}</h2>
              </div>
              <p>{t.schemesSection.desc}</p>
            </div>

            <div className="toolbar">
              <div className="search">
                <Search />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.schemesSection.searchPlaceholder}
                />
              </div>
              <div className="chips">
                {categoryKeys.map((k) => (
                  <button
                    className={cat === k ? "active" : ""}
                    onClick={() => setCat(k)}
                    key={k}
                  >
                    {t.schemesSection.categories[k] || k}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid">
              {displaySchemes.map((s) => {
                const IconComponent = iconMap[s.id] || iconMap[s.c] || Wheat;
                return (
                  <article className="card" key={s._id || s.id}>
                    <div className={"scheme " + s.tone}>
                      <IconComponent />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="tag">{s.cLabel || s.c}</span>
                      {s.isVerified && (
                        <span style={{ fontSize: "10px", color: "var(--green)", fontWeight: 700 }}>
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <h3>{s.t}</h3>
                    <p>{s.d}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                      <button onClick={() => handleSelectScheme(s)}>
                        {t.schemesSection.btnUnderstand} <ArrowRight />
                      </button>
                      {currentUser?.role === "admin" && s._id && (
                        <button
                          className="danger-btn"
                          onClick={(e) => handleDeleteScheme(s._id, e)}
                          title="Delete Scheme (Admin)"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Banner */}
          <section className="banner">
            <div>
              <span className="eyebrow-text">{t.banner.eyebrow}</span>
              <h2>{t.banner.title}</h2>
              <p>{t.banner.desc}</p>
            </div>
            <button className="primary light" onClick={startFinder}>
              {t.banner.btn} <ArrowRight />
            </button>
          </section>

          {/* Health Section */}
          <section className="section" id="health">
            <div className="head">
              <div>
                <span className="eyebrow-text">{t.healthSection.eyebrow}</span>
                <h2>{t.healthSection.title}</h2>
              </div>
              <p>{t.healthSection.desc}</p>
            </div>

            <div className="health">
              <div>
                <HeartPulse className="healthicon" />
                <h3>{t.healthSection.cardTitle}</h3>
                <p>{t.healthSection.cardDesc}</p>
                <div className="checks">
                  {t.healthSection.checks.map((chk, i) => (
                    <span key={i}>✓ {chk}</span>
                  ))}
                </div>
              </div>

              <div className="health-side">
                <div>
                  <b>{t.healthSection.govtTitle}</b>
                  <p>{t.healthSection.govtDesc}</p>
                  <button onClick={() => handleSelectScheme(currentSchemes[2])}>
                    {t.healthSection.govtBtn}
                  </button>
                </div>

                <div>
                  <b>{t.healthSection.pvtTitle}</b>
                  <p>{t.healthSection.pvtDesc}</p>
                  <button onClick={() => speak(t.healthSection.pvtSpeech)}>
                    {t.healthSection.pvtBtn}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Investment Section */}
          <section className="section cream" id="invest">
            <div className="head">
              <div>
                <span className="eyebrow-text">{t.investSection.eyebrow}</span>
                <h2>{t.investSection.title}</h2>
              </div>
              <p>{t.investSection.desc}</p>
            </div>

            <div className="grid">
              {currentInvest.map(([name, risk, sym, desc]) => (
                <article className="card invest" key={name}>
                  <div className="symbol">{sym}</div>
                  <span className="tag">
                    {t.investSection.riskPrefix}
                    {risk}
                  </span>
                  <h3>{name}</h3>
                  <p>{desc}</p>
                  <button onClick={() => speak(`${name}. ${desc}`)}>
                    {t.investSection.btnExplain}
                  </button>
                </article>
              ))}
            </div>
          </section>

          {/* Learn Section */}
          <section className="section" id="learn">
            <div className="center">
              <span className="eyebrow-text">{t.learnSection.eyebrow}</span>
              <h2>{t.learnSection.title}</h2>
              <p>{t.learnSection.desc}</p>
            </div>

            <div className="grid">
              {currentLessons.map(([question, answer]) => (
                <article className="card lesson" key={question}>
                  <BookOpen />
                  <h3>{question}</h3>
                  <p>{answer}</p>
                  <button onClick={() => speak(`${question}. ${answer}`)}>
                    {t.learnSection.btnListen}
                  </button>
                </article>
              ))}
            </div>
          </section>

          {/* Documents Section */}
          <section className="docs">
            <div>
              <FileText />
              <span className="eyebrow-text">{t.docsSection.eyebrow}</span>
              <h2>{t.docsSection.title}</h2>
              <p>{t.docsSection.desc}</p>
            </div>
            <div>
              {t.docsSection.items.map((doc, i) => (
                <span key={i}>✓ {doc}</span>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Interactive Questionnaire Screen */}
      {screen === "finder" && (
        <main className="finder">
          <button className="back" onClick={() => setScreen("home")}>
            {t.finder.back}
          </button>
          <div className="finderbox">
            <div className="progress">
              {currentQs.map((_, i) => (
                <i className={i <= step ? "done" : ""} key={i} />
              ))}
            </div>
            <span className="eyebrow-text">
              {t.finder.questionNum} {step + 1} {t.finder.of} {currentQs.length}
            </span>
            <h1>{currentQs[step].q}</h1>
            <p>{t.finder.hint}</p>
            <div className="answers">
              {currentQs[step].options.map((opt) => (
                <button onClick={() => handleAnswer(opt.value)} key={opt.value}>
                  {opt.label}
                  <ArrowRight />
                </button>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* Questionnaire Results Screen */}
      {screen === "result" && (
        <main className="finder">
          <div className="result">
            <div className="resultmark">✓</div>
            <span className="eyebrow-text">{t.finder.resultEyebrow}</span>
            <h1>{t.finder.resultTitle}</h1>
            <p>{t.finder.resultDesc}</p>
            <div className="resultgrid">
              {getRecommendations().map((recItem, idx) => (
                <div key={idx}>
                  <CheckCircle2 />
                  {recItem}
                </div>
              ))}
            </div>
            <button className="primary" onClick={() => setScreen("home")}>
              {t.finder.exploreBtn} <ArrowRight />
            </button>
            <button className="outline" onClick={startFinder}>
              {t.finder.answerAgain}
            </button>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer>
        <div className="brand">
          <span className="mark">IM</span>
          <b>
            {t.nav.brand}
            <small>{t.nav.tagline}</small>
          </b>
        </div>
        <p>{t.footer.tagline}</p>
        <span>
          <AlertCircle /> {t.footer.disclaimer}
        </span>
      </footer>

      {/* ========================================================================= */}
      {/* Scheme Detail Modal (Fine-Print Transparency & Document Checklist) */}
      {/* ========================================================================= */}
      {selected && (
        <div className="modalback" onClick={() => setSelected(null)}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setSelected(null)} aria-label="Close">
              <X />
            </button>

            <div className={"scheme " + selected.tone}>
              {(() => {
                const IconComponent = iconMap[selected.id] || iconMap[selected.c] || Wheat;
                return <IconComponent />;
              })()}
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
              <span className="tag">{selected.cLabel || selected.c}</span>
              {selected.isVerified && (
                <span className="user-badge" style={{ background: "#e5f1e4", color: "var(--green)" }}>
                  ✓ Official Government Scheme
                </span>
              )}
            </div>

            <h2>{selected.t}</h2>
            <p>{selected.d}</p>

            {/* Core Benefits */}
            <h4 style={{ marginTop: "20px", marginBottom: "10px" }}>{t.modal.whatToUnderstand}</h4>
            <ul>
              {selected.info.map((infoPoint, idx) => (
                <li key={idx}>
                  <CheckCircle2 />
                  {infoPoint}
                </li>
              ))}
            </ul>

            {/* Fine-Print Transparency Module */}
            <div className="fineprint-box">
              <div className="fineprint-title">
                <ShieldCheck size={16} />
                <span>{t.modal.finePrintTitle}</span>
              </div>

              <div className="fineprint-grid">
                <div className="fineprint-item">
                  <div className="fineprint-label">{t.modal.lockIn}</div>
                  <div className="fineprint-val">{lockIn}</div>
                </div>

                <div className="fineprint-item">
                  <div className="fineprint-label">{t.modal.exitPenalties}</div>
                  <div className="fineprint-val">{exitPenalties}</div>
                </div>

                <div className="fineprint-item">
                  <div className="fineprint-label">{t.modal.hiddenCharges}</div>
                  <div className="fineprint-val">{hiddenCharges}</div>
                </div>

                <div className="fineprint-item">
                  <div className="fineprint-label">{t.modal.withdrawal}</div>
                  <div className="fineprint-val">{withdrawal}</div>
                </div>

                <div className="fineprint-item" style={{ gridColumn: "span 2" }}>
                  <div className="fineprint-label">{t.modal.expectedReturns}</div>
                  <div className="fineprint-val">{expectedReturns}</div>
                </div>
              </div>

              {/* Anti-Middleman Warning */}
              <div className="warning-banner">
                <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <b>{t.modal.warnings}:</b> {warnings}
                </div>
              </div>
            </div>

            {/* Document Checklist Module */}
            <div className="checklist-section">
              <h4 style={{ margin: "16px 0 6px 0" }}>{t.modal.docsTitle}</h4>
              <p style={{ fontSize: "12px", color: "var(--muted)", margin: "0 0 12px 0" }}>
                {t.modal.docsHint}
              </p>

              <div>
                {activeChecklistDocs.map((doc, idx) => {
                  const docKey = doc.docId || `doc_${idx}`;
                  const isDone = !!completedDocs[docKey];
                  return (
                    <div
                      key={docKey}
                      className={`checklist-item ${isDone ? "done" : ""}`}
                      onClick={() => toggleDocumentCheck(docKey)}
                      role="checkbox"
                      aria-checked={isDone}
                    >
                      {isDone ? (
                        <CheckSquare size={18} style={{ color: "var(--green)", flexShrink: 0, marginTop: "2px" }} />
                      ) : (
                        <Square size={18} style={{ color: "var(--muted)", flexShrink: 0, marginTop: "2px" }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <div className="doc-name">{doc.name}</div>
                        {doc.preparationInstructions && (
                          <div className="doc-desc">
                            <b>{t.modal.docInstructions}:</b> {doc.preparationInstructions}
                          </div>
                        )}
                        {doc.whereToObtain && (
                          <div className="doc-desc" style={{ marginTop: "2px" }}>
                            <b>{t.modal.docWhere}:</b> {doc.whereToObtain}
                          </div>
                        )}
                      </div>
                      <span className={`doc-badge ${doc.isMandatory !== false ? "badge-mandatory" : "badge-optional"}`}>
                        {doc.isMandatory !== false ? "Mandatory" : "Optional"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Official Portal Link */}
            {selected.officialPortalUrl && (
              <a
                href={selected.officialPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="portal-btn"
              >
                <ExternalLink size={16} />
                <span>{t.modal.officialPortal}</span>
              </a>
            )}

            {/* Voice Narration Button */}
            <button
              className="primary"
              style={{ width: "100%", marginTop: "12px" }}
              onClick={() =>
                speak(`${selected.t}. ${selected.d}. ${lockIn}. ${hiddenCharges}. ${warnings}`)
              }
            >
              <Volume2 /> {t.modal.listenBtn}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* User Authentication & Profile Modal */}
      {/* ========================================================================= */}
      {authModalOpen && (
        <div className="modalback" onClick={() => setAuthModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setAuthModalOpen(false)} aria-label="Close">
              <X />
            </button>

            {currentUser ? (
              // Logged-in Profile View
              <div>
                <span className="eyebrow-text">INVESTMATE ACCOUNT</span>
                <h2 style={{ margin: "10px 0" }}>{currentUser.fullName}</h2>
                <p style={{ margin: "0 0 16px 0" }}>{currentUser.email}</p>

                <div style={{ background: "var(--cream)", border: "1px solid var(--line)", borderRadius: "8px", padding: "14px", marginBottom: "18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", color: "var(--muted)" }}>{t.auth.role}:</span>
                    <span className="user-badge" style={{ background: currentUser.role === "admin" ? "#eee7f7" : "#e5f1e4", color: currentUser.role === "admin" ? "#735496" : "var(--green)" }}>
                      {currentUser.role === "admin" ? t.auth.adminBadge : t.auth.userBadge}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", color: "var(--muted)" }}>{t.auth.preferredLang}:</span>
                    <span style={{ fontSize: "12px", fontWeight: 600 }}>{lang === "hi" ? "हिन्दी (Hindi)" : "English"}</span>
                  </div>
                </div>

                {currentUser.role === "admin" && (
                  <button
                    className="secondary"
                    style={{ width: "100%", marginBottom: "10px" }}
                    onClick={() => {
                      setAuthModalOpen(false);
                      handleOpenAdmin();
                    }}
                  >
                    <Lock size={15} /> {t.admin.dashboard}
                  </button>
                )}

                <button
                  className="primary"
                  style={{ width: "100%", background: "#a74b45" }}
                  onClick={handleLogout}
                >
                  <LogOut size={16} /> {t.auth.logout}
                </button>
              </div>
            ) : (
              // Sign In / Register Forms
              <div>
                <div className="auth-tabs">
                  <button
                    className={`auth-tab ${authTab === "login" ? "active" : ""}`}
                    onClick={() => {
                      setAuthTab("login");
                      setAuthError("");
                    }}
                  >
                    {t.auth.signIn}
                  </button>
                  <button
                    className={`auth-tab ${authTab === "register" ? "active" : ""}`}
                    onClick={() => {
                      setAuthTab("register");
                      setAuthError("");
                    }}
                  >
                    {t.auth.register}
                  </button>
                </div>

                <h3 style={{ margin: "0 0 6px 0", font: "500 24px Fraunces, serif" }}>
                  {authTab === "login" ? t.auth.loginTitle : t.auth.registerTitle}
                </h3>
                <p style={{ margin: "0 0 16px 0", fontSize: "12px", color: "var(--muted)" }}>
                  {t.auth.loginSubtitle}
                </p>

                {/* Quick Demo Credentials */}
                {authTab === "login" && (
                  <div className="demo-row">
                    <button type="button" className="demo-chip" onClick={fillDemoCitizen}>
                      👤 {t.auth.demoCitizen}
                    </button>
                    <button type="button" className="demo-chip" onClick={fillDemoAdmin}>
                      🛡️ {t.auth.demoAdmin}
                    </button>
                  </div>
                )}

                {authError && (
                  <div style={{ background: "#fae7e4", color: "#a74b45", padding: "10px", borderRadius: "6px", fontSize: "12px", marginBottom: "14px" }}>
                    {authError}
                  </div>
                )}

                <form onSubmit={authTab === "login" ? handleLogin : handleRegister}>
                  {authTab === "register" && (
                    <div className="form-group">
                      <label className="form-label">{t.auth.fullName}</label>
                      <input
                        className="form-input"
                        type="text"
                        required
                        value={authFullName}
                        onChange={(e) => setAuthFullName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar"
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">{t.auth.email}</label>
                    <input
                      className="form-input"
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="citizen@investmate.gov.in"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t.auth.password}</label>
                    <input
                      className="form-input"
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>

                  {authTab === "register" && (
                    <div className="form-group">
                      <label className="form-label">{t.auth.role}</label>
                      <select
                        className="form-input"
                        value={authRole}
                        onChange={(e) => setAuthRole(e.target.value)}
                      >
                        <option value="user">Citizen / Frontline Worker</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="primary"
                    style={{ width: "100%", marginTop: "10px" }}
                    disabled={authLoading}
                  >
                    {authLoading ? (
                      <RefreshCw size={16} className="spin" />
                    ) : authTab === "login" ? (
                      t.auth.signIn
                    ) : (
                      t.auth.register
                    )}
                  </button>
                </form>

                <div style={{ marginTop: "16px", textAlign: "center" }}>
                  <button
                    type="button"
                    style={{ background: "none", border: 0, color: "var(--muted)", fontSize: "12px", cursor: "pointer", textDecoration: "underline" }}
                    onClick={() => setAuthModalOpen(false)}
                  >
                    {t.auth.guest}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Admin Dashboard Modal (Protected for role === 'admin') */}
      {/* ========================================================================= */}
      {adminModalOpen && currentUser?.role === "admin" && (
        <div className="modalback" onClick={() => setAdminModalOpen(false)}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setAdminModalOpen(false)} aria-label="Close">
              <X />
            </button>

            <span className="eyebrow-text">ADMINISTRATOR CONTROL PANEL</span>
            <h2 style={{ margin: "8px 0 16px 0" }}>{t.admin.dashboard}</h2>

            {/* Platform Overview Stats */}
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-num">{adminStats?.totalSchemes ?? displaySchemes.length}</div>
                <div className="admin-stat-label">{t.admin.totalSchemes}</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-num">{adminStats?.totalCategories ?? 6}</div>
                <div className="admin-stat-label">{t.admin.totalCategories}</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-num">{adminStats?.verifiedSchemes ?? displaySchemes.length}</div>
                <div className="admin-stat-label">{t.admin.verifiedSchemes}</div>
              </div>
            </div>

            {/* Add New Government Scheme Form */}
            <div style={{ background: "var(--cream)", border: "1px solid var(--line)", borderRadius: "10px", padding: "18px" }}>
              <div className="fineprint-title">
                <Plus size={16} />
                <span>{t.admin.addScheme}</span>
              </div>

              <form onSubmit={handleCreateScheme}>
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "10px" }}>
                  <div className="form-group">
                    <label className="form-label">{t.admin.schemeName}</label>
                    <input
                      className="form-input"
                      type="text"
                      required
                      value={newScheme.name}
                      onChange={(e) => setNewScheme({ ...newScheme, name: e.target.value })}
                      placeholder="e.g. PM-KISAN"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t.admin.category}</label>
                    <select
                      className="form-input"
                      value={newScheme.categoryName}
                      onChange={(e) => setNewScheme({ ...newScheme, categoryName: e.target.value })}
                    >
                      <option value="Farmer">Farmer</option>
                      <option value="Health">Health</option>
                      <option value="Housing">Housing</option>
                      <option value="Pension">Pension</option>
                      <option value="Education">Education</option>
                      <option value="Employment">Employment</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t.admin.shortDesc}</label>
                  <input
                    className="form-input"
                    type="text"
                    required
                    value={newScheme.shortDescription}
                    onChange={(e) => setNewScheme({ ...newScheme, shortDescription: e.target.value })}
                    placeholder="Short description in simple language..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t.admin.benefits} (1 per line)</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    value={newScheme.benefits}
                    onChange={(e) => setNewScheme({ ...newScheme, benefits: e.target.value })}
                    placeholder="Direct financial grant&#10;Zero fee application"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t.admin.portalUrl}</label>
                  <input
                    className="form-input"
                    type="url"
                    value={newScheme.officialPortalUrl}
                    onChange={(e) => setNewScheme({ ...newScheme, officialPortalUrl: e.target.value })}
                    placeholder="https://pmkisan.gov.in"
                  />
                </div>

                <button
                  type="submit"
                  className="primary"
                  style={{ width: "100%", marginTop: "8px" }}
                  disabled={isSubmittingScheme}
                >
                  {isSubmittingScheme ? <RefreshCw size={15} /> : <Plus size={15} />}
                  <span>{t.admin.save}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
