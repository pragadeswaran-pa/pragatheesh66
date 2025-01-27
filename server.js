const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/football-league', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schema and Model
const teamSchema = new mongoose.Schema({
    name: String,
    played: Number,
    won: Number,
    drawn: Number,
    lost: Number,
    points: Number,
});

const Team = mongoose.model('Team', teamSchema);

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

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
