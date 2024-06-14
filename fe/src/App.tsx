import React, { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import "./App.scss";

if (!process.env.REACT_APP_BE) {
  throw new Error("Missing REACT_APP_BE var in .env file");
}

const config = {
  timer: 60, // sec
  speed: 25,
  coins: {
    max: 30,
    every: 2500, // ms
  },
  bananas: {
    max: 10,
    every: 3333, //ms
  },
};

type Score = {
  id: string;
  player: string;
  score: number;
  date: string;
};

type Person = {
  top: number;
  left: number;
  size: number;
};

type Item = {
  id: string;
  top: number;
  left: number;
  size: number;
};

const roundId = uuidv4();

function Player() {
  const names = [
    "Alex",
    "Jordan",
    "Taylor",
    "Casey",
    "Jamie",
    "Morgan",
    "Riley",
    "Jesse",
    "Cameron",
    "Avery",
    "Sydney",
    "Bailey",
    "Devin",
    "Reese",
    "Kendall",
    "Peyton",
    "Skyler",
    "Kerry",
    "Jaden",
    "Emerson",
  ];
  const randomName = names[Math.floor(Math.random() * names.length)];
  const randomYear = Math.floor(Math.random() * (2000 - 1980 + 1)) + 1980;
  return `${randomName}${String(randomYear % 100).padStart(2, "0")}`;
}

function App() {
  const [person, setPerson] = useState<Person>({
    top: 80,
    left: 50,
    size: 3,
  });
  const [player, setPlayer] = useState(localStorage.getItem("player") || "");
  const [direction, setDirection] = useState(0);
  const [key, setKey] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(document.hasFocus());
  const [coins, setCoins] = useState<Item[]>([]);
  const [bananas, setBananas] = useState<Item[]>([]);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(config.timer);
  const [scoreResponse, setScoreResponse] = useState<Score[]>([]);
  const prevScoreRef = useRef(0);

  const move = (direction: string) => {
    switch (direction) {
      case "ArrowUp":
        setPerson((prev) => ({ ...prev, top: Math.max(0, prev.top - 1) }));
        setDirection(0);
        break;
      case "ArrowDown":
        setPerson((prev) => ({ ...prev, top: Math.min(100, prev.top + 1) }));
        setDirection(180);
        break;
      case "ArrowLeft":
        setPerson((prev) => ({ ...prev, left: Math.max(0, prev.left - 1) }));
        setDirection(270);
        break;
      case "ArrowRight":
        setPerson((prev) => ({
          ...prev,
          left: Math.min(100, prev.left + 1),
        }));
        setDirection(90);
        break;
      default:
        break;
    }
  };

  // api call to save score
  useEffect(() => {
    if (time === 0) {
      fetch(`${process.env.REACT_APP_BE}/score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: roundId, player, score }),
      })
        .then((response) => response.json())
        .then((data) => setScoreResponse(data || []))
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }, [time, score, player]);

  // player name
  useEffect(() => {
    if (!player) {
      const randomName = Player();
      localStorage.setItem("player", randomName);
      setPlayer(randomName);
    }
  }, [player]);

  // player position
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCoins((coins) => {
        if (coins.length >= config.coins.max) {
          return coins;
        }

        return [
          ...coins,
          {
            id: uuidv4(),
            top: Math.random() * 100,
            left: Math.random() * 100,
            size: 3,
          },
        ];
      });
    }, config.coins.every);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // banana position
  useEffect(() => {
    const intervalId = setInterval(() => {
      setBananas((bananas) => {
        if (bananas.length >= config.bananas.max) {
          return bananas;
        }

        return [
          ...bananas,
          {
            id: uuidv4(),
            top: Math.random() * 100,
            left: Math.random() * 100,
            size: 3,
          },
        ];
      });
    }, config.bananas.every);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // game focus
  useEffect(() => {
    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  // arrows
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setKey(event.key);
    };

    const handleKeyUp = () => {
      setKey(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // move person
  useEffect(() => {
    if (key) {
      const intervalId = setInterval(() => {
        move(key);
      }, config.speed);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [key]);

  // hit/remove coins
  useEffect(() => {
    if (time === 0) {
      return;
    }
    setCoins((coins) => {
      const newCoins = coins.filter((coin) => {
        // Calculate distance between person and coin
        const dx = person.left - coin.left;
        const dy = person.top - coin.top;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If distance is less than the sum of their sizes, remove coin
        const isCollected = distance < person.size / 2 + coin.size / 2;

        if (isCollected && prevScoreRef.current === score) {
          setScore(score + 1);
        }

        return !isCollected;
      });

      prevScoreRef.current = score;

      return newCoins;
    });
  }, [person, score, time]);

  // hit bananas
  useEffect(() => {
    if (time === 0) {
      return;
    }
    bananas.forEach((banana) => {
      // Calculate distance between person and banana
      const dx = person.left - banana.left;
      const dy = person.top - banana.top;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // If distance is less than the sum of their sizes, set score to 0
      const isCollected = distance < person.size / 2 + banana.size / 2;

      if (isCollected) {
        setScore(0);
      }
    });
  }, [person, bananas, time]);

  // timer
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime((prevTime) => Math.max(0, prevTime - 1));
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div
      className="app"
      style={{
        backgroundColor: isFocused ? "" : "red",
      }}
    >
      <div className="score">
        <h3>
          Hi {player} • Your score is {score} • You have {time}''
        </h3>
      </div>
      <div className="playground">
        {coins.map((coin) => (
          <div
            key={coin.id}
            className="coin"
            style={{
              top: `${coin.top}%`,
              left: `${coin.left}%`,
            }}
          ></div>
        ))}
        {bananas.map((banana) => (
          <div
            key={banana.id}
            className="banana"
            style={{
              top: `${banana.top}%`,
              left: `${banana.left}%`,
            }}
          ></div>
        ))}
        <div
          className="person"
          style={{
            top: `${person.top}%`,
            left: `${person.left}%`,
            transform: `translate(-50%, -50%) rotate(${direction}deg)`,
            backgroundImage: key ? `url(/img/walk.gif)` : "",
          }}
        ></div>
        {!time && (
          <div className="gameover">
            <h1>Game Over</h1>
            <div>
              {scoreResponse.map((score, index) => (
                <div
                  key={index}
                  style={{
                    color: score.id === roundId ? "yellow" : "",
                  }}
                >
                  <span>{index + 1}.</span>
                  <span>{score.player}</span>
                  <span>{score.score}c</span>
                  <span>{new Date(score.date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
            <h2
              onClick={(e) => {
                e.preventDefault();
                window.location.reload();
              }}
            >
              Start New Game Here!
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
