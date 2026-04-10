# Quick Start Guide - Bagh Chal with AI

## 🎮 Playing the Game

### Open the Game
The development server is running at **http://localhost:3000**

### Choose Your Game Mode

**1. Human vs Human** 👤 vs 👤
- Play against a friend locally
- Take turns placing/moving pieces
- Perfect for learning the game

**2. Human vs AI** 👤 vs 🤖 (Recommended to start!)
- You play as **Goats** (white pieces with horns)
- AI controls **Tigers** (orange pieces with stripes)
- Choose your difficulty level

**3. AI vs Human** 🤖 vs 👤
- You play as **Tigers**
- AI controls **Goats**
- More challenging for experienced players!

---

## 🤖 AI Difficulty Levels

### 🟢 Easy (Level 1)
**Perfect for beginners!**
- AI thinks 2-3 moves ahead
- Makes some random moves (20%)
- Best for: First-time players, learning the game
- Thinking time: <1 second

### 🟡 Medium (Level 2)
**Good challenge for casual players**
- AI thinks 4-5 moves ahead
- Uses opening book strategies
- Some randomness (10%)
- Best for: Players who know the rules
- Thinking time: 1-2 seconds

### 🟠 Hard (Level 3)
**Tough opponent!**
- AI thinks 6-7 moves ahead
- Advanced tactical evaluation
- Opening book + strategic patterns
- Best for: Experienced players
- Thinking time: 2-5 seconds

### 🔴 Expert (Level 4)
**Near-perfect play**
- AI thinks 8+ moves ahead
- No randomness (perfect play)
- Complete opening book
- Best for: Masters looking for a challenge
- Thinking time: 3-10 seconds

### 🔮 Adaptive (Level 5)
**Coming Soon!**
- Will learn your playing style
- Adapts strategy dynamically
- Machine learning powered

---

## 📖 How to Play

### Setup
- **Tigers** (🐅): 4 pieces starting at corners
- **Goats** (🐐): 20 pieces to place

### Phase 1: Placement (First 20 turns)
1. Goat player clicks any empty point to place a goat
2. Tiger player can move or capture
3. Repeat until all 20 goats are placed

### Phase 2: Movement (After all goats placed)
1. Click on your piece to select it
2. Valid moves will be highlighted in green
3. Click on a highlighted point to move
4. Tigers can capture by jumping over goats

### Win Conditions
- 🐅 **Tigers win**: Capture 5 goats
- 🐐 **Goats win**: Block all tigers (no legal moves)

---

## 🎯 Strategy Tips

### Playing as Goats (vs AI) 🐐
1. **Build defensive walls early**
   - Place goats to form barriers
   - Control the center

2. **Work together**
   - Use multiple goats to trap tigers
   - Don't leave isolated goats

3. **Strategic sacrifices**
   - Sometimes losing 1-2 goats sets up a winning trap
   - Stay under 5 captured!

4. **Endgame**
   - Complete the encirclement
   - Leave no escape routes for tigers

### Playing as Tigers (vs AI) 🐅
1. **Control the center**
   - More mobility = more capture chances
   - Avoid corners when possible

2. **Create threats**
   - Force goats into vulnerable positions
   - Look for capture sequences

3. **Maintain mobility**
   - Don't get trapped in corners
   - Keep multiple move options

4. **Hunt efficiently**
   - Target isolated goats
   - Plan capture sequences ahead

---

## 🎮 Controls

### Mouse/Keyboard
- **Click**: Select piece or move
- **New Game**: Restart with current settings
- **Undo**: Take back last move
- **Game Mode Buttons**: Switch between modes

### Touch (Mobile)
- **Tap**: Select piece or move
- **Swipe**: (Not implemented yet)

---

## 🏆 Challenge Progression

**Recommended Learning Path:**

1. **Start with Easy AI** (Level 1)
   - Learn the rules
   - Understand piece movements
   - Practice basic strategy

2. **Move to Medium** (Level 2)
   - Once you can consistently beat Easy
   - Learn opening principles
   - Develop tactical awareness

3. **Challenge Hard** (Level 3)
   - When you beat Medium regularly
   - Study advanced formations
   - Plan multiple moves ahead

4. **Master Expert** (Level 4)
   - Ultimate challenge
   - Near-perfect AI play
   - Requires deep strategic thinking

---

## 💡 Pro Tips

### For Goats
- First 5 goats: Control center and edge midpoints
- Next 10 goats: Build defensive formations
- Last 5 goats: Fill gaps in the trap

### For Tigers
- Open by moving toward center
- Don't rush captures - position first
- In endgame, calculate if 5 captures is still possible

### General
- **Think ahead**: AI plans multiple moves ahead, you should too!
- **Pattern recognition**: Learn common formations
- **Undo wisely**: Use undo to learn from mistakes
- **Start new games**: Try different strategies

---

## 🐛 Troubleshooting

**AI is thinking too long?**
- Lower the difficulty level
- This is normal for Expert level (8+ move search)

**Can't click pieces?**
- Wait for AI to finish thinking
- Make sure it's your turn
- Check if it's placement or movement phase

**Game feels too easy/hard?**
- Adjust difficulty level
- Try playing the other side (Tigers vs Goats)

---

## 🎓 Learning Resources

**In-Game:**
- Click "Rules" button for complete rules
- Watch AI moves to learn strategies
- Use Undo to explore different moves

**External:**
- Read `RULES.md` for complete game rules
- Check `CHANGELOG.md` for recent updates
- See `README.md` for technical details

---

## 🚀 What's Next?

Currently in development:
- Web Workers (non-blocking AI computation)
- Adaptive AI (learns your style)
- Move analysis and hints
- Tutorial mode
- Puzzle challenges

---

**Have fun playing Bagh Chal!** 🐅🐐

**Tip**: Start with Medium difficulty and Goat side - it's the best way to learn!
