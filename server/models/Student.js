// models/Student.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const studentSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  parentsContacts: [{ type: String }],
  progress: {
    lessons: { type: [Number], default: [] },
    quizzes: { type: [Number], default: [] },
    badges: { type: [String], default: [] },
  },
});

studentSchema.methods.verifyPassword = function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('Student', studentSchema);