@echo off
echo Syncing GitHub Labels...

REM 1. Type
gh label create "feat" --color "a2eeef" --description "New feature" --force
gh label create "fix" --color "d73a4a" --description "Bug fix" --force
gh label create "docs" --color "0075ca" --description "Documentation only" --force
gh label create "refactor" --color "e4e669" --description "Code restructuring (no behavior change)" --force
gh label create "chore" --color "fbca04" --description "Tooling, config, maintenance" --force
gh label create "test" --color "1d76db" --description "Tests added/updated" --force

REM 2. Priority
gh label create "P0-blocker" --color "b60205" --description "Must fix before release" --force
gh label create "P1-high" --color "d93f0b" --description "Should be fixed soon" --force
gh label create "P2-medium" --color "fbca04" --description "Normal priority" --force
gh label create "P3-low" --color "0e8a16" --description "Nice to have" --force

REM 3. Release / Milestone
gh label create "v1-blocker" --color "b60205" --description "Required for v1.0 launch" --force
gh label create "v1-feature" --color "1d76db" --description "Planned feature for v1" --force
gh label create "v1-polish" --color "5319e7" --description "UX/UI improvements before release" --force
gh label create "post-v1" --color "ffffff" --description "Not needed for MVP" --force

REM 4. System Area
gh label create "topology-engine" --color "006b75" --description "Graph logic / BFS / connectivity" --force
gh label create "store" --color "0052cc" --description "useISPStore and state logic" --force
gh label create "simulation" --color "5319e7" --description "Traffic, ticks, runtime systems" --force
gh label create "ui" --color "1d76db" --description "General UI" --force
gh label create "ui-3d" --color "006b75" --description "Perspective / rings / rendering layer" --force
gh label create "ui-theme" --color "c5def5" --description "Tailwind / styling / themes" --force
gh label create "build" --color "fbca04" --description "Vite, PostCSS, TypeScript" --force
gh label create "config" --color "e4e669" --description "Config files" --force
gh label create "performance" --color "d4c5f9" --description "Optimization issues" --force

REM 5. AI / Workflow
gh label create "ai-agent" --color "000000" --description "Work intended for AI execution" --force
gh label create "needs-review" --color "fbca04" --description "Awaiting Tech Lead review" --force
gh label create "review-blocked" --color "b60205" --description "Cannot proceed (architecture issue)" --force
gh label create "approved" --color "0e8a16" --description "Ready to merge" --force

REM 6. Risk & Stability
gh label create "critical" --color "b60205" --description "Risk of breaking core systems" --force
gh label create "topology-risk" --color "d93f0b" --description "Might break BFS/connectivity" --force
gh label create "state-risk" --color "d93f0b" --description "Might break store contract" --force
gh label create "regression-risk" --color "d93f0b" --description "Known fragile area" --force

REM 7. QA / Validation
gh label create "needs-qa" --color "fbca04" --description "Needs manual validation" --force
gh label create "qa-passed" --color "0e8a16" --description "Verified working" --force
gh label create "edge-case" --color "5319e7" --description "Rare/complex scenarios" --force

REM 8. Cleanup & Maintenance
gh label create "tech-debt" --color "a2eeef" --description "Needs improvement later" --force
gh label create "cleanup" --color "e4e669" --description "Remove artifacts / unused code" --force
gh label create "dead-code" --color "d73a4a" --description "Safe to delete" --force

REM 9. Gameplay / Feature Domain
gh label create "events" --color "5319e7" --description "Random events (fiber cuts, spikes)" --force
gh label create "tech-tree" --color "1d76db" --description "Progression system" --force
gh label create "economy" --color "0e8a16" --description "Costs, upgrades" --force
gh label create "network-nodes" --color "006b75" --description "Node behavior" --force
gh label create "traffic" --color "0052cc" --description "Data flow logic" --force

REM 10. Status / Workflow State
gh label create "todo" --color "ffffff" --description "Not started" --force
gh label create "in-progress" --color "fbca04" --description "Being worked on" --force
gh label create "blocked" --color "b60205" --description "Waiting on something" --force
gh label create "ready-for-merge" --color "0e8a16" --description "Final state" --force

echo Labels synchronized successfully!
