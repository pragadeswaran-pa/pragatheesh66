import React, { useState } from "react";
import axios from "axios";

const AddMatch = () => {
  const [team1, setTeam1] = useState("");
  const [score1, setScore1] = useState("");
  const [team2, setTeam2] = useState("");
  const [score2, setScore2] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post("http://localhost:5000/matches", { team1, score1, team2, score2 })
      .then(() => {
        alert("Match result added!");
        setTeam1("");
        setScore1("");
        setTeam2("");
        setScore2("");
      })
      .catch((error) => console.error("Error adding match:", error));
  };

  return (
    <div>
      <h2>Add Match Result</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Team 1" value={team1} onChange={(e) => setTeam1(e.target.value)} required />
        <input type="number" placeholder="Score 1" value={score1} onChange={(e) => setScore1(e.target.value)} required />
        <input type="text" placeholder="Team 2" value={team2} onChange={(e) => setTeam2(e.target.value)} required />
        <input type="number" placeholder="Score 2" value={score2} onChange={(e) => setScore2(e.target.value)} required />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default AddMatch;
