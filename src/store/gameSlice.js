// store/gameSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk to handle leaderboard fetch after login
export const login = createAsyncThunk(
  'game/login',
  async (username) => {
    await fetch('https://exploding-kitten-backend-c951.onrender.com/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    const response = await fetch('https://exploding-kitten-backend-c951.onrender.com/api/leaderboard');
    return await response.json();
  }
);

const initialState = {
  username: '',
  isLoggedIn: false,
  gameStarted: false,
  deck: [],
  hasDefuse: false,
  gameOver: false,
  message: '',
  leaderboard: [],
  gameWon: false,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setUsername: (state, action) => {
      state.username = action.payload;
    },
    startGame: (state) => {
      state.gameStarted = true;
      state.gameOver = false;
      state.hasDefuse = false;
      state.message = '';
      state.gameWon = false;
      state.deck = ['CAT', 'DEFUSE', 'SHUFFLE', 'EXPLODE'].sort(() => Math.random() - 0.5);
    },
    drawCard: (state) => {
      if (state.deck.length === 0) {
        state.gameWon = true;
        state.gameOver = true;
        state.message = 'You won! All cards drawn successfully!';
        return;
      }

      const drawnCard = state.deck.pop();
      switch (drawnCard) {
        case 'CAT':
          state.message = 'You drew a Cat card! Safe to continue...';
          break;
        case 'DEFUSE':
          state.hasDefuse = true;
          state.message = 'You got a Defuse card! This will protect you from one Exploding Kitten.';
          break;
        case 'SHUFFLE':
          state.message = 'Shuffle card drawn! Restarting the game...';
          state.deck = ['CAT', 'DEFUSE', 'SHUFFLE', 'EXPLODE'].sort(() => Math.random() - 0.5);
          break;
        case 'EXPLODE':
          if (state.hasDefuse) {
            state.hasDefuse = false;
            state.message = 'Exploding Kitten defused! You used your defuse card.';
          } else {
            state.gameOver = true;
            state.message = 'BOOM! Game Over - You hit an Exploding Kitten!';
          }
          break;
        default:
          break;
      }
    },
    resetGame: (state) => {
      state.deck = [];
      state.gameStarted = false;
      state.gameOver = false;
      state.message = '';
      state.hasDefuse = false;
    },
    setLeaderboard: (state, action) => {
      state.leaderboard = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoggedIn = true;
      state.leaderboard = action.payload;
    });
    builder.addCase(login.rejected, (state) => {
      state.message = 'Error logging in or fetching leaderboard';
    });
  },
});

export const { setUsername, startGame, drawCard, resetGame, setLeaderboard } = gameSlice.actions;
export default gameSlice.reducer;
