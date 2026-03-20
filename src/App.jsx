import { useEffect, useMemo, useState } from "react";
import "./App.css";
import logoImage from "./assets/logo.png";
import { PrivacyPolicyPage } from "./PrivacyPolicyPage.jsx";
import { getDailyData } from "./gameData/dailyContent.js";
import { makeTranslator } from "./i18n/deepMerge.js";
import { getMergedMessages } from "./i18n/messages/index.js";
import { useI18n } from "./i18n/useI18n.js";
import { DATE_LOCALE_BY_UI } from "./i18n/languageOptions.jsx";
import { LanguageSelect } from "./i18n/LanguageSelect.jsx";

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

function shuffle(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function randomizeWordMatchQuestions(questions) {
  return questions.map((q) => {
    const withMeta = q.options.map((option, idx) => ({
      option,
      isAnswer: idx === q.answer,
    }));
    const shuffled = shuffle(withMeta);
    return {
      ...q,
      options: shuffled.map((item) => item.option),
      answer: shuffled.findIndex((item) => item.isAnswer),
    };
  });
}

const GAME_POINTS = { 0: 5, 1: 10, 2: 15 };
const PERFECT_DAY_BONUS_POINTS = 10;

const INITIAL_PROGRESS = { completed: [false, false, false], scores: [0, 0, 0], reviewDetails: { 0: [], 1: [], 2: [] } };
const ARCHIVE_KEY = "wordplay-game-archive";
const SCHOOL_INTEREST_KEY = "wordplay-school-interest-leads";
const ACTIVE_SESSION_KEY_PREFIX = "wordplay-active-session-";
const LEGACY_ACCOUNT_KEY = "wordplay-account";
const ACCOUNTS_KEY = "wordplay-accounts";
const SESSION_KEY = "wordplay-current-user";
/** Keep signed-in session in localStorage for this long (refreshes on each visit while logged in). */
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const COOKIE_CONSENT_KEY = "wordplay-cookie-consent";
const COOKIE_CONSENT_VERSION = 1;

function parseCookieConsent() {
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (o?.v !== COOKIE_CONSENT_VERSION) return null;
    return {
      necessary: true,
      analytics: Boolean(o.analytics),
      marketing: Boolean(o.marketing),
      at: typeof o.at === "string" ? o.at : "",
    };
  } catch {
    return null;
  }
}

function persistUserSession(email) {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email, expiresAt }));
}

function readStoredSessionEmail() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return "";
    try {
      const o = JSON.parse(raw);
      if (o && typeof o.email === "string" && typeof o.expiresAt === "number") {
        if (Date.now() > o.expiresAt) {
          localStorage.removeItem(SESSION_KEY);
          return "";
        }
        return o.email;
      }
    } catch {
      // Legacy: plain email string only
      const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.trim());
      if (emailIsValid) {
        persistUserSession(raw.trim().toLowerCase());
        return raw.trim().toLowerCase();
      }
      localStorage.removeItem(SESSION_KEY);
      return "";
    }
    localStorage.removeItem(SESSION_KEY);
    return "";
  } catch {
    return "";
  }
}

function saveCookieConsent(analytics, marketing) {
  const payload = {
    v: COOKIE_CONSENT_VERSION,
    necessary: true,
    analytics,
    marketing,
    at: new Date().toISOString(),
  };
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(payload));
  return {
    necessary: true,
    analytics,
    marketing,
    at: payload.at,
  };
}

function formatArchiveDate(key, locale = "en-GB") {
  if (!/^\d{8}$/.test(key)) return key;
  const year = key.slice(0, 4);
  const month = key.slice(4, 6);
  const day = key.slice(6, 8);
  const dt = new Date(`${year}-${month}-${day}T12:00:00`);
  return dt.toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function getResultSummary(score, total, t) {
  const pct = total === 0 ? 0 : score / total;
  return {
    stars: pct === 1 ? "🌟" : pct >= 0.7 ? "🎉" : "💪",
    title: pct === 1 ? t("resultSummary.perfectTitle") : pct >= 0.7 ? t("resultSummary.wellTitle") : t("resultSummary.keepTitle"),
    msg:
      pct === 1
        ? t("resultSummary.perfectMsg")
        : pct >= 0.7
          ? t("resultSummary.wellMsg")
          : t("resultSummary.keepMsg"),
  };
}

function getPasswordValidation(password) {
  return {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

function isStrongPassword(password) {
  const checks = getPasswordValidation(password);
  return Object.values(checks).every(Boolean);
}

const MIN_LEADERBOARD_USERS = 20;

const DEMO_PROFILES = [
  { first: "Alex", last: "Kim" },
  { first: "Jordan", last: "Patel" },
  { first: "Sam", last: "Rivera" },
  { first: "Riley", last: "Chen" },
  { first: "Casey", last: "Nguyen" },
  { first: "Morgan", last: "Okonkwo" },
  { first: "Jamie", last: "Silva" },
  { first: "Taylor", last: "Bakshi" },
  { first: "Quinn", last: "Hassan" },
  { first: "Avery", last: "Lopez" },
  { first: "Skyler", last: "Murphy" },
  { first: "Reese", last: "Singh" },
  { first: "Dakota", last: "Foster" },
  { first: "Rowan", last: "Ali" },
  { first: "Emery", last: "Park" },
  { first: "Finley", last: "Reyes" },
  { first: "Hayden", last: "Khan" },
  { first: "Blake", last: "Okafor" },
  { first: "Charlie", last: "Tan" },
  { first: "Parker", last: "Diaz" },
];

function demoHash32(n) {
  let x = n >>> 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return x >>> 0;
}

function buildDemoLeaderboardEntries(count, seedOffset, studentCodeForClassroom) {
  const entries = [];
  const usedEmails = new Set();
  for (let i = 0; i < count; i += 1) {
    const h = demoHash32(seedOffset + i * 7919 + 31);
    const profile = DEMO_PROFILES[i % DEMO_PROFILES.length];
    const num = 10 + (h % 89);
    let email = `${profile.first.toLowerCase()}.${profile.last.toLowerCase()}${num}@learners.demo`;
    if (usedEmails.has(email)) email = `${profile.first.toLowerCase()}.${profile.last.toLowerCase()}${num}.${i}@learners.demo`;
    usedEmails.add(email);
    const points = 5 + (h % 280);
    entries.push({
      email,
      points,
      studentCode: studentCodeForClassroom || "",
      isDemo: true,
    });
  }
  return entries;
}

function mergeWithDemoLeaderboard(realSorted, seedBase, studentCodeFilter) {
  if (realSorted.length >= MIN_LEADERBOARD_USERS) {
    return realSorted.map((a) => ({ ...a, isDemo: false }));
  }
  const need = MIN_LEADERBOARD_USERS - realSorted.length;
  const codeSalt =
    studentCodeFilter && studentCodeFilter.length > 0
      ? studentCodeFilter.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
      : 0;
  const seedOffset = seedBase + codeSalt * 17;
  const demos = buildDemoLeaderboardEntries(need, seedOffset, studentCodeFilter || "");
  const realEmails = new Set(realSorted.map((a) => a.email));
  const uniqueDemos = demos.filter((d) => !realEmails.has(d.email));
  const merged = [...realSorted.map((a) => ({ ...a, isDemo: false })), ...uniqueDemos];
  merged.sort((a, b) => (b.points || 0) - (a.points || 0));
  return merged;
}

export default function App() {
  const { t, language, setLanguage } = useI18n();
  /** English-only copy for modal bodies; buttons still use `t`. */
  const tEn = useMemo(() => makeTranslator(getMergedMessages("en")), []);
  const todayKey = useMemo(() => getTodayKey(), []);
  const dailySeed = useMemo(() => parseInt(todayKey, 10), [todayKey]);
  const gameData = useMemo(() => getDailyData(dailySeed), [dailySeed]);
  const progressKey = `wordplay-progress-${todayKey}`;
  const activeSessionKey = `${ACTIVE_SESSION_KEY_PREFIX}${todayKey}`;
  const dateLocale = DATE_LOCALE_BY_UI[language] || "en-GB";
  const dateLabel = useMemo(
    () => new Date().toLocaleDateString(dateLocale, { weekday: "long", day: "numeric", month: "long" }),
    [dateLocale],
  );

  /** Card copy stays English; only level tags follow UI language. */
  const gameCards = useMemo(
    () => [
      {
        id: 0,
        level: "beginner",
        tag: t("games.wmTag"),
        title: "🎯 Word Match",
        modalTitle: "🎯 Word Match",
        desc: "See a word and choose the correct definition. Build your vocabulary one word at a time.",
        time: "~2 min",
      },
      {
        id: 1,
        level: "intermediate",
        tag: t("games.sbTag"),
        title: "🧩 Sentence Builder",
        modalTitle: "🧩 Sentence Builder",
        desc: "Arrange scrambled words into correct sentences. Practice grammar and word order.",
        time: "~3 min",
      },
      {
        id: 2,
        level: "advanced",
        tag: t("games.fsTag"),
        title: "📖 Fill the Story",
        modalTitle: "📖 Fill the Story",
        desc: "Complete a short story by choosing the right word for each blank. Test context and nuance.",
        time: "~4 min",
      },
    ],
    [t],
  );

  const [progress, setProgress] = useState(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(progressKey) || "null");
      if (parsed?.completed && parsed?.scores) {
        return {
          ...INITIAL_PROGRESS,
          ...parsed,
          reviewDetails: { ...INITIAL_PROGRESS.reviewDetails, ...(parsed.reviewDetails || {}) },
        };
      }
    } catch {
      return INITIAL_PROGRESS;
    }
    return INITIAL_PROGRESS;
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [currentGame, setCurrentGame] = useState(-1);
  const [resultState, setResultState] = useState(null);

  const [wm, setWm] = useState(null);
  const [sb, setSb] = useState(null);
  const [fs, setFs] = useState(null);
  const [accounts, setAccounts] = useState(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]");
      if (!Array.isArray(parsed)) return [];
      return parsed.map((acct) => ({
        ...acct,
        points: acct.points || 0,
        awardedCompletions: acct.awardedCompletions || [],
        awardedAchievements: acct.awardedAchievements || [],
        studentCode: acct.studentCode || "",
      }));
    } catch {
      return [];
    }
  });
  const [currentUserEmail, setCurrentUserEmail] = useState(() => readStoredSessionEmail());
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signup");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState("");
  const [authStudentCode, setAuthStudentCode] = useState("");
  const [authError, setAuthError] = useState("");
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiveData, setArchiveData] = useState({});
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [cookieConsent, setCookieConsent] = useState(() => parseCookieConsent());
  const [cookiePanelOpen, setCookiePanelOpen] = useState(false);
  const [cookieDetailsOpen, setCookieDetailsOpen] = useState(false);
  const [draftAnalytics, setDraftAnalytics] = useState(false);
  const [draftMarketing, setDraftMarketing] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [privacyPolicyOpen, setPrivacyPolicyOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.location.hash === "#privacy";
  });
  const [statsScope, setStatsScope] = useState("all");
  const [settingsStudentCode, setSettingsStudentCode] = useState("");
  const [schoolLeadEmail, setSchoolLeadEmail] = useState("");
  const [schoolLeadSchool, setSchoolLeadSchool] = useState("");
  const [activeSessions, setActiveSessions] = useState(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(`${ACTIVE_SESSION_KEY_PREFIX}${getTodayKey()}`) || "null");
      if (parsed && typeof parsed === "object") {
        return { 0: parsed[0] || null, 1: parsed[1] || null, 2: parsed[2] || null };
      }
    } catch {
      return { 0: null, 1: null, 2: null };
    }
    return { 0: null, 1: null, 2: null };
  });

  useEffect(() => {
    localStorage.setItem(progressKey, JSON.stringify(progress));
  }, [progress, progressKey]);

  useEffect(() => {
    localStorage.setItem(activeSessionKey, JSON.stringify(activeSessions));
  }, [activeSessions, activeSessionKey]);

  useEffect(() => {
    const existing = JSON.parse(localStorage.getItem(ARCHIVE_KEY) || "{}");
    existing[todayKey] = gameData;
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(existing));
    setArchiveData(existing);
  }, [todayKey, gameData]);

  useEffect(() => {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    if (currentUserEmail) persistUserSession(currentUserEmail);
    else localStorage.removeItem(SESSION_KEY);
  }, [currentUserEmail]);

  useEffect(() => {
    const legacyRaw = localStorage.getItem(LEGACY_ACCOUNT_KEY);
    if (!legacyRaw) return;
    try {
      const legacy = JSON.parse(legacyRaw);
      if (!legacy?.email || !legacy?.password) return;
      setAccounts((prev) => {
        if (prev.some((item) => item.email === legacy.email)) return prev;
        return [...prev, { email: legacy.email, password: legacy.password, points: 0, awardedCompletions: [], awardedAchievements: [], studentCode: "" }];
      });
      if (!currentUserEmail) setCurrentUserEmail(legacy.email);
      localStorage.removeItem(LEGACY_ACCOUNT_KEY);
    } catch {
      localStorage.removeItem(LEGACY_ACCOUNT_KEY);
    }
  }, [currentUserEmail]);

  useEffect(() => {
    const lockScroll = modalOpen || privacyPolicyOpen;
    document.body.style.overflow = lockScroll ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalOpen, privacyPolicyOpen]);

  useEffect(() => {
    const syncPrivacyFromHash = () => {
      setPrivacyPolicyOpen(window.location.hash === "#privacy");
    };
    syncPrivacyFromHash();
    window.addEventListener("hashchange", syncPrivacyFromHash);
    return () => window.removeEventListener("hashchange", syncPrivacyFromHash);
  }, []);

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timer = setTimeout(() => setToastMessage(""), 2600);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    const panelOpen = cookieConsent === null || cookiePanelOpen;
    if (!panelOpen) return;
    if (cookieConsent) {
      setDraftAnalytics(cookieConsent.analytics);
      setDraftMarketing(cookieConsent.marketing);
    } else {
      setDraftAnalytics(false);
      setDraftMarketing(false);
    }
  }, [cookieConsent, cookiePanelOpen]);

  const previousArchiveKeys = Object.keys(archiveData)
    .filter((key) => key !== todayKey)
    .sort((a, b) => b.localeCompare(a));
  const currentUser = accounts.find((acct) => acct.email === currentUserEmail) || null;
  const completedCount = progress.completed.filter(Boolean).length;
  const gameTotals = {
    0: gameData.wordMatch.length,
    1: gameData.sentenceBuilder.length,
    2: gameData.fillStory.blanks.length,
  };

  const openArchive = () => {
    if (!currentUser) {
      setAuthMode(accounts.length > 0 ? "signin" : "signup");
      setAuthOpen(true);
      return;
    }
    if (previousArchiveKeys.length === 0) {
      setToastMessage(t("toasts.noArchive"));
      return;
    }
    setArchiveOpen(true);
  };

  const isMobileDevice = () => {
    if (typeof navigator === "undefined") return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const shareLink = typeof window !== "undefined" ? window.location.href : "https://example.com";
  const inviteMessage = `hey, check out these free english practice games I found! ${shareLink}`;

  const resetAuthForm = () => {
    setAuthEmail("");
    setAuthPassword("");
    setAuthConfirmPassword("");
    setAuthStudentCode("");
    setAuthError("");
  };

  const switchAuthMode = (mode) => {
    setAuthMode(mode);
    setAuthError("");
    setAuthPassword("");
    setAuthConfirmPassword("");
  };

  const closeAuth = () => {
    setAuthOpen(false);
    resetAuthForm();
  };

  const handleSignup = () => {
    const email = authEmail.trim().toLowerCase();
    if (!email || !authPassword || !authConfirmPassword) {
      setAuthError(tEn("errors.fillAll"));
      return;
    }
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailIsValid) {
      setAuthError(tEn("errors.invalidEmail"));
      return;
    }
    if (!isStrongPassword(authPassword)) {
      setAuthError(tEn("errors.weakPassword"));
      return;
    }
    if (authPassword !== authConfirmPassword) {
      setAuthError(tEn("errors.passwordMismatch"));
      return;
    }
    const alreadyExists = accounts.some((acct) => acct.email === email);
    if (alreadyExists) {
      setAuthError(tEn("errors.accountExists"));
      return;
    }
    const normalizedStudentCode = authStudentCode.trim().toUpperCase();
    const nextAccount = {
      email,
      password: authPassword,
      points: 0,
      awardedCompletions: [],
      awardedAchievements: [],
      studentCode: normalizedStudentCode,
    };
    setAccounts((prev) => [...prev, nextAccount]);
    setCurrentUserEmail(email);
    setAuthOpen(false);
    setArchiveOpen(true);
    resetAuthForm();
  };

  const handleSignin = () => {
    const email = authEmail.trim().toLowerCase();
    if (!email || !authPassword) {
      setAuthError(tEn("errors.enterBoth"));
      return;
    }
    if (accounts.length === 0) {
      setAuthError(tEn("errors.noAccount"));
      return;
    }
    const matched = accounts.find((acct) => acct.email === email && acct.password === authPassword);
    if (matched) {
      setCurrentUserEmail(matched.email);
      setAuthOpen(false);
      setArchiveOpen(true);
      resetAuthForm();
      return;
    }
    setAuthError(tEn("errors.invalidCredentials"));
  };

  const passwordChecks = getPasswordValidation(authPassword);

  const handleSignout = () => {
    setArchiveOpen(false);
    setProfileMenuOpen(false);
    setStatsOpen(false);
    setSettingsOpen(false);
    setCurrentUserEmail("");
  };

  const openStats = () => {
    setProfileMenuOpen(false);
    setStatsScope("all");
    setStatsOpen(true);
  };

  const openSettings = () => {
    setProfileMenuOpen(false);
    setSettingsStudentCode(currentUser?.studentCode || "");
    setSettingsOpen(true);
  };

  const saveSettings = () => {
    if (!currentUser) return;
    const normalizedStudentCode = settingsStudentCode.trim().toUpperCase();
    setAccounts((prev) =>
      prev.map((acct) => (acct.email === currentUser.email ? { ...acct, studentCode: normalizedStudentCode } : acct)),
    );
    setToastMessage(normalizedStudentCode ? t("toasts.codeUpdated") : t("toasts.codeCleared"));
    setSettingsOpen(false);
  };

  const handleSchoolLeadSubmit = (e) => {
    e.preventDefault();
    const email = schoolLeadEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setToastMessage(t("schools.invalidEmail"));
      return;
    }
    let list = [];
    try {
      const raw = localStorage.getItem(SCHOOL_INTEREST_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) list = parsed;
      }
    } catch {
      list = [];
    }
    if (list.some((entry) => entry.email === email)) {
      setToastMessage(t("schools.duplicateToast"));
      return;
    }
    list.push({
      email,
      school: schoolLeadSchool.trim(),
      at: new Date().toISOString(),
    });
    try {
      localStorage.setItem(SCHOOL_INTEREST_KEY, JSON.stringify(list));
    } catch {
      setToastMessage(t("schools.saveFailed"));
      return;
    }
    setToastMessage(t("schools.successToast"));
    setSchoolLeadEmail("");
    setSchoolLeadSchool("");
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}&quote=${encodeURIComponent(inviteMessage)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCopyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteMessage);
      setToastMessage(t("toasts.copied"));
    } catch {
      setToastMessage(t("toasts.copyFailed"));
    }
  };

  const handleSendText = () => {
    if (!isMobileDevice()) {
      setToastMessage(t("toasts.textMobileOnly"));
      return;
    }
    window.location.href = `sms:?&body=${encodeURIComponent(inviteMessage)}`;
  };

  const awardPointsForCompletion = (gameId) => {
    if (!currentUser) return;
    const completionKey = `${todayKey}-${gameId}`;
    const alreadyAwarded = (currentUser.awardedCompletions || []).includes(completionKey);
    if (alreadyAwarded) return;

    setAccounts((prev) =>
      prev.map((acct) => {
        if (acct.email !== currentUser.email) return acct;
        const points = (acct.points || 0) + (GAME_POINTS[gameId] || 0);
        return {
          ...acct,
          points,
          awardedCompletions: [...(acct.awardedCompletions || []), completionKey],
        };
      }),
    );
  };

  useEffect(() => {
    if (!currentUser) return;

    const perfectAllThree =
      progress.completed[0] &&
      progress.completed[1] &&
      progress.completed[2] &&
      (progress.scores[0] || 0) === gameTotals[0] &&
      (progress.scores[1] || 0) === gameTotals[1] &&
      (progress.scores[2] || 0) === gameTotals[2];

    if (!perfectAllThree) return;

    const achievementKey = `perfect-all-3-${todayKey}`;
    const alreadyAwarded = (currentUser.awardedAchievements || []).includes(achievementKey);
    if (alreadyAwarded) return;

    setAccounts((prev) =>
      prev.map((acct) => {
        if (acct.email !== currentUser.email) return acct;
        return {
          ...acct,
          points: (acct.points || 0) + PERFECT_DAY_BONUS_POINTS,
          awardedAchievements: [...(acct.awardedAchievements || []), achievementKey],
        };
      }),
    );

    setToastMessage(t("toasts.achievement", { pts: PERFECT_DAY_BONUS_POINTS }));
  }, [currentUser, progress, todayKey, gameTotals, t]);

  const openReview = (gameId) => {
    const total = gameTotals[gameId];
    const score = progress.scores[gameId] || 0;
    const summary = getResultSummary(score, total, tEn);
    const allAnswers = progress.reviewDetails?.[gameId] || [];
    const wrongAnswers = allAnswers.filter((item) => !item.isCorrect);
    setCurrentGame(gameId);
    setResultState({ gameId, score, total, ...summary, isReview: true, wrongAnswers, allAnswers });
    setModalOpen(false);
  };

  const openGame = (id) => {
    if (progress.completed[id]) {
      openReview(id);
      return;
    }
    setCurrentGame(id);
    setModalOpen(true);
    setResultState(null);

    if (id === 0) {
      if (activeSessions[0]) {
        setWm(activeSessions[0]);
      } else {
        const initial = {
          questions: randomizeWordMatchQuestions(gameData.wordMatch),
          current: 0,
          score: 0,
          results: [],
          reviewDetails: [],
          answered: false,
          selected: -1,
        };
        setWm(initial);
        setActiveSessions((prev) => ({ ...prev, 0: initial }));
      }
    } else if (id === 1) {
      if (activeSessions[1]) {
        setSb(activeSessions[1]);
      } else {
        const q = gameData.sentenceBuilder[0];
        const initial = {
          questions: gameData.sentenceBuilder,
          current: 0,
          score: 0,
          results: [],
          built: [],
          bank: shuffle(q.words),
          checked: false,
          feedback: "",
          feedbackKind: "",
          reviewDetails: [],
        };
        setSb(initial);
        setActiveSessions((prev) => ({ ...prev, 1: initial }));
      }
    } else if (id === 2) {
      if (activeSessions[2]) {
        setFs(activeSessions[2]);
      } else {
        const initial = {
          data: gameData.fillStory,
          inputs: gameData.fillStory.blanks.map(() => ""),
          inputStates: gameData.fillStory.blanks.map(() => ""),
          used: [],
          submitted: false,
          feedback: "",
          feedbackKind: "",
          reviewDetails: [],
        };
        setFs(initial);
        setActiveSessions((prev) => ({ ...prev, 2: initial }));
      }
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentGame(-1);
    setResultState(null);
  };

  const backToHomepage = () => {
    setModalOpen(false);
    setCurrentGame(-1);
    setResultState(null);
  };

  const showResult = (gameId, score, total, reviewDetails = []) => {
    const summary = getResultSummary(score, total, tEn);

    setProgress((prev) => {
      const next = {
        completed: [...prev.completed],
        scores: [...prev.scores],
        reviewDetails: { ...(prev.reviewDetails || {}) },
      };
      next.completed[gameId] = true;
      next.scores[gameId] = Math.max(next.scores[gameId] || 0, score);
      next.reviewDetails[gameId] = reviewDetails;
      return next;
    });
    setActiveSessions((prev) => ({ ...prev, [gameId]: null }));
    awardPointsForCompletion(gameId);
    setModalOpen(false);
    const wrongAnswers = reviewDetails.filter((item) => !item.isCorrect);
    setResultState({ gameId, score, total, ...summary, isReview: false, wrongAnswers, allAnswers: reviewDetails });
  };

  const wmQuestion = wm ? wm.questions[wm.current] : null;
  const sbQuestion = sb ? sb.questions[sb.current] : null;

  const onWmAnswer = (idx) => {
    if (!wm || wm.answered) return;
    const correct = idx === wmQuestion.answer;
    setWm((prev) => {
      const next = {
        ...prev,
        answered: true,
        selected: idx,
        score: correct ? prev.score + 1 : prev.score,
        results: [...prev.results, correct],
        reviewDetails: [
          ...prev.reviewDetails,
          {
            prompt: wmQuestion.word,
            yourAnswer: wmQuestion.options[idx],
            correctAnswer: wmQuestion.options[wmQuestion.answer],
            isCorrect: correct,
          },
        ],
      };
      setActiveSessions((sessions) => ({ ...sessions, 0: next }));
      return next;
    });
  };

  const onWmNext = () => {
    if (!wm) return;
    const nextIndex = wm.current + 1;
    if (nextIndex >= wm.questions.length) {
      showResult(0, wm.score, wm.questions.length, wm.reviewDetails);
      return;
    }
    setWm((prev) => {
      const next = { ...prev, current: nextIndex, answered: false, selected: -1 };
      setActiveSessions((sessions) => ({ ...sessions, 0: next }));
      return next;
    });
  };

  const onSbPick = (idx) => {
    if (!sb || sb.checked) return;
    const word = sb.bank[idx];
    setSb((prev) => {
      const next = {
        ...prev,
        bank: prev.bank.filter((_, i) => i !== idx),
        built: [...prev.built, word],
        feedback: "",
        feedbackKind: "",
      };
      setActiveSessions((sessions) => ({ ...sessions, 1: next }));
      return next;
    });
  };

  const onSbRemove = (idx) => {
    if (!sb || sb.checked) return;
    const word = sb.built[idx];
    setSb((prev) => {
      const next = {
        ...prev,
        built: prev.built.filter((_, i) => i !== idx),
        bank: [...prev.bank, word],
        feedback: "",
        feedbackKind: "",
      };
      setActiveSessions((sessions) => ({ ...sessions, 1: next }));
      return next;
    });
  };

  const onSbCheck = () => {
    if (!sb || sb.checked) return;
    const attempt = sb.built.join(" ").toLowerCase().trim();
    const correct = attempt === sbQuestion.answer.toLowerCase().trim();
    const attemptLabel = sb.built.length ? sb.built.join(" ") : "(no answer)";
    setSb((prev) => {
      const next = {
        ...prev,
        checked: true,
        score: correct ? prev.score + 1 : prev.score,
        results: [...prev.results, correct],
        feedback: correct ? "✓ Correct! Great sentence!" : `✗ Not quite. Answer: "${sbQuestion.answer}"`,
        feedbackKind: correct ? "correct" : "wrong",
        reviewDetails: [
          ...prev.reviewDetails,
          {
            prompt: sbQuestion.prompt,
            yourAnswer: attemptLabel,
            correctAnswer: sbQuestion.answer,
            isCorrect: correct,
          },
        ],
      };
      setActiveSessions((sessions) => ({ ...sessions, 1: next }));
      return next;
    });
  };

  const onSbNext = () => {
    if (!sb) return;
    const nextIndex = sb.current + 1;
    if (nextIndex >= sb.questions.length) {
      showResult(1, sb.score, sb.questions.length, sb.reviewDetails);
      return;
    }
    const q = sb.questions[nextIndex];
    setSb((prev) => {
      const next = {
        ...prev,
        current: nextIndex,
        built: [],
        bank: shuffle(q.words),
        checked: false,
        feedback: "",
        feedbackKind: "",
      };
      setActiveSessions((sessions) => ({ ...sessions, 1: next }));
      return next;
    });
  };

  const onFsPickWord = (word) => {
    if (!fs || fs.used.includes(word)) return;
    const nextBlank = fs.inputs.findIndex((v) => !v.trim());
    if (nextBlank === -1) return;
    setFs((prev) => {
      const nextInputs = [...prev.inputs];
      const nextStates = [...prev.inputStates];
      nextInputs[nextBlank] = word;
      nextStates[nextBlank] = "";
      const next = { ...prev, inputs: nextInputs, inputStates: nextStates, used: [...prev.used, word] };
      setActiveSessions((sessions) => ({ ...sessions, 2: next }));
      return next;
    });
  };

  const onFsInput = (idx, value) => {
    setFs((prev) => {
      const nextInputs = [...prev.inputs];
      const nextStates = [...prev.inputStates];
      nextInputs[idx] = value;
      nextStates[idx] = "";
      const next = { ...prev, inputs: nextInputs, inputStates: nextStates };
      setActiveSessions((sessions) => ({ ...sessions, 2: next }));
      return next;
    });
  };

  const onFsSubmit = () => {
    if (!fs) return;
    let score = 0;
    const nextStates = fs.data.blanks.map((blank, i) => {
      const correct = fs.inputs[i].trim().toLowerCase() === blank.answer.toLowerCase();
      if (correct) score += 1;
      return correct ? "filled" : "incorrect";
    });
    const total = fs.data.blanks.length;
    setFs((prev) => {
      const next = {
        ...prev,
        submitted: true,
        inputStates: nextStates,
        feedback:
          score === total
            ? "✓ Perfect! You filled in all the blanks correctly!"
            : `${score}/${total} correct. Red blanks need fixing. Try again or see results.`,
        feedbackKind: score === total ? "correct" : "wrong",
        reviewDetails: fs.data.blanks.map((blank, i) => ({
          prompt: `Blank ${i + 1}`,
          blankId: blank.id,
          yourAnswer: fs.inputs[i].trim() || "(blank)",
          correctAnswer: blank.answer,
          isCorrect: fs.inputs[i].trim().toLowerCase() === blank.answer.toLowerCase(),
        })),
      };
      setActiveSessions((sessions) => ({ ...sessions, 2: next }));
      return next;
    });
  };

  const onFsResult = () => {
    if (!fs) return;
    let score = 0;
    fs.data.blanks.forEach((blank, i) => {
      if (fs.inputs[i].trim().toLowerCase() === blank.answer.toLowerCase()) score += 1;
    });
    const reviewDetails =
      fs.reviewDetails?.length > 0
        ? fs.reviewDetails
        : fs.data.blanks.map((blank, i) => ({
            prompt: `Blank ${i + 1}`,
            blankId: blank.id,
            yourAnswer: fs.inputs[i].trim() || tEn("result.blank"),
            correctAnswer: blank.answer,
            isCorrect: fs.inputs[i].trim().toLowerCase() === blank.answer.toLowerCase(),
          }));
    showResult(2, score, fs.data.blanks.length, reviewDetails);
  };

  const renderDots = (total, current, results) =>
    [...Array(total)].map((_, i) => {
      const cls = i < current ? (results[i] ? "dot correct" : "dot wrong") : i === current ? "dot active" : "dot";
      return <div key={`dot-${i}`} className={cls} />;
    });

  const rankedAccountsReal = [...accounts].sort((a, b) => (b.points || 0) - (a.points || 0));
  const leaderboardAllPadded = mergeWithDemoLeaderboard(rankedAccountsReal, dailySeed, null);
  const classroomCode = currentUser?.studentCode?.trim() || "";
  const classroomRankedReal = classroomCode
    ? [...accounts]
        .filter((acct) => (acct.studentCode || "").trim().toUpperCase() === classroomCode.toUpperCase())
        .sort((a, b) => (b.points || 0) - (a.points || 0))
    : [];
  const leaderboardClassroomPadded = classroomCode
    ? mergeWithDemoLeaderboard(classroomRankedReal, dailySeed + 100000, classroomCode)
    : [];
  const displayedLeaderboard = statsScope === "classroom" ? leaderboardClassroomPadded : leaderboardAllPadded;
  const currentRankIndex = currentUser ? leaderboardAllPadded.findIndex((acct) => acct.email === currentUser.email) : -1;
  const currentRank = currentRankIndex >= 0 ? currentRankIndex + 1 : null;
  const totalUsers = leaderboardAllPadded.length;
  const percentile =
    currentRank && totalUsers > 0 ? Math.round(((totalUsers - currentRank + 1) / totalUsers) * 100) : null;
  const perfectDays = currentUser ? (currentUser.awardedAchievements || []).filter((key) => key.startsWith("perfect-all-3-")).length : 0;
  const usingDemoLeaderboardFill = rankedAccountsReal.length < MIN_LEADERBOARD_USERS;

  const progressRingRadius = 14;
  const progressRingCirc = 2 * Math.PI * progressRingRadius;
  const progressRingFraction = completedCount === 0 ? 0.14 : completedCount / 3;
  const progressRingDash = progressRingCirc * progressRingFraction;

  const openPrivacyPolicy = () => {
    setCookiePanelOpen(false);
    setCookieDetailsOpen(false);
    setPrivacyPolicyOpen(true);
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#privacy`);
  };

  const closePrivacyPolicy = () => {
    setPrivacyPolicyOpen(false);
    if (window.location.hash === "#privacy") {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }
  };

  const showCookiePanel = (cookieConsent === null || cookiePanelOpen) && !privacyPolicyOpen;

  return (
    <div className={`wordplay-app${showCookiePanel ? " has-cookie-banner" : ""}`}>
      <nav>
        <a className="nav-logo" href="#">
          <img src={logoImage} alt={t("logoAlt")} className="nav-logo-icon" />
          <span className="logo-desktop">English Everyday</span>
        </a>
        <div className="nav-actions">
          <div className="nav-language-slot">
            <LanguageSelect
              id="nav-language-select"
              value={language}
              onChange={setLanguage}
              ariaLabel={t("settings.language")}
              variant="nav"
            />
          </div>
          {currentUser && (
            <div
              className="progress-ring-wrap"
              role="img"
              aria-label={t("nav.progressRing", { n: completedCount })}
            >
              <svg
                className="progress-ring"
                viewBox="0 0 36 36"
                width="36"
                height="36"
                aria-hidden="true"
              >
                <circle
                  className="progress-ring-track"
                  cx="18"
                  cy="18"
                  r={progressRingRadius}
                  fill="none"
                />
                <circle
                  className={`progress-ring-fill progress-${completedCount}`}
                  cx="18"
                  cy="18"
                  r={progressRingRadius}
                  fill="none"
                  strokeLinecap="round"
                  transform="rotate(-90 18 18)"
                  strokeDasharray={`${progressRingDash} ${progressRingCirc}`}
                />
              </svg>
              {completedCount === 3 && (
                <span className="progress-check" aria-hidden="true">
                  ✓
                </span>
              )}
            </div>
          )}
          {currentUser ? (
            <div className="points-menu-wrap">
              <button
                className="points-pill profile-trigger"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                type="button"
                aria-expanded={profileMenuOpen}
                aria-haspopup="true"
                aria-label={t("nav.accountMenu")}
              >
                <span>
                  ⭐ {currentUser.points || 0} {t("nav.pts")}
                </span>
                <span className="profile-user-icon" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.75" />
                    <circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="1.75" />
                    <path
                      d="M5.5 19.5c.9-3.2 3.4-5 6.5-5s5.6 1.8 6.5 5"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </button>
              {profileMenuOpen && (
                <div className="profile-menu">
                  <button className="profile-menu-item" onClick={openStats} type="button">
                    {t("nav.myStats")}
                  </button>
                  <button
                    className="profile-menu-item"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      openArchive();
                    }}
                    type="button"
                  >
                    {t("nav.archive")}
                  </button>
                  <button className="profile-menu-item" onClick={openSettings} type="button">
                    {t("nav.settings")}
                  </button>
                  <button className="profile-menu-item" onClick={handleSignout} type="button">
                    {t("nav.signOut")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                className="btn-secondary nav-signin-btn"
                onClick={() => {
                  setAuthMode("signin");
                  setAuthOpen(true);
                }}
                type="button"
              >
                {t("nav.signIn")}
              </button>
              <button
                className="btn-primary nav-signup-btn"
                onClick={() => {
                  setAuthMode("signup");
                  setAuthOpen(true);
                }}
                type="button"
              >
                {t("nav.signUp")}
              </button>
            </>
          )}
        </div>
      </nav>

      <header>
        <div className="eyebrow">{t("header.eyebrow")}</div>
        <h1>{t("header.title")}</h1>
        <p>{t("header.subtitle")}</p>
        <p className="header-date">
          📅 {dateLabel} {t("header.dateSuffix")}
        </p>
      </header>

      <div className="games-grid">
        {gameCards.map((game) => (
          <div
            key={game.id}
            className={`game-card ${game.level}`}
            onClick={() => (progress.completed[game.id] ? openReview(game.id) : openGame(game.id))}
            role="button"
            tabIndex={0}
          >
            <div className={`completed-mark ${progress.completed[game.id] ? "show" : ""}`}>✓</div>
            <div className="level-tag">{game.tag}</div>
            <h2>{game.title}</h2>
            <p>{game.desc}</p>
            <div className="meta">
              {progress.completed[game.id] ? (
                <div className="meta-actions">
                  <span className="completed-score">
                    {t("gameCard.score")} {progress.scores[game.id] || 0}/{gameTotals[game.id]}
                  </span>
                  <button
                    className="play-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      openReview(game.id);
                    }}
                    type="button"
                  >
                    {t("gameCard.review")}
                  </button>
                  <button
                    className="btn-secondary card-archive-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      openArchive();
                    }}
                    type="button"
                  >
                    {t("gameCard.viewArchive")}
                  </button>
                </div>
              ) : (
                <>
                  <button
                    className="play-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      openGame(game.id);
                    }}
                    type="button"
                  >
                    {activeSessions[game.id] ? t("gameCard.resume") : t("gameCard.play")}
                  </button>
                  <span className="time-tag">⏱ {game.time}</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bottom-archive-row">
        <button className="btn-secondary archive-btn" onClick={openArchive} type="button">
          {t("home.viewArchive")}
        </button>
        <button className="btn-primary invite-btn" onClick={() => setInviteOpen(true)} type="button">
          {t("home.inviteFriend")}
        </button>
      </div>

      <section className="schools-section" aria-labelledby="schools-section-title">
        <div className="schools-inner">
          <div className="schools-copy">
            <h2 id="schools-section-title" className="schools-title">
              {t("schools.title")}
            </h2>
            <p className="schools-subtitle">{t("schools.subtitle")}</p>
            <ul className="schools-features">
              <li>{t("schools.feature1")}</li>
              <li>{t("schools.feature2")}</li>
              <li>{t("schools.feature3")}</li>
            </ul>
          </div>
          <form className="schools-form" onSubmit={handleSchoolLeadSubmit}>
            <label className="auth-label" htmlFor="school-lead-email">
              {t("schools.emailLabel")}
            </label>
            <input
              id="school-lead-email"
              className="auth-input"
              type="email"
              name="email"
              autoComplete="email"
              value={schoolLeadEmail}
              onChange={(e) => setSchoolLeadEmail(e.target.value)}
              placeholder={t("schools.emailPlaceholder")}
            />
            <label className="auth-label schools-form-gap" htmlFor="school-lead-school">
              {t("schools.schoolLabel")}
            </label>
            <input
              id="school-lead-school"
              className="auth-input"
              type="text"
              name="organization"
              autoComplete="organization"
              value={schoolLeadSchool}
              onChange={(e) => setSchoolLeadSchool(e.target.value)}
              placeholder={t("schools.schoolPlaceholder")}
            />
            <button className="btn-primary schools-submit" type="submit">
              {t("schools.submit")}
            </button>
            <p className="schools-privacy-note">{t("schools.privacyNote")}</p>
          </form>
        </div>
      </section>

      <footer>
        <p className="footer-tagline">{t("footer.tagline")}</p>
        <div className="footer-links">
          <button type="button" className="footer-legal-link" onClick={openPrivacyPolicy}>
            {t("footer.privacyPolicy")}
          </button>
          <button
            type="button"
            className="footer-cookie-link"
            onClick={() => {
              setCookiePanelOpen(true);
              setCookieDetailsOpen(true);
            }}
          >
            {t("footer.cookieSettings")}
          </button>
          <a
            className="footer-donate-link"
            href="https://buymeacoffee.com/englisheverydayplay"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("footer.donate")}
          </a>
        </div>
      </footer>

      {privacyPolicyOpen && <PrivacyPolicyPage onClose={closePrivacyPolicy} />}

      {settingsOpen && currentUser && (
        <div className="result-page">
          <div className="result-page-header">
            <button className="btn-secondary" onClick={() => setSettingsOpen(false)} type="button">
              {t("settings.backHome")}
            </button>
          </div>
          <div className="result-page-content">
            <div className="result-screen show stats-page-content">
              <div className="result-icon">⚙️</div>
              <h3>{t("settings.title")}</h3>
              <p>{t("settings.subtitle")}</p>
              <div className="settings-panel">
                <label className="auth-label" id="settings-language-label" htmlFor="settings-language-select">
                  {t("settings.language")}
                </label>
                <p className="settings-help settings-language-desc">{t("settings.languageHelp")}</p>
                <LanguageSelect
                  id="settings-language-select"
                  value={language}
                  onChange={setLanguage}
                  labelledBy="settings-language-label"
                />
                <label className="auth-label settings-field-spaced" htmlFor="settings-student-code">
                  {t("settings.classroomLabel")}
                </label>
                <input
                  id="settings-student-code"
                  className="auth-input"
                  type="text"
                  value={settingsStudentCode}
                  onChange={(e) => setSettingsStudentCode(e.target.value)}
                  placeholder={t("settings.classroomPlaceholder")}
                />
                <div className="settings-help">{t("settings.classroomHelp")}</div>
                <div className="settings-actions">
                  <button className="btn-secondary" onClick={() => setSettingsOpen(false)} type="button">
                    {t("settings.cancel")}
                  </button>
                  <button className="btn-primary" onClick={saveSettings} type="button">
                    {t("settings.save")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {statsOpen && currentUser && (
        <div className="result-page">
          <div className="result-page-header">
            <button className="btn-secondary" onClick={() => setStatsOpen(false)} type="button">
              {t("stats.backHome")}
            </button>
          </div>
          <div className="result-page-content">
            <div className="result-screen show stats-page-content">
              <div className="result-icon">📊</div>
              <h3>{t("stats.title")}</h3>
              <p>{t("stats.subtitle")}</p>
              <div className="stats-grid">
                <div className="stats-card">
                  <div className="stats-label">{t("stats.totalPoints")}</div>
                  <div className="stats-value">⭐ {currentUser.points || 0}</div>
                </div>
                <div className="stats-card">
                  <div className="stats-label">{t("stats.ranking")}</div>
                  <div className="stats-value">
                    {currentRank
                      ? t("stats.rankOf", { rank: currentRank, total: totalUsers })
                      : t("stats.na")}
                  </div>
                </div>
                <div className="stats-card">
                  <div className="stats-label">{t("stats.topPercentile")}</div>
                  <div className="stats-value">{percentile ? `${percentile}%` : t("stats.na")}</div>
                </div>
                <div className="stats-card">
                  <div className="stats-label">{t("stats.perfectDays")}</div>
                  <div className="stats-value">🏆 {perfectDays}</div>
                </div>
              </div>
              <div className="stats-subheading">{t("stats.leaderboardHeading")}</div>
              {usingDemoLeaderboardFill && (
                <div className="stats-note">{t("stats.demoNote", { min: MIN_LEADERBOARD_USERS })}</div>
              )}
              <div className="stats-toggle-row">
                <button
                  className={`btn-secondary stats-toggle-btn ${statsScope === "all" ? "active" : ""}`}
                  onClick={() => setStatsScope("all")}
                  type="button"
                >
                  {t("stats.allPlayers")}
                </button>
                <button
                  className={`btn-secondary stats-toggle-btn ${statsScope === "classroom" ? "active" : ""}`}
                  onClick={() => setStatsScope("classroom")}
                  type="button"
                  disabled={!classroomCode}
                >
                  {t("stats.myClassroom")}
                </button>
              </div>
              {!classroomCode && <div className="stats-note">{t("stats.classroomHint")}</div>}
              <div className="leaderboard-list">
                {displayedLeaderboard.length === 0 ? (
                  <div className="leaderboard-empty">
                    {statsScope === "classroom" ? t("stats.noClassmates") : t("stats.noPlayers")}
                  </div>
                ) : (
                  displayedLeaderboard.map((acct, idx) => (
                    <div
                      className={`leaderboard-row ${acct.email === currentUser.email && !acct.isDemo ? "you" : ""} ${acct.isDemo ? "demo-row" : ""}`}
                      key={`${acct.email}-${acct.isDemo ? "demo" : "real"}-${idx}`}
                    >
                      <span className="leaderboard-rank">#{idx + 1}</span>
                      <span className="leaderboard-name">
                        {acct.email}
                        {acct.isDemo && <span className="demo-badge">{t("stats.sample")}</span>}
                      </span>
                      <span className="leaderboard-points">
                        {acct.points || 0} {t("nav.pts")}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {resultState && (
        <div className="result-page">
          <div className="result-page-header">
            <button className="btn-secondary" onClick={backToHomepage} type="button">
              {t("result.backHome")}
            </button>
          </div>
          <div className="result-page-content">
            <div className="result-screen show">
              <div className="result-icon">{resultState.stars}</div>
              <div className="result-score">
                {resultState.score}/{resultState.total}
              </div>
              <h3>{resultState.title}</h3>
              <p>{resultState.msg}</p>
              {resultState.gameId === 2 && resultState.allAnswers && resultState.allAnswers.length > 0 && (
                <div className="review-wrong-list">
                  <h4>{tEn("result.storyReview")}</h4>
                  <div className="story-review-context">
                    {gameData.fillStory.story.split(/(\[BLANK\d+\])/g).map((part, idx) => {
                      const match = part.match(/\[(BLANK\d+)\]/);
                      if (!match) return <span key={`story-text-${idx}`}>{part}</span>;
                      const blankKey = match[1];
                      const detail = resultState.allAnswers.find((item) => item.blankId === blankKey);
                      if (!detail) return <span key={`story-missing-${idx}`}>[blank]</span>;

                      return (
                        <span key={`story-ok-${idx}`} className="story-inline-correct">
                          {detail.correctAnswer}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              {resultState.gameId !== 2 && (
                <div className="review-wrong-list">
                  <h4>{tEn("result.questionsReview")}</h4>
                  {resultState.wrongAnswers && resultState.wrongAnswers.length > 0 ? (
                    resultState.wrongAnswers.map((item, idx) => (
                      <div className="review-wrong-item" key={`${item.prompt}-${idx}`}>
                        <div className="review-prompt">{item.prompt}</div>
                        <div className="review-line">
                          <strong>{tEn("result.yourAnswer")}</strong>{" "}
                          <span className="your-answer-text">{item.yourAnswer}</span>
                        </div>
                        <div className="review-line">
                          <strong>{tEn("result.correctAnswer")}</strong>{" "}
                          <span className="correct-answer-text">{item.correctAnswer}</span>
                        </div>
                      </div>
                    ))
                  ) : resultState.allAnswers && resultState.allAnswers.length > 0 ? (
                    <div className="review-empty-note">{tEn("result.noMistakes")}</div>
                  ) : (
                    <div className="review-empty-note">{tEn("result.reviewLegacy")}</div>
                  )}
                </div>
              )}
              <div className="result-actions">
                <button className="btn-secondary" onClick={openArchive} type="button">
                  {t("result.viewArchive")}
                </button>
                <button className="btn-primary" onClick={backToHomepage} type="button">
                  {t("result.backHomeBtn")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`modal-overlay ${modalOpen && !resultState ? "open" : ""}`} onClick={(e) => e.target === e.currentTarget && closeModal()}>
        <div className="modal">
          <div className="modal-header">
            <div>
              <h3>{currentGame >= 0 ? gameCards[currentGame].modalTitle : tEn("modal.game")}</h3>
              <div className="progress-dots">
                {!resultState && currentGame === 0 && wm && renderDots(wm.questions.length, wm.current, wm.results)}
                {!resultState && currentGame === 1 && sb && renderDots(sb.questions.length, sb.current, sb.results)}
              </div>
            </div>
            <button className="modal-close" onClick={closeModal} type="button">
              ✕
            </button>
          </div>
          <div className="modal-body">
            {currentGame === 0 && wm && wmQuestion && (
              <>
                <div className="score-bar">
                  <span>
                    {tEn("modal.question")} {wm.current + 1} {tEn("modal.of")} {wm.questions.length}
                  </span>
                  <span className="score-pill">
                    {tEn("modal.score")} {wm.score}/{wm.questions.length}
                  </span>
                </div>
                <div className="word-display">
                  <div className="big-word">{wmQuestion.word}</div>
                  <div className="word-hint">{wmQuestion.hint}</div>
                </div>
                <div className="options-grid">
                  {wmQuestion.options.map((opt, i) => {
                    let stateClass = "";
                    if (wm.answered) {
                      if (i === wmQuestion.answer) stateClass = "correct";
                      else if (i === wm.selected) stateClass = "wrong";
                    }
                    return (
                      <button key={opt} className={`option-btn ${stateClass}`} onClick={() => onWmAnswer(i)} disabled={wm.answered} type="button">
                        {opt}
                      </button>
                    );
                  })}
                </div>
                <button className={`next-btn ${wm.answered ? "show" : ""}`} onClick={onWmNext} type="button">
                  {t("modal.next")}
                </button>
              </>
            )}

            {currentGame === 1 && sb && sbQuestion && (
              <>
                <div className="score-bar">
                  <span>
                    {tEn("modal.question")} {sb.current + 1} {tEn("modal.of")} {sb.questions.length}
                  </span>
                  <span className="score-pill">
                    {tEn("modal.score")} {sb.score}/{sb.questions.length}
                  </span>
                </div>
                <div className="sentence-prompt">📝 {sbQuestion.prompt}</div>
                <div className="sentence-area">
                  {sb.built.length === 0 && <span className="placeholder-text">{tEn("modal.tapBuild")}</span>}
                  {sb.built.map((word, i) => (
                    <button key={`${word}-${i}`} className="word-chip" onClick={() => onSbRemove(i)} type="button">
                      {word}
                    </button>
                  ))}
                </div>
                <div className="word-bank">
                  {sb.bank.map((word, i) => (
                    <button key={`${word}-bank-${i}`} className="word-chip bank" onClick={() => onSbPick(i)} type="button">
                      {word}
                    </button>
                  ))}
                </div>
                <div className={`feedback-msg ${sb.feedbackKind}`}>{sb.feedback}</div>
                <button className="check-sentence-btn" onClick={onSbCheck} disabled={sb.checked} type="button">
                  {t("modal.checkSentence")}
                </button>
                <button className={`next-btn ${sb.checked ? "show" : ""}`} onClick={onSbNext} type="button">
                  {t("modal.next")}
                </button>
              </>
            )}

            {currentGame === 2 && fs && (
              <>
                <div className="story-text">
                  {fs.data.story.split(/(\[BLANK\d+\])/g).map((part, idx) => {
                    const match = part.match(/\[BLANK(\d+)\]/);
                    if (!match) return <span key={`txt-${idx}`}>{part}</span>;
                    const blankIndex = Number(match[1]) - 1;
                    return (
                      <input
                        key={`blank-${blankIndex}`}
                        className={`blank-input ${fs.inputStates[blankIndex]}`}
                        value={fs.inputs[blankIndex]}
                        onChange={(e) => onFsInput(blankIndex, e.target.value)}
                        placeholder="..."
                        autoComplete="off"
                      />
                    );
                  })}
                </div>
                <div className="word-bank-label">{tEn("modal.wordBankLabel")}</div>
                <div className="hint-chips">
                  {fs.data.wordBank.map((word) => (
                    <button key={word} className={`hint-chip ${fs.used.includes(word) ? "used" : ""}`} onClick={() => onFsPickWord(word)} type="button">
                      {word}
                    </button>
                  ))}
                </div>
                <div className={`feedback-msg ${fs.feedbackKind}`}>{fs.feedback}</div>
                <button className="submit-story-btn" onClick={onFsSubmit} type="button">
                  {t("modal.checkStory")}
                </button>
                <button className={`next-btn ${fs.submitted ? "show" : ""}`} onClick={onFsResult} type="button">
                  {t("modal.seeResults")}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={`modal-overlay ${authOpen ? "open" : ""}`} onClick={(e) => e.target === e.currentTarget && closeAuth()}>
        <div className="modal auth-modal">
          <div className="modal-header">
            <div>
              <h3>{authMode === "signup" ? tEn("auth.createTitle") : tEn("auth.signInTitle")}</h3>
            </div>
            <button className="modal-close" onClick={closeAuth} type="button">
              ✕
            </button>
          </div>
          <div className="modal-body auth-body">
            <label className="auth-label" htmlFor="archive-email">
              {tEn("auth.email")}
            </label>
            <input id="archive-email" className="auth-input" type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} />
            <div className="auth-password-field">
              <label className="auth-label auth-label-inline" htmlFor="archive-password">
                {tEn("auth.password")}
                {authMode === "signup" && (
                  <span className="password-info-wrap">
                    <button
                      type="button"
                      className="password-info-icon"
                      aria-describedby="password-rules-tooltip"
                      aria-label={tEn("auth.passwordRequirements")}
                    >
                      i
                    </button>
                  </span>
                )}
              </label>
              {authMode === "signup" && (
                <div id="password-rules-tooltip" className="password-info-tooltip" role="tooltip">
                  <div className="password-info-tooltip-title">{tEn("auth.strongPassword")}</div>
                  <ul className="password-rules">
                    <li className={passwordChecks.minLength ? "rule-pass" : ""}>{tEn("auth.ruleMin")}</li>
                    <li className={passwordChecks.uppercase ? "rule-pass" : ""}>{tEn("auth.ruleUpper")}</li>
                    <li className={passwordChecks.lowercase ? "rule-pass" : ""}>{tEn("auth.ruleLower")}</li>
                    <li className={passwordChecks.number ? "rule-pass" : ""}>{tEn("auth.ruleNumber")}</li>
                    <li className={passwordChecks.special ? "rule-pass" : ""}>{tEn("auth.ruleSpecial")}</li>
                  </ul>
                </div>
              )}
              <input id="archive-password" className="auth-input" type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} />
            </div>
            {authMode === "signup" && (
              <>
                <label className="auth-label" htmlFor="student-code">
                  {tEn("auth.studentCodeOptional")}
                </label>
                <input
                  id="student-code"
                  className="auth-input"
                  type="text"
                  value={authStudentCode}
                  onChange={(e) => setAuthStudentCode(e.target.value)}
                  placeholder="e.g. CLASS-7A"
                />
                <label className="auth-label" htmlFor="archive-confirm-password">
                  {tEn("auth.confirmPassword")}
                </label>
                <input
                  id="archive-confirm-password"
                  className="auth-input"
                  type="password"
                  value={authConfirmPassword}
                  onChange={(e) => setAuthConfirmPassword(e.target.value)}
                />
              </>
            )}
            {authError && <div className="auth-error">{authError}</div>}
            <div className="auth-actions">
              {authMode === "signup" ? (
                <>
                  <button className="btn-primary" onClick={handleSignup} type="button">
                    {t("auth.signUp")}
                  </button>
                  <button className="btn-secondary" onClick={() => switchAuthMode("signin")} type="button">
                    {t("auth.alreadyHave")}
                  </button>
                </>
              ) : (
                <>
                  <button className="btn-primary" onClick={handleSignin} type="button">
                    {t("auth.signIn")}
                  </button>
                  <button className="btn-secondary" onClick={() => switchAuthMode("signup")} type="button">
                    {t("auth.createNew")}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={`modal-overlay ${archiveOpen ? "open" : ""}`} onClick={(e) => e.target === e.currentTarget && setArchiveOpen(false)}>
        <div className="modal archive-modal">
          <div className="modal-header">
            <div>
              <h3>{tEn("archiveModal.title")}</h3>
            </div>
            <button className="modal-close" onClick={() => setArchiveOpen(false)} type="button">
              ✕
            </button>
          </div>
          <div className="modal-body archive-body">
            {previousArchiveKeys.length === 0 ? (
              <p>{tEn("archiveModal.empty")}</p>
            ) : (
              previousArchiveKeys.map((key) => {
                const day = archiveData[key];
                return (
                  <div className="archive-item" key={key}>
                    <h4>{formatArchiveDate(key, "en-GB")}</h4>
                    <ul>
                      <li>{tEn("archiveModal.wmLine", { n: day.wordMatch.length })}</li>
                      <li>{tEn("archiveModal.sbLine", { n: day.sentenceBuilder.length })}</li>
                      <li>{tEn("archiveModal.fsLine")}</li>
                    </ul>
                  </div>
                );
              })
            )}
            <div className="archive-actions">
              <button className="btn-secondary" onClick={handleSignout} type="button">
                {t("archiveModal.signOut")}
              </button>
              <button className="btn-primary" onClick={() => setArchiveOpen(false)} type="button">
                {t("archiveModal.close")}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className={`modal-overlay ${inviteOpen ? "open" : ""}`} onClick={(e) => e.target === e.currentTarget && setInviteOpen(false)}>
        <div className="modal invite-modal">
          <div className="modal-header">
            <div>
              <h3>{tEn("invite.title")}</h3>
            </div>
            <button className="modal-close" onClick={() => setInviteOpen(false)} type="button">
              ✕
            </button>
          </div>
          <div className="modal-body invite-body">
            <p className="invite-message-preview">{inviteMessage}</p>
            <div className="invite-actions">
              <button className="btn-secondary" onClick={handleShareFacebook} type="button">
                {t("invite.shareFacebook")}
              </button>
              <button className="btn-secondary" onClick={handleCopyInviteLink} type="button">
                {t("invite.copyLink")}
              </button>
              <button className="btn-primary" onClick={handleSendText} type="button">
                {t("invite.sendText")}
              </button>
            </div>
            {!isMobileDevice() && <p className="invite-note">{tEn("invite.noteDesktop")}</p>}
          </div>
        </div>
      </div>

      {showCookiePanel && (
        <div
          className="cookie-banner"
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-banner-title"
          aria-describedby="cookie-banner-desc"
        >
          <div className="cookie-banner-inner">
            {cookieConsent !== null && (
              <button
                type="button"
                className="cookie-banner-dismiss"
                onClick={() => {
                  setCookiePanelOpen(false);
                  setCookieDetailsOpen(false);
                }}
                aria-label={t("cookie.closeNotice")}
              >
                ✕
              </button>
            )}
            <h2 id="cookie-banner-title" className="cookie-banner-title">
              {tEn("cookie.title")}
            </h2>
            <p id="cookie-banner-desc" className="cookie-banner-desc">
              {tEn("cookie.descBefore")}
              <strong>{tEn("cookie.descStrongNecessary")}</strong>
              {tEn("cookie.descMid")}
              <strong>{tEn("cookie.descStrongOptional")}</strong>
              {tEn("cookie.descAfter")}
              <button type="button" className="cookie-banner-privacy-link" onClick={openPrivacyPolicy}>
                {t("cookie.readPrivacy")}
              </button>
            </p>
            {cookieDetailsOpen && (
              <div className="cookie-banner-details" role="group" aria-label={tEn("cookie.categoriesAria")}>
                <label className="cookie-toggle-row">
                  <input type="checkbox" checked disabled aria-checked="true" />
                  <span>
                    <strong>{tEn("cookie.strictLabel")}</strong>
                    {" — "}
                    {tEn("cookie.strictDesc")}
                  </span>
                </label>
                <label className="cookie-toggle-row">
                  <input
                    type="checkbox"
                    checked={draftAnalytics}
                    onChange={(e) => setDraftAnalytics(e.target.checked)}
                  />
                  <span>
                    <strong>{tEn("cookie.analyticsLabel")}</strong>
                    {" — "}
                    {tEn("cookie.analyticsDesc")}
                  </span>
                </label>
                <label className="cookie-toggle-row">
                  <input
                    type="checkbox"
                    checked={draftMarketing}
                    onChange={(e) => setDraftMarketing(e.target.checked)}
                  />
                  <span>
                    <strong>{tEn("cookie.marketingLabel")}</strong>
                    {" — "}
                    {tEn("cookie.marketingDesc")}
                  </span>
                </label>
              </div>
            )}
            <div className="cookie-banner-actions">
              <button
                type="button"
                className="btn-secondary cookie-btn-equal"
                onClick={() => {
                  const next = saveCookieConsent(false, false);
                  setCookieConsent(next);
                  setCookiePanelOpen(false);
                  setCookieDetailsOpen(false);
                }}
              >
                {t("cookie.reject")}
              </button>
              <button
                type="button"
                className="btn-secondary cookie-btn-equal"
                onClick={() => {
                  const next = saveCookieConsent(true, true);
                  setCookieConsent(next);
                  setCookiePanelOpen(false);
                  setCookieDetailsOpen(false);
                }}
              >
                {t("cookie.acceptAll")}
              </button>
              {cookieDetailsOpen && (
                <button
                  type="button"
                  className="btn-primary cookie-save-prefs"
                  onClick={() => {
                    const next = saveCookieConsent(draftAnalytics, draftMarketing);
                    setCookieConsent(next);
                    setCookiePanelOpen(false);
                    setCookieDetailsOpen(false);
                  }}
                >
                  {t("cookie.savePrefs")}
                </button>
              )}
              <button
                type="button"
                className="cookie-manage-toggle"
                onClick={() => setCookieDetailsOpen((v) => !v)}
              >
                {cookieDetailsOpen ? t("cookie.hideOptions") : t("cookie.managePrefs")}
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="toast" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </div>
  );
}