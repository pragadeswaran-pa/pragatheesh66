import React, { useEffect, useState } from "react";
import API from "./api/api"; // Ensure this file exists

function App() {
  const [teams, setTeams] = useState([]);
  const [newTeam, setNewTeam] = useState(""); // Store user input

  useEffect(() => {
    API.get("/points")
      .then((response) => setTeams(response.data))
      .catch((error) => console.error("Error fetching teams:", error));
  }, []);

  // Function to add a new team
  const addTeam = () => {
    API.post("/teams", { name: newTeam })
      .then((response) => {
        setTeams([...teams, response.data]); // Update the state
        setNewTeam(""); // Clear input field
      })
      .catch((error) => console.error("Error adding team:", error));
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Football League</h1>

      {/* Add Team Form */}
      <input
        type="text"
        value={newTeam}
        onChange={(e) => setNewTeam(e.target.value)}
        placeholder="Enter team name"
      />
      <button onClick={addTeam}>Add Team</button>

      {/* Display Points Table */}
      <h2>Points Table</h2>
      <ul>
        {teams.map((team, index) => (
          <li key={index}>{team.name} - Points: {team.points}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
