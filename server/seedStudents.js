const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Student = require('./models/Student'); // or define schema here if no separate file

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/disasterprep';

async function seed() {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const students = [
    {
      name: "alice",
      password: "student123",
      parentsContacts: ["+12345678901", "+10987654321"],
    },
    {
      name: "bob",
      password: "student456",
      parentsContacts: ["+19876543210"],
    },
  ];

  for (const s of students) {
    const existing = await Student.findOne({ name: s.name });
    if (existing) {
      console.log(`Student ${s.name} already exists, skipping.`);
      continue;
    }
    const passwordHash = await bcrypt.hash(s.password, 10);
    const student = new Student({
      name: s.name,
      passwordHash,
      parentsContacts: s.parentsContacts,
      progress: { lessons: [], quizzes: [], badges: [] },
    });
    await student.save();
    console.log(`Added student ${s.name}`);
  }

  mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  mongoose.disconnect();
});