import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import {
  FaLightbulb,
  FaQuestionCircle,
  FaUserPlus,
  FaCopy,
} from "react-icons/fa";

export default function GlobetrotterGame() {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [question, setQuestion] = useState({});
  const [usedQuestions, setUsedQuestions] = useState(new Set());
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [username, setUsername] = useState("");
  const [inviteLink, setInviteLink] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [friendUsername, setFriendUsername] = useState(null);
  const [dataset, setDataset] = useState([]);
  const [referredUser, setReferredUser] = useState(null);

  useEffect(() => {
    if (isRegistered) {
      loadNewQuestion();
      fetchScore();
    }
  }, [isRegistered]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refer = urlParams.get("refer");
    if (refer) {
      getUserByReferralID(refer);
    }

    getAllQuestions();
  }, []);

  const getAllQuestions = async () => {
    const fetchData = await fetch(`https://globetrotter-game-backend-uh8s.onrender.com/questions`);
    const jsonData = await fetchData.json();
    setDataset(jsonData);
  };

  // register user
  const registerUser = async () => {
    if (!username) {
      alert("Please enter a username to start.");
      return;
    }

    const response = await fetch(`https://globetrotter-game-backend-uh8s.onrender.com/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    const data = await response.json();
    console.log(data);
    if (data.error) {
      alert(data.error);
    } else {
      setIsRegistered(true);
      loadNewQuestion(); // Ensure question is loaded immediately after registration
    }
  };

  const loadNewQuestion = () => {
    let availableQuestions = dataset.filter((q) => !usedQuestions.has(q.city));

    if (availableQuestions.length === 0) {
      setUsedQuestions(new Set()); // Reset if all questions are used
      availableQuestions = dataset;
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const randomQuestion = availableQuestions[randomIndex];

    setUsedQuestions((prev) => new Set(prev).add(randomQuestion.city));

    const incorrectOptions = dataset
      .filter((q) => q.city !== randomQuestion.city)
      .map((q) => q.city);

    const options = shuffleArray([
      randomQuestion.city,
      ...incorrectOptions.slice(0, 3),
    ]);

    setQuestion({
      ...randomQuestion,
      options,
      correctAnswer: randomQuestion.city,
    });
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const fetchScore = async () => {
    const response = await fetch(
      `https://globetrotter-game-backend-uh8s.onrender.com/score?username=${username}`
    );
    const data = await response.json();
    setScore(data);
  };

  const getUserByReferralID = async (referralCode) => {
    const response = await fetch(`https://globetrotter-game-backend-uh8s.onrender.com/getUserById`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        referralCode,
      }),
    });
    const data = await response.json();
    setReferredUser(data);
  };

  const handleOptionClick = (option) => {
    setSelectedAnswer(option);
    setIsCorrect(null); //Reset correctness to allow re-selection
  };

  // functionality for submit button
  const handleSubmit = async () => {
    if (!selectedAnswer) return;

    const response = await fetch(`https://globetrotter-game-backend-uh8s.onrender.com/submit-answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        answer: selectedAnswer,
        correctAnswer: question.correctAnswer,
      }),
    });

    const data = await response.json();
    console.log(data);
    setIsCorrect(data.isCorrect);
    fetchScore();
  };

  // challenge friend functionality
  const handleChallengeFriend = () => {
    if (!username) {
      alert("Please enter a username before inviting a friend.");
      return;
    }
    const link = `${window.location.origin}?refer=${score.referralCode}`;
    setInviteLink(link);
  };

  // if (!question) return <div>Loading...</div>;

  if (!isRegistered) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 p-4">
        <div className="w-full max-w-md bg-white text-center p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold">🌍 Globetrotter Challenge</h1>

          {/* Referral Friend Container */}
          {referredUser && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow-md text-center w-full">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-500 text-white flex items-center justify-center rounded-full text-xl font-bold">
                  {referredUser.username.charAt(0).toUpperCase()}
                </div>
                <p className="mt-2 text-lg font-semibold text-gray-800">
                  You have been invited by{" "}
                  <span className="text-blue-600 capitalize">
                    {referredUser.username}
                  </span>
                </p>
              </div>

              <div className="mt-2 p-3 bg-white rounded-lg shadow-inner">
                <p className="text-sm text-gray-600 capitalize">
                  {referredUser.username} scored:
                </p>
                <div className="flex justify-center mt-2 space-x-4">
                  <div className="flex items-center text-green-600 font-medium">
                    ✅ {referredUser.correct} Correct
                  </div>
                  <div className="flex items-center text-red-600 font-medium">
                    ❌ {referredUser.incorrect} Incorrect
                  </div>
                </div>
              </div>

              <p className="mt-3 text-sm text-gray-700">
                Test your knowledge and see if you can beat their score!
              </p>
            </div>
          )}

          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-4 p-2 border border-gray-300 rounded-md text-center w-64"
          />
          <button
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-green-700"
            onClick={registerUser}
          >
            Enter username & Play
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 p-4 relative">
      {isCorrect && <Confetti />}
      <div className="w-full max-w-lg bg-white text-center p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold">🌍 Globetrotter Challenge</h1>

        {/* challenge friend container */}
        <div className="flex flex-col items-center mt-4 mb-4">
          <input
            type="text"
            placeholder="Enter your username"
            value={friendUsername || ""}
            onChange={(e) => setFriendUsername(e.target.value)}
            className="p-2 border border-gray-300 rounded-md text-center w-64"
          />

          {inviteLink && (
            <div className="mt-4 flex items-center justify-between bg-gray-100 p-1 rounded-lg shadow-md w-full max-w-sm">
              <p className="text-sm font-medium text-gray-700 truncate w-56">
                <a
                  href={inviteLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  {inviteLink}
                </a>
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(inviteLink);
                }}
                className="mt-2 bg-green-600 text-white px-4 rounded-lg shadow-md hover:bg-green-700 flex items-center"
              >
                <FaCopy className="mr-2" /> Copy Link
              </button>
            </div>
          )}
          <button
            className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-purple-700 flex items-center"
            onClick={handleChallengeFriend}
          >
            <FaUserPlus className="mr-2" /> Challenge a Friend
          </button>
        </div>

        {/* score container */}
        <div className="flex justify-between w-full max-w-md px-4 mt-2 text-lg">
          <p className="text-green-600 font-semibold">
            ✅ Correct: {score.correct}
          </p>
          <p className="text-red-600 font-semibold">
            ❌ Incorrect: {score.incorrect}
          </p>
        </div>

        <div className="mt-6 mb-6 p-4 bg-blue-50 rounded-lg shadow-inner">
          <p className="text-xl font-semibold mb-4 flex items-center">
            <FaQuestionCircle className="mr-2" />
            <span>{question?.clues[0]}</span>
          </p>
          <h2 className="text-xl font-bold text-blue-800 flex items-center mb-2">
            <FaLightbulb className="mr-2" /> Clues
          </h2>
          {question.trivia.map((t, index) => (
            <p
              key={index}
              className="mb-2 pl-2 text-blue-900 font-medium flex gap-2"
            >
              🔹
              <span className="text-left">{t}</span>
            </p>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionClick(option)}
              className={`p-3 rounded-md font-medium transition-all duration-300 ${
                selectedAnswer === option
                  ? isCorrect === null
                    ? "bg-blue-400 text-white"
                    : option === question.correctAnswer
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        {isCorrect !== null && isCorrect ? (
          <button
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            onClick={loadNewQuestion}
          >
            Next Question
          </button>
        ) : (
          <button
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            onClick={handleSubmit}
          >
            Submit
          </button>
        )}

        {isCorrect !== null && !isCorrect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`mt-4 text-lg font-bold ${
              isCorrect ? "text-green-600" : "text-red-600"
            }`}
          >
            {isCorrect
              ? "🎉 Correct! You got it!"
              : "😢 Incorrect! Better luck next time!"}
          </motion.div>
        )}
      </div>
      <style>
        {`
          .shake {
            animation: shake 0.3s ease-in-out;
          }
          @keyframes shake {
            0% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            50% { transform: translateX(5px); }
            75% { transform: translateX(-5px); }
            100% { transform: translateX(0); }
          }
        `}
      </style>
    </div>
  );
}
