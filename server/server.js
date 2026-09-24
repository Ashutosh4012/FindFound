const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

dotenv.config({ path: __dirname + "/.env" });

const app = express();

const PORT = process.env.PORT || 5001;

let rawMongoUri =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/findback";

// Auto-clean placeholder angle brackets if present in connection string
const MONGO_URI = rawMongoUri.replace(/<([^>]+)>/g, "$1");

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "findback_super_secret_change_this";

/* =========================================================
   EMAIL / OTP CONFIGURATION
========================================================= */

const OTP_EXPIRY_MINUTES = 5;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_SECONDS = 30;

const mailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT || 587),
  secure: String(process.env.EMAIL_SECURE || "false") === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOtpEmail(email, otp, purpose = "Login") {
  const isRegister = purpose === "Registration";
  await mailTransporter.sendMail({
    from:
      process.env.EMAIL_FROM ||
      process.env.EMAIL_USER,

    to: email,

    subject: isRegister
      ? "Your FindBack Registration OTP"
      : "Your FindBack Login OTP",

    text: isRegister
      ? `Your FindBack registration verification OTP is ${otp}. This code expires in ${OTP_EXPIRY_MINUTES} minutes.`
      : `Your FindBack login OTP is ${otp}. This code expires in ${OTP_EXPIRY_MINUTES} minutes.`,

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e2d9f3; border-radius: 12px;">
        <h2 style="color: #6d4aff; margin-top: 0;">FindBack</h2>

        <p>Hello,</p>

        <p>
          ${
            isRegister
              ? "Use the following One-Time Password (OTP) to verify your university email and complete your FindBack registration:"
              : "Use the following OTP to sign in to your FindBack account:"
          }
        </p>

        <div style="
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          padding: 20px;
          text-align: center;
          background: #f5f3ff;
          color: #5b21b6;
          border-radius: 10px;
          margin: 20px 0;
        ">
          ${otp}
        </div>

        <p style="color: #666; font-size: 13px;">
          This verification OTP will expire in <strong>${OTP_EXPIRY_MINUTES} minutes</strong>.
        </p>

        <p style="color: #888; font-size: 12px;">
          If you did not request this registration, please safely ignore this message.
        </p>

        <p style="margin-bottom: 0; color: #444;">— FindBack Team</p>
      </div>
    `,
  });
}

/* =========================================================
   MIDDLEWARE
========================================================= */

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5175",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // Allow any localhost / 127.0.0.1 port
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      // Allow deployed domains or whitelisted origins
      if (
        origin.endsWith(".onrender.com") ||
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".netlify.app") ||
        origin.endsWith(".github.io") ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      // Allow all origins by default for public API
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

/* =========================================================
   DATABASE
========================================================= */

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:");
    console.error(error.message);
  });

/* =========================================================
   USER MODEL
========================================================= */

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

/* =========================================================
   OTP MODEL
========================================================= */

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    codeHash: {
      type: String,
      required: true,
    },

    expiresAt: {
  type: Date,
  required: true,
},

    attempts: {
      type: Number,
      default: 0,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

/*
  Automatically remove expired OTP documents.
*/
otpSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const OtpCode =
  mongoose.models.OtpCode ||
  mongoose.model("OtpCode", otpSchema);

/* =========================================================
   ITEM MODEL
========================================================= */

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      default: "Other",
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    type: {
      type: String,
      enum: ["LOST", "FOUND"],
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["ACTIVE", "RESOLVED"],
      default: "ACTIVE",
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Item = mongoose.model("Item", itemSchema);
/* =========================================================
   MATCH MODEL
========================================================= */

const matchSchema = new mongoose.Schema(
  {
    lostItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    foundItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    score: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "REJECTED"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

const Match = mongoose.model("Match", matchSchema);

/* =========================================================
   MESSAGE MODEL
========================================================= */

const messageSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ itemId: 1, sender: 1, recipient: 1, createdAt: 1 });

const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);

/* =========================================================
   NOTIFICATION MODEL
========================================================= */

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    type: {
      type: String,
      enum: ["NEW_MESSAGE", "ITEM_INQUIRY"],
      default: "NEW_MESSAGE",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

/* =========================================================
   ITEM MATCHING ALGORITHM
========================================================= */

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function calculateTextSimilarity(text1, text2) {
  const words1 = new Set(
    normalizeText(text1)
      .split(" ")
      .filter((word) => word.length > 2)
  );

  const words2 = new Set(
    normalizeText(text2)
      .split(" ")
      .filter((word) => word.length > 2)
  );

  if (!words1.size || !words2.size) {
    return 0;
  }

  let commonWords = 0;

  for (const word of words1) {
    if (words2.has(word)) {
      commonWords++;
    }
  }

  const totalUniqueWords =
    new Set([...words1, ...words2]).size;

  return totalUniqueWords
    ? commonWords / totalUniqueWords
    : 0;
}

function calculateDateScore(date1, date2) {
  const first = new Date(date1);
  const second = new Date(date2);

  const difference =
    Math.abs(first.getTime() - second.getTime()) /
    (1000 * 60 * 60 * 24);

  if (difference === 0) return 1;
  if (difference <= 1) return 0.8;
  if (difference <= 2) return 0.6;
  if (difference <= 5) return 0.3;

  return 0;
}

function calculateLocationScore(location1, location2) {
  return calculateTextSimilarity(
    location1,
    location2
  );
}

function calculateMatchScore(lostItem, foundItem) {
  const categoryScore =
    normalizeText(lostItem.category) ===
    normalizeText(foundItem.category)
      ? 1
      : 0;

  const locationScore =
    calculateLocationScore(
      lostItem.location,
      foundItem.location
    );

  const dateScore =
    calculateDateScore(
      lostItem.date,
      foundItem.date
    );

  const titleScore =
    calculateTextSimilarity(
      lostItem.title,
      foundItem.title
    );

  const descriptionScore =
    calculateTextSimilarity(
      lostItem.description,
      foundItem.description
    );

  const finalScore =
    categoryScore * 20 +
    locationScore * 20 +
    dateScore * 15 +
    titleScore * 15 +
    descriptionScore * 30;

  return Math.round(finalScore);
}
/* =========================================================
   FIND POSSIBLE MATCHES
========================================================= */

async function findPossibleMatches(newItem) {
  try {
    const oppositeType =
      newItem.type === "LOST"
        ? "FOUND"
        : "LOST";

    const candidates = await Item.find({
      type: oppositeType,
      status: "ACTIVE",
      _id: {
        $ne: newItem._id,
      },
    });

    for (const candidate of candidates) {
      const lostItem =
        newItem.type === "LOST"
          ? newItem
          : candidate;

      const foundItem =
        newItem.type === "FOUND"
          ? newItem
          : candidate;

      const score =
        calculateMatchScore(
          lostItem,
          foundItem
        );

      console.log(
        `🔎 Match score: ${score}% | Lost: ${lostItem.title} | Found: ${foundItem.title}`
      );

      // Only create a match if confidence is 60%+
      if (score >= 60) {
        const existingMatch =
          await Match.findOne({
            lostItem: lostItem._id,
            foundItem: foundItem._id,
          });

        if (!existingMatch) {
          await Match.create({
            lostItem: lostItem._id,
            foundItem: foundItem._id,
            score,
          });

          console.log(
            `🤖 Possible match created: ${score}%`
          );
        }
      }
    }
  } catch (error) {
    console.error(
      "MATCHING ERROR:",
      error
    );
  }
}

/* =========================================================
   HELPER
========================================================= */

function createToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      studentId: user.studentId,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    studentId: user.studentId,
  };
}

/* =========================================================
   AUTH MIDDLEWARE
========================================================= */

function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, JWT_SECRET);

    req.userId = decoded.id;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired login session.",
    });
  }
}

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FindBack API is running",
    port: PORT,
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "FindBack backend is healthy",
  });
});

/* =========================================================
   COMMUNITY LIVE STATS (DYNAMIC COUNTERS)
========================================================= */

app.get("/api/stats", async (req, res) => {
  try {
    const activeStudents = await User.countDocuments();
    const totalItems = await Item.countDocuments();
    const itemsFound = await Item.countDocuments({ type: "FOUND" });
    const itemsLost = await Item.countDocuments({ type: "LOST" });
    const resolvedItems = await Item.countDocuments({ status: "RESOLVED" });

    res.json({
      success: true,
      stats: {
        activeStudents,
        totalItems,
        itemsFound,
        itemsLost,
        resolvedItems,
      },
    });
  } catch (error) {
    console.error("Error fetching community stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching community stats",
    });
  }
});

/* =========================================================
   SEND REGISTRATION OTP
========================================================= */

app.post("/api/auth/send-register-otp", async (req, res) => {
  try {
    const { email, studentId } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "University email is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already registered
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists. Please log in.",
      });
    }

    // Check if studentId already registered (if provided)
    if (studentId) {
      const normalizedStudentId = studentId.trim();
      const existingStudent = await User.findOne({
        studentId: normalizedStudentId,
      });
      if (existingStudent) {
        return res.status(409).json({
          success: false,
          message: "This student ID is already registered.",
        });
      }
    }

    // Prevent repeated OTP requests within cooldown
    const existingOtp = await OtpCode.findOne({
      email: normalizedEmail,
    });

    if (existingOtp) {
      const secondsSinceCreation =
        (Date.now() - existingOtp.createdAt.getTime()) / 1000;

      if (secondsSinceCreation < OTP_RESEND_SECONDS) {
        const waitSeconds = Math.ceil(
          OTP_RESEND_SECONDS - secondsSinceCreation
        );
        return res.status(429).json({
          success: false,
          message: `Please wait ${waitSeconds}s before requesting another OTP.`,
        });
      }

      await OtpCode.deleteOne({ _id: existingOtp._id });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const codeHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await OtpCode.create({
      email: normalizedEmail,
      codeHash,
      expiresAt,
      attempts: 0,
    });

    await sendOtpEmail(normalizedEmail, otp, "Registration");

    return res.json({
      success: true,
      message: "Verification OTP sent to your university email.",
    });
  } catch (error) {
    console.error("SEND REGISTER OTP ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to send verification OTP. Please try again.",
    });
  }
});

/* =========================================================
   REGISTER
========================================================= */

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, studentId, password, otpCode } = req.body;

    if (!name || !email || !studentId || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 6 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedStudentId = studentId.trim();

    // Verify OTP if provided
    if (otpCode) {
      const normalizedOtp = String(otpCode).trim();
      const otpRecord = await OtpCode.findOne({
        email: normalizedEmail,
      });

      if (!otpRecord) {
        return res.status(400).json({
          success: false,
          message:
            "No active OTP request found for this email. Please request an OTP first.",
        });
      }

      if (otpRecord.expiresAt.getTime() <= Date.now()) {
        await OtpCode.deleteOne({ _id: otpRecord._id });
        return res.status(400).json({
          success: false,
          message: "The OTP code has expired. Please request a new code.",
        });
      }

      if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) {
        await OtpCode.deleteOne({ _id: otpRecord._id });
        return res.status(400).json({
          success: false,
          message:
            "Too many incorrect attempts. Please request a new OTP code.",
        });
      }

      const isMatch = await bcrypt.compare(
        normalizedOtp,
        otpRecord.codeHash
      );

      if (!isMatch) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        const remaining = OTP_MAX_ATTEMPTS - otpRecord.attempts;
        return res.status(400).json({
          success: false,
          message: `Incorrect OTP code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
        });
      }

      // OTP verified successfully
      await OtpCode.deleteOne({ _id: otpRecord._id });
    }

    const existingEmail = await User.findOne({
      email: normalizedEmail,
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists.",
      });
    }

    const existingStudent = await User.findOne({
      studentId: normalizedStudentId,
    });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message:
          "This student ID is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      studentId: normalizedStudentId,
      password: hashedPassword,
    });

    const token = createToken(user);

    return res.status(201).json({
      success: true,
      message: otpCode
        ? "Email verified & account created successfully."
        : "Account created successfully.",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create account.",
    });
  }
});

/* =========================================================
   LOGIN WITH PASSWORD
========================================================= */

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = createToken(user);

    return res.json({
      success: true,
      message: "Login successful.",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to login.",
    });
  }
});

/* =========================================================
   SEND LOGIN OTP
========================================================= */

app.post("/api/auth/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "No FindBack account exists with this email.",
      });
    }

    /*
      Prevent repeated OTP requests.
    */

    const existingOtp = await OtpCode.findOne({
      email: normalizedEmail,
    });

    if (existingOtp) {
      const secondsSinceCreation =
        (Date.now() -
          existingOtp.createdAt.getTime()) /
        1000;

      if (
        secondsSinceCreation <
        OTP_RESEND_SECONDS
      ) {
        const waitSeconds = Math.ceil(
          OTP_RESEND_SECONDS -
            secondsSinceCreation
        );

        return res.status(429).json({
          success: false,
          message: `Please wait ${waitSeconds} seconds before requesting another OTP.`,
        });
      }

      await OtpCode.deleteOne({
        _id: existingOtp._id,
      });
    }

    /*
      Generate secure 6-digit OTP.
    */

    const otp = crypto
      .randomInt(100000, 1000000)
      .toString();

    /*
      Hash OTP before storing.
    */

    const codeHash = await bcrypt.hash(
      otp,
      10
    );

    const expiresAt = new Date(
      Date.now() +
        OTP_EXPIRY_MINUTES * 60 * 1000
    );

    await OtpCode.create({
      email: normalizedEmail,
      codeHash,
      expiresAt,
      attempts: 0,
    });

    await sendOtpEmail(
      normalizedEmail,
      otp
    );

    return res.json({
      success: true,
      message:
        "OTP sent successfully to your email.",
    });
  } catch (error) {
    console.error(
      "SEND OTP ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to send OTP. Please try again.",
    });
  }
});

/* =========================================================
   VERIFY LOGIN OTP
========================================================= */

app.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message:
          "Email and OTP are required.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const normalizedCode =
      code.trim();

    if (!/^\d{6}$/.test(normalizedCode)) {
      return res.status(400).json({
        success: false,
        message:
          "OTP must be a 6-digit number.",
      });
    }

    const otp = await OtpCode.findOne({
      email: normalizedEmail,
    });

    if (!otp) {
      return res.status(400).json({
        success: false,
        message:
          "OTP not found or expired. Please request a new OTP.",
      });
    }

    if (
      otp.expiresAt.getTime() <=
      Date.now()
    ) {
      await OtpCode.deleteOne({
        _id: otp._id,
      });

      return res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please request a new OTP.",
      });
    }

    if (
      otp.attempts >= OTP_MAX_ATTEMPTS
    ) {
      await OtpCode.deleteOne({
        _id: otp._id,
      });

      return res.status(429).json({
        success: false,
        message:
          "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    const matches =
      await bcrypt.compare(
        normalizedCode,
        otp.codeHash
      );

    if (!matches) {
      otp.attempts += 1;

      await otp.save();

      return res.status(401).json({
        success: false,
        message: `Incorrect OTP. ${
          OTP_MAX_ATTEMPTS -
          otp.attempts
        } attempts remaining.`,
      });
    }

    /*
      OTP is valid.
      Delete it immediately so it cannot be reused.
    */

    await OtpCode.deleteOne({
      _id: otp._id,
    });

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User account not found.",
      });
    }

    const token = createToken(user);

    return res.json({
      success: true,
      message:
        "OTP verified. Login successful.",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error(
      "VERIFY OTP ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify OTP.",
    });
  }
});

/* =========================================================
   GET CURRENT USER
========================================================= */

app.get(
  "/api/auth/me",
  authenticate,
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.userId
        ).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      res.json({
        success: true,
        user: publicUser(user),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Unable to load user.",
      });
    }
  }
);

/* =========================================================
   GET ALL ITEMS
   EVERY USER CAN SEE EVERY REPORT
========================================================= */

app.get("/api/items", async (req, res) => {
  try {
    const items = await Item.find()
      .populate(
        "reportedBy",
        "name email studentId"
      )
      .sort({
        createdAt: -1,
      });

    res.json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    console.error(
      "GET ITEMS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to load reports.",
      items: [],
    });
  }
});

/* =========================================================
   SEARCH ITEMS
========================================================= */

app.get(
  "/api/items/search",
  async (req, res) => {
    try {
      const q =
        (req.query.q || "").trim();

      if (!q) {
        const items =
          await Item.find()
            .populate(
              "reportedBy",
              "name email studentId"
            )
            .sort({
              createdAt: -1,
            });

        return res.json({
          success: true,
          count: items.length,
          items,
        });
      }

      const regex = new RegExp(q, "i");

      const items = await Item.find({
        $or: [
          { title: regex },
          { description: regex },
          { category: regex },
          { location: regex },
          { type: regex },
        ],
      })
        .populate(
          "reportedBy",
          "name email studentId"
        )
        .sort({
          createdAt: -1,
        });

      res.json({
        success: true,
        count: items.length,
        items,
      });
    } catch (error) {
      console.error(
        "SEARCH ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Search failed.",
        items: [],
      });
    }
  }
);

/* =========================================================
   CREATE LOST / FOUND REPORT
========================================================= */

app.post(
  "/api/items",
  authenticate,
  async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        location,
        date,
        type,
        image,
      } = req.body;

      if (
        !title ||
        !description ||
        !location ||
        !date ||
        !type
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Title, description, location, date and report type are required.",
        });
      }

      if (
        !["LOST", "FOUND"].includes(type)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Report type must be LOST or FOUND.",
        });
      }

      const item = await Item.create({
        title: title.trim(),
        description:
          description.trim(),
        category:
          category?.trim() || "Other",
        location: location.trim(),
        date: new Date(date),
        type,
        image: image?.trim() || "",
        status: "ACTIVE",
        reportedBy: req.userId,
      });

      const populatedItem =
        await Item.findById(
          item._id
        ).populate(
          "reportedBy",
          "name email studentId"
        );
        await findPossibleMatches(item);

      res.status(201).json({
        success: true,
        message:
          type === "LOST"
            ? "Lost item reported successfully."
            : "Found item reported successfully.",
        item: populatedItem,
      });
    } catch (error) {
      console.error(
        "CREATE ITEM ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to create report.",
      });
    }
  }
);

/* =========================================================
   GET ONE ITEM
========================================================= */

app.get(
  "/api/items/:id",
  async (req, res) => {
    try {
      const item =
        await Item.findById(
          req.params.id
        ).populate(
          "reportedBy",
          "name email studentId"
        );

      if (!item) {
        return res.status(404).json({
          success: false,
          message:
            "Report not found.",
        });
      }

      res.json({
        success: true,
        item,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          "Invalid report ID.",
      });
    }
  }
);

/* =========================================================
   DELETE OWN REPORT
========================================================= */

app.delete(
  "/api/items/:id",
  authenticate,
  async (req, res) => {
    try {
      const item =
        await Item.findOne({
          _id: req.params.id,
          reportedBy: req.userId,
        });

      if (!item) {
        return res.status(404).json({
          success: false,
          message:
            "Report not found or you are not allowed to delete it.",
        });
      }

      await Item.deleteOne({
        _id: item._id,
      });

      res.json({
        success: true,
        message:
          "Report deleted successfully.",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          "Unable to delete report.",
      });
    }
  }
);

/* =========================================================
   GET MATCHES FOR LOGGED-IN USER
========================================================= */

app.get("/api/matches", authenticate, async (req, res) => {
  try {
    const matches = await Match.find({
      status: {
        $in: ["PENDING", "CONFIRMED"],
      },
    })
      .populate({
        path: "lostItem",
        populate: {
          path: "reportedBy",
          select: "name email studentId",
        },
      })
      .populate({
        path: "foundItem",
        populate: {
          path: "reportedBy",
          select: "name email studentId",
        },
      })
      .sort({
        score: -1,
        createdAt: -1,
      });

    // Only return matches where the logged-in user
    // reported either the LOST or FOUND item.
    const userMatches = matches.filter((match) => {
      const lostOwner =
        match.lostItem?.reportedBy?._id?.toString();

      const foundOwner =
        match.foundItem?.reportedBy?._id?.toString();

      return (
        lostOwner === req.userId.toString() ||
        foundOwner === req.userId.toString()
      );
    });

    res.json({
      success: true,
      matches: userMatches,
    });
  } catch (error) {
    console.error("GET MATCHES ERROR:", error);

    res.status(500).json({
      message: "Failed to load matches.",
    });
  }
});

/* =========================================================
   CHAT & MESSAGING ROUTES
========================================================= */

// SEND A MESSAGE
app.post("/api/messages", authenticate, async (req, res) => {
  try {
    const { itemId, recipientId, text } = req.body;

    if (!itemId || !recipientId || !text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Item, recipient, and message text are required.",
      });
    }

    if (req.userId.toString() === recipientId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot message yourself.",
      });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found.",
      });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "Recipient user not found.",
      });
    }

    const sender = await User.findById(req.userId);

    const message = await Message.create({
      itemId,
      sender: req.userId,
      recipient: recipientId,
      text: text.trim(),
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name email studentId")
      .populate("recipient", "name email studentId")
      .populate("itemId", "title type location status image");

    // Automatically create notification for the recipient
    const senderName = sender ? sender.name : "Someone";
    const notification = await Notification.create({
      recipient: recipientId,
      sender: req.userId,
      itemId,
      messageId: message._id,
      type: "NEW_MESSAGE",
      title: `Message from ${senderName}`,
      content: `${text.trim().substring(0, 90)}${text.trim().length > 90 ? "..." : ""}`,
      read: false,
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: populatedMessage,
      notification,
    });
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message.",
    });
  }
});

// GET MESSAGES THREAD BETWEEN CURRENT USER & ANOTHER USER FOR AN ITEM
app.get("/api/messages/thread", authenticate, async (req, res) => {
  try {
    const { itemId, otherUserId } = req.query;

    if (!itemId || !otherUserId) {
      return res.status(400).json({
        success: false,
        message: "itemId and otherUserId query parameters are required.",
      });
    }

    const messages = await Message.find({
      itemId,
      $or: [
        { sender: req.userId, recipient: otherUserId },
        { sender: otherUserId, recipient: req.userId },
      ],
    })
      .populate("sender", "name email studentId")
      .populate("recipient", "name email studentId")
      .sort({ createdAt: 1 });

    // Mark unread messages sent to current user as read
    await Message.updateMany(
      {
        itemId,
        sender: otherUserId,
        recipient: req.userId,
        read: false,
      },
      {
        $set: { read: true },
      }
    );

    // Mark corresponding notifications as read
    await Notification.updateMany(
      {
        itemId,
        sender: otherUserId,
        recipient: req.userId,
        read: false,
      },
      {
        $set: { read: true },
      }
    );

    res.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("GET THREAD ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load messages thread.",
      messages: [],
    });
  }
});

// GET ALL CONVERSATIONS LIST FOR CURRENT USER
app.get("/api/messages/conversations", authenticate, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.userId }, { recipient: req.userId }],
    })
      .populate("sender", "name email studentId")
      .populate("recipient", "name email studentId")
      .populate("itemId", "title type location status image")
      .sort({ createdAt: -1 });

    const conversationMap = new Map();

    for (const msg of messages) {
      if (!msg.itemId || !msg.sender || !msg.recipient) continue;
      const isSender = msg.sender._id.toString() === req.userId.toString();
      const otherUser = isSender ? msg.recipient : msg.sender;

      const key = `${msg.itemId._id.toString()}_${otherUser._id.toString()}`;

      if (!conversationMap.has(key)) {
        conversationMap.set(key, {
          item: msg.itemId,
          otherUser,
          lastMessage: msg,
          unreadCount: 0,
        });
      }

      if (
        msg.recipient._id.toString() === req.userId.toString() &&
        !msg.read
      ) {
        const conv = conversationMap.get(key);
        conv.unreadCount += 1;
      }
    }

    res.json({
      success: true,
      conversations: Array.from(conversationMap.values()),
    });
  } catch (error) {
    console.error("GET CONVERSATIONS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load conversations.",
      conversations: [],
    });
  }
});

/* =========================================================
   NOTIFICATION ROUTES
========================================================= */

// GET ALL NOTIFICATIONS FOR CURRENT USER
app.get("/api/notifications", authenticate, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.userId })
      .populate("sender", "name email studentId")
      .populate("itemId", "title type location status image")
      .sort({ createdAt: -1 })
      .limit(40);

    const unreadCount = await Notification.countDocuments({
      recipient: req.userId,
      read: false,
    });

    res.json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);
    res.status(500).json({
      success: false,
      unreadCount: 0,
      notifications: [],
      message: "Failed to load notifications.",
    });
  }
});

// MARK SINGLE NOTIFICATION AS READ
app.put("/api/notifications/:id/read", authenticate, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.userId },
      { $set: { read: true } },
      { new: true }
    );

    const unreadCount = await Notification.countDocuments({
      recipient: req.userId,
      read: false,
    });

    res.json({
      success: true,
      notification,
      unreadCount,
    });
  } catch (error) {
    console.error("MARK NOTIFICATION READ ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read.",
    });
  }
});

// MARK ALL NOTIFICATIONS AS READ
app.put("/api/notifications/read-all", authenticate, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.userId, read: false },
      { $set: { read: true } }
    );

    res.json({
      success: true,
      message: "All notifications marked as read.",
      unreadCount: 0,
    });
  } catch (error) {
    console.error("READ ALL NOTIFICATIONS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark all as read.",
    });
  }
});

/* =========================================================
   AI CHATBOT ROUTE
========================================================= */

function generateBotReply(userQuery = "") {
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
    query.includes("who built")
  ) {
    return {
      reply: `👑 **Founder of FindFound**\n\nFindFound (FindBack) was founded and developed by **Ashutosh Panda**, a student innovator and engineer from **Chandigarh University (CU)**! 🎓\n\nAshutosh designed FindFound to solve the widespread campus challenge of lost belongings—such as student IDs, laptops, chargers, wallets, and keys. He built this platform combining smart AI matching and peer-to-peer real-time messaging so students can quickly and safely reunite with their lost belongings.`,
      quickReplies: [
        "❓ How do I use FindFound?",
        "🤖 How does AI matching work?",
        "🏫 FindFound @ Chandigarh University",
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
    query.includes("gharuan")
  ) {
    return {
      reply: `🏫 **FindFound @ Chandigarh University (CU)**\n\nFindFound was created specifically for **Chandigarh University** students and faculty by CU student **Ashutosh Panda**.\n\nWhether you lost your item in Academic Blocks (A, B, C, D), the central library, sports complex, food courts, or campus hostels, you can post reports with specific CU block names to connect with finders in minutes!`,
      quickReplies: [
        "🔍 How to report a lost item?",
        "📦 How to report a found item?",
        "👑 Who is the founder?",
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
      reply: `🔍 **How to Report a Lost Item**:\n\n1. Click the purple **'+ Report Lost Item'** button on the dashboard.\n2. Enter the **Title** (e.g., *Black HP Laptop Sleeve* or *Chandigarh University ID Card*).\n3. Pick the relevant **Category** (Electronics, Bags, IDs, Keys, etc.).\n4. Specify the **Location** (e.g., *Block B Library 1st Floor*).\n5. Enter the **Date** and add a photo/URL if available.\n6. Hit **Submit**!\n\n💡 *Our AI engine will instantly scan existing found reports and highlight potential matches on your dashboard.*`,
      quickReplies: [
        "🤖 How does AI matching work?",
        "💬 How do I chat with a finder?",
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
      reply: `📦 **How to Report a Found Item**:\n\n1. Click the green **'+ Report Found Item'** button on your dashboard.\n2. Enter the item details and upload a photo so the rightful owner can recognize it.\n3. Mention the exact location where you spotted or picked it up (e.g., *Food Court Table 12*).\n4. Click **Submit**.\n\nOnce submitted, the item will be listed, and our AI will attempt to match it with lost item reports. The owner can click **'Chat with Finder'** to coordinate returning it!`,
      quickReplies: [
        "💬 How to chat with a finder?",
        "🛡️ Safety tips for returning items",
        "❓ How does FindFound work?",
      ],
    };
  }

  // 5. How AI matching works
  if (
    query.includes("ai match") ||
    query.includes("smart match") ||
    query.includes("match") ||
    query.includes("algorithm") ||
    query.includes("accuracy") ||
    query.includes("confidence")
  ) {
    return {
      reply: `🤖 **How AI Smart Matching Works**:\n\nFindFound uses an intelligent matching algorithm:\n• **Keyword & Title Correlation**: Analyzes names, brands, colors, and item features.\n• **Category & Location Clustering**: Cross-checks items reported in the same block or category.\n• **AI Match Score**: Generates a confidence percentage (e.g. *92% High Match*) showing side-by-side comparisons of lost vs. found items.\n• **1-Click Connect**: From any AI match card, click **'Chat with Finder'** to directly verify ownership with the person who has the item!`,
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
      reply: `💬 **Direct Chat with Finder**:\n\n• Browse the dashboard or AI matches and find the relevant item.\n• Click the **'Chat with Finder'** or **'💬'** icon button on the card.\n• A direct 1-to-1 chat window opens where you can privately message the finder.\n• Use the quick suggested verification questions to confirm details (e.g., lock screen wallpaper, ID numbers, stickers).\n• Arrange a safe meeting spot on campus to collect your item!`,
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
      reply: `🔔 **Real-Time Notifications**:\n\n• FindFound has an interactive notification center in the top-right header.\n• When someone sends you a message about an item, a live badge appears with the unread count.\n• A floating popup toast notifies you immediately.\n• Click the notification bell to view all alerts, or click any notification to jump directly into the chat!`,
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
    query.includes("meet")
  ) {
    return {
      reply: `🛡️ **Safe Campus Handover Guidelines**:\n\n1. **Verify Ownership**: Ask the claimant specific questions only the real owner would know (e.g. phone lock screen wallpaper, unique scratches, contents of wallet/bag).\n2. **Meet in Public**: Hand over items in well-lit, public campus areas like the Student Center, block reception, or security desk.\n3. **100% Free**: Never pay money or rewards for returned student property.\n4. **Bring a Friend**: If meeting late in the evening, bring a friend along.`,
      quickReplies: [
        "💬 How to chat with a finder?",
        "🔍 How to report a lost item?",
        "👑 Who is the founder?",
      ],
    };
  }

  // 9. How to use / What is FindFound
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
      reply: `🚀 **Welcome to FindFound! Here's How It Works**:\n\n1️⃣ **Report Items**: Easily post lost or found items with photos, campus locations, and dates.\n2️⃣ **AI Smart Matching**: Our system automatically pairs lost items with found items and gives a match confidence score.\n3️⃣ **Direct Chat**: Click **'Chat with Finder'** to talk 1-on-1 with whoever found your item.\n4️⃣ **Instant Alerts**: Receive real-time bell notifications whenever someone messages you.\n\n✨ Developed by **Ashutosh Panda** from **Chandigarh University** to make campus item recovery fast and hassle-free!`,
      quickReplies: [
        "👑 Who is the founder?",
        "🔍 How to report a lost item?",
        "🤖 How does AI matching work?",
        "💬 How to chat with a finder?",
      ],
    };
  }

  // 10. Greetings
  if (
    query === "hi" ||
    query === "hello" ||
    query === "hey" ||
    query === "sup" ||
    query.startsWith("hi ") ||
    query.startsWith("hello ") ||
    query.startsWith("hey ") ||
    query.includes("good morning") ||
    query.includes("good evening")
  ) {
    return {
      reply: `👋 Hello! I am your **FindFound AI Assistant**.\n\nI can help you navigate FindFound, answer questions about our founder **Ashutosh Panda** (Chandigarh University), or guide you on how to report and recover lost belongings. What can I help you with today?`,
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
    reply: `I can help you with anything related to **FindFound**! 🌟\n\n• **Founder**: Created by **Ashutosh Panda** from **Chandigarh University (CU)**.\n• **Lost & Found**: How to report lost or found items.\n• **AI Smart Matching**: How automated matching scores work.\n• **Direct Chat**: How to message finders and get notifications.\n• **Campus Safety**: Tips for verifying ownership and safe handovers.\n\nChoose one of the quick options below or ask me in detail!`,
    quickReplies: [
      "👑 Who is the founder?",
      "❓ How do I use FindFound?",
      "🔍 How to report a lost item?",
      "📦 How to report a found item?",
      "🤖 How does AI matching work?",
    ],
  };
}

app.post("/api/bot/chat", (req, res) => {
  const { message } = req.body || {};
  const responseData = generateBotReply(message || "");
  res.json({
    success: true,
    ...responseData,
  });
});

/* =========================================================
   404
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use(
  (error, req, res, next) => {
    console.error(
      "SERVER ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Internal server error.",
    });
  }
);

/* =========================================================
   START SERVER
========================================================= */

app.listen(PORT, () => {
  console.log(
    `✅ FindBack server running on http://localhost:${PORT}`
  );
});