const express = require('express');
const mongoose = require('mongoose');
const Team = require('./models/team');  // Import Team model
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = "mongodb+srv://pragathees:pragathees@cluster0.oqcz3.mongodb.net/Football";
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// POST route to add a team
app.post('/teams', async (req, res) => {
    try {
      const { name } = req.body;
      const team = new Team({ name });
      await team.save();
      res.status(201).send(team);
    } catch (err) {
      res.status(400).send(err);
    }
  });

  // POST route to add match results
app.post('/matches', async (req, res) => {
    const { team1, score1, team2, score2 } = req.body;
    
    try {
      const team1Record = await Team.findOne({ name: team1 });
      const team2Record = await Team.findOne({ name: team2 });
      
      if (!team1Record || !team2Record) {
        return res.status(404).send('One or both teams not found');
      }
  
      // Update teams' match records
      team1Record.played++;
      team2Record.played++;
  
      if (score1 > score2) {
        team1Record.won++;
        team2Record.lost++;
        team1Record.points += 3;
      } else if (score1 < score2) {
        team2Record.won++;
        team1Record.lost++;
        team2Record.points += 3;
      } else {
        team1Record.drawn++;
        team2Record.drawn++;
        team1Record.points++;
        team2Record.points++;
      }
  
      await team1Record.save();
      await team2Record.save();
  
      res.status(200).send('Match result updated');
    } catch (err) {
      res.status(400).send(err);
    }
  });
    

// GET route to retrieve the points table
app.get('/points', async (req, res) => {
    try {
      const teams = await Team.find().sort({ points: -1 });
      res.status(200).json(teams);
    } catch (err) {
      res.status(400).send(err);
    }
  });
  
// Schema and Model
const teamSchema = new mongoose.Schema({
    name: String,
    played: Number,
    won: Number,
    drawn: Number,
    lost: Number,
    points: Number,
});

// API Routes
app.get('/api/teams', async (req, res) => {
    const teams = await Team.find();
    res.json(teams);
});

app.post('/api/matches', async (req, res) => {
    const { team1, team2, score1, score2 } = req.body;

    const updateTeamStats = async (team, stats) => {
        const existingTeam = await Team.findOne({ name: team });
        if (!existingTeam) {
            await Team.create({ name: team, ...stats });
        } else {
            await Team.updateOne({ name: team }, { $inc: stats });
        }
    };

    const result1 = { played: 1, won: 0, drawn: 0, lost: 0, points: 0 };
    const result2 = { played: 1, won: 0, drawn: 0, lost: 0, points: 0 };

    if (score1 > score2) {
        result1.won = 1;
        result1.points = 3;
        result2.lost = 1;
    } else if (score1 < score2) {
        result2.won = 1;
        result2.points = 3;
        result1.lost = 1;
    } else {
        result1.drawn = 1;
        result2.drawn = 1;
        result1.points = 1;
        result2.points = 1;
    }

    await updateTeamStats(team1, result1);
    await updateTeamStats(team2, result2);

    res.json({ message: 'Match result added!' });
});

// Premier League API endpoints
app.get('/api/premier-league/matches', async (req, res) => {
  try {
    const response = await axios.get('https://api.football-data.org/v4/matches', {
      headers: {
        'X-Auth-Token': process.env.FOOTBALL_API_KEY || 'YOUR_API_KEY_HERE'
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching Premier League matches', error: error.message });
  }
});

app.get('/api/premier-league/standings', async (req, res) => {
  try {
    const response = await axios.get('https://api.football-data.org/v4/competitions/PL/standings', {
      headers: {
        'X-Auth-Token': process.env.FOOTBALL_API_KEY || 'YOUR_API_KEY_HERE'
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching Premier League data', error: error.message });
  }
});

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
