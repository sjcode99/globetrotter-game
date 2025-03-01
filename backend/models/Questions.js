const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  city: String,
  country: String,
  clues: {
    type: [String],
  },
  fun_fact: {
    type: [String],
  },
  trivia: {
    type: [String],
  },
});

const Question = mongoose.model("Questions", QuestionSchema);

module.exports = Question;
