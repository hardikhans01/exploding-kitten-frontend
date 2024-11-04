import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { Trophy, Skull, Shield, Shuffle, Cat } from "lucide-react";

const Game = () => {
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [deck, setDeck] = useState([]);
  const [hasDefuse, setHasDefuse] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [gameWon, setGameWon] = useState(false);
  const [cType, setCType] = useState(["CAT", "DEFUSE", "SHUFFLE", "EXPLODE"]);

  const cardTypes = {
    CAT: {
      name: "Cat Card",
      icon: <Cat className="w-8 h-8" />,
      color: "bg-orange-200",
    },
    SHUFFLE: {
      name: "Shuffle Card",
      icon: <Shuffle className="w-8 h-8" />,
      color: "bg-blue-200",
    },
    DEFUSE: {
      name: "Defuse Card",
      icon: <Shield className="w-8 h-8" />,
      color: "bg-green-200",
    },
    EXPLODE: {
      name: "Exploding Kitten",
      icon: <Skull className="w-8 h-8" />,
      color: "bg-red-200",
    },
    
  };

  useEffect(() => {
    // Initial fetch
    fetchLeaderboard();

    // Set up the interval
    const intervalId = setInterval(fetchLeaderboard, 3000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  const initializeDeck = () => {
    setDeck([]);
    // const newDeck = [
    //   'CAT',
    //   'DEFUSE',
    //   'SHUFFLE',
    //   'EXPLODE',
    //   'CAT'
    // ].sort(() => Math.random() - 0.5);
  };

  const deleteSavedCards = async () => {
    try {
      const response = await fetch(
        `https://exploding-kitten-backend-c951.onrender.com/api/deleteSavedCards?username=${username}`,
        {
          method: "DELETE", // or "POST" if that's how your API is set up
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete saved cards");
      }

      const data = await response.json();
    } catch (error) {
      console.error("Error deleting saved cards:", error);
    }
  };

  useEffect(() => {
    if (gameOver) {
      deleteSavedCards();
    }
  }, [gameOver]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setHasDefuse(false);
    setMessage("");
    setGameWon(false);
    initializeDeck();
    deleteSavedCards();
  };

  const handleLogin = async () => {
    if (!username.trim()) {
      setMessage("Please enter a username");
      return;
    }

    try {
      const response = await fetch("https://exploding-kitten-backend-c951.onrender.com/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      if (response.ok) {
        setIsLoggedIn(true);
        fetchLeaderboard();
      }
    } catch (error) {
      setMessage("Error logging in");
    }
  };

  const fetchSavedCards = async () => {
    try {
      const response = await fetch(
        `https://exploding-kitten-backend-c951.onrender.com/api/fetchSavedCards?username=${username}`,
        {
          method: "GET", // Use GET method to fetch data
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch saved cards");
      }
      setGameStarted(true);
      setGameOver(false);
      setHasDefuse(false);
      setMessage("");
      setGameWon(false);
      initializeDeck();
      const cards = await response.json();
      setDeck(cards);
      cards.forEach((card) => {
        if (card == "DEFUSE") {
          setHasDefuse(true);
        }
      });
      // Here, you might want to update the state with the fetched cards
      setDeck(cards); // Assuming you want to set these as the current deck
    } catch (error) {
      console.error("Error fetching saved cards:", error);
    }
  };

  // Call this function when the game starts or on a specific event
  useEffect(() => {
    if (isLoggedIn) {
      fetchSavedCards(); // Fetch saved cards when the user is logged in
    }
  }, [isLoggedIn]);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("https://exploding-kitten-backend-c951.onrender.com/api/leaderboard");
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };

  const saveCardDraw = async (username, cardType) => {
    try {
      await fetch(
        `https://exploding-kitten-backend-c951.onrender.com/api/saveCardDraw?username=${username}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, cardType }),
        }
      );
    } catch (error) {
      console.error("Error saving drawn card:", error);
    }
  };

  const drawCard = async () => {
    if (deck.length === 5) {
      setGameWon(true);
      setGameOver(true);
      setMessage("You won! All cards drawn successfully!");

      // Update score
      try {
        await fetch("https://exploding-kitten-backend-c951.onrender.com/api/score", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username }),
        });
        fetchLeaderboard();
      } catch (error) {
        console.error("Error updating score:", error);
      }
      return;
    }

    const newDeck = [...deck];

    const drawnCard = cType[Math.floor(Math.random() * cType.length)];
    setDeck((prev) => {
      return [...prev, drawnCard];
    });

    saveCardDraw(username, drawnCard);

    switch (drawnCard) {
      case "CAT":
        setMessage("You drew a Cat card! Safe to continue...");
        break;
      case "DEFUSE":
        setHasDefuse(true);
        setMessage(
          "You got a Defuse card! This will protect you from one Exploding Kitten."
        );
        break;
      case "SHUFFLE":
        setMessage("Shuffle card drawn! Restarting the game...");
        setTimeout(startGame, 1500);
        break;
      case "EXPLODE":
        if (hasDefuse) {
          setHasDefuse(false);
          setMessage("Exploding Kitten defused! You used your defuse card.");
        } else {
          setGameOver(true);
          setMessage("BOOM! Game Over - You hit an Exploding Kitten!");
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchLeaderboard();
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Exploding Kittens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Button onClick={handleLogin} className="w-full">
                Login
              </Button>
              {message && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Game Board</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-lg">Welcome, {username}!</div>
              {!gameStarted ? (
                <Button onClick={startGame} className="w-full">
                  Start New Game
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>Cards remaining: {5 - deck.length}</div>
                    <div>Defuse card: {hasDefuse ? "✅" : "❌"}</div>
                  </div>
                  <Button
                    onClick={drawCard}
                    disabled={gameOver}
                    className="w-full"
                  >
                    Draw Card
                  </Button>
                  {message && (
                    <Alert
                      variant={gameOver && !gameWon ? "destructive" : "default"}
                    >
                      <AlertDescription>{message}</AlertDescription>
                    </Alert>
                  )}
                  {gameOver && (
                    <Button onClick={startGame} className="w-full">
                      Play Again
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboard.map((player, index) => (
                <div
                  key={player.username}
                  className="flex justify-between items-center p-2 rounded bg-gray-100"
                >
                  <span>
                    {index + 1}. {player.username}
                  </span>
                  <span>{player.score} points</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Game;
