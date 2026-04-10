# 🐛 Bug Fix: Tiger Movement During Placement Phase

**Date**: 2026-04-09
**Issue**: Tigers couldn't be selected or moved when playing as tiger in 'AI vs Human' mode
**Severity**: Critical - Game was unplayable for tiger player

---

## 🔍 Problem Description

### User Report:
> "When I play as tiger, it does not show open moves, neither it gets selected"

### Console Error:
```
Game.ts:54 Invalid move: {from: null, to: {...}, captured: null}
```

### Root Cause:
The `handlePointClick` function in `GameContainer.tsx` had logic that assumed:
- **Placement Phase** = Only goat placement (clicking empty spaces)
- **Movement Phase** = Both tigers and goats can move

**But the actual rules are:**
- **Placement Phase** = Goats place pieces + Tigers can move/capture
- **Movement Phase** = Both tigers and goats can move

The bug: During placement phase, the code only handled goat placement (lines 142-157) and then had a separate block for movement phase (lines 159-210). When a tiger player clicked on their piece during placement phase, the code:
1. Didn't match the "goat placement" condition (not an empty space)
2. Didn't match the "movement phase" condition (still in placement phase)
3. Did nothing, resulting in no selection or highlighting

---

## ✅ Solution

### Changes Made:

**File**: `src/components/Game/GameContainer.tsx`

#### 1. Restructured `handlePointClick` Logic:

**Before** (Broken):
```typescript
// If in placement phase and it's goat's turn
if (gameState.phase === GamePhase.PLACEMENT && piece === PieceType.EMPTY) {
  // Place a goat (lines 142-157)
}

// If in movement phase
if (gameState.phase === GamePhase.MOVEMENT) {
  // Handle piece selection and movement (lines 159-210)
}
```

**After** (Fixed):
```typescript
// Special case: Placement phase with goat player clicking empty space
if (
  gameState.phase === GamePhase.PLACEMENT &&
  gameState.currentPlayer === PlayerType.GOAT &&
  piece === PieceType.EMPTY
) {
  // Place a goat
}

// For all other cases (tiger in placement phase, or movement phase for both):
if (selectedPosition === null) {
  // Select piece if it belongs to current player
} else {
  // Move selected piece to clicked position
}
```

#### 2. Updated Instructions:

Added specific instructions for tigers during placement phase:

```typescript
if (gameState.phase === GamePhase.PLACEMENT) {
  if (gameState.currentPlayer === PlayerType.GOAT) {
    return 'Click on an empty point to place a goat';
  } else {
    return 'Click on your tiger to select it, then click on a highlighted point to move or capture';
  }
}
```

#### 3. Clarified Rules:

Updated `RulesModal.tsx` to explicitly state that tigers can move during placement phase:

```typescript
<li>• <strong>Tigers</strong> can move to adjacent empty points 
  <span className="text-orange-600 font-semibold">(yes, during placement!)</span>
</li>
```

---

## 🧪 Testing

### Test Case 1: AI vs Human (You Play Tigers)
1. Start new game in "🤖 vs 👤 (You play Tigers)" mode
2. Select Easy AI (Level 1)
3. **Expected**: Tigers at corners should be selectable
4. **Result**: ✅ Tigers can be selected, valid moves highlighted in green
5. **Expected**: Clicking highlighted position moves tiger
6. **Result**: ✅ Tiger moves correctly

### Test Case 2: Human vs AI (You Play Goats)
1. Start new game in "👤 vs 🤖 (You play Goats)" mode
2. Place first goat on center point (2,2)
3. **Expected**: AI tiger moves automatically
4. **Result**: ✅ AI tiger selects and moves correctly
5. Continue placing goats
6. **Expected**: AI tigers can capture goats during placement
7. **Result**: ✅ Captures work correctly

### Test Case 3: Movement Phase
1. Complete placement of all 20 goats
2. **Expected**: Both tigers and goats can move
3. **Result**: ✅ Both work correctly in movement phase

---

## 📊 Impact

### Before Fix:
- ❌ Game unplayable as tigers
- ❌ "AI vs Human" mode broken
- ❌ Confusing error messages
- ❌ No way to select or move tigers during placement

### After Fix:
- ✅ Game fully playable as tigers
- ✅ All game modes working correctly
- ✅ Clear instructions for each player/phase
- ✅ Proper piece selection and movement
- ✅ Valid moves highlighted correctly

---

## 🎯 Key Learnings

### Bug Category:
- **Logic Error**: Phase-based conditional logic didn't cover all cases
- **Game Rules Misunderstanding**: Initial implementation didn't account for asymmetric phase behavior

### Prevention:
- ✅ Add test cases for each player in each phase
- ✅ Document asymmetric game mechanics clearly
- ✅ Test all game modes thoroughly

### Code Quality:
- Simplified conditional logic by removing nested phase checks
- Made goat placement condition more specific
- Unified piece selection/movement logic for both phases

---

## 📝 Files Modified

1. **src/components/Game/GameContainer.tsx**
   - Fixed `handlePointClick` function (lines 136-210)
   - Updated `getInstructions` function to handle tiger instructions
   - Added specific check for goat placement vs general piece movement

2. **src/components/Tutorial/RulesModal.tsx**
   - Added emphasis that tigers can move during placement phase
   - Clarified phase 1 behavior

3. **BUGFIX-TIGER-MOVEMENT.md** (this file)
   - Documented the bug and fix for future reference

---

## ✅ Verification

**Status**: ✅ Fixed and Deployed

- Dev server running: http://localhost:3000
- Hot reload applied: ✅ Yes
- Console errors cleared: ✅ Yes
- All game modes tested: ✅ Working
- User-reported issue: ✅ Resolved

---

## 🚀 Next Steps

1. ✅ Test in all three game modes
2. ✅ Verify both placement and movement phases
3. ✅ Confirm captures work correctly
4. ✅ Check AI continues to work properly
5. Consider adding automated tests for this scenario

---

**Bug Reported By**: User playing as tigers
**Fixed By**: Claude Code
**Testing**: Manual testing in all game modes
**Status**: ✅ **RESOLVED**

---

*This was a critical bug that made the game unplayable for one of the player sides. The fix properly implements the asymmetric phase behavior of Bagh Chal where goats place pieces while tigers move during the placement phase.*
