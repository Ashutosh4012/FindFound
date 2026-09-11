import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import heroIllustration from "./assets/hero-illustration.jpg";

const API_URL = "https://your-render-backend.onrender.com/api";

const emptyRegister = {
  name: "",
  email: "",
  studentId: "",
  password: "",
};

const emptyLogin = {
  email: "",
  password: "",
};

const emptyReport = {
  title: "",
  description: "",
  category: "",
  location: "",
  date: "",
  image: "",
};

function Icon({ children }) {
  return <span className="icon">{children}</span>;
}

/**
 * Client-side lightweight image compressor & optimizer.
 * Proportionally resizes images to max 1000px and converts to high-efficiency JPEG
 * to keep payload sizes minimal (~50-120KB) for instant loading and well-structured display.
 */
function compressImageFile(file, maxWidth = 1000, maxHeight = 1000, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      return reject(new Error("Please select a valid image file (PNG, JPG, WEBP, GIF)."));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the selected image file."));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not parse image data."));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = file.type === "image/png" ? "image/jpeg" : file.type;
        const dataUrl = canvas.toDataURL(mimeType, quality);
        const approxBytes = Math.round((dataUrl.length * 3) / 4);
        const sizeKb = Math.round(approxBytes / 1024);

        resolve({
          dataUrl,
          sizeKb,
          width,
          height,
          name: file.name,
        });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/* =========================================================
   FINDFOUND AI ASSISTANT - KNOWLEDGE BASE
========================================================= */

function getClientBotReply(userQuery = "") {
  const query = (userQuery || "").toLowerCase().trim();

  // 1. Founder & Creator
  if (
    query.includes("founder") ||
    query.includes("who made") ||
    query.includes("who created") ||
    query.includes("ashutosh") ||
    query.includes("panda") ||
    query.includes("creator") ||
    query.includes("author") ||
    query.includes("owner") ||
    query.includes("developed by") ||
    query.includes("who build") ||
    query.includes("who built") ||
    query.includes("who started")
  ) {
    return {
      reply: `👑 **Founder of FindFound**\n\nFindFound (also known as FindBack) was founded and developed by **Ashutosh Panda**, a student innovator and software engineer from **Chandigarh University (CU)**! 🎓\n\nAshutosh conceptualized and built FindFound to solve the widespread campus challenge of lost belongings—such as student ID cards, laptops, chargers, keys, wallets, and bags.\n\nHis goal was to replace scattered WhatsApp or Telegram groups with a dedicated, intelligent campus platform featuring **AI Smart Matching** and **direct real-time chat** between finders and owners.`,
      quickReplies: [
        "❓ How do I use FindFound?",
        "🤖 How does AI matching work?",
        "🏫 FindFound @ Chandigarh University",
        "💬 How to chat with a finder?",
      ],
    };
  }

  // 2. Chandigarh University context
  if (
    query.includes("chandigarh university") ||
    query.includes(" cu ") ||
    query.startsWith("cu") ||
    query.includes("campus") ||
    query.includes("university") ||
    query.includes("gharuan") ||
    query.includes("college")
  ) {
    return {
      reply: `🏫 **FindFound @ Chandigarh University (CU)**\n\nFindFound was built right here for the **Chandigarh University** campus community by CU student **Ashutosh Panda**.\n\nStudents and faculty across all academic blocks (Block A, B, C, D), libraries, sports arenas, food courts, and campus hostels can report lost items or report items they found with specific CU location tags.\n\nOur system matches items across campus in seconds so nothing stays lost for long!`,
      quickReplies: [
        "🔍 How to report a lost item?",
        "📦 How to report a found item?",
        "👑 Who is the founder?",
        "🛡️ Campus safety tips",
      ],
    };
  }

  // 3. How to report lost item
  if (
    query.includes("report lost") ||
    query.includes("lost item") ||
    query.includes("lost my") ||
    query.includes("i lost") ||
    query.includes("missing")
  ) {
    return {
      reply: `🔍 **How to Report a Lost Item**:\n\n1. Click the purple **'+ Report Lost'** button on the dashboard or top navigation.\n2. Enter the **Title** (e.g., *Black HP Laptop Sleeve* or *CU Student ID Card*).\n3. Select the relevant **Category** (Electronics, Bags, IDs & Cards, Keys, Books, etc.).\n4. Specify the **Location** where you last had it (e.g., *Block B Library 1st Floor*).\n5. Pick the **Date** and upload a clear photo or image URL if you have one.\n6. Click **Submit Report**!\n\n💡 *FindFound's AI will immediately cross-reference all existing found reports and highlight high-confidence matches on your dashboard!*`,
      quickReplies: [
        "🤖 How does AI matching work?",
        "💬 How to chat with a finder?",
        "🛡️ Safety tips for recovery",
      ],
    };
  }

  // 4. How to report found item
  if (
    query.includes("report found") ||
    query.includes("found item") ||
    query.includes("found an item") ||
    query.includes("i found") ||
    query.includes("found someone")
  ) {
    return {
      reply: `📦 **How to Report a Found Item**:\n\n1. Click the green **'+ Report Found'** button on your dashboard.\n2. Enter a clear description of what you found and upload a photo so the owner can recognize it.\n3. Mention where and when you found it (e.g., *Food Court Table 12, 2:30 PM*).\n4. Click **Submit Report**.\n\nOnce submitted, the rightful owner will be able to discover your post or get matched by our AI. They can click **'Chat with Finder'** to reach out and safely verify ownership!`,
      quickReplies: [
        "💬 How to chat with a finder?",
        "🛡️ Safe handover guidelines",
        "❓ How does FindFound work?",
      ],
    };
  }

  // 5. How AI matching works
  if (
    query.includes("ai match") ||
    query.includes("smart match") ||
    query.includes("how ai") ||
    query.includes("algorithm") ||
    query.includes("accuracy") ||
    query.includes("confidence") ||
    query.includes("score")
  ) {
    return {
      reply: `🤖 **How AI Smart Matching Works**:\n\nFindFound features an automated Smart Matching Engine:\n• **Semantic Keyword Correlation**: Analyzes titles, descriptions, brands, and colors.\n• **Category & Proximity Clustering**: Matches lost and found items reported in the same campus block or time window.\n• **Confidence Score**: Calculates a match rating (e.g. *92% High Match*) and presents them side-by-side in your dashboard's AI section.\n• **Instant 1-Click Connect**: From the AI match card, click **'Chat with Finder'** to coordinate directly with the student holding the item!`,
      quickReplies: [
        "💬 How to chat with a finder?",
        "👑 Who is the founder?",
        "🔍 How to report a lost item?",
      ],
    };
  }

  // 6. Chat and Messaging
  if (
    query.includes("chat") ||
    query.includes("message") ||
    query.includes("talk") ||
    query.includes("contact") ||
    query.includes("inbox") ||
    query.includes("conversation")
  ) {
    return {
      reply: `💬 **Direct Chat with Item Finder**:\n\n• Browse the dashboard or AI matches and find the relevant item.\n• Click the **'Chat with Finder'** or **'💬'** icon on that item card.\n• A direct 1-to-1 private chat opens with the finder.\n• You can message each other in real time, confirm details (e.g. wallpaper, ID serial, specific marks), and arrange a meeting spot.\n• Both users receive instant notifications when messages arrive!`,
      quickReplies: [
        "🔔 How do notifications work?",
        "🛡️ Safety tips for item recovery",
        "🔍 How to report a lost item?",
      ],
    };
  }

  // 7. Notifications
  if (
    query.includes("notification") ||
    query.includes("alert") ||
    query.includes("bell") ||
    query.includes("toast")
  ) {
    return {
      reply: `🔔 **Real-Time Notifications**:\n\n• Look at the bell icon at the top right of your dashboard header.\n• When someone messages you, a live purple badge displays your unread count.\n• A floating popup notification slides in immediately.\n• Click the bell to view all recent alerts or click any alert to open the conversation directly!`,
      quickReplies: [
        "💬 How to chat with a finder?",
        "❓ How does FindFound work?",
        "👑 Who is the founder?",
      ],
    };
  }

  // 8. Safety & Tips
  if (
    query.includes("safe") ||
    query.includes("safety") ||
    query.includes("scam") ||
    query.includes("fake") ||
    query.includes("tip") ||
    query.includes("handover") ||
    query.includes("meet") ||
    query.includes("verify")
  ) {
    return {
      reply: `🛡️ **Safe Campus Handover Guidelines**:\n\n1. **Verify Before Meeting**: Ask the claimant specific details only the true owner would know (e.g., phone lock screen wallpaper, sticker placement, or student registration number).\n2. **Meet in Daylight & Public Areas**: Hand over items in well-lit, public spots like the Academic Block reception, Student Center, or security guard post.\n3. **100% Free**: FindFound is completely free. Never pay or demand cash rewards for returning student property.\n4. **Bring a Friend**: If meeting in the evening, bring a friend or classmate along.`,
      quickReplies: [
        "💬 How to chat with a finder?",
        "🔍 How to report a lost item?",
        "👑 Who is the founder?",
      ],
    };
  }

  // 9. Account & Sign in / OTP
  if (
    query.includes("login") ||
    query.includes("sign in") ||
    query.includes("register") ||
    query.includes("signup") ||
    query.includes("otp") ||
    query.includes("password") ||
    query.includes("account") ||
    query.includes("student id")
  ) {
    return {
      reply: `🔐 **Account & Sign In**:\n\n• You can browse reports freely as a guest!\n• To report items or message finders, register with your **Name**, **Email**, **Student ID**, and password.\n• FindFound also supports secure email OTP verification to ensure all campus users are authentic.`,
      quickReplies: [
        "❓ How do I use FindFound?",
        "🔍 How to report a lost item?",
        "👑 Who is the founder?",
      ],
    };
  }

  // 10. How to use / What is FindFound
  if (
    query.includes("how to use") ||
    query.includes("how it works") ||
    query.includes("what is findfound") ||
    query.includes("what is findback") ||
    query.includes("help") ||
    query.includes("guide") ||
    query.includes("features") ||
    query.includes("start")
  ) {
    return {
      reply: `🚀 **How FindFound Works — Quick 4-Step Guide**:\n\n1️⃣ **Report an Item**: Click **'+ Report Lost'** or **'+ Report Found'** at the top. Add a title, category, campus location, date, and photo.\n2️⃣ **AI Smart Matching**: Our AI analyzes item descriptions and locations to automatically pair lost reports with found reports.\n3️⃣ **Direct Chat**: Click **'Chat with Finder'** or **'💬'** on any item to privately message the student who posted it.\n4️⃣ **Instant Alerts**: Receive real-time bell notifications whenever someone messages you.\n\n✨ Built by **Ashutosh Panda** from **Chandigarh University** to make campus recovery fast, safe, and automated!`,
      quickReplies: [
        "👑 Who is the founder?",
        "🔍 How to report a lost item?",
        "🤖 How does AI matching work?",
        "💬 How to chat with a finder?",
      ],
    };
  }

  // 11. Greetings
  if (
    query === "hi" ||
    query === "hello" ||
    query === "hey" ||
    query === "sup" ||
    query.startsWith("hi ") ||
    query.startsWith("hello ") ||
    query.startsWith("hey ") ||
    query.includes("good morning") ||
    query.includes("good evening") ||
    query.includes("good afternoon")
  ) {
    return {
      reply: `👋 Hello! I am your **FindFound AI Assistant**.\n\nI can help you navigate FindFound, answer questions about our founder **Ashutosh Panda** from **Chandigarh University**, or guide you on how to report lost items and message finders. What would you like to know?`,
      quickReplies: [
        "👑 Who is the founder?",
        "❓ How do I use FindFound?",
        "🔍 How to report a lost item?",
        "🤖 How does AI matching work?",
      ],
    };
  }

  // Default fallback
  return {
    reply: `I can help you with anything related to **FindFound**! 🌟\n\n• **Founder**: Founded by **Ashutosh Panda** from **Chandigarh University (CU)**.\n• **Lost & Found Reports**: Step-by-step reporting guides.\n• **AI Smart Matching**: How automated match scores work.\n• **Direct Chat**: How to message finders and coordinate recovery.\n• **Campus Safety**: Tips for verifying ownership and safe handovers.\n\nPick one of the quick options below or ask me in detail!`,
    quickReplies: [
      "👑 Who is the founder?",
      "❓ How do I use FindFound?",
      "🔍 How to report a lost item?",
      "📦 How to report a found item?",
      "🤖 How does AI matching work?",
    ],
  };
}

function App() {
  /* =====================================================
     USER
  ===================================================== */

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("token") || ""
  );

  /* Landing page theme state (light / dark) */
  const [landingTheme, setLandingTheme] = useState(() => {
    try {
      return localStorage.getItem("findback_theme") || "light";
    } catch {
      return "light";
    }
  });

  const toggleLandingTheme = () => {
    const nextTheme = landingTheme === "light" ? "dark" : "light";
    setLandingTheme(nextTheme);
    try {
      localStorage.setItem("findback_theme", nextTheme);
    } catch {}
  };

  /* =====================================================
     DATA
  ===================================================== */

  const [items, setItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [communityStats, setCommunityStats] = useState({
    activeStudents: 0,
    totalItems: 0,
    itemsFound: 0,
    itemsLost: 0,
    resolvedItems: 0,
  });

  /* =====================================================
     MODALS
  ===================================================== */

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);

  /* =====================================================
     FORMS
  ===================================================== */

  const [registerForm, setRegisterForm] =
    useState(emptyRegister);

  const [loginForm, setLoginForm] =
    useState(emptyLogin);

  const [reportForm, setReportForm] =
    useState(emptyReport);

  const [reportType, setReportType] =
    useState("LOST");

  /* =====================================================
     OTP
  ===================================================== */

  const [otpEmail, setOtpEmail] =
    useState("");

  const [otpCode, setOtpCode] =
    useState("");

  const [otpStep, setOtpStep] =
    useState("email");

  const [otpLoading, setOtpLoading] =
    useState(false);

  /* =====================================================
     SEARCH / FILTER
  ===================================================== */

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  /* =====================================================
     LOADING / ERROR
  ===================================================== */

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =====================================================
     CHAT / MESSAGING
  ===================================================== */

  const [activeChat, setActiveChat] = useState(null); // { item, otherUser }
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);
  const [chatText, setChatText] = useState("");

  /* =====================================================
     NOTIFICATIONS
  ===================================================== */

  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] =
    useState(0);
  const [showNotificationsDropdown, setShowNotificationsDropdown] =
    useState(false);
  const [toastNotification, setToastNotification] = useState(null);

  /* =====================================================
     AI CHATBOT (FINDFOUND ASSISTANT)
  ===================================================== */

  const [showAiBot, setShowAiBot] = useState(false);
  const [aiBotInput, setAiBotInput] = useState("");
  const [aiBotTyping, setAiBotTyping] = useState(false);
  const [aiBotMessages, setAiBotMessages] = useState([
    {
      id: "welcome-0",
      sender: "bot",
      text: "👋 Hi there! I'm your **FindFound AI Assistant**! 🎓\n\nI can answer questions about the platform, explain how to report lost or found items, explain our AI Smart Matching, or tell you all about our founder **Ashutosh Panda** from **Chandigarh University**.\n\nHow can I help you today?",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      quickReplies: [
        "👑 Who is the founder?",
        "❓ How do I use FindFound?",
        "🔍 How to report a lost item?",
        "📦 How to report a found item?",
        "🤖 How does AI matching work?",
        "💬 How to chat with a finder?",
        "🛡️ Safety tips for item recovery",
      ],
    },
  ]);

  /* =====================================================
     SAFE API RESPONSE
  ===================================================== */

  async function readResponse(response) {
    const text = await response.text();

    let data = {};

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          `Server returned an invalid response (${response.status}).`
        );
      }
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
          `Request failed with status ${response.status}.`
      );
    }

    return data;
  }

  /* =====================================================
     FETCH ALL REPORTS
  ===================================================== */

  async function fetchItems() {
    try {
      const response = await fetch(
        `${API_URL}/api/items`
      );

      const data = await readResponse(response);

      setItems(
        Array.isArray(data.items)
          ? data.items
          : []
      );
    } catch (err) {
      console.error("Fetch items:", err);

      setError(
        "Unable to load reports. Please make sure the backend is running."
      );
    }
  }

  /* =====================================================
     FETCH COMMUNITY STATS (LIVE COUNTERS)
  ===================================================== */

  async function fetchCommunityStats() {
    try {
      const response = await fetch(`${API_URL}/api/stats`);
      const data = await readResponse(response);
      if (data && data.success && data.stats) {
        setCommunityStats(data.stats);
      }
    } catch (err) {
      console.error("Fetch stats error:", err);
    }
  }

  /* =====================================================
     FETCH AI MATCHES
  ===================================================== */

  async function fetchMatches() {
    if (!token) {
      setMatches([]);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/matches`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await readResponse(response);

      setMatches(
        Array.isArray(data.matches)
          ? data.matches
          : []
      );
    } catch (err) {
      console.error(
        "Fetch matches:",
        err
      );
    }
  }

  /* =====================================================
     FETCH NOTIFICATIONS
  ===================================================== */

  async function fetchNotifications(showToastIfNew = false) {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) return;
      const data = await response.json();
      if (data.success) {
        if (
          showToastIfNew &&
          Array.isArray(data.notifications) &&
          data.notifications.length > 0
        ) {
          const newest = data.notifications[0];
          if (!newest.read) {
            setToastNotification(newest);
            setTimeout(() => {
              setToastNotification((prev) =>
                prev?._id === newest._id ? null : prev
              );
            }, 6000);
          }
        }
        setNotifications(data.notifications || []);
        setUnreadNotificationsCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Fetch notifications error:", err);
    }
  }

  /* =====================================================
     FETCH CHAT THREAD
  ===================================================== */

  async function fetchChatThread(itemId, otherUserId, silent = false) {
    if (!token || !itemId || !otherUserId) return;
    if (!silent) setChatLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/messages/thread?itemId=${itemId}&otherUserId=${otherUserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) return;
      const data = await response.json();
      if (data.success) {
        setChatMessages(data.messages || []);
        fetchNotifications(false);
      }
    } catch (err) {
      console.error("Fetch chat thread error:", err);
    } finally {
      if (!silent) setChatLoading(false);
    }
  }

  /* =====================================================
     SEND MESSAGE
  ===================================================== */

  async function handleSendMessage(customText = null) {
    const text = (customText || chatText).trim();
    if (!text || !activeChat || !token || chatSending) return;

    const itemId = activeChat.item?._id || activeChat.item?.id;
    const otherUser = activeChat.otherUser;
    const recipientId =
      otherUser?._id ||
      otherUser?.id ||
      (typeof otherUser === "string" ? otherUser : null);

    if (!itemId || !recipientId) return;

    try {
      setChatSending(true);
      const response = await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemId,
          recipientId,
          text,
        }),
      });

      const data = await readResponse(response);
      if (data.success && data.data) {
        setChatMessages((prev) => [...prev, data.data]);
        setChatText("");
      }
    } catch (err) {
      alert(err.message || "Failed to send message.");
    } finally {
      setChatSending(false);
    }
  }

  /* =====================================================
     OPEN CHAT WITH FINDER / REPORTER
  ===================================================== */

  function handleOpenChat(item, targetUser = null) {
    if (!currentUser) {
      setShowLogin(true);
      setError("Please sign in to chat with the finder.");
      return;
    }

    const other = targetUser || item?.reportedBy;
    const otherId =
      other?._id ||
      other?.id ||
      (typeof other === "string" ? other : null);
    const currentId = currentUser?._id || currentUser?.id;

    if (!otherId || String(otherId) === String(currentId)) {
      alert("This is your own report.");
      return;
    }

    const otherUserObj =
      typeof other === "object" && other ? other : { _id: otherId, name: "Student" };

    setActiveChat({
      item,
      otherUser: otherUserObj,
    });
    setChatText("");
    fetchChatThread(item._id, otherId, false);
  }

  /* =====================================================
     MARK NOTIFICATION READ
  ===================================================== */

  async function handleMarkNotificationAsRead(id) {
    if (!token) return;
    try {
      await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadNotificationsCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleMarkAllNotificationsAsRead() {
    if (!token) return;
    try {
      await fetch(`${API_URL}/api/notifications/read-all`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadNotificationsCount(0);
    } catch (err) {
      console.error(err);
    }
  }

  /* =====================================================
     AI CHATBOT ACTIONS
  ===================================================== */

  async function handleSendAiBotMessage(customText = null) {
    const text = (typeof customText === "string" ? customText : aiBotInput).trim();
    if (!text || aiBotTyping) return;

    const userMsg = {
      id: "u-" + Date.now(),
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setAiBotMessages((prev) => [...prev, userMsg]);
    setAiBotInput("");
    setAiBotTyping(true);

    let replyData = null;
    try {
      const response = await fetch(`${API_URL}/api/bot/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.success) {
          replyData = data;
        }
      }
    } catch {
      // offline or sandboxed fallback
    }

    if (!replyData) {
      replyData = getClientBotReply(text);
    }

    setTimeout(() => {
      const botMsg = {
        id: "b-" + Date.now(),
        sender: "bot",
        text: replyData.reply,
        quickReplies: replyData.quickReplies || [],
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setAiBotMessages((prev) => [...prev, botMsg]);
      setAiBotTyping(false);
    }, 450);
  }

  function handleResetAiBot() {
    setAiBotMessages([
      {
        id: "welcome-" + Date.now(),
        sender: "bot",
        text: "👋 Chat reset! I'm your **FindFound AI Assistant**.\n\nAsk me anything about FindFound, how to report items, AI matching, or our founder **Ashutosh Panda** from **Chandigarh University**!",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        quickReplies: [
          "👑 Who is the founder?",
          "❓ How do I use FindFound?",
          "🔍 How to report a lost item?",
          "🤖 How does AI matching work?",
          "💬 How to chat with a finder?",
        ],
      },
    ]);
  }

  /* =====================================================
     INITIAL LOAD & POLLING
  ===================================================== */

  useEffect(() => {
    fetchItems();
    fetchCommunityStats();
  }, []);

  useEffect(() => {
    if (token) {
      fetchMatches();
      fetchNotifications(false);
      const interval = setInterval(() => {
        fetchNotifications(true);
      }, 8000);
      return () => clearInterval(interval);
    } else {
      setMatches([]);
      setNotifications([]);
      setUnreadNotificationsCount(0);
    }
  }, [token]);

  /* Poll active chat thread every 3 seconds */
  useEffect(() => {
    if (activeChat && token) {
      const itemId = activeChat.item?._id || activeChat.item?.id;
      const otherId =
        activeChat.otherUser?._id ||
        activeChat.otherUser?.id ||
        (typeof activeChat.otherUser === "string" ? activeChat.otherUser : null);

      if (itemId && otherId) {
        const interval = setInterval(() => {
          fetchChatThread(itemId, otherId, true);
        }, 3000);
        return () => clearInterval(interval);
      }
    }
  }, [activeChat, token]);

  /* =====================================================
     REGISTER
  ===================================================== */

  async function handleRegister(event, optionalOtp = "") {
    if (event && event.preventDefault) event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const payload = {
        ...registerForm,
        ...(optionalOtp ? { otpCode: optionalOtp } : {}),
      };

      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data =
        await readResponse(response);

      if (data.token) {
        localStorage.setItem(
          "token",
          data.token
        );

        setToken(data.token);
      }

      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        setCurrentUser(data.user);
      }

      setRegisterForm(emptyRegister);
      setShowRegister(false);

      await fetchItems();
      await fetchMatches();
      await fetchCommunityStats();
    } catch (err) {
      console.error(err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     PASSWORD LOGIN
  ===================================================== */

  async function handleLogin(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            loginForm
          ),
        }
      );

      const data =
        await readResponse(response);

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      setToken(data.token);
      setCurrentUser(data.user);

      setLoginForm(emptyLogin);

      setShowLogin(false);

      await fetchItems();
      await fetchMatches();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     EMAIL OTP - SEND
  ===================================================== */

  async function handleSendOtp(event) {
    event.preventDefault();

    setError("");
    setOtpLoading(true);

    try {
      const email =
        otpEmail.trim().toLowerCase();

      if (!email) {
        throw new Error(
          "Please enter your email address."
        );
      }

      const response = await fetch(
        `${API_URL}/api/auth/send-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      const data =
        await readResponse(response);

      setOtpEmail(email);
      setOtpCode("");
      setOtpStep("code");
      setError("");

      console.log(data.message);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setOtpLoading(false);
    }
  }

  /* =====================================================
     EMAIL OTP - VERIFY
  ===================================================== */

  async function handleVerifyOtp(event) {
    event.preventDefault();

    setError("");
    setOtpLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email: otpEmail,
            code: otpCode,
          }),
        }
      );

      const data =
        await readResponse(response);

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      setToken(data.token);
      setCurrentUser(data.user);

      setOtpEmail("");
      setOtpCode("");
      setOtpStep("email");

      setShowLogin(false);

      await fetchItems();
      await fetchMatches();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setOtpLoading(false);
    }
  }

  /* =====================================================
     LOGOUT
  ===================================================== */

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken("");
    setCurrentUser(null);

    setShowLogin(false);
    setShowRegister(false);
    setShowReport(false);

    setSearch("");
    setFilter("ALL");

    setMatches([]);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =====================================================
     OPEN REPORT
  ===================================================== */

  function openReport(type) {
    if (!token) {
      setShowLogin(true);
      return;
    }

    setReportType(type);
    setReportForm(emptyReport);
    setError("");
    setShowReport(true);
  }

  /* =====================================================
     REPORT FORM CHANGE
  ===================================================== */

  function handleReportChange(event) {
    const {
      name,
      value,
    } = event.target;

    setReportForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  /* =====================================================
     SUBMIT REPORT
  ===================================================== */

  async function handleReportSubmit(event) {
    event.preventDefault();

    if (!token) {
      setShowReport(false);
      setShowLogin(true);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/items`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...reportForm,
            type: reportType,
          }),
        }
      );

      const data =
        await readResponse(response);

      setItems((current) => [
        data.item,
        ...current,
      ]);

      setReportForm(emptyReport);
      setShowReport(false);

      /*
        Refresh AI matching after a
        new report is created.
      */
      await fetchMatches();
      await fetchCommunityStats();

      alert(
        reportType === "LOST"
          ? "Lost item reported successfully!"
          : "Found item reported successfully!"
      );
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     DELETE REPORT
  ===================================================== */

  async function handleDeleteReport(itemId) {
    if (!token) {
      setShowLogin(true);
      return;
    }

    if (!itemId) {
      setError(
        "Unable to delete this report because the report ID is missing."
      );
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this report?\n\nThis action cannot be undone."
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/items/${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      await readResponse(response);

      /*
        Remove it immediately from
        the dashboard.
      */
      setItems((current) =>
        current.filter(
          (item) =>
            item._id !== itemId
        )
      );

      /*
        Refresh AI matches because
        the deleted report may have
        been involved in a match.
      */
      await fetchMatches();

      alert(
        "Report deleted successfully."
      );
    } catch (err) {
      console.error(
        "DELETE REPORT ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to delete report."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     SEARCH + FILTER
  ===================================================== */

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (filter === "LOST") {
      result = result.filter(
        (item) =>
          item.type === "LOST"
      );
    }

    if (filter === "FOUND") {
      result = result.filter(
        (item) =>
          item.type === "FOUND"
      );
    }

    if (filter === "RECENT") {
      result.sort(
        (a, b) =>
          new Date(
            b.createdAt || b.date
          ) -
          new Date(
            a.createdAt || a.date
          )
      );
    }

    const query =
      search.trim().toLowerCase();

    if (query) {
      result = result.filter(
        (item) => {
          const values = [
            item.title,
            item.description,
            item.category,
            item.location,
            item.type,
            item.reportedBy?.name,
            item.reportedBy?.studentId,
          ];

          return values.some(
            (value) =>
              String(value || "")
                .toLowerCase()
                .includes(query)
          );
        }
      );
    }

    return result;
  }, [
    items,
    search,
    filter,
  ]);

  /* =====================================================
     COUNTS
  ===================================================== */

  const totalCount =
    items.length;

  const lostCount =
    items.filter(
      (item) =>
        item.type === "LOST"
    ).length;

  const foundCount =
    items.filter(
      (item) =>
        item.type === "FOUND"
    ).length;

  const activeCount =
    items.filter(
      (item) =>
        item.status !== "RESOLVED"
    ).length;

  /* =====================================================
     DATE
  ===================================================== */

  function formatDate(date) {
    if (!date) {
      return "Date unavailable";
    }

    const d = new Date(date);

    if (
      Number.isNaN(
        d.getTime()
      )
    ) {
      return "Date unavailable";
    }

    return d.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  /* =====================================================
     LANDING PAGE
  ===================================================== */

  if (!currentUser) {
    return (
      <div className={`landing ${landingTheme === "dark" ? "landing-dark" : ""}`}>
        {/* NAVBAR */}
        <header className="navbar">
          <button
            className="brand"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
          >
            <div className="brand-logo-badge">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5"/>
              </svg>
            </div>
            <strong className="brand-title">
              FindBack
            </strong>
          </button>

          <nav className="navbar-nav">
            <button
              className="nav-link active"
              onClick={() =>
                document.getElementById("home")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              Home
            </button>

            <button
              className="nav-link"
              onClick={() =>
                document.getElementById("features")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              Features
            </button>

            <button
              className="nav-link"
              onClick={() =>
                document.getElementById("how")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              How It Works
            </button>

            <button
              className="nav-link"
              onClick={() =>
                document.getElementById("community")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              Community
            </button>
          </nav>

          <div className="navbar-actions">
            <button
              className="theme-toggle-btn"
              onClick={toggleLandingTheme}
              title={landingTheme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
              aria-label="Toggle theme"
            >
              {landingTheme === "light" ? (
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>

            <button
              className="login-btn"
              onClick={() => {
                setError("");
                setShowLogin(true);
              }}
            >
              Login
            </button>

            <button
              className="get-started-btn"
              onClick={() => {
                setError("");
                setShowRegister(true);
              }}
            >
              <span>Get Started</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </header>

        {/* MAIN BODY */}
        <main>
          {/* HERO SECTION */}
          <section className="hero-section" id="home">
            <div className="hero-grid">
              {/* Hero Left Content */}
              <div className="hero-copy">
                <div className="eyebrow-pill">
                  <span className="eyebrow-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      <path d="M9 12l2 2 4-4"/>
                    </svg>
                  </span>
                  <span>UNIVERSITY LOST & FOUND</span>
                </div>

                <h1 className="hero-main-title">
                  Lost something?
                  <br />
                  <span className="hero-title-gradient">
                    We'll help you find it back.
                  </span>
                </h1>

                <p className="hero-description">
                  A simple and trusted platform for students to report lost items,
                  find found belongings, and reconnect with what matters.
                </p>

                <div className="hero-actions-row">
                  <button
                    className="hero-primary-btn"
                    onClick={() => {
                      setError("");
                      setShowRegister(true);
                    }}
                  >
                    <span>Get Started</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>

                  <button
                    className="hero-secondary-btn"
                    onClick={() =>
                      document.getElementById("how")?.scrollIntoView({
                        behavior: "smooth",
                      })
                    }
                  >
                    <span className="play-triangle">▶</span>
                    <span>Learn More</span>
                  </button>

                  <button
                    className="hero-ai-chip"
                    onClick={() => setShowAiBot(true)}
                    title="Chat with FindFound AI Assistant"
                  >
                    <span className="ai-sparkle">🤖</span>
                    <span>FindFound AI</span>
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="hero-trust-row">
                  <div className="trust-item">
                    <div className="trust-icon-box purple">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        <path d="M9 12l2 2 4-4"/>
                      </svg>
                    </div>
                    <div className="trust-item-text">
                      <strong>Safe & Trusted</strong>
                      <span>Verified by students</span>
                    </div>
                  </div>

                  <div className="trust-item">
                    <div className="trust-icon-box blue">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    </div>
                    <div className="trust-item-text">
                      <strong>Built for Students</strong>
                      <span>A community powered</span>
                    </div>
                  </div>

                  <div className="trust-item">
                    <div className="trust-icon-box indigo">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                      </svg>
                    </div>
                    <div className="trust-item-text">
                      <strong>Fast & Easy</strong>
                      <span>Report in minutes</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero Right Visual */}
              <div className="hero-visual">
                {/* Whimsical handwritten annotation */}
                <div className="handwritten-annotation hero-note">
                  <span>Your items. Our community.</span>
                  <span className="curved-arrow">⤹</span>
                </div>

                {/* Campus Student Illustration */}
                <div className="hero-illustration-container">
                  <div className="illustration-organic-bg"></div>
                  <img
                    src={heroIllustration}
                    alt="University student with backpack holding phone"
                    className="hero-student-illustration"
                  />
                </div>

                {/* Floating Glassmorphic Recent Activity Card */}
                <div className="recent-activity-card">
                  <div className="activity-card-header">
                    <span className="activity-live-dot"></span>
                    <span className="activity-title">Recent Activity</span>
                  </div>

                  <div className="activity-list">
                    <div className="activity-item">
                      <div className="activity-icon-sq navy">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="5" width="20" height="14" rx="2"/>
                          <line x1="2" y1="10" x2="22" y2="10"/>
                        </svg>
                      </div>
                      <div className="activity-details">
                        <strong>Lost Wallet</strong>
                        <span>Found · 2h ago</span>
                      </div>
                      <span className="status-badge found">FOUND</span>
                    </div>

                    <div className="activity-item">
                      <div className="activity-icon-sq purple">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-9z"/>
                          <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
                          <path d="M8 14h8"/>
                        </svg>
                      </div>
                      <div className="activity-details">
                        <strong>Found Backpack</strong>
                        <span>Library · 4h ago</span>
                      </div>
                      <span className="status-badge lost">LOST</span>
                    </div>

                    <div className="activity-item">
                      <div className="activity-icon-sq rose">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="5" y="2" width="14" height="20" rx="3"/>
                          <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3"/>
                        </svg>
                      </div>
                      <div className="activity-details">
                        <strong>Lost Phone</strong>
                        <span>Cafeteria · 6h ago</span>
                      </div>
                      <span className="status-badge found">FOUND</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 4 FEATURE CARDS GRID */}
          <section className="feature-cards-section" id="features">
            <div className="feature-cards-grid">
              {/* Card 1: Report Lost Items */}
              <div
                className="feature-card card-purple"
                onClick={() => {
                  setError("");
                  setShowRegister(true);
                }}
              >
                <div className="feature-icon-circle purple">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </div>
                <h3>Report Lost Items</h3>
                <p>Quickly report your lost items with simple details and photos.</p>
                <div className="feature-card-bottom">
                  <button className="card-arrow-circle purple" aria-label="Report lost items">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Card 2: Find Found Items */}
              <div
                className="feature-card card-green"
                onClick={() => {
                  setError("");
                  setShowRegister(true);
                }}
              >
                <div className="feature-icon-circle green">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16.5 9.4 7.5 4.21"/>
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                    <line x1="12" y1="22.08" x2="12" y2="12"/>
                  </svg>
                </div>
                <h3>Find Found Items</h3>
                <p>Browse items found by other students and help return them.</p>
                <div className="feature-card-bottom">
                  <button className="card-arrow-circle green" aria-label="Find found items">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Card 3: Reconnect */}
              <div
                className="feature-card card-amber"
                onClick={() => {
                  setError("");
                  setShowRegister(true);
                }}
              >
                <div className="feature-icon-circle amber">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <h3>Reconnect</h3>
                <p>Help your community return things faster.</p>
                <div className="feature-card-bottom">
                  <button className="card-arrow-circle amber" aria-label="Reconnect with community">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Card 4: Safe Community */}
              <div
                className="feature-card card-blue"
                onClick={() => {
                  setError("");
                  setShowRegister(true);
                }}
              >
                <div className="feature-icon-circle blue">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                </div>
                <h3>Safe Community</h3>
                <p>A trusted platform built for students, by students.</p>
                <div className="feature-card-bottom">
                  <button className="card-arrow-circle blue" aria-label="Safe community">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* OUR IMPACT SECTION (DYNAMIC REAL-TIME COUNTER) */}
          <section className="impact-section" id="community">
            <div className="impact-container">
              <div className="impact-header-text">
                <div className="impact-badge">LIVE COMMUNITY TRACKER</div>
                <h2 className="impact-title">A growing community that cares</h2>
                <p className="impact-desc">
                  Live campus tracker: As students register and report lost or found belongings, these counts update automatically in real time. Be among the first to participate!
                </p>
              </div>

              <div className="impact-stats-grid">
                <div className="impact-stat-item">
                  <div className="stat-icon-circle purple">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <div className="stat-number">{communityStats.activeStudents}</div>
                  <div className="stat-label">Active Students</div>
                </div>

                <div className="impact-stat-divider"></div>

                <div className="impact-stat-item">
                  <div className="stat-icon-circle purple">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16.5 9.4 7.5 4.21"/>
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                      <line x1="12" y1="22.08" x2="12" y2="12"/>
                    </svg>
                  </div>
                  <div className="stat-number">{communityStats.itemsFound}</div>
                  <div className="stat-label">Items Found</div>
                </div>

                <div className="impact-stat-divider"></div>

                <div className="impact-stat-item">
                  <div className="stat-icon-circle purple">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </div>
                  <div className="stat-number">{communityStats.totalItems}</div>
                  <div className="stat-label">Total Reports</div>
                </div>

                <div className="impact-stat-divider"></div>

                <div className="impact-stat-item">
                  <div className="stat-icon-circle purple">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">Community Ready</div>
                </div>
              </div>

              <div className="impact-handwritten-note">
                <span>Every report helps our campus grow! 🤍</span>
                <span className="impact-handwritten-arrow">↙</span>
              </div>
            </div>
          </section>

          {/* HOW IT WORKS SECTION */}
          <section className="how-it-works-section" id="how">
            <div className="section-header-centered">
              <div className="eyebrow-pill">HOW IT WORKS</div>
              <h2>Three simple steps to find it back.</h2>
              <p>FindBack connects lost items with their rightful owners in three seamless steps.</p>
            </div>

            <div className="steps-container">
              <div className="step-card">
                <div className="step-number-badge">1</div>
                <div className="step-icon-box purple">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>
                <h3>Snap & Report Item</h3>
                <p>Upload a photo directly from your device. Our client-side compressor optimizes the file instantly for quick, clean display.</p>
              </div>

              <div className="step-card">
                <div className="step-number-badge">2</div>
                <div className="step-icon-box green">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <h3>Smart AI Matching</h3>
                <p>Our AI analyzes titles, campus locations, and item descriptions to flag potential matches immediately between lost and found items.</p>
              </div>

              <div className="step-card">
                <div className="step-number-badge">3</div>
                <div className="step-icon-box blue">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <polyline points="9 12 11 14 15 10"/>
                  </svg>
                </div>
                <h3>Safe Return & Verify</h3>
                <p>Coordinate safely through student verification and OTP authentication to confirm identity and safely hand over belongings.</p>
              </div>
            </div>
          </section>

          {/* COMMUNITY BANNER */}
          <section className="community-banner-section">
            <div className="community-banner-card">
              <div className="community-banner-left">
                <div className="community-banner-badge">FINDBACK COMMUNITY</div>
                <h2>Lost something?<br />Let's find it together.</h2>
                <p>One unified campus dashboard where students see lost and found reports from everyone in real time.</p>
              </div>

              <div className="community-banner-right">
                <button
                  className="community-join-btn"
                  onClick={() => {
                    setError("");
                    setShowRegister(true);
                  }}
                >
                  <span>Join FindBack Community →</span>
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* FOOTER */}
        <footer className="landing-footer">
          <div className="footer-container">
            <div className="footer-brand">
              <div className="brand-logo-badge footer-logo">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5"/>
                </svg>
              </div>
              <strong className="footer-title">FindBack</strong>
              <span className="footer-sub">University Lost & Found Network</span>
            </div>

            <div className="footer-nav-links">
              <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Home</button>
              <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>Features</button>
              <button onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}>How It Works</button>
              <button onClick={() => document.getElementById("community")?.scrollIntoView({ behavior: "smooth" })}>Community</button>
            </div>

            <div className="footer-status-pill">
              <span className="status-dot-pulse"></span>
              <span>Campus Network Active · © {new Date().getFullYear()}</span>
            </div>
          </div>
        </footer>

        {/* LOGIN */}

        {showLogin && (
          <LoginModal
            form={loginForm}
            setForm={setLoginForm}
            loading={loading}
            error={error}
            setError={setError}
            onClose={() => {
              setShowLogin(false);
              setError("");
            }}
            onSubmit={handleLogin}
            openRegister={() => {
              setShowLogin(false);
              setError("");
              setShowRegister(true);
            }}
            otpEmail={otpEmail}
            setOtpEmail={setOtpEmail}
            otpCode={otpCode}
            setOtpCode={setOtpCode}
            otpStep={otpStep}
            setOtpStep={setOtpStep}
            otpLoading={otpLoading}
            onSendOtp={handleSendOtp}
            onVerifyOtp={handleVerifyOtp}
          />
        )}

        {/* REGISTER */}

        {showRegister && (
          <RegisterModal
            form={registerForm}
            setForm={setRegisterForm}
            loading={loading}
            error={error}
            setError={setError}
            onClose={() => {
              setShowRegister(false);
              setError("");
            }}
            onSubmit={handleRegister}
            openLogin={() => {
              setShowRegister(false);
              setError("");
              setShowLogin(true);
            }}
          />
        )}

      </div>
    );
  }

  /* =====================================================
     DASHBOARD
  ===================================================== */

  return (
    <div className="dashboard">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="sidebar">

        <button
          className="dashboard-brand"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
        >
          <span>⌕</span>
          FindBack
        </button>

        <nav className="side-nav">

          <button className="side-active">
            <Icon>⌂</Icon>
            Dashboard
          </button>

          <button
            onClick={() =>
              openReport("LOST")
            }
          >
            <Icon>＋</Icon>
            Report Lost
          </button>

          <button
            onClick={() =>
              openReport("FOUND")
            }
          >
            <Icon>✓</Icon>
            Report Found
          </button>

          <button
            onClick={() =>
              document
                .getElementById(
                  "reports"
                )
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            <Icon>◷</Icon>
            Recent Items
          </button>

          <button
            className="sidebar-messages-btn"
            onClick={() =>
              setShowNotificationsDropdown(
                (prev) => !prev
              )
            }
          >
            <Icon>💬</Icon>
            Messages
            {unreadNotificationsCount > 0 && (
              <span className="sidebar-badge">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          <button
            className="sidebar-ai-bot-btn"
            onClick={() => setShowAiBot(true)}
          >
            <Icon>🤖</Icon>
            Ask AI Assistant
            <span className="sidebar-ai-sparkle">✨</span>
          </button>

        </nav>

        {/* HELP */}

        <div className="help-box">

          <span className="help-icon">
            ⌕
          </span>

          <h3>
            Need help?
          </h3>

          <p>
            Report an item and
            let your campus
            community help you
            find it.
          </p>

          <button
            onClick={() =>
              openReport("LOST")
            }
          >
            Report an item →
          </button>

        </div>

        {/* PROFILE */}

        <div className="sidebar-bottom">

          <div className="profile">

            <div className="avatar">
              {currentUser.name
                ?.charAt(0)
                ?.toUpperCase() ||
                "U"}
            </div>

            <div>

              <strong>
                {currentUser.name}
              </strong>

              <span>
                {currentUser.studentId}
              </span>

            </div>

          </div>

          <button
            className="logout"
            onClick={handleLogout}
          >
            ⇥ Logout
          </button>

        </div>

      </aside>

      {/* =================================================
          MAIN DASHBOARD
      ================================================= */}

      <main className="dashboard-main">

        {/* HEADER */}

        <header className="dashboard-header">

          <div>

            <p className="dashboard-label">
              FINDBACK COMMUNITY
            </p>

            <h1>
              Welcome back,{" "}
              {
                currentUser.name
                  ?.split(" ")[0]
              }{" "}
              👋
            </h1>

            <p>
              Help your campus
              community find what
              matters.
            </p>

          </div>

          <div className="header-actions">

            {/* NOTIFICATION BELL & DROPDOWN */}
            <div className="notifications-container">
              <button
                type="button"
                className={`notifications-bell-btn ${
                  unreadNotificationsCount > 0 ? "has-unread" : ""
                }`}
                onClick={() =>
                  setShowNotificationsDropdown(
                    (prev) => !prev
                  )
                }
                title="Notifications"
              >
                <span className="bell-emoji">🔔</span>
                {unreadNotificationsCount > 0 && (
                  <span className="unread-badge">
                    {unreadNotificationsCount > 9
                      ? "9+"
                      : unreadNotificationsCount}
                  </span>
                )}
              </button>

              {showNotificationsDropdown && (
                <NotificationsDropdown
                  notifications={notifications}
                  unreadCount={unreadNotificationsCount}
                  onClose={() =>
                    setShowNotificationsDropdown(false)
                  }
                  onMarkRead={
                    handleMarkNotificationAsRead
                  }
                  onMarkAllRead={
                    handleMarkAllNotificationsAsRead
                  }
                  onOpenChat={(notif) => {
                    setShowNotificationsDropdown(false);
                    if (notif.itemId && notif.sender) {
                      handleOpenChat(
                        notif.itemId,
                        notif.sender
                      );
                    }
                  }}
                />
              )}
            </div>

            <button
              className="found-action"
              onClick={() =>
                openReport("FOUND")
              }
            >
              + Report Found
            </button>

            <button
              className="lost-action"
              onClick={() =>
                openReport("LOST")
              }
            >
              + Report Lost
            </button>

          </div>

        </header>

        {/* ERROR */}

        {error && (
          <div className="dashboard-error">

            {error}

            <button
              onClick={() =>
                setError("")
              }
            >
              ×
            </button>

          </div>
        )}

        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="stats">

          <div className="stat-card">

            <div className="stat-icon purple-bg">
              ◷
            </div>

            <div>

              <span>
                Total Reports
              </span>

              <strong>
                {totalCount}
              </strong>

              <small>
                All reports
              </small>

            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon red-bg">
              ⌕
            </div>

            <div>

              <span>
                Lost Items
              </span>

              <strong>
                {lostCount}
              </strong>

              <small>
                Reported lost
              </small>

            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon green-bg">
              ✓
            </div>

            <div>

              <span>
                Found Items
              </span>

              <strong>
                {foundCount}
              </strong>

              <small>
                Reported found
              </small>

            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon blue-bg">
              ◎
            </div>

            <div>

              <span>
                Active Reports
              </span>

              <strong>
                {activeCount}
              </strong>

              <small>
                Needs attention
              </small>

            </div>

          </div>

        </section>

        {/* =================================================
            AI MATCHING
        ================================================= */}

        {/* =================================================
            AI SMART MATCHING (UPGRADED)
        ================================================= */}

        {matches.length > 0 && (
          <section className="ai-matches-section">
            <div className="ai-matches-header">
              <div className="ai-matches-header-left">
                <div className="ai-badge">
                  <span className="ai-badge-sparkle">✨</span>
                  <span>AI SMART MATCHING</span>
                </div>
                <h2>Potential Campus Matches Found 🤖</h2>
                <p className="ai-matches-subtitle">
                  Our algorithm analyzed recent reports and discovered possible matches
                  between your items and what others reported.
                </p>
              </div>

              <div className="ai-match-summary">
                <div className="ai-summary-icon">✦</div>
                <div>
                  <strong>{matches.length} Matches</strong>
                  <small>Automated analysis</small>
                </div>
              </div>
            </div>

            <div className="ai-matches-grid">
              {matches.map((match) => {
                const lost = match.lostItem;
                const found = match.foundItem;
                const currentUserId =
                  currentUser?._id || currentUser?.id;
                const lostUserId =
                  lost?.reportedBy?._id ||
                  lost?.reportedBy?.id ||
                  lost?.reportedBy;

                const isMyLost =
                  String(lostUserId || "") ===
                  String(currentUserId || "");

                const myItem = isMyLost ? lost : found;
                const otherItem = isMyLost ? found : lost;
                const otherUser = otherItem?.reportedBy;
                const otherUserName =
                  otherUser?.name || "Student";
                const isFoundMatch =
                  otherItem?.type === "FOUND";
                const isHighConfidence =
                  match.score >= 75;

                return (
                  <article className="ai-card" key={match._id}>
                    {/* CARD TOP STATUS */}
                    <div className="ai-card-top">
                      <div
                        className={`ai-confidence-pill ${
                          isHighConfidence
                            ? "high"
                            : "moderate"
                        }`}
                      >
                        <span className="ai-pulse-dot" />
                        <strong>{match.score}% MATCH</strong>
                        <span className="ai-conf-label">
                          {isHighConfidence
                            ? "High Confidence"
                            : "Moderate Match"}
                        </span>
                      </div>
                      <span className="ai-match-date">
                        Comparing with your{" "}
                        {myItem?.type?.toLowerCase() ||
                          "report"}
                      </span>
                    </div>

                    {/* COMPARISON PAIR */}
                    <div className="ai-comparison-container">
                      {/* MY ITEM */}
                      <div className="ai-side-item my-item">
                        <div className="ai-side-top-row">
                          <div className="ai-side-badge my-badge">
                            YOU REPORTED ({myItem?.type || "ITEM"})
                          </div>
                          {myItem?.image && (
                            <img
                              src={myItem.image}
                              alt={myItem.title}
                              className="ai-thumb-mini"
                            />
                          )}
                        </div>
                        <h4>{myItem?.title || "Your Item"}</h4>
                        <p className="ai-side-desc">
                          {myItem?.description ||
                            "No description provided"}
                        </p>
                        <div className="ai-side-meta">
                          <span>
                            📍 {myItem?.location || "Campus"}
                          </span>
                          <span>
                            🏷️ {myItem?.category || "Other"}
                          </span>
                        </div>
                      </div>

                      {/* CONNECTOR HUB */}
                      <div className="ai-hub-connector">
                        <div className="ai-hub-line" />
                        <div className="ai-hub-badge">
                          <span className="ai-hub-icon">⇄</span>
                        </div>
                        <div className="ai-hub-line" />
                      </div>

                      {/* MATCHED ITEM */}
                      <div
                        className={`ai-side-item matched-item ${
                          isFoundMatch
                            ? "found-glow"
                            : "lost-glow"
                        }`}
                      >
                        <div className="ai-side-top-row">
                          <div
                            className={`ai-side-badge ${
                              isFoundMatch
                                ? "matched-found"
                                : "matched-lost"
                            }`}
                          >
                            {isFoundMatch
                              ? "✓ FOUND MATCH"
                              : "⌕ LOST MATCH"}
                          </div>
                          {otherItem?.image && (
                            <img
                              src={otherItem.image}
                              alt={otherItem.title}
                              className="ai-thumb-mini"
                            />
                          )}
                        </div>
                        <h4>
                          {otherItem?.title || "Matched Item"}
                        </h4>
                        <p className="ai-side-desc">
                          {otherItem?.description ||
                            "No description provided"}
                        </p>
                        <div className="ai-side-meta">
                          <span>
                            📍{" "}
                            {otherItem?.location || "Unknown"}
                          </span>
                          <span>
                            📅{" "}
                            {formatDate(
                              otherItem?.date ||
                                otherItem?.createdAt
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* FOOTER ACTIONS */}
                    <div className="ai-card-footer">
                      <div className="ai-reporter-chip">
                        <div className="ai-reporter-avatar">
                          {otherUserName
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <span>
                          Reported by{" "}
                          <strong>{otherUserName}</strong>
                        </span>
                      </div>

                      <div className="ai-action-buttons">
                        <button
                          type="button"
                          className="ai-view-btn"
                          onClick={() => {
                            window.alert(
                              `MATCH DETAILS (${match.score}% MATCH)\n\n` +
                                `Your Report: ${myItem?.title} (${myItem?.type})\n` +
                                `Matched Report: ${otherItem?.title} (${otherItem?.type})\n` +
                                `Location: ${otherItem?.location}\n` +
                                `Date: ${formatDate(otherItem?.date)}\n` +
                                `Reported By: ${otherUserName}\n\n` +
                                `Description: ${otherItem?.description}`
                            );
                          }}
                        >
                          View Details
                        </button>

                        {otherItem && (
                          <button
                            type="button"
                            className="ai-chat-btn"
                            onClick={() =>
                              handleOpenChat(
                                otherItem,
                                otherUser
                              )
                            }
                          >
                            💬 Chat with{" "}
                            {isFoundMatch
                              ? "Finder"
                              : "Reporter"}
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* =================================================
            COMMUNITY REPORTS
        ================================================= */}

        <section
          className="reports-section"
          id="reports"
        >

          <div className="reports-heading">

            <div>

              <h2>
                Community Reports
              </h2>

              <p>
                See lost and found
                reports from everyone
                using FindBack.
              </p>

            </div>

            <div className="search-box">

              <span>
                ⌕
              </span>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search items, locations..."
              />

              {search && (
                <button
                  onClick={() =>
                    setSearch("")
                  }
                >
                  ×
                </button>
              )}

            </div>

          </div>

          {/* FILTERS */}

          <div className="filter-row">

            <button
              className={
                filter === "ALL"
                  ? "filter-active"
                  : ""
              }
              onClick={() =>
                setFilter("ALL")
              }
            >
              All Items
            </button>

            <button
              className={
                filter === "LOST"
                  ? "filter-active"
                  : ""
              }
              onClick={() =>
                setFilter("LOST")
              }
            >
              Lost Items
            </button>

            <button
              className={
                filter === "FOUND"
                  ? "filter-active"
                  : ""
              }
              onClick={() =>
                setFilter("FOUND")
              }
            >
              Found Items
            </button>

            <button
              className={
                filter === "RECENT"
                  ? "filter-active"
                  : ""
              }
              onClick={() =>
                setFilter("RECENT")
              }
            >
              Recently Added
            </button>

          </div>

          {/* REPORT LIST */}

          {loading &&
          items.length === 0 ? (
            <div className="empty-state">
              Loading reports...
            </div>
          ) : filteredItems.length ===
            0 ? (

            <div className="empty-state">

              <div>
                ⌕
              </div>

              <h3>
                No reports found
              </h3>

              <p>
                Try another search
                or create a new
                lost or found report.
              </p>

              <button
                onClick={() =>
                  openReport("LOST")
                }
              >
                Report Lost Item
              </button>

            </div>

          ) : (

            <div className="report-grid">

              {filteredItems.map(
                (item) => (
                  <ReportCard
                    key={item._id}
                    item={item}
                    formatDate={
                      formatDate
                    }
                    currentUser={
                      currentUser
                    }
                    onDelete={
                      handleDeleteReport
                    }
                    onOpenChat={
                      handleOpenChat
                    }
                    onViewDetails={
                      setSelectedDetailItem
                    }
                  />
                )
              )}

            </div>

          )}

        </section>

        {/* =================================================
            CTA
        ================================================= */}

        <section className="dashboard-cta">

          <div>

            <span>
              FINDBACK COMMUNITY
            </span>

            <h2>
              Help someone find
              <br />
              what they lost.
            </h2>

          </div>

          <button
            onClick={() =>
              openReport("FOUND")
            }
          >
            Report Found Item →
          </button>

        </section>

      </main>

      {/* REPORT MODAL */}

      {showReport && (
        <ReportModal
          type={reportType}
          form={reportForm}
          setForm={setReportForm}
          loading={loading}
          error={error}
          onChange={
            handleReportChange
          }
          onClose={() => {
            setShowReport(false);
            setError("");
          }}
          onSubmit={
            handleReportSubmit
          }
        />
      )}

      {/* CHAT MODAL */}
      {activeChat && (
        <ChatModal
          activeChat={activeChat}
          onClose={() => setActiveChat(null)}
          messages={chatMessages}
          loading={chatLoading}
          sending={chatSending}
          chatText={chatText}
          setChatText={setChatText}
          onSend={handleSendMessage}
          currentUser={currentUser}
        />
      )}

      {/* ITEM DETAILS MODAL */}
      {selectedDetailItem && (
        <ItemDetailsModal
          item={selectedDetailItem}
          onClose={() => setSelectedDetailItem(null)}
          formatDate={formatDate}
          currentUser={currentUser}
          onOpenChat={handleOpenChat}
        />
      )}

      {/* NOTIFICATION TOAST POPUP */}
      {toastNotification && (
        <NotificationToast
          notification={toastNotification}
          onOpen={() => {
            const notif = toastNotification;
            setToastNotification(null);
            if (notif.itemId && notif.sender) {
              handleOpenChat(
                notif.itemId,
                notif.sender
              );
            }
          }}
          onClose={() =>
            setToastNotification(null)
          }
        />
      )}

      {/* AI CHATBOT LAUNCHER BUTTON */}
      <button
        type="button"
        className={`ai-bot-floating-btn ${showAiBot ? "active" : ""}`}
        onClick={() => setShowAiBot((prev) => !prev)}
        title="Chat with FindFound AI Assistant"
      >
        <span className="ai-bot-btn-icon">{showAiBot ? "✕" : "🤖"}</span>
        <span className="ai-bot-btn-text">
          {showAiBot ? "Close AI" : "Ask FindFound AI"}
        </span>
        <span className="ai-bot-sparkle-dot" />
      </button>

      {/* AI CHATBOT FLOATING DRAWER / MODAL */}
      {showAiBot && (
        <AiChatbotWidget
          messages={aiBotMessages}
          input={aiBotInput}
          setInput={setAiBotInput}
          isTyping={aiBotTyping}
          onSend={handleSendAiBotMessage}
          onReset={handleResetAiBot}
          onClose={() => setShowAiBot(false)}
        />
      )}

    </div>
  );
}

/* =========================================================
   REPORT CARD
========================================================= */

function ReportCard({
  item,
  formatDate,
  currentUser,
  onDelete,
  onOpenChat,
  onViewDetails,
}) {
  const isLost =
    item.type === "LOST";

  /*
    Support both:
      reportedBy: { _id: "..." }
    and:
      reportedBy: "..."
  */

  const itemOwnerId =
    item.reportedBy?._id ||
    item.reportedBy?.id ||
    item.reportedBy;

  const currentUserId =
    currentUser?._id ||
    currentUser?.id;

  /*
    Only the person who created
    the report gets the delete
    button.
  */

  const isMyReport =
    itemOwnerId &&
    currentUserId &&
    String(itemOwnerId) ===
      String(currentUserId);

  return (
    <article className="report-card">

      {/* TOP IMAGE AREA */}

      <div
        className={`report-visual ${item.image ? "has-image" : ""} ${
          isLost
            ? "lost-visual"
            : "found-visual"
        }`}
        onClick={() => onViewDetails?.(item)}
        title="Click to view details"
      >

        {item.image ? (
          <>
            <img
              src={item.image}
              alt={item.title}
              className="report-card-img"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="report-img-overlay" />
          </>
        ) : (
          <div className="report-big-icon">
            {isLost ? "⌕" : "✓"}
          </div>
        )}

        <span
          className={`report-badge ${
            isLost
              ? "lost-badge"
              : "found-badge"
          }`}
        >
          {isLost
            ? "LOST"
            : "FOUND"}
        </span>

        <span className="report-date-top">
          {formatDate(
            item.createdAt ||
              item.date
          )}
        </span>

      </div>

      {/* CONTENT */}

      <div className="report-content">

        <div className="report-title-row">

          <h3>
            {item.title}
          </h3>

          <span className="category">
            {item.category ||
              "Other"}
          </span>

        </div>

        <p>
          {item.description}
        </p>

        {/* LOCATION / DATE */}

        <div className="report-meta">

          <span>
            📍{" "}
            {item.location ||
              "Location unavailable"}
          </span>

          <span>
            📅{" "}
            {formatDate(
              item.date
            )}
          </span>

        </div>

        {/* REPORTER */}

        <div className="reported-by">

          <div className="small-avatar">

            {item.reportedBy?.name
              ?.charAt(0)
              ?.toUpperCase() ||
              "U"}

          </div>

          <span>
            Reported by{" "}

            <strong>
              {item.reportedBy?.name ||
                "Student"}
            </strong>
          </span>

        </div>

        {/* =================================================
            ACTION BUTTONS
        ================================================= */}

        <div
          className="report-actions"
        >

          <button
            type="button"
            className="view-report-button"
            onClick={() => {
              if (onViewDetails) {
                onViewDetails(item);
              } else {
                window.alert(
                  `${item.title}\n\n${item.description}\n\nLocation: ${item.location}\nDate: ${formatDate(item.date)}`
                );
              }
            }}
          >
            View Details →
          </button>

          {/* CHAT WITH FINDER / REPORTER BUTTON */}
          {!isMyReport && (
            <button
              type="button"
              className={`chat-finder-btn ${
                isLost ? "chat-lost-btn" : "chat-found-btn"
              }`}
              onClick={() => onOpenChat(item)}
              title={
                isLost
                  ? "Message the reporter who lost this item"
                  : "Directly chat with the finder of this item"
              }
            >
              💬 {isLost ? "Contact Reporter" : "Chat with Finder"}
            </button>
          )}

          {/* 
              DELETE ONLY IF THIS
              IS THE CURRENT USER'S
              REPORT
          */}

          {isMyReport && (
            <button
              type="button"
              className="delete-report-button"
              onClick={() =>
                onDelete(
                  item._id
                )
              }
              disabled={!item._id}
            >
              🗑 Delete
            </button>
          )}

        </div>

      </div>

    </article>
  );
}

/* =========================================================
   ITEM DETAILS MODAL
========================================================= */

function ItemDetailsModal({
  item,
  onClose,
  formatDate,
  currentUser,
  onOpenChat,
}) {
  if (!item) return null;

  const isLost = item.type === "LOST";
  const itemOwnerId =
    item.reportedBy?._id ||
    item.reportedBy?.id ||
    item.reportedBy;
  const currentUserId =
    currentUser?._id ||
    currentUser?.id;
  const isMyReport =
    itemOwnerId &&
    currentUserId &&
    String(itemOwnerId) === String(currentUserId);

  return (
    <div
      className="modal-overlay details-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="item-details-card">
        <button
          className="close-modal details-close-btn"
          onClick={onClose}
          type="button"
          aria-label="Close"
        >
          ×
        </button>

        {item.image ? (
          <div className="details-image-container">
            <img
              src={item.image}
              alt={item.title}
              className="details-banner-img"
            />
            <div className="details-image-gradient" />
            <span
              className={`details-badge ${
                isLost ? "details-lost" : "details-found"
              }`}
            >
              {isLost ? "LOST ITEM" : "FOUND ITEM"}
            </span>
          </div>
        ) : (
          <div className="details-no-image-header">
            <span
              className={`details-badge ${
                isLost ? "details-lost" : "details-found"
              }`}
            >
              {isLost ? "⌕ LOST ITEM" : "✓ FOUND ITEM"}
            </span>
            <span className="details-date-pill">
              {formatDate(item.createdAt || item.date)}
            </span>
          </div>
        )}

        <div className="details-body">
          <div className="details-title-row">
            <h2>{item.title}</h2>
            <span className="details-category-pill">
              {item.category || "Other"}
            </span>
          </div>

          <div className="details-metadata-grid">
            <div className="details-meta-box">
              <span className="details-meta-label">📍 Location</span>
              <strong>{item.location || "Campus"}</strong>
            </div>
            <div className="details-meta-box">
              <span className="details-meta-label">📅 Date</span>
              <strong>{formatDate(item.date)}</strong>
            </div>
            <div className="details-meta-box">
              <span className="details-meta-label">👤 Reported By</span>
              <strong>
                {item.reportedBy?.name || "Campus Student"}
              </strong>
            </div>
            <div className="details-meta-box">
              <span className="details-meta-label">⚡ Status</span>
              <span className="details-status-badge">
                {item.status || "ACTIVE"}
              </span>
            </div>
          </div>

          <div className="details-description-section">
            <h4>Description</h4>
            <p>{item.description}</p>
          </div>

          <div className="details-actions">
            {!isMyReport && (
              <button
                type="button"
                className={`details-chat-btn ${
                  isLost ? "details-chat-lost" : "details-chat-found"
                }`}
                onClick={() => {
                  onClose();
                  onOpenChat?.(item);
                }}
              >
                💬 {isLost ? "Contact Reporter" : "Chat with Finder"}
              </button>
            )}
            <button
              type="button"
              className="details-done-btn"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   LOGIN MODAL
========================================================= */

function LoginModal({
  form,
  setForm,
  loading,
  error,
  setError,
  onClose,
  onSubmit,
  openRegister,

  otpEmail,
  setOtpEmail,
  otpCode,
  setOtpCode,
  otpStep,
  setOtpStep,
  otpLoading,
  onSendOtp,
  onVerifyOtp,
}) {
  const otpMode =
    otpStep !== "password";

  return (
    <div className="modal-overlay">

      <div className="auth-modal">

        <button
          className="close-modal"
          onClick={onClose}
        >
          ×
        </button>

        <div className="auth-icon">
          ⌕
        </div>

        <div className="auth-heading">

          <span>
            {otpMode
              ? "EMAIL VERIFICATION"
              : "WELCOME BACK"}
          </span>

          <h2>
            {otpMode
              ? "Sign in with Email OTP"
              : "Sign in to FindBack"}
          </h2>

          <p>
            {otpMode
              ? "We'll send a secure one-time password to your email."
              : "Find what you've lost. Help others find what they've lost."}
          </p>

        </div>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        {/* OTP */}

        {otpMode ? (

          <>
            {otpStep === "email" ? (

              <form
                onSubmit={onSendOtp}
              >

                <label>
                  University Email

                  <input
                    type="email"
                    placeholder="you@university.edu"
                    value={otpEmail}
                    onChange={(event) =>
                      setOtpEmail(
                        event.target.value
                      )
                    }
                    required
                  />

                </label>

                <button
                  className="submit-button"
                  disabled={otpLoading}
                  type="submit"
                >

                  {otpLoading
                    ? "Sending code..."
                    : "Send OTP"}

                  {!otpLoading && (
                    <span>
                      →
                    </span>
                  )}

                </button>

              </form>

            ) : (

              <form
                onSubmit={onVerifyOtp}
              >

                <label>
                  Enter OTP

                  <input
                    className="otp-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otpCode}
                    onChange={(event) =>
                      setOtpCode(
                        event.target.value
                          .replace(
                            /\D/g,
                            ""
                          )
                          .slice(
                            0,
                            6
                          )
                      )
                    }
                    required
                  />

                </label>

                <p className="otp-sent-text">

                  Code sent to{" "}

                  <strong>
                    {otpEmail}
                  </strong>

                </p>

                <button
                  className="submit-button"
                  disabled={
                    otpLoading ||
                    otpCode.length !==
                      6
                  }
                  type="submit"
                >

                  {otpLoading
                    ? "Verifying..."
                    : "Verify & Sign In"}

                  {!otpLoading && (
                    <span>
                      →
                    </span>
                  )}

                </button>

                <button
                  type="button"
                  className="otp-back-button"
                  onClick={() => {
                    setOtpCode("");
                    setError("");
                    setOtpStep(
                      "email"
                    );
                  }}
                >
                  ← Change email
                </button>

              </form>

            )}
          </>

        ) : (

          /* PASSWORD LOGIN */

          <form
            onSubmit={onSubmit}
          >

            <label>
              Email

              <input
                type="email"
                placeholder="you@university.edu"
                value={form.email}
                onChange={(event) =>
                  setForm({
                    ...form,
                    email:
                      event.target.value,
                  })
                }
                required
              />

            </label>

            <label>
              Password

              <input
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(event) =>
                  setForm({
                    ...form,
                    password:
                      event.target.value,
                  })
                }
                required
              />

            </label>

            <button
              className="submit-button"
              disabled={loading}
              type="submit"
            >

              {loading
                ? "Signing in..."
                : "Sign In"}

              {!loading && (
                <span>
                  →
                </span>
              )}

            </button>

          </form>

        )}

        {/* LOGIN OPTIONS */}

        <div className="auth-login-options">

          {otpStep === "password" ? (

            <button
              type="button"
              onClick={() => {
                setError("");
                setOtpStep(
                  "email"
                );
              }}
            >
              Login with Email OTP
            </button>

          ) : (

            <button
              type="button"
              onClick={() => {
                setError("");
                setOtpStep(
                  "password"
                );
              }}
            >
              Login with Password
            </button>

          )}

        </div>

        <div className="switch-auth">

          Don't have an account?

          <button
            onClick={openRegister}
          >
            Create account
          </button>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   CAPTCHA UTILITY & COMPONENT
========================================================= */

function generateCaptchaCode(length = 5) {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function CaptchaBox({ captchaCode, onRefresh, userInput, onUserInputChange }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, "#f5effd");
    bg.addColorStop(1, "#eae0f8");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Draw wavy/noise lines
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 120 + 80)}, 30, ${Math.floor(
        Math.random() * 150 + 100
      )}, 0.4)`;
      ctx.lineWidth = Math.random() * 1.5 + 1;
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height
      );
      ctx.stroke();
    }

    // Draw noise dots
    for (let i = 0; i < 35; i++) {
      ctx.fillStyle = `rgba(${Math.floor(Math.random() * 150)}, 30, ${Math.floor(
        Math.random() * 180
      )}, 0.35)`;
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw characters with distinct rotations and anti-bot colors
    const chars = captchaCode.split("");
    const spacing = width / (chars.length + 1);
    const colors = ["#4c1d95", "#6d28d9", "#1e3a8a", "#991b1b", "#065f46", "#701a75"];

    chars.forEach((char, i) => {
      ctx.save();
      const x = (i + 1) * spacing;
      const y = height / 2 + Math.random() * 4 - 2;
      const angle = (Math.random() * 26 - 13) * (Math.PI / 180);

      ctx.translate(x, y);
      ctx.rotate(angle);

      ctx.fillStyle = colors[i % colors.length];
      ctx.font = `bold ${Math.floor(Math.random() * 4 + 21)}px 'Courier New', monospace, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(char, 0, 0);

      ctx.restore();
    });
  }, [captchaCode]);

  return (
    <div className="captcha-block">
      <div className="captcha-header-row">
        <label className="captcha-label">
          CAPTCHA Verification <span className="captcha-req">*</span>
        </label>
        <span className="captcha-badge">Anti-Bot</span>
      </div>

      <div className="captcha-control-row">
        <div className="captcha-preview-box">
          <canvas
            ref={canvasRef}
            width="135"
            height="40"
            className="captcha-canvas"
          />
          <button
            type="button"
            className="captcha-reload-btn"
            onClick={onRefresh}
            title="Click to refresh CAPTCHA code"
          >
            🔄
          </button>
        </div>

        <input
          type="text"
          className="captcha-code-input"
          placeholder="Enter code"
          value={userInput}
          onChange={onUserInputChange}
          maxLength={6}
          autoComplete="off"
          spellCheck="false"
          required
        />
      </div>
      <small className="captcha-helper-text">
        Type the 5 letters/numbers from the security image above.
      </small>
    </div>
  );
}

/* =========================================================
   REGISTER MODAL
========================================================= */

function RegisterModal({
  form,
  setForm,
  loading,
  error,
  setError,
  onClose,
  onSubmit,
  openLogin,
}) {
  const [regStep, setRegStep] = useState("details"); // "details" | "otp"
  const [verifyWithOtp, setVerifyWithOtp] = useState(true);
  const [captchaCode, setCaptchaCode] = useState(() => generateCaptchaCode(5));
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [localError, setLocalError] = useState("");

  // OTP state
  const [regOtp, setRegOtp] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptchaCode(5));
    setCaptchaInput("");
    setCaptchaError("");
  };

  const handleSendRegisterOtp = async () => {
    setOtpSending(true);
    setLocalError("");
    if (setError) setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/send-register-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          name: form.name,
          studentId: form.studentId,
        }),
      });

      await readResponse(response);
      setRegStep("otp");
      setRegOtp("");
      setResendTimer(30);
    } catch (err) {
      console.error("Send Register OTP failed:", err);
      setLocalError(err.message || "Failed to send verification OTP.");
      refreshCaptcha();
    } finally {
      setOtpSending(false);
    }
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    if (setError) setError("");

    // Validate CAPTCHA
    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setCaptchaError("Incorrect CAPTCHA code. Please try again.");
      refreshCaptcha();
      return;
    }

    if (verifyWithOtp) {
      // Send OTP to email and transition to OTP verification screen
      await handleSendRegisterOtp();
    } else {
      // Direct registration without OTP
      try {
        await onSubmit(e);
      } catch (err) {
        refreshCaptcha();
      }
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    if (setError) setError("");

    if (!regOtp.trim() || regOtp.trim().length < 6) {
      setLocalError("Please enter the complete 6-digit OTP code.");
      return;
    }

    setOtpVerifying(true);
    try {
      await onSubmit(e, regOtp.trim());
    } catch (err) {
      setLocalError(err.message || "Invalid OTP code.");
    } finally {
      setOtpVerifying(false);
    }
  };

  const displayedError = localError || error;

  return (
    <div className="modal-overlay">
      <div className="register-modal">
        <button className="close-modal" onClick={onClose} type="button">
          ×
        </button>

        <div className="register-left">
          <div className="register-brand">
            <span>⌕</span>
            FindBack
          </div>

          <div>
            <span className="register-label">UNIVERSITY LOST & FOUND</span>
            <h2>
              Create your
              <br />
              account.
            </h2>
            <p>
              Join your campus community and help make lost & found easier for everyone.
            </p>

            <div className="benefits">
              <span>✓ Report lost items</span>
              <span>✓ Report found belongings</span>
              <span>✓ Search community reports</span>
              <span>✓ Reconnect with what matters</span>
            </div>
          </div>

          <div className="register-decoration">⌕</div>
        </div>

        <div className="register-right">
          {regStep === "details" ? (
            <>
              <div className="auth-heading">
                <span>GET STARTED</span>
                <h2>Create Account</h2>
                <p>Fill in your details to get started.</p>
              </div>

              {displayedError && <div className="form-error">{displayedError}</div>}

              <form onSubmit={handleDetailsSubmit}>
                <label>
                  Full Name
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </label>

                <label>
                  University Email
                  <input
                    type="email"
                    placeholder="you@university.edu"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </label>

                <label>
                  Student ID
                  <input
                    type="text"
                    placeholder="Enter your student ID"
                    value={form.studentId}
                    onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                    required
                  />
                </label>

                <label>
                  Password
                  <input
                    type="password"
                    placeholder="Create a password (min. 6 characters)"
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                </label>

                {/* VERIFY WITH OTP OPTION */}
                <div className="register-otp-option-card">
                  <label className="register-otp-toggle-label">
                    <input
                      type="checkbox"
                      className="register-otp-checkbox"
                      checked={verifyWithOtp}
                      onChange={(e) => setVerifyWithOtp(e.target.checked)}
                    />
                    <div className="register-otp-toggle-body">
                      <div className="register-otp-toggle-title">
                        <span>🛡️ Verify Email with OTP</span>
                        <span className="otp-recommended-badge">Recommended</span>
                      </div>
                      <span className="register-otp-toggle-sub">
                        Sends a 6-digit code to verify your university email before account creation.
                      </span>
                    </div>
                  </label>
                </div>

                {/* CAPTCHA */}
                <CaptchaBox
                  captchaCode={captchaCode}
                  onRefresh={refreshCaptcha}
                  userInput={captchaInput}
                  onUserInputChange={(e) => {
                    setCaptchaInput(e.target.value.toUpperCase());
                    if (captchaError) setCaptchaError("");
                  }}
                />
                {captchaError && (
                  <div className="captcha-error-alert">⚠️ {captchaError}</div>
                )}

                <button
                  className="submit-button register-submit-btn"
                  disabled={loading || otpSending}
                  type="submit"
                >
                  {otpSending
                    ? "Sending Verification OTP..."
                    : loading
                    ? "Creating account..."
                    : verifyWithOtp
                    ? "Verify with OTP & Register"
                    : "Create Account"}
                  {!loading && !otpSending && <span>→</span>}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* STEP 2: OTP VERIFICATION */}
              <div className="auth-heading">
                <span>EMAIL VERIFICATION</span>
                <h2>Enter Verification Code</h2>
                <p>
                  We sent a 6-digit OTP to <strong>{form.email}</strong>. Please enter it below
                  to complete your registration.
                </p>
              </div>

              {displayedError && <div className="form-error">{displayedError}</div>}

              <form onSubmit={handleOtpSubmit}>
                <label>
                  6-Digit OTP Code
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    className="reg-otp-code-input"
                    placeholder="••••••"
                    value={regOtp}
                    onChange={(e) => setRegOtp(e.target.value.replace(/\D/g, ""))}
                    autoFocus
                    required
                  />
                </label>

                <div className="reg-otp-resend-row">
                  {resendTimer > 0 ? (
                    <span className="resend-countdown">
                      Resend code in <strong>{resendTimer}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="resend-otp-btn"
                      disabled={otpSending}
                      onClick={handleSendRegisterOtp}
                    >
                      {otpSending ? "Sending..." : "Didn't receive code? Resend OTP"}
                    </button>
                  )}
                </div>

                <button
                  className="submit-button"
                  disabled={otpVerifying || loading}
                  type="submit"
                >
                  {otpVerifying || loading
                    ? "Verifying & Creating Account..."
                    : "Confirm & Complete Registration"}
                  {!otpVerifying && !loading && <span>→</span>}
                </button>

                <button
                  type="button"
                  className="otp-back-btn"
                  onClick={() => {
                    setRegStep("details");
                    setLocalError("");
                    refreshCaptcha();
                  }}
                >
                  ← Edit registration details
                </button>
              </form>
            </>
          )}

          <div className="switch-auth">
            Already have an account?
            <button onClick={openLogin}>Login</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   REPORT MODAL
========================================================= */

function ReportModal({
  type,
  form,
  setForm,
  loading,
  error,
  onChange,
  onClose,
  onSubmit,
}) {
  const isLost =
    type === "LOST";

  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose a valid image (PNG, JPG, WEBP, GIF).");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setUploadError("File is too large. Please select an image under 25MB.");
      return;
    }

    setUploadError("");
    setIsCompressing(true);

    try {
      const result = await compressImageFile(file);
      if (setForm) {
        setForm((current) => ({
          ...current,
          image: result.dataUrl,
          imageMeta: {
            name: result.name,
            sizeKb: result.sizeKb,
          },
        }));
      }
    } catch (err) {
      console.error("Image processing error:", err);
      setUploadError("Could not optimize photo. Please try a different image.");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleRemoveImage = () => {
    if (setForm) {
      setForm((current) => ({
        ...current,
        image: "",
        imageMeta: null,
      }));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setUploadError("");
  };

  return (
    <div className="modal-overlay">

      <div className="report-modal">

        <button
          className="close-modal"
          onClick={onClose}
        >
          ×
        </button>

        <div className="report-modal-heading">

          <div
            className={`report-modal-icon ${
              isLost
                ? "modal-lost"
                : "modal-found"
            }`}
          >
            {isLost
              ? "⌕"
              : "✓"}
          </div>

          <span>
            {isLost
              ? "LOST ITEM REPORT"
              : "FOUND ITEM REPORT"}
          </span>

          <h2>
            {isLost
              ? "Report Lost Item"
              : "Report Found Item"}
          </h2>

          <p>
            Add the details so
            your campus community
            can help.
          </p>

        </div>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <form
          onSubmit={onSubmit}
        >

          <div className="form-two">

            <label>
              Item Title

              <input
                name="title"
                type="text"
                placeholder="e.g. Black Wallet"
                value={form.title}
                onChange={onChange}
                required
              />

            </label>

            <label>
              Category

              <select
                name="category"
                value={
                  form.category
                }
                onChange={onChange}
              >

                <option value="">
                  Select category
                </option>

                <option value="Electronics">
                  Electronics
                </option>

                <option value="Wallet">
                  Wallet
                </option>

                <option value="Documents">
                  Documents
                </option>

                <option value="Bag">
                  Bag
                </option>

                <option value="Clothing">
                  Clothing
                </option>

                <option value="Keys">
                  Keys
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

            </label>

          </div>

          <label>
            Description

            <textarea
              name="description"
              placeholder="Describe the item..."
              value={
                form.description
              }
              onChange={onChange}
              required
            />

          </label>

          <div className="form-two">

            <label>
              Location

              <input
                name="location"
                type="text"
                placeholder="e.g. University Library"
                value={
                  form.location
                }
                onChange={onChange}
                required
              />

            </label>

            <label>
              Date

              <input
                name="date"
                type="date"
                value={form.date}
                onChange={onChange}
                required
              />

            </label>

          </div>

          {/* DIRECT DEVICE IMAGE UPLOAD */}
          <div className="report-upload-group">
            <div className="report-upload-label-row">
              <span className="upload-label-text">
                Item Photo <span className="optional">(optional)</span>
              </span>
              {form.image && (
                <span className="upload-badge-pill">✓ Photo Attached</span>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="report-file-input"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />

            {!form.image ? (
              <div
                className={`report-upload-dropzone ${
                  isDragging ? "dropzone-active" : ""
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
              >
                {isCompressing ? (
                  <div className="dropzone-loading">
                    <div className="dropzone-spinner" />
                    <span className="dropzone-loading-text">
                      Optimizing photo for dashboard...
                    </span>
                  </div>
                ) : (
                  <div className="dropzone-body">
                    <div className="dropzone-icon-circle">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                    <div className="dropzone-texts">
                      <strong className="dropzone-main-title">
                        Upload photo from device
                      </strong>
                      <p className="dropzone-sub-title">
                        Click to browse or drag & drop (JPG, PNG, WEBP)
                      </p>
                    </div>
                    <span className="dropzone-browse-btn">
                      Choose File
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="report-image-preview-card">
                <div className="preview-thumb-box">
                  <img
                    src={form.image}
                    alt="Uploaded item preview"
                    className="preview-thumb-img"
                  />
                </div>
                <div className="preview-details">
                  <div className="preview-details-top">
                    <span className="preview-filename">
                      {form.imageMeta?.name || "Uploaded Photo"}
                    </span>
                    <span className="preview-tag">
                      {form.imageMeta?.sizeKb
                        ? `${form.imageMeta.sizeKb} KB`
                        : "Ready"}
                    </span>
                  </div>
                  <p className="preview-desc">
                    Photo optimized for dashboard display.
                  </p>
                  <div className="preview-btn-row">
                    <button
                      type="button"
                      className="preview-btn-change"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change Photo
                    </button>
                    <button
                      type="button"
                      className="preview-btn-remove"
                      onClick={handleRemoveImage}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}

            {uploadError && (
              <div className="upload-error-banner">
                ⚠️ {uploadError}
              </div>
            )}
          </div>

          <button
            className={`submit-button report-submit ${
              isLost
                ? "submit-lost"
                : "submit-found"
            }`}
            disabled={loading || isCompressing}
            type="submit"
          >

            {loading
              ? "Submitting..."
              : isCompressing
              ? "Optimizing Photo..."
              : isLost
              ? "Submit Lost Report"
              : "Submit Found Report"}

            {!loading && !isCompressing && (
              <span>
                →
              </span>
            )}

          </button>

        </form>

      </div>

    </div>
  );
}

/* =========================================================
   TIME AGO FORMATTER
========================================================= */

function formatTimeAgo(dateInput) {
  if (!dateInput) return "just now";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "just now";
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

/* =========================================================
   CHAT MODAL
========================================================= */

function ChatModal({
  activeChat,
  onClose,
  messages,
  loading,
  sending,
  chatText,
  setChatText,
  onSend,
  currentUser,
}) {
  const messagesEndRef = useRef(null);
  const item = activeChat?.item;
  const otherUser = activeChat?.otherUser;
  const isFound = item?.type === "FOUND";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const quickReplies = isFound
    ? [
        "Hi, I think this item belongs to me!",
        "Where can we meet on campus to collect it?",
        "Can I provide proof of ownership?",
      ]
    : [
        "Hi, I found an item matching your description.",
        "Can you describe distinctive marks on it?",
        "I have kept it safely with security.",
      ];

  const currentUserId = currentUser?._id || currentUser?.id;

  return (
    <div
      className="modal-overlay chat-modal-overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="chat-modal-window">
        {/* CHAT HEADER */}
        <div className="chat-modal-header">
          <div className="chat-header-item-info">
            <div
              className={`chat-item-badge ${
                isFound ? "badge-found" : "badge-lost"
              }`}
            >
              {isFound ? "✓ FOUND" : "⌕ LOST"}
            </div>
            <div className="chat-header-text">
              <h4>{item?.title || "Item Discussion"}</h4>
              <p>
                Talking with{" "}
                <strong>{otherUser?.name || "Finder"}</strong>
                {item?.location ? ` · 📍 ${item.location}` : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="close-modal chat-close-btn"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* ITEM SNAPSHOT STRIP */}
        <div className="chat-snapshot-bar">
          <span className="snapshot-label">Item details:</span>
          <span className="snapshot-title">{item?.title}</span>
          {item?.category && (
            <span className="snapshot-cat">{item.category}</span>
          )}
          {item?.date && (
            <span className="snapshot-date">
              📅{" "}
              {new Date(item.date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
        </div>

        {/* CHAT MESSAGES BODY */}
        <div className="chat-messages-container">
          {loading && messages.length === 0 ? (
            <div className="chat-loading-state">
              <div className="chat-spinner" />
              <span>Loading messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-empty-thread">
              <div className="chat-empty-icon">💬</div>
              <h5>Direct conversation with {otherUser?.name || "the user"}</h5>
              <p>
                Ask questions to verify ownership and arrange a safe handover
                on campus.
              </p>
              <div className="quick-replies-list">
                {quickReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="quick-reply-pill"
                    onClick={() => onSend(reply)}
                  >
                    "{reply}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="chat-stream">
              {messages.map((msg) => {
                const isMe =
                  String(
                    msg.sender?._id ||
                      msg.sender?.id ||
                      msg.sender
                  ) === String(currentUserId);
                const senderName = isMe
                  ? "You"
                  : msg.sender?.name || otherUser?.name || "User";
                const timeStr = msg.createdAt
                  ? new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "";

                return (
                  <div
                    key={msg._id || Math.random()}
                    className={`chat-bubble-row ${
                      isMe ? "outgoing" : "incoming"
                    }`}
                  >
                    {!isMe && (
                      <div className="chat-avatar-mini">
                        {senderName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="chat-bubble-content">
                      <div className="chat-bubble-header">
                        <span className="chat-author">{senderName}</span>
                        <span className="chat-timestamp">{timeStr}</span>
                      </div>
                      <div className="chat-bubble-body">{msg.text}</div>
                      {isMe && (
                        <div className="chat-read-status">
                          {msg.read ? "✓✓ Seen" : "✓ Sent"}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* QUICK SUGGESTIONS BAR (if conversation already has messages) */}
        {messages.length > 0 && (
          <div className="chat-quick-bar">
            {quickReplies.slice(0, 2).map((reply, idx) => (
              <button
                key={idx}
                type="button"
                className="quick-bar-chip"
                onClick={() => onSend(reply)}
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* CHAT INPUT FORM */}
        <form
          className="chat-input-form"
          onSubmit={(e) => {
            e.preventDefault();
            onSend();
          }}
        >
          <input
            type="text"
            className="chat-text-input"
            placeholder={`Message ${otherUser?.name || "user"}...`}
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            disabled={sending}
            autoFocus
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={!chatText.trim() || sending}
          >
            {sending ? "..." : "Send ➤"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   NOTIFICATIONS DROPDOWN
========================================================= */

function NotificationsDropdown({
  notifications,
  unreadCount,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onOpenChat,
}) {
  return (
    <div className="notifications-dropdown-menu">
      <div className="notif-dropdown-header">
        <div className="notif-header-title">
          <h4>Notifications</h4>
          {unreadCount > 0 && (
            <span className="notif-unread-tag">{unreadCount} new</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            className="notif-mark-all-btn"
            onClick={onMarkAllRead}
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="notif-list">
        {notifications.length === 0 ? (
          <div className="notif-empty-box">
            <span className="notif-empty-icon">🔔</span>
            <p>No notifications yet</p>
            <small>
              When someone messages you about an item, you will see it here.
            </small>
          </div>
        ) : (
          notifications.map((n) => {
            const timeAgo = formatTimeAgo(n.createdAt);
            const senderName = n.sender?.name || "Student";
            const senderInitial = senderName.charAt(0).toUpperCase();

            return (
              <div
                key={n._id}
                className={`notif-item ${!n.read ? "unread" : ""}`}
                onClick={() => {
                  if (!n.read) onMarkRead(n._id);
                  onOpenChat(n);
                }}
              >
                <div className="notif-avatar">{senderInitial}</div>
                <div className="notif-info">
                  <div className="notif-info-top">
                    <strong className="notif-sender">{senderName}</strong>
                    <span className="notif-time">{timeAgo}</span>
                  </div>
                  <p className="notif-content">{n.content}</p>
                  {n.itemId?.title && (
                    <span className="notif-item-tag">
                      📦 {n.itemId.title}
                    </span>
                  )}
                </div>
                {!n.read && <span className="notif-unread-dot" />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* =========================================================
   NOTIFICATION TOAST
========================================================= */

function NotificationToast({ notification, onOpen, onClose }) {
  if (!notification) return null;
  return (
    <div className="notification-toast" onClick={onOpen}>
      <div className="toast-icon">💬</div>
      <div className="toast-body">
        <strong>{notification.sender?.name || "New Message"}</strong>
        <p>{notification.content}</p>
      </div>
      <button
        type="button"
        className="toast-close"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        ×
      </button>
    </div>
  );
}

/* =========================================================
   AI BOT FORMATTED MESSAGE
========================================================= */

function FormattedBotMessage({ text }) {
  if (!text) return null;

  const paragraphs = text.split("\n\n");

  const renderTokens = (str) => {
    const parts = str.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="ai-bot-bold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <em key={idx} className="ai-bot-italic">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  return (
    <div className="ai-bot-formatted-content">
      {paragraphs.map((para, pIdx) => {
        const lines = para.split("\n");
        return (
          <div key={pIdx} className="ai-bot-para">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              const isBullet =
                trimmed.startsWith("•") || trimmed.startsWith("-");
              const isNumbered = /^\d+[.)]\s/.test(trimmed);

              if (isBullet) {
                const cleanContent = trimmed.replace(/^[•\-]\s*/, "");
                return (
                  <div key={lIdx} className="ai-bot-list-item bullet">
                    <span className="ai-bot-bullet-symbol">✦</span>
                    <span className="ai-bot-list-text">
                      {renderTokens(cleanContent)}
                    </span>
                  </div>
                );
              }

              if (isNumbered) {
                const match = trimmed.match(/^(\d+[.)])/);
                const prefix = match ? match[1] : `${lIdx + 1}.`;
                const cleanContent = trimmed.replace(/^\d+[.)]\s*/, "");
                return (
                  <div key={lIdx} className="ai-bot-list-item numbered">
                    <span className="ai-bot-number-tag">{prefix}</span>
                    <span className="ai-bot-list-text">
                      {renderTokens(cleanContent)}
                    </span>
                  </div>
                );
              }

              return (
                <div key={lIdx} className="ai-bot-line">
                  {renderTokens(line)}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
   AI CHATBOT WIDGET
========================================================= */

function AiChatbotWidget({
  messages,
  input,
  setInput,
  isTyping,
  onSend,
  onReset,
  onClose,
}) {
  const streamEndRef = useRef(null);

  useEffect(() => {
    streamEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const defaultQuickReplies = [
    "👑 Who is the founder?",
    "❓ How do I use FindFound?",
    "🔍 How to report a lost item?",
    "🤖 How does AI matching work?",
    "💬 How to chat with a finder?",
    "🛡️ Safety tips",
  ];

  const lastBotMsg = [...messages].reverse().find((m) => m.sender === "bot");
  const quickReplies =
    lastBotMsg?.quickReplies && lastBotMsg.quickReplies.length > 0
      ? lastBotMsg.quickReplies
      : defaultQuickReplies;

  return (
    <div className="ai-bot-widget-modal">
      {/* HEADER */}
      <div className="ai-bot-header">
        <div className="ai-bot-header-info">
          <div className="ai-bot-avatar-wrap">
            <span className="ai-bot-avatar-icon">🤖</span>
            <span className="ai-bot-pulse-status" />
          </div>
          <div className="ai-bot-header-text">
            <div className="ai-bot-title-line">
              <h4>FindFound AI Assistant</h4>
              <span className="ai-bot-verified-chip">Campus AI</span>
            </div>
            <p className="ai-bot-subtext">
              Platform Guide • Chandigarh University (CU)
            </p>
          </div>
        </div>
        <div className="ai-bot-header-controls">
          <button
            type="button"
            className="ai-bot-header-btn"
            onClick={onReset}
            title="Reset conversation"
          >
            🧹 Reset
          </button>
          <button
            type="button"
            className="ai-bot-header-close"
            onClick={onClose}
            title="Close Assistant"
          >
            ×
          </button>
        </div>
      </div>

      {/* QUICK SUGGESTION CHIPS */}
      <div className="ai-bot-chips-container">
        <div className="ai-bot-chips-scroll">
          {quickReplies.map((reply, idx) => (
            <button
              key={idx}
              type="button"
              className="ai-bot-chip-btn"
              onClick={() => onSend(reply)}
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      {/* MESSAGE STREAM */}
      <div className="ai-bot-messages-body">
        {messages.map((msg) => {
          const isBot = msg.sender === "bot";
          return (
            <div
              key={msg.id || Math.random()}
              className={`ai-bot-chat-row ${isBot ? "bot" : "user"}`}
            >
              {isBot && (
                <div className="ai-bot-row-avatar">
                  🤖
                </div>
              )}
              <div className="ai-bot-bubble">
                <div className="ai-bot-bubble-meta">
                  <span className="ai-bot-bubble-author">
                    {isBot ? "FindFound AI" : "You"}
                  </span>
                  <span className="ai-bot-bubble-time">{msg.time}</span>
                </div>
                {isBot ? (
                  <FormattedBotMessage text={msg.text} />
                ) : (
                  <div className="ai-bot-user-content">{msg.text}</div>
                )}
              </div>
            </div>
          );
        })}

        {/* TYPING INDICATOR */}
        {isTyping && (
          <div className="ai-bot-chat-row bot">
            <div className="ai-bot-row-avatar">🤖</div>
            <div className="ai-bot-bubble ai-bot-typing-row">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-hint">FindFound AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={streamEndRef} />
      </div>

      {/* INPUT FORM */}
      <form
        className="ai-bot-footer-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
      >
        <input
          type="text"
          className="ai-bot-input-field"
          placeholder="Ask anything about FindFound, founder, features..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isTyping}
          autoFocus
        />
        <button
          type="submit"
          className="ai-bot-send-btn"
          disabled={!input.trim() || isTyping}
        >
          {isTyping ? "..." : "Send ➤"}
        </button>
      </form>
    </div>
  );
}

export default App;