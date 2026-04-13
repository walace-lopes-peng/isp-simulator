# v0.3 Core Loop Playtest Protocol

## Objective
Validate the core gameplay loop of ISP Simulator v0.3. This playtest ensures that building networks, managing economy, and progressing through early eras is engaging and functional before adding new features.

## Target Audience
Ideally, someone who has not played the game before. If testing yourself (Self-Playtest Mode), play strictly without using God Mode or Developer tools.

## Setup Instructions
1. Run the latest `dev` branch locally.
2. Clear localStorage via browser settings or Developer Console ("Clear Save Data" button).
3. Start a new game session.

## The 15-Minute Protocol
The tester should play the game for exactly 15 minutes while the observer (or the tester themselves) notes down behavior.

1. **Minute 0-5: The First Connection**
   - Goal: Build first link, get revenue, earn initial milestones.
   - Observation: Is the UI clear on what to do first? Does the player understand how to drag links?
2. **Minute 5-10: Expansion & Economy**
   - Goal: Manage operational costs, increase bandwidth, expand the network.
   - Observation: Does the player run out of money easily? Do they understand debt and maintenance costs?
3. **Minute 10-15: Era Progression**
   - Goal: Reach the total data and capital thresholds to advance to the 1980s era.
   - Observation: Is the leap to the next era clear and satisfying?

## 6 Core Pass/Fail Criteria
To approve v0.3, the playtest must meet the following 6 criteria:
1. **Core loop is understandable:** Player successfully builds links and generates revenue without major hints.
2. **Economic decisions create tension:** Player considers the cost of links vs potential revenue (capital matters).
3. **Era progression works:** Player can advance from the 70s to the 80s within the 15-minute timeframe.
4. **No critical confusion or bugs:** The UI is responsive, no game-breaking errors or hard crashes occur.
5. **State persists correctly:** Reloading the page maintains nodes, money, links, and milestones.
6. **Milestones trigger correctly:** Early guidance via milestones provides satisfaction and direction.

## Action Items
- **If criteria are met:** Document a "PASS" and proceed to merge v0.3 to main and tag the release.
- **If criteria fail:** Document a "FAIL", open related bug/UX issues, resolve them, and re-run this protocol.
