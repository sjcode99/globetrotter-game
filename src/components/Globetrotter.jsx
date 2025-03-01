import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
// import { dataset } from "../assets/Dataset"; // Assuming dataset is stored separately
import { FaLightbulb, FaQuestionCircle, FaUserPlus } from "react-icons/fa";

export default function GlobetrotterGame() {
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [question, setQuestion] = useState({});
    // const [question, setQuestion] = useState(null);
    const [usedQuestions, setUsedQuestions] = useState(new Set());
    const [score, setScore] = useState({ correct: 0, incorrect: 0 });
    const [username, setUsername] = useState("");
    const [inviteLink, setInviteLink] = useState(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [friendUsername, setFriendUsername] = useState(null);
    const [dataset, setDataset] = useState([]);

    useEffect(() => {
        if (isRegistered) {
            loadNewQuestion();
            fetchScore();
        }
    }, [isRegistered]);

    useEffect(() => {
        getAllQuestions()
    }, []);

    const getAllQuestions = async() => {
        const fetchData = await fetch("http://localhost:5000/questions");
        const jsonData = await fetchData.json();
        setDataset(jsonData);
    }

    console.log(dataset);

    // register user
    const registerUser = async () => {
        if (!username) {
            alert("Please enter a username to start.");
            return;
        }

        const response = await fetch("http://localhost:5000/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username })
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

    const handleAnswer = (answer) => {
        setSelectedAnswer(answer);
        setIsCorrect(answer === question.correctAnswer);
    };

    const fetchScore = async () => {
        const response = await fetch(`http://localhost:5000/score?username=${username}`);
        const data = await response.json();
        setScore(data);
    };

    const handleOptionClick = (option) => {
        setSelectedAnswer(option);
        setIsCorrect(null); //Reset correctness to allow re-selection
    };

    // functionality for submit button
    const handleSubmit = async () => {
        if (!selectedAnswer) return;

        const response = await fetch("http://localhost:5000/submit-answer", {
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
        const link = `${window.location.origin}?invitedBy=${username}`;
        setInviteLink(link);
        const message = `Hey! Join me in playing Globetrotter Challenge. My score: ${score.correct} correct, ${score.incorrect} incorrect. Click to play: ${link}`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`);
    };

    // if (!question) return <div>Loading...</div>;

    if (!isRegistered) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 p-4">
                <div className="w-full max-w-md bg-white text-center p-6 rounded-lg shadow-lg">
                    <h1 className="text-2xl font-bold">🌍 Globetrotter Challenge</h1>
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
                        Register & Play
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
                        value={friendUsername}
                        onChange={(e) => setFriendUsername(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md text-center w-64"
                    />
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
                            className={`p-3 rounded-md font-medium transition-all duration-300 ${selectedAnswer === option
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
                        // <button
                        //     key={index}
                        //     onClick={() => handleAnswer(option)}
                        //     className={`p-3 rounded-md font-medium transition-all duration-300 ${selectedAnswer === option
                        //             ? isCorrect
                        //                 ? "bg-green-500 text-white scale-110"
                        //                 : "bg-red-500 text-white shake"
                        //             : "bg-gray-200 hover:bg-gray-300"
                        //         }`}
                        // >
                        //     {option}
                        // </button>
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
                        className={`mt-4 text-lg font-bold ${isCorrect ? "text-green-600" : "text-red-600"
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
