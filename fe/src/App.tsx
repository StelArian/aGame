import React, { useEffect, useState } from "react";
import "./App.scss";

function App() {
  const [position, setPosition] = useState({ top: 80, left: 50 });
  const [direction, setDirection] = useState(0);
  const [key, setKey] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(document.hasFocus());

  const move = (direction: string) => {
    switch (direction) {
      case "ArrowUp":
        setPosition((prev) => ({ ...prev, top: Math.max(0, prev.top - 1) }));
        setDirection(0);
        break;
      case "ArrowDown":
        setPosition((prev) => ({ ...prev, top: Math.min(100, prev.top + 1) }));
        setDirection(180);
        break;
      case "ArrowLeft":
        setPosition((prev) => ({ ...prev, left: Math.max(0, prev.left - 1) }));
        setDirection(270);
        break;
      case "ArrowRight":
        setPosition((prev) => ({ ...prev, left: Math.min(100, prev.left + 1) }));
        setDirection(90);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const handleFocus = () => {
      setIsFocused(true);
    };
  
    const handleBlur = () => {
      setIsFocused(false);
    };
  
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
  
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
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
    if (key) {
      const intervalId = setInterval(() => {
        move(key);
      }, 50); // adjust speed here

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [key]);

  return (
    <div className="app">
      <div className="playground">
        <div
          className="person"
          style={{
            top: `${position.top}%`,
            left: `${position.left}%`,
            transform: `translate(-50%, -50%) rotate(${direction}deg)`,
            backgroundImage: key ? `url(/img/walk.gif)` : '',
            backgroundColor: isFocused ? '' : 'red',
          }}
        ></div>
      </div>
    </div>
  );
}

export default App;