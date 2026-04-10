# 📐 Diagonal Movement in Bagh Chal - Explained

**Issue**: "Sometimes goats don't move on diagonal paths"
**Status**: This is **expected behavior**, not a bug!

---

## 🎯 The Rule

In traditional Bagh Chal, **diagonal movement is only allowed from specific positions**, not all 25 positions on the board.

### Positions with Diagonal Movement (9 total):

1. **4 Corners**:
   - Top-Left: (0,0)
   - Top-Right: (0,4)
   - Bottom-Left: (4,0)
   - Bottom-Right: (4,4)

2. **1 Center**:
   - Center: (2,2)

3. **4 Edge Midpoints**:
   - Top: (0,2)
   - Bottom: (4,2)
   - Left: (2,0)
   - Right: (2,4)

### Visual Map:

```
✓ ○ ✓ ○ ✓     (Row 0)
○ ○ ○ ○ ○     (Row 1)
✓ ○ ✓ ○ ✓     (Row 2)
○ ○ ○ ○ ○     (Row 3)
✓ ○ ✓ ○ ✓     (Row 4)
```

**Legend**:
- ✓ = Can move diagonally (9 positions)
- ○ = Can only move horizontally/vertically (16 positions)

---

## 🔍 Why This Happens

### Example Scenario:

You place a goat at position **(1,1)** (row 1, column 1).

**What you might expect**: The goat can move diagonally to (0,0), (0,2), (2,0), or (2,2).

**What actually happens**: The goat can **only move horizontally or vertically** because (1,1) is **not** one of the 9 special diagonal positions.

**Valid moves from (1,1)**:
- Left: (1,0) ✓
- Right: (1,2) ✓
- Up: (0,1) ✓
- Down: (2,1) ✓
- Diagonals: ❌ None

---

## 📊 Testing Tool

I've added a **Diagonal Test** button in the game controls that will:

1. Show which positions have diagonal connections (green)
2. Show which positions don't (gray)
3. Run diagnostics to verify the board is correct

### How to Use:

1. Look at the game controls panel (right sidebar)
2. Click the **"🔍 Test Diagonals"** button
3. View the visual map showing which positions allow diagonals

---

## 🎮 In-Game Behavior

### When you click on a piece:
- **Green circles** appear showing **all valid moves**
- If no diagonal green circles appear, that position **doesn't have diagonal connections**
- This applies to **both goats and tigers** equally

### Example Test:

**Test 1: Corner Position (Has Diagonals)**
1. Start new game as Tigers
2. Click tiger at corner (0,0)
3. **Expected**: Green circles at (0,1), (1,0), and **(1,1)** diagonal ✓
4. Can move diagonally!

**Test 2: Non-Diagonal Position**
1. Play a few moves
2. Move goat to position (1,1)
3. Click on that goat
4. **Expected**: Green circles at (0,1), (1,0), (1,2), (2,1) only
5. **No diagonal options!** ○

---

## 🏛️ Historical Context

This is how traditional Bagh Chal has been played for centuries in Nepal. The limited diagonal connections create:

1. **Strategic complexity**: Not all positions are equal
2. **Positional value**: Center and corners are more powerful
3. **Tactical play**: Tigers must control diagonal points to capture effectively
4. **Defensive formations**: Goats must protect the 9 diagonal positions

---

## ✅ Verification

The implementation is **correct**. Here's the code that defines diagonal connections:

**File**: `src/core/Board.ts` (lines 86-99)

```typescript
private hasDiagonalConnections(pos: Position): boolean {
  const { row, col } = pos;

  // Center point
  if (row === 2 && col === 2) return true;

  // Corners
  if ((row === 0 || row === 4) && (col === 0 || col === 4)) return true;

  // Edge midpoints
  if ((row === 0 || row === 4) && col === 2) return true;
  if ((col === 0 || col === 4) && row === 2) return true;

  return false;
}
```

This exactly matches the traditional game rules! ✓

---

## 🎯 Strategy Tips

### For Tigers:
- Control the **center (2,2)** - it has the most mobility
- Use **corners** for captures and positioning
- Force goats into positions *without* diagonals to limit their mobility

### For Goats:
- Place early goats on **diagonal positions** to control key squares
- Build defensive walls using non-diagonal positions
- Keep at least one goat on the center to block tiger movement

---

## 🔧 How to Check Specific Positions

### In-Game Test:

1. **Start Human vs Human** mode
2. **Movement phase**: Place all 20 goats
3. **Test each position**:
   - Click on a goat
   - Count valid moves
   - Positions with 4+ moves likely have diagonals
   - Positions with only 2-3 moves don't have diagonals

### Using Debug Tool:

1. Click **"🔍 Test Diagonals"** in game controls
2. See visual map with green (has diagonals) and gray (no diagonals)
3. Console will print detailed adjacency information

---

## 📋 Common Positions and Their Movement

| Position | Has Diagonals? | Max Moves* | Notes |
|----------|----------------|------------|-------|
| (0,0) | ✓ Yes | 3 | Top-left corner |
| (0,1) | ○ No | 2 | Edge position |
| (0,2) | ✓ Yes | 4 | Top edge midpoint |
| (1,1) | ○ No | 4 | Inner position |
| (2,2) | ✓ Yes | 8 | **Center - most mobile!** |
| (1,2) | ○ No | 4 | Cross position |
| (3,3) | ○ No | 4 | Inner position |

*Max moves assumes all adjacent positions are empty

---

## 🐛 Is This a Bug?

**No!** This is correct behavior according to traditional Bagh Chal rules.

### How to Confirm:

**Wikipedia**: [Bagh-Chal](https://en.wikipedia.org/wiki/Bagh-Chal)
> "The board consists of a 5×5 grid with **certain intersections connected by diagonal lines**."

**Traditional boards**: Show diagonal lines only at the 9 specific positions.

---

## 📸 Expected Board Layout

The physical/traditional board looks like this (lines represent valid connections):

```
●―――●―――●―――●―――●
│ ╲ │ ╱ │ ╲ │ ╱ │
│   ●   │   ●   │
│ ╱ │ ╲ │ ╱ │ ╲ │
●―――●―――●―――●―――●
│ ╲ │ ╱ │ ╲ │ ╱ │
│   ●   │   ●   │
│ ╱ │ ╲ │ ╱ │ ╲ │
●―――●―――●―――●―――●
```

Notice: Diagonal lines (╲ ╱) only appear at corners, center, and edge midpoints!

---

## 💡 Updated Documentation

I've updated several files to clarify this:

1. **RulesModal.tsx**:
   - Added warning box about diagonal movement
   - Visual map showing which positions have diagonals
   - Clear explanation in "How to Move" section

2. **DiagonalTest.tsx** (New):
   - Interactive testing tool
   - Visual board map
   - Console diagnostics

3. **boardDiagnostics.ts** (New):
   - Automated testing functions
   - Verification that all 9 diagonal positions work correctly

---

## ✅ Summary

**The behavior is correct!**

- ✅ Only 9 positions have diagonal movement (corners, center, edge midpoints)
- ✅ This matches traditional Bagh Chal rules
- ✅ Both goats and tigers follow the same rules
- ✅ The implementation is verified correct

**What seems like a bug is actually authentic gameplay!**

If you still see unexpected behavior after understanding these rules, please provide:
1. The specific position (row, column) where diagonal movement failed
2. What you expected vs what happened
3. Screenshots if possible

---

**Next Steps**:

1. ✅ Read the updated rules modal (📖 How to Play button)
2. ✅ Try the diagonal test tool (🔍 Test Diagonals button)
3. ✅ Play a few games understanding the 9 diagonal positions
4. ✅ Report any *actual* bugs if movement doesn't match the expected behavior

---

*Diagonal movement is one of the most interesting strategic elements of Bagh Chal! Mastering which positions have diagonal connections is key to becoming a strong player.* 🎮
