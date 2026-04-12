# Actions

This document defines every **Action** that appears on Breakaway cards — what it does, when it can be played, and how it interacts with the game.

---

## Action Reference

| Action | Summary |
| :--- | :--- |
| **Move** | Advances the puck one area toward the opponent's net |
| **Shoot** | Starts the **On a Shot** phase — the next card played becomes the shot card |
| **Save** | Defends against a Shot on Goal challenge |
| **Block** | Stops the last puck movement or negates an incoming action |
| **Body-Check** | When played by the non-puck-holder, transfers puck possession to them after the action resolves |
| **Poke-check** | Steals possession and moves the puck 1 area toward own net; penalises if played against a Player or Goalie card |
| **Deflect** | Redirects a shot or pass, changing the puck's path or destination |
| **Tip** | Tips a shot or pass at the net from close range without a full Shoot action |
| **Intercept** | Cuts off a pass or movement to steal possession during the opponent's turn |
| **Stretch Pass** | Moves the puck up to **2 areas** away in any valid direction |
| **On-Net** | Starts the **On a Shot** phase (same as Shoot, alternate trigger) |
| **Score** | Scores a goal directly, bypassing the Shot vs. Save challenge |
| **Punch** | Initiates a fighting challenge (minor penalty risk); used by enforcers and elbow cards |
| **Substitution** | Swaps a card in hand with a card on the bench outside of a normal line change |
| **Icing** | Calls icing on the opponent, causing a stoppage and forcing a defensive zone faceoff |
| **Clone** | Copies the last action played by either player and applies it again |
| **Draw** | Forces both players to draw one additional card from their decks |

---

## Detailed Descriptions

### Move
The standard puck-advancement action. When played, the player selects one adjacent area on the board and moves the puck there. The destination must be a valid adjacent node per the rink layout. Only works in one direction per use: toward the opponent's net.

---

### Shoot
Activates the **On a Shot** phase. The Shoot action does not immediately resolve anything — instead it signals that the player is taking a shot, and the **next card they play** becomes the **shot card**.

- A goal can **only** be scored on a shot card. The `Score` action has no effect unless the game is in the On a Shot phase.
- If the shot card contains a `Score` action, a goal is awarded immediately.
- If the shot card does **not** contain a `Score` action, the shot misses and play continues.
- The On a Shot phase ends as soon as the shot card is played, regardless of outcome.

---

### Save
The defensive response to a `Shoot` action. Only cards with this action can participate in the Shot vs. Save challenge from the defensive side. If the Goalie's value is equal to or higher than the shot, the save is made and play restarts from a faceoff.

---

### Block
Can be used in two ways:
- **Block Movement**: Cancels the last `Move` action played by the opponent, returning the puck to its previous location.
- **Shot Block**: Intercepts a shot before it reaches the goalie, stopping the challenge outright.

---

### Body-Check
Can only be meaningfully played by the player who **does not currently have possession** of the puck. When a Body-Check action is played and resolves, **puck possession transfers to the player who played it**.

- The puck remains in its current area — no automatic movement occurs as part of the check.
- If the player already has possession, the action has no additional effect.
- This represents a physical challenge winning the puck back from the carrier.

---

### Poke-check
Takes possession of the puck and retreats it **1 area toward the poke-checking player's own net**. The puck is moved to the adjacent area closest to the defending player's defensive zone.

- Possession transfers immediately to the player who played the Poke-check card.
- The player selects the destination from the highlighted adjacent nodes pointing toward their own net.
- **Penalty rule:** If the Poke-check is played against a **Player Card (numbers 1–7)** or a **Goalie card**, the card's owner receives a **2-minute minor penalty**. The poke-checking player is penalised for slashing, regardless of whether possession was gained.

---

### Deflect
A reactionary action that allows a player to manipulate the opponent's previous play. Deflect functions retroactively: it is played on the *subsequent* turn and reaches back to alter the opponent's last action.

- **If played after an Opponent's Move/Stretch Pass**: The puck is immediately snapped back to its origin. The Deflecting player then selects a new destination node from that origin, constrained by the same distance (e.g., 1 hop for a normal Move, 2 hops for a Stretch Pass). The opponent retains possession at the new destination.
- **If played after an Opponent's Goal (Score)**: The score is reverted. The game is whistled dead for a stoppage ("shot deflected out of play"). 
- **Deflected Shot Face-offs:** When a shot is deflected out of play, the ensuing face-off takes place in the offensive zone where the shot originated. Specifically, the puck is placed at the `0` (or `12`) face-off dot on the side matching the shot's origin area.

---

### Tip
A short-range scoring attempt from within the face-off circles or crease area. Lower risk than `Shoot` — no full challenge is required, but the on-net proximity rule applies (puck must be in area 0 or 8).

---

### Intercept
Played on the **opponent's turn** in response to a `Move` or `Stretch Pass`. If successful, the puck is stolen and possession transfers to the intercepting player. Requires a card with a number equal to or higher than the card being used to move.

---

### Stretch Pass
Allows the player to move the puck to **any area within 2 adjacency steps** of its current position. This includes both directly adjacent areas (1 step) and areas reachable in 2 steps through the rink layout.

- The destination must be reachable within 2 hops along the adjacency map — it cannot teleport across unconnected areas.
- Useful for breaking out of the defensive zone quickly, skipping through the neutral zone, or setting up in the offensive zone faster than a standard Move would allow.
- The player selects the destination by clicking a highlighted node on the board, just like a Move action.

---

### On-Net
Starts the **On a Shot** phase, identical in effect to the `Shoot` action. The next card played by the player becomes the **shot card**, and a goal can only be scored on that shot card.

- On-Net and Shoot are functionally equivalent for triggering shot phase.
- On-Net may represent a shorter, closer-range shot — mechanically it enters the same phase.
- The shot card must contain a `Score` action for a goal to be awarded.

---

### Score
Awards a goal immediately. **The `Score` action can only be played if the game is currently in the "On a Shot" phase.** 

- If there is no active shot card phase (e.g. the player has not played a `Shoot` or `On-Net` action prior), the `Score` action is disabled and will have no effect.
- Bypasses the traditional Shot vs. Save challenge — if a card with `Score` is played, it scores directly (unless subsequently `Deflect`ed by the opponent on the next turn).

---

### Punch
Initiates a **Fight challenge**. Both players play a card; higher number wins. There is a risk of a minor penalty (2-minute icing) regardless of outcome. Primarily used by enforcer-type cards.

---

### Substitution
Allows the player to swap **any card** from their hand with **any card** on their bench — outside of the normal Line Change timing restrictions. Can be used on any turn where the player has possession, including mid-play.

---

### Icing
Calls an **icing violation** on the opponent. Causes a stoppage and forces a **defensive zone faceoff** for the team that iced the puck. Can only be called when the puck has been launched past the opponent's blue line without possession.

---

### Clone
Copies and immediately replays the **most recently resolved action** from either player's last card. The cloned action follows the same rules as the original. Cannot clone `Score` or `Save` actions.

---

### Draw
Forces **both players** to draw one card from the top of their respective decks immediately. Useful for accelerating hand replenishment mid-game without spending an End Turn.

---

## Notes

- Actions marked with `—` on a card mean the card has **no action** and is played purely for its number (face-off, challenge), color ability, or special.
- Some actions are only legal in certain zones (e.g. `Shoot` requires the Offensive Zone).
- A player may choose **not** to use an action when playing a card — see the Card Resolution rules.
