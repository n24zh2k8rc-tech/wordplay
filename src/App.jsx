import { useEffect, useMemo, useState } from "react";
import "./App.css";
import logoImage from "./assets/logo.png";

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

function makePRNG(seed) {
  let s = seed >>> 0;
  return function next() {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle(arr, rng) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const ALL_WORD_MATCH = [
  { word: "Brave", hint: "adjective", options: ["Afraid of everything", "Ready to face danger without fear", "Very lazy and slow", "Extremely hungry"], answer: 1 },
  { word: "Ancient", hint: "adjective", options: ["Very new and modern", "Belonging to a much earlier time", "Very small in size", "Extremely loud"], answer: 1 },
  { word: "Generous", hint: "adjective", options: ["Selfish with money", "Always angry at others", "Willing to give freely", "Difficult to understand"], answer: 2 },
  { word: "Exhausted", hint: "adjective", options: ["Full of energy", "Extremely tired", "Very happy", "Slightly confused"], answer: 1 },
  { word: "Enormous", hint: "adjective", options: ["Very tiny", "Quite pretty", "Extremely large", "A little warm"], answer: 2 },
  { word: "Grateful", hint: "adjective", options: ["Feeling thankful", "Feeling bored", "Feeling angry", "Feeling cold"], answer: 0 },
  { word: "Peculiar", hint: "adjective", options: ["Very common", "Strange or unusual", "Perfectly normal", "Beautiful to look at"], answer: 1 },
  { word: "Hesitate", hint: "verb", options: ["To run very fast", "To speak loudly", "To pause before acting", "To eat too much"], answer: 2 },
  { word: "Vibrant", hint: "adjective", options: ["Dull and lifeless", "Full of energy and colour", "Very quiet", "Easily broken"], answer: 1 },
  { word: "Cautious", hint: "adjective", options: ["Reckless and bold", "Careful to avoid danger", "Very generous", "Loud and noisy"], answer: 1 },
  { word: "Stubborn", hint: "adjective", options: ["Very flexible", "Unwilling to change one's mind", "Extremely kind", "Slightly nervous"], answer: 1 },
  { word: "Admire", hint: "verb", options: ["To dislike strongly", "To look at with respect and pleasure", "To forget quickly", "To argue loudly"], answer: 1 },
  { word: "Cozy", hint: "adjective", options: ["Cold and uncomfortable", "Comfortable and warm", "Very noisy", "Difficult and stressful"], answer: 1 },
  { word: "Thrive", hint: "verb", options: ["To struggle greatly", "To grow and do well", "To sleep deeply", "To move slowly"], answer: 1 },
  { word: "Gloomy", hint: "adjective", options: ["Bright and cheerful", "Dark and sad", "Very exciting", "Extremely clean"], answer: 1 },
  { word: "Eager", hint: "adjective", options: ["Bored and uninterested", "Very keen and enthusiastic", "Slow and cautious", "Quiet and shy"], answer: 1 },
  { word: "Fragile", hint: "adjective", options: ["Very strong and tough", "Easily broken or damaged", "Extremely large", "Loud and confident"], answer: 1 },
  { word: "Wander", hint: "verb", options: ["To stay in one place", "To walk without a fixed direction", "To sleep outdoors", "To eat quickly"], answer: 1 },
  { word: "Sincere", hint: "adjective", options: ["Dishonest and fake", "Genuine and honest", "Very lazy", "Quite rude"], answer: 1 },
  { word: "Scarce", hint: "adjective", options: ["Very common and plentiful", "Available in small amounts", "Extremely large", "Very loud"], answer: 1 },
  { word: "Triumph", hint: "noun", options: ["A great failure", "A great victory or success", "A long journey", "A delicious meal"], answer: 1 },
  { word: "Blissful", hint: "adjective", options: ["Angry and upset", "Perfectly happy and content", "Very cold", "Quite tired"], answer: 1 },
  { word: "Discard", hint: "verb", options: ["To keep carefully", "To throw away as useless", "To repair something", "To find something lost"], answer: 1 },
  { word: "Tranquil", hint: "adjective", options: ["Loud and chaotic", "Calm and peaceful", "Very dark", "Extremely busy"], answer: 1 },
  { word: "Cunning", hint: "adjective", options: ["Honest and open", "Clever in a sneaky way", "Very slow", "Extremely kind"], answer: 1 },
  { word: "Abundant", hint: "adjective", options: ["Very scarce", "Available in large quantities", "Quite boring", "Very small"], answer: 1 },
  { word: "Cherish", hint: "verb", options: ["To ignore or neglect", "To hold dear and care for", "To break apart", "To forget forever"], answer: 1 },
  { word: "Dreadful", hint: "adjective", options: ["Wonderful and amazing", "Very bad or unpleasant", "Quite comfortable", "Slightly cold"], answer: 1 },
];

const ALL_SENTENCE_BUILDER = [
  { prompt: "Make a sentence about daily routine.", words: ["every", "morning", "I", "drink", "coffee", "before", "work"], answer: "I drink coffee before work every morning" },
  { prompt: "Describe what someone is doing.", words: ["she", "is", "reading", "a", "book", "in", "the", "garden"], answer: "she is reading a book in the garden" },
  { prompt: "Talk about the past.", words: ["yesterday", "we", "went", "to", "the", "beach", "together"], answer: "yesterday we went to the beach together" },
  { prompt: "Make a question.", words: ["where", "did", "you", "buy", "that", "beautiful", "hat"], answer: "where did you buy that beautiful hat" },
  { prompt: "Describe the weather.", words: ["it", "was", "raining", "heavily", "all", "day", "long"], answer: "it was raining heavily all day long" },
  { prompt: "Express a preference.", words: ["I", "prefer", "tea", "to", "coffee", "in", "the", "winter"], answer: "I prefer tea to coffee in the winter" },
  { prompt: "Talk about a plan.", words: ["we", "are", "going", "to", "visit", "the", "museum", "tomorrow"], answer: "we are going to visit the museum tomorrow" },
  { prompt: "Describe a place.", words: ["the", "park", "near", "our", "house", "is", "very", "beautiful"], answer: "the park near our house is very beautiful" },
  { prompt: "Make a polite request.", words: ["could", "you", "please", "pass", "me", "the", "salt"], answer: "could you please pass me the salt" },
  { prompt: "Talk about an experience.", words: ["I", "have", "never", "eaten", "sushi", "before", "today"], answer: "I have never eaten sushi before today" },
  { prompt: "Describe a feeling.", words: ["she", "felt", "very", "nervous", "before", "her", "job", "interview"], answer: "she felt very nervous before her job interview" },
  { prompt: "Give advice.", words: ["you", "should", "drink", "more", "water", "every", "day"], answer: "you should drink more water every day" },
  { prompt: "Describe a habit.", words: ["he", "always", "reads", "the", "news", "after", "breakfast"], answer: "he always reads the news after breakfast" },
  { prompt: "Make a comparison.", words: ["this", "book", "is", "more", "interesting", "than", "that", "one"], answer: "this book is more interesting than that one" },
  { prompt: "Talk about the future.", words: ["I", "will", "call", "you", "as", "soon", "as", "I", "arrive"], answer: "I will call you as soon as I arrive" },
  { prompt: "Describe a problem.", words: ["the", "train", "was", "late", "so", "we", "missed", "the", "show"], answer: "the train was late so we missed the show" },
  { prompt: "Express surprise.", words: ["I", "cannot", "believe", "how", "fast", "the", "time", "has", "passed"], answer: "I cannot believe how fast the time has passed" },
  { prompt: "Describe an action in progress.", words: ["they", "are", "building", "a", "new", "school", "near", "the", "park"], answer: "they are building a new school near the park" },
  { prompt: "Talk about a rule.", words: ["you", "must", "not", "use", "your", "phone", "during", "class"], answer: "you must not use your phone during class" },
  { prompt: "Describe something you like.", words: ["I", "really", "enjoy", "walking", "by", "the", "river", "at", "sunset"], answer: "I really enjoy walking by the river at sunset" },
];

const ALL_FILL_STORIES = [
  {
    story: "The old lighthouse stood at the [BLANK1] of the rocky cliff, watching over the sea. Every evening, the lighthouse keeper would [BLANK2] the great lamp to guide ships safely home. One [BLANK3] night, a fierce storm rolled in from the north. The winds were [BLANK4] and the rain lashed the windows. Despite the danger, the keeper remained [BLANK5], knowing sailors depended on that steady beam of light.",
    blanks: [{ id: "BLANK1", answer: "edge" }, { id: "BLANK2", answer: "light" }, { id: "BLANK3", answer: "stormy" }, { id: "BLANK4", answer: "fierce" }, { id: "BLANK5", answer: "calm" }],
    wordBank: ["edge", "light", "stormy", "fierce", "calm", "soft", "center", "dark", "extinguish", "gentle"],
  },
  {
    story: "Maria woke up early on the [BLANK1] morning of her first day at university. Her heart was [BLANK2] with excitement as she packed her bag. The campus was [BLANK3] with students from all over the world. She found a seat in the lecture hall and [BLANK4] her notebook, ready to learn. By the end of the day, she had already made two [BLANK5] friends.",
    blanks: [{ id: "BLANK1", answer: "bright" }, { id: "BLANK2", answer: "filled" }, { id: "BLANK3", answer: "crowded" }, { id: "BLANK4", answer: "opened" }, { id: "BLANK5", answer: "wonderful" }],
    wordBank: ["bright", "filled", "crowded", "opened", "wonderful", "dark", "empty", "closed", "bored", "terrible"],
  },
  {
    story: "Every winter, the small village held a [BLANK1] festival that lasted an entire week. The streets were decorated with [BLANK2] lanterns that glowed in the cold night air. Families gathered around fire pits to share [BLANK3] soup and stories from the past year. The children's favourite part was the puppet show performed by a [BLANK4] old man who had done it for decades. At midnight, everyone would [BLANK5] and watch the fireworks light up the sky.",
    blanks: [{ id: "BLANK1", answer: "traditional" }, { id: "BLANK2", answer: "colourful" }, { id: "BLANK3", answer: "hot" }, { id: "BLANK4", answer: "talented" }, { id: "BLANK5", answer: "gather" }],
    wordBank: ["traditional", "colourful", "hot", "talented", "gather", "modern", "plain", "cold", "clumsy", "scatter"],
  },
  {
    story: "The small bakery on the corner had a [BLANK1] smell that drifted down the whole street. Every morning, the baker would [BLANK2] fresh loaves of bread and arrange them in the window. Customers would form a [BLANK3] line outside the door before it even opened. The most [BLANK4] item was a golden croissant dusted with sugar. People said it tasted like a [BLANK5] dream.",
    blanks: [{ id: "BLANK1", answer: "delicious" }, { id: "BLANK2", answer: "bake" }, { id: "BLANK3", answer: "long" }, { id: "BLANK4", answer: "popular" }, { id: "BLANK5", answer: "sweet" }],
    wordBank: ["delicious", "bake", "long", "popular", "sweet", "horrible", "burn", "short", "forgotten", "bitter"],
  },
  {
    story: "The explorer had been [BLANK1] through the jungle for three days when she finally spotted the ancient ruins. The stone walls were [BLANK2] with vines and moss. She [BLANK3] her hand over the carved symbols, wondering what they meant. Inside the main chamber, a shaft of [BLANK4] light fell through a hole in the ceiling. She felt a deep [BLANK5] that she had discovered something extraordinary.",
    blanks: [{ id: "BLANK1", answer: "travelling" }, { id: "BLANK2", answer: "covered" }, { id: "BLANK3", answer: "ran" }, { id: "BLANK4", answer: "golden" }, { id: "BLANK5", answer: "certainty" }],
    wordBank: ["travelling", "covered", "ran", "golden", "certainty", "resting", "bare", "threw", "pale", "doubt"],
  },
  {
    story: "The library was [BLANK1] except for the soft ticking of the clock on the wall. Leo had spent every afternoon there since moving to the new town, finding [BLANK2] among the shelves. He [BLANK3] a book about astronomy and settled into his favourite armchair. As the afternoon light grew [BLANK4], he lost track of time completely. When the librarian finally tapped his shoulder, he [BLANK5] with surprise.",
    blanks: [{ id: "BLANK1", answer: "silent" }, { id: "BLANK2", answer: "comfort" }, { id: "BLANK3", answer: "chose" }, { id: "BLANK4", answer: "dim" }, { id: "BLANK5", answer: "jumped" }],
    wordBank: ["silent", "comfort", "chose", "dim", "jumped", "noisy", "loneliness", "refused", "bright", "slept"],
  },
  {
    story: "The rescue dog arrived at the shelter looking [BLANK1] and frightened. The volunteers worked [BLANK2] to earn her trust, offering food and gentle words. Within a week, her tail began to [BLANK3] when anyone entered the room. A family came to [BLANK4] a dog and immediately fell in love with her soft brown eyes. On the day she left, every volunteer felt both [BLANK5] and overjoyed.",
    blanks: [{ id: "BLANK1", answer: "thin" }, { id: "BLANK2", answer: "patiently" }, { id: "BLANK3", answer: "wag" }, { id: "BLANK4", answer: "adopt" }, { id: "BLANK5", answer: "sad" }],
    wordBank: ["thin", "patiently", "wag", "adopt", "sad", "healthy", "rudely", "droop", "abandon", "angry"],
  },
];

function getDailyData(seed) {
  const rng1 = makePRNG(seed ^ 0xabc1);
  const rng2 = makePRNG(seed ^ 0xdef2);
  const rng3 = makePRNG(seed ^ 0x1234);
  const storyIdx = Math.floor(rng3() * ALL_FILL_STORIES.length);

  return {
    wordMatch: seededShuffle(ALL_WORD_MATCH, rng1).slice(0, 6),
    sentenceBuilder: seededShuffle(ALL_SENTENCE_BUILDER, rng2).slice(0, 5),
    fillStory: ALL_FILL_STORIES[storyIdx],
  };
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

const GAME_CARDS = [
  { id: 0, level: "beginner", tag: "Beginner", title: "🎯 Word Match", modalTitle: "🎯 Word Match", desc: "See a word and choose the correct definition. Build your vocabulary one word at a time.", time: "~2 min" },
  { id: 1, level: "intermediate", tag: "Intermediate", title: "🧩 Sentence Builder", modalTitle: "🧩 Sentence Builder", desc: "Arrange scrambled words into correct sentences. Practice grammar and word order.", time: "~3 min" },
  { id: 2, level: "advanced", tag: "Advanced", title: "📖 Fill the Story", modalTitle: "📖 Fill the Story", desc: "Complete a short story by choosing the right word for each blank. Test context and nuance.", time: "~4 min" },
];
const GAME_POINTS = { 0: 5, 1: 10, 2: 15 };
const PERFECT_DAY_BONUS_POINTS = 10;

const INITIAL_PROGRESS = { completed: [false, false, false], scores: [0, 0, 0], reviewDetails: { 0: [], 1: [], 2: [] } };
const ARCHIVE_KEY = "wordplay-game-archive";
const ACTIVE_SESSION_KEY_PREFIX = "wordplay-active-session-";
const LEGACY_ACCOUNT_KEY = "wordplay-account";
const ACCOUNTS_KEY = "wordplay-accounts";
const SESSION_KEY = "wordplay-current-user";

function formatArchiveDate(key) {
  if (!/^\d{8}$/.test(key)) return key;
  const year = key.slice(0, 4);
  const month = key.slice(4, 6);
  const day = key.slice(6, 8);
  const dt = new Date(`${year}-${month}-${day}T12:00:00`);
  return dt.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function getResultSummary(score, total) {
  const pct = total === 0 ? 0 : score / total;
  return {
    stars: pct === 1 ? "🌟" : pct >= 0.7 ? "🎉" : "💪",
    title: pct === 1 ? "Perfect score!" : pct >= 0.7 ? "Well done!" : "Keep practicing!",
    msg:
      pct === 1
        ? "You got every answer right. Impressive!"
        : pct >= 0.7
          ? "Good job! A little more practice and you'll be perfect."
          : "Don't give up — every attempt makes you better!",
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
  const todayKey = useMemo(() => getTodayKey(), []);
  const dailySeed = useMemo(() => parseInt(todayKey, 10), [todayKey]);
  const gameData = useMemo(() => getDailyData(dailySeed), [dailySeed]);
  const progressKey = `wordplay-progress-${todayKey}`;
  const activeSessionKey = `${ACTIVE_SESSION_KEY_PREFIX}${todayKey}`;
  const dateLabel = useMemo(
    () => new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }),
    [],
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
  const [currentUserEmail, setCurrentUserEmail] = useState(() => {
    try {
      return localStorage.getItem(SESSION_KEY) || "";
    } catch {
      return "";
    }
  });
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
  const [statsOpen, setStatsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [statsScope, setStatsScope] = useState("all");
  const [settingsStudentCode, setSettingsStudentCode] = useState("");
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
    if (currentUserEmail) localStorage.setItem(SESSION_KEY, currentUserEmail);
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
    document.body.style.overflow = modalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timer = setTimeout(() => setToastMessage(""), 2600);
    return () => clearTimeout(timer);
  }, [toastMessage]);

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
      setToastMessage("No archive saved yet. Come back tomorrow for your first archive entry.");
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
      setAuthError("Please fill in email, password, and confirm password.");
      return;
    }
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailIsValid) {
      setAuthError("Please enter a valid email address.");
      return;
    }
    if (!isStrongPassword(authPassword)) {
      setAuthError("Your password is not strong enough. Please follow all password rules.");
      return;
    }
    if (authPassword !== authConfirmPassword) {
      setAuthError("Passwords do not match. Please re-enter them.");
      return;
    }
    const alreadyExists = accounts.some((acct) => acct.email === email);
    if (alreadyExists) {
      setAuthError("An account with this email already exists. Please sign in.");
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
      setAuthError("Please enter both email and password.");
      return;
    }
    if (accounts.length === 0) {
      setAuthError("No account found. Please sign up first.");
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
    setAuthError("Invalid email or password.");
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
    setToastMessage(normalizedStudentCode ? "Classroom code updated." : "Classroom code cleared.");
    setSettingsOpen(false);
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}&quote=${encodeURIComponent(inviteMessage)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCopyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteMessage);
      setToastMessage("Invite message copied! Share it with your friend.");
    } catch {
      setToastMessage("Could not copy automatically. Please copy and share manually.");
    }
  };

  const handleSendText = () => {
    if (!isMobileDevice()) {
      setToastMessage("Send text is available on mobile devices only.");
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

    setToastMessage(`🏆 Achievement unlocked! Perfect score in all 3 games today. +${PERFECT_DAY_BONUS_POINTS} bonus points!`);
  }, [currentUser, progress, todayKey, gameTotals]);

  const openReview = (gameId) => {
    const total = gameTotals[gameId];
    const score = progress.scores[gameId] || 0;
    const summary = getResultSummary(score, total);
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
    const summary = getResultSummary(score, total);

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
            yourAnswer: fs.inputs[i].trim() || "(blank)",
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

  return (
    <div className="wordplay-app">
      <nav>
        <a className="nav-logo" href="#">
          <img src={logoImage} alt="English Everyday Play logo" className="nav-logo-icon" />
          <span className="logo-desktop">English Everyday</span>
        </a>
        <div className="nav-progress">
          <div className="progress-track" aria-label="Daily game completion progress">
            <div
              className={`progress-fill progress-${completedCount}`}
              style={{ width: `${(completedCount / 3) * 100}%` }}
            />
            {completedCount === 3 && <span className="progress-check">✓</span>}
          </div>
          {currentUser && (
            <div className="points-menu-wrap">
              <button className="points-pill profile-trigger" onClick={() => setProfileMenuOpen((prev) => !prev)} type="button">
                <span>⭐ {currentUser.points || 0} pts</span>
                <span className="pill-icons">☰</span>
              </button>
              {profileMenuOpen && (
                <div className="profile-menu">
                  <button className="profile-menu-item" onClick={openStats} type="button">
                    My Stats
                  </button>
                  <button
                    className="profile-menu-item"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      openArchive();
                    }}
                    type="button"
                  >
                    Archive
                  </button>
                  <button className="profile-menu-item" onClick={openSettings} type="button">
                    Settings
                  </button>
                  <button className="profile-menu-item" onClick={handleSignout} type="button">
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <header>
        <div className="eyebrow">English Everyday.</div>
        <h1>Daily English Games &amp; Puzzles</h1>
        <p>Three quick games to practice vocabulary, grammar, and writing in minutes.</p>
        <p className="header-date">📅 {dateLabel} · New content every day</p>
      </header>

      <div className="games-grid">
        {GAME_CARDS.map((game) => (
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
                    Score: {progress.scores[game.id] || 0}/{gameTotals[game.id]}
                  </span>
                  <button
                    className="play-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      openReview(game.id);
                    }}
                    type="button"
                  >
                    Review
                  </button>
                  <button
                    className="btn-secondary card-archive-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      openArchive();
                    }}
                    type="button"
                  >
                    See Archive
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
                    {activeSessions[game.id] ? "Resume" : "Play →"}
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
          🗂️ View Archive
        </button>
        <button className="btn-primary invite-btn" onClick={() => setInviteOpen(true)} type="button">
          Invite friend to play
        </button>
      </div>

      <footer>Your progress is saved on this device. New questions appear every day - come back tomorrow! 🗓️</footer>

      {settingsOpen && currentUser && (
        <div className="result-page">
          <div className="result-page-header">
            <button className="btn-secondary" onClick={() => setSettingsOpen(false)} type="button">
              ← Back to Homepage
            </button>
          </div>
          <div className="result-page-content">
            <div className="result-screen show stats-page-content">
              <div className="result-icon">⚙️</div>
              <h3>Settings</h3>
              <p>Manage your account preferences and classroom grouping.</p>
              <div className="settings-panel">
                <label className="auth-label" htmlFor="settings-student-code">
                  Classroom / Student Code
                </label>
                <input
                  id="settings-student-code"
                  className="auth-input"
                  type="text"
                  value={settingsStudentCode}
                  onChange={(e) => setSettingsStudentCode(e.target.value)}
                  placeholder="e.g. CLASS-7A"
                />
                <div className="settings-help">Use this code to join a classroom leaderboard. Leave blank to remove.</div>
                <div className="settings-actions">
                  <button className="btn-secondary" onClick={() => setSettingsOpen(false)} type="button">
                    Cancel
                  </button>
                  <button className="btn-primary" onClick={saveSettings} type="button">
                    Save
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
              ← Back to Homepage
            </button>
          </div>
          <div className="result-page-content">
            <div className="result-screen show stats-page-content">
              <div className="result-icon">📊</div>
              <h3>My Stats</h3>
              <p>Track your progress and ranking against other players on this device.</p>
              <div className="stats-grid">
                <div className="stats-card">
                  <div className="stats-label">Total Points</div>
                  <div className="stats-value">⭐ {currentUser.points || 0}</div>
                </div>
                <div className="stats-card">
                  <div className="stats-label">Ranking</div>
                  <div className="stats-value">
                    {currentRank ? `#${currentRank} of ${totalUsers}` : "N/A"}
                  </div>
                </div>
                <div className="stats-card">
                  <div className="stats-label">Top Percentile</div>
                  <div className="stats-value">{percentile ? `${percentile}%` : "N/A"}</div>
                </div>
                <div className="stats-card">
                  <div className="stats-label">Perfect Days</div>
                  <div className="stats-value">🏆 {perfectDays}</div>
                </div>
              </div>
              <div className="stats-subheading">Leaderboard (this device)</div>
              {usingDemoLeaderboardFill && (
                <div className="stats-note">
                  Sample learner profiles are shown until {MIN_LEADERBOARD_USERS}+ real accounts exist on this device. Your stats are real.
                </div>
              )}
              <div className="stats-toggle-row">
                <button
                  className={`btn-secondary stats-toggle-btn ${statsScope === "all" ? "active" : ""}`}
                  onClick={() => setStatsScope("all")}
                  type="button"
                >
                  All Players
                </button>
                <button
                  className={`btn-secondary stats-toggle-btn ${statsScope === "classroom" ? "active" : ""}`}
                  onClick={() => setStatsScope("classroom")}
                  type="button"
                  disabled={!classroomCode}
                >
                  My Classroom
                </button>
              </div>
              {!classroomCode && <div className="stats-note">Add a student code at signup to unlock classroom rankings.</div>}
              <div className="leaderboard-list">
                {displayedLeaderboard.length === 0 ? (
                  <div className="leaderboard-empty">
                    {statsScope === "classroom" ? "No classmates found yet for this student code." : "No players yet."}
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
                        {acct.isDemo && <span className="demo-badge">Sample</span>}
                      </span>
                      <span className="leaderboard-points">{acct.points || 0} pts</span>
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
              ← Back to Homepage
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
                  <h4>Story Review</h4>
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
                  <h4>Questions to Review</h4>
                  {resultState.wrongAnswers && resultState.wrongAnswers.length > 0 ? (
                    resultState.wrongAnswers.map((item, idx) => (
                      <div className="review-wrong-item" key={`${item.prompt}-${idx}`}>
                        <div className="review-prompt">{item.prompt}</div>
                        <div className="review-line">
                          <strong>Your answer:</strong> <span className="your-answer-text">{item.yourAnswer}</span>
                        </div>
                        <div className="review-line">
                          <strong>Correct answer:</strong> <span className="correct-answer-text">{item.correctAnswer}</span>
                        </div>
                      </div>
                    ))
                  ) : resultState.allAnswers && resultState.allAnswers.length > 0 ? (
                    <div className="review-empty-note">No mistakes in this game - excellent work!</div>
                  ) : (
                    <div className="review-empty-note">
                      Detailed question review is available for games completed after this update. Complete a new game to see detailed mistakes and answers here.
                    </div>
                  )}
                </div>
              )}
              <div className="result-actions">
                <button className="btn-secondary" onClick={openArchive} type="button">
                  See Archive
                </button>
                <button className="btn-primary" onClick={backToHomepage} type="button">
                  Back to Homepage
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
              <h3>{currentGame >= 0 ? GAME_CARDS[currentGame].modalTitle : "Game"}</h3>
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
                    Question {wm.current + 1} of {wm.questions.length}
                  </span>
                  <span className="score-pill">
                    Score: {wm.score}/{wm.questions.length}
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
                  Next →
                </button>
              </>
            )}

            {currentGame === 1 && sb && sbQuestion && (
              <>
                <div className="score-bar">
                  <span>
                    Question {sb.current + 1} of {sb.questions.length}
                  </span>
                  <span className="score-pill">
                    Score: {sb.score}/{sb.questions.length}
                  </span>
                </div>
                <div className="sentence-prompt">📝 {sbQuestion.prompt}</div>
                <div className="sentence-area">
                  {sb.built.length === 0 && <span className="placeholder-text">Tap words below to build your sentence...</span>}
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
                  Check Sentence
                </button>
                <button className={`next-btn ${sb.checked ? "show" : ""}`} onClick={onSbNext} type="button">
                  Next →
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
                <div className="word-bank-label">Word Bank - tap a word to fill the next blank</div>
                <div className="hint-chips">
                  {fs.data.wordBank.map((word) => (
                    <button key={word} className={`hint-chip ${fs.used.includes(word) ? "used" : ""}`} onClick={() => onFsPickWord(word)} type="button">
                      {word}
                    </button>
                  ))}
                </div>
                <div className={`feedback-msg ${fs.feedbackKind}`}>{fs.feedback}</div>
                <button className="submit-story-btn" onClick={onFsSubmit} type="button">
                  Check My Story ✓
                </button>
                <button className={`next-btn ${fs.submitted ? "show" : ""}`} onClick={onFsResult} type="button">
                  See Results →
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
              <h3>{authMode === "signup" ? "Create Account to Access Archive" : "Sign In to Access Archive"}</h3>
            </div>
            <button className="modal-close" onClick={closeAuth} type="button">
              ✕
            </button>
          </div>
          <div className="modal-body auth-body">
            <label className="auth-label" htmlFor="archive-email">
              Email
            </label>
            <input id="archive-email" className="auth-input" type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} />
            <label className="auth-label" htmlFor="archive-password">
              Password
            </label>
            <input id="archive-password" className="auth-input" type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} />
            {authMode === "signup" && (
              <>
                <label className="auth-label" htmlFor="student-code">
                  Student Code (optional)
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
                  Confirm Password
                </label>
                <input
                  id="archive-confirm-password"
                  className="auth-input"
                  type="password"
                  value={authConfirmPassword}
                  onChange={(e) => setAuthConfirmPassword(e.target.value)}
                />
                <div className="auth-hint">
                  Use a strong password with all of these:
                  <ul className="password-rules">
                    <li className={passwordChecks.minLength ? "rule-pass" : ""}>At least 8 characters</li>
                    <li className={passwordChecks.uppercase ? "rule-pass" : ""}>At least 1 uppercase letter (A-Z)</li>
                    <li className={passwordChecks.lowercase ? "rule-pass" : ""}>At least 1 lowercase letter (a-z)</li>
                    <li className={passwordChecks.number ? "rule-pass" : ""}>At least 1 number (0-9)</li>
                    <li className={passwordChecks.special ? "rule-pass" : ""}>At least 1 special character (e.g. !@#$)</li>
                  </ul>
                </div>
              </>
            )}
            {authError && <div className="auth-error">{authError}</div>}
            <div className="auth-actions">
              {authMode === "signup" ? (
                <>
                  <button className="btn-primary" onClick={handleSignup} type="button">
                    Sign Up
                  </button>
                  <button className="btn-secondary" onClick={() => switchAuthMode("signin")} type="button">
                    I already have an account
                  </button>
                </>
              ) : (
                <>
                  <button className="btn-primary" onClick={handleSignin} type="button">
                    Sign In
                  </button>
                  <button className="btn-secondary" onClick={() => switchAuthMode("signup")} type="button">
                    Create new account
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
              <h3>🗂️ Game Archive</h3>
            </div>
            <button className="modal-close" onClick={() => setArchiveOpen(false)} type="button">
              ✕
            </button>
          </div>
          <div className="modal-body archive-body">
            {previousArchiveKeys.length === 0 ? (
              <p>No previous days saved yet. Come back tomorrow to see your archive.</p>
            ) : (
              previousArchiveKeys.map((key) => {
                const day = archiveData[key];
                return (
                  <div className="archive-item" key={key}>
                    <h4>{formatArchiveDate(key)}</h4>
                    <ul>
                      <li>🎯 Word Match: {day.wordMatch.length} questions</li>
                      <li>🧩 Sentence Builder: {day.sentenceBuilder.length} questions</li>
                      <li>📖 Fill the Story: 1 story set</li>
                    </ul>
                  </div>
                );
              })
            )}
            <div className="archive-actions">
              <button className="btn-secondary" onClick={handleSignout} type="button">
                Sign Out
              </button>
              <button className="btn-primary" onClick={() => setArchiveOpen(false)} type="button">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className={`modal-overlay ${inviteOpen ? "open" : ""}`} onClick={(e) => e.target === e.currentTarget && setInviteOpen(false)}>
        <div className="modal invite-modal">
          <div className="modal-header">
            <div>
              <h3>Invite Friend to Play</h3>
            </div>
            <button className="modal-close" onClick={() => setInviteOpen(false)} type="button">
              ✕
            </button>
          </div>
          <div className="modal-body invite-body">
            <p className="invite-message-preview">{inviteMessage}</p>
            <div className="invite-actions">
              <button className="btn-secondary" onClick={handleShareFacebook} type="button">
                Share to Facebook
              </button>
              <button className="btn-secondary" onClick={handleCopyInviteLink} type="button">
                Copy Link
              </button>
              <button className="btn-primary" onClick={handleSendText} type="button">
                Send Text
              </button>
            </div>
            {!isMobileDevice() && <p className="invite-note">Send text works on mobile devices only.</p>}
          </div>
        </div>
      </div>
      {toastMessage && (
        <div className="toast" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </div>
  );
}