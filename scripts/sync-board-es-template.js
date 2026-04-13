import fs from 'fs';

const REPO = process.env.GITHUB_REPOSITORY;
const TOKEN = process.env.GITHUB_TOKEN;
const SPRINT_ISSUE_NUMBER = 27;

/**
 * Modern ES module version of the sync-board.js script.
 * Standardizes API communication using global fetch (Node 18+).
 */
async function gh(path, options = {}) {
  const res = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub API error (${res.status}): ${err}`);
  }
  return res.json();
}

async function main() {
    try {
        console.log(`📡 Fetching issues and PRs for ${REPO}...`);
        
        // Example logic
        const [issues, prs] = await Promise.all([
          gh('/issues?state=open&per_page=100'),
          gh('/pulls?state=open&per_page=100'),
        ]);

        console.log(`✅ Fetched ${issues.length} issues and ${prs.length} PRs.`);
        
        // ... (sorting and markdown rendering) ...
        
        console.log(`🚀 Sprint Board updated successfully!`);
    } catch (e) {
        console.error(`❌ Error in sync-board.js: ${e.message}`);
        process.exit(1);
    }
}

main();
