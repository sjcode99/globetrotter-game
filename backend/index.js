require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");
const User = require("./models/User");
const Question = require("./models/Questions");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: process.env.DB_NAME,
  })
  .then((client) => {
    console.log("MongoDB Connected");
  })
  .catch((err) => console.error(err));

function generateReferralCode() {
  return uuidv4().slice(0, 4); // Shortened unique code
}

app.post("/register", async (req, res) => {
  const { username, referralCode } = req.body;

  try {
    // Check if the username is already used

    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(200).json({ message: "Username already registered." });

    // Create new user
    const newUser = new User({
      username,
      referralCode: generateReferralCode(),
      referredBy: referralCode || null,
      correct: 0,
      incorrect: 0,
    });

    await newUser.save();

    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        // referrer.rewardPoints += 10; // Example reward
        await referrer.save();
      }
    }

    res
      .status(201)
      .json({ message: "User registered successfully!", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
});

// Route to Retrieve All questions
app.get("/questions", async (req, res) => {
  try {
    const questions = await Question.find();
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /submit-answer - Validate answer and update score
app.post("/submit-answer", async(req, res) => {
  const { username, answer, correctAnswer } = req.body;
  const user = await User.findOne({username})
  
  if (!user) {
    return res.status(400).json({ error: "User not registered" });
  }
  const isCorrect = answer === correctAnswer;
  if (isCorrect) user.correct++;
  else user.incorrect++;

  await user.save();
  res.json({ isCorrect, message: isCorrect ? "🎉 Correct!" : "😢 Incorrect!" });
});

// GET /score - Fetch user score
app.get("/score", async (req, res) => {
  const { username } = req.query;
  const user = await User.findOne({ username });
  console.log(user);

  if (!user) {
    return res.status(400).json({ error: "User not registered" });
  }
  res.json(user);
});

// GET /score - Fetch user score
app.post("/getUserById", async (req, res) => {
  const { referralCode} = req.body;

  const user = await User.findOne({ referralCode });
  console.log(user);

  if (!user) {
    return res.status(400).json({ error: "Incorrect referral code" });
  }
  res.json(user);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
