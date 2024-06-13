require("dotenv").config();
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

type Score = {
    player: string;
    score: number;
    date: string;
  };

const scores: Score[] = require('./scores.json');

if (!process.env.PORT) {
  throw new Error("Missing PORT environment variable in .env file");
}

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/score", (req, res) => {
  const body = req.body;

  if (!('player' in body) || !('score' in body)) {
    return res.status(400).json({ error: "Player and score required" });
  }

  body.date = new Date().toISOString();

  if (body.score > 0) {
    scores.push(body);
    scores.sort((a, b) => b.score - a.score);
    require('fs').writeFileSync('./src/scores.json', JSON.stringify(scores, null, 2));
  }

  return res.status(200).json(scores);
});

app.listen(process.env.PORT, () =>
  console.log(`Server running on http://localhost:${process.env.PORT}`)
);
