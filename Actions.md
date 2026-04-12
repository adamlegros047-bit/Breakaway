# Actions

This document defines every **Action** that appears on Breakaway cards — what it does, when it can be played, and how it interacts with the game.

---

## Action Reference

| Action | Summary |
| :--- | :--- |
| **Move** | Advances the puck one area toward the opponent's net |
| **Shoot** | Initiates a Shot on Goal challenge against the opponent's goalie |
| **Save** | Defends against a Shot on Goal challenge |
| **Block** | Stops the last puck movement or negates an incoming action |
| **Body-Check** | Initiates a physical challenge to steal possession of the puck |
| **Poke-check** | Attempts to strip possession from the puck-carrier without a full body challenge |
| **Deflect** | Redirects a shot or pass, changing the puck's path or destination |
| **Tip** | Tips a shot or pass at the net from close range without a full Shoot action |
| **Intercept** | Cuts off a pass or movement to steal possession during the opponent's turn |
| **Stretch Pass** | Moves the puck directly to an area two spaces away, bypassing intermediate zones |
| **On-Net** | Places the puck in a scoring position without triggering a full Shot challenge |
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
Initiates a **Shot on Goal** challenge. Requires the puck to be in the Offensive Zone and at least **1 Passing Bonus** accumulated. The opponent must respond with a `Save` capable card. Higher value wins; ties go to the goalie (Save).

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
Initiates a **Grind/Check challenge**. Both players play a card; higher number wins possession of the puck. A successful Body-Check also advances the puck one area toward the checker's net. Failure leaves the puck where it is.

---

### Poke-check
A lightweight defensive action that does not initiate a full challenge. The player attempts to steal the puck from the current ball-carrier. If the puck-carrier cannot respond with a card of equal or higher number this turn, possession transfers.

---

### Deflect
Changes the puck's current trajectory or destination. Can redirect a `Shoot` action, turning an on-goal shot into an adjacent net-area placement. Can also deflect a `Move` to a different adjacent area.

---

### Tip
A short-range scoring attempt from within the face-off circles or crease area. Lower risk than `Shoot` — no full challenge is required, but the on-net proximity rule applies (puck must be in area 0 or 8).

---

### Intercept
Played on the **opponent's turn** in response to a `Move` or `Stretch Pass`. If successful, the puck is stolen and possession transfers to the intercepting player. Requires a card with a number equal to or higher than the card being used to move.

---

### Stretch Pass
Moves the puck **two areas** in one action, bypassing intermediate nodes. Useful for breaking out of the defensive zone quickly or connecting across the neutral zone. Cannot skip zone boundaries (e.g., cannot stretch from defensive directly to offensive zone in one play).

---

### On-Net
Places the puck in scoring position (area 8, the Crease) without consuming a Passing Bonus. Does **not** trigger a Shot challenge — it simply repositions the puck for a subsequent `Shoot` or `Tip` play.

---

### Score
Scores a goal **directly** without requiring a Shot vs. Save challenge. Rare and powerful. The goal is awarded immediately, a stoppage is called, and play restarts with a faceoff at centre ice.

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
