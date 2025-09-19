const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/disasterprep';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});
const studentSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  parentsContacts: [{ type: String }], // array of phone numbers as strings
  progress: {
    lessons: { type: [Number], default: [] },
    quizzes: { type: [Number], default: [] },
    badges: { type: [String], default: [] },
  },
});

studentSchema.methods.verifyPassword = function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

const Student = mongoose.model('Student', studentSchema);
const app = express();
const PORT = 4000;

// ---------- Middleware ----------
app.use(cors({
  origin: "http://localhost:3000", // frontend
  credentials: true,
}));
app.use(bodyParser.json());
app.use(session({
  secret: "disaster-prep-secret",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }, // change to true if using HTTPS
}));

// ---------- In-memory "DB" ----------
const users = {
  students: [
    { name: "alice", password: "student123", progress: { lessons: [], quizzes: [], badges: [] } },
    { name: "bob", password: "student456", progress: { lessons: [], quizzes: [], badges: [] } },
  ],
  teachers: [
    { name: "mrjohnson", password: "teacher123" },
    { name: "mswilliams", password: "teacher456" },
  ],
};

// ---------- LESSONS ----------
const lessons = [
  {
    id: 1,
    title: "What is a Disaster?",
    goal: "Learn what disasters are and why we should know about them",
    content: [
      {
        heading: "1. What is a Disaster?",
        points: [
          "A disaster is something sudden and harmful.",
          "It can hurt people, damage schools or homes, and stop normal life."
        ]
      },
      {
        heading: "2. Kinds of Disasters",
        points: [
          "Natural → earthquake, flood, cyclone, heatwave.",
          "Man-made → fire, road accident, building collapse.",
          "Health → pandemic (like COVID-19), spread of diseases, unsafe food or water."
        ]
      },
      {
        heading: "3. Why Do We Learn This?",
        points: [
          "To stay safe and not panic.",
          "To know what to do when something happens.",
          "To help friends and family in need."
        ]
      },
      {
        heading: "4. Real Story",
        points: [
          "In Japan, students practice earthquake safety in school.",
          "When a real earthquake and tsunami came in 2011, they remembered their training and moved to safe places. Many children survived because they had practiced."
        ]
      },
      {
        heading: "5. Key Message",
        points: [
          "If we learn + if we practice → we stay safe."
        ]
      }

    ]
  },
  {
    id: 2,
    title: "Earthquake Safety",
    goal: "Learn what to do during and after an earthquake to stay safe.",
    content: [
      {
        heading: "1. What is an Earthquake?",
        points: [
          "The ground shakes because rocks under the earth move.",
          "It can happen suddenly, without warning.",
          "Buildings, walls, and objects may fall."
        ]
      },
      {
        heading: "2. What To Do During an Earthquake?",
        points: [
          "Remember: Drop – Cover – Hold",
          "Drop → Get down on your knees quickly.",
          "Cover → Hide under a strong desk or table. Protect your head and neck with hands.",
          "Hold → Hold the desk/table legs until shaking stops.",
          "Don’t run, don’t push, don’t use lifts/elevators."
        ]
      },
      {
        heading: "3. If You Are Outside",
        points: [
          "Go to an open area (ground, playground).",
          "Stay away from trees, poles, or buildings."
        ]
      },
      {
        heading: "4. After the Shaking Stops",
        points: [
          "Wait for teacher’s instructions.",
          "Walk calmly to the assembly ground.",
          "Stay together, don’t panic.",
          "Help classmates if someone is hurt."
        ]
      },
      {
        heading: "5. Key Message",
        points: [
          "Stay Calm → Drop → Cover → Hold → Evacuate Safely"
        ]
      }
    ],
     poster: "/assets/earthquake.jpg", // path to poster
    video: "/videos/earthquakemp4.mp4", 
    
  },
  {
    id: 3,
    title: "Flood Safety",
    goal: "Learn how to stay safe if your school or area faces floods.",
    content: [
      {
        heading: "1. What is a Flood?",
        points: [
          "Floods happen when there is too much rain or rivers overflow.",
          "Water covers the land, roads, and sometimes enters homes and schools."
        ]
      },
      {
        heading: "2. What To Do During a Flood?",
        points: [
          "Go Higher → Move to upstairs floors or higher ground.",
          "Stay Dry → Do not walk or play in flood water.",
          "Stay With Teachers → Always listen to your teacher and move together.",
          "Avoid Electricity → Don’t touch wires, switches, or plugs.",
          "School as Shelter → Sometimes the school building is the safest place."
        ]
      },
      {
        heading: "3. After the Flood",
        points: [
          "Do not drink tap water unless teachers say it’s safe.",
          "Wash hands before eating.",
          "Be careful of insects, snakes, or sharp objects in water.",
          "Stay calm and wait for help."
        ]
      },
      {
        heading: "4. Key Message",
        points: [
          "Go Up → Stay Dry → Listen to Teachers → Stay Together → Be Safe"
        ]
      }
    ],
     poster: "/assets/flood.jpg", // path to poster
    video: "/videos/flood.mp4", // YouTube embed link
    
  },
  {
    id: 4,
    title: "Fire Safety",
    goal: "Learn what to do if there is a fire in school or at home.",
    content: [
      {
        heading: "1. What is a Fire Emergency?",
        points: [
          "Fire can start from electric wires, labs, kitchens, or careless use of matches/candles.",
          "Smoke is dangerous — it makes it hard to breathe."
        ]
      },
      {
        heading: "2. What To Do During Fire?",
        points: [
          "Shout “Fire!” → Inform teacher or adults quickly.",
          "Don’t Panic, Don’t Run → Move calmly.",
          "Use Nearest Exit → Walk quickly to the school ground.",
          "Crawl Low in Smoke → If there is smoke, bend down and cover your nose/mouth.",
          "Stop, Drop, Roll → If clothes catch fire: Stop moving, Drop to the ground, Roll to put out flames."
        ]
      },
      {
        heading: "3. What NOT To Do",
        points: [
          "Don’t use lifts/elevators.",
          "Don’t go back inside for books or things.",
          "Don’t push or rush."
        ]
      },
      {
        heading: "4. After the Fire",
        points: [
          "Wait with classmates in assembly ground.",
          "Teacher will take attendance.",
          "Follow instructions of firefighters."
        ]
      },
      {
        heading: "5. Key Message",
        points: [
          "Shout → Exit → Stay Low → Stop, Drop, Roll → Stay Safe"
        ]
      }
    ],
     poster: "/assets/fire.jpg", // path to poster
    video: "/videos/firedrill.mp4", // YouTube embed link
    
  },
  {
    id: 5,
    title: "Heatwave Safety",
    goal: "Learn how to protect yourself during very hot weather.",
    content: [
      {
        heading: "1. What is a Heatwave?",
        points: [
          "A heatwave is when the temperature is extremely high for many days.",
          "It can cause dehydration, heat exhaustion, or heatstroke."
        ]
      },
      {
        heading: "2. How to Stay Safe?",
        points: [
          "Drink Water Often → Keep sipping water, even if not thirsty.",
          "Wear Light Clothes → Cotton clothes, light colors.",
          "Stay Indoors → Avoid playing outside in strong sun (12–4 PM).",
          "Use Shade → Sit under trees, use caps or umbrellas.",
          "Eat Light Food → Fresh fruits, juices, avoid junk food."
        ]
      },
      {
        heading: "3. Warning Signs of Heatstroke",
        points: [
          "Dizziness or fainting.",
          "Headache and tiredness.",
          "Very hot, dry skin.",
          "If this happens, tell teacher immediately and rest in a cool place."
        ]
      },
      {
        heading: "4. Key Message",
        points: [
          "Drink Water → Stay Cool → Avoid Sun → Help Friends"
        ]
      }
    ]
  },
  {
    id: 6,
    title: "Pandemic Safety",
    goal: "Learn how to stay safe during a disease outbreak like COVID-19, flu, or dengue.",
    content: [
      {
        heading: "1. What is a Pandemic?",
        points: [
          "A pandemic is when a disease spreads to many people, across cities or countries.",
          "Example: COVID-19 pandemic in 2020."
        ]
      },
      {
        heading: "2. How to Stay Safe?",
        points: [
          "Wash Hands → Use soap or sanitizer often.",
          "Wear Mask (if told) → Cover nose and mouth properly.",
          "Keep Distance → Don’t crowd or push in groups.",
          "Stay Home if Sick → Inform teacher/parents if you feel unwell.",
          "Clean Surroundings → Don’t allow water to collect (mosquitoes spread dengue)."
        ]
      },
      {
        heading: "3. During School Time",
        points: [
          "Follow school safety rules.",
          "Sit with space between friends if required.",
          "Don’t share bottles, food, or handkerchiefs."
        ]
      },
      {
        heading: "4. After School",
        points: [
          "Tell parents if you have cough, fever, or breathing problems.",
          "Rest, eat healthy, and avoid spreading illness to others."
        ]
      },
      {
        heading: "5. Key Message",
        points: [
          "Wash → Mask → Distance → Stay Clean → Stay Healthy"
        ]
      }
    ]
  },
  {
    id: 7,
    title: "Lab & Chemical Safety",
    goal: "Learn how to stay safe while working in science labs.",
    content: [
      {
        heading: "1. Why Lab Safety Matters",
        points: [
          "Labs have chemicals, burners, and glass items.",
          "Carelessness can cause burns, cuts, or fire accidents."
        ]
      },
      {
        heading: "2. Safety Rules in the Lab",
        points: [
          "Wear Safety Gear → Use lab coat, gloves, and goggles.",
          "Handle Chemicals Carefully → Don’t taste, smell, or touch with bare hands.",
          "Use Burners Safely → Light burners only with teacher’s permission.",
          "No Running / Playing → Labs are not playgrounds.",
          "Label Bottles → Always check the name before using a chemical."
        ]
      },
      {
        heading: "3. If an Accident Happens",
        points: [
          "If chemical spills on skin → Wash with plenty of water, inform teacher.",
          "If clothes catch fire → Stop, Drop, Roll.",
          "If glass breaks → Don’t touch with hands, call teacher.",
          "Report any accident immediately to teacher."
        ]
      },
      {
        heading: "4. After Lab Work",
        points: [
          "Clean your table and wash hands properly.",
          "Put chemicals back in their correct place."
        ]
      },
      {
        heading: "5. Key Message",
        points: [
          "Be Careful → Follow Rules → Ask Teacher → Stay Safe"
        ]
      }
    ]
  }
];

// ---------- QUIZZES ----------
const quizzes = [
  {
    id: 1,
    lessonId: 1,
    title: "Quiz: What is a Disaster?",
    questions: [
      {
        question: "What is a disaster?",
        options: ["Normal event", "Sudden harmful event", "Fun activity", "Never happens"],
        answer: 1,
      },
      {
        question: "Which one is a natural disaster?",
        options: ["Fire", "Earthquake", "Road accident", "Building collapse"],
        answer: 1,
      },
    ],
  },
  {
    id: 2,
    lessonId: 2,
    title: "Quiz: Earthquake Safety",
    questions: [
      {
        question: "What should you do during an earthquake?",
        options: ["Run", "Drop, Cover, Hold", "Use lift", "Shout"],
        answer: 1,
      },
    ],
  },
];

// ---------- Auth Middleware ----------
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: "Please log in first" });
  }
  next();
}

// ---------- Routes ----------

// Login
app.post("/api/login", async (req, res) => {
  const { role, name, password } = req.body;
  if (!role || !name || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (role === "student") {
    try {
      const student = await Student.findOne({ name });
      if (!student) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const valid = await student.verifyPassword(password);
      if (!valid) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      req.session.user = { role, name };
      return res.json({ success: true, role, name });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // For teachers, keep your existing logic or implement similarly with DB
  // For now, fallback to your in-memory users for teachers:
  const userList = users[role + "s"];
  if (!userList) {
    return res.status(400).json({ error: "Invalid role" });
  }

  const user = userList.find(u => u.name === name && u.password === password);
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  req.session.user = { role, name };
  res.json({ success: true, role, name });
});

// Logout
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true, message: "Logged out successfully" });
  });
});

// Current user
app.get("/api/user", requireLogin, (req, res) => {
  res.json(req.session.user);
});

// Student dashboard
app.get("/api/student/dashboard", requireLogin, async (req, res) => {
  if (req.session.user.role !== "student") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const student = await Student.findOne({ name: req.session.user.name });
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({
      lessons,
      quizzes,
      progress: student.progress,
    });
  } catch (err) {
    console.error("Error fetching student dashboard:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Mark lesson complete
app.post("/api/student/lesson/:lessonId/complete", requireLogin, async (req, res) => {
  if (req.session.user.role !== "student") {
    return res.status(403).json({ error: "Access denied" });
  }

  const lessonId = parseInt(req.params.lessonId);

  try {
    const student = await Student.findOne({ name: req.session.user.name });
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    if (!student.progress.lessons.includes(lessonId)) {
      student.progress.lessons.push(lessonId);

      if (student.progress.lessons.length === 1) {
        student.progress.badges.push("First Lesson");
      }
      if (student.progress.lessons.length === lessons.length) {
        student.progress.badges.push("Lesson Master");
      }
    }

    await student.save();

    res.json({ success: true, progress: student.progress });
  } catch (err) {
    console.error("Error updating lesson progress:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Submit quiz
app.post("/api/student/quiz/:quizId/submit", requireLogin, (req, res) => {
  if (req.session.user.role !== "student") {
    return res.status(403).json({ error: "Access denied" });
  }

  const quizId = parseInt(req.params.quizId);
  const { answers } = req.body;
  const quiz = quizzes.find(q => q.id === quizId);

  if (!quiz) {
    return res.status(404).json({ error: "Quiz not found" });
  }

  let score = 0;
  quiz.questions.forEach((q, i) => {
    if (answers[i] === q.answer) score++;
  });

  const student = users.students.find(s => s.name === req.session.user.name);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  if (!student.progress.quizzes.includes(quizId)) {
    student.progress.quizzes.push(quizId);

    if (score === quiz.questions.length) {
      student.progress.badges.push(`Quiz ${quizId} Perfect Score`);
    }
    if (student.progress.quizzes.length === 1) {
      student.progress.badges.push("First Quiz");
    }
    if (student.progress.quizzes.length === quizzes.length) {
      student.progress.badges.push("Quiz Master");
    }
  }

  res.json({
    score,
    total: quiz.questions.length,
    percentage: Math.round((score / quiz.questions.length) * 100),
    progress: student.progress,
  });
});

// Teacher dashboard
app.get("/api/teacher/dashboard", requireLogin, (req, res) => {
  if (req.session.user.role !== "teacher") {
    return res.status(403).json({ error: "Access denied" });
  }
app.post('/api/teacher/alert', (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }
  // TODO: send alert logic here
  res.json({ message: 'Alert sent successfully' });
});

  res.json({
    students: users.students.map(s => ({
      name: s.name,
      progress: s.progress,
    })),
    lessons,
    quizzes,
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// ---------- Start ----------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
