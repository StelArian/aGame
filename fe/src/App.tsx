import React, { useEffect, useRef, useState } from "react";
import "./App.scss";

type Person = {
  top: number;
  left: number;
  size: number;
};

type Item = {
  id: number;
  top: number;
  left: number;
  size: number;
};

function App() {
  const [person, setPerson] = useState<Person>({
    top: 80,
    left: 50,
    size: 3,
  });
  const [direction, setDirection] = useState(0);
  const [key, setKey] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(document.hasFocus());
  const [coins, setCoins] = useState<Item[]>([]);
  const [bananas, setBananas] = useState<Item[]>([]);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(120);
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

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCoins((coins) => {
        if (coins.length >= 30) {
          return coins; // max 30 coins on screen
        }

        return [
          ...coins,
          {
            id: Math.random(), // coin id
            top: Math.random() * 100, // random position from 0 to 100
            left: Math.random() * 100, // random position from 0 to 100
            size: 3,
          },
        ];
      });
    }, 5000); // add a new coin every 5 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setBananas((bananas) => {
        if (bananas.length >= 10) {
          return bananas; // if there are already 10 or more bananas, don't add a new one
        }

        return [
          ...bananas,
          {
            id: Math.random(), // unique id for each banana
            top: Math.random() * 100, // random position from 0 to 100
            left: Math.random() * 100, // random position from 0 to 100
            size: 3,
          },
        ];
      });
    }, 15000); // add a new banana every 15 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, []);

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

  useEffect(() => {
    // walking
    if (key) {
      const intervalId = setInterval(() => {
        move(key);
      }, 25); // walking speed

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [key]);

  useEffect(() => {
    setCoins((coins) => {
      const newCoins = coins.filter((coin) => {
        // Calculate the distance between the person and the coin
        const dx = person.left - coin.left;
        const dy = person.top - coin.top;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If the distance is less than the sum of their sizes, remove the coin
        const isCollected = distance < person.size / 2 + coin.size / 2;

        if (isCollected && prevScoreRef.current === score) {
          setScore(score + 1);
        }

        return !isCollected;
      });

      prevScoreRef.current = score;

      return newCoins;
    });
  }, [person, score]);

  useEffect(() => {
    bananas.forEach((banana) => {
      // Calculate the distance between the person and the banana
      const dx = person.left - banana.left;
      const dy = person.top - banana.top;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // If the distance is less than the sum of their sizes, set the score to 0
      const isCollected = distance < person.size / 2 + banana.size / 2;

      if (isCollected) {
        setScore(0);
      }
    });
  }, [person, bananas]); // Only re-run the effect if `person` or `bananas` changes

  return (
    <div
      className="app"
      style={{
        backgroundColor: isFocused ? "" : "red",
      }}
    >
      <div className="score">
        Score: {score} • Time: {time}''
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
      </div>
    </div>
  );
}

export default App;
